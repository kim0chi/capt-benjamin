'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNavigation, type NavTab } from '@/components/BottomNavigation'
import { DashboardScreen } from '@/components/screens/DashboardScreen'
import { LeaksScreen } from '@/components/screens/BudgetsScreen'
import { IslandScreen } from '@/components/screens/InsightsScreen'
import { CaptainChatScreen } from '@/components/screens/CaptainChatScreen'
import { AlertsScreen } from '@/components/screens/TransactionsScreen'
import { HealthScoreScreen } from '@/components/screens/SettingsScreen'
import { LoginScreen } from '@/components/screens/LoginScreen'
import { OnboardingScreen } from '@/components/screens/OnboardingScreen'
import { CaptainHeader } from '@/components/CaptainHeader'
import { useAppState } from '@/hooks/useAppState'
import type { AIAction } from '@/types'

type SubView = 'none' | 'health' | 'login' | 'onboarding'

const TAB_ORDER: NavTab[] = ['home', 'leaks', 'island', 'alerts']

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [subView, setSubView] = useState<SubView>('login')
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
    if (subView === 'login') {
      return <LoginScreen onLogin={() => setSubView('onboarding')} />
    }
    if (subView === 'onboarding') {
      return <OnboardingScreen onComplete={() => setSubView('none')} />
    }
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
      <div className="mx-auto max-w-md md:max-w-2xl relative">
        {subView === 'none' && (
          <CaptainHeader onExpandChat={() => setChatOpen(true)} />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={subView !== 'none' ? subView : activeTab}
            initial={{ opacity: 0, x: slideDir === 'left' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDir === 'left' ? -20 : 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onTouchStart={subView === 'none' ? handleTouchStart : undefined}
            onTouchEnd={subView === 'none' ? handleTouchEnd : undefined}
            className={subView === 'none' ? 'pb-20 pt-20' : ''} 
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav — hidden during subView */}
      {subView === 'none' && (
        <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
      )}

      {/* Captain chat overlaid via framer motion */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: '-100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex flex-col bg-navy/95 backdrop-blur-3xl pt-safe"
          >
            <div className="absolute top-6 right-6 z-50">
              <button 
                onClick={() => setChatOpen(false)}
                className="rounded-full bg-ink/80 p-2 px-4 font-bold text-xs uppercase tracking-widest text-bone border border-brass/20"
              >
                Close Link
              </button>
            </div>
            <div className="flex-1 overflow-hidden pt-12">
              <CaptainChatScreen onStateUpdate={handleAIAction} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
