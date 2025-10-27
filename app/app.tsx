import { useEffect, useState } from 'react'
import WelcomeKit from '@/app/components/welcome/WelcomeKit'
import ElectronContent from '@/app/components/welcome/contents/ElectronContent'
import ReactContent from '@/app/components/welcome/contents/ReactContent'
import ViteContent from '@/app/components/welcome/contents/ViteContent'
import ShadContent from '@/app/components/welcome/contents/ShadContent'
import TailwindContent from '@/app/components/welcome/contents/TailwindContent'
import EraContent from '@/app/components/welcome/contents/EraContent'
import './styles/app.css'

export type ScreenType = 'electron' | 'react' | 'vite' | 'shadcn' | 'tailwind' | 'era' | 'welcome'

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
      case 'welcome':
        return <WelcomeKit />
      case 'electron':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <ElectronContent />
          </div>
        )
      case 'react':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <ReactContent />
          </div>
        )
      case 'vite':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <ViteContent />
          </div>
        )
      case 'shadcn':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <ShadContent />
          </div>
        )
      case 'tailwind':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <TailwindContent />
          </div>
        )
      case 'era':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <EraContent />
          </div>
        )
      default:
        return <WelcomeKit />
    }
  }

  return renderScreen()
}
