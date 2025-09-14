const { generateContentStream } = require('../services/ai.streaming.service');
const logger = require('../utils/logger');
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

// Streaming response controller
module.exports.getStreamingResponse = async (req, res) => {
    const requestId = uuidv4();
    logger.info('Processing streaming AI request', { requestId, endpoint: 'POST /ai/stream' });
    
    try {
        const code = req.body.prompt;

        if (!code) {
            logger.warn('Invalid streaming request: missing prompt', { 
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

        logger.info('Processing streaming code analysis', {
            requestId,
            userIP,
            sessionId,
            codeLength: code.length,
            userAgent: userAgent.substring(0, 100)
        });

        // Set headers for Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        logger.debug('SSE headers set, starting stream', { requestId, sessionId });

        // Send initial connection confirmation
        res.write(`data: ${JSON.stringify({
            type: 'connected',
            sessionId: sessionId,
            requestId: requestId,
            timestamp: Date.now()
        })}\n\n`);

        let chunksStreamed = 0;
        
        try {
            // Generate and stream content
            for await (const chunk of generateContentStream(code, userIP, userAgent, sessionId)) {
                chunksStreamed++;
                
                logger.debug('Streaming chunk to client', {
                    requestId,
                    sessionId,
                    chunkNumber: chunksStreamed,
                    chunkType: chunk.type
                });
                
                // Send chunk as Server-Sent Event
                res.write(`data: ${JSON.stringify({
                    ...chunk,
                    requestId: requestId
                })}\n\n`);
                
                // If it's a completion or error, we can close
                if (chunk.type === 'complete' || chunk.type === 'error') {
                    logger.info('Stream completed', {
                        requestId,
                        sessionId,
                        chunksStreamed,
                        completionType: chunk.type
                    });
                    break;
                }
            }
        } catch (streamError) {
            logger.error('Streaming generation error', {
                requestId,
                sessionId,
                chunksStreamed,
                error: streamError.message,
                stack: streamError.stack
            });
            
            res.write(`data: ${JSON.stringify({
                type: 'error',
                data: {
                    error: 'Streaming failed',
                    message: streamError.message,
                    requestId: requestId
                },
                timestamp: Date.now()
            })}\n\n`);
        }

        // End the stream
        res.write('data: [DONE]\n\n');
        res.end();
        
        logger.success('Streaming request completed successfully', {
            requestId,
            sessionId,
            totalChunks: chunksStreamed
        });

    } catch (error) {
        logger.error('Streaming controller error', {
            requestId,
            error: error.message,
            stack: error.stack,
            userIP: getUserIP(req),
            endpoint: 'POST /ai/stream'
        });
        
        // If headers haven't been sent yet, send error response
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false,
                error: "Internal server error",
                message: "Failed to process streaming code analysis",
                requestId
            });
        } else {
            // If streaming has started, send error event
            res.write(`data: ${JSON.stringify({
                type: 'error',
                data: {
                    error: 'Controller error',
                    message: error.message,
                    requestId: requestId
                },
                timestamp: Date.now()
            })}\n\n`);
            res.end();
        }
    }
};