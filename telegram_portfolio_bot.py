import logging
import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from datetime import datetime

# Configure logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
BOT_TOKEN = "7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8"
PORTFOLIO_API_URL = "http://localhost:3000/api"  # Your portfolio API

class PortfolioTelegramBot:
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self.session_mapping = {}  # Simple ID -> Original ID mapping
        self.user_counter = 1
        self.setup_handlers()
    
    def setup_handlers(self):
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CommandHandler("reply", self.reply))
        self.application.add_handler(CommandHandler("check", self.check_messages))
        self.application.add_handler(CommandHandler("sessions", self.list_sessions))
        self.application.add_handler(CommandHandler("notify", self.test_notification))
    
    def get_simple_session_id(self, original_session_id, visitor_name="Anonymous"):
        """Map complex session ID to simple one like User1, User2"""
        # Check if already mapped
        for simple_id, data in self.session_mapping.items():
            if data["original_id"] == original_session_id:
                return simple_id
        
        # Create new mapping
        simple_id = f"User{self.user_counter}"
        self.user_counter += 1
        
        self.session_mapping[simple_id] = {
            "original_id": original_session_id,
            "visitor_name": visitor_name,
            "timestamp": datetime.now().isoformat()
        }
        
        return simple_id
    
    def get_original_session_id(self, simple_id):
        """Get original session ID from simple ID"""
        return self.session_mapping.get(simple_id, {}).get("original_id")
    
    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(
            "🤖 Portfolio Support Bot\n\n"
            "Commands:\n"
            "📝 /reply <User_ID> <text> - Send reply to visitor\n"
            "📋 /check <User_ID> - Check session messages\n"
            "📊 /sessions - List active sessions\n"
            "🔔 /notify <original_session> <name> <message> - Test notification\n\n"
            "Examples:\n"
            "/reply User1 Hi\n"
            "/reply User2 Hello, how can I help you?"
        )
    
    async def reply(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        command_text = update.message.text
        parts = command_text.split(' ', 2)
        
        if len(parts) < 3:
            await update.message.reply_text(
                "❌ Usage: /reply <User_ID> <text>\n"
                "Example: /reply User1 Hi\n"
                "Example: /reply User2 Hello, how can I help?"
            )
            return
        
        simple_session_id = parts[1]
        message = parts[2]
        
        # Get original session ID from simple ID
        original_session_id = self.get_original_session_id(simple_session_id)
        
        if not original_session_id:
            await update.message.reply_text(
                f"❌ Session {simple_session_id} not found\n"
                "Use /sessions to see active sessions"
            )
            return
        
        success = await self.send_reply_to_portfolio(original_session_id, message)
        
        if success:
            visitor_name = self.session_mapping.get(simple_session_id, {}).get('visitor_name', 'Unknown')
            await update.message.reply_text(
                f"✅ Reply sent to {visitor_name}!\n"
                f"👤 Session: {simple_session_id}\n"
                f"💬 Message: {message}"
            )
        else:
            await update.message.reply_text(
                f"❌ Failed to send reply to {simple_session_id}\n"
                "Check if session is still active"
            )
    
    async def check_messages(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if len(context.args) < 1:
            await update.message.reply_text(
                "❌ Usage: /check <User_ID>\n"
                "Example: /check User1"
            )
            return
        
        simple_session_id = context.args[0]
        original_session_id = self.get_original_session_id(simple_session_id)
        
        if not original_session_id:
            await update.message.reply_text(f"❌ Session {simple_session_id} not found")
            return
        
        messages = await self.get_session_messages(original_session_id)
        
        if messages:
            visitor_name = self.session_mapping.get(simple_session_id, {}).get('visitor_name', 'Unknown')
            message_list = f"📋 Messages from {visitor_name} ({simple_session_id}):\n\n"
            for msg in messages.get('messages', []):
                text = msg.get('text', '')
                message_list += f"• {text}\n"
            
            message_list += f"\n📊 Total: {messages.get('total', 0)} messages"
            await update.message.reply_text(message_list)
        else:
            await update.message.reply_text(f"❌ No messages found for {simple_session_id}")
    
    async def list_sessions(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not self.session_mapping:
            await update.message.reply_text("📭 No active sessions")
            return
        
        session_list = "📊 Active Sessions:\n\n"
        for simple_id, data in self.session_mapping.items():
            visitor_name = data.get('visitor_name', 'Anonymous')
            timestamp = data.get('timestamp', 'Unknown')
            session_list += f"👤 {visitor_name}\n   📱 ID: {simple_id}\n   ⏰ Time: {timestamp[:16]}\n\n"
        
        session_list += "💡 Reply with: /reply <ID> <message>"
        await update.message.reply_text(session_list)
    
    async def test_notification(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Test notification system - /notify <original_session> <name> <message>"""
        if len(context.args) < 3:
            await update.message.reply_text(
                "Usage: /notify <original_session> <name> <message>\n"
                "Example: /notify session_123 John Hello"
            )
            return
        
        original_session = context.args[0]
        visitor_name = context.args[1]
        message = " ".join(context.args[2:])
        
        # Create simple session ID
        simple_id = self.get_simple_session_id(original_session, visitor_name)
        
        # Send notification
        notification = (
            f"💬 New message from {visitor_name}\n"
            f"📱 Session: {simple_id}\n"
            f"💭 Message: {message}\n\n"
            f"Reply with: /reply {simple_id} <your_message>"
        )
        
        await update.message.reply_text(notification)
    
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