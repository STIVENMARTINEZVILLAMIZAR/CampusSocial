export type RedSocial = 'linkedin' | 'instagram' | 'facebook' | 'twitter' | 'tiktok';

export interface N8nCampusPostPayload {
  topic: string;
  tone: string;
  include_image: boolean;
  telegram_notify: boolean;
  schedule_now: boolean;
  platforms: RedSocial[];
}

export interface N8nCampusPostResponse {
  success: boolean;
  title?: string;
  body?: string;
  hashtags?: string[];
  image_generated?: boolean;
  platforms_published?: string[];
  post_ids?: string[];
  linkedin_status?: string;
  preview_url?: string;
  error?: string;
}
