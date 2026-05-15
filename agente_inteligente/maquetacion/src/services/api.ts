/** Vacío en dev usa proxy Vite → localhost:5000 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface Draft {
  id: string;
  status: string;
  topic?: string;
  tone?: string;
  title?: string;
  body?: string;
  linkedin?: string;
  instagram?: string;
  hashtags?: string[];
  platforms?: string[];
  schedule_at?: string;
  created_at?: string;
}

export interface GenerateDraftRequest {
  topic: string;
  tone: string;
  platforms: string[];
  generate_image?: boolean;
  send_telegram?: boolean;
}

export interface AppSettings {
  n8nWebhookUrl: string;
  n8nWebhookSecret: string;
  postizApiKey: string;
}

const SETTINGS_KEY = 'campus_social_settings';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { n8nWebhookUrl: '', n8nWebhookSecret: '', postizApiKey: '' };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Error en la solicitud');
  }
  return data;
}

export const campusApi = {
  health: () => request<{ status: string }>('/health'),
  status: () => request<{ status: string; system: { model: string } }>('/api/status'),

  chat: (message: string, conversationId?: string) =>
    request<{ success: boolean; response: string; conversation_id: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    }),

  generateDraft: (payload: GenerateDraftRequest) =>
    request<{ success: boolean; draft: Draft; preview: { title: string; body: string; hashtags: string[] } }>(
      '/api/social/generate',
      { method: 'POST', body: JSON.stringify(payload) }
    ),

  listDrafts: (status?: string) =>
    request<{ success: boolean; drafts: Draft[] }>(
      `/api/social/drafts${status ? `?status=${status}` : ''}`
    ),

  approveDraft: (draftId: string, approved: boolean, editedBody?: string) =>
    request<{ success: boolean; draft: Draft }>('/api/social/approve', {
      method: 'POST',
      body: JSON.stringify({ draft_id: draftId, approved, edited_body: editedBody }),
    }),

  scheduleDraft: (payload: {
    draft_id: string;
    schedule_at: string;
    platforms: string[];
    content?: string;
    n8n_webhook_url?: string;
    n8n_webhook_secret?: string;
  }) =>
    request<{ success: boolean; draft: Draft; message: string }>('/api/social/schedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteDraft: (draftId: string) =>
    request<{ success: boolean }>(`/api/social/drafts/${draftId}`, { method: 'DELETE' }),

  getConfig: () => request<{ gemini_configured: boolean; n8n_configured: boolean; model: string }>('/api/config'),
};
