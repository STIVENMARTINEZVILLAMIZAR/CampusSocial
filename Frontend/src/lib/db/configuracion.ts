import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Configuracion } from './types';

export async function obtenerConfiguracion(uid: string): Promise<Configuracion | null> {
  const snap = await getDoc(doc(db, 'configuracion', uid));
  if (!snap.exists()) return null;
  return snap.data() as Configuracion;
}

export async function guardarConfiguracion(
  uid: string,
  data: Partial<Pick<Configuracion, 'n8nWebhookUrl' | 'makeWebhookUrl' | 'notifications' | 'timezone'>>
): Promise<void> {
  await setDoc(
    doc(db, 'configuracion', uid),
    {
      usuarioId: uid,
      ...data,
      actualizadoEn: serverTimestamp(),
    },
    { merge: true }
  );
}
