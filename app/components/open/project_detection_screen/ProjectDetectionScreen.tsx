import { useState, useEffect, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { DetectResult } from '@/lib/project_detection'
import { useProject } from '@/app/contexts/ProjectContext'
import { useStartWorkspace } from '@/app/utils/startWorkspace'

interface ProjectDetectionScreenProps {
  projectPath: string
  onBack?: () => void
}

export default function ProjectDetectionScreen({ projectPath, onBack }: ProjectDetectionScreenProps) {
  const { setLastDetectionResult } = useProject()
  const startWorkspace = useStartWorkspace()
  const [projectData, setProjectData] = useState<DetectResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [showName, setShowName] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showFrameworks, setShowFrameworks] = useState(false)
  const [showGetStarted, setShowGetStarted] = useState(false)
  const [showCommand, setShowCommand] = useState(false)
  const [isStartingWorkspace, setIsStartingWorkspace] = useState(false)
  const exitTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const detectProject = async () => {
      try {
        setIsLoading(true)
        const result = await (window as any).conveyor.app.detectProject(projectPath) as DetectResult
        setProjectData(result)
        // Store the detection result for reuse in new tabs
        setLastDetectionResult(result)
      } catch (err) {
        console.error('Error detecting project:', err)
        setError('Failed to detect project details')
      } finally {
        setIsLoading(false)
      }
    }

    detectProject()
  }, [projectPath, setLastDetectionResult])

  // Clean up pending exit timer on unmount
  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current != null) {
        window.clearTimeout(exitTimeoutRef.current)
      }
    }
  }, [])

  const handleBackClick = () => {
    if (!onBack || isExiting) return
    setIsExiting(true)
    exitTimeoutRef.current = window.setTimeout(() => {
      onBack?.()
    }, 300)
  }

  const handleStartWorkspace = async () => {
    if (!projectData || isStartingWorkspace) return
    
    setIsStartingWorkspace(true)
    try {
      console.log('Starting workspace for project:', projectData.packagePath)
      console.log('Setup command:', projectData.commands.setup)
      
      const result = await startWorkspace({
        projectPath: projectData.packagePath,
        setupCommand: projectData.commands.setup
      })
      
      console.log('Workspace start result:', result)
      
      if (result.success && 'workspaceId' in result) {
        console.log('Workspace started successfully with:', {
          workspaceId: result.workspaceId,
          devUrl: result.devUrl,
          tabId: result.tabId
        })
      } else if (!result.success) {
        console.error('Failed to start workspace:', result.error)
        // TODO: Show error to user
      }
      // If successful, the tab will be created and switched to automatically
    } catch (error) {
      console.error('Error starting workspace:', error)
    } finally {
      setIsStartingWorkspace(false)
    }
  }

  // Animate sections in sequence once data is ready
  useEffect(() => {
    if (isLoading || !projectData) return

    // reset
    setShowName(false)
    setShowDescription(false)
    setShowFrameworks(false)
    setShowGetStarted(false)
    setShowCommand(false)

    let cancelled = false
    const timers: number[] = []
    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => { if (!cancelled) fn() }, delay)
      timers.push(id)
    }

    schedule(() => setShowName(true), 120)
    schedule(() => setShowDescription(true), 260)
    schedule(() => setShowFrameworks(true), 380)
    schedule(() => setShowGetStarted(true), 520)
    schedule(() => setShowCommand(true), 680)

    return () => {
      cancelled = true
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [isLoading, projectData])

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-16">
        <div className="max-w-2xl w-full text-center">
          <div className="text-lg text-black/60 dark:text-white/60">Analyzing project...</div>
        </div>
      </div>
    )
  }

  if (error || !projectData) {
    return (
      <div className="h-full w-full flex items-center justify-center p-16">
        <div className="max-w-2xl w-full text-center">
          <div className="text-lg text-red-600 dark:text-red-400">{error || 'No project data found'}</div>
        </div>
      </div>
    )
  }

  // Format frameworks for display
  const frameworkDisplay = projectData.frameworks.length > 0 
    ? projectData.frameworks.map(f => f.name).join(', ')
    : 'No framework detected'


  return (
    <div className={`h-full w-full flex items-center justify-center p-16 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-2xl w-full">
        {/* Back button */}
        {onBack && (
          <button 
            onClick={handleBackClick}
            className="mb-6 flex items-center gap-1 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
        )}

        {/* Framework Detection */}
        <div className="mb-8 space-y-2">
          <div className={`text-2xl font-medium transition-all duration-500 ${showName ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {projectData.name}
          </div>
          {projectData.description && (
            <div className={`text-sm opacity-80 text-black/70 dark:text-white/70 mt-4 transition-all duration-500 ${showDescription ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              {projectData.description}
            </div>
          )}
          <div className={`text-sm opacity-80 text-black/70 dark:text-white/70 mt-4 transition-all duration-500 ${showFrameworks ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {frameworkDisplay}
          </div>
        </div>

        {/* Build Section */}
        <div className="mt-12 space-y-4">
          <div className={`text-lg font-medium transition-all duration-500 ${showGetStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>Get started</div>
          <div className={`relative bg-black/5 dark:bg-white/5 rounded-lg p-4 pr-16 font-mono text-sm text-left flex items-center transition-all duration-500 ${showCommand ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <span className="flex-1">{projectData.commands.setup}</span>
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black rounded-lg flex items-center justify-center hover:scale-102 transition-all cursor-pointer p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Start workspace"
              onClick={handleStartWorkspace}
              disabled={isStartingWorkspace}
            >
              <svg viewBox="0 0 256 233" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M232.834 90.9076C257.553 102.143 257.508 137.232 232.762 147.688L47.4717 225.977C23.2269 236.22 -2.29044 213.153 5.40285 187.947L24.2485 126.202C26.5116 118.788 26.4953 110.834 24.2007 103.363L5.90671 43.8016C-1.9232 18.3086 23.7004 -4.15139 48.0087 6.89742L232.834 90.9076Z" fill="white" stroke="black" strokeWidth="8"/>
              </svg>
            </button>
          </div>
        <div className="text-xs opacity-60 mt-2" style={{ fontSize: '11px' }}>
        Inspector runs this command to create a new development environment and Git branch each time you open a new tab, letting you work on multiple front-end features at once in isolation.
        </div>
        </div>

      </div>
    </div>
  )
}
