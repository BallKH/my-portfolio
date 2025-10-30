// Session-based message storage
if (!global.sessionMessages) {
    global.sessionMessages = {};
}

const messageStore = {
    addMessage(sessionId, message) {
        if (!global.sessionMessages[sessionId]) {
            global.sessionMessages[sessionId] = [];
        }
        global.sessionMessages[sessionId].push(message);
    },
    
    getMessages(sessionId, lastMessageId = 0) {
        if (!global.sessionMessages[sessionId]) {
            return [];
        }
        return global.sessionMessages[sessionId].filter(msg => msg.id > lastMessageId);
    },
    
    getAllSessions() {
        return global.sessionMessages;
    }
};

// Legacy functions for backward compatibility
export function getReplyMessages(lastId = 0) {
    const allMessages = [];
    Object.values(global.sessionMessages).forEach(sessionMsgs => {
        allMessages.push(...sessionMsgs);
    });
    return allMessages.filter(msg => msg.id > lastId);
}

export function addReplyMessage(text) {
    const message = {
        id: Date.now(),
        text,
        timestamp: Date.now(),
        sender: 'support'
    };
    
    messageStore.addMessage('default_session', message);
    return true;
}

export { messageStore };