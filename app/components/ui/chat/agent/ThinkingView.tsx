import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

import type { InspectorDataParts } from '@/app/ai/types'
import { formatDurationShort } from '@/app/utils/agentStreamHelpers'

type ThinkingStreamSnapshot = {
  text: string
  startedAtMs?: number
  lastDelta?: string
}

type ThinkingViewProps = {
  data?: InspectorDataParts['thinkingFinal']
  delta?: InspectorDataParts['thinking']
  text?: string
  isActive?: boolean
  startedAtMs?: number
  completedAtMs?: number
  durationLabel?: string
  runId?: string
  streamState?: ThinkingStreamSnapshot
}

export const ThinkingView: React.FC<ThinkingViewProps> = ({
  data,
  delta,
  text,
  isActive,
  startedAtMs,
  completedAtMs,
  durationLabel,
  runId,
  streamState,
}) => {
  const baseText = data?.text ?? text ?? ''
  const streamText = streamState?.text ?? ''
  const segmentId = data?.runId ?? delta?.runId ?? runId ?? 'default'

  const initialText = baseText || streamText || delta?.textDelta || ''

  const [displayText, setDisplayText] = React.useState(initialText)
  const lastSegmentIdRef = React.useRef<string | undefined>(segmentId)

  React.useEffect(() => {
    const sourceText = data?.text ?? streamState?.text ?? text ?? ''

    if (segmentId !== lastSegmentIdRef.current) {
      lastSegmentIdRef.current = segmentId
      setDisplayText(sourceText || delta?.textDelta || '')
      return
    }

    if (sourceText) {
      setDisplayText(prev => mergeStreamingText(prev, sourceText))
      return
    }

    if (delta?.textDelta) {
      setDisplayText(prev => mergeStreamingText(prev, prev + delta.textDelta))
    }
  }, [segmentId, data?.text, streamState?.text, text, delta?.textDelta])

  const resolvedText = displayText
  const resolvedStartedAt = data?.startedAtMs ?? streamState?.startedAtMs ?? delta?.startedAtMs ?? startedAtMs
  const resolvedCompletedAt = data?.completedAtMs ?? completedAtMs
  const resolvedDurationMs = data?.durationMs ?? (resolvedStartedAt && resolvedCompletedAt ? resolvedCompletedAt - resolvedStartedAt : undefined)
  const resolvedDurationLabel = durationLabel ?? (resolvedDurationMs !== undefined ? formatDurationShort(resolvedDurationMs) : undefined)
  const active = isActive ?? (!!streamState && !data)

  if (!resolvedText && !active) return null

  const title = !active && resolvedStartedAt && resolvedCompletedAt
    ? `Thought for ${resolvedDurationLabel ?? ''}`.trim()
    : 'Thinking'

  const markdownComponents: Components = {
    p({ node, children, ...props }: any) {
      const firstChild = node?.children?.[0]
      if (firstChild && firstChild.tagName === 'code') {
        return <>{children}</>
      }
      return <p {...props}>{children}</p>
    },
    // Using 'any' for compatibility with react-markdown typings across versions
    code(props: any) {
      const { inline, className, children, ...rest } = props || {}
      if (inline) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800" {...rest}>
            {children}
          </code>
        )
      }
      return (
        <pre className="rounded-md bg-neutral-100 dark:bg-neutral-900 p-3 overflow-x-auto text-xs">
          <code className={className} {...rest}>{children}</code>
        </pre>
      )
    }
  }

  return (
    <details
      className="group dark:border-neutral-800 border border-transparent bg-transparent open:bg-transparent dark:bg-transparent open:dark:bg-transparent focus-within:bg-transparent focus:bg-transparent hover:bg-transparent active:bg-transparent"
      style={{ backgroundColor: 'transparent' }}
    >
      <summary
        className="cursor-pointer list-none flex items-center justify-between text-xs text-neutral-600 bg-transparent hover:bg-transparent focus:outline-none focus-visible:outline-none focus:bg-transparent focus-visible:bg-transparent active:bg-transparent group-open:bg-transparent"
        style={{ backgroundColor: 'transparent' }}
      >
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
      </summary>
      <div className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {resolvedText}
        </ReactMarkdown>
      </div>
    </details>
  )
}


function mergeStreamingText(previousText: string, incomingText: string): string {
  if (!incomingText) {
    return previousText
  }
  if (!previousText) {
    return incomingText
  }
  if (incomingText === previousText) {
    return previousText
  }
  if (incomingText.startsWith(previousText)) {
    return incomingText
  }
  if (previousText.startsWith(incomingText)) {
    return previousText
  }
  return previousText + incomingText
}

