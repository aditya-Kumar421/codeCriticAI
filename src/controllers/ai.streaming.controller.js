const { generateContentStream } = require('../services/ai.streaming.service');
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
    console.log(`Processing streaming AI request - RequestId: ${requestId}, Endpoint: POST /ai/stream`);
    
    try {
        const code = req.body.prompt;

        if (!code) {
            const userIP = getUserIP(req);
            console.log(`Invalid streaming request: missing prompt - RequestId: ${requestId}, UserIP: ${userIP}, Body:`, req.body);
            
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

        console.log(`Processing streaming code analysis - RequestId: ${requestId}, UserIP: ${userIP}, SessionId: ${sessionId}, CodeLength: ${code.length}, UserAgent: ${userAgent.substring(0, 100)}`);

        // Set headers for Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        console.log(`SSE headers set, starting stream - RequestId: ${requestId}, SessionId: ${sessionId}`);

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
                
                console.log(`Streaming chunk to client - RequestId: ${requestId}, SessionId: ${sessionId}, ChunkNumber: ${chunksStreamed}, ChunkType: ${chunk.type}`);
                
                // Send chunk as Server-Sent Event
                res.write(`data: ${JSON.stringify({
                    ...chunk,
                    requestId: requestId
                })}\n\n`);
                
                // If it's a completion or error, we can close
                if (chunk.type === 'complete' || chunk.type === 'error') {
                    console.log(`Stream completed - RequestId: ${requestId}, SessionId: ${sessionId}, ChunksStreamed: ${chunksStreamed}, CompletionType: ${chunk.type}`);
                    break;
                }
            }
        } catch (streamError) {
            console.error(`Streaming generation error - RequestId: ${requestId}, SessionId: ${sessionId}, ChunksStreamed: ${chunksStreamed}, Error: ${streamError.message}`);
            console.error(`Stack trace:`, streamError.stack);
            
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
        
        console.log(`Streaming request completed successfully - RequestId: ${requestId}, SessionId: ${sessionId}, TotalChunks: ${chunksStreamed}`);

    } catch (error) {
        const userIP = getUserIP(req);
        console.error(`Streaming controller error - RequestId: ${requestId}, Error: ${error.message}, UserIP: ${userIP}, Endpoint: POST /ai/stream`);
        console.error(`Stack trace:`, error.stack);
        
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