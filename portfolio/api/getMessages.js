import { getMessages } from './messageStore.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { sessionId, lastMessageId = 0 } = req.query;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }

    const sessionMessages = getMessages(sessionId);
    const newMessages = sessionMessages.filter(msg => msg.id > parseInt(lastMessageId));

    res.json({ messages: newMessages });
}