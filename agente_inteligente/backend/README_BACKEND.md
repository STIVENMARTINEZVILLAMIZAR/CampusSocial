# Backend - Asistente de IA con Gemini

## 📋 Descripción

Backend funcional para un asistente de IA que utiliza la API de Google Gemini. Incluye:

- ✅ Integración completa con Google Gemini API
- ✅ Almacenamiento persistente en JSON
- ✅ Gestión de conversaciones y mensajes
- ✅ Validaciones estrictas
- ✅ Manejo robusto de errores
- ✅ CORS configurado
- ✅ Logging completo
- ✅ Suite de pruebas completa

## 📁 Estructura de Directorios

```
backend/
├── app.py                    # Aplicación principal Flask
├── config.py               # Configuración centralizada
├── test_app.py             # Suite de pruebas
├── requirements.txt        # Dependencias de Python
├── data/                   # Datos (creado automáticamente)
│   └── conversations.json  # Almacenamiento de conversaciones
├── controlador/
│   ├── __init__.py
│   └── chat_handler.py     # Manejador de chat con Gemini
├── utils/
│   ├── __init__.py
│   └── storage.py          # Utilidades de almacenamiento JSON
└── modelo/                 # (Reservado para modelos)
```

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd "ruta\del\proyecto\backend"
```

### 2. Crear un entorno virtual (Recomendado)

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Windows (CMD)
python -m venv venv
venv\Scripts\activate.bat

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

## 🔑 Configuración de Variabless de Entorno

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Agrega tu clave de API de Gemini:

```
CLAVE_API_GEMINI=tu_clave_api_aqui
```

**Nota:** La clave ya debería estar en tu archivo `.env` existente.

## ✅ Ejecutar Pruebas

Antes de iniciar el servidor, ejecuta las pruebas para verificar que todo está configurado correctamente:

```bash
python test_app.py
```

Deberías ver un resumen similar a:

```
======================================================================
 SUITE DE PRUEBAS - ASISTENTE DE IA
======================================================================

...

======================================================================
RESUMEN DE PRUEBAS
======================================================================
Dependencias: ✓ PASÓ
Configuración: ✓ PASÓ
Almacenamiento JSON: ✓ PASÓ
Manejador de Chat: ✓ PASÓ
Aplicación Flask: ✓ PASÓ

Total: 5/5 pruebas pasadas

✓ ¡TODAS LAS PRUEBAS PASARON! La aplicación está lista.
```

## 🎯 Iniciar el Servidor

```bash
python app.py
```

El servidor se iniciará en: `http://localhost:5000`

Deberías ver algo como:

