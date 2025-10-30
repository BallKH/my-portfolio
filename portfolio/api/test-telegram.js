// Test endpoint to verify Telegram bot connectivity
export default async function handler(req, res) {
    console.log('🧪 Test endpoint called');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    
    return res.status(200).json({
        success: true,
        message: 'Test endpoint working',
        timestamp: new Date().toISOString(),
        method: req.method,
        userAgent: req.headers['user-agent']
    });
}