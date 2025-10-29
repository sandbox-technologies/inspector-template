import { type App, dialog, BrowserWindow, OpenDialogOptions, OpenDialogReturnValue } from 'electron'
import { handle } from '@/lib/main/shared'
import { detect } from '@/lib/project_detection'

export const registerAppHandlers = (app: App) => {
  // App operations
  handle('version', () => app.getVersion())
  
  // File operations
  handle('select-project', async () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    
    const options: OpenDialogOptions = {
      title: 'Select Project Folder',
      buttonLabel: 'Open',
      properties: ['openDirectory', 'createDirectory'] as OpenDialogOptions['properties']
    }
    
    const result: OpenDialogReturnValue = focusedWindow 
      ? await dialog.showOpenDialog(focusedWindow, options)
      : await dialog.showOpenDialog(options)
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, path: result.filePaths[0] }
    }
    
    return { success: false, path: null }
  })
  
  // Project detection
  handle('detect-project', async (projectPath: string) => {
    try {
      const result = await detect(projectPath)
      return result
    } catch (error) {
      console.error('Error detecting project:', error)
      throw error
    }
  })
}
