'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface LandingScreenProps {
  onTryMe: () => void
  onLoginDemo: () => void
}

const PROOF_POINTS = [
  {
    title: 'Simple daily check-ins',
    description: 'Save a small amount, log it fast, and see progress right away.',
    icon: Sparkles,
  },
  {
    title: 'Bills and habits in one place',
    description: 'See your next bill and the spending habit that needs attention today.',
    icon: ShieldCheck,
  },
  {
    title: 'Guidance from Kapitan',
    description: 'Ask what to prioritize next and get a clear answer in plain language.',
    icon: Compass,
  },
] as const

export function LandingScreen({ onTryMe, onLoginDemo }: LandingScreenProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground pirate-page">
      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-8 pt-safe md:px-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-10">
        <div className="flex items-center justify-end pt-4 lg:col-span-2 lg:pt-6">
          <ThemeToggle />
        </div>

        <section className="flex flex-1 flex-col justify-center py-6 lg:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="surface-card inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
          >
            Kapitan
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Money guidance for daily earners
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06, ease: 'easeOut' }}
            className="mt-6 max-w-[11ch] text-[3.2rem] font-semibold leading-[0.92] tracking-[-0.05em] text-foreground sm:text-[4.6rem]"
          >
            Keep your money plan clear every day.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
            className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Kapitan helps you track savings, watch upcoming bills, and spot spending habits before they become a
            problem. Open the demo, take the guided setup, and see the plan come together in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: 'easeOut' }}
            className="mt-8 grid gap-3 sm:grid-cols-3"
          >
            {PROOF_POINTS.map(({ title, description, icon: Icon }) => (
              <div key={title} className="surface-panel rounded-[1.75rem] p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="relative flex items-center justify-center py-4 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: 22, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[31rem]"
          >
            <div className="surface-panel rounded-[2rem] p-3 shadow-[0_22px_70px_rgba(5,10,16,0.14)]">
              <div className="rounded-[1.6rem] border border-border/80 bg-background/60 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-border bg-card/78 p-4">
                    <p className="label-kicker">Daily view</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">Small savings, clear progress, quick next step.</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-border bg-card/78 p-4">
                    <p className="label-kicker">Forecast</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">Upcoming bills stay visible before they become urgent.</p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-border bg-card/82 p-5">
                  <p className="label-kicker text-accent">Demo access</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Kapitan is ready to help you get started.</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Go straight into the demo or let Kapitan guide you through a quick setup first.
                  </p>

                  <div className="mt-5 space-y-3">
                    <button
                      onClick={onTryMe}
                      className="flex min-h-14 w-full items-center justify-between rounded-[1.3rem] bg-primary px-5 text-left text-primary-foreground transition-transform hover:opacity-95 active:scale-[0.985]"
                    >
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Try me!</p>
                        <p className="mt-1 text-sm font-semibold">Take the guided setup and meet Kapitan</p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0" />
                    </button>

                    <button
                      onClick={onLoginDemo}
                      className="flex min-h-14 w-full items-center justify-between rounded-[1.3rem] border border-border bg-card/70 px-5 text-left text-foreground transition-colors hover:bg-card active:scale-[0.985]"
                    >
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Login as demo</p>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">Skip the intro and open the app now</p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
