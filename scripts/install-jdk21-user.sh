#!/usr/bin/env bash
# Instala Temurin JDK 21 en ~/jdk/jdk-21 (sin sudo). Requerido por firebase emulators.
set -euo pipefail

DEST="$HOME/jdk/jdk-21"
mkdir -p "$HOME/jdk"

if [ -x "$DEST/bin/java" ]; then
  echo "✓ Ya existe: $DEST"
  "$DEST/bin/java" -version
  exit 0
fi

echo "→ Descargando Eclipse Temurin JDK 21…"
TMP="$HOME/jdk/jdk21.tar.gz"
curl -fsSL \
  "https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse?project=jdk" \
  -o "$TMP"
tar -xzf "$TMP" -C "$HOME/jdk"
rm -f "$TMP"

EXTRACTED="$(find "$HOME/jdk" -maxdepth 1 -type d -name 'jdk-21*' ! -path "$DEST" | head -1)"
if [ -n "$EXTRACTED" ] && [ "$EXTRACTED" != "$DEST" ]; then
  mv "$EXTRACTED" "$DEST"
fi

if [ ! -x "$DEST/bin/java" ]; then
  echo "❌ No se pudo instalar en $DEST"
  exit 1
fi

echo "✓ JDK 21 en $DEST"
"$DEST/bin/java" -version
echo ""
echo "Ahora: cd Backend && npm run dev"
