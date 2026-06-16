import type { ResultadoRed } from '../types';
import { withRetry } from './retry';

export interface LinkedInTokens {
  accessToken?: string;
  memberUrn?: string;
  organizationId?: string | null;
  scope?: string | null;
}

const LINKEDIN_API_VERSION = process.env.LINKEDIN_API_VERSION?.trim() || '202504';
const POST_SCOPE = 'w_member_social';

function missingPostScopeMessage(): string {
  return (
    'Tu cuenta de LinkedIn no tiene permiso para publicar (falta w_member_social). ' +
    'En Backend/.secret.local pon LINKEDIN_OAUTH_INCLUDE_POST_SCOPE=true, reinicia npm run dev, ' +
    've a Canales → desconecta y vuelve a conectar LinkedIn. ' +
    'En LinkedIn Developers activa el producto "Share on LinkedIn".'
  );
}

function hasPostScope(scope?: string | null): boolean {
  if (!scope) return false;
  return scope.split(/[\s,]+/).includes(POST_SCOPE);
}

function parseLinkedInError(status: number, text: string): string {
  if (/ACCESS_DENIED|w_member_social|ugcPosts\.CREATE/i.test(text)) {
    return missingPostScopeMessage();
  }
  return `LinkedIn ${status}: ${text.slice(0, 400)}`;
}

async function publishTextViaPostsApi(
  accessToken: string,
  author: string,
  contenido: string
): Promise<ResultadoRed> {
  const body = {
    author,
    commentary: contenido,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': LINKEDIN_API_VERSION,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseLinkedInError(res.status, text));
  }

  const postId = res.headers.get('x-restli-id') ?? `li_${Date.now()}`;
  return { success: true, postId };
}

async function publishViaUgcPosts(
  accessToken: string,
  author: string,
  contenido: string,
  imagenUrl?: string | null
): Promise<ResultadoRed> {
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
    throw new Error(parseLinkedInError(res.status, text));
  }

  let postId: string | undefined;
  try {
    const parsed = JSON.parse(text) as { id?: string };
    postId = parsed.id;
  } catch {
    postId = res.headers.get('x-restli-id') ?? undefined;
  }

  return { success: true, postId: postId ?? `li_${Date.now()}` };
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

  if (!hasPostScope(tokens.scope)) {
    return { success: false, error: missingPostScopeMessage() };
  }

  return withRetry(async () => {
    if (!imagenUrl) {
      try {
        return await publishTextViaPostsApi(accessToken, author, contenido);
      } catch (postsErr) {
        const msg = postsErr instanceof Error ? postsErr.message : String(postsErr);
        if (!/ACCESS_DENIED|403|w_member_social/i.test(msg)) {
          return publishViaUgcPosts(accessToken, author, contenido, null);
        }
        throw postsErr;
      }
    }
    return publishViaUgcPosts(accessToken, author, contenido, imagenUrl);
  }, 'linkedin');
}
