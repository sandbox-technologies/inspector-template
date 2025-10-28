import React from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import AddressBar from './AddressBar'

interface BrowserTopBarProps {
  url?: string
}

export default function BrowserTopBar({ url = 'http://localhost:3000' }: BrowserTopBarProps) {
  return (
    <div className="w-full border-b py-1" style={{ borderColor: 'var(--window-c-separator)' }}>
      <div className="flex items-center gap-1 pl-1">

        {/* Nav buttons */}
        <button className="size-8 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/70">
          <ChevronLeft className="size-5" />
        </button>
        <button className="size-8 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/70">
          <ChevronRight className="size-5" />
        </button>
        <button className="size-8 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/70">
          <RotateCcw className="size-4" />
        </button>

        {/* Address bar */}
        <div className="flex-1 min-w-0">
          <AddressBar url={url} />
        </div>
      </div>
    </div>
  )
}
