import { useState, useCallback, useRef, useEffect } from 'react'
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
import { subscribeToResearch } from '../services/socket'

/**
 * Dashboard — the main 3-panel research interface.
 *
 * Uses WebSocket for instant real-time log/source streaming,
 * with REST polling as a fallback to catch any missed updates.
 */

const POLL_INTERVAL = 2000

export default function Dashboard({ onBack }) {
  const [status, setStatus] = useState('idle')
  const [query, setQuery] = useState('')
  const [researchId, setResearchId] = useState(null)
  const [logs, setLogs] = useState([])
  const [sources, setSources] = useState([])
  const [report, setReport] = useState(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const pollRef = useRef(null)
  const unsubRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
      if (unsubRef.current) unsubRef.current()
    }
  }, [])

  function addLog(type, message) {
    setLogs(prev => [...prev, { type, message, ts: Date.now() }])
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  // Handle incoming progress data (from WS or REST)
  const handleProgressData = useCallback((data) => {
    if (data.logs?.length) {
      setLogs(data.logs.map(l => ({
        type: l.type || 'info',
        message: l.message,
        ts: l.ts || Date.now(),
      })))
    }

    if (data.sources?.length) {
      setSources(data.sources)
    }

    if (typeof data.progress === 'number') {
      setProgress(data.progress)
    }

    // Map backend statuses to frontend statuses
    const statusMap = {
      initializing: 'thinking',
      planning: 'thinking',
      researching: 'thinking',
      synthesizing: 'thinking',
      complete: 'complete',
      completed: 'complete',
      failed: 'error',
      error: 'error',
    }
    const mapped = statusMap[data.status]
    if (mapped) setStatus(mapped)
  }, [])

  const handleSend = useCallback(async (text) => {
    // Reset
    setStatus('thinking')
    setQuery(text)
    setLogs([])
    setSources([])
    setReport(null)
    setProgress(0)
    setError(null)

    addLog('info', `Starting research: "${text}"`)

    try {
      const data = await startResearch(text)
      const id = data.id
      setResearchId(id)
      addLog('info', `Session started (${id.slice(0, 8)}…)`)

      // 1) Subscribe via WebSocket for instant updates
      if (unsubRef.current) unsubRef.current()
      unsubRef.current = subscribeToResearch(id, {
        onProgress: (wsData) => handleProgressData(wsData),
        onCompleted: async (wsData) => {
          stopPolling()
          setProgress(100)
          setStatus('complete')

          if (wsData.report) {
            setReport(wsData.report)
          } else {
            try {
              const rpt = await getReport(id)
              setReport(rpt)
            } catch { /* ignore */ }
          }

          if (wsData.sources?.length) {
            setSources(wsData.sources)
          } else {
            try {
              const src = await getSources(id)
              setSources(Array.isArray(src) ? src : [])
            } catch { /* ignore */ }
          }
        },
        onFailed: (wsData) => {
          stopPolling()
          setStatus('error')
          setError(wsData.error || 'Research failed')
        },
      })

      // 2) Also start REST polling as fallback
      pollRef.current = setInterval(async () => {
        try {
          const pollData = await getResearchProgress(id)
          handleProgressData(pollData)

          if (pollData.status === 'complete' || pollData.status === 'completed') {
            stopPolling()
            setProgress(100)
            setStatus('complete')

            try {
              const rpt = await getReport(id)
              setReport(rpt)
            } catch { /* ignore */ }

            try {
              const src = await getSources(id)
              setSources(Array.isArray(src) ? src : [])
            } catch { /* ignore */ }
          }

          if (pollData.status === 'error' || pollData.status === 'failed') {
            stopPolling()
            setStatus('error')
            setError(pollData.error || 'Research failed')
          }
        } catch {
          // Backend unreachable — keep trying
        }
      }, POLL_INTERVAL)

    } catch (err) {
      setStatus('error')
      setError(err.message)
      addLog('error', `Failed to start: ${err.message}`)
    }
  }, [handleProgressData])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex w-full h-full bg-slate-950 noise-overlay"
    >
      {/* Left: Sidebar */}
      <Sidebar onBack={onBack} activeResearchId={researchId} />

      {/* Center: Chat feed + input */}
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

      {/* Right: Report panel */}
      <div className="w-105 shrink-0 hidden lg:flex lg:flex-col">
        <ReportPanel
          report={report}
          researchId={researchId}
          sources={sources}
        />
      </div>

      {/* Error toast */}
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
