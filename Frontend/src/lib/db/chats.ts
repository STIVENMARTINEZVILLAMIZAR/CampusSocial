import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import type { ChatMensaje } from './types';

export async function listarMensajesChat(uid: string): Promise<ChatMensaje[]> {
  const q = query(
    collection(db, 'chats', uid, 'mensajes'),
    orderBy('creadoEn', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({
    id: d.id,
    ...(d.data() as Omit<ChatMensaje, 'id'>),
    orden: i,
  }));
}
