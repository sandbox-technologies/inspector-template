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

  // Enforce a minimum visible duration per step to avoid choppy flashes
  const MIN_STEP_DURATION_MS = 600

  const [startedAt, setStartedAt] = React.useState<{ setup?: number; branch?: number; start?: number }>(() => ({}))
  const [allow, setAllow] = React.useState<{ branch: boolean; start: boolean; connect: boolean }>({ branch: false, start: false, connect: false })

  // Record when each step first becomes visible according to incoming signals
  React.useEffect(() => { if (visible.setup && !startedAt.setup) setStartedAt((p) => ({ ...p, setup: Date.now() })) }, [visible.setup, startedAt.setup])
  React.useEffect(() => { if (visible.branch && !startedAt.branch) setStartedAt((p) => ({ ...p, branch: Date.now() })) }, [visible.branch, startedAt.branch])
  React.useEffect(() => { if (visible.start && !startedAt.start) setStartedAt((p) => ({ ...p, start: Date.now() })) }, [visible.start, startedAt.start])

  // Gate showing the next step until the previous one has been visible long enough
  React.useEffect(() => {
    if (!startedAt.setup) return
    const remaining = Math.max(0, MIN_STEP_DURATION_MS - (Date.now() - startedAt.setup))
    const t = window.setTimeout(() => setAllow((a) => ({ ...a, branch: true })), remaining)
    return () => window.clearTimeout(t)
  }, [startedAt.setup])

  React.useEffect(() => {
    if (!startedAt.branch) return
    const remaining = Math.max(0, MIN_STEP_DURATION_MS - (Date.now() - startedAt.branch))
    const t = window.setTimeout(() => setAllow((a) => ({ ...a, start: true })), remaining)
    return () => window.clearTimeout(t)
  }, [startedAt.branch])

  React.useEffect(() => {
    if (!startedAt.start) return
    const remaining = Math.max(0, MIN_STEP_DURATION_MS - (Date.now() - startedAt.start))
    const t = window.setTimeout(() => setAllow((a) => ({ ...a, connect: true })), remaining)
    return () => window.clearTimeout(t)
  }, [startedAt.start])

  // Derived display flags that apply the gating
  const showSetup = visible.setup
  const showBranch = visible.branch && allow.branch
  const showStart = visible.start && allow.start
  const showConnect = visible.connect && allow.connect

  return (
    <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
      <div className="max-w-xl w-[92%] text-neutral-800 dark:text-neutral-100">
        <div className="space-y-4">
          <motion.div
            initial="hidden"
            animate={showSetup ? 'shown' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.18 }}
            className="text-lg font-medium tracking-tight"
          >
            <div className="flex items-center gap-2">
              <FolderTree className="size-4" />
              <span className={showBranch ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                Setting up a new workspace
              </span>
              {showSetup && !showBranch && (
                <LoaderCircle className="size-4 animate-spin text-neutral-400" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={showBranch ? 'shown' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.18 }}
            className="text-lg font-medium tracking-tight"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="size-4" />
              <span className={showStart ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                Creating a new branch
              </span>
              {showBranch && !showStart && (
                <LoaderCircle className="size-4 animate-spin text-neutral-400" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={showStart ? 'shown' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.18 }}
            className="text-lg font-medium tracking-tight"
          >
            <div className="grid grid-cols-[1rem_auto] gap-2 items-start">
              <Terminal className="size-4 mt-[2px]" />
              <div className="flex items-center gap-2">
                <span className={showConnect ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                  Starting development environment
                </span>
                {showStart && !showConnect && (
                  <LoaderCircle className="size-4 animate-spin text-neutral-400" />
                )}
              </div>
              {setupCommand && (
                <div className="col-start-2 mt-2 -ml-3">
                  <code className={`inline-block rounded-md bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 ${showConnect ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-700 dark:text-neutral-200'}`}>
                    {setupCommand}
                  </code>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={showConnect ? 'shown' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.18 }}
            className="text-lg font-medium tracking-tight"
          >
            <div className="flex items-center gap-2">
              <Globe className="size-4" />
              <span>Connecting to Inspector Browser</span>
              {showConnect && (
                <LoaderCircle className="size-4 animate-spin text-neutral-400" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


