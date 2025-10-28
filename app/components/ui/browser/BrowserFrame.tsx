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
  const [progress, setProgress] = React.useState<number>(0)
  const loadingTickerRef = React.useRef<number | null>(null)
  const pendingStopTimerRef = React.useRef<number | null>(null)
  const showDelayTimerRef = React.useRef<number | null>(null)
  const [showLoadingUI, setShowLoadingUI] = React.useState<boolean>(false)
  const activeLoadIdRef = React.useRef<number>(0)
  const sessionActiveRef = React.useRef<boolean>(false)

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

  const handleStop = () => {
    const view = webviewRef.current
    view?.stop()
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
    const startTicker = (loadId: number) => {
      if (loadingTickerRef.current !== null) window.clearInterval(loadingTickerRef.current)
      loadingTickerRef.current = window.setInterval(() => {
        // Guard against stale intervals from previous sessions
        if (activeLoadIdRef.current !== loadId) return
        setProgress((prev) => {
          const target = 0.85
          const next = prev + (target - prev) * 0.06
          return Math.min(next, target - 0.001)
        })
      }, 100)
    }
    const stopTicker = () => {
      if (loadingTickerRef.current !== null) {
        window.clearInterval(loadingTickerRef.current)
        loadingTickerRef.current = null
      }
    }
    const handleStartLoading = () => {
      // If a stop was pending (redirect), cancel it and continue the same session
      if (pendingStopTimerRef.current !== null) {
        window.clearTimeout(pendingStopTimerRef.current)
        pendingStopTimerRef.current = null
      }
      if (!sessionActiveRef.current) {
        // New top-level session
        sessionActiveRef.current = true
        activeLoadIdRef.current += 1
        const loadId = activeLoadIdRef.current
        setProgress(0.15)
        // Show delay to avoid flashing on ultra-fast loads
        if (showDelayTimerRef.current) window.clearTimeout(showDelayTimerRef.current)
        setShowLoadingUI(false)
        showDelayTimerRef.current = window.setTimeout(() => {
          if (activeLoadIdRef.current === loadId) setShowLoadingUI(true)
        }, 150)
        startTicker(loadId)
      } else {
        // Already in a session (redirect) — keep progress, ensure ticker running
        if (loadingTickerRef.current === null) startTicker(activeLoadIdRef.current)
      }
    }
    const handleStopLoading = () => {
      // Debounce stop so a redirect that immediately restarts doesn't end the session
      if (pendingStopTimerRef.current !== null) {
        window.clearTimeout(pendingStopTimerRef.current)
      }
      pendingStopTimerRef.current = window.setTimeout(() => {
        stopTicker()
        setProgress(1)
        // Allow the bar to finish animating before hiding
        setTimeout(() => {
          sessionActiveRef.current = false
          setShowLoadingUI(false)
        }, 150)
        pendingStopTimerRef.current = null
      }, 200)
    }
    const handleFailLoad = (e: any) => {
      // Ignore aborted loads (-3) which frequently occur during redirects
      if (e && typeof e.errorCode === 'number' && e.errorCode === -3) return
      stopTicker()
      setProgress(1)
      setTimeout(() => {
        sessionActiveRef.current = false
        setShowLoadingUI(false)
      }, 100)
    }
    const handleDomReady = () => setProgress((p) => (p < 0.9 ? 0.9 : p))
    view.addEventListener('did-navigate', syncUrl)
    view.addEventListener('did-navigate-in-page', syncUrl)
    view.addEventListener('page-title-updated', syncTitle)
    const handleDidStartNavigation = (e: any) => {
      if (e && e.isMainFrame) handleStartLoading()
    }
    view.addEventListener('did-start-navigation', handleDidStartNavigation)
    view.addEventListener('did-stop-loading', handleStopLoading)
    view.addEventListener('did-fail-load', handleFailLoad)
    view.addEventListener('dom-ready', handleDomReady)
    return () => {
      view.removeEventListener('did-navigate', syncUrl)
      view.removeEventListener('did-navigate-in-page', syncUrl)
      view.removeEventListener('page-title-updated', syncTitle)
      view.removeEventListener('did-start-navigation', handleDidStartNavigation)
      view.removeEventListener('did-stop-loading', handleStopLoading)
      view.removeEventListener('did-fail-load', handleFailLoad)
      view.removeEventListener('dom-ready', handleDomReady)
      stopTicker()
      if (pendingStopTimerRef.current !== null) {
        window.clearTimeout(pendingStopTimerRef.current)
        pendingStopTimerRef.current = null
      }
      if (showDelayTimerRef.current !== null) {
        window.clearTimeout(showDelayTimerRef.current)
        showDelayTimerRef.current = null
      }
    }
  }, [tabId, updateTab])

  return (
    <div className="flex flex-col w-full h-full">
      <BrowserTopBar
        url={url}
        onBack={handleBack}
        onForward={handleForward}
        onReload={handleReload}
        onStop={handleStop}
        isLoading={showLoadingUI}
        progress={progress}
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


