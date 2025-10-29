import { useTabs } from '@/app/components/window/TabsContext'

interface StartWorkspaceOptions {
  projectPath: string
  setupCommand: string
}

/**
 * Start a new workspace for a project by:
 * 1. Creating a git worktree and branch
 * 2. Running the setup command
 * 3. Opening a new tab with the dev server URL
 */
export async function startWorkspaceForProject({ projectPath, setupCommand }: StartWorkspaceOptions) {
  try {
    // Call the workspace start IPC
    const result = await (window as any).conveyor.workspace.start({
      projectPath,
      setupCommand
    }) as {
      workspaceId: string
      branch: string
      worktreePath: string
      devUrl: string
    }

    // Get the tab management functions
    // Note: This needs to be called from within a React component
    // We'll return the result and let the component handle the tab creation
    return {
      success: true,
      ...result
    }
  } catch (error: any) {
    console.error('Failed to start workspace:', error)
    return {
      success: false,
      error: error.message || 'Failed to start workspace'
    }
  }
}

/**
 * Hook version that can directly create tabs
 * Must be used within a React component
 */
export function useStartWorkspace() {
  const { addTab, updateTab, beginOpeningTab, endOpeningTab } = useTabs()

  const startWorkspace = async ({ projectPath, setupCommand }: StartWorkspaceOptions) => {
    try {
      const result = await (window as any).conveyor.workspace.start({
        projectPath,
        setupCommand
      }) as {
        workspaceId: string
        branch: string
        worktreePath: string
        devUrl: string
      }

      // Create a new workspace tab with all the necessary metadata
      // Start with a blank page, we'll navigate to the URL after a delay
      const tabId = addTab({
        title: 'Starting development server...',
        url: '', // Start with empty URL
        kind: 'workspace' as const,
        workspaceId: result.workspaceId,
        git: {
          branch: result.branch,
          worktreePath: result.worktreePath
        }
      })
      beginOpeningTab(tabId)
      
      // Wait a bit for the server to be fully ready, then navigate
      // This gives frameworks time to compile and start serving
      setTimeout(() => {
        updateTab(tabId, {
          title: 'Loading...',
          url: result.devUrl
        })
        endOpeningTab()
      }, 2000)

      return {
        success: true,
        tabId,
        ...result
      }
    } catch (error: any) {
      console.error('Failed to start workspace:', error)
      endOpeningTab()
      return {
        success: false,
        error: error.message || 'Failed to start workspace'
      }
    }
  }

  return startWorkspace
}
