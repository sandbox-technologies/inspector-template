import type { UIMessage } from 'ai'

import type { CursorAgentEvent } from '@/lib/ai/cursor-agent-types'

export type InspectorSystemNoticeLevel = 'info' | 'warning' | 'error'

export type InspectorToolPhase = 'started' | 'completed'

export interface InspectorAgentTextData {
  runId: string
  text: string
  segmentId?: string
  isFinal?: boolean
}

export interface InspectorThinkingDeltaData {
  runId: string
  textDelta: string
  startedAtMs: number
}

export interface InspectorThinkingFinalData {
  runId: string
  text: string
  durationMs?: number
  startedAtMs?: number
  completedAtMs?: number
}

export interface InspectorStatusData {
  id: string
  label: string
  phase: InspectorToolPhase
  callId?: string
  runId?: string
  details?: string
}

export interface InspectorSystemNoticeData {
  level: InspectorSystemNoticeLevel
  message: string
  runId?: string
}

export interface GrepArgs extends Record<string, unknown> {
  pattern: string
  path: string
  glob?: string
  outputMode: 'content' | 'files_with_matches' | 'count'
  caseInsensitive?: boolean
  headLimit?: number
  multiline?: boolean
  type?: string
  toolCallId?: string
}

export interface GrepMatchLine extends Record<string, unknown> {
  lineNumber: number
  content: string
  contentTruncated: boolean
  isContextLine: boolean
}

export interface GrepFileMatches extends Record<string, unknown> {
  file: string
  matches: GrepMatchLine[]
}

export interface GrepWorkspaceContent extends Record<string, unknown> {
  matches: GrepFileMatches[]
  totalLines: number
  totalMatchedLines: number
  clientTruncated: boolean
  ripgrepTruncated: boolean
}

export interface GrepWorkspaceResult extends Record<string, unknown> {
  content: GrepWorkspaceContent
}

export interface GrepSuccessResult extends Record<string, unknown> {
  pattern: string
  path: string
  outputMode: 'content' | 'files_with_matches' | 'count'
  workspaceResults: Record<string, GrepWorkspaceResult>
}

export interface GrepErrorResult extends Record<string, unknown> {
  message: string
}

export type GrepResultPayload =
  | { success: GrepSuccessResult; error?: undefined }
  | { success?: undefined; error: GrepErrorResult }

export interface InspectorGrepResultData extends Record<string, unknown> {
  callId: string
  args: GrepArgs
  result: GrepResultPayload
}

export interface ReadRange extends Record<string, unknown> {
  startLine: number
  endLine: number
}

export interface InspectorReadMeta extends Record<string, unknown> {
  isEmpty: boolean
  exceededLimit: boolean
  totalLines?: number
  fileSize?: number
}

export interface InspectorReadResultData extends Record<string, unknown> {
  callId: string
  path: string
  content: string
  readRange?: ReadRange
  meta: InspectorReadMeta
}

export interface InspectorEditResultData extends Record<string, unknown> {
  callId: string
  path: string
  diff: string
  linesAdded: number
  linesRemoved: number
  newFile: boolean
  beforePreview?: string
  afterPreview?: string
  resultForModel?: string
}

export interface InspectorDirectoryTreeFile extends Record<string, unknown> {
  name: string
}

export interface InspectorDirectoryTreeNode extends Record<string, unknown> {
  absPath: string
  childrenDirs: InspectorDirectoryTreeNode[]
  childrenFiles: InspectorDirectoryTreeFile[]
  childrenWereProcessed: boolean
  numFiles: number
  fullSubtreeExtensionCounts: Record<string, number>
}

export interface InspectorLsResultData extends Record<string, unknown> {
  callId: string
  root: InspectorDirectoryTreeNode
  counts: Record<string, number>
}

export interface InspectorDataParts extends Record<string, unknown> {
  agentEvent: CursorAgentEvent
  agentText: InspectorAgentTextData
  thinking: InspectorThinkingDeltaData
  thinkingFinal: InspectorThinkingFinalData
  status: InspectorStatusData
  systemNotice: InspectorSystemNoticeData
  grepResult: InspectorGrepResultData
  readResult: InspectorReadResultData
  editResult: InspectorEditResultData
  lsResult: InspectorLsResultData
}

export interface InspectorMessageMetadata {
  runId?: string
  callId?: string
  model?: string
  createdAt?: number
}

export type InspectorUIMessage = UIMessage<InspectorMessageMetadata, InspectorDataParts>
