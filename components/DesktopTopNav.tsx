'use client'

import { motion } from 'framer-motion'
import { Activity, Anchor, Home, Target, User } from 'lucide-react'
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
  { id: 'activity', label: 'Activity', Icon: Activity },
]

export function DesktopTopNav({ activeTab, onTabChange, onProfileTap }: DesktopTopNavProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Desktop navigation"
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 hidden lg:flex"
    >
      <div className="flex items-center gap-1 rounded-full bg-card p-2 shadow-lg ring-1 ring-foreground/[0.06] dark:shadow-2xl dark:ring-white/[0.07]">

        {/* Logo mark */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Anchor className="h-4 w-4" />
        </div>

        <div className="mx-2 h-5 w-px bg-foreground/10" />

        {/* Nav tabs — labels always fully visible */}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const { Icon } = tab

          return (
            <motion.button
              key={tab.id}
              layout
              onClick={() => onTabChange(tab.id)}
              className={`relative flex min-h-[44px] items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-150 ${
                isActive ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/70'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="desktop-nav-active"
                  className="absolute inset-0 rounded-full bg-background dark:bg-white/[0.08]"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2.5">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </span>
            </motion.button>
          )
        })}

        <div className="mx-2 h-5 w-px bg-foreground/10" />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Profile */}
        <button
          onClick={onProfileTap}
          className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/[0.05] hover:text-foreground/70"
          aria-label="Profile"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </motion.nav>
  )
}
