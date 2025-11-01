import React from 'react'
import { Settings, History, LogOut } from 'lucide-react'

import type { Tab } from './window/TabsContext'
import type { InspectorUIMessage } from '@/app/ai/types'
import { useInspectorChat } from '@/app/hooks/use-inspector-chat'

import { ChatInput } from './ui/chat/ChatInput'
import { SentMessage } from './ui/chat/SentMessage'
import { Button } from './ui/button'

import {
  buildAgentItems,
  collectAgentEvents,
  renderAgentItem,
} from './ui/chat/agentEventHelpers'
import { PlaceholderPlanning } from './ui/chat/PlaceholderPlanning'

export type ChatWindowController = Pick<
  ReturnType<typeof useInspectorChat>,
  'messages' | 'sendMessage' | 'stop' | 'isStreaming'
>

interface ChatWindowProps {
  tab: Tab
  controller?: ChatWindowController
  initialLastSentMessage?: string
}
export const ChatWindow: React.FC<ChatWindowProps> = ({ tab, controller, initialLastSentMessage }) => {
  const workspacePath = tab.git?.worktreePath
  const [inputValue, setInputValue] = React.useState('')
  const [lastSentMessage, setLastSentMessage] = React.useState<string | null>(
    initialLastSentMessage ?? null,
  )
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (typeof initialLastSentMessage === 'string') {
      setLastSentMessage(initialLastSentMessage)
    }
  }, [initialLastSentMessage])

  if (!workspacePath && !controller) {
    return (
      <ChatWindowLoading
        inputValue={inputValue}
        setInputValue={setInputValue}
        lastSentMessage={lastSentMessage}
        messagesEndRef={messagesEndRef}
      />
    )
  }

  if (controller) {
    return (
      <ChatWindowContent
        tab={tab}
        chat={controller}
        inputValue={inputValue}
        setInputValue={setInputValue}
        lastSentMessage={lastSentMessage}
        setLastSentMessage={setLastSentMessage}
        messagesEndRef={messagesEndRef}
      />
    )
  }

  return (
    <ChatWindowWithWorkspace
      tab={tab}
      workspacePath={workspacePath!}
      inputValue={inputValue}
      setInputValue={setInputValue}
      lastSentMessage={lastSentMessage}
      setLastSentMessage={setLastSentMessage}
      messagesEndRef={messagesEndRef}
    />
  )
}

type ChatWindowWithWorkspaceProps = {
  tab: Tab
  workspacePath: string
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  lastSentMessage: string | null
  setLastSentMessage: React.Dispatch<React.SetStateAction<string | null>>
  messagesEndRef: React.MutableRefObject<HTMLDivElement | null>
}

const ChatWindowWithWorkspace: React.FC<ChatWindowWithWorkspaceProps> = ({
  tab,
  workspacePath,
  inputValue,
  setInputValue,
  lastSentMessage,
  setLastSentMessage,
  messagesEndRef,
}) => {
  const chatBindings = useInspectorChat({ workspacePath })

  return (
    <ChatWindowContent
      tab={tab}
      chat={chatBindings}
      inputValue={inputValue}
      setInputValue={setInputValue}
      lastSentMessage={lastSentMessage}
      setLastSentMessage={setLastSentMessage}
      messagesEndRef={messagesEndRef}
    />
  )
}

type ChatWindowContentProps = {
  tab: Tab
  chat: ChatWindowController
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  lastSentMessage: string | null
  setLastSentMessage: React.Dispatch<React.SetStateAction<string | null>>
  messagesEndRef: React.MutableRefObject<HTMLDivElement | null>
}

