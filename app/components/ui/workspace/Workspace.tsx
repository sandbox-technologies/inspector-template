import BrowserFrame from '@/app/components/ui/browser/BrowserFrame'
import { ChatWindow } from '@/app/components/ChatWindow'
import TwoPaneLayout from '@/app/components/ui/chat/TwoPaneLayout'
import type { Tab } from '@/app/components/window/TabsContext'

export default function Workspace({ tab }: { tab: Tab }) {
  return (
    <TwoPaneLayout
      rightContent={<ChatWindow />}
      leftContent={
        <BrowserFrame
          tabId={tab.id}
          partitionId={tab.partitionId}
          initialUrl={tab.url && tab.url.length > 0 ? tab.url : 'http://localhost:3000'}
        />
      }
    />
  )
}