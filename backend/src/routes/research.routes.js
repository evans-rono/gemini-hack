// src/routes/research.routes.js
const express = require('express');
const router = express.Router();
const rc = require('../controllers/research.controller');

// ── Research lifecycle ──
router.post('/research', rc.startResearch.bind(rc));
router.get('/research/active', rc.getActiveResearch.bind(rc));
router.get('/research/:researchId', rc.getProgress.bind(rc));
router.get('/research/:researchId/report', rc.getReport.bind(rc));
router.get('/research/:researchId/sources', rc.getSources.bind(rc));
router.post('/research/:researchId/export', rc.exportReport.bind(rc));
router.post('/research/:researchId/cancel', rc.cancelResearch.bind(rc));

// ── History & system ──
router.get('/history', rc.getHistory.bind(rc));
router.get('/status', rc.getSystemStatus.bind(rc));

module.exports = router;