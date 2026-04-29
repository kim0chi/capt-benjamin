'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, CloudLightning, Compass, Droplets, Flame, PlusCircle } from 'lucide-react'
import { BoatIllustration } from '@/components/illustrations/BoatIllustration'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AppState, Goal, SavingsAllocation, SavingsJar, StormWarning, Leak } from '@/types'

import { useToast } from '@/hooks/use-toast'

interface DashboardScreenProps {
  state: AppState
  userName: string
  reminderCount: number
  onHealthTap: () => void
  onOpenChat: () => void
  selectedJarId?: string
  onSelectedJarChange: (jarId: string | undefined) => void
  onLogSavings: (
    amount: number,
    allocations: SavingsAllocation[],
    sourceNote: string,
    createdBy?: 'manual' | 'kapitan',
    jarId?: string,
  ) => void
  primaryGoal?: Goal
  nextStorm?: StormWarning
  topLeak?: Leak
  jars?: SavingsJar[]
}

const QUICK_AMOUNTS = [20, 50, 100]

export function DashboardScreen({
  state,
  userName,
  reminderCount,
  onHealthTap,
  onOpenChat,
  selectedJarId,
  onSelectedJarChange,
  onLogSavings,
  primaryGoal,
  nextStorm,
  topLeak,
  jars,
}: DashboardScreenProps) {
  const { toast } = useToast()
  const [amountInput, setAmountInput] = useState('')
  const [sourceNote, setSourceNote] = useState('')
  const [splitMode, setSplitMode] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [allocations, setAllocations] = useState<Record<string, string>>(() => {
    const priority = primaryGoal ?? state.goals[0]
    return priority ? { [priority.id]: '' } : {}
  })

  const amountValue = Number(amountInput) || 0
  const todaySaved = state.dailyCheckIn.totalSaved
  const streak = state.dailyCheckIn.streakCount
  const dailyComplete = state.dailyCheckIn.completed

  const computedAllocations = useMemo(() => {
    if (amountValue <= 0) return []

    if (!splitMode) {
      const targetGoal = primaryGoal ?? state.goals[0]
      return targetGoal ? [{ goalId: targetGoal.id, amount: amountValue }] : []
    }

    return Object.entries(allocations)
      .map(([goalId, raw]) => ({ goalId, amount: Number(raw) || 0 }))
      .filter((allocation) => allocation.amount > 0)
  }, [allocations, amountValue, primaryGoal, splitMode, state.goals])

  const allocatedTotal = computedAllocations.reduce((sum, allocation) => sum + allocation.amount, 0)
  const allocationValid = amountValue > 0 && allocatedTotal === amountValue

  const handleQuickAmount = (amount: number) => {
    setAmountInput(String(amount))
    if (!splitMode && primaryGoal) {
      setAllocations({ [primaryGoal.id]: String(amount) })
    }
  }

  const handleToggleSplit = () => {
    setSplitMode((prev) => {
      const next = !prev
      if (!next && primaryGoal) {
        setAllocations({ [primaryGoal.id]: amountInput || '' })
      }
      return next
    })
  }

  const handleSave = () => {
    if (!allocationValid) return
    onLogSavings(
      amountValue,
      computedAllocations,
      sourceNote.trim() || 'Pocket savings',
      'manual',
      selectedJarId,
    )

    toast({
      title: 'Saved and recorded',
      description: `Kapitan recorded ₱${amountValue.toLocaleString()} in your savings check-in.`,
    })

    setAmountInput('')
    setSourceNote('')
    setShowSuccess(true)
    if (primaryGoal) {
      setAllocations({ [primaryGoal.id]: '' })
      setSplitMode(false)
    } else {
      setAllocations({})
    }
  }

  const activeLeaksTotal = state.leaks.filter(l => !l.patched).reduce((sum, l) => sum + l.amount, 0)
  const primaryGoalProgress = primaryGoal
    ? Math.round((primaryGoal.savedAmount / primaryGoal.targetAmount) * 100)
    : 0

  return (
    <div className="min-h-screen bg-navy pb-28 md:pb-6 pirate-page">
      <div className="space-y-6 px-4 pt-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0 md:auto-rows-min max-w-7xl mx-auto pb-safe">
        <section className="relative overflow-hidden rounded-[34px] shadow-2xl md:col-span-2 lg:col-span-2 lg:row-span-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(110,162,165,0.12),transparent_42%)]" />
          <BoatIllustration
            healthScore={state.boatHealth.overallScore}
            activeLeaksTotal={activeLeaksTotal}
            status={state.boatHealth.status}
            className="rounded-none h-full min-h-75"
          />
          <div className="absolute bottom-6 left-6 z-10">
            <button
              onClick={onHealthTap}
              className="group inline-flex items-center gap-3 rounded-full border border-brass/30 bg-ink/95 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-brass shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-ink hover:border-brass/60"
            >
              <div className="flex bg-brass/20 rounded-full p-1 -ml-2">
                <Compass className="h-4 w-4 text-brass" />
              </div>
              View ship condition
              <ArrowRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>

        {/* Daily check-in card */}
        <section className="rounded-[28px] pirate-panel p-5 md:col-span-1 lg:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="pirate-kicker">Daily check-in</p>
              <h1 className="text-[1.9rem] font-semibold text-bone">
                {showSuccess && dailyComplete
                  ? `Well done, ${userName}!`
                  : `How much did you save today, ${userName}?`}
              </h1>
              <p className="mt-2 text-sm text-sand/72">
                {showSuccess && dailyComplete
                  ? 'Your savings are logged. Keep the streak going tomorrow.'
                  : 'Pick a jar, log the amount, and assign it to a goal.'}
              </p>
            </div>
            <button
              onClick={onOpenChat}
              className="shrink-0 rounded-full border border-brass/16 bg-ink/52 p-2 text-brass"
              aria-label="Ask Kapitan for help"
            >
              <Compass className="h-4 w-4" />
            </button>
          </div>

          {showSuccess && dailyComplete ? (
            /* ── Success state ── */
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-4 rounded-2xl border border-teal/20 bg-teal/8 px-4 py-4">
                <CheckCircle2 className="h-8 w-8 shrink-0 text-teal" />
                <div>
                  <p className="text-sm font-semibold text-bone">₱{todaySaved.toLocaleString()} saved today</p>
                  <p className="text-xs text-sand/68">Logged to {primaryGoal?.name ?? 'your goals'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-brass/16 bg-ink/28 px-4 py-3">
                <Flame className="h-5 w-5 text-brass" />
                <div>
                  <p className="text-sm font-semibold text-bone">{streak}-day streak</p>
                  <p className="text-xs text-sand/60">Keep going tomorrow to extend it</p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-brass/20 bg-ink/40 px-4 py-3 text-sm font-semibold text-brass"
              >
                <PlusCircle className="h-4 w-4" />
                Add another log
              </button>
            </div>
          ) : (
            /* -- Entry form -- */
            <div className="mt-5">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brass/90 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ink transition-transform hover:bg-gold active:scale-95">
                    Start Check-in
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md border-brass/16 bg-[#1a1c1a] p-0 shadow-2xl sm:rounded-[28px] overflow-hidden">
                  <div className="border-b border-brass/10 bg-ink/40 p-5 backdrop-blur-sm">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-bone">Daily Check-in</DialogTitle>
                      <DialogDescription className="mt-1 text-sm text-sand/70">
                        Log your savings and allocate them to your goals.
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <ScrollArea className="max-h-[60vh] overflow-y-auto outline-none">
                    <div className="p-5 pb-8">
              {/* Jar picker */}
              {jars && jars.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">
                    Which jar?
                  </p>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {jars.map((jar) => (
                      <button
                        key={jar.id}
                        onClick={() => onSelectedJarChange(jar.id)}
                        className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                          selectedJarId === jar.id
                            ? 'border-brass bg-brass/15 text-brass'
                            : 'border-brass/16 bg-ink/30 text-sand/70 hover:bg-ink/50'
                        }`}
                      >
                        {jar.name}
                        <span className="ml-1 opacity-50">₱{jar.balance.toLocaleString()}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => onSelectedJarChange(undefined)}
                      className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                        !selectedJarId
                          ? 'border-brass bg-brass/15 text-brass'
                          : 'border-brass/16 bg-ink/30 text-sand/70 hover:bg-ink/50'
                      }`}
                    >
                      No jar
                    </button>
                  </div>
                </div>
              )}

              {/* Quick amounts */}
              <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
                {QUICK_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="rounded-full border border-brass/18 bg-wood-light/35 px-4 py-2 text-sm font-semibold text-sand"
                  >
                    ₱{amount}
                  </button>
                ))}
              </div>

              {/* Inputs */}
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">
                    Amount saved today
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-brass/18 bg-wood-light/38 px-4 py-3 text-lg font-semibold text-bone placeholder:text-sand/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">
                    Source note
                  </label>
                  <input
                    type="text"
                    value={sourceNote}
                    onChange={(e) => setSourceNote(e.target.value)}
                    placeholder="Cash envelope, GCash, boundary"
                    className="w-full rounded-2xl border border-brass/18 bg-wood-light/38 px-4 py-3 text-sm text-bone placeholder:text-sand/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
                  />
                </div>
              </div>

              {/* Goal allocation */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">Goal</p>
                  <p className="text-sm text-sand/72">
                    {splitMode
                      ? 'Split across goals.'
                      : `Goes to ${primaryGoal?.name ?? 'your main goal'}.`}
                  </p>
                </div>
                <button
                  onClick={handleToggleSplit}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                    splitMode ? 'bg-brass text-ink' : 'border border-brass/18 bg-ink/40 text-brass'
                  }`}
                >
                  {splitMode ? 'Single' : 'Split'}
                </button>
              </div>

              {splitMode && (
                <div className="mt-4 space-y-3">
                  {state.goals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between gap-3 rounded-2xl border border-brass/12 bg-ink/28 px-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-bone">{goal.name}</p>
                        <p className="text-xs text-sand/60">
                          {Math.round((goal.savedAmount / goal.targetAmount) * 100)}%
                        </p>
                      </div>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={allocations[goal.id] ?? ''}
                        onChange={(e) =>
                          setAllocations((prev) => ({ ...prev, [goal.id]: e.target.value }))
                        }
                        placeholder="0"
                        className="w-24 rounded-xl border border-brass/18 bg-wood-light/38 px-3 py-2 text-right text-sm font-semibold text-bone focus:border-brass focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Totals row */}
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-brass/12 bg-ink/28 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">Today&apos;s total</p>
                  <p className="text-lg font-semibold text-bone">₱{todaySaved.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-brass" />
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">Streak</p>
                    <p className="text-lg font-semibold text-brass">{streak} days</p>
                  </div>
                </div>
              </div>

              {!allocationValid && amountValue > 0 && (
                <p className="mt-3 text-xs text-coral">
                  Goal split must add up to ₱{amountValue.toLocaleString()}.
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={!allocationValid}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brass px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ink transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 hover:bg-gold"
              >
                <PlusCircle className="h-4 w-4" />
                Log today&apos;s savings
                      </button>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-3 md:col-span-2 lg:col-span-3 md:grid-cols-2 lg:grid-cols-2">
          <div className="rounded-3xl pirate-panel p-4">
            <p className="pirate-kicker">Primary goal</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-bone">{primaryGoal?.name ?? 'No goal selected'}</h2>
                <p className="text-sm text-sand/70">
                  ₱{primaryGoal?.savedAmount.toLocaleString() ?? 0} of ₱{primaryGoal?.targetAmount.toLocaleString() ?? 0}
                </p>
              </div>
              <p className="text-2xl font-semibold text-brass">{primaryGoalProgress}%</p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-wood/30">
              <div
                className="h-2.5 rounded-full bg-[linear-gradient(90deg,#c6a15b,#6ea2a5)]"
                style={{ width: `${primaryGoalProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl pirate-panel p-4">
              <div className="flex items-center gap-2 text-coral">
                <Droplets className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Watch this habit</p>
              </div>
              <p className="mt-2 text-base font-semibold text-bone">{topLeak?.category ?? 'No active leak'}</p>
              <p className="mt-1 text-sm text-sand/68">
                {topLeak ? `About ₱${topLeak.amount.toLocaleString()} per week.` : 'You have no major habit drain right now.'}
              </p>
            </div>

            <div className="rounded-3xl pirate-panel p-4">
              <div className="flex items-center gap-2 text-sky">
                <CloudLightning className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Upcoming bill</p>
              </div>
              <p className="mt-2 text-base font-semibold text-bone">{nextStorm?.name ?? 'No upcoming bills'}</p>
              <p className="mt-1 text-sm text-sand/68">
                {nextStorm
                  ? `Due in ${nextStorm.daysUntilDue} day(s) for ₱${nextStorm.amount.toLocaleString()}.`
                  : 'Your current bill list is under control.'}
              </p>
              {reminderCount > 0 && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
                  {reminderCount} reminder{reminderCount === 1 ? '' : 's'} still active
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

