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
            <input type="text" id="visitor-name" placeholder="Your name..." style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px;" onkeypress="if(event.key==='Enter') startChat()">
            <button onclick="startChat()" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px;">Start Chat</button>
        </div>
    `;
}

async function startChat() {
    const nameInput = document.getElementById('visitor-name');
    const name = nameInput.value.trim();
    
    if (!name || name.length < 2) {
        alert('Please enter a valid name (at least 2 characters)');
        return;
    }
    
    chatState.visitorName = name;
    const today = new Date();
    const dateStr = today.getDate().toString().padStart(2, '0') + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getFullYear();
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    chatState.sessionId = `${cleanName}_${dateStr}`;
    chatState.chatStarted = true;
    
    console.log(`Created session: ${chatState.sessionId} for visitor: ${name}`);
    
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    
    chatMessages.innerHTML = `
        <div class="message bot">Hello ${name}! Please write in the chat to me.</div>
    `;
    
    chatInput.disabled = false;
    chatSend.disabled = false;
    chatInput.placeholder = 'Type your message...';
    chatInput.focus();
    
    // Reset polling state, load existing messages, and start polling
    lastMessageId = 0;
    displayedMessageIds.clear();
    await loadExistingMessages();
    startPollingForReplies();
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
        
        if (!result.success) {
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

let lastMessageId = 0;
let pollingInterval;
let displayedMessageIds = new Set();

// Load existing messages when chat starts
async function loadExistingMessages() {
    if (!chatState.sessionId) return;
    
    try {
        console.log(`Loading existing messages for ${chatState.sessionId}`);
        const response = await fetch(`/api/chat?action=get&sessionId=${chatState.sessionId}&lastMessageId=0`);
        const result = await response.json();
        
        console.log(`Loaded messages:`, result);
        
        if (result.messages && result.messages.length > 0) {
            const chatMessages = document.getElementById('chat-messages');
            
            result.messages.forEach(msg => {
                if (!displayedMessageIds.has(msg.id)) {
                    console.log(`Displaying message: ${msg.text} (${msg.sender})`);
                    const msgDiv = document.createElement('div');
                    msgDiv.className = msg.sender === 'support' ? 'message bot' : 'message user';
                    msgDiv.textContent = msg.text;
                    chatMessages.appendChild(msgDiv);
                    displayedMessageIds.add(msg.id);
                    lastMessageId = Math.max(lastMessageId, msg.id);
                }
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            console.log('No existing messages found');
        }
    } catch (error) {
        console.error('Error loading existing messages:', error);
    }
}

function startPollingForReplies() {
    if (pollingInterval) clearInterval(pollingInterval);
    
    pollingInterval = setInterval(async () => {
        if (!chatState.sessionId) return;
        
        try {
            const response = await fetch(`/api/chat?action=get&sessionId=${chatState.sessionId}&lastMessageId=${lastMessageId}`);
            const result = await response.json();
            
            if (result.messages && result.messages.length > 0) {
                const chatMessages = document.getElementById('chat-messages');
                console.log(`Polling found ${result.messages.length} new messages`);
                
                result.messages.forEach(msg => {
                    if (msg.sender === 'support' && !displayedMessageIds.has(msg.id)) {
                        console.log(`New support message: ${msg.text}`);
                        const msgDiv = document.createElement('div');
                        msgDiv.className = 'message bot';
                        msgDiv.textContent = msg.text;
                        chatMessages.appendChild(msgDiv);
                        displayedMessageIds.add(msg.id);
                        lastMessageId = Math.max(lastMessageId, msg.id);
                    }
                });
                
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 3000); // Poll every 3 seconds
}

// Colorful Text Effect
function wrapLetters(element) {
    const text = element.textContent;
    element.innerHTML = '';
    
    for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = letter === ' ' ? '\u00A0' : letter;
        element.appendChild(span);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    
    // Add colorful effect to first title-line
    const firstTitleLine = document.querySelector('.hero-title .title-line');
    if (firstTitleLine) {
        firstTitleLine.classList.add('colorful-text');
        wrapLetters(firstTitleLine);
    }
});