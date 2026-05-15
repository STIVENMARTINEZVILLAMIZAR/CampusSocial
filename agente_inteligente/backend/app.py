"""
Aplicación principal de Flask para el Asistente de IA
"""
import logging
import uuid
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import (
    DEBUG, HOST, PORT, CONVERSATIONS_FILE, DRAFTS_FILE,
    MAX_MESSAGE_LENGTH, ERROR_MESSAGES, N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET
)
from controlador.chat_handler import ChatHandler
from controlador.social_handler import SocialHandler
from utils.storage import JSONStorage
from utils.drafts_storage import DraftsStorage
import requests as http_requests

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inicializar aplicación
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
CORS(app)

# Inicializar manejadores
try:
    chat_handler = ChatHandler()
    storage = JSONStorage(CONVERSATIONS_FILE)
    drafts_storage = DraftsStorage(DRAFTS_FILE)
    social_handler = SocialHandler(chat_handler) if chat_handler else None
    logger.info('Aplicación iniciada correctamente')
except Exception as e:
    logger.error(f'Error al inicializar la aplicación: {e}')
    chat_handler = None
    storage = None
    drafts_storage = None
    social_handler = None


# ==================== RUTAS DE SALUD ==================== 

@app.route('/health', methods=['GET'])
def health_check():
    """Verificar salud del servidor"""
    return jsonify({
        'status': 'ok',
        'service': 'AI Assistant Backend',
        'version': '1.0.0'
    }), 200


@app.route('/api/status', methods=['GET'])
def api_status():
    """Obtener estado de la API"""
    if not chat_handler:
        return jsonify({
            'status': 'error',
            'message': ERROR_MESSAGES['NO_API_KEY']
        }), 500

    stats = storage.get_stats()
    system_info = chat_handler.get_system_info()

    return jsonify({
        'status': 'ok',
        'service': 'AI Assistant Backend',
        'system': system_info,
        'storage': stats
    }), 200


