'use client'

import { motion } from 'framer-motion'
import { MessageCircle, User } from 'lucide-react'

interface CaptainHeaderProps {
  captainNote: string
  onExpandChat: () => void
  onProfileTap?: () => void
}

export function CaptainHeader({ captainNote, onExpandChat, onProfileTap }: CaptainHeaderProps) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed left-0 right-0 top-0 z-40 border-b border-brass/10 bg-ink/72 px-4 pt-safe backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.28)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-start justify-between gap-3 py-3 md:max-w-2xl">
        <button
          onClick={onExpandChat}
          className="min-w-0 flex-1 text-left"
          aria-label="Open Capt. Benjamin chat"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal">Capt. Benjamin</p>
          <p className="mt-1 truncate text-sm font-semibold text-bone">{captainNote}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-sand/65">
            <MessageCircle className="h-3.5 w-3.5 text-brass" />
            <span>Ask where to put today&apos;s savings</span>
          </div>
        </button>

        <button
          className="relative z-50 flex h-9 w-9 items-center justify-center rounded-full bg-brass/10 text-brass transition-colors hover:bg-brass/18"
          onClick={onProfileTap}
          aria-label="Profile settings"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
