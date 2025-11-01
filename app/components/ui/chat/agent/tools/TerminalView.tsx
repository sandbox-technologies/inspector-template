import { ToolItem } from '@/app/components/ui/chat/agent/tools/types';
import { ExternalLink, Maximize2, Check, ChevronDown } from 'lucide-react'

export const TerminalView: React.FC<{ item: ToolItem; payload: any }> = ({ item, payload }) => {
    const active = item.status === 'started'
    const args = payload?.args ?? {}
    const result = payload?.result ?? {}
    const success = result?.success
    const error = result?.error
    const command: string = success?.command ?? args.command ?? (Array.isArray(args.simpleCommands) ? args.simpleCommands.join(' ') : '') ?? ''
    const exitCode = success?.exitCode ?? error?.exitCode
    const stdout: string = success?.stdout ?? error?.stdout ?? ''
    const stderr: string = success?.stderr ?? error?.stderr ?? ''
    const hasError = Boolean(error)
    const isSuccess = !hasError && exitCode === 0
  
    const headerTitle = active ? 'Running command' : 'Auto-Ran command'
    const output = stdout || stderr || ''
  
    return (
      <div className="mb-3 rounded-lg border border-neutral-300 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 text-sm overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
          <span className="text-xs text-neutral-700 dark:text-neutral-200 min-w-0 flex-1 mr-2">
            {headerTitle}
            {command && (
              <>
                : <span className="font-mono break-all">{command}</span>
              </>
            )}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" aria-label="Open in new window">
              <ExternalLink className="size-3.5" />
            </button>
            <button className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" aria-label="Maximize">
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </header>
  
        {/* Main Content Area */}
        <div className="px-3 py-4 bg-neutral-800 dark:bg-neutral-950 overflow-x-auto">
          {!active && command && (
            <div className="space-y-2 font-mono text-sm min-w-0">
              <div className="mb-3 break-words">
                <span className="text-[#fbbf24]">$</span>
                <span className="ml-2 text-white break-all">{command}</span>
              </div>
              {output && (
                <div className="space-y-1 text-neutral-300 break-words">
                  {output.split('\n').map((line, idx) => (
                    <div key={idx} className="font-mono break-all whitespace-pre-wrap">
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {active && (
            <div className="font-mono text-sm break-words">
              <div className="break-all">
                <span className="text-[#fbbf24]">$</span>
                <span className="ml-2 text-white break-all">{command}</span>
              </div>
            </div>
          )}
        </div>
  
        {/* Footer */}
        {!active && (
          <footer className="flex items-center justify-between border-t border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
            <button className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100">
              Run Everything
              <ChevronDown className="size-3" />
            </button>
            <div className="flex items-center gap-1.5 text-xs">
              {isSuccess ? (
                <>
                  <Check className="size-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Success</span>
                </>
              ) : (
                <>
                  <span className="text-red-600 dark:text-red-400">Failed</span>
                  {exitCode !== undefined && (
                    <span className="text-neutral-500 dark:text-neutral-400">exit {exitCode}</span>
                  )}
                </>
              )}
            </div>
          </footer>
        )}
      </div>
    )
}