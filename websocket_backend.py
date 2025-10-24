from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import requests
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"
TELEGRAM_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID"

# Store active sessions and their socket connections
active_sessions = {}
session_sockets = {}

@app.route('/')
def index():
    return render_template('chat.html')

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('join_session')
def handle_join_session(data):
    session_id = data['session_id']
    visitor_name = data.get('visitor_name', 'Anonymous')
    
    # Store session mapping
    active_sessions[session_id] = {
        'visitor_name': visitor_name,
        'timestamp': datetime.now().isoformat(),
        'socket_id': request.sid
    }
    
    # Map socket to session
    session_sockets[request.sid] = session_id
    
    # Join room for this session
    join_room(session_id)
    
    # Notify Telegram about new visitor
    notify_telegram_new_visitor(session_id, visitor_name)
    
    emit('session_joined', {'session_id': session_id, 'status': 'connected'})
    print(f"Visitor {visitor_name} joined session {session_id}")

@socketio.on('visitor_message')
def handle_visitor_message(data):
    session_id = data['session_id']
    message = data['message']
    
    if session_id in active_sessions:
        visitor_name = active_sessions[session_id]['visitor_name']
        
        # Forward to Telegram
        forward_to_telegram(session_id, visitor_name, message)
        
        # Echo back to visitor (optional)
        emit('message_sent', {'message': message, 'sender': 'visitor'}, room=session_id)

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in session_sockets:
        session_id = session_sockets[request.sid]
        leave_room(session_id)
        
        # Clean up
        if session_id in active_sessions:
            del active_sessions[session_id]
        del session_sockets[request.sid]
        
        print(f"Client disconnected from session {session_id}")

@app.route('/api/send-to-visitor', methods=['POST'])
def send_to_visitor():
    """Receive message from Telegram bot and send to web visitor"""
    data = request.json
    session_id = data.get('session_id')
    message = data.get('message')
    sender = data.get('sender', 'support')
    
    if session_id not in active_sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    # Send message to web visitor via WebSocket
    socketio.emit('support_message', {
        'message': message,
        'sender': sender,
        'timestamp': datetime.now().isoformat()
    }, room=session_id)
    
    print(f"Message sent to session {session_id}: {message}")
    return jsonify({'status': 'message_sent'})

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all active sessions"""
    return jsonify(active_sessions)

def notify_telegram_new_visitor(session_id, visitor_name):
    """Send notification to Telegram about new visitor"""
    notification = (
        f"🔔 New visitor connected!\n\n"
        f"👤 Name: {visitor_name}\n"
        f"🆔 Session: {session_id}\n\n"
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
                "text": message
            }
        )
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")
        return False

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)