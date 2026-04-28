'use client'

import { useMemo, useRef, useState } from 'react'
import { CheckCircle2, Compass, Flag, Plus, Star, X } from 'lucide-react'
import { IslandMap } from '@/components/illustrations/IslandMap'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { Goal, SavingsEntry } from '@/types'

interface IslandScreenProps {
  goals: Goal[]
  prioritizeGoal: (id: string) => void
  savingsEntries: SavingsEntry[]
  addGoal?: (name: string, targetAmount: number) => void
}

function getRecentGoalDeposits(goalId: string, savingsEntries: SavingsEntry[]) {
  return savingsEntries
    .flatMap((entry) =>
      entry.allocations
        .filter((allocation) => allocation.goalId === goalId)
        .map((allocation) => ({
          id: `${entry.id}-${goalId}`,
          date: entry.date,
          amount: allocation.amount,
          sourceNote: entry.sourceNote,
          createdBy: entry.createdBy,
        })),
    )
    .slice(0, 3)
}

function GoalDetailSheet({
  goal,
  recentDeposits,
  onPrioritize,
}: {
  goal: Goal
  recentDeposits: ReturnType<typeof getRecentGoalDeposits>
  onPrioritize: () => void
}) {
  const progressPercent = Math.round((goal.savedAmount / goal.targetAmount) * 100)
  const amountRemaining = Math.max(0, goal.targetAmount - goal.savedAmount)
  const projectedWeeks = Math.max(1, Math.ceil(amountRemaining / goal.weeklyContribution))

  return (
    <div className="space-y-5 px-4 pb-6">
      <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-brass/20" />

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal">Goal detail</p>
        <h2 className="text-2xl font-semibold text-bone">{goal.name}</h2>
        <p className="text-sm text-sand/68">
          Keep daily deposits moving here if this destination matters most right now.
        </p>
      </div>

      <IslandMap
        progressPercent={progressPercent}
        goalName={goal.name}
        amountRemaining={amountRemaining}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-brass/12 bg-ink/32 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/58">Saved</p>
          <p className="mt-2 text-2xl font-semibold text-bone">P{goal.savedAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-[22px] border border-brass/12 bg-ink/32 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/58">Remaining</p>
          <p className="mt-2 text-2xl font-semibold text-brass">P{amountRemaining.toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-[24px] pirate-note p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/60">Route estimate</p>
        <p className="mt-2 text-xl font-semibold text-ink">{projectedWeeks} week(s) at the current pace</p>
        <p className="mt-1 text-sm text-ink/70">Weekly route: P{goal.weeklyContribution.toLocaleString()}</p>
      </div>

      <div className="rounded-[24px] border border-brass/12 bg-ink/32 p-4">
        <div className="flex items-center gap-2 text-brass">
          <Compass className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">Recent deposits</p>
        </div>
        <div className="mt-3 space-y-3">
          {recentDeposits.length === 0 ? (
            <p className="text-sm text-sand/68">No deposits logged here yet. Start with a small amount today.</p>
          ) : (
            recentDeposits.map((deposit) => (
              <div key={deposit.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-bone">P{deposit.amount.toLocaleString()}</p>
                  <p className="text-xs text-sand/58">{deposit.sourceNote} - {deposit.date}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal">
                  {deposit.createdBy}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {goal.isPriority ? (
        <div className="flex min-h-12 items-center justify-center gap-2 rounded-[22px] border border-teal/26 bg-teal/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-teal">
          <CheckCircle2 className="h-4 w-4" />
          Current priority goal
        </div>
      ) : (
        <button
          onClick={onPrioritize}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[22px] bg-brass px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ink transition-transform active:scale-95"
        >
          <Star className="h-4 w-4" />
          Make this the main route
        </button>
      )}
    </div>
  )
}

export function IslandScreen({ goals, prioritizeGoal, savingsEntries, addGoal }: IslandScreenProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [addingGoal, setAddingGoal] = useState(false)
  const [newGoalName, setNewGoalName] = useState('')
  const [newGoalAmount, setNewGoalAmount] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? null
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0
  const priorityGoal = goals.find((goal) => goal.isPriority) ?? goals[0]

  const contributionSummary = useMemo(() => {
    const totals = new Map<string, number>()
    savingsEntries.forEach((entry) => {
      entry.allocations.forEach((allocation) => {
        totals.set(allocation.goalId, (totals.get(allocation.goalId) ?? 0) + allocation.amount)
      })
    })
    return totals
  }, [savingsEntries])

  const openGoal = (goalId: string) => {
    setSelectedGoalId(goalId)
    setSheetOpen(true)
  }

  return (
    <div className="min-h-[100dvh] bg-navy pb-28 md:pb-6 pirate-page">
      <div className="space-y-6 px-4 pt-6 max-w-5xl mx-auto pb-safe">
        <section className="rounded-[28px] pirate-panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal">Goals</p>
              <h1 className="mt-1 text-3xl font-semibold text-bone">Daily savings routes</h1>
              <p className="mt-2 text-sm text-sand/68">
                Keep one main route in focus, then split only when today&apos;s cargo has a clear second job.
              </p>
            </div>
            <div className="rounded-[22px] border border-brass/14 bg-ink/36 px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/58">All goals</p>
              <p className="mt-1 text-2xl font-semibold text-brass">{overallProgress}%</p>
            </div>
          </div>

          {priorityGoal && (
            <div className="mt-4 rounded-[24px] border border-brass/12 bg-ink/30 p-4">
              <div className="flex items-center gap-2 text-brass">
                <Flag className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Main route</p>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-bone">{priorityGoal.name}</p>
                  <p className="text-sm text-sand/65">
                    P{priorityGoal.savedAmount.toLocaleString()} of P{priorityGoal.targetAmount.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => openGoal(priorityGoal.id)}
                  className="rounded-full border border-brass/16 bg-ink/42 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brass"
                >
                  View route
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-3">
          {goals.map((goal) => {
            const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100)
            const recentContribution = contributionSummary.get(goal.id) ?? 0

            return (
              <button
                key={goal.id}
                onClick={() => openGoal(goal.id)}
                className={`w-full rounded-[28px] p-5 text-left transition-transform active:scale-[0.985] ${
                  goal.isPriority ? 'border border-brass/28 pirate-panel' : 'border border-brass/10 bg-ink/34'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {goal.isPriority && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brass">Priority goal</p>
                    )}
                    <h2 className="mt-1 text-xl font-semibold text-bone">{goal.name}</h2>
                    <p className="mt-1 text-sm text-sand/64">
                      Logged here: P{recentContribution.toLocaleString()} total
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-brass">{progress}%</p>
                    <p className="text-xs text-sand/58">P{goal.weeklyContribution.toLocaleString()} / week</p>
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-wood/24">
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: goal.isPriority
                        ? 'linear-gradient(90deg,#c6a15b,#d7bb7d)'
                        : 'linear-gradient(90deg,#4ca08f,#6ea2a5)',
                    }}
                  />
                </div>
              </button>
            )
          })}

          {addingGoal ? (
            <div className="rounded-[28px] border border-brass/28 pirate-panel p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass">New goal</p>
                <button onClick={() => { setAddingGoal(false); setNewGoalName(''); setNewGoalAmount('') }}>
                  <X className="h-4 w-4 text-sand/60" />
                </button>
              </div>
              <input
                ref={nameInputRef}
                type="text"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="Goal name (e.g. Palengke fund)"
                className="w-full rounded-[16px] border border-brass/18 bg-ink/40 px-4 py-3 text-sm text-bone placeholder:text-sand/40 focus:outline-none focus:ring-1 focus:ring-brass/40"
              />
              <input
                type="number"
                value={newGoalAmount}
                onChange={(e) => setNewGoalAmount(e.target.value)}
                placeholder="Target amount (₱)"
                className="w-full rounded-[16px] border border-brass/18 bg-ink/40 px-4 py-3 text-sm text-bone placeholder:text-sand/40 focus:outline-none focus:ring-1 focus:ring-brass/40"
              />
              <button
                onClick={() => {
                  const amount = parseInt(newGoalAmount, 10)
                  if (newGoalName.trim() && amount > 0) {
                    addGoal?.(newGoalName.trim(), amount)
                    setAddingGoal(false)
                    setNewGoalName('')
                    setNewGoalAmount('')
                  }
                }}
                disabled={!newGoalName.trim() || !newGoalAmount || parseInt(newGoalAmount, 10) <= 0}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[22px] bg-brass px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ink transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add goal
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAddingGoal(true); setTimeout(() => nameInputRef.current?.focus(), 50) }}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[28px] border border-dashed border-brass/24 bg-wood-light/25 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-brass"
            >
              <Plus className="h-4 w-4" />
              Add another goal
            </button>
          )}
        </section>
      </div>

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent
          className="border-t border-brass/18 bg-navy pb-safe pirate-page"
          aria-describedby={selectedGoal ? `goal-description-${selectedGoal.id}` : undefined}
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>
              {selectedGoal ? `${selectedGoal.name} goal details` : 'Goal details'}
            </DrawerTitle>
            <DrawerDescription id={selectedGoal ? `goal-description-${selectedGoal.id}` : undefined}>
              {selectedGoal
                ? `Progress, recent deposits, and route details for ${selectedGoal.name}.`
                : 'Progress and recent deposits for the selected goal.'}
            </DrawerDescription>
          </DrawerHeader>
          {selectedGoal && (
            <GoalDetailSheet
              goal={selectedGoal}
              recentDeposits={getRecentGoalDeposits(selectedGoal.id, savingsEntries)}
              onPrioritize={() => {
                prioritizeGoal(selectedGoal.id)
                setSheetOpen(false)
              }}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
