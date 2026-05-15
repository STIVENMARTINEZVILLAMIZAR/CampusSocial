@echo off
REM Script para ejecutar el backend del Asistente de IA
REM Este script instala dependencias y ejecuta la aplicación

setlocal enabledelayedexpansion

echo.
echo ================================================
echo  ASISTENTE DE IA - BACKEND
echo ================================================
echo.

REM Verificar que Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado o no está en el PATH
    pause
    exit /b 1
)

REM Crear ambiente virtual si no existe
if not exist "venv\" (
    echo [INFO] Creando ambiente virtual...
    python -m venv venv
    echo [OK] Ambiente virtual creado
)

REM Activar ambiente virtual
echo [INFO] Activando ambiente virtual...
call venv\Scripts\activate.bat

REM Instalar dependencias
echo [INFO] Instalando dependencias...
pip install -r requirements.txt --quiet
echo [OK] Dependencias instaladas

REM Ejecutar pruebas
echo.
echo ================================================
echo  EJECUTANDO PRUEBAS
echo ================================================
echo.
python test_app.py
if errorlevel 1 (
    echo.
    echo [ERROR] Las pruebas fallaron. Revisa los errores arriba.
    pause
    exit /b 1
)

REM Iniciar servidor
echo.
echo ================================================
echo  INICIANDO SERVIDOR
echo ================================================
echo.
echo [INFO] Servidor iniciando en http://localhost:5000
echo [INFO] Presiona Ctrl+C para detener
echo.
python app.py

pause
