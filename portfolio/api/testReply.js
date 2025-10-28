import { addMessage, getAllSessions } from './messageStore.js';

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { sessionId, message } = req.body;
        
        const success = addMessage(sessionId, {
            id: Date.now(),
            text: message,
            from: 'admin',
            timestamp: Date.now()
        });
        
        return res.json({ success, message: success ? 'Reply added' : 'Failed to add reply' });
    }

    // GET: Show all sessions and messages for debugging
    const sessions = getAllSessions();
    res.json({ sessions });
}