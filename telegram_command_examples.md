# Telegram Bot Commands for Web Portfolio

## 📱 Command Format

### Reply to Specific Session:
```
/reply session_ID Text
```

## 🔥 Examples

### Basic Reply:
```
/reply 1761304461298_k3perzz0p HI
```

### Longer Message:
```
/reply abc123def Hello, how can I help you today?
```

### Support Response:
```
/reply 1234567890_xyz Thank you for contacting us. What issue are you experiencing?
```

### Quick Responses:
```
/reply session123 Thanks for your message!
/reply visitor456 Please wait while I check that for you
/reply user789 Is there anything else I can help with?
```

## 📋 Other Commands

### List Active Sessions:
```
/sessions
```

### Bot Information:
```
/start
```

## 🌐 How It Works

1. **Visitor opens your web portfolio** → Gets unique session_ID
2. **Visitor sends message** → You get notification in Telegram with session_ID
3. **You reply in Telegram:** `/reply session_ID Your response`
4. **Message appears instantly** in visitor's chat on your portfolio

## 📝 Session ID Format

Session IDs are automatically generated as:
- `timestamp_randomstring`
- Example: `1761304461298_k3perzz0p`

## ✅ Success Response

When you send a message, you'll see:
```
✅ Message sent to session: abc123
📝 Text: HI
🌐 Delivered to web portfolio
```

## ❌ Error Response

If session doesn't exist:
```
❌ Failed to send to session: abc123
Check if session exists on web portfolio
```