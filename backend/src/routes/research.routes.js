// src/routes/research.routes.js
const express = require('express');
const router = express.Router();
const researchController = require('../controllers/research.controller');

// POST /api/research - Start new research
router.post('/research', researchController.startResearch);

// GET /api/research/active - Get active research
router.get('/research/active', researchController.getActiveResearch);

// GET /api/research/:researchId/status - Get research status
router.get('/research/:researchId/status', researchController.getStatus);

// POST /api/research/:researchId/cancel - Cancel research
router.post('/research/:researchId/cancel', researchController.cancelResearch);

module.exports = router;