// Web Portfolio Chat Integration
// Add this to your web portfolio to enable Telegram bot replies

class PortfolioChat {
    constructor() {
        this.socket = null;
        this.sessionId = this.generateSessionId();
        this.isConnected = false;
        this.init();
    }

    generateSessionId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        this.createChatWidget();
        this.connectToSupport();
    }

    createChatWidget() {
        // Create chat widget HTML
        const chatHTML = `
            <div id="portfolio-chat" class="chat-widget">
                <div class="chat-header" onclick="portfolioChat.toggleChat()">
                    <span>💬 Support Chat</span>
                    <span id="chat-status" class="status-offline">Offline</span>
                </div>
                <div class="chat-body" id="chat-body" style="display: none;">
                    <div class="chat-messages" id="chat-messages"></div>
                    <div class="chat-input">
                        <input type="text" id="message-input" placeholder="Type your message..." onkeypress="portfolioChat.handleKeyPress(event)">
                        <button onclick="portfolioChat.sendMessage()">Send</button>
                    </div>
                    <div class="session-info">Session: <span id="session-display">${this.sessionId}</span></div>
                </div>
            </div>
        `;

        // Add CSS
        const chatCSS = `
            <style>
                .chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 350px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                    z-index: 1000;
                    font-family: Arial, sans-serif;
                }
                .chat-header {
                    background: #007bff;
                    color: white;
                    padding: 15px;
                    border-radius: 10px 10px 0 0;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .chat-body {
                    height: 400px;
                    display: flex;
                    flex-direction: column;
                }
                .chat-messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    max-height: 300px;
                }
                .message {
                    margin-bottom: 10px;
                    padding: 8px 12px;
                    border-radius: 15px;
                    max-width: 80%;
                }
                .message.visitor {
                    background: #007bff;
                    color: white;
                    margin-left: auto;
                    text-align: right;
                }
                .message.support {
                    background: #f1f1f1;
                    color: #333;
                }
                .chat-input {
                    display: flex;
                    padding: 10px;
                    border-top: 1px solid #eee;
                }
                .chat-input input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    margin-right: 5px;
                }
                .chat-input button {
                    padding: 8px 15px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .session-info {
                    padding: 5px 10px;
                    font-size: 11px;
                    color: #666;
                    background: #f8f9fa;
                    text-align: center;
                }
                .status-online { color: #28a745; }
                .status-offline { color: #dc3545; }
            </style>
        `;

        // Add to page
        document.head.insertAdjacentHTML('beforeend', chatCSS);
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    connectToSupport() {
        // Connect to WebSocket backend
        this.socket = io('http://localhost:5000');

        this.socket.on('connect', () => {
            console.log('Connected to support system');
            this.socket.emit('join_session', {
                session_id: this.sessionId,
                visitor_name: 'Portfolio Visitor'
            });
        });

        this.socket.on('session_joined', (data) => {
            this.isConnected = true;
            document.getElementById('chat-status').textContent = 'Online';
            document.getElementById('chat-status').className = 'status-online';
            this.addMessage('system', 'Connected to support. You can now chat with our team.');
        });

        // Receive messages from Telegram bot
        this.socket.on('support_message', (data) => {
            this.addMessage('support', data.message);
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            document.getElementById('chat-status').textContent = 'Offline';
            document.getElementById('chat-status').className = 'status-offline';
        });
    }

    toggleChat() {
        const chatBody = document.getElementById('chat-body');
        chatBody.style.display = chatBody.style.display === 'none' ? 'block' : 'none';
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (message && this.isConnected) {
            this.addMessage('visitor', message);
            
            this.socket.emit('visitor_message', {
                session_id: this.sessionId,
                message: message
            });
            
            input.value = '';
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    addMessage(sender, text) {
        const messagesDiv = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

// Initialize chat when page loads
let portfolioChat;
document.addEventListener('DOMContentLoaded', function() {
    portfolioChat = new PortfolioChat();
});

// Make sure Socket.IO is loaded
if (typeof io === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.js';
    document.head.appendChild(script);
}