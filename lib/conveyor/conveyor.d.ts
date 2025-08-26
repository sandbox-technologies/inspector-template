import type { ElectronAPI } from '@electron-toolkit/preload'
import type { AppApi } from '@/lib/conveyor/api/app-api'
import type { WindowApi } from '@/lib/conveyor/api/window-api'

declare global {
  interface Window {
    electron: ElectronAPI
    conveyor: {
      app: AppApi
      window: WindowApi
    }
  }
}
