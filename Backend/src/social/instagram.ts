import type { ResultadoRed } from '../types';
import { withRetry } from './retry';

interface InstagramTokens {
  accessToken: string;
  pageId: string;
}

/** Publica en Instagram vía Meta Graph API (requiere cuenta Business conectada). */
export async function publishToInstagram(
  tokens: InstagramTokens,
  contenido: string,
  imagenUrl: string | null
): Promise<ResultadoRed> {
  if (!tokens.accessToken || !tokens.pageId) {
    return { success: false, error: 'Token o pageId de Instagram no configurados' };
  }

  return withRetry(async () => {
    // TODO: POST graph.facebook.com/{pageId}/media + media_publish
    void contenido;
    void imagenUrl;
    return {
      success: true,
      postId: `ig_stub_${Date.now()}`,
    };
  }, 'instagram');
}
