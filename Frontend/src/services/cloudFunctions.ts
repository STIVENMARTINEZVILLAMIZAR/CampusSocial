import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export async function healthCheck() {
  const fn = httpsCallable<
    Record<string, never>,
    { ok: boolean; ai: boolean; provider?: string; aiError?: string; hint?: string }
  >(functions, 'healthCheck');
  const res = await fn({});
  return res.data;
}

export type ChatAgentResponse = {
  respuesta: string;
  accionSugerida?: string;
  temaSugerido?: string;
  tonoSugerido?: string;
  provider?: string;
};

export async function chatWithAgent(
  mensaje: string,
  historial: { role: 'user' | 'model'; content: string }[]
): Promise<ChatAgentResponse> {
  const fn = httpsCallable<
    { mensaje: string; historial?: { role: 'user' | 'model'; content: string }[] },
    ChatAgentResponse
  >(functions, 'chatWithAgent');
  const res = await fn({ mensaje, historial });
  return res.data;
}

export async function generateContent(
  prompt: string,
  redSocial: string,
  tono: string,
  generarImagen?: boolean
) {
  const fn = httpsCallable<
    { prompt: string; redSocial: string; tono: string; generarImagen?: boolean },
    {
      contenido: string;
      hashtags: string[];
      variaciones: string[];
      provider?: string;
      imagenGenerada?: boolean;
      imagenUrl?: string;
      imagenNota?: string;
    }
  >(functions, 'generateContent');
  const res = await fn({ prompt, redSocial, tono, generarImagen });
  return res.data;
}

export async function schedulePost(postId: string, fechaHora: string, redesDestino?: string[]) {
  const fn = httpsCallable<
    { postId: string; fechaHora: string; redesDestino?: string[] },
    { success: boolean }
  >(functions, 'schedulePost');
  const res = await fn({ postId, fechaHora, redesDestino });
  return res.data;
}

export async function publishPostNow(postId: string) {
  const fn = httpsCallable<{ postId: string }, { success: boolean; postId: string }>(
    functions,
    'publishPostNow'
  );
  const res = await fn({ postId });
  return res.data;
}

export async function verifyChannelConnection(input: {
  red: string;
  integrationId?: string;
  profileUrl?: string;
  cuentaNombre?: string;
}) {
  const fn = httpsCallable<
    typeof input,
    { ok: boolean; cuentaNombre: string; integrationId?: string; verificadoPor?: string }
  >(functions, 'verifyChannelConnection');
  const res = await fn(input);
  return res.data;
}
