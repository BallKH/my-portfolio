import logging
import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Configure logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
BOT_TOKEN = "YOUR_BOT_TOKEN"
BACKEND_API_URL = "http://localhost:5000/api"

# Store session mappings (in production, use Redis or database)
sessions = {}

class TelegramBot:
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup command and message handlers"""
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CommandHandler("reply", self.reply))
        self.application.add_handler(CommandHandler("sessions", self.list_sessions))
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))
    
    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        await update.message.reply_text(
            "🤖 Telegram Bot Reply Handler\n\n"
            "Commands:\n"
            "/reply <session_id> <message> - Reply to web visitor\n"
            "/sessions - List active sessions"
        )
    
    async def reply(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /reply command to send message to specific session"""
        if len(context.args) < 2:
            await update.message.reply_text(
                "❌ Usage: /reply <session_id> <message>\n"
                "Example: /reply 1761304461298_k3perzz0p Hello from support!"
            )
            return
        
        session_id = context.args[0]
        message = " ".join(context.args[1:])
        
        if session_id not in sessions:
            await update.message.reply_text(f"❌ Session ID '{session_id}' not found.")
            return
        
        # Send message to web visitor
        success = await self.send_to_web_visitor(session_id, message)
        
        if success:
            visitor_name = sessions[session_id].get('visitor_name', 'Unknown')
            await update.message.reply_text(
                f"✅ Message sent to {visitor_name}\n"
                f"Session: {session_id}\n"
                f"Message: {message}"
            )
        else:
            await update.message.reply_text(f"❌ Failed to send message to session {session_id}")
    
    async def list_sessions(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """List all active sessions"""
        if not sessions:
            await update.message.reply_text("📭 No active sessions")
            return
        
        session_list = "📋 Active Sessions:\n\n"
        for session_id, data in sessions.items():
            visitor_name = data.get('visitor_name', 'Unknown')
            timestamp = data.get('timestamp', 'Unknown')
            session_list += f"🔹 {visitor_name}\n   ID: {session_id}\n   Time: {timestamp}\n\n"
        
        await update.message.reply_text(session_list)
    
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle regular messages (optional - for general support)"""
        await update.message.reply_text(
            "💡 To reply to a web visitor, use:\n"
            "/reply <session_id> <your_message>"
        )
    
    async def send_to_web_visitor(self, session_id: str, message: str) -> bool:
        """Send message to web visitor through backend API"""
        try:
            payload = {
                "session_id": session_id,
                "message": message,
                "sender": "support_agent",
                "timestamp": self.get_timestamp()
            }
            
            # Send to WebSocket backend API
            response = requests.post(
                "http://localhost:5000/api/send-to-visitor",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"Message sent to session {session_id}: {message}")
                return True
            else:
                logger.error(f"Backend API error: {response.status_code}")
                return False
                
        except requests.RequestException as e:
            logger.error(f"Failed to send message to backend: {e}")
            return False
    
    def add_session(self, session_id: str, visitor_data: dict):
        """Add new session mapping"""
        sessions[session_id] = {
            "visitor_name": visitor_data.get("name", "Anonymous"),
            "timestamp": self.get_timestamp(),
            "status": "active"
        }
        logger.info(f"New session added: {session_id}")
    
    def remove_session(self, session_id: str):
        """Remove session mapping"""
        if session_id in sessions:
            del sessions[session_id]
            logger.info(f"Session removed: {session_id}")
    
    def get_timestamp(self):
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def run(self):
        """Start the bot"""
        logger.info("Starting Telegram bot...")
        self.application.run_polling()

# Backend API integration functions
def register_new_visitor(session_id: str, visitor_name: str = "Anonymous"):
    """Register new web visitor session"""
    bot_instance.add_session(session_id, {"name": visitor_name})

def notify_telegram_new_visitor(session_id: str, visitor_name: str, initial_message: str = ""):
    """Notify Telegram when new visitor starts chat"""
    try:
        # Send notification to Telegram (you'll need to set CHAT_ID)
        TELEGRAM_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID"  # Your Telegram chat/group ID
        
        notification = (
            f"🔔 New visitor connected!\n\n"
            f"👤 Name: {visitor_name}\n"
            f"🆔 Session: {session_id}\n"
            f"💬 Message: {initial_message}\n\n"
            f"Reply with: /reply {session_id} <your_message>"
        )
        
        # Send notification (implement based on your setup)
        requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": notification
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to send Telegram notification: {e}")

# Example usage and testing
if __name__ == "__main__":
    # Initialize bot
    bot_instance = TelegramBot()
    
    # Add sample sessions for testing
    bot_instance.add_session("1761304461298_k3perzz0p", {"name": "John Doe"})
    bot_instance.add_session("1761304461299_abc123xyz", {"name": "Jane Smith"})
    
    # Start bot
    try:
        bot_instance.run()
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Bot error: {e}")