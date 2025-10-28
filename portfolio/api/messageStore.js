// Simple global message storage for replies
if (!global.replyMessages) {
    global.replyMessages = [];
}

export function getReplyMessages(lastId = 0) {
    try {
        console.log('Getting messages, total stored:', global.replyMessages.length);
        console.log('All messages:', global.replyMessages);
        const filtered = global.replyMessages.filter(msg => msg.id > lastId);
        console.log('Filtered messages:', filtered);
        return filtered;
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
        console.log('Total messages now:', global.replyMessages.length);
        return true;
    } catch (error) {
        console.error('Error storing message:', error);
        return false;
    }
}