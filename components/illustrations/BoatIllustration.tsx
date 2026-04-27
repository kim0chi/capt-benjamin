'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BoatIllustrationProps {
  healthScore?: number
  leakLabels?: string[]
  status?: 'Floating' | 'Leaking' | 'Stormy'
  className?: string
}

export function BoatIllustration({
  healthScore = 82,
  leakLabels = [],
  status = 'Floating',
  className,
}: BoatIllustrationProps) {
  // Translate healthScore (0-100) into a water height inside the hull (0% to 100%)
  // Lower health = higher water level indicating it's sinking.
  const dangerLevel = Math.max(0, 100 - healthScore)
  const waterLevel = 10 + (dangerLevel * 0.7) // Map 0-100 to 10%-80% water height.

  return (
    <div className={cn('relative w-full aspect-[4/3] rounded-[28px] overflow-hidden bg-gradient-to-b from-navy to-ink shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-6', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal/5 via-navy to-ink opacity-60" />
      
      {/* Decorative stars/grid background */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNjNmExNWIiLz48L3N2Zz4=')] [background-size:24px_24px] mask-image:linear-gradient(to_bottom,white,transparent)" />

      {/* Main Cross-Section Hull SVG Container */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full max-w-[280px] drop-shadow-2xl overflow-visible"
      >
        <defs>
          <linearGradient id="hullGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a2618" />
            <stop offset="100%" stopColor="#1e130c" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.4" />
          </linearGradient>
          <clipPath id="innerHullClip">
            <path d="M 30,50 L 170,50 C 170,120 150,180 100,180 C 50,180 30,120 30,50 Z" />
          </clipPath>
        </defs>

        {/* Outer Hull */}
        <motion.path
          animate={{ y: [0, 4, 0], rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          d="M 20,40 L 180,40 C 180,130 150,190 100,190 C 50,190 20,130 20,40 Z"
          fill="url(#hullGrad)"
          stroke="#c6a15b"
          strokeWidth="3"
        />

        {/* Inner Hull Cross-Section (Empty Cargo) */}
        <motion.path
          animate={{ y: [0, 4, 0], rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          d="M 30,50 L 170,50 C 170,120 150,180 100,180 C 50,180 30,120 30,50 Z"
          fill="#111827"
          stroke="#4b5563"
          strokeWidth="1"
        />

        {/* Leaked Water inside the Hull */}
        <g clipPath="url(#innerHullClip)">
          <motion.rect
            initial={{ height: 0, y: 180 }}
            animate={{ height: `${waterLevel}%`, y: 180 - (180 * (waterLevel / 100)) }}
            transition={{ type: 'spring', damping: 20, stiffness: 40 }}
            x="0"
            width="200"
            fill="url(#waterGrad)"
          />
        </g>

        {/* Cargo Crates */}
        <motion.g 
          animate={{ y: [0, 4, 0], rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <rect x="85" y="140" width="30" height="30" rx="4" fill="#a16207" stroke="#c6a15b" strokeWidth="1.5" />
          <rect x="65" y="110" width="25" height="25" rx="3" fill="#ca8a04" stroke="#c6a15b" strokeWidth="1" />
          <rect x="110" y="115" width="25" height="25" rx="3" fill="#ca8a04" stroke="#c6a15b" strokeWidth="1" />
        </motion.g>

        {/* Leak Drips (Based on leaks) */}
        {leakLabels.length > 0 && (
          <>
            <motion.circle 
              animate={{ cy: [20, 160], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeIn" }}
              cx="50" r="3" fill="#ef4444" 
            />
            <motion.circle 
              animate={{ cy: [20, 160], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeIn", delay: 0.5 }}
              cx="150" r="3" fill="#ef4444" 
            />
          </>
        )}

      </svg>
    </div>
  )
}
