import { ToolType } from '@/app/components/ui/chat/tools/types';

export const getFileName = (filePath?: string): string => {
    if (!filePath) return 'Unknown file'
    const lastSlash = filePath.lastIndexOf('/')
    return lastSlash === -1 ? filePath : filePath.substring(lastSlash + 1)
  }
  
export const getDirectoryName = (path: string): string => {
    const parts = path.split('/').filter(Boolean)
    return parts.length > 0 ? parts[parts.length - 1] : path || '.'
}
  
export const getDirectoryPath = (filePath: string): string | null => {
    const lastSlash = filePath.lastIndexOf('/')
    if (lastSlash === -1) return null
    return filePath.substring(0, lastSlash)
}

export const detectToolType = (label: string): ToolType => {
    const lower = label.toLowerCase()
    if (lower.includes('grepping') || lower.includes('grep')) return 'grep'
    if (lower.includes('reading') || lower.includes('read')) return 'read'
    if (lower.includes('editing') || lower.includes('edit')) return 'edit'
    if (lower.includes('listing') || lower.includes('list')) return 'ls'
    if (lower.includes('running tool') || lower.includes('running command')) return 'terminal'
    return 'unknown'
}