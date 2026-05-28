import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { ActividadItem } from './types';

export async function registrarActividad(
  uid: string,
  data: Pick<ActividadItem, 'tipo' | 'mensaje' | 'red'>
): Promise<void> {
  await addDoc(collection(db, 'actividad'), {
    usuarioId: uid,
    tipo: data.tipo,
    mensaje: data.mensaje,
    red: data.red ?? null,
    creadoEn: serverTimestamp(),
  });
}
