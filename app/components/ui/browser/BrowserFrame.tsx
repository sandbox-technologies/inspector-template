import React from 'react'
import BrowserTopBar from './BrowserTopBar'
import { useTabs } from '@/app/components/window/TabsContext'

interface BrowserViewProps {
  initialUrl?: string
  heightClassName?: string
  partitionId: string
  tabId: string
}

export default function BrowserFrame({ initialUrl = 'http://localhost:3000', heightClassName = 'h-full', partitionId, tabId }: BrowserViewProps) {
  const [url, setUrl] = React.useState<string>(initialUrl)
  const webviewRef = React.useRef<Electron.WebviewTag | null>(null)
  const { updateTab } = useTabs()

  const handleBack = () => {
    const view = webviewRef.current
    if (view?.canGoBack()) view.goBack()
  }

  const handleForward = () => {
    const view = webviewRef.current
    if (view?.canGoForward()) view.goForward()
  }

  const handleReload = () => {
    const view = webviewRef.current
    view?.reload()
  }

  const handleSubmit = (value: string) => {
    const next = value.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//) ? value : `http://${value}`
    setUrl(next)
    const view = webviewRef.current
    if (view) view.setAttribute('src', next)
    updateTab(tabId, { url: next })
  }

  React.useEffect(() => {
    const view = webviewRef.current
    if (!view) return
    const syncUrl = () => {
      const current = view.getURL()
      setUrl(current)
      updateTab(tabId, { url: current })
    }
    const syncTitle = () => {
      updateTab(tabId, { title: view.getTitle() })
    }
    view.addEventListener('did-navigate', syncUrl)
    view.addEventListener('did-navigate-in-page', syncUrl)
    view.addEventListener('page-title-updated', syncTitle)
    return () => {
      view.removeEventListener('did-navigate', syncUrl)
      view.removeEventListener('did-navigate-in-page', syncUrl)
      view.removeEventListener('page-title-updated', syncTitle)
    }
  }, [tabId, updateTab])

  return (
    <div className="flex flex-col w-full h-full">
      <BrowserTopBar
        url={url}
        onBack={handleBack}
        onForward={handleForward}
        onReload={handleReload}
        onSubmit={handleSubmit}
        onChange={() => {}}
      />
      <div className={`flex-1 min-h-0 ${heightClassName}`}>
        <webview
          ref={webviewRef as unknown as React.RefObject<any>}
          src={url}
          partition={partitionId}
          style={{ width: '100%', height: '100%' }}
          allowpopups
        />
      </div>
    </div>
  )
}


