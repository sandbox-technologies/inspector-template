import React from 'react'
import { ToolItem } from '@/app/components/ui/chat/agent/tools/types';
import { getLanguageIconData } from '@/app/utils/languageIcon'
import { getFileName } from '@/app/components/ui/chat/agent/tools/helpers'

// Read-specific rendering
export const ReadView: React.FC<{ item: ToolItem; payload: any }> = ({ item, payload }) => {
    const active = item.status === 'started'
    const success = payload?.result?.success
    const path = success?.path ?? payload?.args?.path ?? ''
    const range = success?.readRange
    const meta = success?.meta ?? { isEmpty: !success?.content, exceededLimit: false, totalLines: success?.totalLines }
    const hasContent = Boolean(success?.content)
    
    const fileName = React.useMemo(() => getFileName(path), [path])
    const iconData = React.useMemo(() => getLanguageIconData(path), [path])
    const IconComponent = iconData.component
    
    if (!hasContent && !active) return null
    
    return (
      <div className="mb-3 rounded-lg border border-neutral-200 bg-white/70 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/70">
        <header className="flex items-center text-xs text-neutral-600 dark:text-neutral-300">
          <span className={`flex items-center gap-2 ${iconData.colorClass}`}>
            {IconComponent ? (
              <IconComponent size="1em" className="inline-block" />
            ) : (
              iconData.fallback
            )}
            <span
              className="text-sm font-medium"
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
              {active ? 'Reading' : 'Read'}
            </span>
            <span className="font-mono text-sm text-neutral-800 dark:text-neutral-100">{fileName}</span>
            {range && (
              <span className="text-neutral-500 dark:text-neutral-400">lines {range.startLine}–{range.endLine}</span>
            )}
            {meta && !active && (
              <span className="text-neutral-500 dark:text-neutral-400">
                {meta.totalLines ? `${meta.totalLines} lines` : ''}
                {meta.exceededLimit ? ' (truncated)' : ''}
              </span>
            )}
          </span>
        </header>
      </div>
    )
  }