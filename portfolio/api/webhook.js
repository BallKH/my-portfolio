// Import the same storage used by simpleReply
let messages = [];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Webhook received:', JSON.stringify(req.body, null, 2));
        const { message } = req.body;
        
        if (message && message.text && message.reply_to_message) {
            const originalText = message.reply_to_message.text;
            console.log('Reply to message:', originalText);
            
            if (originalText && originalText.includes('Portfolio Contact:')) {
                const replyText = message.text;
                
                // Add reply directly to storage
                const newMessage = {
                    id: Date.now(),
                    text: replyText,
                    timestamp: Date.now()
                };
                
                // Use same global storage as simpleReply
                if (!global.allMessages) {
                    global.allMessages = [];
                }
                global.allMessages.push(newMessage);
                
                console.log('Reply added to webhook storage:', replyText);
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}