import { useEffect } from 'react'
import { useTitlebarContext } from '@/app/components/window/TitlebarContext'
import { useTabs } from '@/app/components/window/TabsContext'

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
  const { nextTab, prevTab, removeTab, activeTabId, tabs, addTab } = useTabs()

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
        addTab()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nextTab, prevTab, removeTab, activeTabId, tabs.length, addTab])
}

export function useTitlebarShortcuts(menuItems?: unknown[]) {
  useMenuToggleShortcut(menuItems)
  useWindowShortcuts()
}


