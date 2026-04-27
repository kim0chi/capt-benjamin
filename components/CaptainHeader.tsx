'use client'

import { motion } from 'framer-motion'
import { Anchor, MessageSquareText } from 'lucide-react'

interface CaptainHeaderProps {
  onExpandChat: () => void
}

export function CaptainHeader({ onExpandChat }: CaptainHeaderProps) {
  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 left-0 right-0 z-40 px-4 pt-safe backdrop-blur-xl bg-ink/70 border-b border-brass/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] cursor-pointer active:scale-[0.98] origin-top transition-transform"
      onClick={onExpandChat}
    >
      <div className="mx-auto max-w-md md:max-w-2xl flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brass/40 bg-teal/20 text-brass shadow-[0_0_15px_rgba(76,160,143,0.3)]">
            <Anchor className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal">Comms Link</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
            </div>
            <p className="text-sm font-semibold text-bone truncate max-w-[200px]">
              The ship is steady, but coffee is carving a groove...
            </p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brass/10 text-brass">
          <MessageSquareText className="h-4 w-4" />
        </div>
      </div>
      
      {/* Decorative neon bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal/30 to-transparent" />
    </motion.div>
  )
}
