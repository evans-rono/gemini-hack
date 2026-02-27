import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import ChatPanel from './ChatPanel'
import ChatInput from './ChatInput'
import ReportPanel from './ReportPanel'
import {
  startResearch,
  getResearchProgress,
  getReport,
  getSources,
} from '../services/api'

/**
 * Dashboard — the main 3-panel research interface.
 *
 * Layout:  Sidebar | ChatPanel + ChatInput | ReportPanel
 *
 * Data flow:
 *   1. User enters a query in ChatInput.
 *   2. Dashboard calls `startResearch(query)` which returns `{ id, status }`.
 *   3. Dashboard polls `getResearchProgress(id)` to receive live logs & sources.
 *   4. When complete, it fetches the full report with `getReport(id)`.
 *   5. ReportPanel renders the report and can export via the API.
 *
 * All data comes from the backend — no mock/fake data here.
 */

const POLL_INTERVAL = 1500 // ms between progress polls

export default function Dashboard({ onBack }) {
  // ── State ──
  const [status, setStatus] = useState('idle')        // idle | thinking | complete | error
  const [query, setQuery] = useState('')
  const [researchId, setResearchId] = useState(null)
  const [logs, setLogs] = useState([])
  const [sources, setSources] = useState([])
  const [report, setReport] = useState(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const pollRef = useRef(null)

  // ── Helpers ──

  function addLog(type, message) {
    setLogs(prev => [...prev, { type, message, ts: Date.now() }])
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  // ── Start research ──
  const handleSend = useCallback(async (text) => {
    // Reset state
    setStatus('thinking')
    setQuery(text)
    setLogs([])
    setSources([])
    setReport(null)
    setProgress(0)
    setError(null)

    addLog('info', `Starting research: "${text}"`)

    try {
      // 1) Kick off the research session
      const { id } = await startResearch(text)
      setResearchId(id)
      addLog('info', `Research session started (id: ${id.slice(0, 8)}…)`)

      // 2) Poll for progress
      pollRef.current = setInterval(async () => {
        try {
          const data = await getResearchProgress(id)

          // Merge incoming logs
          if (data.logs?.length) {
            setLogs(prev => {
              const existingCount = prev.length
              const newLogs = data.logs.slice(existingCount).map(l => ({
                type: l.type || 'info',
                message: l.message,
                ts: l.ts || Date.now(),
              }))
              return [...prev, ...newLogs]
            })
          }

          // Merge sources
          if (data.sources?.length) {
            setSources(data.sources)
          }

          // Update progress
          if (typeof data.progress === 'number') {
            setProgress(data.progress)
          }

          // Check completion
          if (data.status === 'complete') {
            stopPolling()
            setProgress(100)
            addLog('done', 'Research complete — generating report')

            // 3) Fetch the final report
            try {
              const reportData = await getReport(id)
              setReport(reportData)
            } catch {
              addLog('error', 'Failed to fetch report')
            }

            // 4) Fetch final sources
            try {
              const srcData = await getSources(id)
              setSources(Array.isArray(srcData) ? srcData : srcData.sources || [])
            } catch {
              // sources may already be populated from polling
            }

            setStatus('complete')
          }

          // Check for error
          if (data.status === 'error') {
            stopPolling()
            setStatus('error')
            setError(data.error || 'Research failed')
            addLog('error', data.error || 'Research encountered an error')
          }
        } catch (err) {
          // Polling error — don't stop, backend might recover
          console.warn('Poll error:', err.message)
        }
      }, POLL_INTERVAL)
    } catch (err) {
      setStatus('error')
      setError(err.message)
      addLog('error', `Failed to start research: ${err.message}`)
    }

    // Cleanup on unmount
    return () => stopPolling()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex w-full h-full bg-slate-950 noise-overlay"
    >
      {/* ── Left: Sidebar ── */}
      <Sidebar onBack={onBack} activeResearchId={researchId} />

      {/* ── Center: Chat feed + input ── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800/40">
        <ChatPanel
          status={status}
          logs={logs}
          sources={sources}
          query={query}
        />

        <ChatInput
          onSend={handleSend}
          disabled={status === 'thinking'}
          progress={progress}
        />
      </div>

      {/* ── Right: Report panel ── */}
      <div className="w-105 shrink-0 hidden lg:flex lg:flex-col">
        <ReportPanel
          report={report}
          researchId={researchId}
          sources={sources}
        />
      </div>

      {/* ── Error toast ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm shadow-xl"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  )
}
