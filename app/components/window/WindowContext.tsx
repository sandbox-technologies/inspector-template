import { createContext, useContext, useEffect, useState } from 'react'
import { Titlebar, TitlebarProps } from './Titlebar'
import { TitlebarContextProvider } from './TitlebarContext'
import type { ChannelReturn } from '@/lib/ipc/schemas'
import { useApi } from '@/app/hooks/useApi'

type WindowInitProps = ChannelReturn<'window-init'>

interface WindowContextProps {
  titlebar: TitlebarProps
  readonly window: WindowInitProps
}

interface WindowContextProviderProps {
  children: React.ReactNode
  titlebar?: TitlebarProps
}

const WindowContext = createContext<WindowContextProps | undefined>(undefined)

export const WindowContextProvider = ({ children, titlebar }: WindowContextProviderProps) => {
  const [initProps, setInitProps] = useState<WindowInitProps | undefined>()
  const api = useApi()

  const defaultTitlebar: TitlebarProps = {
    title: 'Electron React App',
    icon: 'appIcon.png',
    titleCentered: false,
    menuItems: [],
  }

  // Merge default titlebar props with user defined props
  titlebar = { ...defaultTitlebar, ...titlebar }

  useEffect(() => {
    // Load window init props
    api.window.windowInit().then(setInitProps)

    // Add class to parent element
    const parent = document.querySelector('.window-content')?.parentElement
    if (parent) {
      parent.classList.add('window-frame')
    }
  }, [])

  return (
    <WindowContext.Provider value={{ titlebar, window: initProps! }}>
      <TitlebarContextProvider>
        <Titlebar />
      </TitlebarContextProvider>
      <WindowContent>{children}</WindowContent>
    </WindowContext.Provider>
  )
}

const WindowContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="window-content">{children}</div>
}

export const useWindowContext = () => {
  const context = useContext(WindowContext)
  if (context === undefined) {
    throw new Error('useWindowContext must be used within a WindowContextProvider')
  }
  return context
}
