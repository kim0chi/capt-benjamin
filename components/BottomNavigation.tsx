'use client'

import { motion } from 'framer-motion'
import { Anchor, Droplets, Mountain, CloudLightning } from 'lucide-react'

export type NavTab = 'home' | 'leaks' | 'island' | 'alerts'

interface BottomNavigationProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
  { id: 'home',   label: 'Log',    icon: <Anchor className="h-5 w-5" /> },
  { id: 'leaks',  label: 'Leaks',  icon: <Droplets className="h-5 w-5" /> },
  { id: 'island', label: 'Map',    icon: <Mountain className="h-5 w-5" /> },
  { id: 'alerts', label: 'Storms', icon: <CloudLightning className="h-5 w-5" /> },
]

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brass/10 bg-ink/80 pb-safe backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex h-[74px] max-w-md items-center justify-around px-2 md:max-w-2xl">
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
                  className="absolute top-1 h-1.5 w-10 py-1 rounded-full shadow-[0_0_14px_rgba(198,161,91,0.45)] flex justify-center items-start"
                >
                  <span className="w-10 h-1.5 bg-brass rounded-full" />
                </motion.span>
              )}

              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#f3e5cc' : '#8d9cba'
                }}
                className={
                  isActive
                    ? 'flex h-9 w-12 items-center justify-center rounded-full mt-1 text-bone drop-shadow-[0_0_8px_rgba(198,161,91,0.5)]'
                    : 'flex h-9 w-12 items-center justify-center rounded-full mt-1'
                }
              >
                {tab.icon}
              </motion.div>

              <span
                className={`text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive ? 'text-brass text-shadow-sm' : 'text-slate-500'
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
