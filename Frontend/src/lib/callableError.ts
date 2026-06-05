import { FirebaseError } from 'firebase/app';

export function mensajeCallable(err: unknown): string {
  if (err instanceof FirebaseError) {
    const detail = (err as FirebaseError & { customData?: { message?: string } }).message;
    if (err.code === 'functions/failed-precondition' && detail) return detail;
    if (err.code === 'functions/unauthenticated') return 'Debes iniciar sesión.';
    if (err.code === 'functions/not-found') {
      return detail || 'Publicación no encontrada. Reinicia Backend (solo emulador Functions, no Firestore).';
    }
    if (err.code === 'functions/unavailable') {
      return 'Functions no disponible. En Backend ejecuta: npm run dev (emulador en :5001).';
    }
    if (err.code === 'functions/internal') {
      if (detail && detail !== 'internal' && !/^INTERNAL$/i.test(detail)) return detail;
      return 'IA no respondió. ¿Backend con npm run dev y GEMINI_API_KEY en Backend/.secret.local?';
    }
    if (detail && detail !== 'internal') return detail;
    return err.message;
  }
  if (err instanceof Error) {
    const m = err.message;
    if (/cors|failed to fetch|network/i.test(m)) {
      return 'Sin conexión al backend. Activa VITE_USE_FUNCTIONS_EMULATOR=true y npm run dev en Backend.';
    }
    return m;
  }
  return 'Error al llamar al servidor.';
}
