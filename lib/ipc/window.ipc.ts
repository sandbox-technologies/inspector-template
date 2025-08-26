import type { BrowserWindow } from 'electron'
import { shell } from 'electron'
import { handleIPC } from '../main/shared'
import { electronAPI } from '@electron-toolkit/preload'

export class WindowIPC {
  static register = (window: BrowserWindow) => {
    // Define the IPC channels
    handleIPC('window-init', () => {
      const { width, height } = window.getBounds()
      const minimizable = window.isMinimizable()
      const maximizable = window.isMaximizable()
      const platform = electronAPI.process.platform

      return { width, height, minimizable, maximizable, platform }
    })

    handleIPC('window-is-minimizable', () => window.isMinimizable())
    handleIPC('window-is-maximizable', () => window.isMaximizable())
    handleIPC('window-minimize', () => window.minimize())
    handleIPC('window-maximize', () => window.maximize())
    handleIPC('window-close', () => window.close())
    handleIPC('window-maximize-toggle', () => (window.isMaximized() ? window.unmaximize() : window.maximize()))

    // Web content operations
    const webContents = window.webContents
    handleIPC('web-undo', () => webContents.undo())
    handleIPC('web-redo', () => webContents.redo())
    handleIPC('web-cut', () => webContents.cut())
    handleIPC('web-copy', () => webContents.copy())
    handleIPC('web-paste', () => webContents.paste())
    handleIPC('web-delete', () => webContents.delete())
    handleIPC('web-select-all', () => webContents.selectAll())
    handleIPC('web-reload', () => webContents.reload())
    handleIPC('web-force-reload', () => webContents.reloadIgnoringCache())
    handleIPC('web-toggle-devtools', () => webContents.toggleDevTools())
    handleIPC('web-actual-size', () => webContents.setZoomLevel(0))
    handleIPC('web-zoom-in', () => webContents.setZoomLevel(webContents.zoomLevel + 0.5))
    handleIPC('web-zoom-out', () => webContents.setZoomLevel(webContents.zoomLevel - 0.5))
    handleIPC('web-toggle-fullscreen', () => window.setFullScreen(!window.fullScreen))
    handleIPC('web-open-url', (url: string) => shell.openExternal(url))
  }
}
