"""
Manejador de chat con Gemini API
"""
import logging
from typing import Dict, Any, Tuple
import google.generativeai as genai
from config import GEMINI_API_KEY, GEMINI_MODEL, REQUEST_TIMEOUT, ERROR_MESSAGES

logger = logging.getLogger(__name__)


class ChatHandler:
    """Manejador de interacciones con Gemini API"""

    def __init__(self):
        """Inicializar el manejador de chat"""
        if not GEMINI_API_KEY:
            logger.error('Clave de API de Gemini no configurada')
            raise ValueError(ERROR_MESSAGES['NO_API_KEY'])

        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            GEMINI_MODEL,
            system_instruction=self.create_system_prompt()
        )
        self.chat_history = []

    def validate_message(self, message: str) -> Tuple[bool, str | None]:
        """
        Validar un mensaje

        Args:
            message: Mensaje a validar

        Returns:
            Tupla (es_válido, mensaje_error)
        """
        if not message:
            return False, ERROR_MESSAGES['INVALID_MESSAGE']

        if not isinstance(message, str):
            return False, ERROR_MESSAGES['INVALID_MESSAGE']

        message = message.strip()
        if len(message) == 0:
            return False, ERROR_MESSAGES['INVALID_MESSAGE']

        if len(message) > 5000:
            return False, ERROR_MESSAGES['MESSAGE_TOO_LONG']

        return True, None

    def create_system_prompt(self) -> str:
        """
        Crear un prompt del sistema

        Returns:
            Prompt del sistema
        """
        return """Eres el Agente IA de CampusSocial para Campus Lands (Colombia), institución de educación tecnológica.

Tu rol:
- Ayudar al equipo de marketing a crear publicaciones para LinkedIn, Instagram, Facebook y X.
- Proponer ideas de contenido sobre bootcamps, tecnología, educación y empleabilidad.
- Optimizar copy, hashtags y llamadas a la acción.
- Resumir y mejorar borradores de posts.

Reglas:
- Responde siempre en español (Colombia).
- Sé profesional, cercano y orientado a conversión educativa.
- Cuando pidan un post, estructura: gancho, desarrollo, CTA y hashtags sugeridos.
- Si piden JSON estructurado, respétalo exactamente sin markdown.
- No inventes datos de cupos, fechas o precios; si faltan, indícalo."""

    def send_message(self, message: str, conversation_history: list = None) -> Tuple[bool, str]:
        """
        Enviar un mensaje a Gemini

        Args:
            message: Mensaje del usuario
            conversation_history: Historial de conversación (lista de dicts)

        Returns:
            Tupla (exitoso, respuesta/error)
        """
        # Validar mensaje
        is_valid, error = self.validate_message(message)
        if not is_valid:
            logger.error(f'Validación fallida: {error}')
            return False, error

        try:
            # Preparar el historial si se proporciona
            if conversation_history:
                self.chat_history = conversation_history

            # Crear sesión de chat
            chat = self.model.start_chat(history=self.chat_history)

            # Enviar mensaje
            logger.info(f'Enviando mensaje a Gemini: {message[:50]}...')
            response = chat.send_message(
                message,
                generation_config=genai.types.GenerationConfig(
                    candidate_count=1,
                    max_output_tokens=2048,
                    temperature=0.7,
                )
            )

            # Validar respuesta
            if not response or not response.text:
                logger.error('Respuesta vacía de Gemini')
                return False, ERROR_MESSAGES['API_ERROR']

            response_text = response.text.strip()

            # Actualizar historial local
            self.chat_history.append({
                'role': 'user',
                'parts': [{'text': message}]
            })
            self.chat_history.append({
                'role': 'model',
                'parts': [{'text': response_text}]
            })

            logger.info('Respuesta recibida de Gemini exitosamente')
            return True, response_text

        except Exception as e:
            logger.error(f'Error al comunicarse con Gemini: {str(e)}')
            return False, ERROR_MESSAGES['API_ERROR']

    def format_history_for_gemini(self, messages: list) -> list:
        """
        Formatear el historial de mensajes para Gemini

        Args:
            messages: Lista de mensajes guardados

        Returns:
            Historial formateado para Gemini
        """
        gemini_history = []

        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')

            # Convertir 'user' y 'bot' a los roles esperados por Gemini
            gemini_role = 'user' if role == 'user' else 'model'

            gemini_history.append({
                'role': gemini_role,
                'parts': [{'text': content}]
            })

        return gemini_history

    def get_system_info(self) -> Dict[str, Any]:
        """
        Obtener información del sistema

        Returns:
            Información del modelo y configuración
        """
        try:
            return {
                'model': GEMINI_MODEL,
                'api_configured': bool(GEMINI_API_KEY),
                'status': 'Operativo'
            }
        except Exception as e:
            logger.error(f'Error al obtener info del sistema: {e}')
            return {
                'model': GEMINI_MODEL,
                'api_configured': False,
                'status': 'Error'
            }
