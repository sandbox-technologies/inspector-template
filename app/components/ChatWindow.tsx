import React from 'react'
import { Settings, History, LogOut } from 'lucide-react'
import { ChatInput } from './ui/chat/ChatInput'
import { Button } from './ui/button'

export const ChatWindow: React.FC = () => {
  const [inputValue, setInputValue] = React.useState('')

  const handleSend = () => {
    if (inputValue.trim()) {
      // Handle send logic here
      setInputValue('')
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-neutral-50 dark:bg-neutral-900 rounded-2xl overflow-hidden relative">
      {/* Header with icons only */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/50">
              <LogOut className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/50">
              <History className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/50">
              <Settings className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Chat messages will go here */}
      </div>

        <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
        />
    </div>
  )
}
