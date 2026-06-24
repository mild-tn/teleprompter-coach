'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const initial: Theme = stored === 'dark' ? 'dark' : 'light'
    setThemeState(initial)
    document.documentElement.dataset.theme = initial
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    localStorage.setItem('theme', next)
    document.documentElement.dataset.theme = next
  }

  const toggle = () => {
    setThemeState((t) => {
      const next = t === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      document.documentElement.dataset.theme = next
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
