import type { ElectronAPI } from '@electron-toolkit/preload'
import type { WindowApi } from '@/lib/ipc/api/window-api'
import type { IPCChannels, ChannelName } from '../ipc/schemas'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      window: WindowApi
    }
  }
}
