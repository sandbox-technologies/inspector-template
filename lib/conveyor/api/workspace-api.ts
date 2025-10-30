import { ConveyorApi } from '@/lib/preload/shared'

export class WorkspaceApi extends ConveyorApi {
  start = (options: {
    projectPath: string
    setupCommand?: string
    branchBase?: string
    clientRequestId?: string
  }) => this.invoke('workspace-start', { ...options, branchBase: options.branchBase ?? 'main' })
  
  stop = (options: { workspaceId: string }) => 
    this.invoke('workspace-stop', options)
    
  logs = (options: { workspaceId: string }) => 
    this.invoke('workspace-logs', options)

  onProgress = (
    listener: (payload: {
      clientRequestId?: string
      workspaceId?: string
      step: 'creating_worktree' | 'worktree_created' | 'starting_dev' | 'dev_ready'
      message?: string
      data?: Record<string, any>
    }) => void
  ) => this.on('workspace-progress', listener)
}
