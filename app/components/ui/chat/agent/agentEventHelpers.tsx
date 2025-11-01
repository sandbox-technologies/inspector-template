import React from 'react'

import type { InspectorSystemNoticeLevel, InspectorUIMessage } from '@/app/ai/types'
import { ThinkingView } from '@/app/components/ui/chat/agent/ThinkingView'
import { TextView } from '@/app/components/ui/chat/agent/TextView'
import { ToolEventView } from '@/app/components/ui/chat/agent/tools/ToolEventView'
import { ToolItem } from '@/app/components/ui/chat/agent/tools/types'
import { SystemNoticeView, type SystemItem } from '@/app/components/ui/chat/agent/SystemNoticeView'
import { ErrorEventView, type ErrorItem } from '@/app/components/ui/chat/agent/ErrorEventView'
import { LogEventView, type LogItem } from '@/app/components/ui/chat/agent/LogEventView'

import type { CursorAgentEvent } from '@/lib/ai/cursor-agent-types'
import {
  detectToolKey,
  normalizeAssistantText,
  reconcileText,
  resolveModelCallId,
  resolveRunId,
  toToolKind,
  TOOL_KIND_LABEL,
} from '@/lib/ai/cursor-agent-helpers'

type ThinkingItem = {
  kind: 'thinking'
  key: string
  runId: string
  text: string
  isComplete: boolean
  startedAtMs?: number
  completedAtMs?: number
}

type AssistantItem = {
  kind: 'assistant'
  key: string
  runId: string
  segmentId: string
  text: string
  isFinal: boolean
}

export type { ToolItem } from '@/app/components/ui/chat/agent/tools/types'
export type { SystemItem } from '@/app/components/ui/chat/agent/SystemNoticeView'
export type { ErrorItem } from '@/app/components/ui/chat/agent/ErrorEventView'
export type { LogItem } from '@/app/components/ui/chat/agent/LogEventView'

export type AgentEventItem =
  | ThinkingItem
  | AssistantItem
  | ToolItem
  | SystemItem
  | ErrorItem
  | LogItem

export function collectAgentEvents(messages: InspectorUIMessage[]): CursorAgentEvent[] {
  const events: CursorAgentEvent[] = []
  for (const message of messages) {
    if (message.role !== 'assistant') continue
    for (const part of message.parts) {
      if (part.type === 'data-agentEvent' && 'data' in part) {
        events.push(part.data as CursorAgentEvent)
      }
    }
  }
  return events
}

