'use client'

import { motion } from 'framer-motion'
import { Anchor, Mountain, ScrollText, User,  } from 'lucide-react'
import type { NavTab } from '@/components/BottomNavigation'

interface SidebarNavigationProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  onProfileTap: () => void
}

const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
  { id: 'home', label: 'Home', icon: <Anchor className="h-5 w-5" /> },
  { id: 'goals', label: 'Goals', icon: <Mountain className="h-5 w-5" /> },
  { id: 'activity', label: 'Activity', icon: <ScrollText className="h-5 w-5" /> },
]

export function SidebarNavigation({ activeTab, onTabChange, onProfileTap }: SidebarNavigationProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-70 h-screen bg-ink/80 border-r border-brass/10 backdrop-blur-xl z-50">
      <div className="flex items-center gap-3 p-6 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wood/40 border border-brass/30 text-brass shadow-lg">
          <Anchor className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display font-bold text-bone tracking-wide">Capt. Benjamin</h2>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-teal">OS v1.0.4</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex w-full items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-wood/20 text-brass shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                  : 'text-sand/50 hover:bg-wood/10 hover:text-sand/80'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveIndicator"
                  className="absolute left-0 w-1 h-8 bg-teal rounded-r-md shadow-[0_0_12px_rgba(76,160,143,0.5)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className={`flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </div>
              
              <span className={`font-semibold tracking-wide ${isActive ? 'text-bone text-shadow-sm' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-brass/10 mt-auto">
        <button
          onClick={onProfileTap}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl hover:bg-wood/20 transition-colors text-sand/80 hover:text-bone group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink border border-brass/20 text-brass group-hover:bg-brass/20 transition-colors">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-start px-1">
             <span className="text-sm font-semibold tracking-wide">Captain&apos;s Quarters</span>
             <span className="text-[10px] uppercase tracking-wider text-sand/50 group-hover:text-teal/80 transition-colors">Profile & Settings</span>
          </div>
        </button>
      </div>
    </aside>
  )
}
