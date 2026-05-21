"""
Utilidades para almacenamiento de datos en JSON
"""
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class JSONStorage:
    """Gestor de almacenamiento en JSON"""

    def __init__(self, file_path: Path):
        """
        Inicializar el almacenamiento

        Args:
            file_path: Ruta al archivo JSON
        """
        self.file_path = file_path
        self._ensure_file_exists()

    def _ensure_file_exists(self) -> None:
        """Crear el archivo JSON si no existe"""
        if not self.file_path.exists():
            self._write_file({'conversations': []})
            logger.info(f'Archivo JSON creado: {self.file_path}')

    def _read_file(self) -> Dict[str, Any]:
        """
        Leer el archivo JSON

        Returns:
            Diccionario con los datos
        """
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data
        except json.JSONDecodeError as e:
            logger.error(f'Error al decodificar JSON: {e}')
            return {'conversations': []}
        except Exception as e:
            logger.error(f'Error al leer archivo: {e}')
            return {'conversations': []}

    def _write_file(self, data: Dict[str, Any]) -> bool:
        """
        Escribir en el archivo JSON

        Args:
            data: Datos a escribir

        Returns:
            True si fue exitoso, False en caso contrario
        """
        try:
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f'Datos guardados en {self.file_path}')
            return True
        except Exception as e:
            logger.error(f'Error al escribir archivo: {e}')
            return False

    def get_conversations(self) -> List[Dict[str, Any]]:
        """
        Obtener todas las conversaciones

        Returns:
            Lista de conversaciones
        """
        data = self._read_file()
        return data.get('conversations', [])

    def get_conversation(self, conversation_id: str) -> Dict[str, Any] | None:
        """
        Obtener una conversación específica

        Args:
            conversation_id: ID de la conversación

        Returns:
            Conversación o None si no existe
        """
        conversations = self.get_conversations()
        for conv in conversations:
            if conv.get('id') == conversation_id:
                return conv
        return None

    def create_conversation(self, conversation_id: str, title: str = 'Nueva Conversación') -> Dict[str, Any]:
        """
        Crear una nueva conversación

        Args:
            conversation_id: ID de la conversación
            title: Título de la conversación

        Returns:
            Conversación creada
        """
        conversation = {
            'id': conversation_id,
            'title': title,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'messages': []
        }

        data = self._read_file()
        data['conversations'].append(conversation)
        self._write_file(data)

        logger.info(f'Conversación creada: {conversation_id}')
        return conversation

    def add_message(self, conversation_id: str, role: str, content: str) -> bool:
        """
        Agregar un mensaje a una conversación

        Args:
            conversation_id: ID de la conversación
            role: Rol del mensaje ('user' o 'bot')
            content: Contenido del mensaje

        Returns:
            True si fue exitoso
        """
        # Validar rol
        if role not in ['user', 'bot']:
            logger.error(f'Rol inválido: {role}')
            return False

        # Validar contenido
        if not content or not isinstance(content, str):
            logger.error('Contenido de mensaje inválido')
            return False

        data = self._read_file()
        conversations = data.get('conversations', [])

        # Buscar y actualizar conversación
        for conv in conversations:
            if conv.get('id') == conversation_id:
                message = {
                    'role': role,
                    'content': content,
                    'timestamp': datetime.now().isoformat()
                }
                conv['messages'].append(message)
                conv['updated_at'] = datetime.now().isoformat()

                self._write_file(data)
                logger.info(f'Mensaje agregado a conversación {conversation_id}')
                return True

        logger.error(f'Conversación no encontrada: {conversation_id}')
        return False

    def get_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        """
        Obtener todos los mensajes de una conversación

        Args:
            conversation_id: ID de la conversación

        Returns:
            Lista de mensajes
        """
        conversation = self.get_conversation(conversation_id)
        if conversation:
            return conversation.get('messages', [])
        return []

    def delete_conversation(self, conversation_id: str) -> bool:
        """
        Eliminar una conversación

        Args:
            conversation_id: ID de la conversación

        Returns:
            True si fue exitoso
        """
        data = self._read_file()
        conversations = data.get('conversations', [])

        # Filtrar la conversación a eliminar
        new_conversations = [c for c in conversations if c.get('id') != conversation_id]

        if len(new_conversations) < len(conversations):
            data['conversations'] = new_conversations
            self._write_file(data)
            logger.info(f'Conversación eliminada: {conversation_id}')
            return True

        logger.error(f'Conversación no encontrada: {conversation_id}')
        return False

    def update_conversation_title(self, conversation_id: str, title: str) -> bool:
        """
        Actualizar el título de una conversación

        Args:
            conversation_id: ID de la conversación
            title: Nuevo título

        Returns:
            True si fue exitoso
        """
        data = self._read_file()
        conversations = data.get('conversations', [])

        for conv in conversations:
            if conv.get('id') == conversation_id:
                conv['title'] = title
                conv['updated_at'] = datetime.now().isoformat()
                self._write_file(data)
                logger.info(f'Título actualizado: {conversation_id}')
                return True

        return False

    def get_stats(self) -> Dict[str, Any]:
        """
        Obtener estadísticas de almacenamiento

        Returns:
            Diccionario con estadísticas
        """
        conversations = self.get_conversations()
        total_messages = sum(len(c.get('messages', [])) for c in conversations)

        return {
            'total_conversations': len(conversations),
            'total_messages': total_messages,
            'file_size_kb': os.path.getsize(self.file_path) / 1024 if self.file_path.exists() else 0
        }
