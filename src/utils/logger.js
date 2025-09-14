/*
 * LOGGER UTILITY - DISABLED
 * This file has been commented out as per user request to remove logger dependency.
 * Application now uses console.log and console.error for basic logging.
 * This file is kept for reference but not used in the application.
 */

// Logger utility disabled - replaced with console.log/console.error
module.exports = {
    error: console.error,
    warn: console.log,
    info: console.log,
    debug: console.log,
    success: console.log,
    log: console.log,
    logRequest: () => {},
    logResponse: () => {},
    logDatabaseOperation: () => {},
    logDatabaseError: () => {},
    logAIOperation: () => {},
    logAIError: () => {}
};