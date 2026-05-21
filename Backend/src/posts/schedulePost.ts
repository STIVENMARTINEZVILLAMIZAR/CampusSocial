import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

interface SchedulePostRequest {
  postId: string;
  fechaHora: string; // ISO 8601
  redesDestino?: string[];
}

export const schedulePost = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
    }

    const { postId, fechaHora, redesDestino } = request.data as SchedulePostRequest;
    if (!postId || !fechaHora) {
      throw new HttpsError('invalid-argument', 'postId y fechaHora son obligatorios');
    }

    const fecha = new Date(fechaHora);
    if (Number.isNaN(fecha.getTime()) || fecha.getTime() <= Date.now()) {
      throw new HttpsError('invalid-argument', 'fechaHora debe ser una fecha futura válida');
    }

    const db = getFirestore();
    const ref = db.collection('publicaciones').doc(postId);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new HttpsError('not-found', 'Publicación no encontrada');
    }

    const data = snap.data()!;
    if (data.creadoPor !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'No puedes programar esta publicación');
    }

    const patch: Record<string, unknown> = {
      estado: 'programado',
      fechaProgramada: Timestamp.fromDate(fecha),
      actualizadoEn: FieldValue.serverTimestamp(),
    };

    if (redesDestino?.length) {
      patch.redesDestino = redesDestino;
    }

    await ref.update(patch);
    logger.info('Post programado', { postId, fechaHora });

    return { success: true, postId, fechaProgramada: fecha.toISOString() };
  }
);
