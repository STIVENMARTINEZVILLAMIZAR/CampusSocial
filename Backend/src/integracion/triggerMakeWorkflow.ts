import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import type { AutomationPostPayload, AutomationPostResponse } from './automationTypes';
import { crearBorradorEnFirestore, registrarEjecucion } from './n8nPersistence';
import {
  resolveAutomationWebhookSecret,
  resolveAutomationWebhookUrl,
} from './automationWebhook';
import { buildAutomationWebhookHeaders } from './automationWebhookHeaders';

export const triggerMakeWorkflow = onCall(
  { region: 'us-central1', timeoutSeconds: 300 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
    }

    const payload = request.data as AutomationPostPayload & { webhookUrl?: string };
    if (!payload?.topic?.trim() && !payload?.body?.trim()) {
      throw new HttpsError('invalid-argument', 'topic o body es obligatorio');
    }

    const uid = request.auth.uid;
    const url = await resolveAutomationWebhookUrl(uid, payload.webhookUrl);

    if (!url) {
      throw new HttpsError(
        'failed-precondition',
        'Webhook no configurado. Añade MAKE_WEBHOOK_URL en Backend/.secret.local o la URL del escenario Make en Ajustes.'
      );
    }

    const borradorId = await crearBorradorEnFirestore(uid, payload);
    const executionId = await registrarEjecucion(uid, payload, borradorId);
    const secret = resolveAutomationWebhookSecret();

    const tokensSnap = await getFirestore().collection('tokens_redes').doc(uid).get();
    const li = tokensSnap.data()?.linkedin as
      | { memberUrn?: string; displayName?: string }
      | undefined;

    const body: AutomationPostPayload = {
      ...payload,
      provider: 'make',
      action: payload.action ?? 'publish',
      linkedin_member_urn: payload.linkedin_member_urn ?? li?.memberUrn,
      linkedin_display_name: payload.linkedin_display_name ?? li?.displayName,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAutomationWebhookHeaders(secret),
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data: AutomationPostResponse;
      try {
        data = JSON.parse(text) as AutomationPostResponse;
      } catch {
        data = { success: res.ok, body: text };
      }

      if (!res.ok) {
        throw new Error(data.error ?? `Make HTTP ${res.status}`);
      }

      logger.info('Make scenario OK', { uid, borradorId, executionId });
      return { ...data, executionId, borradorId };
    } catch (err) {
      logger.error('Make scenario error', err);
      throw new HttpsError(
        'internal',
        err instanceof Error ? err.message : 'Error al ejecutar escenario Make'
      );
    }
  }
);
