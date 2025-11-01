import { protocol, net } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai'

import type { InspectorUIMessage } from '@/app/ai/types'
import { runCursorAgentToUIStream } from '@/lib/ai/cursor-agent-adapter'

export function registerResourcesProtocol() {
  protocol.handle('res', async (request) => {
    try {
      const url = new URL(request.url)
      // Combine hostname and pathname to get the full path
      const fullPath = join(url.hostname, url.pathname.slice(1))
      const filePath = join(__dirname, '../../resources', fullPath)
      return net.fetch(pathToFileURL(filePath).toString())
    } catch (error) {
      console.error('Protocol error:', error)
      return new Response('Resource not found', { status: 404 })
    }
  })
}

export function registerAIProtocol() {
  protocol.handle('ai', async (request) => {
    console.warn('[ai-protocol] request url =', request.url, 'method =', request.method)
    const url = new URL(request.url)
    const isChatRoute =
      url.pathname === '/chat' ||
      url.pathname === '/chat/' ||
      url.hostname === 'chat' ||
      (url.hostname === '' && url.pathname === '/chat')

    if (!isChatRoute || request.method !== 'POST') {
      return new Response('Not Found', { status: 404 })
    }

    try {
      const body = await request.json().catch(() => ({}))
      const messages: InspectorUIMessage[] = body?.messages ?? []
      const latestUser = [...messages].reverse().find((m) => m.role === 'user') as any
      const lastUserText = latestUser?.parts?.find((p: any) => p.type === 'text')?.text || ''
      const cwd = url.searchParams.get('cwd') || process.cwd()
      console.warn('[ai-protocol] parsed body messages:', messages.length, 'cwd =', cwd)
      console.warn('[ai-protocol] lastUserText preview:', (lastUserText || '').slice(0, 80))

      const stream = createUIMessageStream<InspectorUIMessage>({
        originalMessages: messages,
        onError: (error) => {
          console.error('[ai-protocol] stream error:', error)
          return 'cursor-agent error'
        },
        execute: async ({ writer }) => {
          await runCursorAgentToUIStream({
            messages,
            cwd,
            writer,
          })
        },
      })

      return createUIMessageStreamResponse({ stream })
    } catch (error) {
      console.error('AI protocol error:', error)
      return new Response('Internal Error', { status: 500 })
    }
  })
}
