'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Droplets, Pocket, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface OnboardingScreenProps {
  onComplete: () => void
}

const steps = [
  {
    id: 'checkin',
    title: 'Save a little. See it add up.',
    description:
      'Kapitan turns one small check-in into visible progress, so daily savings never feel invisible.',
    icon: Droplets,
    buttonText: 'Show me the plan',
  },
  {
    id: 'overview',
    title: 'Keep goals and bills in one view.',
    description:
      'Your main goal, next bill, and biggest spending habit stay in one clear view.',
    icon: Pocket,
    buttonText: 'Keep going',
  },
  {
    id: 'guide',
    title: 'Kapitan can guide the next step.',
    description:
      'Ask what to prioritize next, then give a few details so the demo can reflect your situation.',
    icon: ShieldCheck,
    buttonText: 'Meet Kapitan',
  },
] as const

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const Icon = current.icon

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }
    onComplete()
  }

  return (
    <div className="min-h-screen bg-background text-foreground pirate-page">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-8 pt-safe md:px-8 lg:px-10">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="label-kicker">Kapitan</p>
            <p className="mt-1 text-sm text-muted-foreground">Quick walkthrough before the guided setup</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
              <div className="grid grid-cols-3 gap-3">
                {steps.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-[1.3rem] border px-4 py-4 text-left transition-colors ${
                      index === step
                        ? 'border-primary/40 bg-primary/10 text-foreground'
                        : 'border-border bg-card/70 text-muted-foreground'
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Step {index + 1}</p>
                    <p className="mt-2 text-sm font-semibold">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="surface-panel rounded-[2.2rem] p-6 sm:p-8"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-primary/12 text-primary">
                  <Icon className="h-8 w-8" />
                </div>

                <p className="mt-6 label-kicker">Step {step + 1} of {steps.length}</p>
                <h1 className="mt-3 text-[2.35rem] font-semibold leading-tight tracking-[-0.04em] text-foreground">
                  {current.title}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                  {current.description}
                </p>

                <div className="mt-8 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#d0a84f,#48a4b7)] transition-all duration-500"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  />
                </div>

                <button
                  onClick={nextStep}
                  className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.4rem] bg-primary px-6 text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:opacity-95 active:scale-95"
                >
                  {current.buttonText}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
