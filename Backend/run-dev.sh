#!/usr/bin/env bash
set -euo pipefail

EMULATORS="${EMULATORS:-functions}"

# Firebase emulators (Firestore) requieren Java 21+
pick_java_home() {
  for candidate in \
    "$HOME/jdk/jdk-21" \
    "/usr/lib/jvm/java-21-openjdk-amd64" \
    "/usr/lib/jvm/java-21-amazon-corretto" \
    "${JAVA_HOME:-}"; do
    if [ -n "$candidate" ] && [ -x "$candidate/bin/java" ]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

if JAVA_HOME="$(pick_java_home)"; then
  export JAVA_HOME
  export PATH="$JAVA_HOME/bin:$PATH"
  echo "→ Java para emuladores: $($JAVA_HOME/bin/java -version 2>&1 | head -1)"
elif [ "${EMULATORS:-functions}" = "full" ]; then
  echo "❌ Firebase emulators requieren JDK 21+."
  echo "   Sin sudo: bash scripts/install-jdk21-user.sh"
  echo "   Con apt:  sudo apt-get install -y openjdk-21-jdk"
  java -version 2>&1 | head -1 || true
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -x "$ROOT/scripts/kill-emulator-ports.sh" ]; then
  bash "$ROOT/scripts/kill-emulator-ports.sh"
fi

cd "$(dirname "$0")"
npm run build
cd ..

# Por defecto solo Functions → Firestore/Auth del cliente en producción (Frontend/.env sin emulador).
# Stack completo local: EMULATORS=full npm run dev

if [ "$EMULATORS" = "full" ]; then
  echo "→ Iniciando emuladores completos: functions, firestore, storage…"
  firebase emulators:start --only functions,firestore,storage
else
  unset FIRESTORE_EMULATOR_HOST
  unset FIREBASE_STORAGE_EMULATOR_HOST
  echo "→ Iniciando emulador Functions (:5001). Firestore/Storage = producción (campussocial-f56a0)."
  firebase emulators:start --only functions
fi
