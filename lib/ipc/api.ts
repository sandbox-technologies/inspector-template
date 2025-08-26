import { electronAPI } from '@electron-toolkit/preload'
import { AppAPI } from './api/app-api'
import { WindowAPI } from './api/window-api'

export const api = {
  app: new AppAPI(electronAPI),
  window: new WindowAPI(electronAPI),
}
