'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Pocket, ShieldCheck } from 'lucide-react'

interface OnboardingScreenProps {
  onComplete: () => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      id: 'quote',
      title: 'Beware of little expenses.',
      description: 'A small leak will sink a great ship. — Benjamin Franklin',
      icon: <Droplets className="h-12 w-12 text-coral" />,
      buttonText: 'Find My Leaks',
    },
    {
      id: 'hull',
      title: 'Measure the Hull',
      description: "Every ship needs a strong base. We track your steady income—the cargo space you have before the journey begins.",
      icon: <Pocket className="h-12 w-12 text-teal" />,
      buttonText: 'Inspect Cargo',
    },
    {
      id: 'storms',
      title: 'Outrun the Storms',
      description: "Bills and upcoming debt are storms on the horizon. Benjamin monitors the radar so you are never caught unprepared.",
      icon: <ShieldCheck className="h-12 w-12 text-sky" />,
      buttonText: 'Take the Helm',
    }
  ]

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const current = steps[step]

  return (
    <div className="flex h-screen w-full flex-col bg-navy text-center pirate-page">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-teal/5 via-navy to-ink pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-[320px] flex-col items-center"
          >
            <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-full border border-brass/10 bg-ink/40 shadow-xl backdrop-blur-md">
              {current.icon}
            </div>

            <h2 className="font-display text-[2rem] leading-tight font-bold text-bone">
              {current.title}
            </h2>
            
            <p className="mt-6 text-lg leading-relaxed text-sand/80 font-medium">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 z-10">
        {/* Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div 
              key={s.id} 
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                i === step ? 'w-8 bg-brass shadow-[0_0_12px_rgba(198,161,91,0.5)]' : 'w-2 bg-brass/20'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          className="w-full rounded-2xl bg-brass px-6 py-5 text-sm font-bold uppercase tracking-widest text-ink transition-transform active:scale-95 hover:bg-brass/90 flex items-center justify-center overflow-hidden relative group shadow-[0_4px_30px_rgba(198,161,91,0.2)]"
        >
          <span className="relative z-10">{current.buttonText}</span>
        </button>
      </div>
    </div>
  )
}
