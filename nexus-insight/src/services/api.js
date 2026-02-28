/**
 * api.js — Service layer for communicating with the Node.js/Gemini backend.
 *
 * All mock data has been removed. This module provides clean async functions
 * that the frontend calls. Each function hits the backend REST API and returns
 * structured data. When the backend isn't running, calls fail gracefully with
 * user-friendly error messages.
 *
 * Expected backend endpoints:
 *   POST /api/research       — Start a new research session
 *   GET  /api/research/:id   — Poll for research progress
 *   GET  /api/research/:id/report   — Get the generated report
 *   GET  /api/research/:id/sources  — Get discovered sources
 *   GET  /api/history        — Get past research sessions
 *   GET  /api/status         — System health check
 *   POST /api/research/:id/export   — Export report in given format
 */

const API_BASE = 'https://gemini-hack12.onrender.com/api'

/* ── Helper ── */

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`

    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    })

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Request failed: ${res.status}`)
    }

    return res.json()
}

/* ── Research ── */

/** Start a new research session. Returns { id, status } */
export async function startResearch(query) {
    return request('/research', {
        method: 'POST',
        body: JSON.stringify({ query }),
    })
}

/** Poll research progress. Returns { status, logs[], sources[], report } */
export async function getResearchProgress(researchId) {
    return request(`/research/${researchId}`)
}

/** Get the full generated report for a completed session */
export async function getReport(researchId) {
    return request(`/research/${researchId}/report`)
}

/** Get sources discovered during research */
export async function getSources(researchId) {
    return request(`/research/${researchId}/sources`)
}

/** Export report in the specified format. Returns { downloadUrl } */
export async function exportReport(researchId, format = 'pdf') {
    return request(`/research/${researchId}/export`, {
        method: 'POST',
        body: JSON.stringify({ format }),
    })
}

/* ── History ── */

/** Get list of past research sessions */
export async function getHistory() {
    return request('/history')
}

/* ── System ── */

/** Health check — returns { status, latency, services } */
export async function getSystemStatus() {
    return request('/status')
}