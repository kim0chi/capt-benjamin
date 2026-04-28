'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface CaptainHeaderProps {
  firstName: string
  captainNote?: string
  onExpandChat?: () => void
  onChat?: () => void
  onProfileTap?: () => void
  scrollContainerRef?: React.RefObject<HTMLElement | null>
}

export function CaptainHeader({ firstName, onChat, onProfileTap, scrollContainerRef }: CaptainHeaderProps) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const container = scrollContainerRef?.current
    const el = container ?? window

    const onScroll = () => {
      const currentY = container ? container.scrollTop : window.scrollY
      const delta = currentY - lastScrollY.current

      if (delta > 6 && currentY > 60) {
        setHidden(true)
      } else if (delta < -4) {
        setHidden(false)
      }

      lastScrollY.current = currentY
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollContainerRef])

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="fixed left-0 right-0 top-0 z-40 px-5 pt-safe lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 py-4 md:max-w-2xl">
        <h1 className="text-xl font-bold text-foreground">
          Hi, {firstName} <span aria-hidden="true">👋</span>
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={onChat}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-75"
            aria-label="Open chat"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </button>

          <ThemeToggle />

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground/70 transition-colors hover:bg-secondary/80"
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
