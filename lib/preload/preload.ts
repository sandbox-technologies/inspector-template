import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { WindowAPI } from '@/lib/ipc/api/window.api'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {
      window: new WindowAPI(electronAPI),
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = {
    window: new WindowAPI(electronAPI),
  }
}
