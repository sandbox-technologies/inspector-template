import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import type { InspectorDataParts } from '@/app/ai/types'

type AssistantTextProps = {
  data: InspectorDataParts['agentText']
}

export const AssistantText: React.FC<AssistantTextProps> = ({ data }) => {
  const incomingText = data?.text ?? ''
  const segmentId = data?.segmentId ?? data?.runId ?? 'default'

  const [displayText, setDisplayText] = React.useState(incomingText)
  const lastSegmentIdRef = React.useRef<string | undefined>(segmentId)

  React.useEffect(() => {
    if (!data) return

    if (segmentId !== lastSegmentIdRef.current) {
      lastSegmentIdRef.current = segmentId
      setDisplayText(incomingText)
      return
    }

    setDisplayText(prev => mergeStreamingText(prev, incomingText))
  }, [incomingText, segmentId, data])

  if (!displayText) return null
  return (
    <div className="mb-3 text-neutral-900 dark:text-neutral-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ node, children, ...props }: any) {
            const firstChild = node?.children?.[0]
            if (firstChild && firstChild.tagName === 'code') {
              return <>{children}</>
            }
            return <p {...props}>{children}</p>
          },
          code(props: any) {
            const { className, children, ...rest } = props || {}
            const baseClassName = 'rounded bg-neutral-100/60 dark:bg-neutral-800/60 text-[0.9em] font-mono'
            const combinedClassName = [className, baseClassName].filter(Boolean).join(' ')
            return (
              <code className={combinedClassName} {...rest}>
                {children}
              </code>
            )
          }
        }}
      >
        {displayText}
      </ReactMarkdown>
    </div>
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


