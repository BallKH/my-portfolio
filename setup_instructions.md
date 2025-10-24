# Telegram Bot Reply-by-Session Handler Setup

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Bot Token
1. Create a bot with [@BotFather](https://t.me/botfather) on Telegram
2. Get your bot token
3. Replace `YOUR_BOT_TOKEN` in the code

### 3. Get Telegram Chat ID
1. Add your bot to a group or get your personal chat ID
2. Send a message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find your chat ID in the response
5. Replace `YOUR_TELEGRAM_CHAT_ID` in the code

### 4. Run the Components

#### Start Backend API:
```bash
python backend_api_integration.py
```

#### Start Telegram Bot:
```bash
python telegram_bot_reply_handler.py
```

## 📋 How It Works

### 1. New Visitor Connects
```
Web Visitor → Backend API → Telegram Notification
```

### 2. Support Agent Replies
```
Telegram: /reply 1761304461298_k3perzz0p Hello!
→ Backend API → Web Visitor
```

### 3. Visitor Responds
```
Web Visitor → Backend API → Telegram Message
```

## 🔧 Commands

- `/start` - Show bot information
- `/reply <session_id> <message>` - Reply to specific visitor
- `/sessions` - List active sessions

## 🌐 API Endpoints

- `POST /api/new-visitor` - Register new visitor
- `POST /api/send-to-visitor` - Send message to visitor
- `POST /api/visitor-message` - Handle visitor message

## 📝 Example Usage

### Register New Visitor:
```bash
curl -X POST http://localhost:5000/api/new-visitor \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "1761304461298_k3perzz0p",
    "visitor_name": "John Doe",
    "message": "Hello, I need help"
  }'
```

### Reply from Telegram:
```
/reply 1761304461298_k3perzz0p Hi John! How can I help you?
```

## 🔄 Integration with Your Web App

### Frontend JavaScript:
```javascript
// Generate session ID
const sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// Register visitor
fetch('/api/new-visitor', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    session_id: sessionId,
    visitor_name: 'John Doe',
    message: 'Hello, I need help'
  })
});

// Send visitor message
function sendMessage(message) {
  fetch('/api/visitor-message', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      session_id: sessionId,
      message: message
    })
  });
}
```

## 🔐 Production Considerations

1. **Environment Variables**: Use `.env` file for sensitive data
2. **Database**: Replace in-memory storage with Redis/PostgreSQL
3. **Authentication**: Add API key authentication
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Logging**: Add comprehensive logging
6. **Error Handling**: Improve error handling and recovery