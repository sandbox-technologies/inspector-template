import { createContext, useContext, useState, ReactNode } from 'react'
import type { DetectResult } from '@/lib/project_detection'

interface ProjectContextType {
  /**
   * Path selected in the Open Project flow. Used to run detection.
   */
  selectedProjectPath: string | null
  setSelectedProjectPath: (path: string | null) => void
  /**
   * The detected project that the whole app should use.
   * Set during the Open Project flow and used for new tabs.
   */
  project: DetectResult | null
  setProject: (project: DetectResult | null) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectPath, setSelectedProjectPath] = useState<string | null>(null)
  const [project, setProject] = useState<DetectResult | null>(null)

  return (
    <ProjectContext.Provider value={{ 
      selectedProjectPath, 
      setSelectedProjectPath,
      project,
      setProject
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
