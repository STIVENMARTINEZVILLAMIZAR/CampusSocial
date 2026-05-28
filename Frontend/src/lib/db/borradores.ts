import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { RedSocial } from './types';

export async function crearBorrador(
  uid: string,
  data: {
    titulo: string;
    contenidoGenerado: string;
    promptOriginal: string;
    tono: string;
    redesDestino: RedSocial[];
    hashtags?: string[];
  }
): Promise<string> {
  const ref = await addDoc(collection(db, 'borradores'), {
    usuarioId: uid,
    titulo: data.titulo,
    contenidoGenerado: data.contenidoGenerado,
    hashtags: data.hashtags ?? [],
    promptOriginal: data.promptOriginal,
    tono: data.tono,
    redSocial: data.redesDestino[0] ?? 'linkedin',
    redesDestino: data.redesDestino,
    estado: 'pendiente',
    n8nExecutionId: null,
    programadoPara: null,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function eliminarBorrador(draftId: string): Promise<void> {
  await deleteDoc(doc(db, 'borradores', draftId));
}
