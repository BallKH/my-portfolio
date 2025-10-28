#!/usr/bin/env python3
"""
Quick start script for Portfolio Telegram Bot
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "python-telegram-bot", "requests"])
        print("✅ Packages installed successfully!")
    except subprocess.CalledProcessError:
        print("❌ Failed to install packages")
        return False
    return True

def run_bot():
    """Run the Telegram bot"""
    print("🤖 Starting Portfolio Telegram Bot...")
    print("Bot Token: 7521339424:AAHVUtusUfEVGln14aEzpZI9122RT312Nc8")
    print("API URL: http://localhost:3000/api")
    print("\n📱 Available Commands:")
    print("/start - Show bot info")
    print("/reply <session_ID> <message> - Send reply to visitor")
    print("/check <session_ID> - Check session messages")
    print("/sessions - List active sessions")
    print("\n🚀 Starting bot... Press Ctrl+C to stop")
    
    try:
        from telegram_portfolio_bot import PortfolioTelegramBot
        bot = PortfolioTelegramBot()
        bot.run()
    except ImportError:
        print("❌ Error: telegram_portfolio_bot.py not found")
    except Exception as e:
        print(f"❌ Error starting bot: {e}")

if __name__ == "__main__":
    print("🎯 Portfolio Telegram Bot Setup")
    print("=" * 40)
    
    # Check if packages are installed
    try:
        import telegram
        print("✅ python-telegram-bot is installed")
    except ImportError:
        if not install_requirements():
            sys.exit(1)
    
    # Run the bot
    run_bot()