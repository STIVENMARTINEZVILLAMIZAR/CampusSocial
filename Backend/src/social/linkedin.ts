import type { ResultadoRed } from '../types';
import { withRetry } from './retry';

interface LinkedInTokens {
  accessToken: string;
  organizationId: string;
}

export async function publishToLinkedIn(
  tokens: LinkedInTokens,
  contenido: string
): Promise<ResultadoRed> {
  if (!tokens.accessToken || !tokens.organizationId) {
    return { success: false, error: 'Token u organizationId de LinkedIn no configurados' };
  }

  return withRetry(async () => {
    // TODO: Share API v2 ugcPosts
    return { success: true, postId: `li_stub_${Date.now()}` };
  }, 'linkedin');
}
