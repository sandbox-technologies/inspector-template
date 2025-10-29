import { useEffect } from 'react'
import { useTitlebarContext } from '@/app/components/window/TitlebarContext'
import { useTabs } from '@/app/components/window/TabsContext'
import { useProject } from '@/app/contexts/ProjectContext'
import { useStartWorkspace } from '@/app/utils/startWorkspace'

export function useMenuToggleShortcut(menuItems?: unknown[]) {
  const { menusVisible, setMenusVisible, closeActiveMenu } = useTitlebarContext()
  const hasMenus = Boolean(menuItems?.length)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && hasMenus && !e.repeat) {
        if (menusVisible) closeActiveMenu()
        setMenusVisible(!menusVisible)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menusVisible, closeActiveMenu, setMenusVisible, hasMenus])
}

export function useWindowShortcuts() {
  const { nextTab, prevTab, removeTab, activeTabId, tabs, addTab, isOpeningTab } = useTabs()
  const { project } = useProject()
  const startWorkspace = useStartWorkspace()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab switching with Ctrl+Tab
      if (e.ctrlKey && e.key === 'Tab' && !e.repeat) {
        e.preventDefault()
        if (e.shiftKey) {
          prevTab()
        } else {
          nextTab()
        }
      }

      // Focus chat input with Cmd/Ctrl+L
      const isFocusChatShortcut = (e.metaKey || e.ctrlKey) && (e.key === 'l' || e.key === 'L')
      if (isFocusChatShortcut && !e.repeat) {
        e.preventDefault()
        const allInputs = Array.from(
          document.querySelectorAll('textarea.chat-input-scroll')
        ) as HTMLTextAreaElement[]
        const visibleInput = allInputs.find((el) => {
          const style = window.getComputedStyle(el)
          return el.offsetParent !== null && style.visibility !== 'hidden'
        })
        if (visibleInput) {
          visibleInput.focus()
          // Optionally select existing text for quick overwrite
          visibleInput.select()
        }
      }

      // Close tab with Cmd+W (Mac) or Ctrl+W (Windows/Linux)
      const isCloseShortcut = (e.metaKey || e.ctrlKey) && e.key === 'w'
      if (isCloseShortcut && !e.repeat && tabs.length > 1) {
        e.preventDefault()
        removeTab(activeTabId)
      }

      // New tab with Cmd+T (Mac) or Ctrl+T (Windows/Linux)
      const isNewTabShortcut = (e.metaKey || e.ctrlKey) && e.key === 't'
      if (isNewTabShortcut && !e.repeat) {
        e.preventDefault()
        if (isOpeningTab) return
        
        // If we have a project set from the Open Project flow, start a new workspace
        if (project) {
          startWorkspace({
            projectPath: project.packagePath,
            setupCommand: project.commands.setup
          }).then(result => {
            if (!result.success) {
              console.error('Failed to start workspace:', result.error)
              // Tab was already created and converted to Open Project by useStartWorkspace
            }
            // Tab is created immediately; on success it updates and navigates
          })
        } else {
          // No project has been opened yet, create an open project tab
          addTab({ kind: 'open-project', title: 'Open Project' })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nextTab, prevTab, removeTab, activeTabId, tabs.length, addTab, project, startWorkspace, isOpeningTab])
}

export function useTitlebarShortcuts(menuItems?: unknown[]) {
  useMenuToggleShortcut(menuItems)
  useWindowShortcuts()
}


