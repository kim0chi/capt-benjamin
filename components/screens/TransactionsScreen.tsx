'use client'

import { CheckCircle2, CloudLightning, Wallet } from 'lucide-react'
import type { Goal, Leak, SavingsEntry, StormWarning } from '@/types'

interface ActivityScreenProps {
  savingsEntries: SavingsEntry[]
  leaks: Leak[]
  storms: StormWarning[]
  goals: Goal[]
}

export function ActivityScreen({ savingsEntries, leaks, storms, goals }: ActivityScreenProps) {
  const patchedLeaks = leaks.filter((leak) => leak.patched)
  const recentStorm = [...storms].sort((a, b) => a.daysUntilDue - b.daysUntilDue)[0]
  const goalLabels = new Map(goals.map((goal) => [goal.id, goal.name]))

  return (
    <div className="min-h-dvh bg-navy pb-28 md:pb-6 pirate-page">
      <div className="space-y-6 px-4 pt-6 max-w-5xl mx-auto pb-safe">
        <div>
          <p className="pirate-kicker">Recent movement</p>
          <h1 className="text-3xl font-semibold text-bone">Activity log</h1>
          <p className="text-sm text-sand/68">
            Savings check-ins, sealed leaks, and the next storm to watch.
          </p>
        </div>

        <section className="rounded-[28px] pirate-panel p-5">
          <div className="flex items-center gap-2 text-brass">
            <Wallet className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">Savings entries</p>
          </div>

          <div className="mt-4 space-y-3">
            {savingsEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-brass/12 bg-ink/30 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bone whitespace-nowrap">P{entry.amount.toLocaleString()} saved</p>
                    <p className="text-xs text-sand/60 truncate">
                      {entry.sourceNote} - {entry.date}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal shrink-0 whitespace-nowrap pt-0.5">
                    {entry.createdBy}
                  </span>
                </div>
                <p className="mt-2 text-xs text-sand/68">
                  {entry.allocations
                    .map((allocation) => `P${allocation.amount} to ${goalLabels.get(allocation.goalId) ?? 'Goal'}`)
                    .join(' - ')}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3">
          <div className="rounded-3xl pirate-panel p-4">
            <div className="flex items-center gap-2 text-teal">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Patched leaks</p>
            </div>
            <div className="mt-3 space-y-2">
              {patchedLeaks.length === 0 ? (
                <p className="text-sm text-sand/68">
                  No leaks patched yet. Start with the biggest weekly drain.
                </p>
              ) : (
                patchedLeaks.map((leak) => (
                  <div key={leak.id} className="flex items-center justify-between">
                    <p className="text-sm text-bone">{leak.category}</p>
                    <p className="text-sm font-semibold text-teal">
                      P{leak.amount.toLocaleString()} / wk
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl pirate-panel p-4">
            <div className="flex items-center gap-2 text-sky">
              <CloudLightning className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Nearest storm</p>
            </div>
            {recentStorm ? (
              <div className="mt-3">
                <p className="text-base font-semibold text-bone">{recentStorm.name}</p>
                <p className="mt-1 text-sm text-sand/68">
                  Due in {recentStorm.daysUntilDue} day(s) - P{recentStorm.amount.toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-sand/68">No bills threatening the route right now.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
