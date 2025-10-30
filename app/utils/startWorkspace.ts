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
    // Create and activate a new tab immediately so the user switches right away
    const tabId = addTab({
      title: 'Starting development server...',
      url: '',
      kind: 'workspace' as const,
      setupCommand
    })
    beginOpeningTab(tabId)

    try {
      const result = await (window as any).conveyor.workspace.start({
        projectPath,
        setupCommand,
        clientRequestId: tabId
      }) as {
        workspaceId: string
        branch: string
        worktreePath: string
        devUrl: string
      }

      // Wait a bit for the server to be fully ready, then update the tab
      setTimeout(() => {
        updateTab(tabId, {
          title: 'Loading...',
          url: result.devUrl,
          workspaceId: result.workspaceId,
          git: {
            branch: result.branch,
            worktreePath: result.worktreePath
          }
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
      // Convert the just-created tab into an Open Project tab instead of creating a duplicate
      updateTab(tabId, {
        title: 'Open Project',
        url: '',
        kind: 'open-project'
      })
      endOpeningTab()
      return {
        success: false,
        error: error.message || 'Failed to start workspace'
      }
    }
  }

  return startWorkspace
}
