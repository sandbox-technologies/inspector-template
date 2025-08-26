import type { BrowserWindow } from 'electron'
import { handle } from '@/lib/main/shared'

export const registerAppHandlers = (_window: BrowserWindow) => {
  // App operations
  handle('version', () => {
    return require('../../package.json').version
  })
}
