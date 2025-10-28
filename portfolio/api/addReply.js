export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { message } = req.body;
        
        // Add to webhook storage
        if (!global.webhookMessages) {
            global.webhookMessages = [];
        }
        
        const newMessage = {
            id: Date.now(),
            text: message || 'Hi',
            timestamp: Date.now()
        };
        
        global.webhookMessages.push(newMessage);
        
        return res.json({ success: true, message: 'Reply added to webhook storage' });
    }

    res.status(405).json({ error: 'Method not allowed' });
}