// Unified Chat API Handler - Fixed import issue
const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';
const CHAT_ID = '489679144';

// Session-based message storage
if (!global.sessionMessages) {
    global.sessionMessages = {};
}

const messageStore = {
    addMessage(sessionId, message) {
        if (!global.sessionMessages[sessionId]) {
            global.sessionMessages[sessionId] = [];
        }
        global.sessionMessages[sessionId].push(message);
    },
    
    getMessages(sessionId, lastMessageId = 0) {
        if (!global.sessionMessages[sessionId]) {
            return [];
        }
        return global.sessionMessages[sessionId].filter(msg => msg.id > lastMessageId);
    },
    
    getAllSessions() {
        return global.sessionMessages;
    }
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'send':
                return await handleSendMessage(req, res);
            case 'get':
                return await handleGetMessages(req, res);
            case 'reply':
                return await handleManualReply(req, res);
            case 'simple':
                return await handleSimpleReply(req, res);
            case 'add':
                return await handleAddReply(req, res);
            case 'sessions':
                return await handleSessions(req, res);
            default:
                return res.status(400).json({ error: 'Invalid action parameter' });
        }
    } catch (error) {
        console.error('Chat API Error:', error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Server error: ${error.message}`, stack: error.stack });
    }
}

async function handleSendMessage(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, sessionId, visitorName } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Create session-based notification
    const notification = sessionId && visitorName ? 
        `💬 New message from ${visitorName}\n📱 Session: ${sessionId}\n💭 Message: ${message}\n\nReply with: /reply ${sessionId} <your_message>` :
        `Portfolio Contact: ${message}`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: notification
            })
        });

        const result = await response.json();

        if (response.ok && result.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ error: result.description || 'Failed to send message' });
        }
    } catch (error) {
        console.error('Send Message Error:', error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}

async function handleGetMessages(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId, lastMessageId = 0 } = req.query;
    
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        const messages = messageStore.getMessages(sessionId, parseInt(lastMessageId));
        return res.status(200).json({ messages, total: messages.length });
    } catch (error) {
        return res.status(500).json({ error: `Failed to get messages: ${error.message}` });
    }
}

async function handleManualReply(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
        return res.status(400).json({ error: 'Session ID and message are required' });
    }

    try {
        const messageId = Date.now();
        messageStore.addMessage(sessionId, {
            id: messageId,
            text: message,
            timestamp: messageId,
            sender: 'support'
        });

        return res.status(200).json({ 
            success: true, 
            sessionId,
            messageId,
            total: messageStore.getMessages(sessionId).length
        });
    } catch (error) {
        return res.status(500).json({ error: `Failed to add reply: ${error.message}` });
    }
}

async function handleSimpleReply(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const sessionId = `session_${Date.now()}`;
    const messageId = Date.now();
    
    try {
        messageStore.addMessage(sessionId, {
            id: messageId,
            text: message,
            timestamp: messageId,
            sender: 'visitor'
        });

        return res.status(200).json({ 
            success: true, 
            sessionId,
            messageId 
        });
    } catch (error) {
        return res.status(500).json({ error: `Failed to add message: ${error.message}` });
    }
}

async function handleAddReply(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const messageId = Date.now();
        const sessionId = 'default_session';
        
        messageStore.addMessage(sessionId, {
            id: messageId,
            text: text,
            timestamp: messageId,
            sender: 'support'
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Reply added',
            total: messageStore.getMessages(sessionId).length
        });
    } catch (error) {
        return res.status(500).json({ error: `Failed to add reply: ${error.message}` });
    }
}

async function handleSessions(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sessions = messageStore.getAllSessions();
        return res.status(200).json({ sessions, count: Object.keys(sessions).length });
    } catch (error) {
        return res.status(500).json({ error: `Failed to get sessions: ${error.message}` });
    }
}