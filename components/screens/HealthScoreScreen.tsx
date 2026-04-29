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
    <div className="min-h-screen w-full bg-navy pb-8 pirate-page">
      {/* Mobile Header */}
      <div className="sticky top-0 w-full z-20 flex items-center gap-3 border-b border-brass/15 bg-ink/90 px-4 pb-3 pt-4 backdrop-blur-md lg:hidden">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/25 bg-wood-light/45 text-bone transition-transform hover:scale-105 active:scale-95"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="pirate-kicker">Condition report</p>
          <h1 className="font-display text-2xl font-semibold text-bone">Money condition</h1>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex w-full max-w-6xl mx-auto items-center gap-3 pt-8 pb-4 px-4">
        <button
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-brass/25 bg-wood-light/45 text-bone shadow-md transition-transform hover:scale-105 active:scale-95 mr-3"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div>
          <p className="pirate-kicker text-lg text-brass/80">Condition report</p>
          <h1 className="font-display text-4xl font-semibold text-bone">Money condition</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-6 md:grid md:grid-cols-12 md:gap-8">
        {/* Left Column */}
        <div className="md:col-span-5 lg:col-span-5 space-y-6">
          <div className="rounded-[32px] pirate-panel py-8 lg:py-12 shadow-lg border border-brass/10">
            <div className="flex flex-col items-center">
              <CircularProgress
                value={boatHealth.overallScore}
                size={240}
                strokeWidth={18}
                label={boatHealth.status}
              />
              <p className="mt-8 text-center text-sm font-medium text-sand/80 max-w-[220px]">
                Updated from your latest savings and bill check
              </p>
            </div>
          </div>

          <div className="rounded-[28px] pirate-note p-6 shadow-md border-l-4 border-coral/80">
            <div className="flex items-start gap-4">
              <Compass className="mt-1 h-6 w-6 text-coral shrink-0" />
              <div>
                <p className="pirate-kicker text-ink/70">Kapitan's note</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-ink/90">{boatHealth.aiInsight}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 lg:col-span-7 space-y-6 mt-6 md:mt-0">
          <div className="rounded-[28px] pirate-panel p-6 lg:p-8 shadow-md border border-brass/10">
            <h2 className="flex items-center gap-3 font-display text-2xl lg:text-3xl font-semibold text-bone border-b border-brass/10 pb-4">
              <TrendingUp className="h-6 w-6 text-brass" />
              What affects it
            </h2>

            <div className="mt-6 space-y-5">
              {boatHealth.categories.map((category) => (
                <div key={category.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-sand">{category.label}</span>
                    <span className="text-base font-bold bg-ink/50 px-2.5 py-0.5 rounded-full" style={{ color: category.color }}>
                      {category.score}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-wood/35 ring-1 ring-inset ring-wood-light/20">
                    <div
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${category.score}%`, backgroundColor: category.color }}
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-sand/70">{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] bg-ink/40 border border-brass/5 p-6 lg:p-8">
            <div className="px-1 mb-6">
              <p className="pirate-kicker text-brass/80">Next steps</p>
              <h2 className="font-display text-2xl lg:text-3xl font-semibold text-bone">Recommended actions</h2>
            </div>

            {boatHealth.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-[24px] pirate-panel p-5 shadow-sm hover:shadow-md transition-shadow border border-brass/5 hover:border-brass/20 group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brass/30 bg-brass/15 text-base font-bold text-brass group-hover:bg-brass/25 transition-colors">
                  {index + 1}
                </span>
                <p className="pt-2 text-sm lg:text-base leading-relaxed text-sand/80 font-medium">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

