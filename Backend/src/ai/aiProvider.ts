import { GoogleGenerativeAI } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';

export const geminiApiKey = defineSecret('GEMINI_API_KEY');
export const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

export const CAMPUS_SYSTEM_PROMPT = `Eres CampusSocial, el agente de marketing digital de Campus Lands.
Generas contenido para redes sociales (Instagram, Facebook, LinkedIn, TikTok, YouTube).
Responde en español, tono profesional y cercano. Incluye hashtags relevantes cuando aplique.
Marca: Campus Lands — educación, innovación, comunidad universitaria.
Enfócate en ideas que mantengan las redes activas y llamen la atención del público objetivo.`;

const GEMINI_MODEL = 'gemini-1.5-flash';
const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';

function readSecret(secret: ReturnType<typeof defineSecret>, envFallback: string): string {
  try {
    const v = secret.value();
    if (v?.trim()) return v.trim();
  } catch {
    // Emulador sin secret montado
  }
  const fromEnv = process.env[envFallback]?.trim();
  return fromEnv ?? '';
}

export type AiProvider = 'anthropic' | 'gemini';

export function resolveAiProvider(): { provider: AiProvider; apiKey: string } {
  const anthropic = readSecret(anthropicApiKey, 'ANTHROPIC_API_KEY')
    || readSecret(anthropicApiKey, 'CLAVE_API_CLAUDE');
  if (anthropic) return { provider: 'anthropic', apiKey: anthropic };

  const gemini = readSecret(geminiApiKey, 'GEMINI_API_KEY')
    || readSecret(geminiApiKey, 'CLAVE_API_GEMINI');
  if (gemini) return { provider: 'gemini', apiKey: gemini };

  throw new Error(
    'Configura ANTHROPIC_API_KEY o GEMINI_API_KEY en Backend/.secret.local (emulador) o Firebase Secrets'
  );
}

async function callAnthropic(apiKey: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: CAMPUS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    logger.error('Anthropic API error', errText);
    throw new Error(`Anthropic: ${res.status} ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const block = data.content?.find((c) => c.type === 'text');
  return block?.text?.trim() ?? '';
}

async function callGemini(apiKey: string, userPrompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: CAMPUS_SYSTEM_PROMPT,
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text().trim();
}

export async function generateAiText(userPrompt: string): Promise<{ text: string; provider: AiProvider }> {
  const { provider, apiKey } = resolveAiProvider();
  const text =
    provider === 'anthropic'
      ? await callAnthropic(apiKey, userPrompt)
      : await callGemini(apiKey, userPrompt);
  return { text, provider };
}

/** Compatibilidad con imports antiguos */
export function getGeminiModel() {
  const resolved = resolveAiProvider();
  if (resolved.provider !== 'gemini') {
    throw new Error('getGeminiModel solo disponible con GEMINI_API_KEY');
  }
  const apiKey = resolved.apiKey;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: CAMPUS_SYSTEM_PROMPT,
  });
}
