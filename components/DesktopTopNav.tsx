'use client'

import { motion } from 'framer-motion'
import { Anchor, CloudLightning, Home, PiggyBank, Target, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { NavTab } from '@/components/BottomNavigation'

interface DesktopTopNavProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  onProfileTap: () => void
}

const tabs: Array<{ id: NavTab; label: string; Icon: React.ElementType }> = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'goals', label: 'Goals', Icon: Target },
  { id: 'bills', label: 'Bills', Icon: CloudLightning },
  { id: 'jars', label: 'Jars', Icon: PiggyBank },
]

export function DesktopTopNav({ activeTab, onTabChange, onProfileTap }: DesktopTopNavProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Desktop navigation"
      className="fixed left-1/2 top-4 z-50 hidden -translate-x-1/2 lg:flex"
    >
      <div className="surface-panel flex items-center gap-1 rounded-full px-2 py-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Anchor className="h-4 w-4" />
        </div>

        <div className="mx-2 h-5 w-px bg-border" />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const { Icon } = tab

          return (
            <motion.button
              key={tab.id}
              layout
              onClick={() => onTabChange(tab.id)}
              className={`relative flex min-h-[44px] items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-150 ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="desktop-nav-active"
                  className="absolute inset-0 rounded-full bg-background/88"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </span>
            </motion.button>
          )
        })}

        <div className="mx-2 h-5 w-px bg-border" />

        <ThemeToggle />

        <button
          onClick={onProfileTap}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
          aria-label="Profile"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </motion.nav>
  )
}
