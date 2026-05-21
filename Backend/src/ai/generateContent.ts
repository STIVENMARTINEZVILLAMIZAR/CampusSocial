import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { generateAiText } from './aiProvider';
import type { GenerateContentRequest, GenerateContentResponse } from '../types';

const RED_HINTS: Record<string, string> = {
  instagram: 'Máximo impacto visual, emojis moderados, CTA claro, 5-10 hashtags.',
  facebook: 'Tono conversacional, pregunta al final, enlace si aplica.',
  linkedin: 'Profesional, párrafos cortos, valor para educadores y emprendedores.',
  tiktok: 'Hook en la primera línea, lenguaje dinámico y breve.',
  youtube: 'Título llamativo y descripción con palabras clave SEO.',
};

export const generateContent = onCall(
  { region: 'us-central1' },
  async (request): Promise<GenerateContentResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
    }

    const { prompt, redSocial, tono, generarImagen } = request.data as GenerateContentRequest & {
      generarImagen?: boolean;
    };
    if (!prompt?.trim()) {
      throw new HttpsError('invalid-argument', 'prompt es obligatorio');
    }

    const red = (redSocial || 'instagram').toLowerCase();
    const hint = RED_HINTS[red] ?? RED_HINTS.instagram;

    const userPrompt = `Red social: ${red}
Tono: ${tono || 'profesional'}
Instrucción: ${prompt}

${hint}

Responde SOLO con JSON válido (sin markdown):
{
  "contenido": "texto del post",
  "hashtags": ["tag1", "tag2"],
  "variaciones": ["versión alternativa 1", "versión alternativa 2"]
}`;

    try {
      const { text, provider } = await generateAiText(userPrompt);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as GenerateContentResponse;

      return {
        contenido: String(parsed.contenido ?? ''),
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map(String) : [],
        variaciones: Array.isArray(parsed.variaciones) ? parsed.variaciones.map(String) : [],
        provider,
        imagenGenerada: generarImagen ? false : undefined,
      };
    } catch (err) {
      logger.error('generateContent error', err);
      const msg = err instanceof Error ? err.message : 'Error al generar contenido';
      throw new HttpsError('internal', msg);
    }
  }
);
