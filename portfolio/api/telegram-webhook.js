// Telegram Webhook Handler - Runs on Vercel 24/7
import { promises as fs } from 'fs';

const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';
const MESSAGES_FILE = '/tmp/messages.json';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        console.log('Telegram webhook received:', JSON.stringify(update, null, 2));
        
        if (update.message && update.message.text) {
            const text = update.message.text;
            const chatId = update.message.chat.id;
            
            // Handle /reply command
            if (text.startsWith('/reply ')) {
                const parts = text.split(' ');
                if (parts.length >= 3) {
                    const sessionId = parts[1];
                    const message = parts.slice(2).join(' ');
                    
                    console.log(`Processing reply: ${sessionId} -> ${message}`);
                    
                    // Add reply to messages
                    const success = await addReplyMessage(sessionId, message);
                    
                    if (success) {
                        await sendTelegramMessage(chatId, `✅ Reply sent to ${sessionId}!\n💬 Message: "${message}"`);
                    } else {
                        await sendTelegramMessage(chatId, `❌ Failed to send reply to ${sessionId}`);
                    }
                }
            }
            
            // Handle /start command
            else if (text === '/start') {
                await sendTelegramMessage(chatId, 
                    '🤖 Portfolio Chat Bot\n\n' +
                    'Commands:\n' +
                    '📝 /reply <session_id> <message> - Reply to visitor\n\n' +
                    'Example:\n' +
                    '/reply session_john Hi there! How can I help?'
                );
            }
        }
        
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function addReplyMessage(sessionId, messageText) {
    try {
        // Read existing messages
        let allData = { sessions: {}, lastId: 0 };
        try {
            const data = await fs.readFile(MESSAGES_FILE, 'utf8');
            allData = JSON.parse(data);
        } catch (e) {
            console.log('Creating new messages file');
        }
        
        // Initialize session if needed
        if (!allData.sessions) allData.sessions = {};
        if (!allData.sessions[sessionId]) {
            allData.sessions[sessionId] = [];
        }
        
        // Add message with incremental ID
        const messageId = (allData.lastId || 0) + 1;
        allData.lastId = messageId;
        
        const message = {
            id: messageId,
            text: messageText,
            timestamp: Date.now(),
            sender: 'support'
        };
        
        allData.sessions[sessionId].push(message);
        
        // Write back to file
        await fs.writeFile(MESSAGES_FILE, JSON.stringify(allData, null, 2));
        console.log(`💬 Telegram reply added to ${sessionId}: "${messageText}" [ID: ${messageId}]`);
        
        return true;
    } catch (error) {
        console.error('Failed to add reply:', error);
        return false;
    }
}

async function sendTelegramMessage(chatId, text) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text })
        });
        
        if (!response.ok) {
            console.error('Telegram API error:', await response.text());
        }
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
    }
}