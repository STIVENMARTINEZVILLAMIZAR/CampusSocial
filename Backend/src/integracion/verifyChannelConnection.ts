import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import {
  resolveAutomationWebhookSecret,
  resolveAutomationWebhookUrl,
} from './automationWebhook';

type VerifyRequest = {
  red: string;
  integrationId?: string;
  profileUrl?: string;
  cuentaNombre?: string;
};

export const verifyChannelConnection = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
    }

    const { red, integrationId, profileUrl, cuentaNombre } = request.data as VerifyRequest;
    const redNorm = (red || '').toLowerCase();
    const allowed = ['linkedin', 'instagram', 'facebook', 'twitter', 'tiktok'];
    if (!allowed.includes(redNorm)) {
      throw new HttpsError('invalid-argument', 'red no válida');
    }

    const id = integrationId?.trim() || profileUrl?.trim() || cuentaNombre?.trim();
    if (!id || id.length < 2) {
      throw new HttpsError('invalid-argument', 'Indica el ID de integración Postiz o la URL del perfil');
    }

    const uid = request.auth.uid;
    const webhook = await resolveAutomationWebhookUrl(uid);
    const secret = resolveAutomationWebhookSecret();
    let verificadoPor = 'campus-local';

    if (webhook) {
      try {
        const res = await fetch(webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(secret ? { 'X-Campus-Secret': secret } : {}),
          },
          body: JSON.stringify({
            action: 'verify_channel',
            provider: 'make',
            red: redNorm,
            integrationId: integrationId?.trim(),
            profileUrl: profileUrl?.trim(),
            uid,
          }),
        });
        if (!res.ok) {
          const t = await res.text();
          logger.warn('Make verify_channel failed', res.status, t.slice(0, 200));
          throw new HttpsError(
            'failed-precondition',
            'El escenario Make no confirmó la conexión. Añade una rama para action=verify_channel.'
          );
        }
        verificadoPor = 'make';
      } catch (e) {
        if (e instanceof HttpsError) throw e;
        logger.warn('verify_channel network error', e);
      }
    }

    const cuentaFinal = integrationId?.trim() || profileUrl?.trim() || cuentaNombre?.trim() || id;
    const db = getFirestore();
    await db.collection('canales').doc(uid).set(
      {
        usuarioId: uid,
        [redNorm]: {
          conectado: true,
          cuentaNombre: cuentaFinal,
          integrationId: integrationId?.trim() || null,
          profileUrl: profileUrl?.trim() || null,
          proveedor: redNorm === 'linkedin' ? 'postiz' : 'make',
          verificadoPor,
          verificadoEn: FieldValue.serverTimestamp(),
        },
        actualizadoEn: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      ok: true,
      cuentaNombre: cuentaFinal,
      integrationId: integrationId?.trim() || undefined,
      verificadoPor,
    };
  }
);
