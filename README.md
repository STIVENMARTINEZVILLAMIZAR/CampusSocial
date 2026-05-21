# CampusSocial

Automatización de publicaciones en redes para **Campus Lands**, con foco en **LinkedIn** (Postiz + n8n) e **Asistente IA** (Gemini) como un apartado más de la app.

## Estructura

| Carpeta | Rol |
|---------|-----|
| **`Fontend/`** | App React CampusSocial (UI + Firebase cliente) |
| **`Backend/`** | Cloud Functions (IA, posts, n8n, LinkedIn) |
| **`docs/`** | Documentación (Firestore, arquitectura, módulo IA) |
| **`legacy/flask-backend/`** | Flask antiguo (no producción) |

> **Nota:** `Fontend` tiene un typo (falta la *r*). Conviene renombrar a `frontend` cuando puedas; mientras tanto Firebase y la documentación usan `Fontend/`.

## Desarrollo

```bash
cd Fontend
npm install
cp .env.example .env
npm run dev

cd ../Backend
npm install
npm run build
```

## Firebase (`campussocial-f56a0`)

```bash
firebase deploy --only firestore,functions,hosting
```

- Hosting → `Fontend/dist`
- Functions → `Backend/`

## Documentación

- [STRUCTURA_PROYECTO.md](STRUCTURA_PROYECTO.md)
- [docs/ARQUITECTURA_FIREBASE.md](docs/ARQUITECTURA_FIREBASE.md)
- [docs/MODULO_ASISTENTE_IA.md](docs/MODULO_ASISTENTE_IA.md) — apartado IA (no carpeta `modules/`)
