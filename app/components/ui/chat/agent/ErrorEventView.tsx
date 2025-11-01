import React from 'react'

export type ErrorItem = {
  kind: 'error'
  key: string
  message: string
}

export const ErrorEventView: React.FC<{ item: ErrorItem }> = ({ item }) => (
  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
    <span className="font-medium">Error:</span> {item.message}
  </div>
)

