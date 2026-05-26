import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/** Ruta única: solo Backend/.secret.local (no usar copias en la raíz del repo). */
export function getSecretLocalPath(): string {
  return resolve(__dirname, '../.secret.local');
}

/** Carga Backend/.secret.local en process.env (emulador y dev local). */
export function loadLocalSecrets(): void {
  const filePath = getSecretLocalPath();
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!key || !value) continue;
    if (key === 'GEMINI_MODEL' && !/^[a-z0-9][a-z0-9.-]*$/i.test(value)) {
      continue;
    }
    process.env[key] = value;
  }
}
