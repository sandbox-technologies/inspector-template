import { type App, webContents } from 'electron'
import { handle } from '@/lib/main/shared'
import { spawn, type ChildProcess } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import { resolve, basename } from 'path'
import { execSync } from 'child_process'
import { detect } from '@/lib/project_detection'
import { generateBranchName } from '@/lib/main/utils/branchNaming'
import { extractDevUrlFromOutput } from '@/lib/main/utils/urlParser'

// In-memory storage for active workspaces
interface WorkspaceInfo {
  child: ChildProcess
  branch: string
  worktreePath: string
  devUrl?: string
  logsBuffer: string[]
}

const activeWorkspaces = new Map<string, WorkspaceInfo>()

export const registerWorkspaceHandlers = (app: App) => {
  handle('workspace-start', async ({ projectPath, setupCommand, branchBase = 'main', clientRequestId }) => {
    const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // 1. Resolve git base branch
      let baseBranch = branchBase
      try {
        // Check if the preferred branch exists
        execSync(`git -C "${projectPath}" rev-parse --verify ${branchBase}`, { stdio: 'ignore' })
      } catch {
        // Fallback to master
        try {
          execSync(`git -C "${projectPath}" rev-parse --verify master`, { stdio: 'ignore' })
          baseBranch = 'master'
        } catch {
          // Last resort: use origin/HEAD
          baseBranch = 'origin/HEAD'
        }
      }

      // 2. Generate branch name
      const projectName = basename(projectPath)
      const branchName = generateBranchName(projectName)

      // 3. Create worktree directory
      const sanitizedBranch = branchName.replace(/[^a-zA-Z0-9-_]/g, '_')
      const worktreePath = resolve(projectPath, '..', '.inspector-worktrees', sanitizedBranch)
      
      // Ensure parent directory exists
      const worktreeParent = resolve(projectPath, '..', '.inspector-worktrees')
      if (!existsSync(worktreeParent)) {
        mkdirSync(worktreeParent, { recursive: true })
      }

      // Broadcast helper
      const broadcast = (payload: any) => {
        try {
          webContents.getAllWebContents().forEach((wc) => wc.send('workspace-progress', payload))
        } catch {
          return
        }
      }

      // 4. Create git worktree
      broadcast({ step: 'creating_worktree', clientRequestId, message: 'Creating git worktree', data: { branchName } })
      try {
        execSync(`git -C "${projectPath}" worktree add -b "${branchName}" "${worktreePath}" ${baseBranch}`, {
          stdio: 'pipe',
          encoding: 'utf-8'
        })
      } catch (error: any) {
        console.error('Failed to create git worktree:', error)
        throw new Error(`Failed to create git worktree: ${error.message}`)
      }

      broadcast({ step: 'worktree_created', clientRequestId, data: { worktreePath, branchName } })

      // 5. Get setup command if not provided
      if (!setupCommand) {
        const detection = await detect(worktreePath)
        setupCommand = detection.commands.setup
      }

      console.log(`Starting workspace ${workspaceId} in ${worktreePath}`)
      console.log(`Setup command: ${setupCommand}`)
      broadcast({ step: 'starting_dev', clientRequestId, data: { setupCommand } })

      // 6. Spawn the development process
      const child = spawn(setupCommand, [], {
        cwd: worktreePath,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          NODE_ENV: 'development',
          // Some frameworks need these to bind to all interfaces
          HOST: '0.0.0.0',
          HOSTNAME: '0.0.0.0'
        }
      })

      // Initialize workspace info
      const workspaceInfo: WorkspaceInfo = {
        child,
        branch: branchName,
        worktreePath,
        logsBuffer: []
      }

      activeWorkspaces.set(workspaceId, workspaceInfo)

      // 7. Set up URL detection
      return new Promise<{ workspaceId: string; branch: string; worktreePath: string; devUrl: string }>((resolve, reject) => {
        const TIMEOUT_MS = 120000 // Increased to 2 minutes
        const timeout = setTimeout(() => {
          console.error(`Timeout waiting for dev server to start after ${TIMEOUT_MS/1000}s`)
          console.error('Last 50 logs:')
          workspaceInfo.logsBuffer.slice(-50).forEach(log => console.error(log))
          
          child.kill()
          activeWorkspaces.delete(workspaceId)
          reject(new Error(`Timeout waiting for dev server to start (${TIMEOUT_MS/1000}s). Check the main process console for logs.`))
        }, TIMEOUT_MS)

        const processOutput = (data: Buffer) => {
          const lines = data.toString().split('\n')
          for (const line of lines) {
            // Store logs
            workspaceInfo.logsBuffer.push(line)
            if (workspaceInfo.logsBuffer.length > 1000) {
              workspaceInfo.logsBuffer.shift()
            }

            // Log output for debugging
            if (line.trim()) {
              console.log(`[${workspaceId}] ${line}`)
            }

            // Try to extract URL
            const url = extractDevUrlFromOutput(line)
            if (url && !workspaceInfo.devUrl) {
              console.log(`Found dev server URL: ${url}`)
              clearTimeout(timeout)
              workspaceInfo.devUrl = url
              
              // Add a small delay to ensure the server is ready
              setTimeout(() => {
                console.log(`Resolving workspace with URL: ${url}`)
                broadcast({ step: 'dev_ready', clientRequestId, workspaceId, data: { devUrl: url } })
                resolve({
                  workspaceId,
                  branch: branchName,
                  worktreePath,
                  devUrl: url
                })
              }, 1000)
            }
          }
        }

        child.stdout?.on('data', processOutput)
        child.stderr?.on('data', processOutput)

        child.on('error', (error) => {
          clearTimeout(timeout)
          activeWorkspaces.delete(workspaceId)
          reject(new Error(`Failed to start dev server: ${error.message}`))
        })

        child.on('exit', (code) => {
          clearTimeout(timeout)
          activeWorkspaces.delete(workspaceId)
          if (!workspaceInfo.devUrl) {
            const lastLogs = workspaceInfo.logsBuffer.slice(-20).join('\n')
            reject(new Error(`Dev server exited with code ${code} before URL was detected. Last logs:\n${lastLogs}`))
          }
        })
        
        // Log status after 10 seconds if no URL detected yet
        setTimeout(() => {
          if (!workspaceInfo.devUrl) {
            console.log('No URL detected after 10s, still waiting...')
            console.log('Recent logs:', workspaceInfo.logsBuffer.slice(-10).join('\n'))
          }
        }, 10000)
      })
    } catch (error: any) {
      activeWorkspaces.delete(workspaceId)
      throw error
    }
  })

  handle('workspace-stop', async ({ workspaceId }) => {
    const workspace = activeWorkspaces.get(workspaceId)
    if (!workspace) {
      return { success: false }
    }

    // Kill the child process
    if (workspace.child && !workspace.child.killed) {
      workspace.child.kill('SIGTERM')
      
      // Give it a moment to clean up, then force kill if needed
      setTimeout(() => {
        if (!workspace.child.killed) {
          workspace.child.kill('SIGKILL')
        }
      }, 5000)
    }

    activeWorkspaces.delete(workspaceId)
    return { success: true }
  })

  handle('workspace-logs', async ({ workspaceId }) => {
    const workspace = activeWorkspaces.get(workspaceId)
    if (!workspace) {
      return { logs: [`Workspace ${workspaceId} not found`] }
    }
    
    return { logs: workspace.logsBuffer }
  })

  // Clean up on app quit
  app.on('before-quit', () => {
    for (const [workspaceId, workspace] of activeWorkspaces) {
      if (workspace.child && !workspace.child.killed) {
        workspace.child.kill('SIGTERM')
      }
    }
  })
}
