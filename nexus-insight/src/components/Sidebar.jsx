import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Clock, ChevronRight, X,
  Shield, FileText, Settings as SettingsIcon,
  Wifi, Activity, Database, Zap, ExternalLink
} from 'lucide-react'
import { getHistory, getSystemStatus } from '../services/api'

/* ── Modal Shell ── */
function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-800/60 bg-slate-900 shadow-2xl mx-4"
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
            <h2 className="text-base font-semibold text-slate-200">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal body */}
          <div className="px-6 py-5 text-sm text-slate-400 leading-relaxed space-y-4">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Settings Content ── */
function SettingsContent() {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-200 font-medium">Dark Mode</p>
            <p className="text-xs text-slate-500">Application theme preference</p>
          </div>
          <div className="w-10 h-5 rounded-full bg-electric relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-200 font-medium">Auto-save Reports</p>
            <p className="text-xs text-slate-500">Automatically save completed reports</p>
          </div>
          <div className="w-10 h-5 rounded-full bg-electric relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" />
          </div>
        </div>

        <div>
          <p className="text-sm text-slate-200 font-medium mb-2">Citation Style</p>
          <div className="flex gap-2">
            {['APA', 'MLA', 'Chicago'].map(style => (
              <button
                key={style}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-700/60 transition-colors cursor-pointer"
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-slate-200 font-medium mb-2">API Configuration</p>
          <p className="text-xs text-slate-500 mb-2">
            Backend endpoint for the Gemini-powered research API
          </p>
          <div className="px-3 py-2 rounded-lg border border-slate-800/60 bg-slate-950/50 text-xs font-mono text-slate-500">
            {'https://gemini-hack12.onrender.com/api'}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Privacy Content ── */
function PrivacyContent() {
  return (
    <>
      <p>Your privacy matters. Here's how Nexus Insight handles your data:</p>
      <ul className="list-disc list-inside space-y-2 text-xs text-slate-500">
        <li>Research queries are sent to the backend server for processing via the Gemini API.</li>
        <li>We do not store personal information beyond session data required for research continuity.</li>
        <li>All communication between client and server is encrypted via HTTPS in production.</li>
        <li>Research history is stored locally on the server and can be cleared at any time.</li>
        <li>No data is shared with third parties beyond the Gemini API for research processing.</li>
      </ul>
    </>
  )
}

/* ── Terms Content ── */
function TermsContent() {
  return (
    <>
      <p>By using Nexus Insight you agree to the following terms:</p>
      <ul className="list-disc list-inside space-y-2 text-xs text-slate-500">
        <li>The service is provided as-is for informational research purposes.</li>
        <li>AI-generated reports should be verified independently for accuracy.</li>
        <li>Users are responsible for compliance with applicable laws when using generated content.</li>
        <li>We reserve the right to rate-limit API usage to ensure fair access.</li>
        <li>Generated reports remain the intellectual property of the user.</li>
      </ul>
    </>
  )
}

/* ── Main Sidebar ── */
export default function Sidebar({ onBack, activeResearchId }) {
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [systemStatus, setSystemStatus] = useState(null)
  const [modal, setModal] = useState(null) // 'privacy' | 'terms' | 'settings'

  // Fetch research history
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const data = await getHistory()
      setHistory(Array.isArray(data) ? data : data.sessions || [])
    } catch {
      // Backend not available — that's fine, just leave empty
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  // Fetch system status
  const loadStatus = useCallback(async () => {
    try {
      const data = await getSystemStatus()
      setSystemStatus(data)
    } catch {
      setSystemStatus(null)
    }
  }, [])

  // Load data on mount & refresh periodically
  useEffect(() => {
    loadHistory()
    loadStatus()
    const interval = setInterval(loadStatus, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [loadHistory, loadStatus])

  // Re-fetch history when a new research completes
  useEffect(() => {
    if (activeResearchId) loadHistory()
  }, [activeResearchId, loadHistory])

  return (
    <>
      <div className="w-64 h-full flex flex-col border-r border-slate-800/60 bg-slate-950/70">
        {/* Brand header */}
        <div className="px-4 py-4 border-b border-slate-800/60">
          <button
            onClick={onBack}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-electric/10 border border-electric/20 flex items-center justify-center group-hover:bg-electric/15 transition-colors">
              <Zap size={14} className="text-electric-glow" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                Nexus Insight
              </h1>
              <p className="text-[10px] text-slate-600">AI Research Engine</p>
            </div>
          </button>
        </div>

        {/* New research indicator */}
        <div className="px-4 py-3 border-b border-slate-800/40">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Search size={12} />
            <span>Research Dashboard</span>
          </div>
        </div>

        {/* Research History */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider px-1 mb-2">
            History
          </p>

          {loadingHistory ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-10 rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="px-1 py-6 text-center">
              <Clock size={16} className="text-slate-700 mx-auto mb-2" />
              <p className="text-[11px] text-slate-600">No research history</p>
              <p className="text-[10px] text-slate-700 mt-0.5">
                Past sessions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((item, i) => (
                <motion.button
                  key={item.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-slate-800/40 transition-colors group cursor-pointer"
                >
                  <Clock size={12} className="text-slate-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors">
                      {item.query || item.title || 'Untitled'}
                    </p>
                    {item.createdAt && (
                      <p className="text-[10px] text-slate-700 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={11} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="px-4 py-3 border-t border-slate-800/40">
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider mb-2">
            System
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Wifi size={10} /> API
              </span>
              <span className={`flex items-center gap-1 ${
                systemStatus ? 'text-emerald-400' : 'text-slate-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  systemStatus ? 'bg-emerald-400' : 'bg-slate-700'
                }`} />
                {systemStatus ? 'Connected' : 'Offline'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Activity size={10} /> Latency
              </span>
              <span className="text-slate-500 tabular-nums">
                {systemStatus?.latency ? `${systemStatus.latency}ms` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Database size={10} /> Gemini
              </span>
              <span className={`${
                systemStatus?.services?.gemini ? 'text-emerald-400' : 'text-slate-600'
              }`}>
                {systemStatus?.services?.gemini ? 'Active' : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="px-4 py-3 border-t border-slate-800/40 flex items-center gap-3">
          {[
            { label: 'Privacy', icon: Shield, key: 'privacy' },
            { label: 'Terms', icon: FileText, key: 'terms' },
            { label: 'Settings', icon: SettingsIcon, key: 'settings' },
          ].map(link => (
            <button
              key={link.key}
              onClick={() => setModal(link.key)}
              className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
            >
              <link.icon size={10} />
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <Modal open={modal === 'privacy'} onClose={() => setModal(null)} title="Privacy Policy">
        <PrivacyContent />
      </Modal>

      <Modal open={modal === 'terms'} onClose={() => setModal(null)} title="Terms of Service">
        <TermsContent />
      </Modal>

      <Modal open={modal === 'settings'} onClose={() => setModal(null)} title="Settings">
        <SettingsContent />
      </Modal>
    </>
  )
}
