'use client'

import { ChevronLeft, Compass, TrendingUp } from 'lucide-react'
import { CircularProgress } from '@/components/ui/circular-progress'
import type { BoatHealth } from '@/types'

interface HealthScoreScreenProps {
  boatHealth: BoatHealth
  onBack: () => void
}

export function HealthScoreScreen({ boatHealth, onBack }: HealthScoreScreenProps) {
  return (
    <div className="min-h-screen bg-navy pb-8 pirate-page">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-brass/15 bg-ink/90 px-4 pb-3 pt-4 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/25 bg-wood-light/45 text-bone"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="pirate-kicker">Condition report</p>
          <h1 className="font-display text-2xl font-semibold text-bone">Ship condition</h1>
        </div>
      </div>

      <div className="space-y-5 px-4 pt-6">
        <div className="rounded-[32px] pirate-panel py-8">
          <div className="flex flex-col items-center">
            <CircularProgress
              value={boatHealth.overallScore}
              size={200}
              strokeWidth={16}
              label={boatHealth.status}
            />
            <p className="mt-4 text-sm text-sand/68">Updated from the latest ledger check</p>
          </div>
        </div>

        <div className="rounded-[28px] pirate-panel p-5">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-bone">
            <TrendingUp className="h-5 w-5 text-brass" />
            Instrument breakdown
          </h2>

          <div className="mt-5 space-y-4">
            {boatHealth.categories.map((category) => (
              <div key={category.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-sand">{category.label}</span>
                  <span className="text-sm font-bold" style={{ color: category.color }}>
                    {category.score}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-wood/35">
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${category.score}%`, backgroundColor: category.color }}
                  />
                </div>
                <p className="text-xs leading-relaxed text-sand/62">{category.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] pirate-note p-5">
          <div className="flex items-start gap-3">
            <Compass className="mt-0.5 h-5 w-5 text-coral" />
            <div>
              <p className="pirate-kicker text-ink/65">Benjamin&apos;s log</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{boatHealth.aiInsight}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="px-1">
            <p className="pirate-kicker">Orders</p>
            <h2 className="font-display text-2xl font-semibold text-bone">Recommended actions</h2>
          </div>

          {boatHealth.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-[24px] pirate-panel p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brass/28 bg-brass/12 text-sm font-bold text-brass">
                {index + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-sand/74">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
