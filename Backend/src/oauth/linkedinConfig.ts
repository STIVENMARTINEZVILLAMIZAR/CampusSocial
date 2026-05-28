const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'campussocial-f56a0';
const REGION = 'us-central1';

export const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
export const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
export const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

/** Scopes para perfil + publicar como miembro (Share on LinkedIn). */
export const LINKEDIN_DEFAULT_SCOPES = ['openid', 'profile', 'email', 'w_member_social'];

export function getLinkedInClientId(): string | undefined {
  return process.env.LINKEDIN_CLIENT_ID?.trim() || undefined;
}

export function getLinkedInClientSecret(): string | undefined {
  return process.env.LINKEDIN_CLIENT_SECRET?.trim() || undefined;
}

export function getLinkedInRedirectUri(): string {
  const override = process.env.LINKEDIN_REDIRECT_URI?.trim();
  if (override) return override;

  const emulator = process.env.FUNCTIONS_EMULATOR === 'true';
  if (emulator) {
    return `http://127.0.0.1:5001/${PROJECT_ID}/${REGION}/linkedinOAuthCallback`;
  }
  return `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/linkedinOAuthCallback`;
}

export function getAppFrontendUrl(): string {
  const url = process.env.APP_FRONTEND_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  return 'https://campussocial-f56a0.web.app';
}

export function isLinkedInOAuthConfigured(): boolean {
  return Boolean(getLinkedInClientId() && getLinkedInClientSecret());
}
