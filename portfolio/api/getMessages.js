export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { offset } = req.query;
    const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset || 0}&timeout=5`);
        const result = await response.json();

        if (response.ok && result.ok) {
            res.status(200).json(result);
        } else {
            res.status(400).json({ error: result.description || 'Failed to get messages' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}