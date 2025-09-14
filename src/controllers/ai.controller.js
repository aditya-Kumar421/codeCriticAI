const aiService = require('../services/ai.service');
const { v4: uuidv4 } = require('uuid');

// Helper function to get user IP
function getUserIP(req) {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
}

module.exports.getResponse = async (req, res) => {
    const requestId = uuidv4();
    console.log(`Processing AI request - RequestId: ${requestId}, Endpoint: POST /ai/get-response`);
    
    try {
        const code = req.body.prompt;

        if(!code){
            const userIP = getUserIP(req);
            console.log(`Invalid request: missing prompt - RequestId: ${requestId}, UserIP: ${userIP}, Body:`, req.body);
            
            return res.status(400).json({ 
                success: false,
                error: "Prompt is required",
                message: "Please provide code to analyze",
                requestId
            });
        }

        // Get user information
        const userIP = getUserIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const sessionId = req.headers['x-session-id'] || req.body.sessionId || uuidv4();

        console.log(`Processing code analysis - RequestId: ${requestId}, UserIP: ${userIP}, SessionId: ${sessionId}, CodeLength: ${code.length}, UserAgent: ${userAgent.substring(0, 100)}`);

        const response = await aiService(code, userIP, userAgent, sessionId);

        console.log(`AI request completed successfully - RequestId: ${requestId}, UserIP: ${userIP}, SessionId: ${sessionId}, ResponseLength: ${response.length}`);

        res.json({
            success: true,
            response: response,
            sessionId: sessionId,
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        const userIP = getUserIP(req);
        console.error(`AI controller error - RequestId: ${requestId}, Error: ${error.message}, UserIP: ${userIP}, Endpoint: POST /ai/get-response`);
        console.error(`Stack trace:`, error.stack);
        
        res.status(500).json({ 
            success: false,
            error: "Internal server error",
            message: "Failed to process code analysis",
            requestId
        });
    }
};