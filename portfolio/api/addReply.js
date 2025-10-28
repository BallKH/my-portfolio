export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { message } = req.body;
        
        // Use same global storage as simpleReply
        if (!global.allMessages) {
            global.allMessages = [];
        }
        
        const newMessage = {
            id: Date.now(),
            text: message || 'Hi',
            timestamp: Date.now()
        };
        
        global.allMessages.push(newMessage);
        console.log('Reply added to global storage:', newMessage);
        
        return res.json({ success: true, message: 'Reply added to global storage' });
    }

    res.status(405).json({ error: 'Method not allowed' });
}