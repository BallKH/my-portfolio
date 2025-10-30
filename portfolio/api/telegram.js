// Unified Telegram API Handler
const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';
const CHAT_ID = '489679144';

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
            case 'notify':
                return await handleNotify(req, res);
            case 'webhook':
                return await handleWebhook(req, res);
            case 'debug':
                return await handleDebugWebhook(req, res);
            case 'test':
                return await handleTest(req, res);
            default:
                return res.status(400).json({ error: 'Invalid action parameter' });
        }
    } catch (error) {
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
}

async function handleNotify(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId, visitorName, message } = req.body;

    if (!sessionId || !visitorName || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const notification = (
            `📱 Session: ${sessionId}\n` +
            `💭 Message: ${message}`
        );

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: notification
            })
        });

        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to send Telegram notification' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

async function handleWebhook(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const text = message.text;
            
            // Echo the message back
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `Echo: ${text}`
                })
            });
        }
        
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: `Webhook error: ${error.message}` });
    }
}

async function handleDebugWebhook(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        
        // Log the webhook data for debugging
        console.log('Webhook received:', JSON.stringify(update, null, 2));
        
        return res.status(200).json({ 
            success: true, 
            received: update,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({ error: `Debug webhook error: ${error.message}` });
    }
}

async function handleTest(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Test Telegram bot connection
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
        const result = await response.json();
        
        if (result.ok) {
            return res.status(200).json({ 
                success: true, 
                bot: result.result,
                chat_id: CHAT_ID
            });
        } else {
            return res.status(400).json({ error: 'Bot test failed', details: result });
        }
    } catch (error) {
        return res.status(500).json({ error: `Test error: ${error.message}` });
    }
}