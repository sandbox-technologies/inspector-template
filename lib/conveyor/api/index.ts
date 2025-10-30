import { electronAPI } from '@electron-toolkit/preload'
import { AppApi } from './app-api'
import { WindowApi } from './window-api'
import { WorkspaceApi } from './workspace-api'
import { AgentApi } from './agent-api'

export const conveyor = {
  app: new AppApi(electronAPI),
  window: new WindowApi(electronAPI),
  workspace: new WorkspaceApi(electronAPI),
  agent: new AgentApi(electronAPI),
}

export type ConveyorApi = typeof conveyor
