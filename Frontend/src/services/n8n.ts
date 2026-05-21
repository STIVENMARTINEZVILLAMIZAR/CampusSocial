import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import type { N8nCampusPostPayload, N8nCampusPostResponse } from '../lib/db/types';

/** Llama Cloud Function → webhook n8n (secretos solo en servidor) */
export async function ejecutarFlujoPublicacion(
  payload: N8nCampusPostPayload,
  webhookUrl?: string
): Promise<N8nCampusPostResponse & { executionId?: string; borradorId?: string }> {
  const fn = httpsCallable<
    N8nCampusPostPayload & { webhookUrl?: string },
    N8nCampusPostResponse & { executionId: string; borradorId: string }
  >(functions, 'triggerN8nWorkflow');
  const res = await fn({ ...payload, webhookUrl });
  return res.data;
}
