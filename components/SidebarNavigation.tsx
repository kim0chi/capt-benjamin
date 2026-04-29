'use client'

import { motion } from 'framer-motion'
import { Anchor, CloudLightning, Home, PiggyBank, Target, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { NavTab } from '@/components/BottomNavigation'

interface SidebarNavigationProps {
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

export function SidebarNavigation({ activeTab, onTabChange, onProfileTap }: SidebarNavigationProps) {
  return (
    <aside className="hidden h-screen w-72 shrink-0 p-4 md:flex lg:hidden">
      <div className="surface-panel flex w-full flex-col rounded-[2rem] px-4 py-5">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Kapitan</h2>
            <p className="label-kicker">Money guidance system</p>
          </div>
        </div>

        <nav className="mt-8 flex-1 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const { Icon } = tab

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex w-full items-center gap-4 rounded-[1.35rem] px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-background text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute left-0 h-9 w-1 rounded-r-md bg-accent"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-4 flex items-center justify-between rounded-[1.35rem] border border-border/80 bg-background/60 px-3 py-3">
          <div>
            <p className="label-kicker">Display</p>
            <p className="mt-1 text-sm font-semibold text-foreground">Switch theme</p>
          </div>
          <ThemeToggle />
        </div>

        <button
          onClick={onProfileTap}
          className="mt-3 flex w-full items-center gap-3 rounded-[1.35rem] border border-border/80 bg-background/60 px-4 py-3 text-left text-foreground transition-colors hover:bg-background"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Profile</p>
            <p className="text-xs text-muted-foreground">Account and demo settings</p>
          </div>
        </button>
      </div>
    </aside>
  )
}
