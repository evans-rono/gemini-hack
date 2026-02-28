// src/controllers/research.controller.js
const orchestrator = require('../services/orchestrator.service');
const logger = require('../utils/logger');

class ResearchController {

    /**
     * POST /api/research
     * Body: { query, depth? }
     * Returns: { id, status }
     */
    async startResearch(req, res) {
        try {
            const { query, depth = 'balanced' } = req.body;

            if (!query || query.trim().length < 5) {
                return res.status(400).json({ error: 'Query must be at least 5 characters long' });
            }

            const result = await orchestrator.startResearch(query, { depth });

            // Return the shape the frontend expects: { id, status }
            res.json({ id: result.id, status: result.status });
        } catch (error) {
            logger.error('startResearch error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /api/research/:researchId
     * Polling endpoint — returns current progress, logs, sources, status
     * Shape: { status, progress, logs[], sources[], error? }
     */
    getProgress(req, res) {
        try {
            const { researchId } = req.params;
            const data = orchestrator.getStatus(researchId);

            if (!data) {
                return res.status(404).json({ error: 'Research not found' });
            }

            res.json(data);
        } catch (error) {
            logger.error('getProgress error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /api/research/:researchId/report
     * Returns the generated report: { id, title, sections[], generatedAt, metadata }
     */
    getReport(req, res) {
        try {
            const { researchId } = req.params;
            const report = orchestrator.getReport(researchId);

            if (!report) {
                return res.status(404).json({ error: 'Report not found — research may still be in progress' });
            }

            res.json(report);
        } catch (error) {
            logger.error('getReport error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /api/research/:researchId/sources
     * Returns sources[]: { url, title, snippet? }
     */
    getSources(req, res) {
        try {
            const { researchId } = req.params;
            const sources = orchestrator.getSources(researchId);

            res.json(sources);
        } catch (error) {
            logger.error('getSources error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * POST /api/research/:researchId/export
     * Body: { format: 'pdf' | 'docx' | 'markdown' }
     * Returns: { downloadUrl } (stub — real export would generate a file)
     */
    exportReport(req, res) {
        try {
            const { researchId } = req.params;
            const { format = 'pdf' } = req.body;

            const report = orchestrator.getReport(researchId);
            if (!report) {
                return res.status(404).json({ error: 'Report not found' });
            }

            // In a real implementation, generate the file and return a download URL.
            // For now, return the report as markdown for any format.
            const markdown = report.sections
                .map(s => `## ${s.title}\n\n${s.content}`)
                .join('\n\n---\n\n');

            res.json({
                downloadUrl: null,
                format,
                content: markdown,
                message: `Export as ${format} — download URL generation is a production feature`,
            });
        } catch (error) {
            logger.error('exportReport error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * POST /api/research/:researchId/cancel
     */
    cancelResearch(req, res) {
        try {
            const { researchId } = req.params;
            const result = orchestrator.cancelResearch(researchId);

            if (!result.success) {
                return res.status(404).json({ error: result.error });
            }

            res.json({ message: 'Research cancelled' });
        } catch (error) {
            logger.error('cancelResearch error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /api/research/active
     */
    getActiveResearch(req, res) {
        try {
            res.json(orchestrator.getActiveResearch());
        } catch (error) {
            logger.error('getActiveResearch error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /api/history
     * Returns array of past sessions: [{ id, query, status, createdAt, completedAt, duration }]
     */
    getHistory(req, res) {
        try {
            res.json(orchestrator.getHistory());
        } catch (error) {
            logger.error('getHistory error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * GET /api/status
     * Health / system status for the sidebar
     * Returns: { status, latency, services: { gemini } }
     */
    getSystemStatus(req, res) {
        try {
            const startTime = Date.now();
            const latency = Date.now() - startTime;

            res.json({
                status: 'online',
                latency,
                uptime: Math.floor(process.uptime()),
                services: {
                    gemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here',
                },
            });
        } catch (error) {
            logger.error('getSystemStatus error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new ResearchController();