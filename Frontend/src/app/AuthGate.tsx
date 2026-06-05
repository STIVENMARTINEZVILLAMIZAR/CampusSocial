import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CampusSocialLogo } from './components/CampusSocialLogo';
import { useAuth } from '../context/AuthContext';
import { mensajeErrorAuth } from '../lib/authErrors';
import { hasRealFirebaseWebConfig, useAuthEmulator } from '../lib/firebase';
import App, { PublicLanding } from './App';

/** Login + app; invitados ven landing primero */
export default function AuthGate() {
  const { user, loginEmail, registerEmail, loginGoogle, logout, initError } = useAuth();
  const [guestView, setGuestView] = useState<'landing' | 'login'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    if (initError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="max-w-md bg-white border rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-red-600 mb-2">No se pudo preparar tu cuenta</p>
            <p className="text-sm text-slate-600 mb-4">{initError}</p>
            <button
              type="button"
              className="w-full py-2 rounded-xl border text-sm"
              onClick={() => void logout()}
            >
              Cerrar sesión e intentar de nuevo
            </button>
          </div>
        </div>
      );
    }
    return <App productionMode />;
  }

  if (guestView === 'landing') {
    return <PublicLanding onLogin={() => setGuestView('login')} />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const mail = email.trim();
      const pass = password;
      if (!mail || !pass) {
        setError('Correo y contraseña son obligatorios.');
        setLoading(false);
        return;
      }
      if (mode === 'login') await loginEmail(mail, pass);
      else await registerEmail(mail, pass);
    } catch (err) {
      setError(mensajeErrorAuth(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await loginGoogle();
    } catch (err) {
      setError(mensajeErrorAuth(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fafafa] to-slate-100 p-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-8 shadow-sm relative">
        <button
          type="button"
          onClick={() => setGuestView('landing')}
          className="absolute left-6 top-6 flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#667eea] transition-colors"
          aria-label="Volver a inicio"
        >
          <ArrowLeft className="w-4 h-4" />
          Inicio
        </button>
        <div className="mb-6 mt-8">
          <CampusSocialLogo size="lg" textClassName="!text-foreground !bg-none" />
        </div>
        <p className="text-sm text-slate-500 mb-6">Automatización de redes con IA y Make</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            className="w-full border rounded-xl px-4 py-2 text-sm"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={6}
            className="w-full border rounded-xl px-4 py-2 text-sm"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {useAuthEmulator && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Modo local: usa <strong>Crear cuenta</strong> o <strong>Entrar</strong> con correo/contraseña
              (emulador Auth en <code className="text-[11px]">127.0.0.1:9099</code>).
            </div>
          )}
          {!hasRealFirebaseWebConfig && !useAuthEmulator && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
              Para <strong>Continuar con Google</strong>, agrega en <code className="text-[11px]">Frontend/.env</code>{' '}
              las claves <code className="text-[11px]">VITE_FIREBASE_API_KEY</code> y{' '}
              <code className="text-[11px]">VITE_FIREBASE_APP_ID</code> desde Firebase Console, o ejecuta:{' '}
              <code className="text-[11px]">bash scripts/sync-firebase-web-env.sh</code>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium disabled:opacity-60"
          >
            {loading ? '…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
        <button
          type="button"
          disabled={loading || !hasRealFirebaseWebConfig}
          onClick={() => void handleGoogle()}
          className="w-full mt-3 py-2 border rounded-xl text-sm disabled:opacity-60"
          title={hasRealFirebaseWebConfig ? undefined : 'Configura VITE_FIREBASE_API_KEY y APP_ID en Frontend/.env'}
        >
          Continuar con Google
        </button>
        <button
          type="button"
          className="w-full mt-4 text-sm text-[#667eea]"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Crear cuenta' : 'Ya tengo cuenta'}
        </button>
        <p className="mt-6 text-center text-xs text-slate-500">
          <a href="/privacidad" className="text-[#667eea] hover:underline">
            Política de privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
