import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

interface TwoPaneLayoutProps {
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
}

export default function TwoPaneLayout({ 
  leftContent = (
    <>
      <h2 className="text-lg font-semibold">Left Pane</h2>
      <p className="mt-2 text-gray-600">This is the left pane content (placeholder)</p>
    </>
  ),
  rightContent = (
    <>
      <h2 className="text-lg font-semibold">Right Pane</h2>
      <p className="mt-2 text-gray-600">This is the right pane content (placeholder)</p>
    </>
  )
}: TwoPaneLayoutProps) {
  return (
    <div className="rounded-md overflow-hidden pane-surface">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full rounded-l-md">
            {leftContent}
          </div>
        </Panel>
        
        <PanelResizeHandle className="group relative w-4 pane-resize-bar cursor-col-resize">
          <div className="absolute inset-0 w-full flex items-center justify-center py-4">
            <div className="w-1 h-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'var(--window-c-separator)' }} />
          </div>
        </PanelResizeHandle>
        
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full rounded-r-md">
            {rightContent}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}
