import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { CanalRed, CanalesDoc, RedSocial } from './types';

export async function obtenerCanales(uid: string): Promise<CanalesDoc | null> {
  const snap = await getDoc(doc(db, 'canales', uid));
  if (!snap.exists()) return null;
  return snap.data() as CanalesDoc;
}

export async function guardarCanal(
  uid: string,
  red: RedSocial,
  patch: Partial<CanalRed>
): Promise<void> {
  await setDoc(
    doc(db, 'canales', uid),
    {
      usuarioId: uid,
      [red]: patch,
      actualizadoEn: serverTimestamp(),
    },
    { merge: true }
  );
}
