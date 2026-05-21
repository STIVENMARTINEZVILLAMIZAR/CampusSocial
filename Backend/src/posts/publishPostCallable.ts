import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { publishPostById } from './publishPostNow';

interface PublishNowRequest {
  postId: string;
}

export const publishPostNow = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
    }

    const { postId } = request.data as PublishNowRequest;
    if (!postId) {
      throw new HttpsError('invalid-argument', 'postId es obligatorio');
    }

    try {
      await publishPostById(postId, request.auth.uid);
      return { success: true, postId };
    } catch (err) {
      logger.error('publishPostNow error', err);
      throw new HttpsError(
        'internal',
        err instanceof Error ? err.message : 'Error al publicar'
      );
    }
  }
);
