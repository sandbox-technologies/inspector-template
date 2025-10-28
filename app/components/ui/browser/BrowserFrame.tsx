import React from 'react'
import BrowserTopBar from './BrowserTopBar'

interface BrowserViewProps {
  initialUrl?: string
  heightClassName?: string
}

export default function BrowserFrame({ initialUrl = 'http://localhost:3000', heightClassName = 'h-full' }: BrowserViewProps) {
  const [url, setUrl] = React.useState<string>(initialUrl)
  const webviewRef = React.useRef<Electron.WebviewTag | null>(null)

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
  }

  React.useEffect(() => {
    const view = webviewRef.current
    if (!view) return
    const syncUrl = () => setUrl(view.getURL())
    view.addEventListener('did-navigate', syncUrl)
    view.addEventListener('did-navigate-in-page', syncUrl)
    view.addEventListener('page-title-updated', syncUrl)
    return () => {
      view.removeEventListener('did-navigate', syncUrl)
      view.removeEventListener('did-navigate-in-page', syncUrl)
      view.removeEventListener('page-title-updated', syncUrl)
    }
  }, [])

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
          style={{ width: '100%', height: '100%' }}
          allowpopups
        />
      </div>
    </div>
  )
}


