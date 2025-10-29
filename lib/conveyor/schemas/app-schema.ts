import { z } from 'zod'

// Schemas for project detection types
const frameworkSignalSchema = z.object({
  name: z.string(),
  signals: z.array(z.string()),
})

const setupCommandsSchema = z.object({
  install: z.string(),
  dev: z.string(),
  setup: z.string(),
  build: z.string().optional(),
})

const detectResultSchema = z.object({
  packagePath: z.string(),
  frameworks: z.array(frameworkSignalSchema),
  packageManagers: z.array(z.enum(['pnpm', 'yarn', 'bun', 'npm'])),
  name: z.string(),
  description: z.string().optional(),
  commands: setupCommandsSchema,
  monorepo: z.object({
    isMonorepo: z.boolean(),
    candidates: z.array(z.lazy(() => detectResultSchema)).optional(),
  }).optional(),
})

export const appIpcSchema = {
  version: {
    args: z.tuple([]),
    return: z.string(),
  },
  'select-project': {
    args: z.tuple([]),
    return: z.object({
      success: z.boolean(),
      path: z.string().nullable(),
    }),
  },
  'detect-project': {
    args: z.tuple([z.string()]),
    return: detectResultSchema,
  },
}
