import logo from '@/app/assets/logo/logo.png'
import { CopyPlus, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import ProjectDetectionScreen from '@/app/components/open/project_detection_screen/ProjectDetectionScreen'

export default function OpenProjectScreen() {
  const [selectedProjectPath, setSelectedProjectPath] = useState<string | null>(null)

  const handleOpenProject = async () => {
    const result = await (window as any).conveyor.app.selectProject() as { success: boolean; path: string | null }
    if (result.success && result.path) {
      setSelectedProjectPath(result.path)
    }
  }

  // If a project is selected, show the detection screen
  if (selectedProjectPath) {
    return <ProjectDetectionScreen projectPath={selectedProjectPath} onBack={() => setSelectedProjectPath(null)} />
  }

  return (
    <div className="pane-surface h-full w-full rounded-md flex items-center justify-center p-16">
      <div className="max-w-2xl w-full">
        {/* Brand */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Inspector" className="w-12 h-12 object-contain" />
            <div className="text-4xl sm:text-5xl font-medium tracking-tight">Inspector</div>
          </div>
          <div className="mt-2 text-sm opacity-80 flex items-center gap-2">
            <span>Business</span>
            <span>·</span>
            <button className="underline-offset-4 hover:underline cursor-pointer">Settings</button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-4 mb-10 flex-wrap items-start">
          <ActionCard title="Open project" description="" icon={FolderOpen} onClick={handleOpenProject} />
          <ActionCard title="Clone repo" description="" icon={CopyPlus} />
        </div>

        {/* Recent projects - single list with right-side meta */}
        <div className="text-sm">
          <div className="flex items-center justify-between mb-3 pr-3 text-sm">
            <div>Recent projects</div>
            <button className="underline-offset-4 hover:underline cursor-pointer opacity-80">View all (36)</button>
          </div>
          <ul className="space-y-2">
            <li><ProjectPill title="inspector-template" meta="~" /></li>
            <li><ProjectPill title="inspector-vscode" meta="~" /></li>
            <li><ProjectPill title="window-dot-dev" meta="~" /></li>
            <li><ProjectPill title="dev (Workspace)" meta="~/inspector" /></li>
            <li><ProjectPill title="inspector" meta="~" /></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ title, description, icon: Icon, onClick }: { title: string; description?: string; icon: React.ComponentType<any>; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="group relative rounded-lg text-left bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors box-border w-[185px] h-[85px] px-4 py-3 cursor-pointer">
      <div className="flex flex-col items-start gap-2 h-full">
        <div className="flex items-center justify-center text-black/70 dark:text-white/70">
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <div className="font-medium">{title}</div>
      </div>
      {description && <div className="mt-1 text-xs opacity-70">{description}</div>}
    </button>
  )
}

// Using Lucide icons (imported at top); no local inline icon components needed.

function ProjectPill({ title, meta }: { title: string; meta?: string }) {
  return (
    <button className="w-full rounded-lg px-3 py-2 -ml-3 transition-colors bg-transparent hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
      <div className="flex items-center justify-between">
        <span>{title}</span>
        {meta && <span className="opacity-80">{meta}</span>}
      </div>
    </button>
  )
}


