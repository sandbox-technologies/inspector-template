import { type App, webContents } from 'electron'
import { handle } from '@/lib/main/shared'
import { spawn, type ChildProcess } from 'child_process'
import { execSync } from 'child_process'
import { unlinkSync, existsSync } from 'fs'

// In-memory storage for active agent processes
interface AgentInfo {
  child: ChildProcess
  changedFiles: string[]
}

const activeAgents = new Map<string, AgentInfo>()

// Helper to get current git state (modified, untracked, deleted files)
function getGitState(cwdPath: string): Set<string> {
  const files = new Set<string>()
  
  try {
    // Get modified files
    const modified = execSync('git diff --name-only', { cwd: cwdPath, encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean)
    modified.forEach(f => files.add(f))
    
    // Get staged files
    const staged = execSync('git diff --staged --name-only', { cwd: cwdPath, encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean)
    staged.forEach(f => files.add(f))
    
    // Get untracked files
    const untracked = execSync('git ls-files --others --exclude-standard', { cwd: cwdPath, encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean)
    untracked.forEach(f => files.add(f))
  } catch (error) {
    console.error('Failed to get git state:', error)
  }
  
  return files
}

// Helper to compute file changes
function computeChangedFiles(before: Set<string>, after: Set<string>): string[] {
  const changed: string[] = []
  
  // Files that are new in 'after'
  for (const file of after) {
    if (!before.has(file)) {
      changed.push(file)
    }
  }
  
  // Files that were in 'before' but modified (still in 'after')
  // These are already captured above if they remain modified
  
  return changed
}

export const registerAgentHandlers = (app: App) => {
  handle('agent-start', async ({ cwdPath, prompt, force = true, streamPartial = true, runId }) => {
    const agentRunId = runId || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Get git state before running agent
      const beforeState = getGitState(cwdPath)
      
      console.warn(`Starting agent ${agentRunId} in ${cwdPath}`)
      console.warn(`Prompt: ${prompt}`)
      
      // Build command args
      const args = ['-p']
      if (force) args.push('--force')
      // Force GPT-5 as the model for the Cursor CLI agent
      args.push('--model', 'gpt-5')
      args.push('--output-format', 'stream-json')
      if (streamPartial) args.push('--stream-partial-output')
      args.push(prompt)
      
      // Check if cursor-agent is available
      try {
        execSync('which cursor-agent', { stdio: 'ignore' })
      } catch {
        // Send error as stream event
        webContents.getAllWebContents().forEach(wc => {
          wc.send('agent-stream', {
            runId: agentRunId,
            type: 'system',
            message: 'cursor-agent not found. Please ensure Cursor CLI is installed and available in PATH.'
          })
        })
        throw new Error('cursor-agent not found')
      }
      
      // Check for API key
      if (!process.env.CURSOR_API_KEY) {
        // Send API key warning as stream event
        webContents.getAllWebContents().forEach(wc => {
          wc.send('agent-stream', {
            runId: agentRunId,
            type: 'system',
            message: 'CURSOR_API_KEY not set. Please export CURSOR_API_KEY=your_key_here before starting the app.'
          })
        })
      }
      
      // Spawn the agent process
      const child = spawn('cursor-agent', args, {
        cwd: cwdPath,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          FORCE_COLOR: '1'
        }
      })
      
      // Initialize agent info
      const agentInfo: AgentInfo = {
        child,
        changedFiles: []
      }
      
      activeAgents.set(agentRunId, agentInfo)
      
      // Process output
      const processOutput = (data: Buffer) => {
        const lines = data.toString().split('\n')
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line)
              // Forward to renderer
              webContents.getAllWebContents().forEach(wc => {
                wc.send('agent-stream', {
                  runId: agentRunId,
                  ...parsed,
                  raw: line
                })
              })
            } catch {
              // Not JSON, log it
              console.warn(`[${agentRunId}] ${line}`)
            }
          }
        }
      }
      
      child.stdout?.on('data', processOutput)
      child.stderr?.on('data', processOutput)
      
      child.on('error', (error) => {
        console.error(`Agent ${agentRunId} error:`, error)
        activeAgents.delete(agentRunId)
        
        // Send error event
        webContents.getAllWebContents().forEach(wc => {
          wc.send('agent-stream', {
            runId: agentRunId,
            type: 'result',
            error: error.message
          })
        })
      })
      
      child.on('exit', (code) => {
        console.warn(`Agent ${agentRunId} exited with code ${code}`)
        
        // Compute changed files
        const afterState = getGitState(cwdPath)
        const changedFiles = computeChangedFiles(beforeState, afterState)
        agentInfo.changedFiles = changedFiles
        
        // Send completion event with changed files
        webContents.getAllWebContents().forEach(wc => {
          wc.send('agent-stream', {
            runId: agentRunId,
            type: 'result',
            exitCode: code,
            changedFiles
          })
        })
        
        // Keep agent info for potential undo
        // activeAgents.delete(agentRunId) - Don't delete yet, needed for undo
      })
      
      return { runId: agentRunId }
    } catch (error: any) {
      activeAgents.delete(agentRunId)
      throw error
    }
  })
  
  handle('agent-cancel', async ({ runId }) => {
    const agent = activeAgents.get(runId)
    if (!agent) {
      return { success: false }
    }
    
    // Kill the child process
    if (agent.child && !agent.child.killed) {
      agent.child.kill('SIGTERM')
      
      // Send cancelled event
      webContents.getAllWebContents().forEach(wc => {
        wc.send('agent-stream', {
          runId,
          type: 'result',
          cancelled: true
        })
      })
    }
    
    activeAgents.delete(runId)
    return { success: true }
  })
  
  handle('agent-undo', async ({ cwdPath, files }) => {
    try {
      if (files.length === 0) {
        return { success: true }
      }
      
      // Separate tracked and untracked files
      const trackedFiles: string[] = []
      const untrackedFiles: string[] = []
      
      for (const file of files) {
        try {
          // Check if file is tracked by git
          execSync(`git -C "${cwdPath}" ls-files --error-unmatch "${file}"`, { stdio: 'ignore' })
          trackedFiles.push(file)
        } catch {
          // File is untracked
          untrackedFiles.push(file)
        }
      }
      
      // Restore tracked files
      if (trackedFiles.length > 0) {
        const fileList = trackedFiles.map(f => `"${f}"`).join(' ')
        execSync(`git -C "${cwdPath}" restore --staged --worktree --source=HEAD -- ${fileList}`, {
          stdio: 'pipe',
          encoding: 'utf-8'
        })
      }
      
      // Remove untracked files
      for (const file of untrackedFiles) {
        const fullPath = `${cwdPath}/${file}`
        if (existsSync(fullPath)) {
          unlinkSync(fullPath)
        }
      }
      
      console.warn(`Undid changes to ${files.length} files in ${cwdPath}`)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to undo changes:', error)
      throw new Error(`Failed to undo changes: ${error.message}`)
    }
  })
  
  // Clean up on app quit
  app.on('before-quit', () => {
    for (const [_runId, agent] of activeAgents) {
      if (agent.child && !agent.child.killed) {
        agent.child.kill('SIGTERM')
      }
    }
  })
}
