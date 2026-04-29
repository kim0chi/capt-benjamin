'use client'

import * as React from 'react'

const THEME_STORAGE_KEY = 'kapitan-theme'
const THEME_EVENT = 'kapitan-theme-change'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function readThemeFromDom(): Theme {
  if (typeof document === 'undefined') {
    return 'dark'
  }

  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function persistTheme(theme: Theme) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {}
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  persistTheme(theme)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }))
  }
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      callback()
    }
  }

  const handleThemeChange = () => {
    callback()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(THEME_EVENT, handleThemeChange)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(THEME_EVENT, handleThemeChange)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore<Theme>(subscribe, readThemeFromDom, () => 'dark')

  const setTheme = React.useCallback((nextTheme: Theme) => {
    applyTheme(nextTheme)
  }, [])

  const toggleTheme = React.useCallback(() => {
    applyTheme(readThemeFromDom() === 'dark' ? 'light' : 'dark')
  }, [])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: theme,
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}

export { THEME_STORAGE_KEY }
