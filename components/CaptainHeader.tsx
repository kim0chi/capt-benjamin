'use client'

import { motion } from 'framer-motion'
import { MessageCircle, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface CaptainHeaderProps {
  firstName: string
  captainNote: string
  onChat: () => void
  onProfileTap?: () => void
}

export function CaptainHeader({ firstName, captainNote, onChat, onProfileTap }: CaptainHeaderProps) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 top-0 z-40 px-4 pt-safe lg:hidden"
    >
      <div className="surface-panel mx-auto flex max-w-md items-start justify-between gap-3 rounded-[1.8rem] px-4 py-3 md:max-w-2xl">
        <button onClick={onChat} className="min-w-0 flex-1 text-left" aria-label="Open Kapitan chat">
          <p className="label-kicker">Kapitan</p>
          <h1 className="mt-1 text-lg font-semibold text-foreground">Hi, {firstName}</h1>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{captainNote}</p>
          <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-accent">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Ask what to do next</span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/78 text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground"
            onClick={onProfileTap}
            aria-label="Profile settings"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
