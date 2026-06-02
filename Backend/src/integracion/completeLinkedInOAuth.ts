import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import {
  exchangeLinkedInCode,
  fetchLinkedInUserInfo,
  memberUrnFromSub,
} from './linkedinOAuthApi';

export const completeLinkedInOAuth = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const { code, state } = request.data as { code?: string; state?: string };
  if (!code?.trim() || !state?.trim()) {
    throw new HttpsError('invalid-argument', 'code y state son obligatorios');
  }

  const uid = request.auth.uid;
  const db = getFirestore();
  const pendingRef = db.collection('oauth_linkedin_pending').doc(state.trim());
  const pendingSnap = await pendingRef.get();

  if (!pendingSnap.exists) {
    throw new HttpsError('failed-precondition', 'Sesión OAuth expirada o inválida. Vuelve a conectar.');
  }

  const pending = pendingSnap.data()!;
  if (pending.uid !== uid) {
    throw new HttpsError('permission-denied', 'El estado OAuth no corresponde a tu usuario');
  }

  const redirectUri = pending.redirectUri as string;

  try {
    const tokenRes = await exchangeLinkedInCode(code.trim(), redirectUri);
    const userInfo = await fetchLinkedInUserInfo(tokenRes.access_token);
    const memberUrn = memberUrnFromSub(userInfo.sub);
    const displayName =
      userInfo.name ||
      [userInfo.given_name, userInfo.family_name].filter(Boolean).join(' ') ||
      userInfo.email ||
      memberUrn;

    const expiresAt = Date.now() + (tokenRes.expires_in ?? 5184000) * 1000;

    await db.collection('tokens_redes').doc(uid).set(
      {
        linkedin: {
          accessToken: tokenRes.access_token,
          refreshToken: tokenRes.refresh_token ?? null,
          expiresAt,
          memberUrn,
          organizationId: null,
          displayName,
          email: userInfo.email ?? null,
          picture: userInfo.picture ?? null,
          scope: tokenRes.scope ?? null,
          actualizadoEn: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    await db.collection('canales').doc(uid).set(
      {
        usuarioId: uid,
        linkedin: {
          conectado: true,
          cuentaNombre: displayName,
          proveedor: 'linkedin_oauth',
          integrationId: memberUrn,
          profileUrl: null,
          verificadoPor: 'linkedin_oauth',
          verificadoEn: FieldValue.serverTimestamp(),
        },
        actualizadoEn: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await pendingRef.delete();

    logger.info('LinkedIn OAuth connected', { uid, memberUrn });

    return {
      ok: true,
      cuentaNombre: displayName,
      memberUrn,
      email: userInfo.email,
    };
  } catch (err) {
    logger.error('completeLinkedInOAuth', err);
    throw new HttpsError(
      'internal',
      err instanceof Error ? err.message : 'No se pudo completar la conexión con LinkedIn'
    );
  }
});
