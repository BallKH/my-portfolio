import { createServer } from 'http';
import { parse } from 'url';
import chatHandler from './api/chat.js';

const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    
    if (parsedUrl.pathname === '/api/chat') {
        req.query = parsedUrl.query;
        
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    req.body = JSON.parse(body);
                } catch (e) {
                    req.body = {};
                }
                chatHandler(req, res);
            });
        } else {
            req.body = {};
            chatHandler(req, res);
        }
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(3000, () => {
    console.log('Test server running on http://localhost:3000');
    console.log('Test the API with: http://localhost:3000/api/chat?action=sessions');
});