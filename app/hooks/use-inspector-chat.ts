import React from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

import type { InspectorUIMessage } from '@/app/ai/types'

export type UseInspectorChatOptions = {
  workspacePath: string
  workspaceId?: string
}

export function useInspectorChat({ workspacePath }: UseInspectorChatOptions) {
  if (!workspacePath) {
    throw new Error('useInspectorChat requires a workspacePath')
  }

  // create custom API URL for our agent running in the workspace
  const api = React.useMemo(() => {
    const query = new URLSearchParams({ cwd: workspacePath })
    return `ai://chat?${query.toString()}`
  }, [workspacePath])

  const transport = React.useMemo(
    () => new DefaultChatTransport<InspectorUIMessage>({ api }),
    [api],
  )

  const chatId = workspacePath

  const chat = useChat<InspectorUIMessage>({
    id: chatId,
    transport,
    experimental_throttle: 16,
    onError: (error) => {
      console.error('[useInspectorChat] stream error', error)
    },
  })

  const { messages, status, sendMessage, error, stop, clearError } = chat

  const isStreaming = status === 'submitted' || status === 'streaming'

  return {
    messages: messages as InspectorUIMessage[],
    status,
    sendMessage,
    stop,
    clearError,
    error,
    isStreaming,
  }
}


