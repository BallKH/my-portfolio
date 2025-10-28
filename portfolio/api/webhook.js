import { messageStore } from './sendMessage.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        if (message && message.text) {
            // Handle /reply command format: /reply <session_id> <message>
            const replyMatch = message.text.match(/^\/reply\s+(\S+)\s+(.+)/);
            
            if (replyMatch) {
                const sessionId = replyMatch[1];
                const replyText = replyMatch[2];
                
                // Store reply in shared message store
                if (!messageStore.has(sessionId)) {
                    messageStore.set(sessionId, []);
                }
                
                messageStore.get(sessionId).push({
                    id: Date.now(),
                    text: replyText,
                    from: 'admin',
                    timestamp: Date.now()
                });
            }
            // Fallback: Handle reply-to messages (legacy support)
            else if (message.reply_to_message) {
                const originalText = message.reply_to_message.text;
                const sessionMatch = originalText.match(/^\[([^\]]+)\]/);
                
                if (sessionMatch) {
                    const sessionId = sessionMatch[1];
                    const replyText = message.text;
                    
                    if (!messageStore.has(sessionId)) {
                        messageStore.set(sessionId, []);
                    }
                    
                    messageStore.get(sessionId).push({
                        id: Date.now(),
                        text: replyText,
                        from: 'admin',
                        timestamp: Date.now()
                    });
                }
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}