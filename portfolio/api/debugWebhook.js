export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        // Simulate webhook call
        const { sessionId, message } = req.body;
        
        const webhookData = {
            message: {
                text: `/reply ${sessionId} ${message}`
            }
        };

        try {
            const response = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookData)
            });

            const result = await response.text();
            return res.json({ success: true, webhookResponse: result });
        } catch (error) {
            return res.json({ success: false, error: error.message });
        }
    }

    res.json({ message: 'Debug webhook endpoint' });
}