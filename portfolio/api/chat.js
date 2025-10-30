// Unified Chat API Handler - With persistent storage
import { promises as fs } from 'fs';
import path from 'path';

const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';
const CHAT_ID = '489679144';

// Persistent storage using JSON files in /tmp directory
const STORAGE_DIR = '/tmp/chat-sessions';

// Ensure storage directory exists
async function ensureStorageDir() {
    try {
        await fs.mkdir(STORAGE_DIR, { recursive: true });
    } catch (error) {
        console.log('Storage dir already exists or created');
    }
}

const messageStore = {
    // Read messages from JSON file for a session
    async getMessages(sessionId, lastMessageId = 0) {
        try {
            const filePath = path.join(STORAGE_DIR, `${sessionId}.json`);
            const data = await fs.readFile(filePath, 'utf8');
            const messages = JSON.parse(data);
            return messages.filter(msg => msg.id > lastMessageId);
        } catch (error) {
            // File doesn't exist or is empty - return empty array
            console.log(`No messages found for session ${sessionId}:`, error.message);
            return [];
        }
    },
    
    // Add message to JSON file for a session
    async addMessage(sessionId, message) {
        try {
            await ensureStorageDir();
            const filePath = path.join(STORAGE_DIR, `${sessionId}.json`);
            
            // Read existing messages
            let messages = [];
            try {
                const data = await fs.readFile(filePath, 'utf8');
                messages = JSON.parse(data);
            } catch (error) {
                // File doesn't exist, start with empty array
                console.log(`Creating new session file for ${sessionId}`);
            }
            
            // Add new message
            messages.push(message);
            
            // Write back to file
            await fs.writeFile(filePath, JSON.stringify(messages, null, 2));
            console.log(`Message added to ${sessionId}:`, message.text);
            
            return true;
        } catch (error) {
            console.error(`Failed to add message to ${sessionId}:`, error);
            return false;
        }
    },
    
    // Get all sessions (list all JSON files)
    async getAllSessions() {
        try {
            await ensureStorageDir();
            const files = await fs.readdir(STORAGE_DIR);
            const sessions = {};
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const sessionId = file.replace('.json', '');
                    const messages = await this.getMessages(sessionId);
                    sessions[sessionId] = messages;
                }
            }
            
            return sessions;
        } catch (error) {
            console.error('Failed to get all sessions:', error);
            return {};
        }
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