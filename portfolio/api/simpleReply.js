// Simple in-function storage for testing
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
            text: message || 'Test reply',
            timestamp: Date.now()
        };
        messages.push(newMessage);
        return res.json({ success: true, message: 'Reply added', total: messages.length });
    }

    if (req.method === 'GET') {
        const { lastMessageId = 0 } = req.query;
        console.log('GET request - lastMessageId:', lastMessageId, 'total messages:', messages.length);
        console.log('All messages:', messages);
        const filtered = messages.filter(msg => msg.id > parseInt(lastMessageId));
        console.log('Filtered messages:', filtered);
        return res.json({ messages: filtered, total: messages.length });
    }

    res.status(405).json({ error: 'Method not allowed' });
}