import { ConveyorApi } from '@/lib/preload/shared'

export class AgentApi extends ConveyorApi {
  start = (options: {
    cwdPath: string
    prompt: string
    force?: boolean
    streamPartial?: boolean
    runId?: string
  }) => this.invoke('agent-start', {
    cwdPath: options.cwdPath,
    prompt: options.prompt,
    force: options.force ?? true,
    streamPartial: options.streamPartial ?? true,
    runId: options.runId
  })
  
  cancel = (options: { runId: string }) => 
    this.invoke('agent-cancel', options)
    
  undo = (options: { cwdPath: string; files: string[] }) => 
    this.invoke('agent-undo', options)

  onStream = (
    listener: (payload: {
      runId: string
      type?: string
      subtype?: string
      message?: any
      tool_call?: any
      exitCode?: number
      changedFiles?: string[]
      cancelled?: boolean
      error?: string
    }) => void
  ) => this.on('agent-stream', listener)
}
