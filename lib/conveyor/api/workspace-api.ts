import { ConveyorApi } from '@/lib/preload/shared'

export class WorkspaceApi extends ConveyorApi {
  start = (options: {
    projectPath: string
    setupCommand?: string
    branchBase?: string
  }) => this.invoke('workspace-start', options)
  
  stop = (options: { workspaceId: string }) => 
    this.invoke('workspace-stop', options)
    
  logs = (options: { workspaceId: string }) => 
    this.invoke('workspace-logs', options)
}
