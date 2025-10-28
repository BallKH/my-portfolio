import { getReplyMessages } from './messageStore.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { lastMessageId = 0 } = req.query;
    const newMessages = getReplyMessages(parseInt(lastMessageId));

    res.json({ messages: newMessages });
}