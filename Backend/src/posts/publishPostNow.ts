import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import type { Publicacion, RedSocial, ResultadoRed } from '../types';
import { publishToInstagram } from '../social/instagram';
import { publishToFacebook } from '../social/facebook';
import { publishToLinkedIn } from '../social/linkedin';

export async function publishPostById(postId: string, userId: string): Promise<void> {
  const db = getFirestore();
  const postRef = db.collection('publicaciones').doc(postId);
  const snap = await postRef.get();

  if (!snap.exists) {
    throw new Error(`Publicación ${postId} no encontrada`);
  }

  const post = { id: snap.id, ...snap.data() } as Publicacion;

  if (post.creadoPor !== userId) {
    throw new Error('No autorizado para publicar esta publicación');
  }

  const tokensSnap = await db.collection('tokens_redes').doc(userId).get();
  const tokens = tokensSnap.data() ?? {};

  const resultados: Partial<Record<RedSocial, ResultadoRed>> = {};

  const tasks = post.redesDestino.map(async (red) => {
    try {
      switch (red) {
        case 'instagram':
          resultados.instagram = await publishToInstagram(
            tokens.instagram ?? {},
            post.contenido,
            post.imagenUrl
          );
          break;
        case 'facebook':
          resultados.facebook = await publishToFacebook(
            tokens.facebook ?? {},
            post.contenido,
            post.imagenUrl
          );
          break;
        case 'linkedin':
          resultados.linkedin = await publishToLinkedIn(tokens.linkedin ?? {}, post.contenido);
          break;
        default:
          resultados[red] = { success: false, error: `Red ${red} aún no implementada` };
      }
    } catch (err) {
      logger.error(`Error publicando en ${red}`, err);
      resultados[red] = {
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      };
    }
  });

  await Promise.all(tasks);

  const allOk = Object.values(resultados).every((r) => r?.success);
  const anyOk = Object.values(resultados).some((r) => r?.success);

  await postRef.update({
    resultados,
    estado: allOk ? 'publicado' : anyOk ? 'publicado' : 'fallido',
    actualizadoEn: FieldValue.serverTimestamp(),
    fechaProgramada: null,
  });
}

export async function findDueScheduledPosts(): Promise<Array<{ id: string; creadoPor: string }>> {
  const db = getFirestore();
  const now = Timestamp.now();
  const q = await db
    .collection('publicaciones')
    .where('estado', '==', 'programado')
    .where('fechaProgramada', '<=', now)
    .limit(20)
    .get();

  return q.docs.map((d) => ({ id: d.id, creadoPor: d.data().creadoPor as string }));
}
