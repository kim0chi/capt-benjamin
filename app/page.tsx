'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNavigation, type NavTab } from '@/components/BottomNavigation'
import { CaptainHeader } from '@/components/CaptainHeader'
import { DesktopTopNav } from '@/components/DesktopTopNav'
import { SidebarNavigation } from '@/components/SidebarNavigation'
import { BillsScreen } from '@/components/screens/BillsScreen'
import { CaptainChatScreen } from '@/components/screens/CaptainChatScreen'
import { DashboardScreen } from '@/components/screens/DashboardScreen'
import { HealthScoreScreen } from '@/components/screens/HealthScoreScreen'
import { IslandScreen } from '@/components/screens/InsightsScreen'
import { JarsScreen } from '@/components/screens/JarsScreen'
import { LandingScreen } from '@/components/screens/LandingScreen'
import { OnboardingScreen } from '@/components/screens/OnboardingScreen'
import { ProfileScreen } from '@/components/screens/ProfileScreen'
import { UserOnboardingScreen } from '@/components/screens/UserOnboardingScreen'
import { useAppState } from '@/hooks/useAppState'
import type { AIAction, DemoOnboardingAnswers, SavingsAllocation } from '@/types'

type FrontDoorStage = 'landing' | 'tour' | 'onboarding' | 'app'
type SubView = 'none' | 'health' | 'profile'

const TAB_ORDER: NavTab[] = ['home', 'goals', 'bills', 'jars']

