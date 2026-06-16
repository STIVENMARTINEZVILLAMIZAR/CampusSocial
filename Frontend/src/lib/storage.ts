import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function isPublicHttpsUrl(url: string): boolean {
  return /^https:\/\//i.test(url);
}

/** Sube vía Cloud Function (evita CORS de Storage en localhost). */
export async function subirArchivoPublicacion(_uid: string, file: File): Promise<string> {
  const fn = httpsCallable<
    { fileName: string; contentType: string; base64: string },
    { url: string }
  >(functions, 'uploadPublicationImage');
  const base64 = await fileToBase64(file);
  const res = await fn({
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    base64,
  });
  return res.data.url;
}

/** LinkedIn exige URL https pública; sube data URLs de IA a Storage. */
export async function subirDataUrlPublicacion(uid: string, dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith('data:')) return dataUrl;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.includes('png') ? 'png' : 'jpg';
  const file = new File([blob], `ia-${Date.now()}.${ext}`, { type: blob.type || 'image/jpeg' });
  return subirArchivoPublicacion(uid, file);
}

/**
 * Resuelve URL para publicar en redes.
 * - https:// → se usa tal cual (Pollinations, Picsum, etc.)
 * - data: → intenta subir a Storage; si falla devuelve null (publicación solo texto)
 */
export async function resolverUrlPublicacion(
  uid: string,
  url: string | null | undefined
): Promise<string | null> {
  if (!url) return null;
  if (isPublicHttpsUrl(url)) return url;
  if (url.startsWith('data:')) {
    try {
      return await subirDataUrlPublicacion(uid, url);
    } catch {
      return null;
    }
  }
  return url;
}

/** true si había imagen pero no se pudo resolver para LinkedIn */
export function imagenQuedoSinResolver(
  original: string | null | undefined,
  resolved: string | null
): boolean {
  return Boolean(original?.trim()) && !resolved;
}
