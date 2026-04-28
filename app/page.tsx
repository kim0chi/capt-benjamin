'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNavigation, type NavTab } from '@/components/BottomNavigation'
import { SidebarNavigation } from '@/components/SidebarNavigation'
import { CaptainHeader } from '@/components/CaptainHeader'
import { DashboardScreen } from '@/components/screens/DashboardScreen'
import { IslandScreen } from '@/components/screens/InsightsScreen'
import { CaptainChatScreen } from '@/components/screens/CaptainChatScreen'
import { ActivityScreen } from '@/components/screens/TransactionsScreen'
import { HealthScoreScreen } from '@/components/screens/HealthScoreScreen'
import { ProfileScreen } from '@/components/screens/ProfileScreen'
import { LandingScreen } from '@/components/screens/LandingScreen'
import { OnboardingScreen } from '@/components/screens/OnboardingScreen'
import { UserOnboardingScreen } from '@/components/screens/UserOnboardingScreen'
import { useAppState } from '@/hooks/useAppState'
import type { AIAction, DemoOnboardingAnswers, SavingsAllocation } from '@/types'

type FrontDoorStage = 'landing' | 'tour' | 'onboarding' | 'app'
type SubView = 'none' | 'health' | 'profile'

const TAB_ORDER: NavTab[] = ['home', 'goals', 'activity']

