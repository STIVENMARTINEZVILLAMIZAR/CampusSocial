import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function subirArchivoPublicacion(uid: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `publicaciones/${uid}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
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

export async function resolverUrlPublicacion(uid: string, url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return subirDataUrlPublicacion(uid, url);
  return url;
}
