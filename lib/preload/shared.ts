import type { ElectronAPI, IpcRenderer } from '@electron-toolkit/preload'

export default abstract class ApiContract {
  protected renderer: IpcRenderer

  constructor(electronApi: ElectronAPI) {
    this.renderer = electronApi.ipcRenderer
  }

  invoke = <T>(channel: string, ...args: any[]): Promise<T> => {
    return this.renderer.invoke(channel, ...args)
  }
}
