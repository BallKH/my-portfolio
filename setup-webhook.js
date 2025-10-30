// Run this once to set up Telegram webhook
const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';
const WEBHOOK_URL = 'https://ponlork-portfolio.vercel.app/api/telegram-bot';

async function setupWebhook() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: WEBHOOK_URL
            })
        });
        
        const result = await response.json();
        console.log('Webhook setup result:', result);
    } catch (error) {
        console.error('Error setting up webhook:', error);
    }
}

setupWebhook();