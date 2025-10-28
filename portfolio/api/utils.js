// Unified Utils API Handler
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'health':
                return await handleHealth(req, res);
            case 'status':
                return await handleStatus(req, res);
            case 'info':
                return await handleInfo(req, res);
            default:
                return res.status(400).json({ error: 'Invalid action parameter' });
        }
    } catch (error) {
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
}

async function handleHealth(req, res) {
    return res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
}

async function handleStatus(req, res) {
    return res.status(200).json({ 
        api: 'online',
        version: '1.0.0',
        functions: ['chat', 'telegram', 'utils'],
        timestamp: new Date().toISOString()
    });
}

async function handleInfo(req, res) {
    return res.status(200).json({ 
        project: 'Portfolio Chat System',
        endpoints: {
            chat: '/api/chat?action=[send|get|reply|simple|add|sessions]',
            telegram: '/api/telegram?action=[notify|webhook|debug|test]',
            utils: '/api/utils?action=[health|status|info]'
        },
        documentation: 'https://github.com/BallKH/my-portfolio'
    });
}