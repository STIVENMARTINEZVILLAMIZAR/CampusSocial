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

export async function chatWithAgent(mensaje: string, historial: { role: 'user' | 'model'; content: string }[]) {
  const fn = httpsCallable<
    { mensaje: string; historial?: { role: 'user' | 'model'; content: string }[] },
    { respuesta: string; accionSugerida?: string }
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
    { contenido: string; hashtags: string[]; variaciones: string[]; provider?: string }
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
