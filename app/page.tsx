'use client'

import { useRef, useState } from 'react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { BottomNavigation, type NavTab } from '@/components/BottomNavigation'
import { CaptainFAB } from '@/components/CaptainFAB'
import { DashboardScreen } from '@/components/screens/DashboardScreen'
import { LeaksScreen } from '@/components/screens/BudgetsScreen'
import { IslandScreen } from '@/components/screens/InsightsScreen'
import { CaptainChatScreen } from '@/components/screens/CaptainChatScreen'
import { AlertsScreen } from '@/components/screens/TransactionsScreen'
import { HealthScoreScreen } from '@/components/screens/SettingsScreen'
import { useAppState } from '@/hooks/useAppState'
import type { AIAction } from '@/types'

type SubView = 'none' | 'health'

const TAB_ORDER: NavTab[] = ['home', 'leaks', 'island', 'alerts']

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [subView, setSubView] = useState<SubView>('none')
  const [slideKey, setSlideKey] = useState(0)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')
  const [chatOpen, setChatOpen] = useState(false)
  const touchStartX = useRef(0)

  const { state, patchLeak, prioritizeGoal, contributeToGoal } = useAppState()

  // Navigate between tabs with direction-aware animation
  const navigateToTab = (newTab: NavTab) => {
    if (newTab === activeTab && subView === 'none') return
    const currentIdx = TAB_ORDER.indexOf(activeTab)
    const newIdx = TAB_ORDER.indexOf(newTab)
    setSlideDir(newIdx >= currentIdx ? 'left' : 'right')
    setSlideKey(k => k + 1)
    setActiveTab(newTab)
    setSubView('none')
  }

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 60) return
    const idx = TAB_ORDER.indexOf(activeTab)
    if (diff > 0 && idx < TAB_ORDER.length - 1) navigateToTab(TAB_ORDER[idx + 1])
    else if (diff < 0 && idx > 0) navigateToTab(TAB_ORDER[idx - 1])
  }

  // AI Captain action handler — dispatches state mutations
  const handleAIAction = (action: AIAction) => {
    switch (action.type) {
      case 'PATCH_LEAK':      patchLeak(action.id); break
      case 'PRIORITIZE_GOAL': prioritizeGoal(action.id); break
      case 'CONTRIBUTE_GOAL': contributeToGoal(action.id, action.amount); break
    }
  }

  const renderScreen = () => {
    if (subView === 'health') {
      return (
        <HealthScoreScreen
          boatHealth={state.boatHealth}
          onBack={() => setSubView('none')}
        />
      )
    }

    switch (activeTab) {
      case 'home':
        return (
          <DashboardScreen
            state={state}
            onTabChange={navigateToTab}
            onHealthTap={() => setSubView('health')}
          />
        )
      case 'leaks':
        return <LeaksScreen leaks={state.leaks} patchLeak={patchLeak} />
      case 'island':
        return <IslandScreen goals={state.goals} prioritizeGoal={prioritizeGoal} />
      case 'alerts':
        return <AlertsScreen storms={state.storms} />
      default:
        return (
          <DashboardScreen
            state={state}
            onTabChange={navigateToTab}
            onHealthTap={() => setSubView('health')}
          />
        )
    }
  }

  const slideClass = subView !== 'none' ? '' : slideDir === 'left' ? 'slide-from-right' : 'slide-from-left'

  return (
    <main className="min-h-screen bg-navy text-foreground pirate-page overflow-x-hidden">
      <div className="mx-auto max-w-md md:max-w-2xl">
        <div
          key={slideKey}
          className={slideClass}
          onTouchStart={subView === 'none' ? handleTouchStart : undefined}
          onTouchEnd={subView === 'none' ? handleTouchEnd : undefined}
        >
          {renderScreen()}
        </div>
      </div>

      {/* Bottom nav — hidden during subView */}
      {subView === 'none' && (
        <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
      )}

      {/* Floating Captain FAB — hidden during chat and subView */}
      {subView === 'none' && !chatOpen && (
        <CaptainFAB onClick={() => setChatOpen(true)} />
      )}

      {/* Captain chat drawer via vaul */}
      <Drawer open={chatOpen} onOpenChange={setChatOpen}>
        <DrawerContent
          className="border-t border-brass/25 bg-navy pirate-page"
          style={{ height: '88vh' }}
        >
          <CaptainChatScreen onStateUpdate={handleAIAction} />
        </DrawerContent>
      </Drawer>
    </main>
  )
}
