import React from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react'
import AddressBar from './AddressBar'
import Tooltip from '../../ui/tooltip'

interface BrowserTopBarProps {
  url?: string
  onBack?: () => void
  onForward?: () => void
  onReload?: () => void
  onStop?: () => void
  isLoading?: boolean
  progress?: number
  onSubmit?: (value: string) => void
  onChange?: (value: string) => void
}

export default function BrowserTopBar({ url = 'http://localhost:3000', onBack, onForward, onReload, onStop, isLoading = false, progress = 0, onSubmit, onChange }: BrowserTopBarProps) {
  return (
    <div className="w-full border-b py-1" style={{ borderColor: 'var(--window-c-separator)' }}>
      <div className="flex items-center gap-1 pl-1">

        {/* Nav buttons */}
        <Tooltip title="Click to go back" description="Hold to view history" shortcut="⌘ [">
          <button className="size-8 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/70" onClick={onBack} aria-label="Back">
            <ChevronLeft className="size-5" />
          </button>
        </Tooltip>
        <button className="size-8 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/70" onClick={onForward} aria-label="Forward">
          <ChevronRight className="size-5" />
        </button>
        {isLoading ? (
          <button className="size-8 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/70" onClick={onStop} aria-label="Stop">
            <X className="size-4" />
          </button>
        ) : (
          <button className="size-8 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/70" onClick={onReload} aria-label="Reload">
            <RotateCcw className="size-4" />
          </button>
        )}

        {/* Address bar */}
        <div className="flex-1 min-w-0">
          <AddressBar url={url ?? ''} isLoading={isLoading} progress={progress} onSubmit={onSubmit} onChange={onChange} />
        </div>
      </div>
    </div>
  )
}
