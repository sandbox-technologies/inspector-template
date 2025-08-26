import type { ElectronAPI } from '@electron-toolkit/preload'
import type { WindowApi } from '@/lib/ipc/api/window-api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      window: WindowApi
    }
  }
}
