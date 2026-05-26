import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import type { AutomationPostPayload, AutomationPostResponse } from '../lib/db/types';

/** Llama Cloud Function → webhook del escenario Make (secretos solo en servidor) */
export async function ejecutarFlujoPublicacion(
  payload: AutomationPostPayload,
  webhookUrl?: string
): Promise<AutomationPostResponse & { executionId?: string; borradorId?: string }> {
  const fn = httpsCallable<
    AutomationPostPayload & { webhookUrl?: string },
    AutomationPostResponse & { executionId: string; borradorId: string }
  >(functions, 'triggerMakeWorkflow');
  const res = await fn({ ...payload, webhookUrl });
  return res.data;
}

/** URL del webhook: n8n primero, luego Make (Firestore / Ajustes) */
export function getAutomationWebhookUrl(config?: {
  makeWebhookUrl?: string;
  n8nWebhookUrl?: string;
} | null): string {
  return config?.n8nWebhookUrl?.trim() || config?.makeWebhookUrl?.trim() || '';
}
