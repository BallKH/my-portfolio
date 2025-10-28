import logging
import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Configure logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
BOT_TOKEN = "7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8"
PORTFOLIO_API_URL = "http://localhost:3000/api"  # Your portfolio API

class PortfolioTelegramBot:
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
    
    def setup_handlers(self):
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CommandHandler("reply", self.reply))
        self.application.add_handler(CommandHandler("check", self.check_messages))
        self.application.add_handler(CommandHandler("sessions", self.list_sessions))
    
    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            "🤖 Portfolio Support Bot\n\n"
            "Commands:\n"
            "📝 /reply <session_ID> <text> - Send reply to visitor\n"
            "📋 /check <session_ID> - Check session messages\n"
            "📊 /sessions - List active sessions\n\n"
            "Example:\n"
            "/reply session_1761633611239_lubwb8pm9 Hi"
        )
    
    async def reply(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        command_text = update.message.text
        parts = command_text.split(' ', 2)
        
        if len(parts) < 3:
            await update.message.reply_text(
                "❌ Usage: /reply <session_ID> <text>\n"
                "Example: /reply session_1761633611239_lubwb8pm9 Hi"
            )
            return
        
        session_id = parts[1]
        message = parts[2]
        
        success = await self.send_reply_to_portfolio(session_id, message)
        
        if success:
            await update.message.reply_text(
                f"✅ Reply sent successfully!\n"
                f"📱 Session: {session_id}\n"
                f"💬 Message: {message}"
            )
        else:
            await update.message.reply_text(
                f"❌ Failed to send reply to {session_id}\n"
                "Check if session exists"
            )
    
    async def check_messages(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if len(context.args) < 1:
            await update.message.reply_text(
                "❌ Usage: /check <session_ID>\n"
                "Example: /check session_1761633611239_lubwb8pm9"
            )
            return
        
        session_id = context.args[0]
        messages = await self.get_session_messages(session_id)
        
        if messages:
            message_list = "📋 Messages:\n\n"
            for msg in messages.get('messages', []):
                timestamp = msg.get('timestamp', 0)
                text = msg.get('text', '')
                message_list += f"• {text} (ID: {msg.get('id', 'N/A')})\n"
            
            message_list += f"\n📊 Total: {messages.get('total', 0)} messages"
            await update.message.reply_text(message_list)
        else:
            await update.message.reply_text(f"❌ No messages found for {session_id}")
    
    async def list_sessions(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            "📊 Active Sessions:\n\n"
            "Use your portfolio admin panel to view active sessions,\n"
            "then use /reply <session_ID> <text> to respond"
        )
    
    async def send_reply_to_portfolio(self, session_id: str, message: str) -> bool:
        try:
            payload = {
                "sessionId": session_id,
                "message": message
            }
            
            response = requests.post(
                f"{PORTFOLIO_API_URL}/manualReply",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Reply sent to {session_id}: {message}")
                return result.get('success', False)
            else:
                logger.error(f"API error: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send reply: {e}")
            return False
    
    async def get_session_messages(self, session_id: str):
        try:
            response = requests.get(
                f"{PORTFOLIO_API_URL}/getMessages",
                params={"sessionId": session_id, "lastMessageId": 0},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            logger.error(f"Failed to get messages: {e}")
            return None
    
    def run(self):
        logger.info("Starting Portfolio Telegram bot...")
        self.application.run_polling()

if __name__ == "__main__":
    bot = PortfolioTelegramBot()
    try:
        bot.run()
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Bot error: {e}")