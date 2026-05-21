import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { generateAiText } from './aiProvider';
import type { ChatMessage } from '../types';

interface ChatRequest {
  mensaje: string;
  historial?: ChatMessage[];
}

interface ChatResponse {
  respuesta: string;
  accionSugerida?: string;
  provider?: string;
}

export const chatWithAgent = onCall(
  { region: 'us-central1' },
  async (request): Promise<ChatResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
    }

    const { mensaje, historial = [] } = request.data as ChatRequest;
    if (!mensaje?.trim()) {
      throw new HttpsError('invalid-argument', 'mensaje es obligatorio');
    }

    const uid = request.auth.uid;
    const db = getFirestore();

    try {
      const historyText = historial
        .slice(-10)
        .map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
        .join('\n');

      const prompt = `${historyText ? `Historial:\n${historyText}\n\n` : ''}Usuario: ${mensaje}

Responde como CampusSocial, asistente de marketing para redes de Campus Lands.
Si el usuario pide crear o programar un post, sugiere la acción en JSON al final:
{"accionSugerida": "crear_borrador" | "programar_post" | "ver_calendario" | null}`;

      const { text: raw, provider } = await generateAiText(prompt);

      let respuesta = raw.trim();
      let accionSugerida: string | undefined;

      const actionMatch = respuesta.match(/\{"accionSugerida"\s*:\s*"([^"]+)"\}/);
      if (actionMatch) {
        accionSugerida = actionMatch[1] === 'null' ? undefined : actionMatch[1];
        respuesta = respuesta.replace(/\{"accionSugerida"[^}]+\}\s*$/, '').trim();
      }

      await db.collection('chats').doc(uid).collection('mensajes').add({
        role: 'user',
        content: mensaje,
        creadoEn: FieldValue.serverTimestamp(),
      });
      await db.collection('chats').doc(uid).collection('mensajes').add({
        role: 'model',
        content: respuesta,
        accionSugerida: accionSugerida ?? null,
        creadoEn: FieldValue.serverTimestamp(),
      });

      return { respuesta, accionSugerida, provider };
    } catch (err) {
      logger.error('chatWithAgent error', err);
      const msg = err instanceof Error ? err.message : 'Error en el chat';
      throw new HttpsError('internal', msg);
    }
  }
);
