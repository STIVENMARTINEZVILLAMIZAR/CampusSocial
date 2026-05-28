import { initializeApp, getApps } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
export const useAuthEmulator = import.meta.env.VITE_USE_AUTH_EMULATOR === 'true';

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');
export const googleProvider = new GoogleAuthProvider();

let emulatorsConnected = false;

if (useEmulator && !emulatorsConnected) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  if (useAuthEmulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  emulatorsConnected = true;
}

export function hasRealFirebaseWebConfig(): boolean {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  return Boolean(key && appId && !String(key).includes('placeholder'));
}
