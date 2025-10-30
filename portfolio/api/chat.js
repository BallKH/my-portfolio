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
            // File doesn't exist yet - return empty object with metadata
            console.log('📝 Messages file not found, starting fresh');
            return { sessions: {}, lastId: 0 };
        }
    },
    
    // PERSISTENCE: Write all messages to JSON file
    async writeMessagesFile(allData) {
        try {
            await fs.writeFile(MESSAGES_FILE, JSON.stringify(allData, null, 2));
            console.log('✅ Messages file written successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to write messages file:', error);
            return false;
        }
    },
    
    // Generate unique incremental message ID
    async getNextMessageId() {
        const allData = await this.readMessagesFile();
        const nextId = (allData.lastId || 0) + 1;
        return nextId;
    },
    
    // Get messages for a specific session, filtered by lastMessageId
    async getMessages(sessionId, lastMessageId = 0) {
        const allData = await this.readMessagesFile();
        const sessionMessages = allData.sessions[sessionId] || [];
        const filtered = sessionMessages.filter(msg => msg.id > lastMessageId);
        console.log(`📖 Retrieved ${filtered.length} messages for ${sessionId} (after ID ${lastMessageId})`);
        return filtered;
    },
    
    // Add message to a specific session with unique ID
    async addMessage(sessionId, messageText, sender = 'visitor') {
        const allData = await this.readMessagesFile();
        
        // Initialize sessions object if it doesn't exist
        if (!allData.sessions) {
            allData.sessions = {};
        }
        
        // Initialize session array if it doesn't exist
        if (!allData.sessions[sessionId]) {
            allData.sessions[sessionId] = [];
            console.log(`🆕 Created new session: ${sessionId}`);
        }
        
        // Generate unique incremental ID
        const messageId = (allData.lastId || 0) + 1;
        allData.lastId = messageId;
        
        // Create message object
        const message = {
            id: messageId,
            text: messageText,
            timestamp: Date.now(),
            sender: sender
        };
        
        // Add message to session
        allData.sessions[sessionId].push(message);
        
        // Write back to file
        const success = await this.writeMessagesFile(allData);
        if (success) {
            console.log(`💬 Message added to ${sessionId}: "${messageText}" (${sender}) [ID: ${messageId}]`);
        }
        return success ? messageId : false;
    },
    
    // Get all sessions
    async getAllSessions() {
        const allData = await this.readMessagesFile();
        const sessions = allData.sessions || {};
        console.log(`📊 Retrieved ${Object.keys(sessions).length} sessions`);
        return sessions;
    }
};

// Rate limiting store
const rateLimitStore = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 30;
    
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    const record = rateLimitStore.get(ip);
    if (now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (record.count >= maxRequests) {
        return false;
    }
    
    record.count++;
    return true;
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .trim()
                .substring(0, 500);
}

export default async function handler(req, res) {
    // Security headers
    res.setHeader('Access-Control-Allow-Origin', 'https://ponlork-portfolio.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!checkRateLimit(clientIP)) {
        return res.status(429).json({ error: 'Too many requests' });
    }
    
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
    
    // Sanitize inputs
    const cleanMessage = sanitizeInput(message);
    const cleanSessionId = sanitizeInput(sessionId);
    const cleanVisitorName = sanitizeInput(visitorName);
    
    if (!cleanMessage || cleanMessage.length < 1) {
        return res.status(400).json({ error: 'Invalid message content' });
    }

    // Store visitor message first
    if (cleanSessionId && cleanVisitorName) {
        await messageStore.addMessage(cleanSessionId, cleanMessage, 'visitor');
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
    
    // Debug logging for Telegram requests
    console.log(`🔍 Reply request received:`);
    console.log(`📱 SessionId: ${sessionId}`);
    console.log(`💬 Message: ${message}`);
    console.log(`🌐 User-Agent: ${req.headers['user-agent']}`);
    console.log(`📦 Full body:`, req.body);
    
    if (!sessionId || !message) {
        console.error(`❌ Missing required fields - sessionId: ${sessionId}, message: ${message}`);
        return res.status(400).json({ error: 'Session ID and message are required' });
    }

    try {
        // Add reply message with unique incremental ID
        const messageId = await messageStore.addMessage(sessionId, message, 'support');
        
        if (messageId) {
            const allMessages = await messageStore.getMessages(sessionId, 0);
            console.log(`✅ Reply successfully added to ${sessionId} with ID ${messageId}`);
            return res.status(200).json({ 
                success: true, 
                sessionId,
                messageId,
                total: allMessages.length
            });
        } else {
            console.error(`❌ Failed to store reply message for ${sessionId}`);
            return res.status(500).json({ error: 'Failed to store reply message' });
        }
    } catch (error) {
        console.error(`❌ Failed to add reply to ${sessionId}:`, error);
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
        const messageId = await messageStore.addMessage(sessionId, message, 'visitor');

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
        const sessionId = 'default_session';
        const messageId = await messageStore.addMessage(sessionId, text, 'support');
        
        const allMessages = await messageStore.getMessages(sessionId, 0);
        return res.status(200).json({ 
            success: true, 
            message: 'Reply added',
            messageId,
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