import requests
import json
from datetime import datetime

# Configuration
BOT_TOKEN = "7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8"
CHAT_ID = "YOUR_CHAT_ID"  # Replace with your Telegram chat ID

# Session mapping storage
session_mapping = {}
user_counter = 1

def get_simple_session_id():
    """Generate simple session ID like User1, User2, etc."""
    global user_counter
    simple_id = f"User{user_counter}"
    user_counter += 1
    return simple_id

def map_session(original_session_id, visitor_name="Anonymous"):
    """Map complex session ID to simple one"""
    simple_id = get_simple_session_id()
    session_mapping[simple_id] = {
        "original_id": original_session_id,
        "visitor_name": visitor_name,
        "timestamp": datetime.now().isoformat()
    }
    return simple_id

def get_original_session_id(simple_id):
    """Get original session ID from simple ID"""
    return session_mapping.get(simple_id, {}).get("original_id")

def send_telegram_notification(simple_session_id, visitor_name, message):
    """Send notification to Telegram with simple session ID"""
    notification = (
        f"💬 New message from {visitor_name}\n"
        f"📱 Session: {simple_session_id}\n"
        f"💭 Message: {message}\n\n"
        f"Reply with: /reply {simple_session_id} <your_message>"
    )
    
    try:
        response = requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={
                "chat_id": CHAT_ID,
                "text": notification
            }
        )
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")
        return False

def handle_new_visitor_message(original_session_id, visitor_name, message):
    """Handle new visitor message and send Telegram notification"""
    # Check if session already has simple ID
    simple_id = None
    for sid, data in session_mapping.items():
        if data["original_id"] == original_session_id:
            simple_id = sid
            break
    
    # If no simple ID exists, create one
    if not simple_id:
        simple_id = map_session(original_session_id, visitor_name)
    
    # Send notification to Telegram
    send_telegram_notification(simple_id, visitor_name, message)
    
    return simple_id

# Example usage
if __name__ == "__main__":
    # Test the system
    original_id = "session_1761633611239_lubwb8pm9"
    visitor = "John Doe"
    msg = "Hello, I need help with my order"
    
    simple_id = handle_new_visitor_message(original_id, visitor, msg)
    print(f"Mapped {original_id} to {simple_id}")
    print(f"Session mapping: {session_mapping}")