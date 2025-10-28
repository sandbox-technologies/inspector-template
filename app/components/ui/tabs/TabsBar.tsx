import { LayoutGroup, Reorder, motion } from 'framer-motion'
import { useTabs } from '../../window/TabsContext'
import { useState } from 'react'
import Tooltip from '../tooltip'

export const TabsBar = () => {
  const { tabs, activeTabId, addTab, setActiveTab, reorderTabs, removeTab } = useTabs()
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null)

  return (
    <LayoutGroup id="tabs">
      <Reorder.Group 
        axis="x" 
        values={tabs} 
        onReorder={reorderTabs} 
        className="window-titlebar-menu"
        style={{ display: 'flex', gap: '6px', width: '100%' }}
      >
        <div style={{ display: 'flex', gap: '6px', flex: '0 1 90%', minWidth: 0 }}>
          {tabs.map(tab => (
            <Reorder.Item 
              key={tab.id} 
              value={tab} 
              className="tab" 
              data-active={tab.id === activeTabId}
              whileDrag={{ opacity: 0.8 }}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredTabId(tab.id)}
              onMouseLeave={() => setHoveredTabId(null)}
            >
            {tab.id === activeTabId && (
              <motion.div 
                layoutId="active-pill" 
                className="tab-active-bg"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '6px',
                  zIndex: -1
                }}
              />
            )}
            <div 
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                position: 'relative', 
                zIndex: 1,
                pointerEvents: 'auto',
                cursor: 'pointer',
                width: '100%',
                minWidth: 0
              }}
            >
              <Tooltip 
                title={tab.title || 'New Tab'} 
                description={tab.url && tab.url.length > 0 ? tab.url : ''}
                fullWidth
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', minWidth: 0 }}>
                  <div className="tab-favicon">
                    {/* Placeholder favicon - you can replace with actual favicon */}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                      <circle cx="5" cy="5" r="4" opacity="0.3"/>
                    </svg>
                  </div>
                  <span className="tab-title">{tab.title}</span>
                </div>
              </Tooltip>
              {hoveredTabId === tab.id && tabs.length > 1 && (
                <button 
                  className="tab-close"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTab(tab.id)
                  }}
                  aria-label="Close tab"
                >
                  <svg width="12" height="12" viewBox="0 0 8 8" fill="currentColor">
                    <path d="M4.7 4l2.15-2.15a.5.5 0 0 0-.7-.7L4 3.29 1.85 1.15a.5.5 0 1 0-.7.7L3.29 4 1.15 6.15a.5.5 0 0 0 .7.7L4 4.71l2.15 2.14a.5.5 0 0 0 .7-.7L4.71 4z"/>
                  </svg>
                </button>
              )}
            </div>
            </Reorder.Item>
          ))}
          <button className="tab-add" onClick={addTab}>+</button>
        </div>
      </Reorder.Group>
    </LayoutGroup>
  )
}
