import React from 'react'
import { ToolItem } from '@/app/components/ui/chat/agent/tools/types';

// Generic/unknown tool rendering
export const GenericView: React.FC<{ item: ToolItem; payload: any }> = ({ item, payload }) => {
    const active = item.status === 'started'
    
    return (
      <div className="mb-3 rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
        <div className="flex items-center justify-between">
          <span>raw item: {JSON.stringify(item, null, 2)}</span>
          <span
            className="font-medium text-neutral-700 dark:text-neutral-200"
            style={
              active
                ? {
                    background: 'linear-gradient(90deg, #27272a 0%, #27272a 25%, #a1a1aa 50%, #27272a 75%, #27272a 100%)',
                    backgroundSize: '300% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 2s linear infinite',
                  }
                : undefined
            }
          >
            {item.label}
          </span>
          <span className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            {item.status}
          </span>
        </div>
        {payload !== undefined && (
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-neutral-100 p-2 text-[0.75rem] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            {JSON.stringify(payload, null, 2)}
          </pre>
        )}
      </div>
    )
  }