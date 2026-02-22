import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'

export function useDarkMode() {
  const theme = useAppStore((s) => s.config.theme)

  useEffect(() => {
    const root = document.documentElement

    function applyTheme() {
      if (theme === 'dark') {
        root.classList.add('dark')
      } else if (theme === 'light') {
        root.classList.remove('dark')
      } else {
        // system
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)',
        ).matches
        root.classList.toggle('dark', prefersDark)
      }
    }

    applyTheme()

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])
}
