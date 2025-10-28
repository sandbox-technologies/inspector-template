import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return
    setIsDarkMode(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleDarkMode = () => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark')
    setIsDarkMode((prev) => !prev)
  }

  return { isDarkMode, toggleDarkMode }
}


