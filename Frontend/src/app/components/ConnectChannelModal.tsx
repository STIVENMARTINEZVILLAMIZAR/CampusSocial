import React, { useState } from 'react';
import { AlertTriangle, Copy, ExternalLink, Loader2, ShieldCheck } from 'lucide-react';
import { startLinkedInOAuth } from '../../services/cloudFunctions';
import {
  getLinkedInOAuthRedirectUri,
  LINKEDIN_REDIRECT_URLS_TO_REGISTER,
} from '../../lib/linkedinOAuth';
import { LINKEDIN_DEVELOPERS_URL } from '../../lib/redesConfig';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { cuentaNombre: string; integrationId?: string }) => void;
};

export function ConnectChannelModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const redirectUri = getLinkedInOAuthRedirectUri();

  const copyRedirect = async () => {
    await navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const { authUrl } = await startLinkedInOAuth(redirectUri);
      window.location.assign(authUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo iniciar la autorización';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Conectar LinkedIn</h3>
          <p className="text-sm text-muted-foreground mt-1">
            App CampusSocial (Client ID <code className="text-xs">78yegyn4dy3vpv</code>)
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-sm space-y-2">
            <p className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Si ves «redirect_uri does not match»
            </p>
            <ol className="list-decimal list-inside text-amber-950 dark:text-amber-100 space-y-1.5 text-xs">
              <li>
                Pestaña <strong>Products</strong>: <strong>Sign In with LinkedIn</strong> (activo) y{' '}
                <strong>Share on LinkedIn</strong> en verde.
              </li>
              <li>
                Si Share aún no aprueba: en <code className="text-[10px]">Backend/.secret.local</code>{' '}
                usa <code className="text-[10px]">LINKEDIN_OAUTH_INCLUDE_POST_SCOPE=false</code>.
              </li>
              <li>
                Pestaña <strong>Auth</strong> → añade <strong>las dos</strong> URLs de abajo.
              </li>
              <li>
                Pulsa <strong>Update</strong> al final de OAuth 2.0 settings.
              </li>
              <li>Abre CampusSocial en <strong>http://localhost:5173</strong>.</li>
            </ol>
          </div>

          <div className="p-4 bg-accent rounded-xl text-sm space-y-3">
            <p className="font-medium">URLs para LinkedIn → Auth → Authorized redirect URLs</p>
            {LINKEDIN_REDIRECT_URLS_TO_REGISTER.map((url) => (
              <code
                key={url}
                className="block text-xs p-2 bg-background rounded border break-all font-mono"
              >
                {url}
              </code>
            ))}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">CampusSocial enviará ahora:</p>
              <code className="block text-xs p-2 bg-background rounded border break-all font-mono">
                {redirectUri}
              </code>
              <button
                type="button"
                className="mt-2 text-xs flex items-center gap-1 text-[#0a66c2] hover:underline"
                onClick={() => void copyRedirect()}
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copiado' : 'Copiar URL activa'}
              </button>
            </div>
          </div>

          <a
            href={LINKEDIN_DEVELOPERS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border font-medium hover:bg-accent transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir LinkedIn Developers
          </a>

          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            Tras autorizar, vuelves a <code className="text-xs">/oauth/linkedin</code> y la cuenta queda
            vinculada.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="button"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={() => void handleOAuth()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Iniciar sesión con LinkedIn
          </button>

          <button type="button" className="w-full py-2 text-sm text-muted-foreground" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
