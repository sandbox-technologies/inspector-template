import type {
  GrepResultPayload,
  InspectorDirectoryTreeNode,
  InspectorEditResultData,
  InspectorLsResultData,
  InspectorReadResultData,
  InspectorUIMessage,
} from '@/app/ai/types'

import type { CursorAgentEvent, ToolKind } from './cursor-agent-types'

export const DEFAULT_CURSOR_ARGS = [
  '-p',
  '--force',
  '--model',
  'gpt-5',
  '--output-format',
  'stream-json',
]

export const TOOL_KIND_LABEL: Record<ToolKind, string> = {
  grep: 'Grepping',
  read: 'Reading',
  edit: 'Editing',
  write: 'Writing',
  ls: 'Listing',
  terminal: 'Running command',
  unknown: 'Running tool',
}

const HTML_ENTITY_REPLACEMENTS: Array<[string, string]> = [
  ['&amp;', '&'],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&quot;', '"'],
  ['&#39;', "'"],
  ['&#x27;', "'"],
  ['&#96;', '`'],
]

export function decodeHtmlEntities(value: string): string {
  if (!value || value.indexOf('&') === -1) return value

  let result = value
  for (const [entity, char] of HTML_ENTITY_REPLACEMENTS) {
    if (result.includes(entity)) {
      result = result.replaceAll(entity, char)
    }
  }

  if (result.includes('&#')) {
    result = result.replace(/&#(\d+);/g, (match, dec) => {
      const codePoint = Number.parseInt(dec, 10)
      if (Number.isNaN(codePoint)) {
        return match
      }
      try {
        return String.fromCodePoint(codePoint)
      } catch {
        return match
      }
    })

    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      const codePoint = Number.parseInt(hex, 16)
      if (Number.isNaN(codePoint)) {
        return match
      }
      try {
        return String.fromCodePoint(codePoint)
      } catch {
        return match
      }
    })
  }

  return result
}

export function decodeOptionalHtmlEntities(value?: string | null): string | undefined {
  if (value === undefined || value === null) return undefined
  return decodeHtmlEntities(value)
}

export function extractLastUserText(messages: InspectorUIMessage[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (message.role !== 'user') continue
    const textPart = message.parts?.find((part) => part.type === 'text') as
      | { type: 'text'; text?: string }
      | undefined
    if (textPart?.text) {
      return textPart.text
    }
  }
  return undefined
}

export function buildCursorArgs(baseArgs: string[], lastUserText?: string): string[] {
  if (!lastUserText) {
    return baseArgs
  }
  return [...baseArgs, '--stream-partial-output', lastUserText]
}

export function detectToolKey(toolCall?: Record<string, any>): string | undefined {
  if (!toolCall) return undefined
  return Object.keys(toolCall).find((key) => key.endsWith('ToolCall'))
}

export const TOOL_KEY_TO_KIND: Record<string, ToolKind> = {
  grepToolCall: 'grep',
  readToolCall: 'read',
  editToolCall: 'edit',
  writeToolCall: 'write',
  lsToolCall: 'ls',
  terminalToolCall: 'terminal',
}

export function toToolKind(toolKey?: string): ToolKind {
  if (!toolKey) return 'unknown'
  return TOOL_KEY_TO_KIND[toolKey] ?? 'unknown'
}

export function resolveRunId(evt: CursorAgentEvent): string {
  return evt.session_id ?? evt.runId ?? 'default'
}

export function resolveModelCallId(evt: CursorAgentEvent): string | undefined {
  return evt.model_call_id ?? evt.message?.model_call_id
}

export function normalizeAssistantText(evt: CursorAgentEvent): string {
  const content = Array.isArray(evt.message?.content)
    ? evt.message?.content?.filter((part) => part?.type === 'text')
    : []
  if (!content?.length) {
    return ''
  }
  return content
    .map((part) => (typeof part.text === 'string' ? part.text : ''))
    .join('')
}

export function reconcileText(previous: string, incoming: string): string {
  if (!previous) return incoming
  if (!incoming) return previous
  if (incoming.startsWith(previous)) {
    return incoming
  }
  if (previous.startsWith(incoming)) {
    return previous
  }
  return previous + incoming
}

export function safeJsonParse(line: string): CursorAgentEvent | null {
  try {
    return JSON.parse(line)
  } catch (error) {
    console.warn('[cursor-adapter] Failed to parse line as JSON', { line, error })
    return null
  }
}

export function toGrepResultPayload(result: any): GrepResultPayload {
  if (result?.success) {
    return { success: result.success }
  }
  const message = normalizeError(result?.error)
  return { error: { message } }
}

export function toReadResult(
  callId: string,
  payload: Record<string, any>,
): InspectorReadResultData | undefined {
  const success = payload?.result?.success
  if (!success) return undefined
  const meta = {
    isEmpty: Boolean(success.isEmpty),
    exceededLimit: Boolean(success.exceededLimit),
    totalLines: success.totalLines,
    fileSize: success.fileSize,
  }
  const readRange = success.readRange ?? success.read_range
  return {
    callId,
    path: success.path ?? payload?.args?.path ?? '',
    content: success.content ?? '',
    readRange,
    meta,
  }
}

export function toEditResult(
  callId: string,
  payload: Record<string, any>,
): InspectorEditResultData | undefined {
  const success = payload?.result?.success
  if (!success) return undefined
  const before = success.beforeFullFileContent ?? success.before_full_file_content
  const after = success.afterFullFileContent ?? success.after_full_file_content
  return {
    callId,
    path: success.path ?? payload?.args?.path ?? '',
    diff: decodeHtmlEntities(success.diffString ?? success.diff_string ?? ''),
    linesAdded: Number(success.linesAdded ?? success.lines_added ?? 0),
    linesRemoved: Number(success.linesRemoved ?? success.lines_removed ?? 0),
    newFile: Boolean(!before && !!after),
    beforePreview: decodeOptionalHtmlEntities(before),
    afterPreview: decodeOptionalHtmlEntities(after),
    resultForModel: success.resultForModel ?? success.result_for_model,
  }
}

export function toLsResult(
  callId: string,
  payload: Record<string, any>,
): InspectorLsResultData | undefined {
  const success = payload?.result?.success
  if (!success) return undefined
  const root = (success.directoryTreeRoot ?? success) as InspectorDirectoryTreeNode
  const counts =
    success.directoryTreeRoot?.fullSubtreeExtensionCounts ??
    success.fullSubtreeExtensionCounts ??
    {}
  return {
    callId,
    root,
    counts,
  }
}

export function normalizeError(error: unknown): string {
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as any).message === 'string'
  ) {
    return (error as any).message
  }
  return 'Unknown error'
}

