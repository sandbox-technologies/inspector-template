import React from 'react'

export type LogItem = {
  kind: 'log'
  key: string
  text: string
  source: string
}

export const LogEventView: React.FC<{ item: LogItem }> = ({ item }) => (
  <div className="mb-2 text-xs text-neutral-400 dark:text-neutral-500">
    [{item.source}] {item.text}
  </div>
)

