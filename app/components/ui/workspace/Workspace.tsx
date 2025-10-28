import BrowserFrame from '@/app/components/ui/browser/BrowserFrame'
import { ChatWindow } from '@/app/components/ChatWindow'
import  TwoPaneLayout from '@/app/components/ui/chat/TwoPaneLayout'

export default function Workspace() {
  return (
    <TwoPaneLayout rightContent={<ChatWindow />} leftContent={<BrowserFrame />} />
  )
}