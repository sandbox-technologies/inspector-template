import Workspace from '@/app/components/ui/workspace/Workspace'
import { useTabs } from '@/app/components/window/TabsContext'

export default function Workspaces() {
  const { tabs, activeTabId } = useTabs()

  return (
    <div className="w-full h-full">
      {tabs.map((tab) => (
        <div key={tab.id} style={{ display: tab.id === activeTabId ? 'block' : 'none' }} className="w-full h-full">
          <Workspace tab={tab} />
        </div>
      ))}
    </div>
  )
}


