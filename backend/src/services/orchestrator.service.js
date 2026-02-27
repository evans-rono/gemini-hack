// src/services/orchestrator.service.js
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');
const logger = require('../utils/logger');
const plannerAgent = require('../agents/planner.agent');
const synthesizerAgent = require('../agents/synthesizer.agent');
const ResearcherAgent = require('../agents/researcher.agent');

class ResearchOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.activeResearch = new Map();
        this.researchHistory = [];
        this.researcherPool = [];
        this.maxConcurrentTasks = parseInt(process.env.MAX_PARALLEL_TASKS) || 3;
        
        // Initialize researcher pool
        this.initializeResearcherPool();
        
        logger.info('ResearchOrchestrator initialized');
    }

    initializeResearcherPool() {
        for (let i = 1; i <= this.maxConcurrentTasks; i++) {
            this.researcherPool.push(new ResearcherAgent(i));
        }
    }

    async startResearch(query, options = {}) {
        const researchId = uuidv4();
        const startTime = Date.now();

        try {
            logger.info(`Starting research [${researchId}]: ${query}`);

            // Create research session
            const research = {
                id: researchId,
                query,
                depth: options.depth || 'balanced',
                status: 'initializing',
                createdAt: new Date().toISOString(),
                tasks: [],
                findings: [],
                progress: 0
            };

            this.activeResearch.set(researchId, research);
            this.emit('started', { researchId, query });

            // PHASE 1: Planning
            research.status = 'planning';
            this.updateProgress(researchId, 10, 'Planning research approach...');

            const planResult = await plannerAgent.execute({
                query,
                depth: research.depth
            });

            if (!planResult.success) {
                throw new Error(`Planning failed: ${planResult.error}`);
            }

            research.plan = planResult.plan;
            research.tasks = planResult.plan.tasks;
            research.status = 'planned';

            this.emit('planned', {
                researchId,
                taskCount: research.tasks.length,
                estimatedTime: planResult.plan.estimatedTime
            });

            // PHASE 2: Research
            research.status = 'researching';
            this.updateProgress(researchId, 20, `Executing ${research.tasks.length} research tasks...`);

            const findings = await this.executeResearchTasks(researchId, research.tasks);
            research.findings = findings;
            research.status = 'researched';

            // PHASE 3: Synthesis
            research.status = 'synthesizing';
            this.updateProgress(researchId, 80, 'Synthesizing findings into report...');

            const synthesisResult = await synthesizerAgent.execute({
                query,
                findings,
                plan: research.plan
            });

            if (!synthesisResult.success) {
                throw new Error(`Synthesis failed: ${synthesisResult.error}`);
            }

            // PHASE 4: Complete
            research.report = synthesisResult.report;
            research.status = 'completed';
            research.completedAt = new Date().toISOString();
            research.duration = Date.now() - startTime;
            research.progress = 100;

            // Archive
            this.researchHistory.push(research);
            this.activeResearch.delete(researchId);

            this.emit('completed', {
                researchId,
                report: synthesisResult.report,
                duration: research.duration
            });

            logger.info(`Research completed [${researchId}] in ${research.duration}ms`);

            return {
                success: true,
                researchId,
                report: synthesisResult.report
            };

        } catch (error) {
            logger.error(`Research failed [${researchId}]:`, error);

            const failedResearch = this.activeResearch.get(researchId);
            if (failedResearch) {
                failedResearch.status = 'failed';
                failedResearch.error = error.message;
                failedResearch.completedAt = new Date().toISOString();
                this.researchHistory.push(failedResearch);
                this.activeResearch.delete(researchId);
            }

            this.emit('failed', {
                researchId,
                error: error.message
            });

            return {
                success: false,
                researchId,
                error: error.message
            };
        }
    }

    async executeResearchTasks(researchId, tasks) {
        const findings = [];
        const totalTasks = tasks.length;
        let completed = 0;

        // Sort tasks by priority
        const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority);

        // Execute tasks with concurrency limit
        for (let i = 0; i < sortedTasks.length; i += this.maxConcurrentTasks) {
            const batch = sortedTasks.slice(i, i + this.maxConcurrentTasks);
            
            const batchPromises = batch.map(async (task, index) => {
                // Get available researcher
                const researcher = this.researcherPool[index % this.researcherPool.length];
                
                const result = await researcher.execute(task);
                
                completed++;
                const progress = 20 + Math.floor((completed / totalTasks) * 60);
                
                this.updateProgress(
                    researchId,
                    progress,
                    `Completed ${completed}/${totalTasks} research tasks`
                );

                return result;
            });

            const batchResults = await Promise.allSettled(batchPromises);
            
            batchResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value.success) {
                    findings.push(result.value);
                } else {
                    logger.warn('Task failed:', result.reason);
                }
            });
        }

        return findings;
    }

    updateProgress(researchId, progress, message) {
        const research = this.activeResearch.get(researchId);
        if (research) {
            research.progress = progress;
            
            this.emit('progress', {
                researchId,
                progress,
                message,
                timestamp: new Date().toISOString()
            });
        }
    }

    getStatus(researchId) {
        // Check active
        const active = this.activeResearch.get(researchId);
        if (active) {
            return {
                id: active.id,
                query: active.query,
                status: active.status,
                progress: active.progress,
                createdAt: active.createdAt,
                isActive: true
            };
        }

        // Check history
        const completed = this.researchHistory.find(r => r.id === researchId);
        if (completed) {
            return {
                id: completed.id,
                query: completed.query,
                status: completed.status,
                completedAt: completed.completedAt,
                hasReport: !!completed.report,
                isActive: false
            };
        }

        return null;
    }

    getActiveResearch() {
        return Array.from(this.activeResearch.values()).map(r => ({
            id: r.id,
            query: r.query,
            status: r.status,
            progress: r.progress,
            createdAt: r.createdAt
        }));
    }

    cancelResearch(researchId) {
        const research = this.activeResearch.get(researchId);
        if (!research) {
            return { success: false, error: 'Research not found' };
        }

        research.status = 'cancelled';
        research.completedAt = new Date().toISOString();

        this.researchHistory.push(research);
        this.activeResearch.delete(researchId);

        this.emit('cancelled', { researchId });

        return { success: true };
    }
}

module.exports = new ResearchOrchestrator();