import * as React from 'react'
import { createPortal } from 'react-dom'

// Track global tooltip state to allow instant switching between tooltips
let openTooltipsCount = 0
let lastTooltipCloseAt = 0
const RECENT_CLOSE_MS = 300 // small grace window to allow quick switching
const HOVER_OPEN_DELAY_MS = 500

type TooltipProps = {
  /** Primary title text shown in bold (e.g., "Click to go back") */
  title: string
  /** Small description line under title (e.g., "Hold to view history") */
  description?: string
  /** Shortcut label shown inside keycap (e.g., "⌘ [") */
  shortcut?: string
  /** Content that triggers the tooltip on hover/focus */
  children: React.ReactNode
  /** Optional placement; only supports top for now but kept for extensibility */
  placement?: 'top'
  /** If true, the trigger element will span full available width */
  fullWidth?: boolean
}

export function Tooltip({ title, description, shortcut, children, fullWidth }: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null)
  const delayRef = React.useRef<number | null>(null)
  const wasOpenRef = React.useRef(false)

  function isCommandKey(part: string) {
    const lower = part.toLowerCase()
    return part === '⌘' || lower === 'cmd' || lower === 'command'
  }

  React.useLayoutEffect(() => {
    function updatePosition() {
      if (!triggerRef.current) return
      const r = triggerRef.current.getBoundingClientRect()
      setCoords({ top: r.bottom + 8, left: r.left })
    }
    if (open) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
      }
    }
    return
  }, [open])

  function beginOpenDelay() {
    if (delayRef.current) window.clearTimeout(delayRef.current)
    // If another tooltip is open (or one just closed), open immediately
    if (openTooltipsCount > 0 || (Date.now() - lastTooltipCloseAt) < RECENT_CLOSE_MS) {
      setOpen(true)
      return
    }
    delayRef.current = window.setTimeout(() => setOpen(true), HOVER_OPEN_DELAY_MS)
  }

  function cancelOpenDelayAndClose() {
    if (delayRef.current) window.clearTimeout(delayRef.current)
    delayRef.current = null
    setOpen(false)
  }

  React.useEffect(() => () => {
    if (delayRef.current) window.clearTimeout(delayRef.current)
  }, [])

  // Maintain global open counter and last-close timestamp
  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      openTooltipsCount += 1
      wasOpenRef.current = true
    } else if (!open && wasOpenRef.current) {
      openTooltipsCount = Math.max(0, openTooltipsCount - 1)
      wasOpenRef.current = false
      lastTooltipCloseAt = Date.now()
    }
    return () => {
      if (wasOpenRef.current) {
        openTooltipsCount = Math.max(0, openTooltipsCount - 1)
        wasOpenRef.current = false
        lastTooltipCloseAt = Date.now()
      }
    }
  }, [open])

  return (
    <div className="tooltip-root" onMouseEnter={beginOpenDelay} onMouseLeave={cancelOpenDelayAndClose} onFocus={beginOpenDelay} onBlur={cancelOpenDelayAndClose} style={fullWidth ? { display: 'block', width: '100%' } : undefined}>
      <div ref={triggerRef} className={fullWidth ? undefined : 'inline-flex'} style={fullWidth ? { display: 'block', width: '100%' } : undefined}>
        {children}
      </div>
      {open && coords && createPortal(
        <div className="tooltip-content" role="tooltip" style={{ position: 'fixed', top: coords.top, left: coords.left }}>
          <div className="tooltip-title-row">
            <span className="tooltip-title">{title}</span>
            {shortcut ? (
              <span className="tooltip-shortcut">
                {shortcut
                  .split(/\s*\+\s*|\s+/)
                  .filter(Boolean)
                  .map((part, idx) => (
                    <kbd
                      className={`tooltip-keycap${isCommandKey(part) ? ' tooltip-keycap-command' : ''}`}
                      key={`${part}-${idx}`}
                    >
                      {part}
                    </kbd>
                  ))}
              </span>
            ) : null}
          </div>
          {description ? <div className="tooltip-description">{description}</div> : null}
        </div>,
        document.body
      )}
    </div>
  )
}

export default Tooltip


