import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { RedSocial } from './types';

export type BorradorWriteData = {
  titulo: string;
  contenidoGenerado: string;
  promptOriginal: string;
  tono: string;
  redesDestino: RedSocial[];
  hashtags?: string[];
  imagenUrl?: string | null;
  imagenConIa?: boolean;
};

function borradorFields(data: BorradorWriteData): Record<string, unknown> {
  return {
    titulo: data.titulo,
    contenidoGenerado: data.contenidoGenerado,
    hashtags: data.hashtags ?? [],
    promptOriginal: data.promptOriginal,
    tono: data.tono,
    redSocial: data.redesDestino[0] ?? 'linkedin',
    redesDestino: data.redesDestino,
    imagenUrl: data.imagenUrl ?? null,
    imagenConIa: data.imagenConIa ?? false,
    actualizadoEn: serverTimestamp(),
  };
}

export async function crearBorrador(uid: string, data: BorradorWriteData): Promise<string> {
  const ref = await addDoc(collection(db, 'borradores'), {
    usuarioId: uid,
    ...borradorFields(data),
    estado: 'pendiente',
    n8nExecutionId: null,
    programadoPara: null,
    creadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarBorrador(draftId: string, data: BorradorWriteData): Promise<void> {
  await updateDoc(doc(db, 'borradores', draftId), borradorFields(data));
}

export async function eliminarBorrador(draftId: string): Promise<void> {
  await deleteDoc(doc(db, 'borradores', draftId));
}
