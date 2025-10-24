export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';
    const CHAT_ID = '489679144';

    try {
        console.log('Sending to Telegram:', message);
        
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: `Portfolio Contact: ${message}`
            })
        });

        const result = await response.json();
        console.log('Telegram response:', result);

        if (response.ok && result.ok) {
            return res.status(200).json({ success: true, message: 'Message sent successfully' });
        } else {
            return res.status(400).json({ error: result.description || 'Failed to send message' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}