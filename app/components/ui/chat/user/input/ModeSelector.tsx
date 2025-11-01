import React from 'react'
import { Infinity as InfinityIcon, GitBranch, MessageSquare, ChevronDown, Check } from 'lucide-react'
import Tooltip from '../../../tooltip'

interface ModeSelectorProps {
  value: string
  onChange?: (mode: string) => void
  modes?: string[]
  disabled?: boolean
  hideText?: boolean
}

const pickModeIcon = (m: string) => {
  switch (m) {
    case 'Agent':
      return <InfinityIcon className="size-3.5" />
    case 'Plan':
      return <GitBranch className="size-3.5" />
    case 'Ask':
      return <MessageSquare className="size-3.5" />
    default:
      return <InfinityIcon className="size-3.5" />
  }
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ value, onChange, modes = ['Agent', 'Plan', 'Ask'], disabled, hideText = false }) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <Tooltip title="Rotate mode" shortcut="⇧ Tab" placement="top">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-full border border-[#ECEDED] bg-neutral-100 ${hideText ? 'px-1.5' : 'px-2.5'} py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700/60 dark:text-neutral-100`}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {pickModeIcon(value)}
          {!hideText && <span>{value}</span>}
          <ChevronDown className="size-3" />
        </button>
      </Tooltip>
      {open && (
        <div role="menu" className="absolute z-50 bottom-full left-0 mb-1 w-44 rounded-md border border-[#ECEDED] bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { onChange?.(m); setOpen(false) }}
              className="flex w-full items-center justify-between gap-2 rounded-[6px] px-2 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              <span className="inline-flex items-center gap-2">{pickModeIcon(m)}{m}</span>
              {m === value && <Check className="size-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
