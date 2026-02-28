// src/server.js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const logger = require('./utils/logger');
const orchestrator = require('./services/orchestrator.service');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Subscribe to research updates
    socket.on('subscribe', (researchId) => {
        socket.join(`research:${researchId}`);
        logger.info(`Client ${socket.id} subscribed to ${researchId}`);
    });

    socket.on('unsubscribe', (researchId) => {
        socket.leave(`research:${researchId}`);
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Forward orchestrator events to WebSocket
orchestrator.on('progress', (data) => {
    io.to(`research:${data.researchId}`).emit('researchProgress', data);
});

orchestrator.on('completed', (data) => {
    io.to(`research:${data.researchId}`).emit('researchCompleted', data);
});

orchestrator.on('failed', (data) => {
    io.to(`research:${data.researchId}`).emit('researchFailed', data);
});

orchestrator.on('cancelled', (data) => {
    io.to(`research:${data.researchId}`).emit('researchCancelled', data);
});

// Start server
server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📡 WebSocket server enabled`);
    logger.info(`🔗 Client URL: ${CLIENT_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});