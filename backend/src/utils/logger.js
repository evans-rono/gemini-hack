// src/utils/logger.js
const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message, data };
        return JSON.stringify(logEntry);
    }

    info(message, data = null) {
        const logMessage = this.formatMessage('INFO', message, data);
        console.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
        this.writeToFile('info.log', logMessage);
    }

    warn(message, data = null) {
        const logMessage = this.formatMessage('WARN', message, data);
        console.log(`\x1b[33m[WARN]\x1b[0m ${message}`);
        this.writeToFile('warn.log', logMessage);
    }

    error(message, error = null) {
        const logMessage = this.formatMessage('ERROR', message, {
            error: error ? error.message : null,
            stack: error ? error.stack : null
        });
        console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`);
        this.writeToFile('error.log', logMessage);
    }

    writeToFile(filename, logMessage) {
        try {
            const filePath = path.join(this.logDir, filename);
            fs.appendFileSync(filePath, logMessage + '\n');
        } catch {
            // Silently fail file writes — don't crash the server
        }
    }
}

module.exports = new Logger();