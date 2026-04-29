'use client'

import { Bell, CheckCircle2, CloudLightning, RotateCcw, Wallet } from 'lucide-react'
import type { SavingsEntry, StormWarning } from '@/types'

interface StormsScreenProps {
  storms: StormWarning[]
  savingsEntries: SavingsEntry[]
  resolveStorm: (id: string) => void
  remindStormLater: (id: string) => void
  reopenStorm: (id: string) => void
}

function sortStorms(storms: StormWarning[]) {
  return [...storms].sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}

export function ActivityScreen({
  storms,
  savingsEntries,
  resolveStorm,
  remindStormLater,
  reopenStorm,
}: StormsScreenProps) {
  const sortedStorms = sortStorms(storms)
  const dueSoon = sortedStorms.filter((storm) => storm.status !== 'handled' && storm.daysUntilDue <= 3)
  const remindLater = sortedStorms.filter((storm) => storm.status === 'remind_later')
  const handled = sortedStorms.filter((storm) => storm.status === 'handled')

  return (
    <div className="min-h-dvh bg-navy pb-28 md:pb-6 pirate-page">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-safe">
        <div className="mb-6">
          <p className="pirate-kicker">Storm Forecast</p>
          <h1 className="text-3xl font-semibold text-bone">Upcoming bills</h1>
          <p className="text-sm text-sand/68">
            Keep track of what is due, what is handled, and what needs a reminder.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-[28px] pirate-panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">Due soon</p>
            <p className="mt-2 text-3xl font-semibold text-bone">{dueSoon.length}</p>
            <p className="mt-1 text-sm text-sand/68">Bills due within the next 3 days.</p>
          </div>
          <div className="rounded-[28px] pirate-panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">Handled</p>
            <p className="mt-2 text-3xl font-semibold text-teal">{handled.length}</p>
            <p className="mt-1 text-sm text-sand/68">Bills already dealt with this cycle.</p>
          </div>
          <div className="rounded-[28px] pirate-panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">Needs follow-up</p>
            <p className="mt-2 text-3xl font-semibold text-brass">{remindLater.length}</p>
            <p className="mt-1 text-sm text-sand/68">Bills marked to remind later inside the app.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[28px] pirate-panel p-5">
            <div className="flex items-center gap-2 text-sky">
              <CloudLightning className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Forecast</p>
            </div>

            <div className="mt-4 space-y-4">
              {sortedStorms.map((storm) => {
                const isHandled = storm.status === 'handled'
                const isRemindLater = storm.status === 'remind_later'

                return (
                  <div
                    key={storm.id}
                    className={`rounded-[24px] border p-4 ${
                      isHandled
                        ? 'border-teal/22 bg-teal/8'
                        : isRemindLater
                          ? 'border-brass/22 bg-brass/8'
                          : 'border-brass/12 bg-ink/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-bone">{storm.name}</p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                              isHandled
                                ? 'bg-teal/16 text-teal'
                                : isRemindLater
                                  ? 'bg-brass/16 text-brass'
                                  : 'bg-coral/14 text-coral'
                            }`}
                          >
                            {isHandled ? 'Handled' : isRemindLater ? 'Remind later' : 'Upcoming'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-sand/68">
                          Due in {storm.daysUntilDue} day(s) on {storm.dueDate}
                        </p>
                      </div>
                      <p className="shrink-0 text-xl font-semibold text-bone">P{storm.amount.toLocaleString()}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!isHandled && (
                        <button
                          onClick={() => resolveStorm(storm.id)}
                          className="flex min-h-10 items-center justify-center gap-2 rounded-full bg-teal px-4 text-sm font-semibold text-ink transition-transform active:scale-[0.98]"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark handled
                        </button>
                      )}

                      {!isHandled && (
                        <button
                          onClick={() => remindStormLater(storm.id)}
                          className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-brass/22 bg-brass/10 px-4 text-sm font-semibold text-brass transition-colors active:bg-brass/18"
                        >
                          <Bell className="h-4 w-4" />
                          Remind later
                        </button>
                      )}

                      {(isHandled || isRemindLater) && (
                        <button
                          onClick={() => reopenStorm(storm.id)}
                          className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-sand/18 bg-ink/36 px-4 text-sm font-semibold text-sand transition-colors active:bg-wood-light/36"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Move back to upcoming
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[28px] pirate-panel p-5">
              <div className="flex items-center gap-2 text-brass">
                <Bell className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Reminder states</p>
              </div>
              <div className="mt-4 space-y-3 text-sm text-sand/72">
                <p>
                  Upcoming bills stay active until they are marked handled.
                </p>
                <p>
                  Use remind later when a bill is already on your radar but not yet paid.
                </p>
                <p>
                  Handled bills stay visible here so the forecast still shows what you already settled.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] pirate-panel p-5">
              <div className="flex items-center gap-2 text-brass">
                <Wallet className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Recent check-ins</p>
              </div>
              <div className="mt-4 space-y-3">
                {savingsEntries.slice(0, 4).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-brass/12 bg-ink/28 px-4 py-3">
                    <p className="text-sm font-semibold text-bone">P{entry.amount.toLocaleString()} saved</p>
                    <p className="mt-1 text-xs text-sand/62">
                      {entry.sourceNote} · {entry.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
