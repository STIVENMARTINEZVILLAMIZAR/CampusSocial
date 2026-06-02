import type { ResultadoRed } from '../types';
import { withRetry } from './retry';

export interface LinkedInTokens {
  accessToken?: string;
  memberUrn?: string;
  organizationId?: string | null;
}
  
export async function publishToLinkedIn(
  tokens: LinkedInTokens,
  contenido: string,
  imagenUrl?: string | null
): Promise<ResultadoRed> {
  const accessToken = tokens.accessToken;
  const author = tokens.organizationId || tokens.memberUrn;

  if (!accessToken || !author) {
    return {
      success: false,
      error: 'LinkedIn no conectado. Ve a Canales y autoriza con LinkedIn Developers.',
    };
  }

  return withRetry(async () => {
    const shareMediaCategory = imagenUrl ? 'IMAGE' : 'NONE';
    const specificContent: Record<string, unknown> = {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: contenido },
        shareMediaCategory,
        ...(imagenUrl
          ? {
              media: [
                {
                  status: 'READY',
                  originalUrl: imagenUrl,
                },
              ],
            }
          : {}),
      },
    };

    const body = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent,
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`LinkedIn ugcPosts ${res.status}: ${text.slice(0, 400)}`);
    }

    let postId: string | undefined;
    try {
      const parsed = JSON.parse(text) as { id?: string };
      postId = parsed.id;
    } catch {
      postId = res.headers.get('x-restli-id') ?? undefined;
    }

    return { success: true, postId: postId ?? `li_${Date.now()}` };
  }, 'linkedin');
}
