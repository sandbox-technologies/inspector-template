import { electronAPI } from '@electron-toolkit/preload'
import { AppAPI } from './app-api'
import { WindowAPI } from './window-api'

export const api = {
  app: new AppAPI(electronAPI),
  window: new WindowAPI(electronAPI),
}
