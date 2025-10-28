import { addReplyMessage } from './messageStore.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Webhook received:', JSON.stringify(req.body, null, 2));
        const { message } = req.body;
        
        if (message && message.text) {
            console.log('Message text:', message.text);
            
            if (message.reply_to_message) {
                console.log('Reply to message:', message.reply_to_message.text);
                const originalText = message.reply_to_message.text;
                if (originalText && originalText.includes('Portfolio Contact:')) {
                    const replyText = message.text;
                    addReplyMessage(replyText);
                    console.log('Reply added to store:', replyText);
                }
            } else {
                console.log('No reply_to_message found');
            }
        } else {
            console.log('No message or text found');
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}