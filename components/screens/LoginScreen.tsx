'use client'

import { motion } from 'framer-motion'
import { Anchor } from 'lucide-react'

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-navy px-6 text-center pirate-page">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brass/5 via-navy to-ink" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center max-w-sm w-full"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-brass/40 bg-ink/50 text-brass shadow-[0_0_40px_rgba(198,161,91,0.2)] backdrop-blur-md">
          <Anchor className="h-10 w-10" />
        </div>

        <h1 className="font-display text-4xl font-bold text-bone">Capt. Benjamin</h1>
        <p className="mt-3 text-sm text-sand/80">Log your earnings, chart your course, and patch the leaks sinking your wealth.</p>

        <div className="mt-12 w-full space-y-4">
          <button
            onClick={onLogin}
            className="w-full rounded-2xl bg-brass px-4 py-4 text-sm font-bold uppercase tracking-widest text-ink transition-transform active:scale-95 shadow-[0_0_20px_rgba(198,161,91,0.3)] hover:bg-brass/90"
          >
            Board Ship
          </button>
          
          <button className="w-full rounded-2xl border border-brass/20 bg-ink/50 px-4 py-4 text-sm font-semibold tracking-wide text-bone transition-transform active:scale-95 backdrop-blur-sm">
            Review Crew Logs
          </button>
        </div>
      </motion.div>
    </div>
  )
}
