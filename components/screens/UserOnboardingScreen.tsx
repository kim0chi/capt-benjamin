'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Compass } from 'lucide-react'
import { CaptainBenjaminPortrait } from '@/components/illustrations/CaptainBenjaminPortrait'
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
    description: 'I keep a better ledger when I know whose voyage I am charting.',
    placeholder: 'Your name',
  },
  role: {
    kicker: 'How you earn',
    title: 'What kind of work keeps your ship moving?',
    description: 'A short answer is enough: market vendor, tricycle driver, freelancer, helper, and so on.',
    placeholder: 'Your role or income source',
  },
  incomeCadence: {
    kicker: 'Your rhythm',
    title: 'When does money usually come in?',
    description: 'This helps Benjamin frame a savings habit around the real pace of your week.',
    placeholder: 'Every day, every Friday, twice a month',
  },
  primaryGoal: {
    kicker: 'Your destination',
    title: 'What goal matters most right now?',
    description: 'Benjamin will turn this into the main route inside the demo ledger.',
    placeholder: 'Emergency fund, school fees, business capital',
  },
  pressurePoint: {
    kicker: 'The nearest storm',
    title: 'Which bill or pressure point needs watching first?',
    description: 'Name the next thing that could shake the route if it is left unattended.',
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
      return 'We will keep this short. Give me the essentials, and I will open the ledger in your name.'
    }

    if (stepKey === 'role') {
      return `${answers.name.trim()}, good. Now tell me what kind of work keeps your income moving.`
    }

    if (stepKey === 'incomeCadence') {
      return `Understood. I will match the route to how ${answers.name.trim()} gets paid.`
    }

    if (stepKey === 'primaryGoal') {
      return 'A voyage needs a destination. Give me the goal that deserves first claim on your next spare peso.'
    }

    if (stepKey === 'pressurePoint') {
      return 'Last thing: name the nearest storm so I can pin it to the deck before we sail.'
    }

    return 'Start with your name, and I will take it from there.'
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
    <div className="min-h-screen bg-navy text-bone pirate-page">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-8 pt-safe md:px-8 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-10 lg:px-10">
        <section className="flex flex-col justify-center py-8 lg:py-10">
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-[2rem] border border-brass/14 bg-ink/48 p-3 shadow-[0_24px_70px_rgba(5,10,16,0.45)]">
              <CaptainBenjaminPortrait className="aspect-[4/4.7] w-full rounded-[1.6rem]" />
            </div>

            <div className="mt-5 rounded-[1.8rem] border border-brass/12 bg-ink/42 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-brass">
                <Compass className="h-4 w-4" />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Capt. Benjamin</p>
              </div>
              <p className="mt-3 text-lg leading-8 text-sand/86">{captainResponse}</p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center py-4 lg:py-10">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-brass/14 bg-ink/52 p-5 backdrop-blur-xl shadow-[0_20px_70px_rgba(5,10,16,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleBack}
                disabled={stepIndex === 0}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brass/16 bg-wood-light/22 text-bone transition-colors disabled:opacity-35"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-wood/35">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#c6a15b,#6ea2a5)] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">
                {stepIndex + 1}/{STEP_ORDER.length}
              </p>
            </div>

            <div className="mt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal">{step.kicker}</p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stepKey}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <h1 className="mt-3 text-[2rem] font-semibold leading-tight text-bone">{step.title}</h1>
                  <p className="mt-3 text-sm leading-7 text-sand/70">{step.description}</p>

                  <div className="mt-7">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">
                      Your answer
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(event) => handleChange(event.target.value)}
                      placeholder={step.placeholder}
                      className="h-14 w-full rounded-[1.3rem] border border-brass/16 bg-wood-light/24 px-4 text-base text-bone placeholder:text-sand/36 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={handleNext}
              disabled={!canContinue}
              className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.35rem] bg-brass px-5 text-sm font-bold uppercase tracking-[0.16em] text-ink transition-transform hover:bg-gold active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {stepIndex === STEP_ORDER.length - 1 ? (
                <>
                  <Check className="h-4 w-4" />
                  Open my route
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
