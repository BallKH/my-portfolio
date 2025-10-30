import { messageStore } from './api/messageStore.js';

// Test the message store functionality
console.log('Testing messageStore...');

// Add a test message
messageStore.addMessage('session_ponlork', {
    id: Date.now(),
    text: 'Hello from Ponlork!',
    timestamp: Date.now(),
    sender: 'visitor'
});

// Add a reply
messageStore.addMessage('session_ponlork', {
    id: Date.now() + 1,
    text: 'Hi Ponlork! Thanks for reaching out. How can I help you?',
    timestamp: Date.now() + 1,
    sender: 'support'
});

// Get messages
const messages = messageStore.getMessages('session_ponlork');
console.log('Messages for session_ponlork:', messages);

// Get all sessions
const sessions = messageStore.getAllSessions();
console.log('All sessions:', Object.keys(sessions));

console.log('✅ messageStore is working correctly!');