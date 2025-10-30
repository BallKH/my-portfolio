// Simple Chat System with Session Names
let chatState = {
    visitorName: null,
    sessionId: null,
    chatStarted: false
};

function initializeChat() {
    const chatButton = document.getElementById('chat-button');
    const chatPopup = document.getElementById('chat-popup');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatButton || !chatPopup) return;

    chatButton.addEventListener('click', () => {
        chatPopup.classList.toggle('show');
        if (chatPopup.classList.contains('show') && !chatState.chatStarted) {
            showNameForm();
        }
    });

    chatClose.addEventListener('click', () => {
        chatPopup.classList.remove('show');
    });

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function showNameForm() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <h4>👋 Welcome!</h4>
            <p>Please enter your name:</p>
            <input type="text" id="visitor-name" placeholder="Your name..." style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px;">
            <button onclick="startChat()" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px;">Start Chat</button>
        </div>
    `;
}

function startChat() {
    const nameInput = document.getElementById('visitor-name');
    const name = nameInput.value.trim();
    
    if (!name || name.length < 2) {
        alert('Please enter a valid name (at least 2 characters)');
        return;
    }
    
    chatState.visitorName = name;
    chatState.sessionId = `session_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    chatState.chatStarted = true;
    
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    
    chatMessages.innerHTML = `
        <div class="message bot">Hello ${name}! Session: ${chatState.sessionId}</div>
    `;
    
    chatInput.disabled = false;
    chatSend.disabled = false;
    chatInput.placeholder = 'Type your message...';
    chatInput.focus();
}

async function sendMessage() {
    if (!chatState.chatStarted) return;
    
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = message;
    chatMessages.appendChild(userMsg);
    
    chatInput.value = '';
    chatSend.disabled = true;
    chatSend.textContent = 'Sending...';
    
    try {
        const response = await fetch('/api/chat?action=send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                sessionId: chatState.sessionId,
                visitorName: chatState.visitorName
            })
        });
        
        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Server returned non-JSON:', responseText);
            throw new Error(`Server error: ${responseText.substring(0, 100)}...`);
        }
        
        if (result.success) {
            const botMsg = document.createElement('div');
            botMsg.className = 'message bot';
            botMsg.textContent = '✅ Message sent!';
            chatMessages.appendChild(botMsg);
        } else {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'message bot';
            errorMsg.textContent = `❌ Error: ${result.error}`;
            chatMessages.appendChild(errorMsg);
        }
    } catch (error) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'message bot';
        errorMsg.textContent = `❌ Network error: ${error.message}`;
        chatMessages.appendChild(errorMsg);
    }
    
    chatSend.disabled = false;
    chatSend.textContent = 'Send';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeChat);