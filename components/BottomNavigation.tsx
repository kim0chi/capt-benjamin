'use client'

import { motion } from 'framer-motion'
import { Anchor, Mountain, ScrollText } from 'lucide-react'

export type NavTab = 'home' | 'goals' | 'activity'

interface BottomNavigationProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
  { id: 'home', label: 'Home', icon: <Anchor className="h-5 w-5" /> },
  { id: 'goals', label: 'Goals', icon: <Mountain className="h-5 w-5" /> },
  { id: 'activity', label: 'Activity', icon: <ScrollText className="h-5 w-5" /> },
]

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brass/10 bg-ink/85 pb-safe backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.24)] md:hidden">
      <div className="mx-auto flex h-18.5 max-w-md items-center justify-around px-2 md:max-w-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1"
            >
              {isActive && (
                <motion.span
                  layoutId="bottomNavIndicator"
                  className="absolute top-1 flex h-1.5 w-10 items-start justify-center rounded-full"
                >
                  <span className="h-1.5 w-10 rounded-full bg-brass shadow-[0_0_14px_rgba(198,161,91,0.36)]" />
                </motion.span>
              )}

              <motion.div
                animate={{
                  scale: isActive ? 1.08 : 1,
                  color: isActive ? '#f3e5cc' : '#8d9cba',
                }}
                className="mt-1 flex h-9 w-12 items-center justify-center rounded-full"
              >
                {tab.icon}
              </motion.div>

              <span
                className={`text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive ? 'text-brass' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
