// Analytics Proxy API
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Proxy requests to Clarity
        const clarityUrl = 'https://www.clarity.ms/collect';
        
        const response = await fetch(clarityUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
            },
            body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.text();
        res.status(response.status).send(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy error' });
    }
}