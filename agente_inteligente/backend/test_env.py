import os
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno
env_path = os.path.join(Path(__file__).parent.parent, '.env')
print(f"Buscando .env en: {env_path}")
print(f"¿Existe el archivo?: {os.path.exists(env_path)}")

load_dotenv(env_path)

api_key = os.getenv('CLAVE_API_GEMINI')
print(f"API Key cargada: {api_key[:20]}..." if api_key else "API Key NO ENCONTRADA")
