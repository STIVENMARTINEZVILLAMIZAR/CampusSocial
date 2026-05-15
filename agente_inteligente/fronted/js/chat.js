// ==================== CHAT APPLICATION ==================== 

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const loadingSpinner = document.getElementById('loadingSpinner');

// API Configuration
const API_BASE_URL = 'http://localhost:5000';
const STORAGE_KEY = 'chatAppConversationId';

// State
let currentConversationId = localStorage.getItem(STORAGE_KEY);
let messageCount = 0;

// ==================== INITIALIZE ==================== 
document.addEventListener('DOMContentLoaded', () => {
    scrollToBottom();
    checkServerConnection();
});

// ==================== EVENT LISTENERS ==================== 
chatForm.addEventListener('submit', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
    }
});

// ==================== CHECK SERVER CONNECTION ==================== 
async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
            console.warn('Servidor no responde correctamente');
        }
    } catch (error) {
        console.error('No se puede conectar con el servidor:', error);
        addMessage('⚠️ No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose en http://localhost:5000', 'bot');
    }
}

// ==================== HANDLE SEND MESSAGE ==================== 
async function handleSendMessage(e) {
    e.preventDefault();

    const message = userInput.value.trim();

    if (!message) return;

    // Clear input
    userInput.value = '';
    userInput.focus();

    // Show user message
    addMessage(message, 'user');

    // Show loading spinner
    showLoadingSpinner();
    sendBtn.disabled = true;

    try {
        // Send message to backend
        const response = await sendMessageToBackend(message);

        // Hide loading spinner
        hideLoadingSpinner();

        // Show bot response
        addMessage(response, 'bot');
        messageCount++;
    } catch (error) {
        // Hide loading spinner
        hideLoadingSpinner();

        // Show error message
        const errorMessage = error.message || 'Lo siento, hubo un error al procesar tu pregunta. Intenta de nuevo.';
        addMessage(`❌ ${errorMessage}`, 'bot');
        console.error('Error:', error);
    } finally {
        sendBtn.disabled = false;
        scrollToBottom();
    }
}

// ==================== ADD MESSAGE ==================== 
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const paragraphDiv = document.createElement('p');
    paragraphDiv.textContent = text;

    contentDiv.appendChild(paragraphDiv);
    messageDiv.appendChild(contentDiv);

    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    scrollToBottom();
}

// ==================== SEND MESSAGE TO BACKEND ==================== 
async function sendMessageToBackend(message) {
    // Validar mensaje
    if (!message || typeof message !== 'string') {
        throw new Error('Mensaje inválido');
    }

    if (message.length > 5000) {
        throw new Error('El mensaje es demasiado largo (máximo 5000 caracteres)');
    }

    try {
        const payload = {
            message: message,
            conversation_id: currentConversationId
        };

        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            timeout: 60000
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Validar respuesta
        if (!data.success) {
            throw new Error(data.error || 'Error desconocido del servidor');
        }

        // Guardar el ID de conversación
        if (data.conversation_id) {
            currentConversationId = data.conversation_id;
            localStorage.setItem(STORAGE_KEY, currentConversationId);
        }

        // Retornar respuesta
        return data.response || data.message || 'Respuesta vacía del servidor';

    } catch (error) {
        console.error('Error fetching from backend:', error);

        // Manejar tipos de errores específicos
        if (error instanceof TypeError) {
            throw new Error('No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose en http://localhost:5000');
        }

        throw error;
    }
}

// ==================== LOADING SPINNER ==================== 
function showLoadingSpinner() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoadingSpinner() {
    loadingSpinner.classList.add('hidden');
}

// ==================== UTILITY FUNCTIONS ==================== 
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 0);
}

// ==================== EXPORT FUNCTIONS (FOR TESTING) ==================== 
window.chatApp = {
    addMessage,
    sendMessageToBackend,
    scrollToBottom,
    getCurrentConversationId: () => currentConversationId,
    checkServerConnection
};
