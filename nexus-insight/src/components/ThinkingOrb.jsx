/**
 * ThinkingOrb — premium animated status indicator.
 * Three concentric spinning rings when active, emerald glow when complete.
 */
export default function ThinkingOrb({ active, size = 'md' }) {
  const dims = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11'
  const vb = size === 'sm' ? 32 : 44
  const outerR = size === 'sm' ? 12 : 18
  const midR = size === 'sm' ? 9 : 14
  const orbitR = size === 'sm' ? 15 : 22

  return (
    <div className={`relative ${dims} flex items-center justify-center shrink-0`}>
      {/* Ambient glow */}
      {active && (
        <div className="absolute inset-0 rounded-full bg-electric/12 blur-lg orb-core-pulse" />
      )}

      {/* Core dot */}
      <div className={`rounded-full transition-all duration-700 ${
        active
          ? 'w-2.5 h-2.5 bg-electric shadow-[0_0_10px_rgba(37,99,235,0.7),0_0_25px_rgba(37,99,235,0.25)] orb-core-pulse'
          : 'w-2 h-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5),0_0_20px_rgba(52,211,153,0.15)]'
      }`} />

      {/* Ring 1 — outer */}
      {active && (
        <div className="absolute inset-0 orb-ring-1">
          <svg className="w-full h-full" viewBox={`0 0 ${vb} ${vb}`}>
            <circle cx={vb/2} cy={vb/2} r={outerR} fill="none" stroke="rgba(37,99,235,0.2)" strokeWidth="1.5" strokeDasharray="8 5 3 5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Ring 2 — mid reverse */}
      {active && (
        <div className="absolute inset-0 orb-ring-2">
          <svg className="w-full h-full" viewBox={`0 0 ${vb} ${vb}`}>
            <circle cx={vb/2} cy={vb/2} r={midR} fill="none" stroke="rgba(96,165,250,0.15)" strokeWidth="0.8" strokeDasharray="4 7" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Ring 3 — orbit */}
      {active && (
        <div className="absolute -inset-1.5 orb-ring-3">
          <svg className="w-full h-full" viewBox={`0 0 ${vb + 12} ${vb + 12}`}>
            <circle cx={(vb+12)/2} cy={(vb+12)/2} r={orbitR} fill="none" stroke="rgba(37,99,235,0.08)" strokeWidth="0.5" strokeDasharray="2 12" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Complete ring */}
      {!active && (
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox={`0 0 ${vb} ${vb}`}>
            <circle cx={vb/2} cy={vb/2} r={outerR - 2} fill="none" stroke="rgba(52,211,153,0.15)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  )
}
