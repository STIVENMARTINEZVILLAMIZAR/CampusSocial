import { FirebaseError } from 'firebase/app';

const MAP: Record<string, string> = {
  'auth/invalid-email': 'Correo no válido.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/user-not-found': 'No hay cuenta con ese correo.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/email-already-in-use': 'Ese correo ya está registrado.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/popup-closed-by-user': 'Ventana de Google cerrada antes de terminar.',
  'auth/cancelled-popup-request': 'Inicio con Google cancelado.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu red.',
  'permission-denied': 'Sin permiso en Firestore. ¿Emulador o reglas activas?',
};

export function mensajeErrorAuth(err: unknown): string {
  if (err instanceof FirebaseError && MAP[err.code]) {
    return MAP[err.code]!;
  }
  if (err instanceof Error) return err.message;
  return 'Ocurrió un error. Intenta de nuevo.';
}