const ChatWindowContent: React.FC<ChatWindowContentProps> = ({
  tab,
  chat,
  inputValue,
  setInputValue,
  lastSentMessage,
  setLastSentMessage,
  messagesEndRef,
}) => {
  const { messages, sendMessage, stop, isStreaming } = chat

  // Track when we're waiting for the first payload after sending a message
  const [waitingForFirstPayload, setWaitingForFirstPayload] = React.useState(false)
  const [lastPayloadTime, setLastPayloadTime] = React.useState<number | null>(null)
  const [showPlaceholder, setShowPlaceholder] = React.useState(false)
  const previousEventCountRef = React.useRef(0)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messagesEndRef])

  // Track when we receive payloads
  React.useEffect(() => {
    const agentEvents = collectAgentEvents(messages as InspectorUIMessage[])
    const currentEventCount = agentEvents.length
    
    // If we have new events, update the last payload time
    if (currentEventCount > previousEventCountRef.current) {
      setWaitingForFirstPayload(false)
      setLastPayloadTime(Date.now())
      previousEventCountRef.current = currentEventCount
    }
  }, [messages])

  // Check if we should show placeholder due to delay > 1.0s
  React.useEffect(() => {
    if (!isStreaming) {
      setShowPlaceholder(false)
      setWaitingForFirstPayload(false)
      return undefined
    }

    // Show placeholder if waiting for first payload
    if (waitingForFirstPayload) {
      setShowPlaceholder(true)
      return undefined
    }

    // Show placeholder if more than 1.0s has passed since last payload
    if (lastPayloadTime !== null) {
      const timeSinceLastPayload = Date.now() - lastPayloadTime
      if (timeSinceLastPayload > 1000) {
        setShowPlaceholder(true)
        return undefined
      } else {
        setShowPlaceholder(false)
        // Set up a timer to check again after the delay
        const remainingTime = 1000 - timeSinceLastPayload
        const timer = setTimeout(() => {
          setShowPlaceholder(true)
        }, remainingTime)
        return () => clearTimeout(timer)
      }
    }

    return undefined
  }, [isStreaming, waitingForFirstPayload, lastPayloadTime])

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return
    if (!tab.workspaceId) return
    const userMessage = inputValue.trim()
    setLastSentMessage(userMessage)
    setInputValue('')
    setWaitingForFirstPayload(true)
    setLastPayloadTime(null)
    previousEventCountRef.current = collectAgentEvents(messages as InspectorUIMessage[]).length
    await sendMessage({ text: userMessage })
  }

  const agentEvents = React.useMemo(
    () => collectAgentEvents(messages as InspectorUIMessage[]),
    [messages],
  )

  const agentItems = React.useMemo(() => buildAgentItems(agentEvents), [agentEvents])

  const messagesContent = (
    <>
      {agentItems.map(item => (
        <div key={item.key}>{renderAgentItem(item)}</div>
      ))}
      {showPlaceholder && <PlaceholderPlanning />}
      <div ref={messagesEndRef} />
    </>
  )

  return (
    <ChatWindowLayout
      lastSentMessage={lastSentMessage}
      messagesContent={messagesContent}
      inputProps={{
        value: inputValue,
        onChange: setInputValue,
        onSend: handleSend,
        onStop: stop,
        isStreaming,
        disabled: isStreaming,
        sendDisabled: isStreaming,
      }}
    />
  )
}

type ChatWindowLoadingProps = {
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  lastSentMessage: string | null
  messagesEndRef: React.MutableRefObject<HTMLDivElement | null>
}

const ChatWindowLoading: React.FC<ChatWindowLoadingProps> = ({
  inputValue,
  setInputValue,
  lastSentMessage,
  messagesEndRef,
}) => (
  <ChatWindowLayout
    lastSentMessage={lastSentMessage}
    messagesContent={<div ref={messagesEndRef} />}
    inputProps={{
      value: inputValue,
      onChange: setInputValue,
      sendDisabled: true,
    }}
  />
)

type ChatWindowLayoutProps = {
  lastSentMessage: string | null
  messagesContent: React.ReactNode
  inputProps: React.ComponentProps<typeof ChatInput>
}

const ChatWindowLayout: React.FC<ChatWindowLayoutProps> = ({
  lastSentMessage,
  messagesContent,
  inputProps,
}) => (
  <div className="flex h-full w-full flex-col bg-neutral-50 dark:bg-neutral-900 rounded-2xl overflow-hidden relative">
    {/* Header with icons only */}
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/50">
            <LogOut className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/50">
            <History className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/50">
            <Settings className="size-4" />
          </Button>
        </div>
      </div>
    </div>

    {/* Last sent message pinned at the top */}
    {lastSentMessage && (
      <div className="px-4">
        <SentMessage text={lastSentMessage} />
      </div>
    )}

    {/* Chat Messages Area */}
    <div className="flex-1 overflow-y-auto p-4">
      {messagesContent}
    </div>

    <ChatInput {...inputProps} />
  </div>
)
