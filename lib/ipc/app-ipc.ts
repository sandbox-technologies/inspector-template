import type { BrowserWindow } from 'electron'
import { handle } from '../main/shared'

export const AppIpcRegistrar = (_window: BrowserWindow) => {
  // App operations
  handle('version', () => {
    return require('../../package.json').version
  })
}
