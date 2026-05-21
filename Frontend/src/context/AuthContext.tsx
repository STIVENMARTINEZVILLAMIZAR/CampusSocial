import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { inicializarCuentaUsuario, type Usuario } from '../lib/db';
import { mensajeErrorAuth } from '../lib/authErrors';

type AuthState = {
  user: User | null;
  profile: Usuario | null;
  loading: boolean;
  initError: string | null;
  loginEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const bootstrapFirestore = useCallback(async (u: User) => {
    setInitError(null);
    try {
      const perfil = await inicializarCuentaUsuario(u);
      setProfile(perfil);
    } catch (err) {
      setProfile(null);
      setInitError(mensajeErrorAuth(err));
      throw err;
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await bootstrapFirestore(u);
        } catch {
          // initError ya asignado
        }
      } else {
        setProfile(null);
        setInitError(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [bootstrapFirestore]);

  const loginEmail = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await bootstrapFirestore(cred.user);
  }, [bootstrapFirestore]);

  const registerEmail = useCallback(async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await bootstrapFirestore(cred.user);
  }, [bootstrapFirestore]);

  const loginGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await bootstrapFirestore(cred.user);
  }, [bootstrapFirestore]);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        profile,
        loading,
        initError,
        loginEmail,
        registerEmail,
        loginGoogle,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth dentro de AuthProvider');
  return ctx;
}
