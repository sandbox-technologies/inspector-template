import { createContext, useContext, useState, useCallback } from 'react'
import inspectorFavicon from '@/app/assets/logo/favicons/favicon-32x32.png'

export type Tab = { 
  id: string
  title: string
  url?: string
  partitionId: string
  favicon?: string
  /**
   * Tab kind controls which view is rendered for this tab.
   * - 'workspace' shows the standard browser + chat layout
   * - 'welcome' shows the special welcome screen
   * - 'open-project' shows the Open Project launcher screen
   */
  kind?: 'workspace' | 'welcome' | 'open-project' | 'ai-debugger'
  /**
   * Workspace-specific data for tabs running dev servers
   */
  workspaceId?: string
  git?: {
    branch: string
    worktreePath: string
  }
}

interface TabsContextProps {
  tabs: Tab[]
  activeTabId: string
  addTab: (tabProps?: Partial<Tab>) => string
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  reorderTabs: (newOrder: Tab[]) => void
  nextTab: () => void
  prevTab: () => void
  updateTab: (id: string, updates: Partial<Tab>) => void
  openingTabId: string | null
  isOpeningTab: boolean
  beginOpeningTab: (id: string) => void
  endOpeningTab: () => void
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined)

export const TabsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const initialTabs: Tab[] = [
    { id: 't1', title: 'Welcome to Inspector', url: '', partitionId: 'persist:tab-t1', kind: 'welcome', favicon: inspectorFavicon },
    { id: 't2', title: 'Open Project', url: '', partitionId: 'persist:tab-t2', kind: 'open-project', favicon: inspectorFavicon }
  ]
  // Add dev-only AI Debugger tab on startup
  if (import.meta.env && import.meta.env.DEV) {
    initialTabs.push({ id: 't3', title: 'AI Debugger', url: '', partitionId: 'persist:tab-t3', kind: 'ai-debugger', favicon: inspectorFavicon })
  }
  const [tabs, setTabs] = useState<Tab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState<string>('t1')
  const [openingTabId, setOpeningTabId] = useState<string | null>(null)

  const addTab = useCallback((tabProps?: Partial<Tab>) => {
    const id = `t${Date.now()}`
    const newTab: Tab = {
      id,
      title: 'New Tab',
      url: '',
      partitionId: `persist:tab-${id}`,
      kind: 'workspace',
      ...tabProps, // Apply any provided properties
    }
    // If custom ID was provided, update the partitionId accordingly
    if (tabProps?.id && tabProps.id !== id) {
      newTab.partitionId = `persist:tab-${tabProps.id}`
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    return newTab.id
  }, [])

  const removeTab = useCallback(async (id: string) => {
    // Find the tab to check if it has a workspace
    const tabToRemove = tabs.find(tab => tab.id === id)
    
    // If it's a workspace tab, stop the workspace
    if (tabToRemove?.workspaceId) {
      try {
        await (window as any).conveyor.workspace.stop({ 
          workspaceId: tabToRemove.workspaceId 
        })
      } catch (error) {
        console.error('Failed to stop workspace:', error)
      }
    }
    
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
  }, [activeTabId, tabs])

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

  const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id !== id) return tab
      const next = { ...tab, ...updates }
      if (typeof updates.kind !== 'undefined' && updates.kind !== 'workspace') {
        next.favicon = inspectorFavicon
      }
      return next
    }))
  }, [])

  const beginOpeningTab = useCallback((id: string) => {
    setOpeningTabId(id)
  }, [])

  const endOpeningTab = useCallback(() => {
    setOpeningTabId(null)
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
        updateTab,
        openingTabId,
        isOpeningTab: openingTabId !== null,
        beginOpeningTab,
        endOpeningTab
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
