import React from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface ModelSelectorProps {
  value: string
  onChange?: (model: string) => void
  models?: string[]
  disabled?: boolean
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange, models = ['gpt-5', 'gpt-4.1', 'gpt-4o-mini'], disabled }) => {
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
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-1.5 py-1 text-xs text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-neutral-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{value}</span>
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <div role="menu" className="absolute z-50 bottom-full left-0 mb-1 w-40 rounded-md border border-[#ECEDED] bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {models.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { onChange?.(m); setOpen(false) }}
              className="flex w-full items-center justify-between gap-2 rounded-[6px] px-2 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>{m}</span>
              {m === value && <Check className="size-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
