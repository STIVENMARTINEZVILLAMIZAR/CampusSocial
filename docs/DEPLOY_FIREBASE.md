# Despliegue Firebase — CampusSocial

## Plan Spark vs Blaze

| Componente | Plan Spark (gratis) | Plan Blaze |
|------------|---------------------|------------|
| **Hosting** (app + `/privacidad`) | ✅ | ✅ |
| **Firestore** (reglas, índices) | ✅ | ✅ |
| **Cloud Functions** (IA, OAuth LinkedIn, webhooks) | ❌ | ✅ |

El error `must be on the Blaze plan` aparece al desplegar **Functions** porque usan Cloud Build y Artifact Registry.

**Activar Blaze:** https://console.firebase.google.com/project/campussocial-f56a0/usage/details

- Sigue habiendo **cuota gratuita** generosa (Functions, Firestore, Hosting).
- Solo pagas si superas esos límites; para desarrollo/campus suele quedar en $0.

## Despliegue por fases

### Fase 1 — Ya puedes (sin Blaze): política + app estática

```bash
cd Frontend && npm run build
cd .. && firebase deploy --only hosting,firestore
```

- App: https://campussocial-f56a0.web.app
- Privacidad: https://campussocial-f56a0.web.app/privacidad

Usa esa URL en **LinkedIn Developers** y **Meta**.

### Fase 2 — Tras activar Blaze: backend en la nube

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set LINKEDIN_CLIENT_ID
firebase functions:secrets:set LINKEDIN_CLIENT_SECRET
firebase functions:secrets:set APP_FRONTEND_URL
# opcional: N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET

cd Backend && npm run build
cd .. && firebase deploy --only functions
```

O todo junto:

```bash
firebase deploy --only hosting,functions,firestore
```

## Desarrollo local sin Blaze

Mientras no subas Functions:

```bash
# Terminal 1
cd Backend && npm run dev

# Terminal 2
cd Frontend && npm run dev
```

En `Frontend/.env`: `VITE_USE_FIREBASE_EMULATOR=true`  
Auth puede ser Google real en Firebase; Firestore/Functions en emulador.

OAuth LinkedIn en local: redirect URI del emulador (ver `docs/LINKEDIN_OAUTH.md`).

## n8n en local + ngrok (sin Functions en nube)

Si no tienes Blaze, el webhook puede apuntar a n8n local vía ngrok; la IA y Firestore siguen en emulador o en Firestore en nube (cliente web con credenciales reales).
