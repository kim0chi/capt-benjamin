'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Home, Target, User } from 'lucide-react'

export type NavTab = 'home' | 'goals' | 'activity'

interface BottomNavigationProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  onProfileTap?: () => void
}

const mainTabs: Array<{ id: NavTab; label: string; Icon: React.ElementType }> = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'goals', label: 'Goals', Icon: Target },
  { id: 'activity', label: 'Activity', Icon: Activity },
]

export function BottomNavigation({ activeTab, onTabChange, onProfileTap }: BottomNavigationProps) {
  return (
    <nav aria-label="Main navigation" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:hidden">
      <motion.div
        layout
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="flex items-center gap-1 rounded-full bg-card p-2 shadow-lg ring-1 ring-foreground/[0.06] dark:shadow-2xl dark:ring-white/[0.07]"
      >
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id
          const { Icon } = tab

          return (
            <motion.button
              key={tab.id}
              layout
              onClick={() => onTabChange(tab.id)}
              className="relative flex min-h-[44px] items-center justify-center rounded-full px-4 py-3"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="dock-active-bg"
                  className="absolute inset-0 rounded-full bg-background dark:bg-white/[0.08]"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                <Icon
                  className={`h-6 w-6 flex-shrink-0 transition-colors duration-150 ${
                    isActive ? 'text-foreground' : 'text-foreground/35'
                  }`}
                />
                <AnimatePresence mode="popLayout" initial={false}>
                  {isActive && (
                    <motion.span
                      key={tab.id + '-label'}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden whitespace-nowrap text-base font-semibold text-foreground"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </motion.button>
          )
        })}

        {/* Profile — icon-only, opens profile sub-view */}
        <motion.button
          layout
          onClick={onProfileTap}
          className="relative flex min-h-[44px] items-center justify-center rounded-full px-4 py-3"
          aria-label="Profile"
        >
          <User className="h-6 w-6 text-foreground/35" />
        </motion.button>
      </motion.div>
    </nav>
  )
}
