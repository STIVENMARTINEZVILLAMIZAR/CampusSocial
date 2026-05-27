#!/usr/bin/env bash
# Obtiene credenciales web de Firebase y las escribe en Frontend/.env
set -euo pipefail

PROJECT_ID="${1:-campussocial-f56a0}"
ENV_FILE="$(dirname "$0")/../Frontend/.env"

echo "→ Inicia sesión en Firebase (se abrirá el navegador)…"
firebase login

echo "→ Leyendo SDK web del proyecto $PROJECT_ID…"
OUT=$(firebase apps:sdkconfig WEB --project "$PROJECT_ID" 2>/dev/null || firebase apps:sdkconfig web --project "$PROJECT_ID")

API_KEY=$(echo "$OUT" | sed -n 's/.*"apiKey"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
APP_ID=$(echo "$OUT" | sed -n 's/.*"appId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
MSG_ID=$(echo "$OUT" | sed -n 's/.*"messagingSenderId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
MEASURE=$(echo "$OUT" | sed -n 's/.*"measurementId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

if [ -z "$API_KEY" ] || [ -z "$APP_ID" ]; then
  echo "No se pudo leer apiKey/appId. Copia manualmente desde Firebase Console → Project settings → Your apps."
  echo "$OUT"
  exit 1
fi

touch "$ENV_FILE"
for key in VITE_FIREBASE_API_KEY VITE_FIREBASE_APP_ID VITE_FIREBASE_MESSAGING_SENDER_ID VITE_FIREBASE_MEASUREMENT_ID VITE_USE_AUTH_EMULATOR; do
  sed -i "/^${key}=/d" "$ENV_FILE" 2>/dev/null || true
done

{
  echo "VITE_FIREBASE_API_KEY=$API_KEY"
  echo "VITE_FIREBASE_APP_ID=$APP_ID"
  [ -n "$MSG_ID" ] && echo "VITE_FIREBASE_MESSAGING_SENDER_ID=$MSG_ID"
  [ -n "$MEASURE" ] && echo "VITE_FIREBASE_MEASUREMENT_ID=$MEASURE"
  echo "VITE_USE_AUTH_EMULATOR=false"
} >> "$ENV_FILE"

echo "✓ Actualizado $ENV_FILE"
echo "  Reinicia el frontend: cd Frontend && npm run dev"
