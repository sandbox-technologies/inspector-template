import { createContext, useContext, useState, ReactNode } from 'react'
import type { DetectResult } from '@/lib/project_detection'

interface ProjectContextType {
  selectedProjectPath: string | null
  setSelectedProjectPath: (path: string | null) => void
  lastDetectionResult: DetectResult | null
  setLastDetectionResult: (result: DetectResult | null) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectPath, setSelectedProjectPath] = useState<string | null>(null)
  const [lastDetectionResult, setLastDetectionResult] = useState<DetectResult | null>(null)

  return (
    <ProjectContext.Provider value={{ 
      selectedProjectPath, 
      setSelectedProjectPath,
      lastDetectionResult,
      setLastDetectionResult 
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
