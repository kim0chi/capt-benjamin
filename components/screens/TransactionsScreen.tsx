'use client'

import { CloudLightning, Compass, Bell, CreditCard } from 'lucide-react'
import type { StormWarning } from '@/types'

interface AlertsScreenProps {
  storms: StormWarning[]
}

const priorityConfig = {
  critical: {
    badge: 'bg-coral/18 text-coral border-coral/25',
    label: 'Pay now',
    dueDateClass: 'text-coral',
    borderClass: 'border-coral/35',
  },
  high: {
    badge: 'bg-brass/15 text-brass border-brass/25',
    label: 'High priority',
    dueDateClass: 'text-brass',
    borderClass: 'border-brass/30',
  },
  medium: {
    badge: 'bg-sky/16 text-sky border-sky/22',
    label: 'Prepare soon',
    dueDateClass: 'text-sky',
    borderClass: 'border-sky/24',
  },
}

function dueDateLabel(daysUntilDue: number): string {
  if (daysUntilDue <= 0) return 'Due today'
  if (daysUntilDue === 1) return 'Due tomorrow'
  return `Due in ${daysUntilDue} days`
}

export function AlertsScreen({ storms }: AlertsScreenProps) {
  const totalAmount = storms.reduce((sum, storm) => sum + storm.amount, 0)

  return (
    <div className="min-h-screen bg-navy pb-28 pirate-page">
      <div className="space-y-5 px-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-coral/35 bg-coral/12 text-coral animate-storm-pulse">
            <CloudLightning className="h-5 w-5" />
          </div>
          <div>
            <p className="pirate-kicker">Storm deck</p>
            <h1 className="font-display text-3xl font-semibold text-bone">Storm warnings</h1>
            <p className="text-sm text-sand/68">Bills and rough waters approaching the ledger</p>
          </div>
        </div>

        <div className="rounded-[28px] pirate-note p-5">
          <div className="flex items-start gap-3">
            <Compass className="mt-0.5 h-5 w-5 text-coral" />
            <div>
              <p className="pirate-kicker text-ink/65">Captain&apos;s briefing</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                Internet arrives first on the horizon. Keep P{totalAmount.toLocaleString()} visible in the ledger this week and avoid optional spending until the nearest storm is handled.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {storms.map((storm) => {
            const config = priorityConfig[storm.priority]

            return (
              <div key={storm.id} className={`rounded-[28px] border ${config.borderClass} pirate-panel p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="pirate-kicker">Incoming storm</p>
                    <h2 className="font-display text-2xl font-semibold text-bone">{storm.name}</h2>
                    <p className={`mt-2 text-sm font-semibold ${config.dueDateClass}`}>{dueDateLabel(storm.daysUntilDue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-semibold text-bone">P{storm.amount.toLocaleString()}</p>
                    <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-brass/20 bg-wood-light/40 py-3 text-sm font-semibold text-bone">
                    <Bell className="h-4 w-4 text-brass" />
                    Set reminder
                  </button>
                  <button className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-brass py-3 text-sm font-semibold text-ink">
                    <CreditCard className="h-4 w-4" />
                    Prepare payment
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
