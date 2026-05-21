"""
Generación de contenido social con Gemini (Campus Lands)
"""
import json
import logging
import re
from typing import Any

from controlador.chat_handler import ChatHandler

logger = logging.getLogger(__name__)


class SocialHandler:
    def __init__(self, chat_handler: ChatHandler):
        self.chat = chat_handler

    def _parse_json_response(self, text: str) -> dict[str, Any]:
        cleaned = text.strip()
        if cleaned.startswith('```'):
            cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
            cleaned = re.sub(r'\s*```$', '', cleaned)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r'\{[\s\S]*\}', cleaned)
            if match:
                return json.loads(match.group())
            raise ValueError('No se pudo parsear JSON de la respuesta de Gemini')

    def build_generate_prompt(self, topic: str, tone: str, platforms: list[str]) -> str:
        networks = ', '.join(platforms) if platforms else 'linkedin'
        return f"""Eres el agente de marketing digital de Campus Lands (Colombia), institución de educación tecnológica.

Genera contenido para publicar en: {networks}.
Tema: {topic}
Tono: {tone}

Responde ÚNICAMENTE con un JSON válido (sin markdown) con esta estructura exacta:
{{
  "title": "título corto",
  "body": "texto completo del post con emojis moderados y saltos de línea",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "cta": "llamada a la acción",
  "linkedin": "versión optimizada para LinkedIn",
  "instagram": "versión más corta para Instagram",
  "image_idea": "descripción breve para generar imagen con IA"
}}"""

    def generate_draft(self, topic: str, tone: str, platforms: list[str]) -> tuple[bool, dict | str]:
        if not topic or not topic.strip():
            return False, 'El tema es obligatorio'

        prompt = self.build_generate_prompt(topic.strip(), tone or 'profesional', platforms or ['linkedin'])
        success, response = self.chat.send_message(prompt)

        if not success:
            return False, response

        try:
            parsed = self._parse_json_response(response)
            required = ['title', 'body', 'hashtags']
            if not all(parsed.get(k) for k in required):
                return False, 'La respuesta de IA no incluyó todos los campos requeridos'
            return True, parsed
        except (ValueError, json.JSONDecodeError) as e:
            logger.error(f'Error parseando JSON social: {e}')
            return False, 'Error al procesar la respuesta de Gemini'
