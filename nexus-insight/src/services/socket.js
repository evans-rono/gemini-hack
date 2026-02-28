/**
 * socket.js — WebSocket client for real-time research updates.
 *
 * Connects to the backend Socket.IO server and provides methods
 * to subscribe to research progress events. Falls back gracefully
 * if the backend is unreachable.
 */
import { io } from 'socket.io-client'

const WS_URL =
    import.meta.env.VITE_WS_URL || 'http://localhost:5000'

let socket = null

/**
 * Get (or create) the Socket.IO connection.
 */
export function getSocket() {
    if (!socket) {
        socket = io(WS_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            transports: ['websocket', 'polling'],
        })

        socket.on('connect', () => {
            console.log('[WS] Connected:', socket.id)
        })

        socket.on('disconnect', (reason) => {
            console.log('[WS] Disconnected:', reason)
        })

        socket.on('connect_error', (err) => {
            console.warn('[WS] Connection error:', err.message)
        })
    }

    return socket
}

/**
 * Subscribe to real-time updates for a specific research session.
 *
 * @param {string} researchId
 * @param {object} handlers — { onProgress, onCompleted, onFailed }
 * @returns {function} unsubscribe — call to stop listening
 */
export function subscribeToResearch(researchId, handlers = {}) {
    const s = getSocket()

    // Tell the server we want updates for this session
    s.emit('subscribe', researchId)

    // Attach listeners
    const onProgress = (data) => {
        if (data.researchId === researchId && handlers.onProgress) {
            handlers.onProgress(data)
        }
    }

    const onCompleted = (data) => {
        if (data.researchId === researchId && handlers.onCompleted) {
            handlers.onCompleted(data)
        }
    }

    const onFailed = (data) => {
        if (data.researchId === researchId && handlers.onFailed) {
            handlers.onFailed(data)
        }
    }

    s.on('researchProgress', onProgress)
    s.on('researchCompleted', onCompleted)
    s.on('researchFailed', onFailed)

    // Return unsubscribe function
    return () => {
        s.emit('unsubscribe', researchId)
        s.off('researchProgress', onProgress)
        s.off('researchCompleted', onCompleted)
        s.off('researchFailed', onFailed)
    }
}

/**
 * Disconnect the socket entirely.
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}