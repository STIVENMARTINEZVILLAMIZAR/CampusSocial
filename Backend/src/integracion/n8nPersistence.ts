import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AutomationPostPayload } from './automationTypes';

export async function crearBorradorEnFirestore(
  uid: string,
  payload: AutomationPostPayload
): Promise<string> {
  const db = getFirestore();
  const ref = await db.collection('borradores').add({
    usuarioId: uid,
    promptOriginal: payload.topic,
    tono: payload.tone,
    redSocial: payload.platforms.length === 1 ? payload.platforms[0] : 'multi',
    redesDestino: payload.platforms,
    contenidoGenerado: payload.body?.trim() ?? '',
    titulo: payload.title?.trim() || payload.topic?.trim() || '',
    imagenUrl: payload.image_url ?? null,
    imagenConIa: Boolean(payload.include_image && payload.image_url),
    estado: 'pendiente',
    creadoEn: FieldValue.serverTimestamp(),
    actualizadoEn: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function registrarEjecucion(
  uid: string,
  payload: AutomationPostPayload,
  borradorId: string
): Promise<string> {
  const db = getFirestore();
  const ref = await db.collection('ejecuciones_n8n').add({
    usuarioId: uid,
    borradorId,
    payload,
    estado: 'enviado',
    creadoEn: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
