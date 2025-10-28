import { addMessage } from './messageStore.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Webhook received:', JSON.stringify(req.body, null, 2));
        const { message } = req.body;
        
        if (message && message.text) {
            console.log('Processing message:', message.text);
            
            // Handle /reply command format: /reply <session_id> <message>
            const replyMatch = message.text.match(/^\/reply\s+(\S+)\s+(.+)/);
            
            if (replyMatch) {
                const sessionId = replyMatch[1];
                const replyText = replyMatch[2];
                
                console.log('Reply command found:', { sessionId, replyText });
                
                const newMessage = {
                    id: Date.now(),
                    text: replyText,
                    from: 'admin',
                    timestamp: Date.now()
                };
                
                const success = addMessage(sessionId, newMessage);
                console.log('Message stored for session:', sessionId, success ? 'SUCCESS' : 'FAILED');
            }
            // Fallback: Handle reply-to messages (legacy support)
            else if (message.reply_to_message) {
                const originalText = message.reply_to_message.text;
                const sessionMatch = originalText.match(/^\[([^\]]+)\]/);
                
                if (sessionMatch) {
                    const sessionId = sessionMatch[1];
                    const replyText = message.text;
                    
                    console.log('Reply-to message found:', { sessionId, replyText });
                    
                    const newMessage = {
                        id: Date.now(),
                        text: replyText,
                        from: 'admin',
                        timestamp: Date.now()
                    };
                    
                    const success = addMessage(sessionId, newMessage);
                    console.log('Reply-to message stored for session:', sessionId, success ? 'SUCCESS' : 'FAILED');
                }
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}