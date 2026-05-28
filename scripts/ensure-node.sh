#!/usr/bin/env bash
# CampusSocial requiere Node >= 20 (Vite 6, Firebase 11, react-router 7).
set -euo pipefail

MIN_MAJOR=20
need() {
  echo "❌ $1" >&2
  exit 1
}

version_ok() {
  local v="$1"
  local major="${v%%.*}"
  major="${major#v}"
  [[ "$major" =~ ^[0-9]+$ ]] && (( major >= MIN_MAJOR ))
}

if version_ok "$(node -v 2>/dev/null || echo v0)"; then
  echo "✓ Node $(node -v) — listo para CampusSocial"
  exit 0
fi

echo "Node actual: $(node -v 2>/dev/null || echo 'no instalado')"
echo "Se requiere Node >= ${MIN_MAJOR}."
echo ""
echo "Opción A — nvm (recomendado):"
echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash"
echo "  source ~/.bashrc"
echo "  nvm install 20"
echo "  nvm use"
echo ""
echo "Opción B — NodeSource (Ubuntu/Debian):"
echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
echo "  sudo apt-get install -y nodejs"
echo ""
echo "Luego: cd Frontend && rm -rf node_modules && npm install"

exit 1
