import { z } from 'zod'

export const workspaceIpcSchema = {
  'workspace-start': {
    args: z.tuple([
      z.object({
        projectPath: z.string(),
        setupCommand: z.string().optional(),
        branchBase: z.string().default('main'),
        // Used by renderer to correlate progress events to a specific tab
        clientRequestId: z.string().optional(),
      }),
    ]),
    return: z.object({
      workspaceId: z.string(),
      branch: z.string(),
      worktreePath: z.string(),
      devUrl: z.string(),
    }),
  },
  'workspace-stop': {
    args: z.tuple([
      z.object({
        workspaceId: z.string(),
      }),
    ]),
    return: z.object({
      success: z.boolean(),
    }),
  },
  'workspace-logs': {
    args: z.tuple([
      z.object({
        workspaceId: z.string(),
      }),
    ]),
    return: z.object({
      logs: z.array(z.string()),
    }),
  },
} as const
