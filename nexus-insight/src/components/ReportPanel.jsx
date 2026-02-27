import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, FileDown, Copy, Check, ChevronDown,
  BookOpen, Clock, Hash, Download
} from 'lucide-react'
import { exportReport } from '../services/api'

const FORMAT_OPTIONS = [
  { id: 'pdf',      label: 'PDF',      icon: FileDown },
  { id: 'docx',     label: 'Word',     icon: FileText },
  { id: 'markdown', label: 'Markdown', icon: Hash },
]

export default function ReportPanel({ report, researchId, sources }) {
  const [format, setFormat] = useState('pdf')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [formatOpen, setFormatOpen] = useState(false)

  const selectedFormat = FORMAT_OPTIONS.find(f => f.id === format)

  // Compute word count & reading time from report sections
  const stats = useMemo(() => {
    if (!report?.sections?.length) return { words: 0, readTime: 0 }
    const text = report.sections.map(s => s.content || '').join(' ')
    const words = text.split(/\s+/).filter(Boolean).length
    return { words, readTime: Math.max(1, Math.ceil(words / 230)) }
  }, [report])

  async function handleCopy() {
    if (!report?.sections?.length) return
    const text = report.sections
      .map(s => `## ${s.title}\n\n${s.content}`)
      .join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownload() {
    if (!researchId || downloading) return
    setDownloading(true)
    try {
      const data = await exportReport(researchId, format)
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const hasReport = report?.sections?.length > 0

  return (
    <div className="flex flex-col h-full border-l border-slate-800/60 bg-slate-950/50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-electric-glow" />
          <h2 className="text-sm font-semibold text-slate-200">Report</h2>
        </div>

        {hasReport && (
          <div className="flex items-center gap-3 text-[11px] text-slate-500 tabular-nums">
            <span className="flex items-center gap-1">
              <Hash size={11} />
              {stats.words.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {stats.readTime} min read
            </span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      {hasReport && (
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800/40">
          {/* Format selector */}
          <div className="relative">
            <button
              onClick={() => setFormatOpen(!formatOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 border border-slate-800/60 rounded-lg bg-slate-900/50 hover:border-slate-700/60 transition-colors cursor-pointer"
            >
              {selectedFormat && <selectedFormat.icon size={12} />}
              {selectedFormat?.label}
              <ChevronDown size={11} className={`text-slate-500 transition-transform ${formatOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {formatOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 z-20 border border-slate-800/60 rounded-lg bg-slate-900 shadow-xl min-w-30 overflow-hidden"
                >
                  {FORMAT_OPTIONS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setFormat(f.id); setFormatOpen(false) }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors cursor-pointer ${
                        f.id === format
                          ? 'text-electric-glow bg-electric/5'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <f.icon size={12} />
                      {f.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 border border-slate-800/60 rounded-lg hover:border-slate-700/60 hover:text-slate-300 transition-colors cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-electric rounded-lg hover:bg-electric-light transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download size={12} />
              {downloading ? 'Exporting…' : 'Export'}
            </button>
          </div>
        </div>
      )}

      {/* Report body */}
      <div className="flex-1 overflow-y-auto p-5">
        {!hasReport ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-50">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-3">
                <FileText size={20} className="text-slate-700" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Report will appear here once research is complete
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="prose-report space-y-6"
          >
            {/* Title */}
            {report.title && (
              <h1 className="text-xl font-serif font-bold text-paper leading-snug mb-1">
                {report.title}
              </h1>
            )}

            {/* Sections */}
            {report.sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <h3 className="text-sm font-serif font-semibold text-slate-200 mb-2 flex items-center gap-2">
                  <span className="text-[10px] text-electric font-mono tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </h3>
                <div className="text-[13px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </div>
              </motion.div>
            ))}

            {/* References */}
            {sources && sources.length > 0 && (
              <div className="pt-4 border-t border-slate-800/40">
                <p className="text-[11px] text-slate-600 font-medium uppercase tracking-wider mb-2">
                  References ({sources.length})
                </p>
                <ol className="space-y-1.5 list-none">
                  {sources.map((src, i) => (
                    <li key={i} className="text-[11px] text-slate-500 flex items-start gap-2">
                      <span className="text-electric/50 font-mono shrink-0">[{i + 1}]</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-electric-glow transition-colors break-all"
                      >
                        {src.title || src.url}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
