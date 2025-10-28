# Portfolio Telegram Bot Setup

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
pip install python-telegram-bot requests
```

### 2. Create Telegram Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Choose a name: `Your Portfolio Support Bot`
4. Choose a username: `your_portfolio_support_bot`
5. Copy the bot token

### 3. Configure Bot
Replace `YOUR_BOT_TOKEN` in `telegram_portfolio_bot.py` with your actual token:
```python
BOT_TOKEN = "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
```

### 4. Update API URL
Make sure the API URL matches your portfolio server:
```python
PORTFOLIO_API_URL = "http://localhost:3000/api"  # Your portfolio API
```

### 5. Run the Bot
```bash
python telegram_portfolio_bot.py
```

## 📱 How to Use

### Start the Bot
```
/start
```

### Reply to Visitor
```
/reply session_1761633611239_lubwb8pm9 Hi
/reply session_1761633611239_lubwb8pm9 Hello! How can I help you today?
```

### Check Messages
```
/check session_1761633611239_lubwb8pm9
```

### List Sessions
```
/sessions
```

## 🔄 Workflow

1. **Visitor sends message** on your portfolio
2. **You get notification** (set up webhook or check manually)
3. **Copy session ID** from your portfolio admin
4. **Reply via Telegram:** `/reply session_ID Your message`
5. **Message appears** in visitor's chat instantly

## ✅ Expected Responses

### Successful Reply:
```
✅ Reply sent successfully!
📱 Session: session_1761633611239_lubwb8pm9
💬 Message: Hi
```

### Check Messages:
```
📋 Messages:

• Hi (ID: 1761639647445)
• Hi (ID: 1761639735963)
• Hi (ID: 1761639737902)

📊 Total: 3 messages
```

## 🔧 Integration with Your Portfolio

The bot uses your existing API endpoints:
- `POST /api/manualReply` - Send replies
- `GET /api/getMessages` - Check messages

No changes needed to your portfolio code!

## 🚨 Troubleshooting

### Bot not responding:
- Check bot token is correct
- Make sure bot is running: `python telegram_portfolio_bot.py`

### API errors:
- Verify portfolio server is running
- Check API URL in bot configuration
- Test endpoints manually first

### Session not found:
- Copy exact session ID from your portfolio
- Check session is still active