# ==================== RUTAS DE CONVERSACIÓN ==================== 

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Endpoint principal de chat
    
    Body esperado:
    {
        "message": "pregunta del usuario",
        "conversation_id": "id-conversación (opcional)"
    }
    """
    if not chat_handler:
        return jsonify({
            'success': False,
            'error': ERROR_MESSAGES['NO_API_KEY']
        }), 500

    try:
        # Obtener datos del request
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': ERROR_MESSAGES['INVALID_JSON']
            }), 400

        message = data.get('message', '').strip()
        conversation_id = data.get('conversation_id')

        # Validar mensaje
        if not message:
            return jsonify({
                'success': False,
                'error': ERROR_MESSAGES['INVALID_MESSAGE']
            }), 400

        if len(message) > MAX_MESSAGE_LENGTH:
            return jsonify({
                'success': False,
                'error': ERROR_MESSAGES['MESSAGE_TOO_LONG']
            }), 400

        # Crear o recuperar conversación
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            storage.create_conversation(conversation_id, f'Conversación {conversation_id[:8]}')
            logger.info(f'Nueva conversación creada: {conversation_id}')

        conversation = storage.get_conversation(conversation_id)
        if not conversation:
            conversation = storage.create_conversation(conversation_id)

        # Guardar mensaje del usuario
        storage.add_message(conversation_id, 'user', message)
        logger.info(f'Mensaje de usuario guardado: {conversation_id}')

        # Obtener historial de conversación
        messages = storage.get_messages(conversation_id)
        history = chat_handler.format_history_for_gemini(messages[:-1])  # Excluir el último (el que acabamos de agregar)

        # Obtener respuesta de Gemini
        success, response = chat_handler.send_message(message, history)

        if not success:
            return jsonify({
                'success': False,
                'error': response
            }), 500

        # Guardar respuesta del bot
        storage.add_message(conversation_id, 'bot', response)
        logger.info(f'Respuesta guardada: {conversation_id}')

        return jsonify({
            'success': True,
            'message': response,
            'response': response,
            'conversation_id': conversation_id,
            'timestamp': __import__('datetime').datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f'Error en endpoint /api/chat: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500


@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    """Obtener todas las conversaciones"""
    try:
        conversations = storage.get_conversations()
        return jsonify({
            'success': True,
            'conversations': conversations,
            'count': len(conversations)
        }), 200
    except Exception as e:
        logger.error(f'Error al obtener conversaciones: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Error al obtener conversaciones'
        }), 500


@app.route('/api/conversations/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """Obtener una conversación específica"""
    try:
        conversation = storage.get_conversation(conversation_id)

        if not conversation:
            return jsonify({
                'success': False,
                'error': 'Conversación no encontrada'
            }), 404

        return jsonify({
            'success': True,
            'conversation': conversation
        }), 200
    except Exception as e:
        logger.error(f'Error al obtener conversación: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Error al obtener conversación'
        }), 500


@app.route('/api/conversations/<conversation_id>/messages', methods=['GET'])
def get_messages(conversation_id):
    """Obtener mensajes de una conversación"""
    try:
        conversation = storage.get_conversation(conversation_id)

        if not conversation:
            return jsonify({
                'success': False,
                'error': 'Conversación no encontrada'
            }), 404

        messages = storage.get_messages(conversation_id)
        return jsonify({
            'success': True,
            'messages': messages,
            'count': len(messages)
        }), 200
    except Exception as e:
        logger.error(f'Error al obtener mensajes: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Error al obtener mensajes'
        }), 500


@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    """Eliminar una conversación"""
    try:
        success = storage.delete_conversation(conversation_id)

        if not success:
            return jsonify({
                'success': False,
                'error': 'Conversación no encontrada'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Conversación eliminada'
        }), 200
    except Exception as e:
        logger.error(f'Error al eliminar conversación: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Error al eliminar conversación'
        }), 500


@app.route('/api/conversations/<conversation_id>/title', methods=['PUT'])
def update_conversation_title(conversation_id):
    """Actualizar el título de una conversación"""
    try:
        data = request.get_json()

        if not data or 'title' not in data:
            return jsonify({
                'success': False,
                'error': 'Título no proporcionado'
            }), 400

        success = storage.update_conversation_title(conversation_id, data['title'])

        if not success:
            return jsonify({
                'success': False,
                'error': 'Conversación no encontrada'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Título actualizado'
        }), 200
    except Exception as e:
        logger.error(f'Error al actualizar título: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Error al actualizar título'
        }), 500


# ==================== RUTAS SOCIAL / CAMPUS ====================

@app.route('/api/social/generate', methods=['POST'])
def social_generate():
    """Generar borrador de publicación con Gemini"""
    if not social_handler or not drafts_storage:
        return jsonify({'success': False, 'error': ERROR_MESSAGES['NO_API_KEY']}), 500

    data = request.get_json() or {}
    topic = data.get('topic', '').strip()
    tone = data.get('tone', 'profesional')
    platforms = data.get('platforms', ['linkedin'])

    success, result = social_handler.generate_draft(topic, tone, platforms)
    if not success:
        return jsonify({'success': False, 'error': result}), 400

    draft = drafts_storage.create_draft({
        'topic': topic,
        'tone': tone,
        'platforms': platforms,
        'title': result.get('title'),
        'body': result.get('body'),
        'hashtags': result.get('hashtags', []),
        'cta': result.get('cta', ''),
        'linkedin': result.get('linkedin', result.get('body')),
        'instagram': result.get('instagram', ''),
        'image_idea': result.get('image_idea', ''),
        'generate_image': data.get('generate_image', False),
        'send_telegram': data.get('send_telegram', False),
    })

    return jsonify({
        'success': True,
        'draft': draft,
        'preview': {
            'title': draft.get('title'),
            'body': draft.get('linkedin') or draft.get('body'),
            'hashtags': draft.get('hashtags', []),
        }
    }), 200


@app.route('/api/social/drafts', methods=['GET'])
def social_list_drafts():
    if not drafts_storage:
        return jsonify({'success': False, 'error': 'Storage no disponible'}), 500

    status = request.args.get('status')
    status_map = {
        'pendientes': 'pendiente',
        'programados': 'programado',
        'pending': 'pendiente',
        'scheduled': 'programado',
    }
    mapped = status_map.get(status, status) if status else None
    drafts = drafts_storage.list_drafts(mapped)

    return jsonify({'success': True, 'drafts': drafts, 'count': len(drafts)}), 200


@app.route('/api/social/drafts/<draft_id>', methods=['GET', 'DELETE'])
def social_draft_detail(draft_id):
    if not drafts_storage:
        return jsonify({'success': False, 'error': 'Storage no disponible'}), 500

    if request.method == 'DELETE':
        ok = drafts_storage.delete_draft(draft_id)
        if not ok:
            return jsonify({'success': False, 'error': 'Borrador no encontrado'}), 404
        return jsonify({'success': True, 'message': 'Borrador eliminado'}), 200

    draft = drafts_storage.get_draft(draft_id)
    if not draft:
        return jsonify({'success': False, 'error': 'Borrador no encontrado'}), 404
    return jsonify({'success': True, 'draft': draft}), 200


@app.route('/api/social/approve', methods=['POST'])
def social_approve():
    if not drafts_storage:
        return jsonify({'success': False, 'error': 'Storage no disponible'}), 500

    data = request.get_json() or {}
    draft_id = data.get('draft_id')
    if not draft_id:
        return jsonify({'success': False, 'error': 'draft_id requerido'}), 400

    draft = drafts_storage.get_draft(draft_id)
    if not draft:
        return jsonify({'success': False, 'error': 'Borrador no encontrado'}), 404

    approved = data.get('approved', True)
    updates = {
        'approved': approved,
        'edited_body': data.get('edited_body', draft.get('body')),
    }
    if approved:
        updates['status'] = 'aprobado'
    else:
        updates['status'] = 'cancelado'

    updated = drafts_storage.update_draft(draft_id, updates)
    return jsonify({'success': True, 'draft': updated}), 200


@app.route('/api/social/schedule', methods=['POST'])
def social_schedule():
    """Programar publicación vía webhook n8n (si está configurado)"""
    if not drafts_storage:
        return jsonify({'success': False, 'error': 'Storage no disponible'}), 500

    data = request.get_json() or {}
    draft_id = data.get('draft_id')
    schedule_at = data.get('schedule_at')
    platforms = data.get('platforms', ['linkedin'])

    draft = drafts_storage.get_draft(draft_id) if draft_id else None
    if not draft:
        return jsonify({'success': False, 'error': 'Borrador no encontrado'}), 404

    content = data.get('content') or draft.get('edited_body') or draft.get('linkedin') or draft.get('body')
    webhook_url = data.get('n8n_webhook_url') or N8N_WEBHOOK_URL
    webhook_secret = data.get('n8n_webhook_secret') or N8N_WEBHOOK_SECRET

    n8n_response = None
    if webhook_url:
        try:
            payload = {
                'action': 'schedule',
                'draft_id': draft_id,
                'content': content,
                'platforms': platforms,
                'schedule_at': schedule_at,
                'topic': draft.get('topic'),
            }
            headers = {'Content-Type': 'application/json'}
            if webhook_secret:
                headers['X-Campus-Secret'] = webhook_secret

            resp = http_requests.post(webhook_url, json=payload, headers=headers, timeout=60)
            n8n_response = {'status_code': resp.status_code, 'body': resp.text[:500]}
        except Exception as e:
            logger.error(f'Error llamando n8n: {e}')
            return jsonify({'success': False, 'error': f'Error al conectar con n8n: {e}'}), 502

    updated = drafts_storage.update_draft(draft_id, {
        'status': 'programado',
        'schedule_at': schedule_at,
        'platforms': platforms,
        'content': content,
        'n8n_response': n8n_response,
    })

    return jsonify({
        'success': True,
        'draft': updated,
        'n8n': n8n_response,
        'message': 'Publicación programada' if webhook_url else 'Borrador marcado como programado (sin webhook n8n)',
    }), 200


@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify({
        'success': True,
        'gemini_configured': bool(chat_handler),
        'n8n_configured': bool(N8N_WEBHOOK_URL),
        'model': chat_handler.get_system_info()['model'] if chat_handler else None,
    }), 200


# ==================== MANEJO DE ERRORES ==================== 

@app.errorhandler(404)
def not_found(error):
    """Error 404"""
    return jsonify({
        'success': False,
        'error': 'Endpoint no encontrado'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Error 500"""
    logger.error(f'Error interno del servidor: {str(error)}')
    return jsonify({
        'success': False,
        'error': 'Error interno del servidor'
    }), 500


@app.errorhandler(400)
def bad_request(error):
    """Error 400"""
    return jsonify({
        'success': False,
        'error': 'Solicitud inválida'
    }), 400


# ==================== MAIN ==================== 

if __name__ == '__main__':
    logger.info(f'Iniciando servidor en {HOST}:{PORT}')
    logger.info(f'DEBUG: {DEBUG}')
    logger.info(f'Archivo de almacenamiento: {CONVERSATIONS_FILE}')

    try:
        app.run(
            host=HOST,
            port=PORT,
            debug=DEBUG,
            use_reloader=False
        )
    except Exception as e:
        logger.error(f'Error al iniciar servidor: {e}')
