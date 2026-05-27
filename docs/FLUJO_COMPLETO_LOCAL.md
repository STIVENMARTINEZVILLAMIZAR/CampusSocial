# Flujo completo local — CampusSocial + n8n

Guía paso a paso para conectar **Frontend**, **Backend (Firebase)** y **n8n (Docker)**.

> **Make.com** (captura de LinkedIn trigger) es alternativa en la nube. Este proyecto usa **n8n local** con el JSON en `Flujo_Automatizacion/`.

---

## Arquitectura

```
CampusSocial (localhost:5173)
    │  Firebase Auth (Google real, nube)
    │  Firestore/Functions (emulador local)
    ▼
Cloud Functions → POST webhook + X-Campus-Secret
    ▼
n8n Docker (localhost:5678) → Gemini, Postiz, LinkedIn
```

---

## 0. Requisitos

| Herramienta | Verificar |
|-------------|-----------|
| Node 20+ | `node -v` |
| Firebase CLI | `firebase --version` |
| Docker | `docker ps` |
| JDK 21 (emuladores) | `~/jdk/jdk-21/bin/java -version` |

---

## 1. Liberar puertos (si el backend falla)

```bash
bash ~/Documentos/CampusSocial/scripts/kill-emulator-ports.sh
```

Error típico: `Could not start Authentication Emulator, port taken` → hay un emulador viejo ocupando 8080/9099.

---

## 2. Backend (terminal 1 — dejar abierta)

```bash
cd ~/Documentos/CampusSocial/Backend
npm run dev
```

Espera: **`All emulators ready!`**

- UI emuladores: http://127.0.0.1:4000
- Functions: http://127.0.0.1:5001

`Backend/.secret.local` debe tener:

```env
N8N_WEBHOOK_URL=http://127.0.0.1:5678/webhook/campus-post-form
N8N_WEBHOOK_SECRET=campus-secreto-2026
GEMINI_API_KEY=tu_clave_ai_studio
```

---

## 3. n8n Docker (terminal 2)

```bash
cd ~/Documentos/CampusSocial/Flujo_Automatizacion
docker compose up -d
```

Abre http://localhost:5678

1. **Import** → `CampusSocial _ Publicación LinkedIn.json`
2. Nodo **Campus Post Form Webhook** → credencial Header Auth:
   - Header: `X-Campus-Secret`
   - Valor: `campus-secreto-2026` (igual que `N8N_WEBHOOK_SECRET`)
3. Configura Gemini / Postiz si el flujo los pide
4. **Active** = ON (arriba a la derecha)

Webhook URL:

```
http://127.0.0.1:5678/webhook/campus-post-form
```

---

## 4. Frontend (terminal 3)

```bash
cd ~/Documentos/CampusSocial/Frontend
# Credenciales Google real (una vez):
bash ../scripts/sync-firebase-web-env.sh
npm run dev
```

Abre http://localhost:5173

En `Frontend/.env`:

```env
VITE_USE_FIREBASE_EMULATOR=true
VITE_USE_AUTH_EMULATOR=false
```

---

## 5. Conectar en la app

1. Inicia sesión (Google real o correo/contraseña)
2. **Ajustes** → URL webhook: `http://127.0.0.1:5678/webhook/campus-post-form` → Guardar
3. **Canales** → conectar LinkedIn vía Postiz (ID integración)
4. **Nueva publicación** → generar con IA → programar o publicar

---

## 6. Probar el webhook

```bash
curl -X POST http://127.0.0.1:5678/webhook/campus-post-form \
  -H "Content-Type: application/json" \
  -H "X-Campus-Secret: campus-secreto-2026" \
  -d '{"topic":"Prueba CampusSocial","tone":"profesional","include_image":false,"telegram_notify":false,"schedule_now":false,"platforms":["linkedin"]}'
```

En n8n → **Executions** debe aparecer una ejecución.

---

## 7. Make.com (opcional, no es el flujo principal)

Si prefieres Make en lugar de n8n:

1. Crea escenario con módulo **Webhooks → Custom webhook**
2. Copia la URL en `Backend/.secret.local` como `MAKE_WEBHOOK_URL`
3. Ver [MAKE_SETUP.md](MAKE_SETUP.md)

El escenario de la captura (LinkedIn trigger) **no** es el mismo que CampusSocial: la app **envía** datos al webhook, no recibe posts de LinkedIn automáticamente.

---

## Checklist rápido

- [ ] `npm run dev` en Backend → All emulators ready
- [ ] `docker compose up -d` → n8n en :5678
- [ ] Workflow importado y **Active**
- [ ] `N8N_WEBHOOK_SECRET` = Header Auth en n8n
- [ ] `VITE_FIREBASE_API_KEY` real en Frontend/.env
- [ ] Prueba curl OK
- [ ] Publicación desde la app → ejecución en n8n
