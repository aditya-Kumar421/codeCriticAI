const logger = require('../utils/logger');

// Middleware to log all requests and responses
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const endpoint = `${req.method} ${req.path}`;
    
    // Log incoming request
    logger.logRequest(req, endpoint);
    
    // Capture the original res.json and res.send methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override res.json to log responses
    res.json = function(data) {
        const duration = Date.now() - startTime;
        logger.logResponse(req, res, endpoint, duration);
        return originalJson.call(this, data);
    };
    
    // Override res.send to log responses
    res.send = function(data) {
        const duration = Date.now() - startTime;
        logger.logResponse(req, res, endpoint, duration);
        return originalSend.call(this, data);
    };
    
    // Handle cases where response ends without json/send
    res.on('finish', () => {
        if (!res._logged) {
            const duration = Date.now() - startTime;
            logger.logResponse(req, res, endpoint, duration);
            res._logged = true;
        }
    });
    
    next();
};

// Error handling middleware
const errorLogger = (error, req, res, next) => {
    const duration = Date.now() - req.startTime;
    const endpoint = `${req.method} ${req.path}`;
    
    logger.logResponse(req, res, endpoint, duration, error);
    
    // Don't call next() here to avoid infinite loops
    // The actual error response should be handled by individual controllers
};

// Async error wrapper
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        req.startTime = Date.now();
        Promise.resolve(fn(req, res, next)).catch((error) => {
            const duration = Date.now() - req.startTime;
            const endpoint = `${req.method} ${req.path}`;
            
            logger.logResponse(req, res, endpoint, duration, error);
            
            // Send error response if headers haven't been sent
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: "Internal server error",
                    message: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
                });
            }
        });
    };
};

module.exports = {
    requestLogger,
    errorLogger,
    asyncErrorHandler
};