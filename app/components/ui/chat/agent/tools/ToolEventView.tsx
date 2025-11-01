import React from 'react'
import { TerminalView } from './TerminalView'
import { ToolItem } from '@/app/components/ui/chat/agent/tools/types';
import { GenericView } from './GenericView'
import { ReadView } from './ReadView'
import { EditView } from './EditView'
import { LsView } from './LsView'
import { GrepView } from './GrepView'
import { detectToolType } from '@/app/components/ui/chat/agent/tools/helpers'


export const ToolEventView: React.FC<{ item: ToolItem }> = ({ item }) => {
  const toolType = detectToolType(item.label)
  const payload = item.payload
  
  switch (toolType) {
    case 'grep':
      return <GrepView item={item} payload={payload} />
    case 'read':
      return <ReadView item={item} payload={payload} />
    case 'edit':
      return <EditView item={item} payload={payload} />
    case 'ls':
      return <LsView item={item} payload={payload} />
    case 'terminal':
      return <TerminalView item={item} payload={payload} />
    default:
      return <GenericView item={item} payload={payload} />
  }
}