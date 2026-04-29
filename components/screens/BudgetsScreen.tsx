'use client'

import { CheckCircle2, Droplets, Hammer, ShieldAlert } from 'lucide-react'
import type { Leak } from '@/types'

interface LeaksScreenProps {
  leaks: Leak[]
  patchLeak: (id: string) => void
}

export function LeaksScreen({ leaks, patchLeak }: LeaksScreenProps) {
  const activeLeaks = leaks.filter((leak) => !leak.patched)
  const patchedLeaks = leaks.filter((leak) => leak.patched)
  const totalLeakAmount = activeLeaks.reduce((sum, leak) => sum + leak.amount, 0)
  const savedAmount = patchedLeaks.reduce((sum, leak) => sum + leak.amount, 0)

  return (
    <div className="min-h-dvh bg-navy pb-28 md:pb-6 pirate-page">
      <div className="mx-auto max-w-5xl space-y-6 px-4 pt-6 pb-safe">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-coral/35 bg-coral/12 text-coral">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <p className="pirate-kicker">Spending habits</p>
            <h1 className="font-display text-3xl font-semibold text-bone">Reduce the habits draining your budget</h1>
            <p className="text-sm text-sand/68">
              {activeLeaks.length > 0
                ? `P${totalLeakAmount.toLocaleString()} is still slipping out this week`
                : 'You have already dealt with the main spending habits.'}
            </p>
          </div>
        </div>

        {savedAmount > 0 && (
          <div className="flex items-center gap-3 rounded-3xl border border-teal/30 bg-teal/10 p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-teal" />
            <div>
              <p className="text-sm font-bold text-teal">P{savedAmount.toLocaleString()} recovered this week</p>
              <p className="text-xs text-sand/65">{patchedLeaks.length} habit{patchedLeaks.length !== 1 ? 's' : ''} reduced</p>
            </div>
          </div>
        )}

        {activeLeaks.length > 0 && (
          <div className="rounded-[28px] pirate-note p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-coral" />
              <p className="text-sm leading-relaxed text-ink/80">
                Small habits usually do the damage quietly. Left alone, they keep taking money that could have gone to your goals or bills.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {leaks.map((leak) => (
            <div
              key={leak.id}
              className={`rounded-[28px] p-5 transition-all duration-500 ${
                leak.patched ? 'border border-teal/25 bg-teal/5' : 'pirate-panel animate-patch-flash'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="pirate-kicker">{leak.patched ? 'Reduced' : 'Habit to watch'}</p>
                  <h2 className={`truncate font-display text-2xl font-semibold ${leak.patched ? 'text-teal line-through' : 'text-bone'}`}>
                    {leak.category}
                  </h2>
                  <span
                    className={`mt-2 inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      leak.patched
                        ? 'border-teal/25 bg-teal/10 text-teal'
                        : 'border-coral/25 bg-coral/10 text-coral'
                    }`}
                  >
                    {leak.frequency}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-display text-3xl font-semibold ${leak.patched ? 'text-sand/50 line-through' : 'text-coral'}`}>
                    P{leak.amount.toLocaleString()}
                  </p>
                  <p className="whitespace-nowrap text-xs uppercase tracking-[0.14em] text-sand/60">per week</p>
                </div>
              </div>

              <p className="mt-4 border-t border-brass/12 pt-4 text-sm leading-relaxed text-sand/72">
                {leak.patched
                  ? `Saving P${leak.amount.toLocaleString()} per week. Keep this habit change going.`
                  : leak.aiExplanation}
              </p>

              {leak.patched ? (
                <div className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-teal/25 bg-teal/10 py-3 text-sm font-semibold text-teal">
                  <CheckCircle2 className="h-4 w-4" />
                  Habit Reduced
                </div>
              ) : (
                <button
                  onClick={() => patchLeak(leak.id)}
                  className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-brass/25 bg-wood-light/45 py-3 text-sm font-semibold text-bone transition-colors active:bg-wood-light/70"
                >
                  <Hammer className="h-4 w-4 text-brass" />
                  Cut this spending
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-[28px] pirate-note p-5">
          <p className="pirate-kicker text-ink/60">Kapitan&apos;s challenge</p>
          <h2 className="font-display text-2xl font-semibold text-ink">Three-day spending reset</h2>
          <p className="mt-2 text-sm text-ink/75">
            Skip one repeat expense for three days and use the freed-up money to strengthen this week&apos;s savings.
          </p>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">
              <span>Progress</span>
              <span>Day {patchedLeaks.length > 0 ? Math.min(patchedLeaks.length + 1, 3) : 1} of 3</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-wood/18">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#c6a15b,#6ea2a5)] transition-all duration-700"
                style={{ width: `${(Math.min(patchedLeaks.length, 3) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
