// In-memory session storage (use Redis/database for production)
const sessions = new Map();

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { sessionId } = req.body;
        sessions.set(sessionId, { 
            id: sessionId, 
            created: Date.now(),
            lastMessage: 0 
        });
        return res.json({ success: true });
    }

    if (req.method === 'GET') {
        const { sessionId } = req.query;
        const session = sessions.get(sessionId);
        return res.json({ exists: !!session, session });
    }
}