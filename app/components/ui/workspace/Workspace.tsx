import BrowserFrame from '@/app/components/ui/browser/BrowserFrame'
import { ChatWindow } from '@/app/components/ui/chat/ChatWindow'
import TwoPaneLayout from '@/app/components/ui/layouts/TwoPaneLayout'
import type { Tab } from '@/app/components/window/TabsContext'

export default function Workspace({ tab }: { tab: Tab }) {
  return (
    <TwoPaneLayout
      rightContent={<ChatWindow tab={tab} />}
      leftContent={
        <BrowserFrame
          tabId={tab.id}
          partitionId={tab.partitionId}
          initialUrl={tab.url && tab.url.length > 0 ? tab.url : ''}
        />
      }
    />
  )
}