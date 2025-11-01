import Workspace from '@/app/components/ui/workspace/Workspace'
import { useTabs } from '@/app/components/window/TabsContext'
import WelcomeScreen from '@/app/components/welcome/WelcomeScreen'
import OpenProjectFlow from '@/app/components/open/OpenProjectFlow'
// import LocalLanguageModelsDebugger from '@/app/components/dev/LocalLanguageModelsDebugger' // UNCOMMENT FOR DEV IF YOU WANT TO DEBUG A LOCAL LANGUAGE MODEL

export default function Workspaces() {
  const { tabs, activeTabId } = useTabs()

  return (
    <div className="w-full h-full">
      {tabs.map((tab) => (
        <div key={tab.id} style={{ display: tab.id === activeTabId ? 'block' : 'none' }} className="w-full h-full">
        {tab.kind === 'welcome' ? (
            <WelcomeScreen />
          ) : tab.kind === 'open-project' ? (
            <OpenProjectFlow /> )
          // UNCOMMENT FOR DEV IF YOU WANT TO DEBUG A LOCAL LANGUAGE MODEL
          // : tab.kind === 'ai-debugger' ? (
          //   <LocalLanguageModelsDebugger />
          // ) 
          : (
            <Workspace tab={tab} />
          )}
        </div>
      ))}
    </div>
  )
}
