import { electronAPI } from '@electron-toolkit/preload'
import { AppApi } from './app-api'
import { WindowApi } from './window-api'

export const api = {
  app: new AppApi(electronAPI),
  window: new WindowApi(electronAPI),
  electron: electronAPI,
}
