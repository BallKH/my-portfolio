from flask import Flask, request, jsonify
import requests
import json
from datetime import datetime

app = Flask(__name__)

# Configuration
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"
TELEGRAM_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID"
AMAZON_Q_API_URL = "https://your-amazon-q-endpoint.com"

# Store active sessions
active_sessions = {}

@app.route('/api/new-visitor', methods=['POST'])
def handle_new_visitor():
    """Handle new web visitor connection"""
    data = request.json
    session_id = data.get('session_id')
    visitor_name = data.get('visitor_name', 'Anonymous')
    initial_message = data.get('message', '')
    
    # Store session
    active_sessions[session_id] = {
        'visitor_name': visitor_name,
        'timestamp': datetime.now().isoformat(),
        'status': 'active'
    }
    
    # Notify Telegram
    notify_telegram_new_visitor(session_id, visitor_name, initial_message)
    
    return jsonify({'status': 'success', 'session_id': session_id})

@app.route('/api/send-to-visitor', methods=['POST'])
def send_to_visitor():
    """Receive message from Telegram bot and send to web visitor"""
    data = request.json
    session_id = data.get('session_id')
    message = data.get('message')
    
    if session_id not in active_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    # Send message to web visitor (WebSocket, SSE, or polling)
    success = forward_to_web_visitor(session_id, message)
    
    if success:
        return jsonify({'status': 'message_sent'})
    else:
        return jsonify({'error': 'Failed to send message'}), 500

@app.route('/api/visitor-message', methods=['POST'])
def handle_visitor_message():
    """Handle message from web visitor and forward to Telegram"""
    data = request.json
    session_id = data.get('session_id')
    message = data.get('message')
    
    if session_id not in active_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    # Forward to Telegram
    visitor_name = active_sessions[session_id]['visitor_name']
    forward_to_telegram(session_id, visitor_name, message)
    
    return jsonify({'status': 'message_forwarded'})

def notify_telegram_new_visitor(session_id, visitor_name, initial_message):
    """Send notification to Telegram about new visitor"""
    notification = (
        f"🔔 New visitor connected!\n\n"
        f"👤 Name: {visitor_name}\n"
        f"🆔 Session: {session_id}\n"
        f"💬 Message: {initial_message}\n\n"
        f"Reply with: /reply {session_id} <your_message>"
    )
    
    send_telegram_message(notification)

def forward_to_telegram(session_id, visitor_name, message):
    """Forward visitor message to Telegram"""
    telegram_message = (
        f"💬 Message from {visitor_name}\n"
        f"🆔 Session: {session_id}\n"
        f"📝 {message}\n\n"
        f"Reply with: /reply {session_id} <your_message>"
    )
    
    send_telegram_message(telegram_message)

def send_telegram_message(message):
    """Send message to Telegram chat"""
    try:
        response = requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML"
            }
        )
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")
        return False

def forward_to_web_visitor(session_id, message):
    """Forward message to web visitor (implement based on your frontend)"""
    try:
        # Option 1: WebSocket (if using Socket.IO)
        # socketio.emit('support_message', {'message': message}, room=session_id)
        
        # Option 2: Store in database for polling
        # store_message_for_polling(session_id, message)
        
        # Option 3: Server-Sent Events
        # send_sse_message(session_id, message)
        
        # For demo - just log the message
        print(f"Sending to web visitor {session_id}: {message}")
        return True
        
    except Exception as e:
        print(f"Failed to send to web visitor: {e}")
        return False

if __name__ == '__main__':
    app.run(debug=True, port=5000)