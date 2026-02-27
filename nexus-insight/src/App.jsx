import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'

export default function App() {
  const [page, setPage] = useState('landing')

  return (
    <div className="w-full h-full bg-slate-950">
      <AnimatePresence mode="wait">
        {page === 'landing' ? (
          <LandingPage key="landing" onStart={() => setPage('dashboard')} />
        ) : (
          <Dashboard key="dashboard" onBack={() => setPage('landing')} />
        )}
      </AnimatePresence>
    </div>
  )
}
