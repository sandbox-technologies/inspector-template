import React from 'react'

import type { InspectorDataParts } from '@/app/ai/types'
import { getLanguageIconData } from '@/app/utils/languageIcon'

type GrepResultsProps = {
  data: InspectorDataParts['grepResult']
  isActive?: boolean
}

type GrepMatch = {
  file: string
  lines: Array<{
    lineNumber: number
    content: string
    isContextLine?: boolean
  }>
}

const getDirectoryPath = (filePath: string): string | null => {
  const lastSlash = filePath.lastIndexOf('/')
  if (lastSlash === -1) return null
  return filePath.substring(0, lastSlash)
}

const getFileName = (filePath: string): string => {
  const lastSlash = filePath.lastIndexOf('/')
  return lastSlash === -1 ? filePath : filePath.substring(lastSlash + 1)
}

export const GrepResults: React.FC<GrepResultsProps> = ({ data, isActive }) => {
  const success = data?.result?.success
  const error = data?.result?.error
  const active = isActive ?? (!success && !error)

  const matches = React.useMemo(() => {
    if (!success?.workspaceResults) return []
    const aggregated: GrepMatch[] = []
    for (const workspace of Object.keys(success.workspaceResults)) {
      const content = success.workspaceResults[workspace]?.content
      for (const match of content?.matches ?? []) {
        aggregated.push({
          file: match.file,
          lines: (match.matches ?? []).map((line: any) => ({
            lineNumber: line.lineNumber,
            content: line.content,
            isContextLine: line.isContextLine,
          })),
        })
      }
    }
    return aggregated
  }, [success])

  const flags: string[] = []
  if (data?.args?.caseInsensitive) flags.push('i')
  if (data?.args?.multiline) flags.push('m')

  const pattern = data?.args?.pattern ?? ''
  const path = data?.args?.path ?? ''

  const title = active ? 'Grepping' : 'Grepped'

  return (
    <div className="">
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
              <span className="font-mono">
                {pattern}
              </span>
            </>
          )}
          {path && (
            <>
              {' '}
              <span className="text-neutral-500 dark:text-neutral-500">
                {path}
              </span>
            </>
          )}
          {flags.length > 0 && (
            <>
              {' '}
              <span className="text-neutral-500 dark:text-neutral-500">
                [{flags.join('')}]
              </span>
            </>
          )}
        </header>
      ) : (
        <>
          {error ? (
            <div className="rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-300">
              {error.message || 'Search failed.'}
            </div>
          ) : matches.length === 0 ? (
            <header className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
              <span className="font-medium">{title}</span>
              {pattern && (
                <>
                  {' '}
                  <span className="font-mono">
                    {pattern}
                  </span>
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
                        <span className="font-mono">
                          {pattern}
                        </span>
                      </>
                    )}
                  </span>
                </header>
              </summary>
              <div className="mt-2 space-y-1">
                {matches.map((match, idx) => {
                  const fileName = getFileName(match.file)
                  const dirPath = getDirectoryPath(match.file)
                  const matchCount = match.lines.filter((line) => !line.isContextLine).length
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
                      <span className="ml-2 flex-shrink-0 rounded bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 dark:text-neutral-200">
                        {matchCount}
                      </span>
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


