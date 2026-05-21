import { onCall } from 'firebase-functions/v2/https';
import { resolveAiProvider } from './aiProvider';

/** Comprueba que Functions responde y si hay API de IA configurada */
export const healthCheck = onCall({ region: 'us-central1' }, async () => {
  let ai = false;
  let provider = '';
  let aiError = '';
  try {
    const r = resolveAiProvider();
    ai = true;
    provider = r.provider;
  } catch (e) {
    aiError = e instanceof Error ? e.message : 'Sin API IA';
  }
  return {
    ok: true,
    ai,
    provider,
    aiError,
    hint: ai
      ? 'IA lista'
      : 'Crea Backend/.secret.local con ANTHROPIC_API_KEY o despliega secrets en Firebase',
  };
});
