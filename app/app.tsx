import { useEffect, useState } from 'react'
import './styles/app.css'
import Workspace from './components/ui/workspace/Workspace'

export type ScreenType = 'electron' | 'react' | 'vite' | 'shadcn' | 'tailwind' | 'era' | 'welcome' | 'twopane'

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('welcome')

  useEffect(() => {
    const handleNavigateScreen = (event: CustomEvent<ScreenType>) => {
      setActiveScreen(event.detail)
    }

    // Listen for navigation events from the menu
    window.addEventListener('navigate-screen', handleNavigateScreen as EventListener)

    return () => {
      window.removeEventListener('navigate-screen', handleNavigateScreen as EventListener)
    }
  }, [])

  const renderScreen = () => {
    switch (activeScreen) {
      default:
        return <Workspace />
    }
  }

  return renderScreen()
}
