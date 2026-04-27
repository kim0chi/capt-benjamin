'use client'

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brass/20 bg-ink/95 pb-safe backdrop-blur-md">
      <div className="mx-auto flex h-[74px] max-w-md items-center justify-around px-2 md:max-w-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 active:scale-95"
            >
              {isActive && (
                <span className="absolute top-1 h-1.5 w-10 rounded-full bg-brass shadow-[0_0_14px_rgba(198,161,91,0.45)]" />
              )}

              <div
                className={
                  isActive
                    ? 'flex h-9 w-12 items-center justify-center rounded-full border border-brass/30 bg-wood-light/60 text-brass'
                    : 'flex h-9 w-12 items-center justify-center rounded-full text-muted-foreground'
                }
              >
                {tab.icon}
              </div>

              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  isActive ? 'text-sand' : 'text-muted-foreground'
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
