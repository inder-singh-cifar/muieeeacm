/**
 * IEEE/ACM AI Chatbot Widget
 * Powered by Claude AI via n8n
 */

// Configuration - UPDATE THIS WITH YOUR N8N WEBHOOK URL
const CHATBOT_CONFIG = {
    // Replace this with your n8n webhook URL after setting up the workflow
    webhookUrl: 'YOUR_N8N_WEBHOOK_URL_HERE',
    // Example: 'https://your-n8n-instance.com/webhook/ieee-chatbot'

    botName: 'IEEE/ACM Assistant',
    welcomeMessage: 'Hi! I\'m the IEEE/ACM chatbot. Ask me about our chapter, events, membership, or anything tech-related!',
    placeholderText: 'Ask me anything...',
    errorMessage: 'Sorry, I\'m having trouble connecting. Please try again later or email us at s1358017@monmouth.edu'
};

class IEEEACMChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.injectStyles();
        this.createChatWidget();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Chatbot Widget Styles */
            .chatbot-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: 'Open Sans', sans-serif;
            }

            .chatbot-button {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 76, 151, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                padding: 10px;
            }

            .chatbot-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(0, 76, 151, 0.6);
            }

            .chatbot-button img {
                width: 50px;
                height: auto;
                filter: brightness(0) invert(1);
            }

            .chatbot-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background-color: #E4405F;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .chatbot-window {
                position: fixed;
                bottom: 100px;
                right: 20px;
                width: 380px;
                max-width: calc(100vw - 40px);
                height: 600px;
                max-height: calc(100vh - 140px);
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                display: flex;
                flex-direction: column;
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
                transition: all 0.3s ease;
            }

            .chatbot-window.open {
                opacity: 1;
                transform: translateY(0);
                pointer-events: all;
            }

            .chatbot-header {
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                color: white;
                padding: 20px;
                border-radius: 16px 16px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chatbot-header-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .chatbot-header-logo {
                width: 32px;
                height: auto;
                filter: brightness(0) invert(1);
            }

            .chatbot-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }

            .chatbot-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .chatbot-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                background: #f8f9fa;
            }

            .chatbot-message {
                display: flex;
                gap: 10px;
                animation: fadeInUp 0.3s ease;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .chatbot-message.user {
                flex-direction: row-reverse;
            }

            .chatbot-message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
            }

            .chatbot-message.bot .chatbot-message-avatar {
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                color: white;
            }

            .chatbot-message.user .chatbot-message-avatar {
                background: #69B3E7;
                color: white;
            }

            .chatbot-message-content {
                max-width: 70%;
                padding: 12px 16px;
                border-radius: 12px;
                line-height: 1.5;
                font-size: 14px;
            }

            .chatbot-message.bot .chatbot-message-content {
                background: white;
                color: #212529;
                border-bottom-left-radius: 4px;
            }

            .chatbot-message.user .chatbot-message-content {
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                color: white;
                border-bottom-right-radius: 4px;
            }

            .chatbot-typing {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: white;
                border-radius: 12px;
                width: fit-content;
            }

            .chatbot-typing-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #004C97;
                animation: typing 1.4s infinite;
            }

            .chatbot-typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .chatbot-typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.7;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }

            .chatbot-input-container {
                padding: 20px;
                background: white;
                border-top: 1px solid #e0e0e0;
                border-radius: 0 0 16px 16px;
            }

            .chatbot-input-wrapper {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .chatbot-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e0e0e0;
                border-radius: 24px;
                font-size: 14px;
                font-family: 'Open Sans', sans-serif;
                outline: none;
                transition: border-color 0.2s ease;
            }

            .chatbot-input:focus {
                border-color: #004C97;
            }

            .chatbot-send-button {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .chatbot-send-button:hover:not(:disabled) {
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(0, 76, 151, 0.3);
            }

            .chatbot-send-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .chatbot-error {
                padding: 12px;
                background: #fee;
                color: #c00;
                border-radius: 8px;
                font-size: 13px;
                text-align: center;
            }

            /* Mobile Responsive */
            @media (max-width: 480px) {
                .chatbot-window {
                    width: calc(100vw - 20px);
                    height: calc(100vh - 120px);
                    right: 10px;
                    bottom: 90px;
                }

                .chatbot-button {
                    width: 60px;
                    height: 60px;
                    bottom: 15px;
                    right: 15px;
                }

                .chatbot-button img {
                    width: 40px;
                }
            }

            /* Scrollbar Styling */
            .chatbot-messages::-webkit-scrollbar {
                width: 6px;
            }

            .chatbot-messages::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            .chatbot-messages::-webkit-scrollbar-thumb {
                background: #004C97;
                border-radius: 3px;
            }

            .chatbot-messages::-webkit-scrollbar-thumb:hover {
                background: #002855;
            }
        `;
        document.head.appendChild(style);
    }

    createChatWidget() {
        const container = document.createElement('div');
        container.className = 'chatbot-container';
        container.innerHTML = `
            <button class="chatbot-button" id="chatbot-toggle" aria-label="Open chatbot">
                <img src="logo_shadow.svg" alt="IEEE/ACM Logo">
                <span class="chatbot-badge">?</span>
            </button>

            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-header-title">
                        <img src="logo_shadow.svg" alt="IEEE/ACM Logo" class="chatbot-header-logo">
                        <h3>${CHATBOT_CONFIG.botName}</h3>
                    </div>
                    <button class="chatbot-close" id="chatbot-close" aria-label="Close chatbot">
                        ×
                    </button>
                </div>

                <div class="chatbot-messages" id="chatbot-messages"></div>

                <div class="chatbot-input-container">
                    <div class="chatbot-input-wrapper">
                        <input
                            type="text"
                            class="chatbot-input"
                            id="chatbot-input"
                            placeholder="${CHATBOT_CONFIG.placeholderText}"
                            aria-label="Chat message input"
                        >
                        <button class="chatbot-send-button" id="chatbot-send" aria-label="Send message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle');
        const closeBtn = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');

        if (this.isOpen) {
            window.classList.add('open');
            document.getElementById('chatbot-input').focus();
        } else {
            window.classList.remove('open');
        }
    }

    addWelcomeMessage() {
        this.addMessage(CHATBOT_CONFIG.welcomeMessage, 'bot');
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;

        const avatar = sender === 'bot' ? '🤖' : '👤';

        messageDiv.innerHTML = `
            <div class="chatbot-message-avatar">${avatar}</div>
            <div class="chatbot-message-content">${this.escapeHtml(text)}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTyping() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="chatbot-message-avatar">🤖</div>
            <div class="chatbot-typing">
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showError(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chatbot-error';
        errorDiv.textContent = message || CHATBOT_CONFIG.errorMessage;
        messagesContainer.appendChild(errorDiv);
        this.scrollToBottom();

        setTimeout(() => errorDiv.remove(), 5000);
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        const message = input.value.trim();

        if (!message) return;

        // Disable input while processing
        input.disabled = true;
        sendBtn.disabled = true;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            // Send to n8n webhook
            const response = await fetch(CHATBOT_CONFIG.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Hide typing indicator
            this.hideTyping();

            // Add bot response
            const botReply = data.reply || data.message || data.text || 'I received your message!';
            this.addMessage(botReply, 'bot');

        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTyping();
            this.showError();
        } finally {
            // Re-enable input
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new IEEEACMChatbot();
    });
} else {
    new IEEEACMChatbot();
}
