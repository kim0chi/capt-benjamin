'use client'

import { Droplets, Hammer, ShieldAlert, CheckCircle2 } from 'lucide-react'
import type { Leak } from '@/types'

interface LeaksScreenProps {
  leaks: Leak[]
  patchLeak: (id: string) => void
}

export function LeaksScreen({ leaks, patchLeak }: LeaksScreenProps) {
  const activeLeaks = leaks.filter(l => !l.patched)
  const patchedLeaks = leaks.filter(l => l.patched)
  const totalLeakAmount = activeLeaks.reduce((sum, l) => sum + l.amount, 0)
  const savedAmount = patchedLeaks.reduce((sum, l) => sum + l.amount, 0)

  return (
    <div className="min-h-screen bg-navy pb-28 pirate-page">
      <div className="space-y-5 px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-coral/35 bg-coral/12 text-coral">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <p className="pirate-kicker">Repair order</p>
            <h1 className="font-display text-3xl font-semibold text-bone">Patch the hull leaks</h1>
            <p className="text-sm text-sand/68">
              {activeLeaks.length > 0
                ? `₱${totalLeakAmount.toLocaleString()} still drifting out this week`
                : 'All leaks sealed — hull is sound!'}
            </p>
          </div>
        </div>

        {/* Patched savings banner */}
        {savedAmount > 0 && (
          <div className="rounded-[24px] border border-teal/30 bg-teal/10 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-teal flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-teal">₱{savedAmount.toLocaleString()} recovered this week</p>
              <p className="text-xs text-sand/65">{patchedLeaks.length} leak{patchedLeaks.length !== 1 ? 's' : ''} patched</p>
            </div>
          </div>
        )}

        {/* Warning note */}
        {activeLeaks.length > 0 && (
          <div className="rounded-[28px] pirate-note p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-coral" />
              <p className="text-sm leading-relaxed text-ink/80">
                Small habits rarely sink a budget in one wave. They wear the hull down slowly until the voyage costs more than expected.
              </p>
            </div>
          </div>
        )}

        {/* Leak cards */}
        <div className="space-y-4">
          {leaks.map(leak => (
            <div
              key={leak.id}
              className={`rounded-[28px] p-5 transition-all duration-500 ${
                leak.patched
                  ? 'border border-teal/25 bg-teal/5'
                  : 'pirate-panel animate-patch-flash'
              }`}
              style={!leak.patched ? {} : {}}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="pirate-kicker">{leak.patched ? 'Sealed' : 'Leak report'}</p>
                  <h2 className={`font-display text-2xl font-semibold ${leak.patched ? 'text-teal line-through' : 'text-bone'}`}>
                    {leak.category}
                  </h2>
                  <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                    leak.patched
                      ? 'border-teal/25 bg-teal/10 text-teal'
                      : 'border-coral/25 bg-coral/10 text-coral'
                  }`}>
                    {leak.frequency}
                  </span>
                </div>
                <div className="text-right">
                  <p className={`font-display text-3xl font-semibold ${leak.patched ? 'text-sand/50 line-through' : 'text-coral'}`}>
                    ₱{leak.amount.toLocaleString()}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-sand/60">per week</p>
                </div>
              </div>

              <p className="mt-4 border-t border-brass/12 pt-4 text-sm leading-relaxed text-sand/72">
                {leak.patched
                  ? `Saving ₱${leak.amount.toLocaleString()} per week. This patch is holding — keep the habit.`
                  : leak.aiExplanation}
              </p>

              {leak.patched ? (
                <div className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-teal/25 bg-teal/10 py-3 text-sm font-semibold text-teal">
                  <CheckCircle2 className="h-4 w-4" />
                  Leak Patched
                </div>
              ) : (
                <button
                  onClick={() => patchLeak(leak.id)}
                  className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-brass/25 bg-wood-light/45 py-3 text-sm font-semibold text-bone transition-colors active:bg-wood-light/70"
                >
                  <Hammer className="h-4 w-4 text-brass" />
                  Patch this leak
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 3-day challenge */}
        <div className="rounded-[28px] pirate-note p-5">
          <p className="pirate-kicker text-ink/60">Captain&apos;s challenge</p>
          <h2 className="font-display text-2xl font-semibold text-ink">Three-day repair run</h2>
          <p className="mt-2 text-sm text-ink/75">
            Skip delivery for three days and reclaim enough cargo room to noticeably strengthen this week&apos;s reserve.
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
