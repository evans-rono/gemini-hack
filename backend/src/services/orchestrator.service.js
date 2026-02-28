// src/services/orchestrator.service.js
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');
const logger = require('../utils/logger');
const plannerAgent = require('../agents/planner.agent');
const synthesizerAgent = require('../agents/synthesizer.agent');
const ResearcherAgent = require('../agents/researcher.agent');

/**
 * ResearchOrchestrator
 *
 * Manages the full lifecycle of a research session:
 *   Planning → Researching → Synthesizing → Complete
 *
 * Key feature: accumulates `logs[]` and `sources[]` on each research session
 * so the REST polling endpoint can return real-time progress to the frontend.
 * Also emits events for WebSocket broadcast.
 */
class ResearchOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.activeResearch = new Map();
        this.researchHistory = [];
        this.researcherPool = [];
        this.maxConcurrentTasks = parseInt(process.env.MAX_PARALLEL_TASKS) || 3;

        this.initializeResearcherPool();
        logger.info('ResearchOrchestrator initialized');
    }

    initializeResearcherPool() {
        for (let i = 1; i <= this.maxConcurrentTasks; i++) {
            this.researcherPool.push(new ResearcherAgent(i));
        }
    }

    // ── Helpers ──

    _addLog(research, type, message) {
        const entry = { type, message, ts: Date.now() };
        research.logs.push(entry);
        this.emit('log', { researchId: research.id, log: entry });
    }

    _addSource(research, source) {
        // Avoid duplicates by URL
        if (!research.sources.find(s => s.url === source.url)) {
            research.sources.push(source);
            this.emit('source', { researchId: research.id, source });
        }
    }

    // ── Main pipeline ──

    async startResearch(query, options = {}) {
        const researchId = uuidv4();
        const startTime = Date.now();

        // Create the research session with log & source arrays for real-time polling
        const research = {
            id: researchId,
            query,
            depth: options.depth || 'balanced',
            status: 'initializing',
            createdAt: new Date().toISOString(),
            progress: 0,
            logs: [],
            sources: [],
            tasks: [],
            findings: [],
            report: null,
            error: null,
        };

        this.activeResearch.set(researchId, research);
        this._addLog(research, 'info', `Research session started`);
        this.emit('started', { researchId, query });

        // Run the pipeline async (don't await — let the controller return immediately)
        this._runPipeline(research, startTime).catch(err => {
            logger.error(`Pipeline crash [${researchId}]:`, err);
        });

        return { success: true, id: researchId, status: 'initializing' };
    }

    async _runPipeline(research, startTime) {
        const researchId = research.id;

        try {
            // ── PHASE 1: Planning ──
            research.status = 'planning';
            research.progress = 5;
            this._addLog(research, 'info', 'Analyzing query and planning research approach…');
            this._emitProgress(research);

            const planResult = await plannerAgent.execute({
                query: research.query,
                depth: research.depth,
            });

            if (!planResult.success) {
                throw new Error(`Planning failed: ${planResult.error}`);
            }

            research.plan = planResult.plan;
            research.tasks = planResult.plan.tasks;
            research.progress = 12;
            this._addLog(research, 'info', `Research plan created — ${research.tasks.length} tasks, strategy: "${planResult.plan.strategy}"`);
            this._emitProgress(research);

            // ── PHASE 2: Researching ──
            research.status = 'researching';
            this._addLog(research, 'info', `Executing ${research.tasks.length} research tasks in parallel…`);
            this._emitProgress(research);

            const findings = await this._executeResearchTasks(research);
            research.findings = findings;

            // ── PHASE 3: Synthesis ──
            research.status = 'synthesizing';
            research.progress = 82;
            this._addLog(research, 'info', 'Synthesizing findings into comprehensive report…');
            this._emitProgress(research);

            const synthesisResult = await synthesizerAgent.execute({
                query: research.query,
                findings,
                plan: research.plan,
            });

            if (!synthesisResult.success) {
                throw new Error(`Synthesis failed: ${synthesisResult.error}`);
            }

            // Transform report sections from object → array for frontend compatibility
            const rawReport = synthesisResult.report;
            const sectionsArray = [];
            if (rawReport.executiveSummary) {
                sectionsArray.push({ title: 'Executive Summary', content: rawReport.executiveSummary });
            }
            if (rawReport.sections) {
                for (const [key, value] of Object.entries(rawReport.sections)) {
                    if (value) {
                        const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
                        sectionsArray.push({ title, content: value });
                    }
                }
            }

            research.report = {
                id: rawReport.id,
                title: research.query,
                sections: sectionsArray,
                generatedAt: rawReport.generatedAt,
                metadata: rawReport.metadata,
            };

            // Merge sources from the report
            if (rawReport.sources && rawReport.sources.length) {
                rawReport.sources.forEach(src => {
                    const normalized = typeof src === 'string' ? { url: src, title: src } : { url: src.url, title: src.title || src.url, snippet: src.snippet };
                    this._addSource(research, normalized);
                });
            }

            // ── PHASE 4: Complete ──
            research.status = 'complete';
            research.progress = 100;
            research.completedAt = new Date().toISOString();
            research.duration = Date.now() - startTime;
            this._addLog(research, 'done', `Research complete — ${research.sources.length} sources, report generated in ${(research.duration / 1000).toFixed(1)}s`);
            this._emitProgress(research);

            // Move to history (but keep in active for a while so frontend can still poll)
            this.researchHistory.unshift(research);

            this.emit('completed', {
                researchId,
                report: research.report,
                sources: research.sources,
                duration: research.duration,
            });

            // Remove from active after 5 minutes (frontend has time to fetch)
            setTimeout(() => this.activeResearch.delete(researchId), 5 * 60 * 1000);

            logger.info(`Research completed [${researchId}] in ${research.duration}ms`);

        } catch (error) {
            logger.error(`Research failed [${researchId}]:`, error);

            research.status = 'error';
            research.error = error.message;
            research.completedAt = new Date().toISOString();
            this._addLog(research, 'error', error.message);

            this.researchHistory.unshift(research);

            this.emit('failed', { researchId, error: error.message });

            // Keep in active briefly so frontend can poll the error
            setTimeout(() => this.activeResearch.delete(researchId), 2 * 60 * 1000);
        }
    }

    async _executeResearchTasks(research) {
        const findings = [];
        const totalTasks = research.tasks.length;
        let completed = 0;

        const sortedTasks = [...research.tasks].sort((a, b) => (a.priority || 3) - (b.priority || 3));

        for (let i = 0; i < sortedTasks.length; i += this.maxConcurrentTasks) {
            const batch = sortedTasks.slice(i, i + this.maxConcurrentTasks);

            const batchPromises = batch.map(async(task, index) => {
                const researcher = this.researcherPool[index % this.researcherPool.length];
                this._addLog(research, 'info', `🔍 Researching: ${task.description.substring(0, 80)}…`);

                const result = await researcher.execute(task);

                completed++;
                research.progress = 15 + Math.floor((completed / totalTasks) * 65);

                if (result.success && result.result) {
                    this._addLog(research, 'section', `Completed task ${completed}/${totalTasks}: ${task.description.substring(0, 60)}`);

                    // Add discovered sources in real-time
                    if (result.result.sources && result.result.sources.length) {
                        result.result.sources.forEach(src => {
                            const normalized = typeof src === 'string' ? { url: src, title: src } : { url: src.url || src, title: src.title || src.url || src };
                            this._addSource(research, normalized);
                            this._addLog(research, 'source', `Found source: ${normalized.title}`);
                        });
                    }
                } else {
                    this._addLog(research, 'error', `Task failed: ${task.description.substring(0, 60)}`);
                }

                this._emitProgress(research);
                return result;
            });

            const batchResults = await Promise.allSettled(batchPromises);

            batchResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value && result.value.success) {
                    findings.push(result.value);
                } else {
                    logger.warn('Task failed:', result.reason || (result.value && result.value.error));
                }
            });
        }

        return findings;
    }

    _emitProgress(research) {
        this.emit('progress', {
            researchId: research.id,
            status: research.status,
            progress: research.progress,
            logs: research.logs,
            sources: research.sources,
        });
    }

    // ── Query methods (used by controller) ──

    getResearch(researchId) {
        return this.activeResearch.get(researchId) ||
            this.researchHistory.find(r => r.id === researchId) ||
            null;
    }

    getStatus(researchId) {
        const r = this.getResearch(researchId);
        if (!r) return null;

        return {
            id: r.id,
            query: r.query,
            status: r.status,
            progress: r.progress,
            logs: r.logs || [],
            sources: r.sources || [],
            error: r.error || null,
            createdAt: r.createdAt,
            completedAt: r.completedAt || null,
        };
    }

    getReport(researchId) {
        const r = this.getResearch(researchId);
        return r ? r.report : null;
    }

    getSources(researchId) {
        const r = this.getResearch(researchId);
        return r ? r.sources : [];
    }

    getHistory() {
        return this.researchHistory.map(r => ({
            id: r.id,
            query: r.query,
            status: r.status,
            createdAt: r.createdAt,
            completedAt: r.completedAt,
            duration: r.duration,
        }));
    }

    getActiveResearch() {
        return Array.from(this.activeResearch.values()).map(r => ({
            id: r.id,
            query: r.query,
            status: r.status,
            progress: r.progress,
            createdAt: r.createdAt,
        }));
    }

    cancelResearch(researchId) {
        const research = this.activeResearch.get(researchId);
        if (!research) return { success: false, error: 'Research not found' };

        research.status = 'cancelled';
        research.completedAt = new Date().toISOString();
        this._addLog(research, 'error', 'Research cancelled by user');

        this.researchHistory.unshift(research);
        this.activeResearch.delete(researchId);

        this.emit('cancelled', { researchId });
        return { success: true };
    }
}

module.exports = new ResearchOrchestrator();