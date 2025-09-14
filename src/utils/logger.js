const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatTimestamp() {
        return new Date().toISOString();
    }

    formatLogEntry(level, message, meta = {}) {
        return JSON.stringify({
            timestamp: this.formatTimestamp(),
            level: level.toUpperCase(),
            message,
            meta,
            pid: process.pid
        }) + '\n';
    }

    writeToFile(filename, content) {
        const filePath = path.join(this.logDir, filename);
        fs.appendFileSync(filePath, content);
    }

    log(level, message, meta = {}) {
        const logEntry = this.formatLogEntry(level, message, meta);
        
        // Write to console with color coding
        this.logToConsole(level, message, meta);
        
        // Write to appropriate log files
        this.writeToFile('app.log', logEntry);
        
        if (level === 'error') {
            this.writeToFile('error.log', logEntry);
        }
        
        if (level === 'warn') {
            this.writeToFile('warn.log', logEntry);
        }
    }

    logToConsole(level, message, meta) {
        const timestamp = this.formatTimestamp();
        const colors = {
            error: '\x1b[31m',   // Red
            warn: '\x1b[33m',    // Yellow
            info: '\x1b[36m',    // Cyan
            debug: '\x1b[35m',   // Magenta
            success: '\x1b[32m'  // Green
        };
        const reset = '\x1b[0m';
        const color = colors[level] || colors.info;
        
        console.log(`${color}[${timestamp}] ${level.toUpperCase()}:${reset} ${message}`);
        
        if (Object.keys(meta).length > 0) {
            console.log(`${color}Meta:${reset}`, meta);
        }
    }

    // Specific logging methods
    error(message, meta = {}) {
        this.log('error', message, meta);
    }

    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    info(message, meta = {}) {
        this.log('info', message, meta);
    }

    debug(message, meta = {}) {
        this.log('debug', message, meta);
    }

    success(message, meta = {}) {
        this.log('success', message, meta);
    }

    // Endpoint-specific logging
    logRequest(req, endpoint) {
        this.info(`Incoming request to ${endpoint}`, {
            method: req.method,
            endpoint,
            ip: req.ip || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            contentLength: req.headers['content-length'] || 0,
            sessionId: req.headers['x-session-id'] || req.body?.sessionId || 'none'
        });
    }

    logResponse(req, res, endpoint, duration, error = null) {
        const meta = {
            method: req.method,
            endpoint,
            ip: req.ip || 'unknown',
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            sessionId: req.headers['x-session-id'] || req.body?.sessionId || 'none'
        };

        if (error) {
            this.error(`Request failed for ${endpoint}`, {
                ...meta,
                error: error.message,
                stack: error.stack
            });
        } else {
            this.info(`Request completed for ${endpoint}`, meta);
        }
    }

    logDatabaseOperation(operation, collection, data = {}) {
        this.info(`Database operation: ${operation}`, {
            collection,
            operation,
            ...data
        });
    }

    logDatabaseError(operation, collection, error) {
        this.error(`Database operation failed: ${operation}`, {
            collection,
            operation,
            error: error.message,
            stack: error.stack
        });
    }

    logAIOperation(type, meta = {}) {
        this.info(`AI operation: ${type}`, {
            type,
            ...meta
        });
    }

    logAIError(type, error, meta = {}) {
        this.error(`AI operation failed: ${type}`, {
            type,
            error: error.message,
            stack: error.stack,
            ...meta
        });
    }
}

// Export singleton instance
module.exports = new Logger();