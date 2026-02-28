import { useRef, useEffect, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, FileText, AlertCircle, CheckCircle2, Terminal } from 'lucide-react'
import ThinkingOrb from './ThinkingOrb'

function StatusBadge({ status }) {
  const map = {
    idle:       { label: 'Ready',        color: 'text-slate-500', dot: 'bg-slate-600' },
    thinking:   { label: 'Researching',  color: 'text-electric-glow', dot: 'bg-electric' },
    complete:   { label: 'Complete',     color: 'text-emerald-400', dot: 'bg-emerald-400' },
    error:      { label: 'Error',        color: 'text-red-400', dot: 'bg-red-400' },
  }
  const s = map[status] || map.idle

  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-medium ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'thinking' ? 'breathe' : ''}`} />
      {s.label}
    </div>
  )
}

function SourceCard({ source, index }) {
  return (
    <motion.a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="flex items-start gap-3 p-3 rounded-lg border border-slate-800/50 bg-slate-900/40 hover:border-electric/20 hover:bg-slate-800/40 transition-all duration-200 group"
    >
      <div className="mt-0.5 p-1.5 rounded-md bg-slate-800/60 text-slate-500 group-hover:text-electric-glow transition-colors">
        <Globe size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-300 truncate group-hover:text-slate-100 transition-colors">
          {source.title || source.url}
        </p>
        {source.snippet && (
          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{source.snippet}</p>
        )}
      </div>
    </motion.a>
  )
}

/* ── Log entry ── */
function LogEntry({ log, index }) {
  const iconMap = {
    info:    <Terminal size={12} className="text-slate-500" />,
    source:  <Globe size={12} className="text-electric-glow" />,
    section: <FileText size={12} className="text-violet-400" />,
    error:   <AlertCircle size={12} className="text-red-400" />,
    done:    <CheckCircle2 size={12} className="text-emerald-400" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="flex items-start gap-2 py-1"
    >
      <span className="mt-0.5 shrink-0">{iconMap[log.type] || iconMap.info}</span>
      <span className="text-xs text-slate-400 leading-relaxed">
        {log.message}
        {log.type === 'info' && !log.final && (
          <span className="cursor-blink" />
        )}
      </span>
    </motion.div>
  )
}

/* ── Main ChatPanel ── */
export default function ChatPanel({ status, logs, sources, query }) {
  const feedRef = useRef(null)

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [logs])

  const isActive = status === 'thinking'
  const isDone = status === 'complete'
  const isIdle = status === 'idle'

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <ThinkingOrb active={isActive} size="sm" />
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Research Feed</h2>
            <StatusBadge status={status} />
          </div>
        </div>

        {isActive && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="typing-dot-1 inline-block w-1 h-1 rounded-full bg-electric" />
            <span className="typing-dot-2 inline-block w-1 h-1 rounded-full bg-electric" />
            <span className="typing-dot-3 inline-block w-1 h-1 rounded-full bg-electric" />
          </div>
        )}
      </div>

      {/* Content area */}
      <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Idle state — no query yet */}
        {isIdle && !query && (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center max-w-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-center mx-auto mb-4">
                <Terminal size={22} className="text-slate-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-400 mb-1">No active research</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter a query below to start a new AI-powered research session. Results will stream here in real time.
              </p>
            </div>
          </div>
        )}

        {/* Active query label */}
        {query && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg border border-slate-800/50 bg-slate-900/50"
          >
            <p className="text-[11px] text-slate-600 font-medium uppercase tracking-wider mb-1">Query</p>
            <p className="text-sm text-slate-200 leading-relaxed">{query}</p>
          </motion.div>
        )}

        {/* Log feed */}
        {logs.length > 0 && (
          <div className="space-y-0.5 font-mono">
            {logs.map((log, i) => (
              <LogEntry key={i} log={log} index={i} />
            ))}
          </div>
        )}

        {/* Discovered sources */}
        {sources.length > 0 && (
          <div>
            <p className="text-[11px] text-slate-600 font-medium uppercase tracking-wider mb-2">
              Sources Discovered ({sources.length})
            </p>
            <div className="space-y-2">
              {sources.map((src, i) => (
                <SourceCard key={i} source={src} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Completion */}
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/15 bg-emerald-500/5"
          >
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-300">Research complete</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Report generated — view it in the Report panel →
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
