'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CloudLightning, Compass, Droplets, PlusCircle } from 'lucide-react'
import { BoatIllustration } from '@/components/illustrations/BoatIllustration'
import type { AppState, Goal, SavingsAllocation, StormWarning, Leak } from '@/types'

import { useToast } from '@/hooks/use-toast'

interface DashboardScreenProps {
  state: AppState
  userName: string
  onHealthTap: () => void
  onOpenChat: () => void
  onLogSavings: (
    amount: number,
    allocations: SavingsAllocation[],
    sourceNote: string,
    createdBy?: 'manual' | 'captain',
  ) => void
  primaryGoal?: Goal
  nextStorm?: StormWarning
  topLeak?: Leak
}

const QUICK_AMOUNTS = [20, 50, 100]

export function DashboardScreen({
  state,
  userName,
  onHealthTap,
  onOpenChat,
  onLogSavings,
  primaryGoal,
  nextStorm,
  topLeak,
}: DashboardScreenProps) {
  const { toast } = useToast()
  const [amountInput, setAmountInput] = useState('')
  const [sourceNote, setSourceNote] = useState('')
  const [splitMode, setSplitMode] = useState(false)
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
    )
    
    toast({
      title: 'Funds Stowed!',
      description: `Captain logged an addition of P${amountValue} into the ledger.`,
    })

    setAmountInput('')
    setSourceNote('')
    if (primaryGoal) {
      setAllocations({ [primaryGoal.id]: '' })
      setSplitMode(false)
    } else {
      setAllocations({})
    }
  }

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
            leakLabels={topLeak ? [topLeak.category] : []}
            status={state.boatHealth.status}
            className="rounded-none h-full min-h-75"
          />
          <div className="absolute bottom-5 left-5 z-10 px-1">
            <button
              onClick={onHealthTap}
              className="inline-flex items-center gap-2 rounded-full border border-brass/16 bg-ink/68 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-brass backdrop-blur-md hover:bg-ink/80 transition-colors shadow-lg"
            >
              View ship condition
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="rounded-[28px] pirate-panel p-5 md:col-span-1 lg:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="pirate-kicker">Daily check-in</p>
              <h1 className="text-[1.9rem] font-semibold text-bone">How much did you save today, {userName}?</h1>
              <p className="mt-2 text-sm text-sand/72">
                Log today&apos;s amount, say where you placed it, and move it toward one or more goals.
              </p>
            </div>
            <button
              onClick={onOpenChat}
              className="shrink-0 rounded-full border border-brass/16 bg-ink/52 p-2 text-brass"
              aria-label="Ask Capt. Benjamin for help"
            >
              <Compass className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                className="rounded-full border border-brass/18 bg-wood-light/35 px-4 py-2 text-sm font-semibold text-sand"
              >
                Save P{amount}
              </button>
            ))}
          </div>

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
                Where did you put it?
              </label>
              <input
                type="text"
                value={sourceNote}
                onChange={(e) => setSourceNote(e.target.value)}
                placeholder="Cash envelope, GCash, drawer jar"
                className="w-full rounded-2xl border border-brass/18 bg-wood-light/38 px-4 py-3 text-sm text-bone placeholder:text-sand/35 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">Allocation</p>
              <p className="text-sm text-sand/72">
                {splitMode
                  ? 'Split this amount across goals.'
                  : `By default this goes to ${primaryGoal?.name ?? 'your main goal'}.`}
              </p>
            </div>
            <button
              onClick={handleToggleSplit}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                splitMode ? 'bg-brass text-ink' : 'border border-brass/18 bg-ink/40 text-brass'
              }`}
            >
              {splitMode ? 'Single goal' : 'Split across goals'}
            </button>
          </div>

          {splitMode && (
            <div className="mt-4 space-y-3">
              {state.goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between gap-3 rounded-2xl border border-brass/12 bg-ink/28 px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-bone">{goal.name}</p>
                    <p className="text-xs text-sand/60">
                      {Math.round((goal.savedAmount / goal.targetAmount) * 100)}% complete
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

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-brass/12 bg-ink/28 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">Today&apos;s total</p>
              <p className="text-lg font-semibold text-bone">P{todaySaved.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">Current streak</p>
              <p className="text-lg font-semibold text-brass">{streak} days</p>
            </div>
          </div>

          {!allocationValid && amountValue > 0 && (
            <p className="mt-3 text-xs text-coral">
              Make sure your goal split adds up to P{amountValue.toLocaleString()}.
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={!allocationValid}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brass px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ink transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 hover:bg-gold"
          >
            <PlusCircle className="h-4 w-4" />
            {dailyComplete ? 'Add another savings log' : 'Log today\'s savings'}
          </button>
        </section>

        <section className="grid grid-cols-1 gap-3 md:col-span-2 lg:col-span-3 md:grid-cols-2 lg:grid-cols-2">
          <div className="rounded-3xl pirate-panel p-4">
            <p className="pirate-kicker">Primary goal</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-bone">{primaryGoal?.name ?? 'No goal selected'}</h2>
                <p className="text-sm text-sand/70">
                  P{primaryGoal?.savedAmount.toLocaleString() ?? 0} of P{primaryGoal?.targetAmount.toLocaleString() ?? 0}
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
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Leak to avoid</p>
              </div>
              <p className="mt-2 text-base font-semibold text-bone">{topLeak?.category ?? 'No active leak'}</p>
              <p className="mt-1 text-sm text-sand/68">
                {topLeak ? `Worth P${topLeak.amount.toLocaleString()} per week.` : 'Hull is steady today.'}
              </p>
            </div>

            <div className="rounded-3xl pirate-panel p-4">
              <div className="flex items-center gap-2 text-sky">
                <CloudLightning className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Next bill</p>
              </div>
              <p className="mt-2 text-base font-semibold text-bone">{nextStorm?.name ?? 'No storms queued'}</p>
              <p className="mt-1 text-sm text-sand/68">
                {nextStorm ? `Due in ${nextStorm.daysUntilDue} day(s) for P${nextStorm.amount.toLocaleString()}.` : 'Clear waters ahead.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
