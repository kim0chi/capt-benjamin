'use client'

import { motion } from 'framer-motion'
import { CloudLightning, Home, PiggyBank, Target, User } from 'lucide-react'

export type NavTab = 'home' | 'goals' | 'bills' | 'jars'

interface BottomNavigationProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  onProfileTap?: () => void
}

const tabs: Array<{ id: NavTab; label: string; Icon: React.ElementType }> = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'goals', label: 'Goals', Icon: Target },
  { id: 'bills', label: 'Bills', Icon: CloudLightning },
  { id: 'jars', label: 'Jars', Icon: PiggyBank },
]

export function BottomNavigation({ activeTab, onTabChange, onProfileTap }: BottomNavigationProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-safe pt-2 md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-1 rounded-[2rem] border border-border/80 bg-card/90 p-2 shadow-[0_14px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const { Icon } = tab

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex min-h-[52px] flex-1 items-center justify-center rounded-[1.35rem] px-3 transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-[1.35rem] bg-background shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-1">
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]">{tab.label}</span>
              </span>
            </button>
          )
        })}

        {onProfileTap && (
          <>
            <div className="mx-1 h-8 w-px bg-border" />
            <button
              onClick={onProfileTap}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-[1.35rem] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              aria-label="Profile"
            >
              <User className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
