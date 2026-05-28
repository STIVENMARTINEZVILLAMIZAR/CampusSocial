import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { EstadoPublicacion, Publicacion, RedSocial } from './types';

export async function crearPublicacion(
  uid: string,
  data: {
    titulo: string;
    contenido: string;
    redesDestino: RedSocial[];
    estado: EstadoPublicacion;
    imagenUrl?: string | null;
    fechaProgramada?: Date | null;
  }
): Promise<string> {
  const ref = await addDoc(collection(db, 'publicaciones'), {
    titulo: data.titulo,
    contenido: data.contenido,
    imagenUrl: data.imagenUrl ?? null,
    redesDestino: data.redesDestino,
    estado: data.estado,
    fechaProgramada: data.fechaProgramada ? Timestamp.fromDate(data.fechaProgramada) : null,
    creadoPor: uid,
    resultados: {},
    n8nExecutionId: null,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarPublicacion(
  postId: string,
  patch: Partial<Pick<Publicacion, 'titulo' | 'contenido' | 'estado' | 'imagenUrl'>> & {
    fechaProgramada?: Date;
  }
): Promise<void> {
  const data: Record<string, unknown> = { ...patch, actualizadoEn: serverTimestamp() };
  if (patch.fechaProgramada) {
    data.fechaProgramada = Timestamp.fromDate(patch.fechaProgramada);
  }
  await updateDoc(doc(db, 'publicaciones', postId), data);
}

export async function eliminarPublicacion(postId: string): Promise<void> {
  await deleteDoc(doc(db, 'publicaciones', postId));
}
