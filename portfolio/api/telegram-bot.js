// Telegram Bot Webhook Handler for Vercel
const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';
const CHAT_ID = '489679144';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        
        if (update.message) {
            const message = update.message;
            const text = message.text;
            const chatId = message.chat.id;
            
            // Only process messages from your chat
            if (chatId.toString() !== CHAT_ID) {
                return res.status(200).json({ success: true });
            }
            
            // Handle /reply command
            if (text && text.startsWith('/reply ')) {
                const parts = text.split(' ');
                if (parts.length >= 3) {
                    const sessionId = parts[1];
                    const replyMessage = parts.slice(2).join(' ');
                    
                    // Send reply to web chat
                    console.log(`Webhook sending reply: ${sessionId} -> ${replyMessage}`);
                    const response = await fetch('https://ponlork-portfolio.vercel.app/api/chat?action=reply', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId: sessionId,
                            message: replyMessage
                        })
                    });
                    
                    const result = await response.json();
                    console.log(`Reply API response:`, result);
                    
                    // No confirmation message (silent)
                }
            }
            
            // Handle /sessions command
            else if (text === '/sessions') {
                const response = await fetch('https://ponlork-portfolio.vercel.app/api/chat?action=sessions');
                const result = await response.json();
                const sessions = result.sessions || {};
                
                let sessionList = '📋 Active Sessions:\n\n';
                if (Object.keys(sessions).length === 0) {
                    sessionList = '📭 No active sessions';
                } else {
                    for (const [sessionId, messages] of Object.entries(sessions)) {
                        const lastMessage = messages[messages.length - 1];
                        sessionList += `🔹 Session: ${sessionId}\n   💭 Last: ${lastMessage?.text || 'No messages'}\n\n`;
                    }
                }
                
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: sessionList
                    })
                });
            }
        }
        
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}