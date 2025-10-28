import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface AddressBarProps {
  url: string
  isLoading?: boolean
  progress?: number
  onSubmit?: (value: string) => void
  onChange?: (value: string) => void
}

export default function AddressBar({ url, isLoading = false, progress = 0, onSubmit, onChange }: AddressBarProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [value, setValue] = React.useState<string>(url)

  // Keep local value in sync when external url changes and we're not editing
  React.useEffect(() => {
    if (!isEditing) setValue(url)
  }, [url, isEditing])

  const segments = React.useMemo(() => {
    const parse = (input: string) => {
      try {
        const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(input)
        const parsed = hasScheme ? new URL(input) : new URL(`http://${input}`)
        const scheme = hasScheme ? `${parsed.protocol}//` : ''
        const host = parsed.hostname ?? ''
        const port = parsed.port ? `:${parsed.port}` : ''
        const path = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : ''
        const query = parsed.search ?? ''
        const hash = parsed.hash ?? ''
        return { scheme, host, port, path, query, hash }
      } catch {
        return { scheme: '', host: input, port: '', path: '', query: '', hash: '' }
      }
    }
    return parse(url)
  }, [url])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setValue(next)
    onChange?.(next)
  }

  const handleSubmit = () => {
    onSubmit?.(value.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setValue(url)
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div className="relative w-full h-7 flex items-center rounded-md bg-[var(--window-c-surface-elevated)] hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors overflow-hidden">
      {!isEditing && (
        <div className="absolute inset-0 flex items-center px-3 select-none pointer-events-none text-sm">
          {segments.scheme && (
            <span className="text-neutral-400">{segments.scheme}</span>
          )}
          {segments.host && (
            <span className="text-neutral-800 dark:text-neutral-100">{segments.host}</span>
          )}
          {segments.port && (
            <span className="text-neutral-400">{segments.port}</span>
          )}
          {(segments.path || segments.query || segments.hash) && (
            <span className="text-neutral-400">{`${segments.path}${segments.query}${segments.hash}`}</span>
          )}
        </div>
      )}
      <input
        aria-label="Address bar"
        className={`absolute inset-0 w-full h-full bg-transparent outline-none px-3 text-sm caret-neutral-800 dark:caret-neutral-100 placeholder-neutral-400 ${
          isEditing ? 'text-neutral-800 dark:text-neutral-100' : 'text-transparent'
        }`}
        value={isEditing ? value : url}
        onChange={handleChange}
        onFocus={() => setIsEditing(true)}
        onBlur={() => {
          setIsEditing(false)
          setValue(url)
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a URL"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="none"
      />

      {/* Loading visuals */}
      <AnimatePresence initial={false} mode="wait">
        {isLoading && !isEditing && (
          <motion.div
            key="loading"
            className="pointer-events-none absolute inset-x-0 bottom-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Fading gradient from the progress line upward that grows leftwards */}
            <motion.div
              className="absolute left-0 bottom-0 h-5"
              style={{
                background:
                  'linear-gradient(to top, rgba(37, 99, 235, 0.35), rgba(37, 99, 235, 0.0))',
                WebkitMaskImage:
                  'linear-gradient(90deg, rgba(0,0,0,1) 0, rgba(0,0,0,1) calc(100% - 18px), rgba(0,0,0,0) 100%)',
                maskImage:
                  'linear-gradient(90deg, rgba(0,0,0,1) 0, rgba(0,0,0,1) calc(100% - 18px), rgba(0,0,0,0) 100%)'
              }}
              initial={false}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ type: 'tween', ease: 'linear', duration: 0.15 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


