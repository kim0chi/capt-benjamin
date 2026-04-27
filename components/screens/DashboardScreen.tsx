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
      <div className="space-y-4 px-4 pt-4">
        {/* Boat hero — taps to health subview */}
        <button
          onClick={onHealthTap}
          className="w-full text-left transition-transform active:scale-[0.985] mb-4"
          aria-label="View full ship condition"
        >
          <div className="rounded-[32px] pirate-panel overflow-hidden relative">
            <BoatIllustration
              healthScore={state.boatHealth.overallScore}
              leakLabels={state.leaks.slice(0, 2).map(leak => leak.category)}
              status={state.boatHealth.status}
              className="rounded-none bg-transparent shadow-none w-full border-b border-brass/10"
            />
            <div className="p-5 flex items-center justify-between bg-ink/30 backdrop-blur-md">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal">Captain&apos;s log</p>
                <p className="font-display text-xl font-bold text-bone mt-1">Open ship condition</p>
              </div>
              <div className="rounded-full border border-teal/40 bg-teal/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-teal shadow-[0_0_15px_rgba(76,160,143,0.2)]">
                {state.boatHealth.status}
              </div>
            </div>
          </div>
        </button>

        {/* 4 stat cards - modern bento grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Main Hero Metric spans full width */}
          <div className="col-span-2 rounded-[28px] pirate-panel p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-brass/5 via-transparent to-teal/5 opacity-50 z-0" />
            <div className="relative z-10 flex items-start justify-between">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brass/40 bg-brass/20 text-brass shadow-[0_0_15px_rgba(198,161,91,0.2)]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brass">Cargo room</p>
                  <p className="text-xs text-sand/70">Safe to spend</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-2">
              <p className="font-display text-[2.75rem] leading-none font-bold text-bone">₱{state.safeToSpend.toLocaleString()}</p>
              <p className="mt-2 text-sm text-sand/80 font-medium">Available without rocking the hull.</p>
            </div>
          </div>

          <div className="col-span-1 rounded-[24px] pirate-panel p-4 flex flex-col justify-between">
            <div className="mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal/20 text-teal shadow-[0_0_10px_rgba(76,160,143,0.3)] mb-3">
                <Calendar className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal">Pay cycle</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold text-bone">{state.daysUntilPayday}</p>
              <p className="mt-1 text-[11px] text-sand/70 leading-tight">Days left until payday.</p>
            </div>
          </div>

          <button
            onClick={() => onTabChange('leaks')}
            className="col-span-1 rounded-[24px] pirate-panel p-4 text-left transition-transform active:scale-[0.98] flex flex-col justify-between"
          >
            <div className="mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-coral/40 bg-coral/20 text-coral shadow-[0_0_10px_rgba(239,68,68,0.3)] mb-3">
                <Droplets className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-coral">Hull leaks</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-bone">₱{totalLeakAmount.toLocaleString()}</p>
              <p className="mt-1 text-[11px] text-sand/70 leading-tight">{state.leaks.length} leaks worth patching.</p>
            </div>
          </button>

          <button
            onClick={() => onTabChange('alerts')}
            className="col-span-2 rounded-[24px] pirate-panel p-4 text-left transition-transform active:scale-[0.98] flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sky/40 bg-sky/20 text-sky shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                <CloudLightning className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky">Storm deck</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-2xl font-bold text-bone">{billsCount}</p>
                  <p className="text-xs text-sand/70 font-medium">bills incoming</p>
                </div>
              </div>
            </div>
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
