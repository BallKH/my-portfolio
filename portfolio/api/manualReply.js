import { addMessage } from './messageStore.js';

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
        return res.status(400).json({ error: 'Session ID and message required' });
    }

    const success = addMessage(sessionId, {
        id: Date.now(),
        text: message,
        from: 'admin',
        timestamp: Date.now()
    });

    res.json({ 
        success, 
        message: success ? 'Reply sent successfully' : 'Failed to send reply',
        sessionId 
    });
}