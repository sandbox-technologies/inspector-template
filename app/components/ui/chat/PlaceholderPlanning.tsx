import React from 'react'

export const PlaceholderPlanning: React.FC = () => {
  return (
    <div className="py-2">
      <details
        className="group dark:border-neutral-800 border border-transparent bg-transparent open:bg-transparent dark:bg-transparent open:dark:bg-transparent focus-within:bg-transparent focus:bg-transparent hover:bg-transparent active:bg-transparent"
        style={{ backgroundColor: 'transparent' }}
        open
      >
        <summary
          className="cursor-pointer list-none flex items-center justify-between text-xs text-neutral-600 bg-transparent hover:bg-transparent focus:outline-none focus-visible:outline-none focus:bg-transparent focus-visible:bg-transparent active:bg-transparent group-open:bg-transparent"
          style={{ backgroundColor: 'transparent' }}
        >
          <span
            className="font-medium"
            style={{
              background: 'linear-gradient(90deg, #27272a 0%, #27272a 25%, #a1a1aa 50%, #27272a 75%, #27272a 100%)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 2s linear infinite',
            }}
          >
            Planning
          </span>
        </summary>
      </details>
    </div>
  )
}

