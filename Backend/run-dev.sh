#!/usr/bin/env bash
set -euo pipefail

# Firebase emulators (Firestore) requieren Java 21+
if [ -d "$HOME/jdk/jdk-21" ]; then
  export JAVA_HOME="$HOME/jdk/jdk-21"
  export PATH="$JAVA_HOME/bin:$PATH"
  echo "→ Java para emuladores: $($JAVA_HOME/bin/java -version 2>&1 | head -1)"
else
  echo "⚠ No se encontró $HOME/jdk/jdk-21. Instala JDK 21 o define JAVA_HOME."
  java -version 2>&1 | head -1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -x "$ROOT/scripts/kill-emulator-ports.sh" ]; then
  bash "$ROOT/scripts/kill-emulator-ports.sh"
fi

cd "$(dirname "$0")"
npm run build
cd ..

# Sin emulador Auth: Google real en Firebase nube (VITE_USE_AUTH_EMULATOR=false)
echo "→ Iniciando emuladores: functions, firestore, storage (sin auth)…"
firebase emulators:start --only functions,firestore,storage
