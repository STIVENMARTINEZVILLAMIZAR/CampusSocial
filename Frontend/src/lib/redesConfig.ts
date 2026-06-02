import type { RedSocial } from './db/types';

/** CampusSocial publica solo en LinkedIn */
export const RED_PRINCIPAL: RedSocial = 'linkedin';

export const REDES_PUBLICACION: RedSocial[] = ['linkedin'];

export const LINKEDIN_DEVELOPERS_URL =
  import.meta.env.VITE_LINKEDIN_DEVELOPERS_URL ||
  'https://www.linkedin.com/developers/apps';
