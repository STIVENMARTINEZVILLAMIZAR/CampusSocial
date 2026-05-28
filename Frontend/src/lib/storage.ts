import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function subirArchivoPublicacion(uid: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `publicaciones/${uid}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
