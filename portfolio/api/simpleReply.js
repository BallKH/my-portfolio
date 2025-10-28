// Use global storage for persistence across function calls
if (!global.allMessages) {
    global.allMessages = [];
}

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
        global.allMessages.push(newMessage);
        console.log('Message added to global storage:', newMessage);
        return res.json({ success: true, message: 'Reply added', total: global.allMessages.length });
    }

    if (req.method === 'GET') {
        const { lastMessageId = 0 } = req.query;
        
        console.log('GET request - lastMessageId:', lastMessageId);
        console.log('Total messages in global storage:', global.allMessages.length);
        
        const filtered = global.allMessages.filter(msg => msg.id > parseInt(lastMessageId));
        console.log('Filtered messages:', filtered);
        return res.json({ messages: filtered, total: global.allMessages.length });
    }

    res.status(405).json({ error: 'Method not allowed' });
}