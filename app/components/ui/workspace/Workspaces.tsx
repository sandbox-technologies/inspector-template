import Workspace from '@/app/components/ui/workspace/Workspace'
import { useTabs } from '@/app/components/window/TabsContext'
import WelcomeScreen from '@/app/components/welcome/WelcomeScreen'
import OpenProjectScreen from '@/app/components/open/OpenProjectScreen'

export default function Workspaces() {
  const { tabs, activeTabId } = useTabs()

  return (
    <div className="w-full h-full">
      {tabs.map((tab) => (
        <div key={tab.id} style={{ display: tab.id === activeTabId ? 'block' : 'none' }} className="w-full h-full">
        {tab.kind === 'welcome' ? (
            <WelcomeScreen />
          ) : tab.kind === 'open-project' ? (
            <OpenProjectScreen />
          ) : (
            <Workspace tab={tab} />
          )}
        </div>
      ))}
    </div>
  )
}


