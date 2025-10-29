import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { generateText, streamText } from 'ai'
import { createLocalLanguageModel } from '@/lib/ai/local-language-models'
import { ModelSelector } from '@/app/components/ui/chat/ModelSelector'
import { MODELS } from '@/lib/main/llm/config'
import type { ModelId } from '@/lib/main/llm/config'

export default function LocalLanguageModelsDebugger() {
  const itemVariants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }
  const [activeTab, setActiveTab] = useState<'run' | 'stream'>('run')
  const [selectedModelId, setSelectedModelId] = useState<ModelId>('tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamResult, setStreamResult] = useState('')
  const [streamError, setStreamError] = useState<string | null>(null)
  const [streamController, setStreamController] = useState<AbortController | null>(null)
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a playful, concise assistant that keeps replies short and friendly.'
  )
  const [userMessage, setUserMessage] = useState(
    'Say hello from the AI Debugger in one short playful sentence.'
  )
  const model = useMemo(() => createLocalLanguageModel(selectedModelId), [selectedModelId])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setResult('')
    setError(null)
    try {
      const { text } = await generateText({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
      setResult(text)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate example'
      setError(message)
      console.error('AI Debugger example error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStream = async () => {
    if (isStreaming) return
    const controller = new AbortController()
    setStreamController(controller)
    setIsStreaming(true)
    setStreamResult('')
    setStreamError(null)
    try {
      const { textStream } = await streamText({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        abortSignal: controller.signal
      })
      for await (const delta of textStream) {
        setStreamResult(prev => prev + delta)
      }
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Failed to stream example'
      setStreamError(message)
      console.error('AI Debugger stream error:', err)
    } finally {
      setIsStreaming(false)
      setStreamController(null)
    }
  }

  const stopStream = () => {
    if (streamController) {
      streamController.abort()
    }
  }

  const clearAll = () => {
    setResult('')
    setError(null)
    setStreamResult('')
    setStreamError(null)
  }

  return (
    <motion.div
      className="pane-surface h-full w-full rounded-md flex items-center justify-center p-16"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="max-w-4xl w-full">
        <div className="relative w-full h-[460px] sm:h-[520px]">
          <div className="absolute inset-0 flex flex-col gap-4">
            <motion.div
              className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight"
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.12, delayChildren: 0.15 }}
            >
              <motion.div variants={itemVariants}>AI Debugger</motion.div>
            </motion.div>

            <div className="mt-6 max-w-3xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 rounded-md p-1 bg-black/5 dark:bg-white/5">
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md ${activeTab === 'run' ? 'bg-white dark:bg-neutral-800 shadow-xs' : 'opacity-70'}`}
                    onClick={() => setActiveTab('run')}
                  >Run</button>
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md ${activeTab === 'stream' ? 'bg-white dark:bg-neutral-800 shadow-xs' : 'opacity-70'}`}
                    onClick={() => setActiveTab('stream')}
                  >Stream</button>
                </div>
                <div className="flex items-center gap-3">
                  <ModelSelector
                    value={selectedModelId}
                    models={MODELS.map(m => m.id)}
                    onChange={(m) => setSelectedModelId(m as ModelId)}
                  />
                  <Button variant="ghost" onClick={clearAll}>Clear</Button>
                </div>
              </div>

              {/* System prompt editor */}
              <div className="p-4 rounded-lg pane-surface border border-black/5 dark:border-white/5">
                <label className="block text-xs font-medium opacity-70 mb-2">System prompt</label>
                <textarea
                  className="w-full h-24 resize-y rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 text-sm"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Set the system behavior here..."
                />
              </div>

              {/* User message editor */}
              <div className="p-4 rounded-lg pane-surface border border-black/5 dark:border-white/5">
                <label className="block text-xs font-medium opacity-70 mb-2">User message</label>
                <textarea
                  className="w-full h-24 resize-y rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 text-sm"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Type the message you want to send to the model..."
                />
              </div>

              {activeTab === 'run' ? (
                <div className="p-4 rounded-lg pane-surface border border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-end gap-3">
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                      {isGenerating ? 'Generating…' : 'Run example'}
                    </Button>
                  </div>
                  {(result || error) && (
                    <div className="mt-3 text-sm">
                      {result && (
                        <div className="p-3 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 max-h-64 overflow-auto">
                          {result}
                        </div>
                      )}
                      {error && (
                        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300">
                          {error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg pane-surface border border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-end gap-2">
                    {isStreaming && (
                      <Button variant="secondary" onClick={stopStream}>Stop</Button>
                    )}
                    <Button onClick={handleStream} disabled={isStreaming}>
                      {isStreaming ? 'Streaming…' : 'Start stream'}
                    </Button>
                  </div>
                  {(streamResult || streamError) && (
                    <div className="mt-3 text-sm">
                      {streamResult && (
                        <div className="p-3 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 whitespace-pre-wrap max-h-64 overflow-auto">
                          {streamResult}
                        </div>
                      )}
                      {streamError && (
                        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300">
                          {streamError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}


