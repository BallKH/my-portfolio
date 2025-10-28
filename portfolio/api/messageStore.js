// Simple global message storage for replies
global.replyMessages = global.replyMessages || [];

export function getReplyMessages(lastId = 0) {
    try {
        return global.replyMessages.filter(msg => msg.id > lastId);
    } catch (error) {
        console.error('Error reading messages:', error);
        return [];
    }
}

export function addReplyMessage(text) {
    try {
        const message = {
            id: Date.now(),
            text,
            timestamp: Date.now()
        };
        
        global.replyMessages.push(message);
        console.log('Reply message added:', message);
        return true;
    } catch (error) {
        console.error('Error storing message:', error);
        return false;
    }
}