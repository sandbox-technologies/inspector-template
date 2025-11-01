import { spawn, type ChildProcess } from 'child_process'

import type { InspectorDataParts, InspectorMessageMetadata } from '@/app/ai/types'

import type { CursorAgentAdapterOptions, CursorAgentEvent } from './cursor-agent-types'

import {
  DEFAULT_CURSOR_ARGS,
  buildCursorArgs,
  extractLastUserText,
  resolveRunId,
  safeJsonParse,
} from './cursor-agent-helpers'

const EVENT_PART_TYPE = 'data-agentEvent' as const

export async function runCursorAgentToUIStream({
  messages,
  cwd,
  env,
  writer,
  args,
}: CursorAgentAdapterOptions): Promise<void> {
  const metadata: InspectorMessageMetadata = { createdAt: Date.now() }
  let responseStarted = false
  let child: ChildProcess | undefined
  let eventIndex = 0
  const bufferedStdout: { value: string } = { value: '' }
  const bufferedStderr: { value: string } = { value: '' }

  const lastUserText = extractLastUserText(messages)
  const spawnArgs = buildCursorArgs(args ?? DEFAULT_CURSOR_ARGS, lastUserText)

  const ensureStart = () => {
    if (!responseStarted) {
      responseStarted = true
      writer.write({ type: 'start', messageMetadata: metadata })
    }
  }

  const updateMetadata = (patch: Partial<InspectorMessageMetadata>) => {
    let changed = false
    for (const key of Object.keys(patch) as Array<keyof InspectorMessageMetadata>) {
      const value = patch[key]
      if (value !== undefined && metadata[key] !== value) {
        ;(metadata as Record<string, unknown>)[key as string] = value
        changed = true
      }
    }

    if (changed) {
      ensureStart()
      writer.write({ type: 'message-metadata', messageMetadata: metadata })
    }
  }

  const emitEvent = (evt: CursorAgentEvent) => {
    if (!evt || typeof evt.type !== 'string') {
      return
    }

    const runId = resolveRunId(evt)
    if (runId) {
      updateMetadata({ runId })
    }

    ensureStart()
    writer.write({
      type: EVENT_PART_TYPE,
      id: `event-${eventIndex++}`,
      data: evt,
    })
  }

  const emitFallbackEvent = (line: string, source: 'stdout' | 'stderr') => {
    const fallback: CursorAgentEvent = {
      type: 'log',
      subtype: source,
      text: line,
    }
    emitEvent(fallback)
  }

  const processLine = (line: string, source: 'stdout' | 'stderr') => {
    const trimmed = line.trim()
    if (!trimmed) {
      return
    }

    const parsed = safeJsonParse(trimmed)
    if (parsed && typeof parsed === 'object' && 'type' in (parsed as { type?: unknown })) {
      emitEvent(parsed as CursorAgentEvent)
      return
    }

    emitFallbackEvent(trimmed, source)
  }

  const handleChunk = (bufferRef: { value: string }, chunk: Buffer, source: 'stdout' | 'stderr') => {
    bufferRef.value += chunk.toString()
    let newlineIndex: number

    while ((newlineIndex = bufferRef.value.indexOf('\n')) !== -1) {
      const rawLine = bufferRef.value.slice(0, newlineIndex)
      bufferRef.value = bufferRef.value.slice(newlineIndex + 1)
      processLine(rawLine, source)
    }
  }

  const flushBuffer = (bufferRef: { value: string }, source: 'stdout' | 'stderr') => {
    if (!bufferRef.value) {
      return
    }

    processLine(bufferRef.value, source)
    bufferRef.value = ''
  }

  try {
    child = spawn('cursor-agent', spawnArgs, {
      cwd,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...env, FORCE_COLOR: '1' },
    })

    child.stdout?.on('data', (chunk: Buffer) => handleChunk(bufferedStdout, chunk, 'stdout'))
    child.stderr?.on('data', (chunk: Buffer) => handleChunk(bufferedStderr, chunk, 'stderr'))

    await new Promise<void>((resolve) => {
      child?.on('exit', () => resolve())
      child?.on('close', () => resolve())
    })

    flushBuffer(bufferedStdout, 'stdout')
    flushBuffer(bufferedStderr, 'stderr')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'cursor-agent failed'
    emitFallbackEvent(message, 'stderr')
  } finally {
    if (child && !child.killed) {
      child.removeAllListeners()
    }

    ensureStart()
    writer.write({ type: 'finish', messageMetadata: metadata })
  }
}

// Re-export the data part type to make sure the module is treated as used.
export type InspectorDataPart = InspectorDataParts[keyof InspectorDataParts]

