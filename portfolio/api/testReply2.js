import { addReplyMessage } from './messageStore.js';

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { message } = req.body;
        const success = addReplyMessage(message || 'Hello back from Telegram!');
        return res.json({ success, message: 'Test reply added' });
    }

    res.json({ message: 'Test endpoint ready' });
}