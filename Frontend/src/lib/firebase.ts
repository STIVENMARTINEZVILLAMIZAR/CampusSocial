import { initializeApp, getApps } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'campussocial-f56a0';

/** Firebase rechaza apiKey vacío; placeholder evita pantalla en blanco si falta .env. */
function envOrDevFallback(value: string | undefined, devFallback: string): string {
  if (value && value.trim()) return value.trim();
  return devFallback;
}

const firebaseConfig = {
  apiKey: envOrDevFallback(import.meta.env.VITE_FIREBASE_API_KEY, 'local-dev-placeholder'),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  messagingSenderId: envOrDevFallback(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    '000000000000'
  ),
  appId: envOrDevFallback(import.meta.env.VITE_FIREBASE_APP_ID, '1:000000000000:web:localdev'),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/** Todos los emuladores (Firestore, Functions, Storage). */
export const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
/** Solo Functions en local (Auth/Firestore siguen en producción). */
export const useFunctionsEmulator =
  import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true' || useEmulator;
export const useAuthEmulator = import.meta.env.VITE_USE_AUTH_EMULATOR === 'true';

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');
export const googleProvider = new GoogleAuthProvider();

let emulatorsConnected = false;

if (!emulatorsConnected) {
  if (useEmulator) {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
  }
  if (useFunctionsEmulator) {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  }
  if (useAuthEmulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  if (useEmulator || useFunctionsEmulator || useAuthEmulator) {
    emulatorsConnected = true;
  }
}

export function hasRealFirebaseWebConfig(): boolean {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  return Boolean(key && appId && !String(key).includes('placeholder'));
}
