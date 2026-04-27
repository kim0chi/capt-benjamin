'use client'

import { Wallet, Calendar, Droplets, CloudLightning, Compass } from 'lucide-react'
import { BoatIllustration } from '@/components/illustrations/BoatIllustration'
import { BudgetAllocationBar } from '@/components/BudgetAllocationBar'
import type { AppState } from '@/types'
import type { NavTab } from '@/components/BottomNavigation'

interface DashboardScreenProps {
  state: AppState
  onTabChange: (tab: NavTab) => void
  onHealthTap: () => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning tide report'
  if (hour < 17) return 'Afternoon ledger report'
  return 'Evening watch report'
}

const captainQuip =
  "The ship is steady, but food delivery and coffee are carving the fastest grooves through this week's cargo."

export function DashboardScreen({ state, onTabChange, onHealthTap }: DashboardScreenProps) {
  const totalLeakAmount = state.leaks.reduce((sum, leak) => sum + leak.amount, 0)
  const billsTotal = state.storms.reduce((sum, s) => sum + s.amount, 0)
  const goalsTotal = state.goals.reduce((sum, g) => sum + g.weeklyContribution * 4, 0)
  const billsCount = state.storms.length

  // Monthly summary
  const savingsRate = Math.round(((state.monthlyIncome - state.monthlyExpenses) / state.monthlyIncome) * 100)
  const saved = state.monthlyIncome - state.monthlyExpenses

  return (
    <div className="min-h-screen bg-navy pb-28 pirate-page">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-brass/15 bg-ink/90 px-4 pt-safe backdrop-blur-md">
        <div className="flex items-start gap-3 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brass/35 bg-wood text-brass shadow-lg shadow-black/30">
            <Compass className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="pirate-kicker">Capt. Benjamin</p>
            <h1 className="font-display text-[1.6rem] font-semibold text-bone">{getGreeting()}</h1>
            <div className="mt-2 rounded-2xl pirate-panel-soft px-3 py-2.5">
              <p className="text-sm leading-relaxed text-sand/80">{captainQuip}</p>
            </div>
          </div>

          <div className="rounded-full px-3 py-2 pirate-chip flex-shrink-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Balance</p>
            <p className="text-sm font-bold text-bone">₱{state.currentBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        {/* Boat hero — taps to health subview */}
        <button
          onClick={onHealthTap}
          className="w-full text-left transition-transform active:scale-[0.985]"
          aria-label="View full ship condition"
        >
          <div className="rounded-[30px] pirate-panel p-3">
            <BoatIllustration
              healthScore={state.boatHealth.overallScore}
              leakLabels={state.leaks.slice(0, 2).map(leak => leak.category)}
              status={state.boatHealth.status}
            />
            <div className="mt-3 flex items-center justify-between px-2">
              <div>
                <p className="pirate-kicker">Captain&apos;s log</p>
                <p className="font-display text-xl font-semibold text-bone">Open ship condition chart</p>
              </div>
              <div className="rounded-full border border-brass/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                {state.boatHealth.status}
              </div>
            </div>
          </div>
        </button>

        {/* 4 stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl pirate-panel p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/30 bg-brass/15 text-brass">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <p className="pirate-kicker">Cargo room</p>
                <p className="text-xs text-sand/70">Safe to spend</p>
              </div>
            </div>
            <p className="font-display text-3xl font-semibold text-bone">₱{state.safeToSpend.toLocaleString()}</p>
            <p className="mt-1 text-xs text-sand/65">Available without rocking the hull.</p>
          </div>

          <div className="rounded-3xl pirate-panel p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/35 bg-teal/15 text-teal">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="pirate-kicker">Pay cycle</p>
                <p className="text-xs text-sand/70">Until payday</p>
              </div>
            </div>
            <p className="font-display text-3xl font-semibold text-bone">{state.daysUntilPayday}</p>
            <p className="mt-1 text-xs text-sand/65">Days before the next chest arrives.</p>
          </div>

          <button
            onClick={() => onTabChange('leaks')}
            className="rounded-3xl pirate-panel p-4 text-left transition-transform active:scale-95"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-coral/35 bg-coral/15 text-coral">
                <Droplets className="h-4 w-4" />
              </div>
              <div>
                <p className="pirate-kicker">Hull leaks</p>
                <p className="text-xs text-sand/70">Recurring losses</p>
              </div>
            </div>
            <p className="font-display text-3xl font-semibold text-bone">₱{totalLeakAmount.toLocaleString()}</p>
            <p className="mt-1 text-xs text-sand/65">{state.leaks.length} leaks worth patching.</p>
          </button>

          <button
            onClick={() => onTabChange('alerts')}
            className="rounded-3xl pirate-panel p-4 text-left transition-transform active:scale-95"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky/35 bg-sky/15 text-sky">
                <CloudLightning className="h-4 w-4" />
              </div>
              <div>
                <p className="pirate-kicker">Storm deck</p>
                <p className="text-xs text-sand/70">Bills incoming</p>
              </div>
            </div>
            <p className="font-display text-3xl font-semibold text-bone">{billsCount}</p>
            <p className="mt-1 text-xs text-sand/65">Review your next rough waters.</p>
          </button>
        </div>

        {/* Budget allocation bar */}
        <BudgetAllocationBar
          income={state.monthlyIncome}
          billsTotal={billsTotal}
          leaksTotal={totalLeakAmount * 4}
          goalsTotal={goalsTotal}
        />

        {/* Monthly summary */}
        <div className="rounded-[28px] pirate-panel overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <p className="pirate-kicker">Monthly summary</p>
            <h2 className="font-display text-2xl font-semibold text-bone">This month&apos;s ledger</h2>
          </div>
          <div className="grid grid-cols-3 divide-x divide-brass/12 border-t border-brass/12">
            <div className="px-3 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.12em] text-sand/60">Income</p>
              <p className="font-display text-xl font-bold text-bone mt-1">₱{(state.monthlyIncome / 1000).toFixed(0)}k</p>
              <p className="text-xs text-teal mt-1">↑ on track</p>
            </div>
            <div className="px-3 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.12em] text-sand/60">Spent</p>
              <p className="font-display text-xl font-bold text-coral mt-1">₱{(state.monthlyExpenses / 1000).toFixed(1)}k</p>
              <p className="text-xs text-sand/55 mt-1">{Math.round((state.monthlyExpenses / state.monthlyIncome) * 100)}%</p>
            </div>
            <div className="px-3 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.12em] text-sand/60">Saved</p>
              <p className="font-display text-xl font-bold text-teal mt-1">₱{(saved / 1000).toFixed(1)}k</p>
              <p className="text-xs text-teal mt-1">{savingsRate}% ↑</p>
            </div>
          </div>
        </div>

        {/* Top leaks preview */}
        <div className="rounded-[28px] pirate-panel overflow-hidden">
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <div>
              <p className="pirate-kicker">Captain&apos;s log</p>
              <h2 className="font-display text-2xl font-semibold text-bone">Top leaks in the hull</h2>
            </div>
            <button onClick={() => onTabChange('leaks')} className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              View all
            </button>
          </div>
          <div className="divide-y divide-brass/10">
            {state.leaks.map(leak => (
              <div key={leak.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-bone text-sm">{leak.category}</p>
                  <p className="text-xs text-sand/60">{leak.frequency}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${leak.patched ? 'text-teal line-through' : 'text-coral'}`}>
                    ₱{leak.amount.toLocaleString()}
                  </p>
                  {leak.patched && <p className="text-xs text-teal">Patched ✓</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
