'use client'

interface CaptainFABProps {
  onClick: () => void
}

export function CaptainFAB({ onClick }: CaptainFABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Ask Kapitan"
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-brass/40 bg-[linear-gradient(180deg,rgba(198,161,91,0.96),rgba(132,91,39,0.98))] shadow-2xl shadow-black/40 transition-transform active:scale-90"
    >
      <span className="font-display text-base font-bold leading-none text-ink">K</span>

      <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
        <span className="relative h-2.5 w-2.5 rounded-full border border-ink/30 bg-teal" />
      </span>
    </button>
  )
}
