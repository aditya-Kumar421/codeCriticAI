const aiService = require('../services/ai.service');
const logger = require('../utils/logger');
const { asyncErrorHandler } = require('../middleware/logging');
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

module.exports.getResponse = asyncErrorHandler(async (req, res) => {
    const requestId = uuidv4();
    logger.info('Processing AI request', { requestId, endpoint: 'POST /ai/get-response' });
    
    try {
        const code = req.body.prompt;

        if(!code){
            logger.warn('Invalid request: missing prompt', { 
                requestId,
                userIP: getUserIP(req),
                body: req.body 
            });
            
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

        logger.info('Processing code analysis', {
            requestId,
            userIP,
            sessionId,
            codeLength: code.length,
            userAgent: userAgent.substring(0, 100)
        });

        const response = await aiService(code, userIP, userAgent, sessionId);

        logger.success('AI request completed successfully', {
            requestId,
            userIP,
            sessionId,
            responseLength: response.length
        });

        res.json({
            success: true,
            response: response,
            sessionId: sessionId,
            timestamp: new Date().toISOString(),
            requestId
        });

    } catch (error) {
        logger.error('AI controller error', {
            requestId,
            error: error.message,
            stack: error.stack,
            userIP: getUserIP(req),
            endpoint: 'POST /ai/get-response'
        });
        
        res.status(500).json({ 
            success: false,
            error: "Internal server error",
            message: "Failed to process code analysis",
            requestId
        });
    }
});