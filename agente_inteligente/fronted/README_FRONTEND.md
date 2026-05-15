# Frontend - Asistente de IA

## 📋 Descripción

Frontend moderno y responsivo para el Asistente de IA. Incluye:

- ✅ Interfaz de chat moderna
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Animaciones suaves
- ✅ Gestión de conversaciones
- ✅ Almacenamiento local de IDs de conversación
- ✅ Validaciones en el cliente
- ✅ Manejo de errores amigable

## 📁 Estructura de Archivos

```
fronted/
├── index.html          # Estructura HTML
├── css/
│   └── styles.css      # Estilos completos con responsive design
└── js/
    └── chat.js         # Lógica de la aplicación
```

## 🎨 Características del Diseño

- **Color scheme**: Gradiente púrpura-azul moderno
- **Responsivo**: Se adapta a cualquier resolución
- **Animaciones**: Transiciones suaves y fade-in
- **Accesibilidad**: Estructura semántica correcta
- **Performance**: Código optimizado sin dependencias externas

## 📱 Resoluciones Soportadas

- 📱 Móvil: 320px - 480px
- 📱 Tablet: 481px - 768px
- 💻 Desktop: 769px+

## 🚀 Uso

### Opción 1: Abrir directamente en el navegador

```bash
# Windows
start fronted\index.html

# Linux
xdg-open fronted/index.html

# Mac
open fronted/index.html
```

### Opción 2: Usar un servidor local (Recomendado)

```bash
# Con Python 3
cd fronted
python -m http.server 8000

# Con Node.js (si tienes http-server instalado)
http-server fronted -p 8000

# Con Live Server en VS Code
# Extensión: Live Server
# Haz clic derecho en index.html > Open with Live Server
```

Luego abre `http://localhost:8000` en tu navegador.

## ⚙️ Requisitos

- Backend ejecutándose en `http://localhost:5000`
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado

## 🔧 Configuración

Si necesitas cambiar la URL del backend, edita [js/chat.js](js/chat.js):

```javascript
// Línea 13
const API_BASE_URL = 'http://localhost:5000'; // Cambia aquí
```

## 📡 Integración con Backend

El frontend se comunica con el backend mediante la API REST:

### Envío de Mensajes

```javascript
POST /api/chat
{
  "message": "Tu pregunta aquí",
  "conversation_id": "opcional-id-conversación"
}
```

### Respuesta del Servidor

```json
{
  "success": true,
  "message": "Respuesta de la IA",
  "response": "Respuesta de la IA",
  "conversation_id": "id-generado-o-proporcionado",
  "timestamp": "2024-05-12T10:30:45.123456"
}
```

## 💾 Almacenamiento Local

El frontend guarda el ID de la conversación en localStorage:

```javascript
// Clave
localStorage.getItem('chatAppConversationId')

// Esto permite mantener la conversación entre recargas de página
```

## 🔒 Validaciones del Cliente

- ✓ Mensaje no vacío
- ✓ Longitud máxima 5000 caracteres
- ✓ Validación de respuesta JSON
- ✓ Verificación de conectividad

## 🐛 Solución de Problemas

### Error: "No se pudo conectar con el servidor"

1. Verifica que el backend está ejecutándose:
   ```bash
   python app.py
   ```

2. Verifica la URL en [js/chat.js](js/chat.js):
   ```javascript
   const API_BASE_URL = 'http://localhost:5000';
   ```

3. Verifica que el puerto 5000 está disponible

### Error: "El mensaje es demasiado largo"

El límite es 5000 caracteres. Reduce el tamaño de tu mensaje.

### Chat no guarda la conversación

1. Verifica que JavaScript está habilitado
2. Limpia el localStorage si hay problemas:
   - Abre la consola (F12)
   - Ejecuta: `localStorage.clear()`
   - Recarga la página

## 🎯 Variables de Desarrollo

Accede a funciones de desarrollo en la consola:

```javascript
// Agregar un mensaje manualmente
window.chatApp.addMessage('Hola', 'user');

// Obtener ID de conversación actual
window.chatApp.getCurrentConversationId()

// Verificar conexión con servidor
window.chatApp.checkServerConnection()

// Scroll al final
window.chatApp.scrollToBottom()
```

## 📊 Estructura HTML

```html
<div class="container">
  <header class="header">
    <!-- Título y subtítulo -->
  </header>

  <main class="chat-container">
    <div class="chat-messages" id="chatMessages">
      <!-- Mensajes aquí -->
    </div>

    <footer class="chat-input-area">
      <form id="chatForm">
        <!-- Input de mensaje -->
      </form>
    </footer>
  </main>
</div>

<!-- Spinner de carga -->
<div id="loadingSpinner" class="loading-spinner hidden">
  <div class="spinner"></div>
</div>
```

## 🎨 Personalización de Estilos

### Colores Principales

Edita [css/styles.css](css/styles.css):

```css
:root {
    --primary-color: #4f46e5;      /* Primario */
    --secondary-color: #10b981;    /* Secundario */
    --danger-color: #ef4444;       /* Peligro */
    --bg-light: #f8fafc;           /* Fondo claro */
    --bg-white: #ffffff;           /* Blanco */
    --text-dark: #1e293b;          /* Texto oscuro */
    --text-light: #64748b;         /* Texto claro */
}
```

### Cambiar Gradiente del Header

```css
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* Cambia los colores aquí */
}
```

## 🔍 Console Logging

El frontend registra eventos importantes en la consola:

- Mensajes enviados/recibidos
- Errores de conexión
- Cambios de conversación

Abre la consola del navegador (F12) para ver los logs.

## 📱 Optimizaciones

- **Lazy loading**: Carga recursos bajo demanda
- **Event delegation**: Manejo eficiente de eventos
- **CSS optimizado**: Sin frameworks pesados
- **Sin dependencias**: HTML + CSS + JavaScript vanilla

## 🚀 Mejoras Futuras

- [ ] Historial de conversaciones visibles
- [ ] Búsqueda en conversaciones
- [ ] Exportar conversaciones a PDF
- [ ] Tema oscuro
- [ ] Soporte para adjuntos
- [ ] Reacciones emoji

## 📞 Contacto

Para reportar problemas o sugerencias, contacta al desarrollador.

---

**Versión:** 1.0.0  
**Última actualización:** Mayo 12, 2024
