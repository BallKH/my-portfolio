// Single unified chat API with in-function storage
let messages = [];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { message } = req.body;
        const newMessage = {
            id: Date.now(),
            text: message || 'Reply',
            timestamp: Date.now()
        };
        messages.push(newMessage);
        console.log('Message added:', newMessage, 'Total:', messages.length);
        return res.json({ success: true, message: 'Reply added', total: messages.length });
    }

    if (req.method === 'GET') {
        const { lastMessageId = 0 } = req.query;
        const filtered = messages.filter(msg => msg.id > parseInt(lastMessageId));
        console.log('Returning messages:', filtered.length, 'of', messages.length);
        return res.json({ messages: filtered, total: messages.length });
    }

    res.status(405).json({ error: 'Method not allowed' });
}