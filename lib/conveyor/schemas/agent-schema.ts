import { z } from 'zod'

export const agentIpcSchema = {
  'agent-start': {
    args: z.tuple([
      z.object({
        cwdPath: z.string(),
        prompt: z.string(),
        force: z.boolean().optional(),
        streamPartial: z.boolean().optional(),
        runId: z.string().optional()
      })
    ]),
    return: z.object({
      runId: z.string()
    })
  },

  'agent-cancel': {
    args: z.tuple([
      z.object({
        runId: z.string()
      })
    ]),
    return: z.object({
      success: z.boolean()
    })
  },

  'agent-undo': {
    args: z.tuple([
      z.object({
        cwdPath: z.string(),
        files: z.array(z.string())
      })
    ]),
    return: z.object({
      success: z.boolean()
    })
  }
} as const
