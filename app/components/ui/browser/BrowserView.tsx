import React from 'react'
import BrowserTopBar from './BrowserTopBar'

interface BrowserViewProps {
  initialUrl?: string
  heightClassName?: string
}

export default function BrowserView({ initialUrl = 'http://localhost:3000', heightClassName = 'h-full' }: BrowserViewProps) {
  const [url, setUrl] = React.useState<string>(initialUrl)
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null)

  const handleBack = () => {
    // Best-effort back: delegate to iframe if same-origin; otherwise ignore
    try {
      iframeRef.current?.contentWindow?.history.back()
    } catch {
      // Ignore cross-origin errors
    }
  }

  const handleForward = () => {
    try {
      iframeRef.current?.contentWindow?.history.forward()
    } catch {
      // Ignore cross-origin errors
    }
  }

  const handleReload = () => {
    if (iframeRef.current) {
      // Force reload by resetting src
      const currentSrc = iframeRef.current.src
      iframeRef.current.src = currentSrc
    }
  }

  const handleSubmit = (value: string) => {
    const next = value.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//) ? value : `http://${value}`
    setUrl(next)
  }

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
        <iframe
          ref={iframeRef}
          src={url}
          title="Browser View"
          className="w-full h-full bg-white dark:bg-neutral-900"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  )
}


