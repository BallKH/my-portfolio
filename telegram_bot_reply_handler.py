import logging
import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Configure logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
BOT_TOKEN = "7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8"
BACKEND_API_URL = "https://ponlork-portfolio.vercel.app/api"

# Sessions are now managed by the web portfolio backend
# No local storage needed

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
            "🤖 Web Portfolio Support Bot\n\n"
            "Commands:\n"
            "📝 /reply <session_ID> <Text> - Reply to web visitor\n"
            "📋 /sessions - List active sessions\n\n"
            "Example:\n"
            "/reply abc123 HI\n"
            "/reply 1761304461298_k3perzz0p Hello, how can I help?"
        )
    
    async def reply(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /reply command to send message to specific session"""
        # Ignore old messages (older than 5 minutes)
        import time
        if time.time() - update.message.date.timestamp() > 300:
            return
            
        # Get the full command text
        command_text = update.message.text
        
        # Parse: /reply session_ID Text
        parts = command_text.split(' ', 2)
        
        if len(parts) < 3:
            await update.message.reply_text(
                "❌ Usage: /reply <session_ID> <Text>\n"
                "Example: /reply 1761304461298_k3perzz0p HI\n"
                "Example: /reply abc123 Hello, how can I help you?"
            )
            return
        
        session_id = parts[1]
        message = parts[2]
        
        # Send message to web portfolio visitor
        success = await self.send_to_web_visitor(session_id, message)
        
        if success:
            await update.message.reply_text(
                f"✅ Message sent to session: {session_id}\n"
                f"📝 Text: {message}\n"
                f"🌐 Delivered to web portfolio"
            )
        else:
            await update.message.reply_text(
                f"❌ Failed to send to session: {session_id}\n"
                "Check if session exists on web portfolio"
            )
    
    async def list_sessions(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """List all active sessions from web portfolio"""
        try:
            # Get sessions from backend
            response = requests.get(f"{BACKEND_API_URL}/sessions", timeout=5)
            
            if response.status_code == 200:
                active_sessions = response.json()
                
                if not active_sessions:
                    await update.message.reply_text("📭 No active sessions on web portfolio")
                    return
                
                session_list = "📋 Active Web Portfolio Sessions:\n\n"
                for session_id, data in active_sessions.items():
                    visitor_name = data.get('visitor_name', 'Anonymous')
                    timestamp = data.get('timestamp', 'Unknown')
                    session_list += f"🔹 {visitor_name}\n   📱 ID: {session_id}\n   ⏰ Time: {timestamp}\n\n"
                
                session_list += "\n💡 Reply with: /reply <session_ID> <Text>"
                await update.message.reply_text(session_list)
            else:
                await update.message.reply_text("❌ Cannot fetch sessions from web portfolio")
                
        except Exception as e:
            await update.message.reply_text(f"❌ Error getting sessions: {str(e)}")
    
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle regular messages (optional - for general support)"""
        # Ignore old messages (older than 5 minutes)
        import time
        if time.time() - update.message.date.timestamp() > 300:
            return
            
        await update.message.reply_text(
            "💡 To reply to a web visitor, use:\n"
            "/reply <session_id> <your_message>"
        )
    
    async def send_to_web_visitor(self, session_id: str, message: str) -> bool:
        """Send message to web visitor through backend API"""
        try:
            payload = {
                "sessionId": session_id,
                "message": message
            }
            
            api_url = f"{BACKEND_API_URL}/chat?action=reply"
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "TelegramBot/1.0"
            }
            
            logger.info(f"🚀 Sending reply to API: {api_url}")
            logger.info(f"📦 Payload: {payload}")
            
            response = requests.post(
                api_url,
                json=payload,
                headers=headers,
                timeout=15
            )
            
            logger.info(f"📊 API Response Status: {response.status_code}")
            logger.info(f"💬 API Response Text: {response.text}")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    if result.get('success'):
                        logger.info(f"✅ Reply sent successfully to {session_id}: '{message}'")
                        return True
                    else:
                        logger.error(f"❌ API returned success=false: {result}")
                        return False
                except Exception as json_error:
                    logger.error(f"❌ Failed to parse JSON response: {json_error}")
                    return False
            else:
                logger.error(f"❌ HTTP Error {response.status_code}: {response.text}")
                return False
                
        except requests.RequestException as e:
            logger.error(f"❌ Failed to send message to backend: {e}")
            return False
    
    def add_session(self, session_id: str, visitor_data: dict):
        """Sessions are managed by web backend - no local storage needed"""
        logger.info(f"Session noted: {session_id} for {visitor_data.get('name', 'Anonymous')}")
    
    def remove_session(self, session_id: str):
        """Sessions are managed by web backend - no local storage needed"""
        logger.info(f"Session removal noted: {session_id}")
    
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
    
    # Start bot
    try:
        bot_instance.run()
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Bot error: {e}")