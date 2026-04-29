'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={[
        'relative flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card/78 text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground',
        className ?? '',
      ].join(' ')}
    >
      <Sun
        className="absolute h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
        strokeWidth={2}
      />
      <Moon
        className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
        strokeWidth={2}
      />
    </button>
  )
}
