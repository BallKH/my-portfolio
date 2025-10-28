const BOT_TOKEN = "7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8";
const CHAT_ID = "489679144"; // Your Telegram chat ID

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId, visitorName, message } = req.body;

    if (!sessionId || !visitorName || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Send notification to Telegram
        const notification = (
            `💬 New message from ${visitorName}\n` +
            `📱 Session: ${sessionId}\n` +
            `💭 Message: ${message}\n\n` +
            `Reply with: /reply ${sessionId} <your_message>`
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