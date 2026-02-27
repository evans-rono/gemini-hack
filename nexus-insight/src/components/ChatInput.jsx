import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Mic } from 'lucide-react'

const SUGGESTIONS = [
  'Analyze the impact of AI on healthcare diagnostics',
  'Compare renewable energy adoption across G7 nations',
  'Research quantum computing breakthroughs in 2024',
]

export default function ChatInput({ onSend, disabled, progress }) {
  const [query, setQuery] = useState('')
  const [sent, setSent] = useState(false)
  const inputRef = useRef(null)

  function handleSubmit(e) {
    e?.preventDefault()
    const text = query.trim()
    if (!text || disabled) return

    setSent(true)
    onSend(text)

    setTimeout(() => {
      setQuery('')
      setSent(false)
    }, 500)
  }

  function useSuggestion(s) {
    setQuery(s)
    inputRef.current?.focus()
  }

  return (
    <div className="border-t border-slate-800/60 bg-slate-950/80">
      {/* Progress bar */}
      <AnimatePresence>
        {typeof progress === 'number' && progress > 0 && progress < 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-0.5 bg-slate-900"
          >
            <motion.div
              className="h-full bg-linear-to-r from-electric-dark via-electric to-electric-glow"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4">
        {/* Suggestion chips — visible only when idle and input is empty */}
        <AnimatePresence>
          {!disabled && query === '' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className="flex flex-wrap gap-2 mb-3"
            >
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => useSuggestion(s)}
                  className="text-xs text-slate-400 px-3 py-1.5 rounded-full border border-slate-800/60 bg-slate-900/50 hover:border-electric/30 hover:text-slate-300 hover:bg-slate-800/40 transition-all duration-200 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Attachments */}
          <button
            type="button"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors cursor-pointer"
            title="Attach file"
          >
            <Paperclip size={17} />
          </button>

          {/* Text input */}
          <div className="flex-1 command-glow rounded-xl border border-slate-800/60 bg-slate-900/60 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={disabled ? 'Research in progress…' : 'What should we research?'}
              disabled={disabled}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 px-4 py-3 outline-none disabled:cursor-not-allowed"
            />

            {/* Voice */}
            <button
              type="button"
              className="p-2 mr-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors cursor-pointer"
              title="Voice input"
            >
              <Mic size={16} />
            </button>
          </div>

          {/* Send */}
          <motion.button
            type="submit"
            disabled={!query.trim() || disabled}
            whileTap={{ scale: 0.92 }}
            className={`relative p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
              query.trim() && !disabled
                ? 'bg-electric text-white shadow-[0_0_16px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_rgba(37,99,235,0.5)]'
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
            }`}
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="fly"
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -18, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeIn' }}
                >
                  <Send size={17} />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Send size={17} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ripple on send */}
            {sent && <div className="absolute inset-0 rounded-xl send-ripple pointer-events-none" />}
          </motion.button>
        </form>

        {/* Status hint */}
        {disabled && (
          <p className="text-[11px] text-slate-600 mt-2 text-center tabular-nums">
            Processing — please wait for the current research to finish
          </p>
        )}
      </div>
    </div>
  )
}
