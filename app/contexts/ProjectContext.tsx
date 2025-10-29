import { createContext, useContext, useState, ReactNode } from 'react'

interface ProjectContextType {
  selectedProjectPath: string | null
  setSelectedProjectPath: (path: string | null) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectPath, setSelectedProjectPath] = useState<string | null>(null)

  return (
    <ProjectContext.Provider value={{ selectedProjectPath, setSelectedProjectPath }}>
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
