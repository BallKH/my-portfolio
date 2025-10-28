// Global in-memory storage (works across Vercel functions)
global.messageStore = global.messageStore || new Map();

export function getMessages(sessionId) {
    try {
        return global.messageStore.get(sessionId) || [];
    } catch (error) {
        console.error('Error reading messages:', error);
        return [];
    }
}

export function addMessage(sessionId, message) {
    try {
        if (!global.messageStore.has(sessionId)) {
            global.messageStore.set(sessionId, []);
        }
        
        global.messageStore.get(sessionId).push(message);
        console.log('Message added to session:', sessionId, message);
        return true;
    } catch (error) {
        console.error('Error storing message:', error);
        return false;
    }
}

export function getAllSessions() {
    try {
        const sessions = {};
        for (const [sessionId, messages] of global.messageStore.entries()) {
            sessions[sessionId] = messages;
        }
        return sessions;
    } catch (error) {
        console.error('Error reading all sessions:', error);
        return {};
    }
}