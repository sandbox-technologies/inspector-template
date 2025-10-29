import { electronAPI } from '@electron-toolkit/preload'
import { AppApi } from './app-api'
import { WindowApi } from './window-api'
import { WorkspaceApi } from './workspace-api'

export const conveyor = {
  app: new AppApi(electronAPI),
  window: new WindowApi(electronAPI),
  workspace: new WorkspaceApi(electronAPI),
}

export type ConveyorApi = typeof conveyor
