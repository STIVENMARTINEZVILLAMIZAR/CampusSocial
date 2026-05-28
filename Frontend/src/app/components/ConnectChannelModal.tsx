import React, { useState } from 'react';
import { ExternalLink, Loader2, ShieldCheck } from 'lucide-react';
import type { RedSocial } from '../../lib/db/types';
import { verifyChannelConnection, linkedinOAuthStart } from '../../services/cloudFunctions';

const POSTIZ_URL = import.meta.env.VITE_POSTIZ_URL || 'https://postiz.com';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  red: RedSocial;
  onSuccess: (data: { cuentaNombre: string; integrationId?: string }) => void;
};

export function ConnectChannelModal({ isOpen, onClose, channelName, red, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'choose' | 'postiz'>('choose');
  const [integrationId, setIntegrationId] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isLinkedIn = red === 'linkedin';
  const postizConnect = `${POSTIZ_URL.replace(/\/$/, '')}/settings`;

  const resetAndClose = () => {
    setStep(1);
    setMode('choose');
    setIntegrationId('');
    setProfileUrl('');
    setError('');
    onClose();
  };

  const handleLinkedInOAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const { url } = await linkedinOAuthStart();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar OAuth de LinkedIn');
      setLoading(false);
    }
  };

  const handleVerifyPostiz = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await verifyChannelConnection({
        red,
        integrationId: integrationId.trim() || undefined,
        profileUrl: profileUrl.trim() || undefined,
        cuentaNombre: integrationId.trim() || profileUrl.trim() || undefined,
      });
      onSuccess({
        cuentaNombre: res.cuentaNombre,
        integrationId: res.integrationId,
      });
      resetAndClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo verificar la conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Conectar {channelName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isLinkedIn
              ? 'Conexión oficial con LinkedIn (OAuth) o alternativa vía Postiz.'
              : 'Conecta la cuenta con Postiz o tu escenario de automatización.'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {isLinkedIn && mode === 'choose' && (
            <>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm space-y-2">
                <p className="font-medium text-emerald-900">Recomendado — API de LinkedIn</p>
                <p className="text-emerald-800/90">
                  Autoriza CampusSocial en LinkedIn. Los tokens se guardan de forma segura en el servidor
                  (no en el navegador).
                </p>
              </div>
              <button
                type="button"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0A66C2] text-white font-medium hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={() => void handleLinkedInOAuth()}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Conectar con LinkedIn
              </button>
              <button
                type="button"
                className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMode('postiz')}
              >
                Usar Postiz (alternativa)
              </button>
            </>
          )}

          {(!isLinkedIn || mode === 'postiz') && step === 1 && (
            <>
              <div className="p-4 bg-accent rounded-xl text-sm space-y-2">
                <p className="font-medium">Paso 1 — Conecta la cuenta en Postiz</p>
                <p className="text-muted-foreground">
                  {isLinkedIn
                    ? 'Si prefieres Postiz, conecta tu perfil allí y copia el ID de integración.'
                    : 'Conecta la cuenta en Postiz o Make y obtén el identificador de la integración.'}
                </p>
              </div>
              <a
                href={postizConnect}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary text-primary font-medium hover:bg-primary/5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Postiz para conectar cuenta
              </a>
              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium"
                onClick={() => setStep(2)}
              >
                Ya conecté en Postiz — continuar
              </button>
              {isLinkedIn && (
                <button type="button" className="w-full py-2 text-sm text-muted-foreground" onClick={() => setMode('choose')}>
                  Volver a OAuth de LinkedIn
                </button>
              )}
            </>
          )}

          {(!isLinkedIn || mode === 'postiz') && step === 2 && (
            <>
              <div>
                <label className="text-sm font-medium block mb-1">
                  ID de integración Postiz / usuario de la cuenta
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-input-background text-foreground"
                  placeholder="ej. stivenmartinezvillamizar o integration_abc123"
                  value={integrationId}
                  onChange={(e) => setIntegrationId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">URL del perfil (opcional)</label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-input-background text-foreground"
                  placeholder="https://linkedin.com/in/tu-perfil"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                Verificamos con tu webhook (acción verify_channel) o validamos el ID localmente.
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <button type="button" className="flex-1 py-2.5 rounded-xl border" onClick={() => setStep(1)}>
                  Atrás
                </button>
                <button
                  type="button"
                  disabled={loading || (!integrationId.trim() && !profileUrl.trim())}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={() => void handleVerifyPostiz()}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Verificar y conectar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
