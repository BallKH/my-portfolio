import requests

BOT_TOKEN = "7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8"

def get_chat_id():
    """Get your Telegram chat ID"""
    try:
        response = requests.get(f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates")
        data = response.json()
        
        if data['ok'] and data['result']:
            print("Recent chats:")
            for update in data['result'][-5:]:  # Show last 5 updates
                if 'message' in update:
                    chat = update['message']['chat']
                    print(f"Chat ID: {chat['id']}")
                    print(f"Type: {chat['type']}")
                    if 'username' in chat:
                        print(f"Username: @{chat['username']}")
                    if 'title' in chat:
                        print(f"Title: {chat['title']}")
                    print("---")
        else:
            print("No recent messages found. Send a message to your bot first.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Getting your Telegram Chat ID...")
    print("Make sure you've sent a message to your bot first!")
    print()
    get_chat_id()