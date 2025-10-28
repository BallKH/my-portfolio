// Simple file-based message storage for Vercel
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = '/tmp/messages.json';

export function getMessages(sessionId) {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            return [];
        }
        const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
        return data[sessionId] || [];
    } catch (error) {
        console.error('Error reading messages:', error);
        return [];
    }
}

export function addMessage(sessionId, message) {
    try {
        let data = {};
        if (fs.existsSync(STORAGE_FILE)) {
            data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
        }
        
        if (!data[sessionId]) {
            data[sessionId] = [];
        }
        
        data[sessionId].push(message);
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error storing message:', error);
        return false;
    }
}

export function getAllSessions() {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            return {};
        }
        return JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    } catch (error) {
        console.error('Error reading all sessions:', error);
        return {};
    }
}