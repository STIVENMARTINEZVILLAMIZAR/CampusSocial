# CampusSocial — Backend (Cloud Functions)

No es un servidor Flask que escucha un puerto con `npm run build`.  
**`build`** solo compila TypeScript → carpeta `lib/`.

## Arrancar el backend en local

Necesitas [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`

Desde esta carpeta:

```bash
npm install
npm run dev
```

Eso compila y levanta los **emuladores** (Functions, Firestore, Auth). Deja la terminal abierta.

- Functions: http://127.0.0.1:5001  
- Consola emuladores: http://127.0.0.1:4000  

Desde la **raíz** del repo también puedes usar:

```bash
firebase emulators:start --only functions,firestore,auth
```

## Conectar el Fontend al backend local

En `Fontend/.env` añade:

```
VITE_USE_FIREBASE_EMULATOR=true
```

Reinicia `npm run dev` en Fontend.

## Producción (nube)

No hay proceso local permanente: se despliega a Firebase.

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set N8N_WEBHOOK_URL
firebase functions:secrets:set N8N_WEBHOOK_SECRET
npm run build
cd ..
firebase deploy --only functions
```

El Fontend en producción llama a las Functions desplegadas (sin emulador).

## Aviso Node 20 vs 25

`engines: { "node": "20" }` es para **Firebase en la nube**. En tu PC, Node 25 suele compilar bien; el emulador puede avisar, pero no impide `npm run dev`.