export function buildAgentItems(events: CursorAgentEvent[]): AgentEventItem[] {
  const items: AgentEventItem[] = []
  let counter = 0

  const thinkingItemsByRunId = new Map<string, ThinkingItem[]>()
  const activeThinkingByRunId = new Map<string, ThinkingItem>()
  const thinkingSequenceByRunId = new Map<string, number>()

  const assistantBySegmentId = new Map<string, AssistantItem>()
  const assistantByRunId = new Map<string, AssistantItem[]>()
  const activeAssistantByRunId = new Map<string, AssistantItem>()
  const assistantSequenceByRunId = new Map<string, number>()
  const toolByCallId = new Map<string, ToolItem>()

  const nextKey = (prefix: string) => `${prefix}-${counter++}`

  const getOrCreateThinking = (runId: string): ThinkingItem => {
    let item = activeThinkingByRunId.get(runId)
    if (!item || item.isComplete) {
      const thinkingItem: ThinkingItem = {
        kind: 'thinking',
        key: nextKey('thinking'),
        runId,
        text: '',
        isComplete: false,
      }
      const current = thinkingSequenceByRunId.get(runId) ?? 0
      thinkingSequenceByRunId.set(runId, current + 1)
      const list = thinkingItemsByRunId.get(runId) ?? []
      list.push(thinkingItem)
      thinkingItemsByRunId.set(runId, list)
      activeThinkingByRunId.set(runId, thinkingItem)
      item = thinkingItem
      items.push(item)
    }
    return item
  }

  const nextAssistantSegmentId = (runId: string): string => {
    const current = assistantSequenceByRunId.get(runId) ?? 0
    const next = current + 1
    assistantSequenceByRunId.set(runId, next)
    return `${runId}-segment-${next}`
  }

  const ensureAssistant = (runId: string, modelCallId?: string): AssistantItem => {
    if (modelCallId) {
      const existingBySegment = assistantBySegmentId.get(modelCallId)
      if (existingBySegment) {
        return existingBySegment
      }
    }

    let activeItem = activeAssistantByRunId.get(runId)

    if (!activeItem || activeItem.isFinal) {
      const segmentId = modelCallId ?? nextAssistantSegmentId(runId)
      activeItem = {
        kind: 'assistant',
        key: nextKey('assistant'),
        runId,
        segmentId,
        text: '',
        isFinal: false,
      }
      activeAssistantByRunId.set(runId, activeItem)
      assistantBySegmentId.set(segmentId, activeItem)
      const list = assistantByRunId.get(runId) ?? []
      list.push(activeItem)
      assistantByRunId.set(runId, list)
      items.push(activeItem)
    }

    if (modelCallId && activeItem.segmentId !== modelCallId) {
      assistantBySegmentId.delete(activeItem.segmentId)
      activeItem.segmentId = modelCallId
      assistantBySegmentId.set(modelCallId, activeItem)
    }

    return activeItem
  }

  const ensureTool = (callId: string, label: string): ToolItem => {
    let item = toolByCallId.get(callId)
    if (!item) {
      item = {
        kind: 'tool',
        key: nextKey('tool'),
        callId,
        label,
        status: 'started',
      }
      toolByCallId.set(callId, item)
      items.push(item)
    }
    return item
  }

  for (const evt of events) {
    const runId = resolveRunId(evt) ?? 'default'

    switch (evt.type) {
      case 'thinking': {
        const item = getOrCreateThinking(runId)
        if (evt.subtype === 'delta') {
          const delta = evt.text ?? ''
          if (delta) {
            item.text += delta
          }
          if (evt.timestamp_ms && !item.startedAtMs) {
            item.startedAtMs = evt.timestamp_ms
          }
          item.isComplete = false
        } else if (evt.subtype === 'completed') {
          item.isComplete = true
          activeThinkingByRunId.delete(runId)
          if (evt.text) {
            item.text = evt.text
          }
          if (evt.timestamp_ms) {
            item.completedAtMs = evt.timestamp_ms
          }
        }
        break
      }
      case 'assistant': {
        const text = normalizeAssistantText(evt)
        if (!text) {
          break
        }
        const modelCallId = resolveModelCallId(evt)
        const item = ensureAssistant(runId, modelCallId)
        item.text = reconcileText(item.text, text)
        if (modelCallId) {
          item.isFinal = true
          activeAssistantByRunId.delete(runId)
        } else {
          item.isFinal = false
        }
        break
      }
      case 'result': {
        const assistants = assistantByRunId.get(runId) ?? []
        for (const item of assistants) {
          item.isFinal = true
        }
        activeAssistantByRunId.delete(runId)
        const thinkingItems = thinkingItemsByRunId.get(runId) ?? []
        for (const thinking of thinkingItems) {
          thinking.isComplete = true
        }
        activeThinkingByRunId.delete(runId)
        break
      }
      case 'tool_call': {
        const toolKey = detectToolKey(evt.tool_call)
        const callId = evt.call_id ?? toolKey ?? `tool-${toolByCallId.size}`
        const kind = toToolKind(toolKey)
        const label = TOOL_KIND_LABEL[kind] ?? toolKey ?? 'Tool'
        const item = ensureTool(callId, label)
        if (evt.subtype === 'started') {
          item.status = 'started'
        } else if (evt.subtype === 'completed') {
          item.status = 'completed'
          const payload = toolKey ? evt.tool_call?.[toolKey] : evt.tool_call
          if (payload !== undefined) {
            item.payload = payload
          }
        }
        break
      }
      case 'system': {
        const message = extractSystemMessage(evt)
        if (!message) {
          break
        }
        const lower = message.toLowerCase()
        const level: InspectorSystemNoticeLevel = lower.includes('error')
          ? 'error'
          : lower.includes('warn')
            ? 'warning'
            : 'info'
        items.push({
          kind: 'system',
          key: nextKey('system'),
          level,
          message,
          runId,
        })
        break
      }
      case 'error': {
        if (evt.error) {
          items.push({
            kind: 'error',
            key: nextKey('error'),
            message: evt.error,
          })
        }
        break
      }
      case 'log': {
        if (evt.text) {
          items.push({
            kind: 'log',
            key: nextKey('log'),
            text: evt.text,
            source: evt.subtype ?? 'stdout',
          })
        }
        break
      }
      default:
        break
    }
  }

  return items
}

export function renderAgentItem(item: AgentEventItem): React.ReactNode {
  switch (item.kind) {
    case 'thinking': {
      return (
        <ThinkingView
          text={item.text}
          isActive={!item.isComplete}
          startedAtMs={item.startedAtMs}
          completedAtMs={item.completedAtMs}
          runId={item.runId}
        />
      )
    }
    case 'assistant': {
      return (
        <TextView
          data={{
            runId: item.runId,
            segmentId: item.segmentId,
            text: item.text,
            isFinal: item.isFinal,
          }}
        />
      )
    }
    case 'tool': {
      return <ToolEventView item={item} />
    }
    case 'system': {
      return <SystemNoticeView item={item} />
    }
    case 'error': {
      return <ErrorEventView item={item} />
    }
    case 'log': {
      return <LogEventView item={item} />
    }
    default:
      return null
  }
}


function extractSystemMessage(evt: CursorAgentEvent): string | undefined {
  const raw = (evt as any)?.message
  if (typeof raw === 'string') {
    return raw
  }
  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.content)) {
      return raw.content
        .map((entry: any) => (typeof entry?.text === 'string' ? entry.text : ''))
        .join(' ')
        .trim()
    }
    if (typeof raw.text === 'string') {
      return raw.text
    }
  }
  return undefined
}


