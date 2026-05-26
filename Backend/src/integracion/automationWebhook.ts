import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';

const makeWebhookUrlSecret = defineSecret('MAKE_WEBHOOK_URL');
const makeWebhookSecret = defineSecret('MAKE_WEBHOOK_SECRET');
const legacyN8nUrlSecret = defineSecret('N8N_WEBHOOK_URL');
const legacyN8nSecret = defineSecret('N8N_WEBHOOK_SECRET');

function readSecret(getter: () => string): string {
  try {
    const v = getter();
    return v?.trim() ?? '';
  } catch {
    return '';
  }
}

/** URL webhook: prioridad n8n (Docker/local) → Make → Ajustes en Firestore */
export async function resolveAutomationWebhookUrl(
  uid: string,
  override?: string
): Promise<string> {
  if (override?.trim()) return override.trim();

  const fromN8n = readSecret(() => legacyN8nUrlSecret.value());
  if (fromN8n) return fromN8n;

  const fromEnvN8n = process.env.N8N_WEBHOOK_URL?.trim();
  if (fromEnvN8n) return fromEnvN8n;

  const fromMake = readSecret(() => makeWebhookUrlSecret.value());
  if (fromMake) return fromMake;

  const fromEnvMake = process.env.MAKE_WEBHOOK_URL?.trim();
  if (fromEnvMake) return fromEnvMake;

  const snap = await getFirestore().collection('configuracion').doc(uid).get();
  const data = snap.data();
  const n8nUrl = (data?.n8nWebhookUrl as string | undefined)?.trim();
  if (n8nUrl) return n8nUrl;
  return (data?.makeWebhookUrl as string | undefined)?.trim() ?? '';
}

export function resolveAutomationWebhookSecret(): string {
  const n8n = readSecret(() => legacyN8nSecret.value());
  if (n8n) return n8n;
  const envN8n = process.env.N8N_WEBHOOK_SECRET?.trim();
  if (envN8n) return envN8n;
  const make = readSecret(() => makeWebhookSecret.value());
  if (make) return make;
  const envMake = process.env.MAKE_WEBHOOK_SECRET?.trim();
  if (envMake) return envMake;
  return '';
}
