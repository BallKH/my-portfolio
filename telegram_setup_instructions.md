# Get Your Telegram Chat ID

## Step 1: Send Message to Your Bot
1. Open Telegram
2. Search for your bot (the one with token `7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8`)
3. Send any message like "Hello"

## Step 2: Get Your Chat ID
Visit this URL in your browser:
```
https://api.telegram.org/bot7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8/getUpdates
```

## Step 3: Find Your Chat ID
Look for something like this in the response:
```json
{
  "message": {
    "chat": {
      "id": 123456789,
      "type": "private"
    }
  }
}
```

The number after `"id":` is your chat ID (e.g., `123456789`)

## Step 4: Update the Code
Replace `YOUR_CHAT_ID` in `/portfolio/api/telegramNotify.js` with your actual chat ID:
```javascript
const CHAT_ID = "123456789"; // Your actual chat ID
```

## Step 5: Test
After updating the chat ID:
1. Someone chats on your website
2. You should get Telegram notification like:
```
💬 New message from John
📱 Session: session_john
💭 Message: Hello, I need help

Reply with: /reply session_john <your_message>
```

## Step 6: Reply via Telegram Bot
```bash
python telegram_portfolio_bot.py
```

Then use:
```
/reply session_john Hi John! How can I help you?
```