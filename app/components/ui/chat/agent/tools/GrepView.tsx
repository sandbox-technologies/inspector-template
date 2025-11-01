import React from 'react'
import { ToolItem } from '@/app/components/ui/chat/agent/tools/types';
import { getDirectoryPath, getFileName } from '@/app/components/ui/chat/agent/tools/helpers'
import { getLanguageIconData } from '@/app/utils/languageIcon'


export const GrepView: React.FC<{ item: ToolItem; payload: any }> = ({ item, payload }) => {
    const active = item.status === 'started'
    const args = payload?.args
    const result = payload?.result
    const success = result?.success
    const error = result?.error
    
    const pattern = args?.pattern ?? ''
    const path = args?.path ?? ''
    const flags: string[] = []
    if (args?.caseInsensitive) flags.push('i')
    if (args?.multiline) flags.push('m')
    
    const matches = React.useMemo(() => {
      if (!success?.workspaceResults) return []
      const aggregated: Array<{ file: string; matchCount: number }> = []
      for (const workspace of Object.keys(success.workspaceResults)) {
        const content = success.workspaceResults[workspace]
        if (content?.content?.matches) {
          for (const match of content.content.matches) {
            const matchCount = (match.matches ?? []).filter((line: any) => !line.isContextLine).length
            aggregated.push({ file: match.file, matchCount })
          }
        } else if (content?.files?.files) {
          for (const file of content.files.files) {
            aggregated.push({ file, matchCount: 0 })
          }
        }
      }
      return aggregated
    }, [success])
    
    const title = active ? 'Grepping' : 'Grepped'
    
    return (
      <div>
        {active ? (
          <header className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
            <span
              className="font-medium"
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
              {title}
            </span>
            {pattern && (
              <>
                {' '}
                <span className="font-mono">{pattern}</span>
              </>
            )}
            {path && (
              <>
                {' '}
                <span className="text-neutral-500 dark:text-neutral-500">{path}</span>
              </>
            )}
            {flags.length > 0 && (
              <>
                {' '}
                <span className="text-neutral-500 dark:text-neutral-500">[{flags.join('')}]</span>
              </>
            )}
          </header>
        ) : (
          <>
            {error ? (
              <header className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">Grep failed</span>
                {pattern && (
                  <>
                    {' '}
                    <span className="font-mono">{pattern}</span>
                  </>
                )}
              </header>
            ) : matches.length === 0 ? (
              <header className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">{title}</span>
                {pattern && (
                  <>
                    {' '}
                    <span className="font-mono">{pattern}</span>
                  </>
                )}
              </header>
            ) : (
              <details
                className="group dark:border-neutral-800 border border-transparent bg-transparent open:bg-transparent dark:bg-transparent open:dark:bg-transparent focus-within:bg-transparent focus:bg-transparent hover:bg-transparent active:bg-transparent"
                style={{ backgroundColor: 'transparent' }}
              >
                <summary
                  className="cursor-pointer list-none bg-transparent hover:bg-transparent focus:outline-none focus-visible:outline-none focus:bg-transparent focus-visible:bg-transparent active:bg-transparent group-open:bg-transparent"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <header className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                    <span>
                      <span className="font-medium">{title}</span>
                      {pattern && (
                        <>
                          {' '}
                          <span className="font-mono">{pattern}</span>
                        </>
                      )}
                    </span>
                  </header>
                </summary>
                <div className="mt-2 space-y-1">
                  {matches.map((match, idx) => {
                    const fileName = getFileName(match.file)
                    const dirPath = getDirectoryPath(match.file)
                    const iconData = getLanguageIconData(match.file)
                    const IconComponent = iconData.component
                    
                    return (
                      <div
                        key={`${match.file}-${idx}`}
                        className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`flex-shrink-0 ${iconData.colorClass}`}>
                            {IconComponent ? (
                              <IconComponent size="1em" className="inline-block" />
                            ) : (
                              iconData.fallback
                            )}
                          </span>
                          <span className="truncate">{fileName}</span>
                          {dirPath && (
                            <span className="text-neutral-500 dark:text-neutral-500 truncate">{dirPath}</span>
                          )}
                        </div>
                        {match.matchCount > 0 && (
                          <span className="ml-2 flex-shrink-0 rounded bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 dark:text-neutral-200">
                            {match.matchCount}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </details>
            )}
          </>
        )}
      </div>
    )
  }
  