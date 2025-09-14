/*
 * LOGGING MIDDLEWARE - DISABLED
 * This file has been simplified as per user request to remove logger dependency.
 * Application now uses console.log and console.error for basic logging.
 * This middleware provides minimal functionality.
 */

// Simplified request logger - basic console logging
const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.path} - IP: ${req.ip}`);
    next();
};

// Simplified error logger
const errorLogger = (error, req, res, next) => {
    console.error(`Error on ${req.method} ${req.path}:`, error.message);
    next();
};

// Simplified async error handler
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error(`Async error on ${req.method} ${req.path}:`, error.message);
            
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