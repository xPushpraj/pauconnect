import { useLayoutEffect, useMemo, useState } from 'react'
import { ThemeContext, type Theme, type ThemeContextValue } from './themeContext'

function getPreferredTheme(): Theme {
  const stored = window.localStorage.getItem('pauconnect.theme')
  if (stored === 'dark' || stored === 'light') return stored
  return 'dark'
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getPreferredTheme())

  useLayoutEffect(() => {
    applyThemeToDocument(theme)
    window.localStorage.setItem('pauconnect.theme', theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      setTheme: (next) => setThemeState(next),
      toggleTheme: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
    }
  }, [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
