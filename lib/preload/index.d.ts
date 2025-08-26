import { ElectronAPI } from '@electron-toolkit/preload'
import type api from './api'
import type { PreloadAPI } from './api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: PreloadAPI
  }
}