```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

## 📡 Endpoints Disponibles

### 1. Health Check
```
GET /health
```
Verifica que el servidor está funcionando.

**Respuesta:**
```json
{
  "status": "ok",
  "service": "AI Assistant Backend",
  "version": "1.0.0"
}
```

### 2. Status de la API
```
GET /api/status
```
Obtiene el estado de la API y estadísticas.

**Respuesta:**
```json
{
  "status": "ok",
  "service": "AI Assistant Backend",
  "system": {
    "model": "gemini-pro",
    "api_configured": true,
    "status": "Operativo"
  },
  "storage": {
    "total_conversations": 2,
    "total_messages": 10,
    "file_size_kb": 3.45
  }
}
```

### 3. Enviar Mensaje (Principal)
```
POST /api/chat
```
Envía un mensaje a la IA y obtiene una respuesta.

**Body:**
```json
{
  "message": "¿Cuál es la capital de Francia?",
  "conversation_id": "id-opcional-conversacion"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "La capital de Francia es París.",
  "response": "La capital de Francia es París.",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-05-12T10:30:45.123456"
}
```

### 4. Obtener Conversaciones
```
GET /api/conversations
```
Obtiene todas las conversaciones.

**Respuesta:**
```json
{
  "success": true,
  "conversations": [...],
  "count": 5
}
```

### 5. Obtener Conversación Específica
```
GET /api/conversations/<conversation_id>
```
Obtiene una conversación con todos sus mensajes.

**Respuesta:**
```json
{
  "success": true,
  "conversation": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Conversación sobre geografía",
    "created_at": "2024-05-12T10:30:45.123456",
    "updated_at": "2024-05-12T10:35:20.654321",
    "messages": [...]
  }
}
```

### 6. Obtener Mensajes de una Conversación
```
GET /api/conversations/<conversation_id>/messages
```
Obtiene todos los mensajes de una conversación.

**Respuesta:**
```json
{
  "success": true,
  "messages": [
    {
      "role": "user",
      "content": "¿Hola?",
      "timestamp": "2024-05-12T10:30:45.123456"
    },
    {
      "role": "bot",
      "content": "¡Hola! ¿Cómo estás?",
      "timestamp": "2024-05-12T10:30:46.123456"
    }
  ],
  "count": 2
}
```

### 7. Eliminar Conversación
```
DELETE /api/conversations/<conversation_id>
```
Elimina una conversación.

**Respuesta:**
```json
{
  "success": true,
  "message": "Conversación eliminada"
}
```

### 8. Actualizar Título de Conversación
```
PUT /api/conversations/<conversation_id>/title
```
Actualiza el título de una conversación.

**Body:**
```json
{
  "title": "Nuevo título"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Título actualizado"
}
```

## 📊 Estructura del Almacenamiento JSON

El archivo `data/conversations.json` tiene la siguiente estructura:

```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Mi primera conversación",
      "created_at": "2024-05-12T10:30:45.123456",
      "updated_at": "2024-05-12T10:35:20.654321",
      "messages": [
        {
          "role": "user",
          "content": "¿Hola?",
          "timestamp": "2024-05-12T10:30:45.123456"
        },
        {
          "role": "bot",
          "content": "¡Hola! ¿Cómo estás?",
          "timestamp": "2024-05-12T10:30:46.123456"
        }
      ]
    }
  ]
}
```

## 🔍 Características de Validación

- ✓ Validación de mensajes vacíos
- ✓ Validación de longitud máxima (5000 caracteres)
- ✓ Validación de JSON
- ✓ Validación de API Key de Gemini
- ✓ Manejo de errores de conexión
- ✓ Manejo de errores de timeout

## 📝 Logging

La aplicación registra todas las acciones importantes. Puedes ver los logs en la consola:

```
2024-05-12 10:30:45,123 - root - INFO - Aplicación iniciada correctamente
2024-05-12 10:30:50,456 - root - INFO - Nueva conversación creada: 550e8400-e29b-41d4-a716-446655440000
2024-05-12 10:30:51,789 - root - INFO - Mensaje de usuario guardado: 550e8400-e29b-41d4-a716-446655440000
```

## 🐛 Solución de Problemas

### Error: "Clave de API de Gemini no configurada"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que contiene: `CLAVE_API_GEMINI=tu_clave_aqui`
- Reinicia el servidor

### Error: "No se puede conectar con el servidor"
- Verifica que el servidor está corriendo: `python app.py`
- Verifica el puerto (por defecto 5000)
- Verifica que no hay otro proceso usando el puerto 5000

### Error: "Puerto 5000 ya está en uso"
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Linux/Mac
lsof -i :5000

# Matar el proceso (Windows)
Stop-Process -Id [PID]

# Matar el proceso (Linux/Mac)
kill -9 [PID]
```

## 🔐 Seguridad

- La clave de API está protegida en el archivo `.env`
- CORS está configurado para aceptar conexiones locales
- Validaciones estrictas en todos los inputs
- Manejo robusto de errores sin exponer información sensible

## 📦 Dependencias

- `Flask 2.3.0` - Framework web
- `Flask-CORS 4.0.0` - Soporte para CORS
- `python-dotenv 1.0.0` - Carga de variables de entorno
- `google-generativeai 0.3.0` - API de Gemini
- `requests 2.31.0` - Librería HTTP

## 🎓 Ejemplos de Uso

### Con cURL
```bash
# Enviar un mensaje
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuál es la capital de Francia?"}'
```

### Con Python
```python
import requests

url = 'http://localhost:5000/api/chat'
data = {'message': '¿Hola?'}
response = requests.post(url, json=data)
print(response.json())
```

### Con JavaScript
```javascript
fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: '¿Hola?' })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 📞 Contacto y Soporte

Para reportar bugs o sugerencias, contacta al desarrollador.

---

**Versión:** 1.0.0  
**Última actualización:** Mayo 12, 2024
