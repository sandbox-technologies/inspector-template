// Simple model configuration - alias-driven, no system prompts by default
export const MODELS = [
  {
    id: 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    alias: 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    name: 'TinyLlama 1.1B Chat (Q4_K_M)'
  }
] as const

export type ModelConfig = typeof MODELS[number]
export type ModelId = typeof MODELS[number]['id']
