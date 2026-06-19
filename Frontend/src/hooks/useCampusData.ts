import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
  listarMensajesChat,
  obtenerCanales,
} from '../lib/db';
import { obtenerConfiguracion } from '../lib/db/configuracion';
import type { ActividadItem, Borrador, EstadoPublicacion, Publicacion } from '../lib/db/types';

function useFirestoreList<T>(
  key: string,
  enabled: boolean,
  buildQuery: (uid: string) => ReturnType<typeof query>,
  mapDoc: (id: string, data: Record<string, unknown>) => T
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!enabled || !user) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = buildQuery(user.uid);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => mapDoc(d.id, d.data() as Record<string, unknown>)));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [enabled, user?.uid, key]);

  return { data, isLoading, error, refetch: () => {} };
}

export function usePublicaciones(filtro?: { estado?: EstadoPublicacion }) {
  const { user } = useAuth();
  const estado = filtro?.estado;
  return useFirestoreList<Publicacion>(
    `publicaciones-${estado ?? 'all'}`,
    !!user,
    (uid) => {
      const constraints: QueryConstraint[] = [
        where('creadoPor', '==', uid),
        orderBy('creadoEn', 'desc'),
      ];
      if (estado) constraints.splice(1, 0, where('estado', '==', estado));
      return query(collection(db, 'publicaciones'), ...constraints);
    },
    (id, data) => ({ id, ...data } as Publicacion)
  );
}

export function useBorradores() {
  const { user } = useAuth();
  return useFirestoreList<Borrador>(
    'borradores',
    !!user,
    (uid) => query(collection(db, 'borradores'), where('usuarioId', '==', uid), orderBy('creadoEn', 'desc')),
    (id, data) => ({ id, ...data } as Borrador)
  );
}

export function useActividad() {
  const { user } = useAuth();
  return useFirestoreList<ActividadItem>(
    'actividad',
    !!user,
    (uid) =>
      query(collection(db, 'actividad'), where('usuarioId', '==', uid), orderBy('creadoEn', 'desc')),
    (id, data) => ({ id, ...data } as ActividadItem)
  );
}

export function useCanales() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['canales', user?.uid],
    queryFn: () => obtenerCanales(user!.uid),
    enabled: !!user,
    refetchInterval: 15_000,
  });
}

export function useConfiguracion() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['configuracion', user?.uid],
    queryFn: () => obtenerConfiguracion(user!.uid),
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useChatMensajes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['chat', user?.uid],
    queryFn: () => listarMensajesChat(user!.uid),
    enabled: !!user,
    refetchInterval: 5_000,
  });
}

export function useDashboardStats() {
  const pubs = usePublicaciones();
  const borradores = useBorradores();

  const stats = useMemo(() => {
    const list = pubs.data ?? [];
    return {
      publicados: list.filter((p) => p.estado === 'publicado').length,
      programados: list.filter((p) => p.estado === 'programado').length,
      borradores: borradores.data?.length ?? 0,
      fallidos: list.filter((p) => p.estado === 'fallido').length,
    };
  }, [pubs.data, borradores.data]);

  return {
    stats,
    isLoading: pubs.isLoading || borradores.isLoading,
    refetch: () => {
      pubs.refetch();
      borradores.refetch();
    },
  };
}

export function usePublicacionesProgramadas(mes: number, anio: number) {
  const { data, ...rest } = usePublicaciones();
  const porDia = useMemo(() => {
    const map: Record<number, Publicacion[]> = {};
    (data ?? [])
      .filter((p) => p.estado === 'programado' && p.fechaProgramada)
      .forEach((p) => {
        const d = p.fechaProgramada;
        const date =
          d && typeof d === 'object' && 'toDate' in d
            ? (d as { toDate: () => Date }).toDate()
            : new Date(d as unknown as string);
        if (date.getMonth() === mes && date.getFullYear() === anio) {
          const day = date.getDate();
          if (!map[day]) map[day] = [];
          map[day].push(p);
        }
      });
    return map;
  }, [data, mes, anio]);

  return { porDia, publicaciones: data ?? [], ...rest };
}

export function useInvalidateCampus() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return () => {
    if (!user) return;
    qc.invalidateQueries({ queryKey: ['canales', user.uid] });
    qc.invalidateQueries({ queryKey: ['chat', user.uid] });
    qc.invalidateQueries({ queryKey: ['configuracion', user.uid] });
  };
}

/** Búsqueda global en publicaciones y borradores */
export function useCampusSearch(term: string) {
  const pubs = usePublicaciones();
  const borradores = useBorradores();
  const q = term.trim().toLowerCase();

  return useMemo(() => {
    if (!q) return { publicaciones: [], borradores: [] };
    const match = (s: string) => s.toLowerCase().includes(q);
    return {
      publicaciones: (pubs.data ?? []).filter(
        (p) => match(p.titulo) || match(p.contenido)
      ),
      borradores: (borradores.data ?? []).filter(
        (b) => match(b.titulo ?? '') || match(b.contenidoGenerado ?? '') || match(b.promptOriginal)
      ),
    };
  }, [q, pubs.data, borradores.data]);
}
