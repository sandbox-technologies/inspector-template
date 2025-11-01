import React from 'react'

import type { InspectorDataParts, InspectorDirectoryTreeNode } from '@/app/ai/types'
import { getLanguageIconData } from '@/app/utils/languageIcon'

type LsTreeViewProps = {
  data: InspectorDataParts['lsResult']
  isActive?: boolean
}

const countFiles = (node: InspectorDirectoryTreeNode): number => {
  let count = node.childrenFiles?.length ?? 0
  node.childrenDirs?.forEach((dir) => {
    count += countFiles(dir)
  })
  return count
}

const getDirectoryName = (path: string): string => {
  const parts = path.split('/').filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : path || '.'
}

export const LsTreeView: React.FC<LsTreeViewProps> = ({ data, isActive }) => {
  if (!data?.root) return null
  const basePath = data.root.absPath
  const directoryName = getDirectoryName(basePath)
  const active = isActive ?? false
  const totalFiles = countFiles(data.root)
  const title = active ? 'Listing' : 'Listed'

  return (
    <div>
      {active ? (
        <header className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span
            className="font-medium"
            style={
              active
                ? {
                    background: 'linear-gradient(90deg, #27272a 0%, #27272a 25%, #a1a1aa 50%, #27272a 75%, #27272a 100%)',
                    backgroundSize: '300% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 2s linear infinite',
                  }
                : undefined
            }
          >
            {title}
          </span>
          {' '}
          <span className="text-neutral-500 dark:text-neutral-500">
            {directoryName}
          </span>
        </header>
      ) : (
        <details
          className="group dark:border-neutral-800 border border-transparent bg-transparent open:bg-transparent dark:bg-transparent open:dark:bg-transparent focus-within:bg-transparent focus:bg-transparent hover:bg-transparent active:bg-transparent"
          style={{ backgroundColor: 'transparent' }}
        >
          <summary
            className="cursor-pointer list-none bg-transparent hover:bg-transparent focus:outline-none focus-visible:outline-none focus:bg-transparent focus-visible:bg-transparent active:bg-transparent group-open:bg-transparent"
            style={{ backgroundColor: 'transparent' }}
          >
            <header className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span>
                <span className="font-medium">{title}</span>
                {' '}
                <span className="text-neutral-500 dark:text-neutral-500">
                  {totalFiles} {totalFiles === 1 ? 'file' : 'files'} in {directoryName}
                </span>
              </span>
            </header>
          </summary>
          <div className="mt-2 max-h-64 overflow-auto text-xs text-neutral-800 dark:text-neutral-100" style={{ backgroundColor: 'transparent' }}>
            <TreeNode node={data.root} basePath={basePath} depth={0} />
          </div>
        </details>
      )}
    </div>
  )
}

type TreeNodeProps = {
  node: InspectorDirectoryTreeNode
  basePath: string
  depth: number
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, basePath, depth }) => {
  const indent = ' '.repeat(depth * 2)
  const name = depth === 0 ? '.' : node.absPath.replace(basePath, '').replace(/^\/?/, '') || '.'

  return (
    <div className="whitespace-pre">
      <div>{indent}{name}/</div>
      {node.childrenFiles?.map((file) => {
        const filePath = `${node.absPath}/${file.name}`
        const iconData = getLanguageIconData(filePath)
        const IconComponent = iconData.component
        
        return (
          <div key={`${node.absPath}-${file.name}`} className="flex items-center">
            <span className="whitespace-pre">{indent}  </span>
            <span className={`${iconData.colorClass} flex-shrink-0`}>
              {IconComponent ? (
                <IconComponent size="0.875em" className="inline-block" />
              ) : (
                iconData.fallback
              )}
            </span>
            <span className="ml-1">{file.name}</span>
          </div>
        )
      })}
      {node.childrenDirs?.map((dir) => (
        <TreeNode key={dir.absPath} node={dir} basePath={basePath} depth={depth + 1} />
      ))}
    </div>
  )
}


