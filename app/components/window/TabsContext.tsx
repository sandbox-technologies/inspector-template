import { createContext, useContext, useState, useCallback } from 'react'

export type Tab = { 
  id: string
  title: string
  url?: string
  partitionId: string
  /**
   * Tab kind controls which view is rendered for this tab.
   * - 'workspace' shows the standard browser + chat layout
   * - 'welcome' shows the special welcome screen
   */
  kind?: 'workspace' | 'welcome'
}

interface TabsContextProps {
  tabs: Tab[]
  activeTabId: string
  addTab: () => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  reorderTabs: (newOrder: Tab[]) => void
  nextTab: () => void
  prevTab: () => void
  updateTab: (id: string, updates: Partial<Pick<Tab, 'title' | 'url'>>) => void
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined)

export const TabsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 't1', title: 'Welcome to Inspector', url: '', partitionId: 'persist:tab-t1', kind: 'welcome' }
  ])
  const [activeTabId, setActiveTabId] = useState<string>('t1')

  const addTab = useCallback(() => {
    const newTab: Tab = {
      id: `t${Date.now()}`,
      title: 'New Tab',
      url: '',
      partitionId: '', // placeholder; set after id is known
      kind: 'workspace'
    }
    // Ensure stable partition derived from ID
    newTab.partitionId = `persist:tab-${newTab.id}`
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [])

  const removeTab = useCallback((id: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== id)
      
      // If we removed the active tab, activate the next one or the previous one
      if (id === activeTabId && newTabs.length > 0) {
        const removedIndex = prev.findIndex(tab => tab.id === id)
        const newActiveIndex = Math.min(removedIndex, newTabs.length - 1)
        setActiveTabId(newTabs[newActiveIndex].id)
      }
      
      return newTabs
    })
  }, [activeTabId])

  const setActiveTab = useCallback((id: string) => {
    if (tabs.some(tab => tab.id === id)) {
      setActiveTabId(id)
    }
  }, [tabs])

  const reorderTabs = useCallback((newOrder: Tab[]) => {
    setTabs(newOrder)
  }, [])

  const nextTab = useCallback(() => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId)
    const nextIndex = (currentIndex + 1) % tabs.length
    setActiveTabId(tabs[nextIndex].id)
  }, [tabs, activeTabId])

  const prevTab = useCallback(() => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId)
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1
    setActiveTabId(tabs[prevIndex].id)
  }, [tabs, activeTabId])

  const updateTab = useCallback((id: string, updates: Partial<Pick<Tab, 'title' | 'url' | 'kind'>>) => {
    setTabs(prev => prev.map(tab => (tab.id === id ? { ...tab, ...updates } : tab)))
  }, [])

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        removeTab,
        setActiveTab,
        reorderTabs,
        nextTab,
        prevTab,
        updateTab
      }}
    >
      {children}
    </TabsContext.Provider>
  )
}

export const useTabs = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('useTabs must be used within a TabsContextProvider')
  }
  return context
}
