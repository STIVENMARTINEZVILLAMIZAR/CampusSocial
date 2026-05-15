# CampusSocial — Sistema integrado

Automatización de publicaciones en redes para **Campus Lands** con agente Gemini, maquetación React y n8n.

## Estructura del proyecto

```
agente_inteligente/
├── backend/              # Flask + Gemini API
│   ├── app.py            # Rutas chat + social + schedule
│   ├── controlador/
│   │   ├── chat_handler.py    # Agente Gemini (entrenado Campus Lands)
│   │   └── social_handler.py  # Generación de borradores JSON
│   └── data/
│       ├── conversations.json
│       └── drafts.json
├── maquetacion/          # Frontend React (maquetación Figma → app real)
│   └── src/
│       ├── app/CampusApp.tsx   # App producción conectada
│       └── services/api.ts     # Cliente API Flask
├── fronted/              # Chat HTML legacy (opcional)
└── .env                  # CLAVE_API_GEMINI, N8N_WEBHOOK_URL, etc.
```

## Inicio rápido

### 1. Backend (terminal 1)

```bash
cd agente_inteligente/backend
pip install -r requirements.txt
python app.py
```

Servidor: `http://localhost:5000`

### 2. Frontend maquetación (terminal 2)

```bash
cd agente_inteligente/maquetacion
npm install
npm run dev
```

App: `http://localhost:5173`

### 3. Variables de entorno (`.env` en raíz `agente_inteligente/`)

```env
CLAVE_API_GEMINI=tu_clave_google_ai
N8N_WEBHOOK_URL=https://tu-instancia.app.n8n.cloud/webhook/campus-publicacion
N8N_WEBHOOK_SECRET=tu_secreto
POSTIZ_API_KEY=opcional
```

En **Ajustes** de la app también puedes guardar la URL del webhook n8n (localStorage).

## API Backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/chat` | Chat con agente Gemini |
| POST | `/api/social/generate` | Generar borrador de post |
| GET | `/api/social/drafts` | Listar borradores |
| POST | `/api/social/approve` | Aprobar borrador |
| POST | `/api/social/schedule` | Programar vía n8n |
| GET | `/api/config` | Estado de integraciones |

## Flujo conectado

1. **Nueva publicación** → Gemini genera copy → guarda borrador
2. **Vista previa** → revisar en UI
3. **Programar** → backend llama webhook n8n → Postiz/LinkedIn
4. **Agente IA** → chat libre con contexto Campus Lands
5. **Borradores** → lista desde `drafts.json`

## Modo design preview (8 pantallas Figma)

```bash
# maquetacion/.env
VITE_DESIGN_PREVIEW=true
npm run dev
```

## n8n

Configura el workflow con webhook `campus-publicacion` y conecta la URL en Ajustes.
