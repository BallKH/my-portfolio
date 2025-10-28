export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        if (message && message.text && message.reply_to_message) {
            const originalText = message.reply_to_message.text;
            if (originalText && originalText.includes('Portfolio Contact:')) {
                const replyText = message.text;
                
                // Add reply using simpleReply API
                const response = await fetch(`${req.headers.origin || 'https://yourdomain.com'}/api/simpleReply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: replyText })
                });
                
                console.log('Reply added via simpleReply:', replyText);
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}