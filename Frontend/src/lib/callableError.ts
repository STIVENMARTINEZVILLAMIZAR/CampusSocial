import { FirebaseError } from 'firebase/app';

export function mensajeCallable(err: unknown): string {
  if (err instanceof FirebaseError) {
    const detail = (err as FirebaseError & { customData?: { message?: string } }).message;
    if (err.code === 'functions/failed-precondition' && detail) return detail;
    if (err.code === 'functions/unauthenticated') return 'Debes iniciar sesión.';
    if (err.code === 'functions/unavailable') {
      return 'Backend no disponible. ¿Está `npm run dev` en Backend?';
    }
    return detail || err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Error al llamar al servidor.';
}
