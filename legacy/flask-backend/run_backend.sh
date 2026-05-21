#!/bin/bash
# Script para ejecutar el backend del Asistente de IA
# Este script instala dependencias y ejecuta la aplicación

echo ""
echo "================================================"
echo "  ASISTENTE DE IA - BACKEND"
echo "================================================"
echo ""

# Verificar que Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 no está instalado"
    exit 1
fi

# Crear ambiente virtual si no existe
if [ ! -d "venv" ]; then
    echo "[INFO] Creando ambiente virtual..."
    python3 -m venv venv
    echo "[OK] Ambiente virtual creado"
fi

# Activar ambiente virtual
echo "[INFO] Activando ambiente virtual..."
source venv/bin/activate

# Instalar dependencias
echo "[INFO] Instalando dependencias..."
pip install -r requirements.txt --quiet
echo "[OK] Dependencias instaladas"

# Ejecutar pruebas
echo ""
echo "================================================"
echo "  EJECUTANDO PRUEBAS"
echo "================================================"
echo ""
python3 test_app.py
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Las pruebas fallaron. Revisa los errores arriba."
    exit 1
fi

# Iniciar servidor
echo ""
echo "================================================"
echo "  INICIANDO SERVIDOR"
echo "================================================"
echo ""
echo "[INFO] Servidor iniciando en http://localhost:5000"
echo "[INFO] Presiona Ctrl+C para detener"
echo ""
python3 app.py
