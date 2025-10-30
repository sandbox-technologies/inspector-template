import React from 'react'

interface SentMessageProps {
  text: string
  className?: string
}

export const SentMessage: React.FC<SentMessageProps> = ({ text, className }) => {
  return (
    <div className={`w-full self-start rounded-2xl bg-white border border-[#ECEDED] shadow-sm px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700 ${className || ''}`}>
      <div className="text-sm text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap">{text}</div>
    </div>
  )
}