export default function Home() {
  const [frontDoorStage, setFrontDoorStage] = useState<FrontDoorStage>('landing')
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [subView, setSubView] = useState<SubView>('none')
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')
  const [chatOpen, setChatOpen] = useState(false)
  const touchStartX = useRef(0)

  const {
    state,
    patchLeak,
    prioritizeGoal,
    contributeToGoal,
    logSavingsEntry,
    addGoal,
    applyOnboarding,
    resetDemo,
  } = useAppState()

  const userName = state.userProfile.name.trim() || 'Captain'
  const firstName = userName.split(' ')[0] || userName

  const enterApp = () => {
    setFrontDoorStage('app')
    setActiveTab('home')
    setSubView('none')
    setChatOpen(false)
  }

  const navigateToTab = (newTab: NavTab) => {
    if (newTab === activeTab && subView === 'none') return
    const currentIdx = TAB_ORDER.indexOf(activeTab)
    const newIdx = TAB_ORDER.indexOf(newTab)
    setSlideDir(newIdx >= currentIdx ? 'left' : 'right')
    setActiveTab(newTab)
    setSubView('none')
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const diff = touchStartX.current - event.changedTouches[0].clientX
    if (Math.abs(diff) < 60) return

    const idx = TAB_ORDER.indexOf(activeTab)
    if (diff > 0 && idx < TAB_ORDER.length - 1) navigateToTab(TAB_ORDER[idx + 1])
    if (diff < 0 && idx > 0) navigateToTab(TAB_ORDER[idx - 1])
  }

  const handleAIAction = (action: AIAction) => {
    switch (action.type) {
      case 'PATCH_LEAK':
        patchLeak(action.id)
        break
      case 'PRIORITIZE_GOAL':
        prioritizeGoal(action.id)
        break
      case 'CONTRIBUTE_GOAL':
        contributeToGoal(action.id, action.amount)
        break
      case 'LOG_SAVINGS':
        logSavingsEntry(action.amount, action.allocations, action.sourceNote, action.createdBy ?? 'captain')
        break
      case 'COMPLETE_DAILY_CHECKIN':
        break
    }
  }

  const handleLogSavings = (
    amount: number,
    allocations: SavingsAllocation[],
    sourceNote: string,
    createdBy: 'manual' | 'captain' = 'manual',
  ) => {
    logSavingsEntry(amount, allocations, sourceNote, createdBy)
  }

  const handleLogout = () => {
    setFrontDoorStage('landing')
    setSubView('none')
    setChatOpen(false)
    setActiveTab('home')
  }

  const handleResetDemo = () => {
    resetDemo()
    setSubView('none')
    setChatOpen(false)
    setActiveTab('home')
  }

  const handleOnboardingComplete = (answers: DemoOnboardingAnswers) => {
    applyOnboarding(answers)
    enterApp()
  }

  const priorityGoal = state.goals.find((goal) => goal.isPriority) ?? state.goals[0]
  const topLeak = state.leaks.find((leak) => !leak.patched) ?? state.leaks[0]
  const nextStorm = [...state.storms].sort((a, b) => a.daysUntilDue - b.daysUntilDue)[0]
  const captainNote = state.dailyCheckIn.completed
    ? `${firstName}, today's check-in is logged. ${priorityGoal?.name} moved forward by P${state.dailyCheckIn.totalSaved.toLocaleString()}.`
    : `${firstName}, even P20 toward ${priorityGoal?.name ?? 'your main goal'} keeps the voyage moving.`

  const renderScreen = () => {
    if (subView === 'profile') {
      return (
        <ProfileScreen
          profile={state.userProfile}
          onBack={() => setSubView('none')}
          onLogout={handleLogout}
          onResetDemo={handleResetDemo}
        />
      )
    }

    if (subView === 'health') {
      return <HealthScoreScreen boatHealth={state.boatHealth} onBack={() => setSubView('none')} />
    }

    switch (activeTab) {
      case 'home':
        return (
          <DashboardScreen
            state={state}
            userName={firstName}
            onHealthTap={() => setSubView('health')}
            onLogSavings={handleLogSavings}
            onOpenChat={() => setChatOpen(true)}
            primaryGoal={priorityGoal}
            nextStorm={nextStorm}
            topLeak={topLeak}
          />
        )
      case 'goals':
        return (
          <IslandScreen
            goals={state.goals}
            prioritizeGoal={prioritizeGoal}
            savingsEntries={state.savingsEntries}
            addGoal={addGoal}
          />
        )
      case 'activity':
        return (
          <ActivityScreen
            savingsEntries={state.savingsEntries}
            leaks={state.leaks}
            storms={state.storms}
            goals={state.goals}
          />
        )
      default:
        return null
    }
  }

  if (frontDoorStage !== 'app') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={frontDoorStage}
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.985 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {frontDoorStage === 'landing' && (
            <LandingScreen onTryMe={() => setFrontDoorStage('tour')} onLoginDemo={enterApp} />
          )}
          {frontDoorStage === 'tour' && <OnboardingScreen onComplete={() => setFrontDoorStage('onboarding')} />}
          {frontDoorStage === 'onboarding' && <UserOnboardingScreen onComplete={handleOnboardingComplete} />}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.985, y: 26 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-screen w-full overflow-hidden bg-navy text-foreground pirate-page"
    >
      {subView === 'none' && (
        <SidebarNavigation
          activeTab={activeTab}
          onTabChange={navigateToTab}
          onProfileTap={() => setSubView('profile')}
        />
      )}

      <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden lg:max-w-none">
        {subView === 'none' && (
          <CaptainHeader
            captainNote={captainNote}
            onExpandChat={() => setChatOpen(true)}
            onProfileTap={() => setSubView('profile')}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={subView !== 'none' ? subView : activeTab}
            initial={{ opacity: 0, x: slideDir === 'left' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDir === 'left' ? -20 : 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onTouchStart={subView === 'none' ? handleTouchStart : undefined}
            onTouchEnd={subView === 'none' ? handleTouchEnd : undefined}
            className={`flex-1 overflow-x-hidden overflow-y-auto ${subView === 'none' ? 'pt-24 pb-24 md:pb-6 lg:pt-6' : ''}`}
          >
            <div className="mx-auto h-full w-full max-w-7xl lg:px-6">{renderScreen()}</div>
          </motion.div>
        </AnimatePresence>

        {subView === 'none' && (
          <div className="md:hidden">
            <BottomNavigation activeTab={activeTab} onTabChange={navigateToTab} />
          </div>
        )}

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-50 flex flex-col bg-navy/95 pt-safe backdrop-blur-3xl lg:hidden"
            >
              <div className="absolute right-6 top-6 z-50">
                <button
                  onClick={() => setChatOpen(false)}
                  className="rounded-full border border-brass/20 bg-ink/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-bone"
                >
                  Close Link
                </button>
              </div>
              <div className="flex-1 overflow-hidden pt-12">
                <CaptainChatScreen onStateUpdate={handleAIAction} appState={state} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {subView === 'none' && (
        <aside className="relative z-40 hidden h-full w-[350px] shrink-0 flex-col border-l border-brass/10 bg-ink lg:flex xl:w-[400px]">
          <div className="h-full flex-1 overflow-hidden">
            <CaptainChatScreen onStateUpdate={handleAIAction} appState={state} />
          </div>
        </aside>
      )}
    </motion.main>
  )
}
