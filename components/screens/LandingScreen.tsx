'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react'
import { CaptainBenjaminPortrait } from '@/components/illustrations/CaptainBenjaminPortrait'

interface LandingScreenProps {
  onTryMe: () => void
  onLoginDemo: () => void
}

const PROOF_POINTS = [
  {
    title: 'Daily savings check-ins',
    description: 'Turn tiny deposits into visible progress before the day gets away from you.',
    icon: Sparkles,
  },
  {
    title: 'Storms and leaks in one glance',
    description: 'Keep the next bill and the biggest spending drain in the same field of view.',
    icon: ShieldCheck,
  },
  {
    title: 'A captain who answers fast',
    description: 'Ask Benjamin where to steer today and keep the next move simple.',
    icon: Compass,
  },
] as const

export function LandingScreen({ onTryMe, onLoginDemo }: LandingScreenProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-navy text-bone pirate-page">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(110,162,165,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(198,161,91,0.18),transparent_26%)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-8 pt-safe md:px-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-10">
        <section className="flex flex-1 flex-col justify-center py-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-brass/20 bg-ink/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brass"
          >
            Capt. Benjamin
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            Money guidance for daily earners
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06, ease: 'easeOut' }}
            className="mt-6 max-w-[10ch] text-[3.2rem] font-semibold leading-[0.92] tracking-[-0.04em] text-bone sm:text-[4.5rem]"
          >
            Chart your money before it drifts.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
            className="mt-5 max-w-xl text-base leading-7 text-sand/78 sm:text-lg"
          >
            Capt. Benjamin turns daily savings, upcoming bills, and spending leaks into one clear route. Show the
            app, take the tour, and watch the ledger come alive in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: 'easeOut' }}
            className="mt-8 grid gap-3 sm:grid-cols-3"
          >
            {PROOF_POINTS.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-[1.75rem] border border-brass/12 bg-ink/36 p-4 backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brass/12 text-brass">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-bone">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-sand/66">{description}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="relative flex items-center justify-center py-6 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: 22, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[29rem]"
          >
            <div className="absolute inset-x-10 top-10 h-44 rounded-full bg-brass/18 blur-3xl" />
            <div className="absolute -left-2 top-16 h-32 w-32 rounded-full bg-teal/16 blur-3xl" />

            <div className="rounded-[2rem] border border-brass/16 bg-ink/56 p-3 shadow-[0_22px_70px_rgba(5,10,16,0.45)] backdrop-blur-xl">
              <CaptainBenjaminPortrait className="aspect-[4/4.6] w-full rounded-[1.6rem]" />

              <div className="mt-3 rounded-[1.6rem] border border-brass/12 bg-navy/78 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal">Demo access</p>
                <h2 className="mt-2 text-2xl font-semibold text-bone">Benjamin is ready to show you the route.</h2>
                <p className="mt-2 text-sm leading-6 text-sand/68">
                  Jump straight into the demo or let him walk you through the money map first.
                </p>

                <div className="mt-5 space-y-3">
                  <button
                    onClick={onTryMe}
                    className="flex min-h-14 w-full items-center justify-between rounded-[1.3rem] bg-brass px-5 text-left text-ink transition-transform hover:bg-gold active:scale-[0.985]"
                  >
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Try me!</p>
                      <p className="mt-1 text-sm font-semibold">Take the guided tour and meet your captain</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0" />
                  </button>

                  <button
                    onClick={onLoginDemo}
                    className="flex min-h-14 w-full items-center justify-between rounded-[1.3rem] border border-brass/16 bg-wood-light/26 px-5 text-left text-bone transition-colors hover:bg-wood-light/36 active:scale-[0.985]"
                  >
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brass">Login as demo</p>
                      <p className="mt-1 text-sm font-semibold text-sand/84">Skip the intro and open the app now</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-brass" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
