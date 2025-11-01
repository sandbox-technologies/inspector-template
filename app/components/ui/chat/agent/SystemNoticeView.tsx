import React from 'react'

import type { InspectorSystemNoticeLevel } from '@/app/ai/types'

export type SystemItem = {
  kind: 'system'
  key: string
  level: InspectorSystemNoticeLevel
  message: string
  runId?: string
}

export const SystemNoticeView: React.FC<{ item: SystemItem }> = ({ item }) => {
  const tone = item.level === 'error'
    ? 'text-red-600 dark:text-red-400'
    : item.level === 'warning'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-neutral-500 dark:text-neutral-400'
  return (
    <div className={`mb-2 text-xs ${tone}`}>
      [{item.level}] {item.message}
    </div>
  )
}

