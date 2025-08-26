import { z } from 'zod'

// Define all IPC channel schemas in one place
export const ipcSchemas = {
  // Window management
  'window-init': {
    args: z.tuple([]),
    return: z.object({
      width: z.number(),
      height: z.number(),
      minimizable: z.boolean(),
      maximizable: z.boolean(),
      platform: z.string(),
    }),
  },
  'window-is-minimizable': {
    args: z.tuple([]),
    return: z.boolean(),
  },
  'window-is-maximizable': {
    args: z.tuple([]),
    return: z.boolean(),
  },
  'window-minimize': {
    args: z.tuple([]),
    return: z.void(),
  },
  'window-maximize': {
    args: z.tuple([]),
    return: z.void(),
  },
  'window-close': {
    args: z.tuple([]),
    return: z.void(),
  },
  'window-maximize-toggle': {
    args: z.tuple([]),
    return: z.void(),
  },

  // Web content operations
  'web-undo': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-redo': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-cut': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-copy': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-paste': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-delete': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-select-all': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-reload': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-force-reload': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-toggle-devtools': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-actual-size': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-zoom-in': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-zoom-out': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-toggle-fullscreen': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-open-url': {
    args: z.tuple([z.string()]),
    return: z.void(),
  },
} as const

// Extract types from Zod schemas
export type IPCChannels = {
  [K in keyof typeof ipcSchemas]: {
    args: z.infer<(typeof ipcSchemas)[K]['args']>
    return: z.infer<(typeof ipcSchemas)[K]['return']>
  }
}

export type ChannelName = keyof typeof ipcSchemas
export type ChannelArgs<T extends ChannelName> = IPCChannels[T]['args']
export type ChannelReturn<T extends ChannelName> = IPCChannels[T]['return']

// Runtime validation helpers
export const validateArgs = <T extends ChannelName>(channel: T, args: unknown[]): ChannelArgs<T> => {
  return ipcSchemas[channel].args.parse(args) as ChannelArgs<T>
}

export const validateReturn = <T extends ChannelName>(channel: T, data: unknown): ChannelReturn<T> => {
  return ipcSchemas[channel].return.parse(data) as ChannelReturn<T>
}
