"""
Configuración de la aplicación
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv(os.path.join(Path(__file__).parent.parent, '.env'))

# Rutas
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
CONVERSATIONS_FILE = DATA_DIR / 'conversations.json'
DRAFTS_FILE = DATA_DIR / 'drafts.json'

# Crear directorio de datos si no existe
DATA_DIR.mkdir(exist_ok=True)

# Configuración de API
GEMINI_API_KEY = os.getenv('CLAVE_API_GEMINI')
GEMINI_MODEL = 'gemini-2.5-flash'

# Integraciones externas (opcionales)
N8N_WEBHOOK_URL = os.getenv('N8N_WEBHOOK_URL', '')
N8N_WEBHOOK_SECRET = os.getenv('N8N_WEBHOOK_SECRET', '')
POSTIZ_API_KEY = os.getenv('POSTIZ_API_KEY', '')

# Configuración de Flask
DEBUG = True
HOST = '0.0.0.0'
PORT = 5000
JSON_SORT_KEYS = False

# Validaciones
MAX_MESSAGE_LENGTH = 5000
MAX_MESSAGES_PER_CONVERSATION = 100
REQUEST_TIMEOUT = 60

# Errores
ERROR_MESSAGES = {
    'NO_API_KEY': 'Error: Clave de API de Gemini no configurada',
    'INVALID_MESSAGE': 'El mensaje no puede estar vacío',
    'MESSAGE_TOO_LONG': f'El mensaje no puede exceder {MAX_MESSAGE_LENGTH} caracteres',
    'API_ERROR': 'Error al comunicarse con la API de Gemini',
    'STORAGE_ERROR': 'Error al guardar la conversación',
    'INVALID_JSON': 'Formato JSON inválido',
    'RATE_LIMIT': 'Demasiadas solicitudes. Intenta más tarde',
}
