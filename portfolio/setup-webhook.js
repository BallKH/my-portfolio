// Run this once to setup Telegram webhook
const BOT_TOKEN = '7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8';
const WEBHOOK_URL = 'https://my-portfolio-ball-khs-projects.vercel.app/api/telegram-webhook';

async function setupWebhook() {
    try {
        // Set webhook
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: WEBHOOK_URL })
        });
        
        const result = await response.json();
        console.log('Webhook setup result:', result);
        
        if (result.ok) {
            console.log('✅ Webhook setup successful!');
            console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
            console.log('🤖 Your bot is now running 24/7 on Vercel!');
        } else {
            console.log('❌ Webhook setup failed:', result.description);
        }
    } catch (error) {
        console.error('Error setting up webhook:', error);
    }
}

setupWebhook();