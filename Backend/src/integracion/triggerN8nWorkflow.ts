import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import type { N8nCampusPostPayload, N8nCampusPostResponse } from './n8nTypes';
import { crearBorradorEnFirestore, registrarEjecucion } from './n8nPersistence';

const n8nWebhookUrlSecret = defineSecret('N8N_WEBHOOK_URL');
const n8nWebhookSecret = defineSecret('N8N_WEBHOOK_SECRET');

function resolveWebhookUrl(uid: string, override?: string): Promise<string> {
  if (override?.trim()) return Promise.resolve(override.trim());

  try {
    const fromSecret = n8nWebhookUrlSecret.value();
    if (fromSecret?.trim()) return Promise.resolve(fromSecret.trim());
  } catch {
    // emulador sin secret
  }

  const fromEnv = process.env.N8N_WEBHOOK_URL?.trim();
  if (fromEnv) return Promise.resolve(fromEnv);

  return getFirestore()
    .collection('configuracion')
    .doc(uid)
    .get()
    .then((snap) => {
      const url = snap.data()?.n8nWebhookUrl as string | undefined;
      return url?.trim() ?? '';
    });
}

function resolveWebhookSecret(): string {
  try {
    const s = n8nWebhookSecret.value();
    if (s?.trim()) return s.trim();
  } catch {
    // ignore
  }
  return process.env.N8N_WEBHOOK_SECRET?.trim() ?? '';
}

export const triggerN8nWorkflow = onCall(
  { region: 'us-central1', timeoutSeconds: 300 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
    }

    const payload = request.data as N8nCampusPostPayload & { webhookUrl?: string };
    if (!payload?.topic?.trim()) {
      throw new HttpsError('invalid-argument', 'topic es obligatorio');
    }

    const uid = request.auth.uid;
    const url = await resolveWebhookUrl(uid, payload.webhookUrl);

    if (!url) {
      throw new HttpsError(
        'failed-precondition',
        'Webhook n8n no configurado. Añádelo en Ajustes o define N8N_WEBHOOK_URL en el servidor.'
      );
    }

    const borradorId = await crearBorradorEnFirestore(uid, payload);
    const executionId = await registrarEjecucion(uid, payload, borradorId);
    const secret = resolveWebhookSecret();

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? { 'X-Campus-Secret': secret } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: N8nCampusPostResponse;
      try {
        data = JSON.parse(text) as N8nCampusPostResponse;
      } catch {
        data = { success: res.ok, body: text };
      }

      if (!res.ok) {
        throw new Error(data.error ?? `n8n HTTP ${res.status}`);
      }

      logger.info('n8n workflow OK', { uid, borradorId, executionId });
      return { ...data, executionId, borradorId };
    } catch (err) {
      logger.error('n8n workflow error', err);
      throw new HttpsError(
        'internal',
        err instanceof Error ? err.message : 'Error al ejecutar workflow n8n'
      );
    }
  }
);
