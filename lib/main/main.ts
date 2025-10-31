import { app, BrowserWindow, nativeImage } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createAppWindow } from './app'
import { loadElectronLlm } from '@electron/llm'
import { join, dirname } from 'path'
import appIconPath from '@/resources/build/icon.png?asset'

// Set the app name for the menu bar (especially important on macOS)
app.setName('Inspector')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Load @electron/llm with model path configuration
  await loadElectronLlm({
    getModelPath: (modelAlias: string) => {
      // Map friendly aliases to actual filenames
      const aliasToFilename: Record<string, string> = {
        tinyllama: 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
      }

      const resolvedName = aliasToFilename[modelAlias] ?? modelAlias

      if (app.isPackaged) {
        // In production, models are in userData
        return join(app.getPath('userData'), 'models', resolvedName)
      }
      // In development, models are in app/assets/logo/slm/
      const projectRoot = join(dirname(dirname(__dirname)))
      return join(projectRoot, 'app/assets/logo/slm', resolvedName)
    }
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.inspector.app')

  if (process.platform === 'darwin' && app.dock) {
    const dockIcon = nativeImage.createFromPath(appIconPath)
    if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon)
  }
  
  // NOW create app window after LLM is loaded
  createAppWindow()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createAppWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
