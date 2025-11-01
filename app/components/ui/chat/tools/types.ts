export type ToolType = 'grep' | 'read' | 'edit' | 'ls' | 'terminal' | 'unknown'

export type ToolItem = {
    kind: 'tool'
    key: string
    callId: string
    label: string
    status: 'started' | 'completed'
    payload?: unknown
}