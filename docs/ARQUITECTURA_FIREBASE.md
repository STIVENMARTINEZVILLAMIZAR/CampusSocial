# CampusSocial — Arquitectura 100% nube (Firebase)

## Resumen

| Capa | Tecnología |
|------|------------|
| UI | `Fontend/` — React, Vite, Tailwind, componentes Figma |
| API / lógica | `Backend/` — Cloud Functions Node 20 |
| Datos | Firestore (`southamerica-east1`) + Storage (futuro) |
| Auth | Firebase Auth (email + Google) |
| IA | Gemini (secret `GEMINI_API_KEY`, solo en Functions) |
| Orquestación | **Make.com** vía `triggerMakeWorkflow` (webhook; plan gratuito) |
| Programación | `scheduledPublisher` cada 1 min |
| Deploy | Firebase Hosting (`Fontend/dist`) + `firebase deploy` |

## Estructura

```
CampusSocial/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── Fontend/                        # App CampusSocial
└── Backend/                        # Cloud Functions (IA, posts, Make, LinkedIn)
```

Legacy Flask: `legacy/flask-backend/` (no desplegar).

## Cloud Functions

| Function | Tipo | Descripción |
|----------|------|-------------|
| `generateContent` | callable | Gemini → contenido + hashtags |
| `chatWithAgent` | callable | Chat + historial en Firestore |
| `schedulePost` | callable | Marca post como `programado` |
| `publishPostNow` | callable | Publica en redes (`tokens_redes`) |
| `scheduledPublisher` | schedule `every 1 minutes` | Publica posts vencidos |
| `triggerMakeWorkflow` | callable | POST a webhook Make, borrador/ejecución |
| `triggerN8nWorkflow` | callable | alias legacy de `triggerMakeWorkflow` |

## Colecciones Firestore

Ver [FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md).

- `usuarios/{uid}` — perfil
- `publicaciones/{postId}` — posts y estado por red
- `borradores/{draftId}` — borradores IA / Make
- `ejecuciones_n8n/{id}` — trazas de llamadas al webhook (nombre legacy)
- `tokens_redes/{uid}` — **solo Admin SDK** (cliente: deny)
- `chats/{uid}/mensajes/{id}` — historial agente

## Proyecto Firebase

- **Project ID:** `campussocial-f56a0`
- SDK web: `Fontend/.env` (`VITE_FIREBASE_*`)
- CLI: `.firebaserc` en la raíz

## Configuración inicial

1. [Firebase Console](https://console.firebase.google.com/project/campussocial-f56a0): Auth, Firestore, Functions, Hosting
2. `Fontend/.env` desde `Fontend/.env.example`
3. Secrets:
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   firebase functions:secrets:set MAKE_WEBHOOK_URL
   firebase functions:secrets:set MAKE_WEBHOOK_SECRET
   # Legacy: N8N_WEBHOOK_URL / N8N_WEBHOOK_SECRET (opcional)
   ```
4. Build y deploy:
   ```bash
   cd Fontend && npm install && npm run build
   cd ../Backend && npm install && npm run build
   firebase deploy --only firestore,functions,hosting
   ```

## Desarrollo local

```bash
cd Fontend && npm run dev
# Opcional: firebase emulators:start
```

## Integración Make

Webhook: `POST` con header opcional `X-Campus-Secret`. Body: `topic`, `tone`, `include_image`, `platforms[]`, `body`, `image_url`, `action` (`publish` | `verify_channel`). Ver [MAKE_SETUP.md](MAKE_SETUP.md). JSON de referencia n8n: `Flujo_Automatizacion/`.

## Próximos pasos

- [ ] OAuth redes → `tokens_redes` solo vía Functions
- [ ] APIs reales en `Backend/src/social/`
- [ ] Subir imágenes a Storage desde el editor
- [ ] Escenario Make activo (máx. 2 en plan Gratis)
