import { addReplyMessage } from './messageStore.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        if (message && message.text && message.reply_to_message) {
            // Check if replying to a portfolio message
            const originalText = message.reply_to_message.text;
            if (originalText && originalText.includes('Portfolio Contact:')) {
                const replyText = message.text;
                addReplyMessage(replyText);
                console.log('Reply added:', replyText);
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}