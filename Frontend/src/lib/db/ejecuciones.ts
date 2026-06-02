import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { EjecucionN8n, N8nCampusPostPayload, N8nCampusPostResponse } from './types';

const COL = 'ejecuciones_n8n';

export async function registrarEjecucionN8n(
  uid: string,
  payload: N8nCampusPostPayload,
  borradorId?: string | null
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    usuarioId: uid,
    borradorId: borradorId ?? null,
    payload,
    estado: 'enviado',
    creadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function completarEjecucionN8n(
  id: string,
  respuesta: N8nCampusPostResponse,
  error?: string
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    respuesta,
    estado: error ? 'error' : 'completado',
    errorMensaje: error ?? null,
  });
}

export type { EjecucionN8n };
