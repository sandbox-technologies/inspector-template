import type { ElectronAPI } from '@electron-toolkit/preload'
import type { WindowAPI } from '@/lib/ipc/api/window-api'
import type { IPCChannels, ChannelName } from '../ipc/schemas'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      window: WindowAPI
    }
  }
}
