'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Compass } from 'lucide-react'
import { KapitanPortrait } from '@/components/illustrations/KapitanPortrait'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { DemoOnboardingAnswers } from '@/types'

interface UserOnboardingScreenProps {
  onComplete: (answers: DemoOnboardingAnswers) => void
}

type StepKey = keyof DemoOnboardingAnswers

const STEP_ORDER: StepKey[] = ['name', 'role', 'incomeCadence', 'primaryGoal', 'pressurePoint']

const STEP_COPY: Record<
  StepKey,
  {
    kicker: string
    title: string
    description: string
    placeholder: string
  }
> = {
  name: {
    kicker: 'Who are you?',
    title: 'Tell me what I should call you.',
    description: 'I can help better when I know who I am talking to.',
    placeholder: 'Your name',
  },
  role: {
    kicker: 'How you earn',
    title: 'What kind of work or income source do you have?',
    description: 'A short answer is enough: market vendor, tricycle driver, freelancer, helper, and so on.',
    placeholder: 'Your role or income source',
  },
  incomeCadence: {
    kicker: 'Your rhythm',
    title: 'When does money usually come in?',
    description: 'This helps Kapitan suggest a savings habit that fits your real week.',
    placeholder: 'Every day, every Friday, twice a month',
  },
  primaryGoal: {
    kicker: 'Main goal',
    title: 'What are you saving for first?',
    description: 'This will become the main goal inside the demo plan.',
    placeholder: 'Emergency fund, school fees, business capital',
  },
  pressurePoint: {
    kicker: 'Upcoming bill',
    title: 'Which bill or money pressure needs attention first?',
    description: 'Name the next thing that can disrupt your plan if it is not handled early.',
    placeholder: 'Rent, electric bill, loan payment',
  },
}

function buildDefaultAnswers(): DemoOnboardingAnswers {
  return {
    name: '',
    role: '',
    incomeCadence: '',
    primaryGoal: '',
    pressurePoint: '',
  }
}

export function UserOnboardingScreen({ onComplete }: UserOnboardingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<DemoOnboardingAnswers>(() => buildDefaultAnswers())

  const stepKey = STEP_ORDER[stepIndex]
  const step = STEP_COPY[stepKey]
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100
  const value = answers[stepKey]
  const canContinue = value.trim().length > 0

  const captainResponse = useMemo(() => {
    if (!answers.name.trim()) {
      return 'We will keep this short. Give me the essentials and I will set up the demo around your situation.'
    }

    if (stepKey === 'role') {
      return `${answers.name.trim()}, good. Now tell me what kind of work or income keeps your budget moving.`
    }

    if (stepKey === 'incomeCadence') {
      return `Understood. I will match the plan to how ${answers.name.trim()} gets paid.`
    }

    if (stepKey === 'primaryGoal') {
      return 'Now tell me the goal that matters most so I can place it at the top of your plan.'
    }

    if (stepKey === 'pressurePoint') {
      return 'Last one: name the bill or money pressure that needs to stay visible right away.'
    }

    return 'Start with your name and I will take it from there.'
  }, [answers.name, stepKey])

  const handleChange = (nextValue: string) => {
    setAnswers((prev) => ({ ...prev, [stepKey]: nextValue }))
  }

  const handleNext = () => {
    if (!canContinue) return
    if (stepIndex === STEP_ORDER.length - 1) {
      onComplete({
        name: answers.name.trim(),
        role: answers.role.trim(),
        incomeCadence: answers.incomeCadence.trim(),
        primaryGoal: answers.primaryGoal.trim(),
        pressurePoint: answers.pressurePoint.trim(),
      })
      return
    }

    setAnswers((prev) => ({ ...prev, [stepKey]: prev[stepKey].trimStart() }))
    setStepIndex((prev) => prev + 1)
  }

  const handleBack = () => {
    if (stepIndex === 0) return
    setStepIndex((prev) => prev - 1)
  }

  return (
    <div className="min-h-screen bg-background text-foreground pirate-page">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-8 pt-safe md:px-8 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-12 lg:px-10">
        <div className="flex items-center justify-end py-4 lg:col-span-2 lg:pt-6">
          <ThemeToggle />
        </div>

        <section className="flex flex-col justify-center py-4 lg:py-8">
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <div className="surface-panel rounded-[2rem] p-3">
              <KapitanPortrait className="aspect-[4/4.7] w-full rounded-[1.6rem]" />
            </div>

            <div className="surface-panel mt-5 rounded-[1.8rem] p-5">
              <div className="flex items-center gap-2 text-primary">
                <Compass className="h-4 w-4" />
                <p className="label-kicker">Kapitan</p>
              </div>
              <p className="mt-3 text-lg leading-8 text-muted-foreground">{captainResponse}</p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center py-4 lg:py-8">
          <div className="surface-panel mx-auto w-full max-w-md rounded-[2rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleBack}
                disabled={stepIndex === 0}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-foreground transition-colors disabled:opacity-35"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#d0a84f,#48a4b7)] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {stepIndex + 1}/{STEP_ORDER.length}
              </p>
            </div>

            <div className="mt-8">
              <p className="label-kicker text-accent">{step.kicker}</p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stepKey}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <h1 className="mt-3 text-[2rem] font-semibold leading-tight text-foreground">{step.title}</h1>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>

                  <div className="mt-7">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Your answer
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(event) => handleChange(event.target.value)}
                      placeholder={step.placeholder}
                      className="h-14 w-full rounded-[1.3rem] border border-border bg-card/82 px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={handleNext}
              disabled={!canContinue}
              className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.35rem] bg-primary px-5 text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:opacity-95 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {stepIndex === STEP_ORDER.length - 1 ? (
                <>
                  <Check className="h-4 w-4" />
                  Open my plan
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
