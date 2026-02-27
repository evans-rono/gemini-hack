// src/controllers/research.controller.js
const orchestrator = require('../services/orchestrator.service');
const logger = require('../utils/logger');

class ResearchController {
    async startResearch(req, res) {
        try {
            const { query, depth = 'balanced' } = req.body;

            if (!query || query.trim().length < 5) {
                return res.status(400).json({
                    success: false,
                    error: 'Query must be at least 5 characters long'
                });
            }

            const result = await orchestrator.startResearch(query, { depth });

            if (result.success) {
                res.json({
                    success: true,
                    researchId: result.researchId,
                    message: 'Research started successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Controller error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    getStatus(req, res) {
        try {
            const { researchId } = req.params;
            const status = orchestrator.getStatus(researchId);

            if (!status) {
                return res.status(404).json({
                    success: false,
                    error: 'Research not found'
                });
            }

            res.json({
                success: true,
                status
            });

        } catch (error) {
            logger.error('Controller error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    getActiveResearch(req, res) {
        try {
            const active = orchestrator.getActiveResearch();
            
            res.json({
                success: true,
                active
            });

        } catch (error) {
            logger.error('Controller error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    cancelResearch(req, res) {
        try {
            const { researchId } = req.params;
            const result = orchestrator.cancelResearch(researchId);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Research cancelled'
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Controller error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = new ResearchController();