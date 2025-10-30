import { motion } from 'framer-motion'
import React from 'react'
import { Globe, FolderTree, Terminal, GitBranch, LoaderCircle } from 'lucide-react'



interface WorkspaceLoadingStepsProps {
  setupCommand?: string
  visible: {
    setup: boolean
    branch: boolean
    start: boolean
    connect: boolean
  }
}

/**
 * Animated list describing what Inspector is doing while a new workspace starts.
 * Steps reveal as the corresponding flags turn true; each animates in independently.
 */
export default function WorkspaceLoadingSteps({ setupCommand, visible }: WorkspaceLoadingStepsProps) {
  // Keep component mounted and only reveal items as flags flip true.
  const variants = { hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0 } }

  return (
    <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
      <div className="max-w-xl w-[92%] text-neutral-800 dark:text-neutral-100">
        <div className="space-y-4">
          <motion.div
            initial="hidden"
            animate={visible.setup ? 'shown' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.18 }}
            className="text-lg font-medium tracking-tight"
          >
            <div className="flex items-center gap-2">
              <FolderTree className="size-4" />
              <span className={visible.branch ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                Setting up a new workspace
              </span>
              {visible.setup && !visible.branch && (
                <LoaderCircle className="size-4 animate-spin text-neutral-400" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={visible.branch ? 'shown' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.18 }}
            className="text-lg font-medium tracking-tight"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="size-4" />
              <span className={visible.start ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                Creating a new branch
              </span>
              {visible.branch && !visible.start && (
                <LoaderCircle className="size-4 animate-spin text-neutral-400" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={visible.start ? 'shown' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.18 }}
            className="text-lg font-medium tracking-tight"
          >
            <div className="grid grid-cols-[1rem_auto] gap-2 items-start">
              <Terminal className="size-4 mt-[2px]" />
              <div className="flex items-center gap-2">
                <span className={visible.connect ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                  Starting development environment
                </span>
                {visible.start && !visible.connect && (
                  <LoaderCircle className="size-4 animate-spin text-neutral-400" />
                )}
              </div>
              {setupCommand && (
                <div className="col-start-2 mt-2 -ml-3">
                  <code className={`inline-block rounded-md bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 ${visible.connect ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-700 dark:text-neutral-200'}`}>
                    {setupCommand}
                  </code>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={visible.connect ? 'shown' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.18 }}
            className="text-lg font-medium tracking-tight"
          >
            <div className="flex items-center gap-2">
              <Globe className="size-4" />
              <span>Connecting to Inspector Browser</span>
              {visible.connect && (
                <LoaderCircle className="size-4 animate-spin text-neutral-400" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


