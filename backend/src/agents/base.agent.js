// src/agents/base.agent.js
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class BaseAgent {
    constructor(name, type, capabilities = []) {
        this.id = uuidv4();
        this.name = name;
        this.type = type;
        this.capabilities = capabilities;
        this.status = 'idle'; // idle, busy, error
        this.metrics = {
            tasksProcessed: 0,
            successCount: 0,
            errorCount: 0,
            totalTime: 0
        };
    }

    async execute(task) {
        throw new Error('execute() method must be implemented by child class');
    }

    canHandle(task) {
        if (!task.requiredCapabilities || task.requiredCapabilities.length === 0) {
            return true;
        }
        return task.requiredCapabilities.every(cap => this.capabilities.includes(cap));
    }

    updateMetrics(success, duration) {
        this.metrics.tasksProcessed++;
        if (success) {
            this.metrics.successCount++;
        } else {
            this.metrics.errorCount++;
        }
        this.metrics.totalTime += duration;
    }

    getStatus() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: this.status,
            metrics: this.metrics,
            capabilities: this.capabilities
        };
    }
}

module.exports = BaseAgent;