export default function Home() {
  const [frontDoorStage, setFrontDoorStage] = useState<FrontDoorStage>('landing')
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [subView, setSubView] = useState<SubView>('none')
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedJarId, setSelectedJarId] = useState<string | undefined>(undefined)
  const touchStartX = useRef(0)

  const {
    state,
    patchLeak,
    prioritizeGoal,
    contributeToGoal,
    logSavingsEntry,
    addGoal,
    addBill,
    markBillHandled,
    deleteBill,
    snoozeBill,
    addJar,
    depositToJar,
    withdrawFromJar,
    payBill,
    applyOnboarding,
    resetDemo,
  } = useAppState({ enableRemoteSync: frontDoorStage === 'app' })

  const userName = state.userProfile.name.trim() || 'Kapitan'
  const firstName = userName.split(' ')[0] || userName
  const effectiveSelectedJarId =
    selectedJarId && state.jars.some((jar) => jar.id === selectedJarId)
      ? selectedJarId
      : state.jars[0]?.id

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
    const jarAwareAction =
      action.type === 'LOG_SAVINGS'
        ? {
            ...action,
            jarId: action.jarId ?? effectiveSelectedJarId,
          }
        : action.type === 'WITHDRAW_FROM_JAR'
          ? {
              ...action,
              jarId: action.jarId ?? effectiveSelectedJarId,
            }
          : action

    switch (jarAwareAction.type) {
      case 'PATCH_LEAK':
        patchLeak(jarAwareAction.id)
        break
      case 'PRIORITIZE_GOAL':
        prioritizeGoal(jarAwareAction.id)
        break
      case 'CONTRIBUTE_GOAL':
        contributeToGoal(jarAwareAction.id, jarAwareAction.amount)
        break
      case 'LOG_SAVINGS':
        logSavingsEntry(
          jarAwareAction.amount,
          jarAwareAction.allocations,
          jarAwareAction.sourceNote,
          jarAwareAction.createdBy ?? 'kapitan',
          jarAwareAction.jarId,
        )
        break
      case 'WITHDRAW_FROM_JAR':
        if (!jarAwareAction.jarId) break
        withdrawFromJar(
          jarAwareAction.jarId,
          jarAwareAction.amount,
          jarAwareAction.sourceNote,
        )
        break
      case 'COMPLETE_DAILY_CHECKIN':
        break
    }
  }

  const handleLogSavings = (
    amount: number,
    allocations: SavingsAllocation[],
    sourceNote: string,
    createdBy: 'manual' | 'kapitan' = 'manual',
    jarId?: string,
  ) => {
    logSavingsEntry(amount, allocations, sourceNote, createdBy, jarId)
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
  const nextStorm = [...state.storms]
    .filter((storm) => storm.status !== 'handled')
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)[0]
  const remindLaterCount = state.storms.filter((storm) => storm.status === 'remind_later').length
  const captainNote = state.dailyCheckIn.completed
    ? `${firstName}, today's check-in is done. ${priorityGoal?.name} moved forward by P${state.dailyCheckIn.totalSaved.toLocaleString()}.`
    : `${firstName}, even P20 toward ${priorityGoal?.name ?? 'your main goal'} keeps your plan moving.`

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
            reminderCount={remindLaterCount}
            onHealthTap={() => setSubView('health')}
            onLogSavings={handleLogSavings}
            onOpenChat={() => setChatOpen(true)}
            selectedJarId={effectiveSelectedJarId}
            onSelectedJarChange={setSelectedJarId}
            primaryGoal={priorityGoal}
            nextStorm={nextStorm}
            topLeak={topLeak}
            jars={state.jars}
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
      case 'bills':
        return (
          <BillsScreen
            storms={state.storms}
            jars={state.jars}
            onAddBill={addBill}
            onMarkHandled={markBillHandled}
            onPayBill={payBill}
            onDeleteBill={deleteBill}
            onSnoozeBill={snoozeBill}
          />
        )
      case 'jars':
        return (
          <JarsScreen
            jars={state.jars}
            savingsEntries={state.savingsEntries}
            onAddJar={addJar}
            onDepositToJar={depositToJar}
            onWithdrawFromJar={withdrawFromJar}
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
      className="flex h-screen w-full overflow-hidden bg-background text-foreground pirate-page"
    >
      {subView === 'none' && (
        <>
          <DesktopTopNav
            activeTab={activeTab}
            onTabChange={navigateToTab}
            onProfileTap={() => setSubView('profile')}
          />

          <SidebarNavigation
            activeTab={activeTab}
            onTabChange={navigateToTab}
            onProfileTap={() => setSubView('profile')}
          />
        </>
      )}

      <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {subView === 'none' && (
          <CaptainHeader
            firstName={firstName}
            captainNote={captainNote}
            onChat={() => setChatOpen(true)}
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
            className={`flex-1 overflow-x-hidden overflow-y-auto ${subView === 'none' ? 'pt-28 pb-28 md:pb-8 md:pt-8 lg:pt-24' : ''}`}
          >
            <div className="mx-auto h-full w-full max-w-7xl px-0 md:px-6 xl:px-8">
              {subView === 'none' && activeTab === 'home' && (
                <div className="hidden px-4 pb-4 pt-2 lg:block">
                  <p className="label-kicker">Kapitan</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-foreground">
                    Keep the plan clear, {firstName}.
                  </h1>
                </div>
              )}
              {renderScreen()}
            </div>
          </motion.div>
        </AnimatePresence>

        {subView === 'none' && (
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={navigateToTab}
            onProfileTap={() => setSubView('profile')}
          />
        )}

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-50 flex flex-col bg-background/95 pt-safe backdrop-blur-3xl lg:hidden"
            >
              <div className="absolute right-6 top-6 z-50">
                <button
                  onClick={() => setChatOpen(false)}
                  className="rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground"
                >
                  Close Chat
                </button>
              </div>
              <div className="flex-1 overflow-hidden pt-12">
                <CaptainChatScreen
                  onStateUpdate={handleAIAction}
                  appState={state}
                  selectedJarId={effectiveSelectedJarId}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {subView === 'none' && (
        <aside className="relative z-30 hidden h-full w-[360px] shrink-0 p-4 lg:flex xl:w-[410px]">
          <div className="surface-panel flex h-full flex-1 flex-col overflow-hidden rounded-[2rem]">
            <div className="flex-1 overflow-hidden">
              <CaptainChatScreen
                onStateUpdate={handleAIAction}
                appState={state}
                selectedJarId={effectiveSelectedJarId}
              />
            </div>
          </div>
        </aside>
      )}
    </motion.main>
  )
}
