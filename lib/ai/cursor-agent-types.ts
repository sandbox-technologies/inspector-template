import type { UIMessageStreamWriter } from 'ai'

import type { InspectorUIMessage } from '@/app/ai/types'

export type CursorAgentEvent = {
  type: string
  subtype?: string
  call_id?: string
  session_id?: string
  runId?: string
  model_call_id?: string
  timestamp_ms?: number
  message?: {
    role?: string
    content?: Array<{ type: string; text?: string }>
    model_call_id?: string
  }
  tool_call?: Record<string, any>
  text?: string
  error?: string
  exitCode?: number
}

export type ToolKind = 'grep' | 'read' | 'edit' | 'write' | 'ls' | 'terminal' | 'unknown'

export type CursorAgentAdapterOptions = {
  messages: InspectorUIMessage[]
  cwd: string
  env?: NodeJS.ProcessEnv
  writer: UIMessageStreamWriter<InspectorUIMessage>
  args?: string[]
}

