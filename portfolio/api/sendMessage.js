export default async function handler(req, res) {
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
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: `Portfolio Contact: ${message}`
            })
        });

        const result = await response.json();

        if (response.ok && result.ok) {
            res.status(200).json({ success: true, message: 'Message sent successfully' });
        } else {
            res.status(400).json({ error: result.description || 'Failed to send message' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}