// Edit-specific rendering
import React from 'react'
import { ToolItem } from '@/app/components/ui/chat/agent/tools/types';
import { getFileName } from '@/app/components/ui/chat/agent/tools/helpers'
import { getLanguageIconData } from '@/app/utils/languageIcon'
import { languageFromPath } from '@/app/utils/agentStreamHelpers'
import { CodeBlock } from '@/app/components/ui/chat/agent/CodeBlock'

export const EditView: React.FC<{ item: ToolItem; payload: any }> = ({ item, payload }) => {
    const active = item.status === 'started'
    const success = payload?.result?.success
    const path = success?.path ?? payload?.args?.path ?? ''
    const diffContent = success?.diffString ?? success?.diff ?? ''
    const linesAdded = success?.linesAdded
    const linesRemoved = success?.linesRemoved
    const newFile = success?.newFile ?? (!success?.beforeFullFileContent && !!success?.afterFullFileContent)
    
    const diffLines = React.useMemo(() => (diffContent ? diffContent.split('\n') : []), [diffContent])
    const fileName = React.useMemo(() => getFileName(path), [path])
    const iconData = React.useMemo(() => getLanguageIconData(path), [path])
    const IconComponent = iconData.component
    const lang = languageFromPath(path) ?? 'diff'
    
    return (
      <div className="mb-3 rounded-lg border border-neutral-200 bg-white/70 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/70">
        <header className="mb-2 flex items-center text-xs text-neutral-600 dark:text-neutral-300">
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
              {active ? 'Editing' : 'Edited'}
            </span>
            <span className="font-mono text-sm text-neutral-800 dark:text-neutral-100">{fileName}</span>
            {!active && newFile && (
              <span className="rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-1 py-0.5">new</span>
            )}
            {!active && typeof linesAdded === 'number' && (
              <span className="font-medium text-green-600 dark:text-green-400">+{linesAdded}</span>
            )}
            {!active && typeof linesRemoved === 'number' && (
              <span className="font-medium text-red-600 dark:text-red-400">-{linesRemoved}</span>
            )}
          </span>
        </header>
        {active ? (
          <div className="space-y-2">
            <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800/60 animate-pulse" />
            <div className="h-3 w-full rounded bg-neutral-200 dark:bg-neutral-800/60 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800/60 animate-pulse" />
          </div>
        ) : diffContent ? (
          <CodeBlock
            code={diffContent}
            language={lang}
            customStyle={{ maxHeight: '18rem' }}
            getLineProps={(lineNumber, isDarkMode) => {
              const line = diffLines[lineNumber - 1] ?? ''
              if (!line) return {}
              const baseStyle = {
                display: 'block',
                borderRadius: '0.375rem',
                width: '100%',
                paddingLeft: '0.5rem',
                paddingRight: '0.5rem',
              }
              
              if (line.startsWith('+') && !line.startsWith('+++')) {
                return {
                  style: {
                    ...baseStyle,
                    backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.12)',
                    borderLeft: `3px solid ${isDarkMode ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
                  },
                }
              }
              
              if (line.startsWith('-') && !line.startsWith('---')) {
                return {
                  style: {
                    ...baseStyle,
                    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.12)',
                    borderLeft: `3px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                  },
                }
              }
              
              if (line.startsWith('@@')) {
                return {
                  style: {
                    ...baseStyle,
                    backgroundColor: isDarkMode ? 'rgba(30, 136, 229, 0.18)' : 'rgba(30, 136, 229, 0.12)',
                    borderLeft: `3px solid ${isDarkMode ? 'rgba(30, 136, 229, 0.5)' : 'rgba(30, 136, 229, 0.5)'}`,
                    fontWeight: 600,
                  },
                }
              }
              
              return { style: baseStyle }
            }}
          />
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">No diff provided.</p>
        )}
      </div>
    )
  }