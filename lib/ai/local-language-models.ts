import type { LanguageModel } from 'ai'
import type {
  LanguageModelV2CallOptions,
  LanguageModelV2Prompt,
  LanguageModelV2StreamPart,
  LanguageModelV2Content
} from '@ai-sdk/provider'
import { MODELS } from '@/lib/main/llm/config'
import type { ModelId } from '@/lib/main/llm/config'
import { ElectronAi } from '@electron/llm'

declare global {
  interface Window {
    electronAi?: ElectronAi
  }
}

export function createLocalLanguageModel(modelId: ModelId): LanguageModel {
  const model = MODELS.find(m => m.id === modelId)
  if (!model) throw new Error(`Unknown local model: ${modelId}`)

  return {
    specificationVersion: 'v2',
    provider: 'local',
    modelId,
    supportedUrls: {},

    // Streaming generation
    async doStream(options: LanguageModelV2CallOptions) {
      if (!window.electronAi) throw new Error('LLM not available')

      // Ensure the requested model is ready (idempotent per your runtime)
      await window.electronAi.create({
        modelAlias: model.alias
      })

      const textPrompt = v2PromptToText(options.prompt)

      const iterator = await window.electronAi.promptStreaming(textPrompt, {})

      const stream = new ReadableStream<LanguageModelV2StreamPart>({
        async start(controller) {
          const responseId = crypto.randomUUID()
          const segmentId = crypto.randomUUID()
          const timestamp = new Date()

          controller.enqueue({ type: 'stream-start', warnings: [] })
          controller.enqueue({ type: 'response-metadata', id: responseId, timestamp, modelId: model.id })
          controller.enqueue({ type: 'text-start', id: segmentId })
          try {
            for await (const chunk of iterator) {
              controller.enqueue({ type: 'text-delta', id: segmentId, delta: chunk })
            }
            controller.enqueue({ type: 'text-end', id: segmentId })
            controller.enqueue({
              type: 'finish',
              usage: {
              inputTokens: undefined,
              outputTokens: undefined,
              totalTokens: undefined,
              reasoningTokens: undefined
              },
              finishReason: 'stop'
            })
          } catch (err) {
            controller.error(err)
            return
          } finally {
            controller.close()
          }
        },
        cancel() {
          // Best-effort cleanup if the underlying iterator supports return()
          const gen: any = iterator as any
          if (gen && typeof gen.return === 'function') {
            try { gen.return() } catch { /* noop */ }
          }
        }
      })

      return {
        stream,
        request: { body: undefined },
        response: { headers: undefined }
      }
    },

    // Non-streaming generation
    async doGenerate(options: LanguageModelV2CallOptions) {
      if (!window.electronAi) throw new Error('LLM not available')

      await window.electronAi.create({
        modelAlias: model.alias
      })

      const textPrompt = v2PromptToText(options.prompt)

      const output = await window.electronAi.prompt(textPrompt, {})

      return {
        content: [
          { type: 'text', text: String(output) } as LanguageModelV2Content
        ],
        finishReason: 'stop',
        usage: {
          inputTokens: undefined,
          outputTokens: undefined,
          totalTokens: undefined,
          reasoningTokens: undefined
        },
        warnings: [],
        request: { body: undefined },
        response: {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          modelId: model.id,
          headers: undefined,
          body: undefined
        }
      }
    }
  }
}

function v2PromptToText(prompt: LanguageModelV2Prompt) {
  let systemText: string | undefined
  const lines: string[] = []

  for (const message of prompt) {
    if (message.role === 'system') {
      systemText = message.content
      continue
    }

    if (message.role === 'user' || message.role === 'assistant') {
      const parts = message.content
      const text = parts
        .filter(p => (p as { type: string }).type === 'text')
        .map(p => (p as { text: string }).text)
        .join(' ')
      const role = capitalize(message.role)
      lines.push(`${role}: ${text}`)
    }
    // ignore 'tool' role for local text prompt
  }

  const sys = systemText ? `System: ${systemText}\n\n` : ''
  return `${sys}${lines.join('\n\n')}\n\nAssistant:`
}

function capitalize(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value
}