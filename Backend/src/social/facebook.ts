import type { ResultadoRed } from '../types';
import { withRetry } from './retry';

interface FacebookTokens {
  accessToken: string;
  pageId: string;
}

export async function publishToFacebook(
  tokens: FacebookTokens,
  contenido: string,
  imagenUrl: string | null
): Promise<ResultadoRed> {
  if (!tokens.accessToken || !tokens.pageId) {
    return { success: false, error: 'Token o pageId de Facebook no configurados' };
  }

  return withRetry(async () => {
    // TODO: POST /{page-id}/feed o /photos
    void imagenUrl;
    return { success: true, postId: `fb_stub_${Date.now()}` };
  }, 'facebook');
}
