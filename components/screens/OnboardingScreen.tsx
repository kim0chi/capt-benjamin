'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Droplets, Pocket, ShieldCheck } from 'lucide-react'

interface OnboardingScreenProps {
  onComplete: () => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      id: 'checkin',
      title: 'Save a little. See it land.',
      description:
        'Capt. Benjamin turns one small check-in into visible progress, so daily savings never feel invisible.',
      icon: <Droplets className="h-12 w-12 text-coral" />,
      buttonText: 'Show me the route',
    },
    {
      id: 'hull',
      title: 'Keep goals and leaks on one deck.',
      description:
        'Your main goal, your next bill, and your biggest spending leak stay in one clear field of view.',
      icon: <Pocket className="h-12 w-12 text-teal" />,
      buttonText: 'Keep charting',
    },
    {
      id: 'storms',
      title: 'Benjamin can take the watch.',
      description:
        'Ask the captain where to steer next, then hand him a few essentials so he can tailor the route.',
      icon: <ShieldCheck className="h-12 w-12 text-sky" />,
      buttonText: 'Meet the captain',
    },
  ] as const

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }
    onComplete()
  }

  const current = steps[step]

  return (
    <div className="flex h-screen w-full flex-col bg-navy text-center pirate-page">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-teal/5 via-navy to-ink pointer-events-none" />

      <div className="z-10 flex flex-1 flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-[340px] flex-col items-center"
          >
            <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-full border border-brass/10 bg-ink/40 shadow-xl backdrop-blur-md">
              {current.icon}
            </div>

            <h2 className="font-display text-[2rem] font-bold leading-tight text-bone">{current.title}</h2>

            <p className="mt-6 text-lg font-medium leading-relaxed text-sand/80">{current.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="z-10 p-8">
        <div className="mb-8 flex justify-center gap-2">
          {steps.map((item, index) => (
            <div
              key={item.id}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                index === step ? 'w-8 bg-brass shadow-[0_0_12px_rgba(198,161,91,0.5)]' : 'w-2 bg-brass/20'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-brass px-6 py-5 text-sm font-bold uppercase tracking-widest text-ink shadow-[0_4px_30px_rgba(198,161,91,0.2)] transition-transform hover:bg-brass/90 active:scale-95"
        >
          <span className="relative z-10">{current.buttonText}</span>
        </button>
      </div>
    </div>
  )
}
