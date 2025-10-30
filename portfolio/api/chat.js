// Unified Chat API Handler - With persistent JSON storage
import { promises as fs } from 'fs';

const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';
const CHAT_ID = '489679144';

// PERSISTENT STORAGE: Single JSON file to store all session messages
const MESSAGES_FILE = '/tmp/messages.json';

const messageStore = {
    // PERSISTENCE: Read all messages from JSON file
    async readMessagesFile() {
        try {
            const data = await fs.readFile(MESSAGES_FILE, 'utf8');
            const parsed = JSON.parse(data);
            console.log('✅ Messages file read successfully');
            return parsed;
        } catch (error) {
            // File doesn't exist yet - return empty object
            console.log('📝 Messages file not found, starting fresh');
            return {};
        }
    },
    
    // PERSISTENCE: Write all messages to JSON file
    async writeMessagesFile(allMessages) {
        try {
            await fs.writeFile(MESSAGES_FILE, JSON.stringify(allMessages, null, 2));
            console.log('✅ Messages file written successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to write messages file:', error);
            return false;
        }
    },
    
    // Get messages for a specific session, filtered by lastMessageId
    async getMessages(sessionId, lastMessageId = 0) {
        const allMessages = await this.readMessagesFile();
        const sessionMessages = allMessages[sessionId] || [];
        const filtered = sessionMessages.filter(msg => msg.id > lastMessageId);
        console.log(`📖 Retrieved ${filtered.length} messages for ${sessionId} (after ID ${lastMessageId})`);
        return filtered;
    },
    
    // Add message to a specific session
    async addMessage(sessionId, message) {
        const allMessages = await this.readMessagesFile();
        
        // Initialize session array if it doesn't exist
        if (!allMessages[sessionId]) {
            allMessages[sessionId] = [];
            console.log(`🆕 Created new session: ${sessionId}`);
        }
        
        // Add message to session
        allMessages[sessionId].push(message);
        
        // Write back to file
        const success = await this.writeMessagesFile(allMessages);
        if (success) {
            console.log(`💬 Message added to ${sessionId}: "${message.text}" (${message.sender})`);
        }
        return success;
    },
    
    // Get all sessions
    async getAllSessions() {
        const allMessages = await this.readMessagesFile();
        console.log(`📊 Retrieved ${Object.keys(allMessages).length} sessions`);
        return allMessages;
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

    // Store visitor message first
    if (sessionId && visitorName) {
        await messageStore.addMessage(sessionId, {
            id: Date.now(),
            text: message,
            timestamp: Date.now(),
            sender: 'visitor'
        });
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
        const messages = await messageStore.getMessages(sessionId, parseInt(lastMessageId));
        console.log(`Retrieved ${messages.length} messages for ${sessionId}`);
        return res.status(200).json({ messages, total: messages.length });
    } catch (error) {
        console.error(`Failed to get messages for ${sessionId}:`, error);
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
        const replyMessage = {
            id: messageId,
            text: message,
            timestamp: messageId,
            sender: 'support'
        };
        
        const success = await messageStore.addMessage(sessionId, replyMessage);
        console.log(`Reply added to ${sessionId}: ${message} (success: ${success})`);
        
        if (success) {
            const allMessages = await messageStore.getMessages(sessionId);
            return res.status(200).json({ 
                success: true, 
                sessionId,
                messageId,
                total: allMessages.length
            });
        } else {
            return res.status(500).json({ error: 'Failed to store reply message' });
        }
    } catch (error) {
        console.error(`Failed to add reply to ${sessionId}:`, error);
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
        await messageStore.addMessage(sessionId, {
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
        
        await messageStore.addMessage(sessionId, {
            id: messageId,
            text: text,
            timestamp: messageId,
            sender: 'support'
        });
        
        const allMessages = await messageStore.getMessages(sessionId);
        return res.status(200).json({ 
            success: true, 
            message: 'Reply added',
            total: allMessages.length
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
        const sessions = await messageStore.getAllSessions();
        console.log(`Retrieved ${Object.keys(sessions).length} sessions`);
        return res.status(200).json({ sessions, count: Object.keys(sessions).length });
    } catch (error) {
        console.error('Failed to get all sessions:', error);
        return res.status(500).json({ error: `Failed to get sessions: ${error.message}` });
    }
}