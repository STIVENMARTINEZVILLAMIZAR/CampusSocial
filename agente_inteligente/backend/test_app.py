"""
Suite de pruebas para la aplicación
Prueba todos los componentes antes de ejecutar
"""
import sys
import os
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def test_config():
    """Prueba la configuración"""
    print("\n" + "="*60)
    print("PRUEBA 1: CONFIGURACIÓN")
    print("="*60)

    try:
        from config import (
            GEMINI_API_KEY, GEMINI_MODEL, CONVERSATIONS_FILE,
            MAX_MESSAGE_LENGTH, ERROR_MESSAGES
        )

        print("✓ Configuración cargada correctamente")
        print(f"  - Modelo: {GEMINI_MODEL}")
        print(f"  - Archivo de conversaciones: {CONVERSATIONS_FILE}")
        print(f"  - Longitud máxima de mensaje: {MAX_MESSAGE_LENGTH}")
        print(f"  - API Key configurada: {'Sí' if GEMINI_API_KEY else 'No'}")

        if not GEMINI_API_KEY:
            print("⚠ Advertencia: API Key de Gemini no está configurada")
            return False

        return True
    except Exception as e:
        print(f"✗ Error al cargar configuración: {e}")
        return False


def test_storage():
    """Prueba el almacenamiento JSON"""
    print("\n" + "="*60)
    print("PRUEBA 2: ALMACENAMIENTO JSON")
    print("="*60)

    try:
        from config import CONVERSATIONS_FILE
        from utils.storage import JSONStorage

        storage = JSONStorage(CONVERSATIONS_FILE)
        print("✓ Almacenamiento JSON inicializado")

        # Crear conversación
        conv_id = "test-conv-123"
        storage.create_conversation(conv_id, "Conversación de Prueba")
        print(f"✓ Conversación creada: {conv_id}")

        # Agregar mensajes
        storage.add_message(conv_id, "user", "¿Hola, cómo estás?")
        storage.add_message(conv_id, "bot", "¡Hola! Estoy muy bien, gracias por preguntar.")
        print("✓ Mensajes agregados exitosamente")

        # Recuperar mensajes
        messages = storage.get_messages(conv_id)
        print(f"✓ Mensajes recuperados: {len(messages)}")
        for msg in messages:
            print(f"  - [{msg['role'].upper()}]: {msg['content'][:50]}...")

        # Obtener estadísticas
        stats = storage.get_stats()
        print(f"✓ Estadísticas:")
        print(f"  - Total conversaciones: {stats['total_conversations']}")
        print(f"  - Total mensajes: {stats['total_messages']}")
        print(f"  - Tamaño archivo: {stats['file_size_kb']:.2f} KB")

        # Limpiar (eliminar conversación de prueba)
        storage.delete_conversation(conv_id)
        print("✓ Conversación de prueba eliminada")

        return True
    except Exception as e:
        print(f"✗ Error en almacenamiento: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_chat_handler():
    """Prueba el manejador de chat"""
    print("\n" + "="*60)
    print("PRUEBA 3: MANEJADOR DE CHAT")
    print("="*60)

    try:
        from controlador.chat_handler import ChatHandler

        handler = ChatHandler()
        print("✓ Manejador de chat inicializado")

        # Validar mensaje
        valid, error = handler.validate_message("¿Hola?")
        if valid:
            print("✓ Validación de mensaje: Mensaje válido")
        else:
            print(f"✗ Validación falló: {error}")
            return False

        # Validar mensaje vacío
        valid, error = handler.validate_message("")
        if not valid:
            print("✓ Validación de mensaje: Rechaza mensajes vacíos")
        else:
            print("✗ La validación no rechazó un mensaje vacío")
            return False

        # Validar mensaje muy largo
        valid, error = handler.validate_message("a" * 10000)
        if not valid:
            print("✓ Validación de mensaje: Rechaza mensajes muy largos")
        else:
            print("✗ La validación no rechazó un mensaje muy largo")
            return False

        # Obtener información del sistema
        info = handler.get_system_info()
        print(f"✓ Información del sistema:")
        print(f"  - Modelo: {info['model']}")
        print(f"  - API Configurada: {info['api_configured']}")
        print(f"  - Estado: {info['status']}")

        return True
    except Exception as e:
        print(f"✗ Error en manejador de chat: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_flask_app():
    """Prueba la aplicación Flask"""
    print("\n" + "="*60)
    print("PRUEBA 4: APLICACIÓN FLASK")
    print("="*60)

    try:
        from app import app

        print("✓ Aplicación Flask creada correctamente")

        # Verificar que la app está configurada
        with app.test_client() as client:
            # Test health endpoint
            response = client.get('/health')
            if response.status_code == 200:
                print("✓ Endpoint /health respondió correctamente")
            else:
                print(f"✗ Endpoint /health retornó status {response.status_code}")
                return False

            # Test status endpoint
            response = client.get('/api/status')
            if response.status_code == 200:
                print("✓ Endpoint /api/status respondió correctamente")
                data = response.get_json()
                print(f"  - Servicio: {data['service']}")
            else:
                print(f"✗ Endpoint /api/status retornó status {response.status_code}")
                return False

            # Test 404
            response = client.get('/endpoint-inexistente')
            if response.status_code == 404:
                print("✓ Manejo de error 404 funcionando")
            else:
                print(f"✗ Error 404 no manejado correctamente")
                return False

        return True
    except Exception as e:
        print(f"✗ Error en aplicación Flask: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_dependencies():
    """Prueba que todas las dependencias están instaladas"""
    print("\n" + "="*60)
    print("PRUEBA 0: DEPENDENCIAS")
    print("="*60)

    dependencies = [
        'flask',
        'flask_cors',
        'dotenv',
        'google.generativeai'
    ]

    all_installed = True
    for dep in dependencies:
        try:
            __import__(dep)
            print(f"✓ {dep} está instalado")
        except ImportError:
            print(f"✗ {dep} NO está instalado")
            all_installed = False

    return all_installed


def run_all_tests():
    """Ejecutar todas las pruebas"""
    print("\n" + "="*70)
    print(" "*15 + "SUITE DE PRUEBAS - ASISTENTE DE IA")
    print("="*70)

    results = {
        'Dependencias': test_dependencies(),
        'Configuración': test_config(),
        'Almacenamiento JSON': test_storage(),
        'Manejador de Chat': test_chat_handler(),
        'Aplicación Flask': test_flask_app(),
    }

    # Resumen
    print("\n" + "="*70)
    print("RESUMEN DE PRUEBAS")
    print("="*70)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        status = "✓ PASÓ" if result else "✗ FALLÓ"
        print(f"{test_name}: {status}")

    print("-" * 70)
    print(f"Total: {passed}/{total} pruebas pasadas")

    if passed == total:
        print("\n✓ ¡TODAS LAS PRUEBAS PASARON! La aplicación está lista.")
        return True
    else:
        print(f"\n✗ {total - passed} prueba(s) fallaron. Revisa los errores arriba.")
        return False


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
