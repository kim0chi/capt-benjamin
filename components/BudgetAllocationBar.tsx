'use client'

interface Segment {
  label: string
  amount: number
  color: string
}

interface BudgetAllocationBarProps {
  income: number
  billsTotal: number
  leaksTotal: number
  goalsTotal: number
}

export function BudgetAllocationBar({
  income,
  billsTotal,
  leaksTotal,
  goalsTotal,
}: BudgetAllocationBarProps) {
  const remaining = Math.max(0, income - billsTotal - leaksTotal - goalsTotal)

  const segments: Segment[] = [
    { label: 'Storms',    amount: billsTotal,  color: '#a4493d' },
    { label: 'Leaks',     amount: leaksTotal,  color: '#c6a15b' },
    { label: 'Islands',   amount: goalsTotal,  color: '#4ca08f' },
    { label: 'Reserve',   amount: remaining,   color: '#6ea2a5' },
  ]

  return (
    <div className="rounded-[28px] pirate-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="pirate-kicker">Monthly ledger</p>
          <h3 className="font-display text-2xl font-semibold text-bone">Cargo allocation</h3>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.14em] text-sand/60">Monthly income</p>
          <p className="font-display text-xl font-bold text-brass">₱{income.toLocaleString()}</p>
        </div>
      </div>

      {/* Stacked allocation bar */}
      <div className="flex h-5 overflow-hidden rounded-full gap-px">
        {segments.map(s => (
          <div
            key={s.label}
            className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(s.amount / income) * 100}%`,
              backgroundColor: s.color,
            }}
          />
        ))}
      </div>

      {/* Legend grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.12em] text-sand/60 truncate">{s.label}</p>
              <p className="text-sm font-bold text-bone">₱{s.amount.toLocaleString()}</p>
            </div>
            <p className="ml-auto text-xs text-sand/50 flex-shrink-0">
              {Math.round((s.amount / income) * 100)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
