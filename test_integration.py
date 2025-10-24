import requests
import time

# Test the integration
def test_telegram_to_web():
    """Test sending message from Telegram bot to web chat"""
    
    # Simulate Telegram bot sending message to visitor
    test_payload = {
        "session_id": "test_session_123",
        "message": "Hello from Telegram support!",
        "sender": "support_agent"
    }
    
    try:
        response = requests.post(
            "http://localhost:5000/api/send-to-visitor",
            json=test_payload
        )
        
        if response.status_code == 200:
            print("✅ Message sent successfully to web chat")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Failed to send message: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing integration: {e}")

if __name__ == "__main__":
    print("Testing Telegram to Web integration...")
    test_telegram_to_web()