# Despliegue en Vercel — CampusSocial

El repo es un **monorepo**: la web está en `Frontend/` (Vite + React). El backend vive en `Backend/` (Firebase Functions), no en Vercel.

## Por qué salía 404

Vercel intentaba desplegar la **raíz del repo**, que no tiene `package.json` ni `index.html`. El `vercel.json` en la raíz apunta el build a `Frontend/dist`.

## Redeploy

1. Haz commit y push de `vercel.json`.
2. En Vercel → **Deployments** → **Redeploy** (o espera el deploy automático del push).

Alternativa en el dashboard (Settings → General):

| Campo | Valor |
|-------|--------|
| Root Directory | `Frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

Si usas Root Directory = `Frontend`, el `vercel.json` de la raíz sigue siendo válido para el monorepo completo.

## Variables de entorno (obligatorias)

En Vercel → **Settings → Environment Variables** (Production):

```env
VITE_APP_MODE=production
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=campussocial-f56a0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=campussocial-f56a0
VITE_FIREBASE_STORAGE_BUCKET=campussocial-f56a0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_USE_FIREBASE_EMULATOR=false
VITE_USE_FUNCTIONS_EMULATOR=false
VITE_USE_AUTH_EMULATOR=false
VITE_LINKEDIN_OAUTH_REDIRECT_URI=https://TU-DOMINIO.vercel.app/oauth/linkedin
```

Obtén `VITE_FIREBASE_*` desde Firebase Console o:

```bash
bash scripts/sync-firebase-web-env.sh
```

**Importante:** con `VITE_USE_FUNCTIONS_EMULATOR=true` la app intentará llamar a `localhost:5001` y fallará en producción.

## Backend (IA, OAuth, publicaciones)

Las Cloud Functions se despliegan en **Firebase**, no en Vercel:

```bash
firebase deploy --only hosting,functions,firestore
```

Ver [DEPLOY_FIREBASE.md](./DEPLOY_FIREBASE.md).

## Firebase Hosting vs Vercel

El proyecto ya está configurado para Firebase Hosting (`firebase.json` → `Frontend/dist`). Puedes usar:

- **Vercel** — preview rápido, dominio `.vercel.app`
- **Firebase Hosting** — https://campussocial-f56a0.web.app (recomendado si todo el stack es Firebase)

No despliegues el frontend en ambos sin actualizar OAuth redirects y `APP_FRONTEND_URL` en Functions.
