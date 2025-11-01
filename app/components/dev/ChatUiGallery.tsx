import React, { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

import { AssistantText } from '@/app/components/ui/chat/AssistantText'
import { ThinkingTrace } from '@/app/components/ui/chat/ThinkingTrace'
import { GrepResults } from '@/app/components/ui/chat/GrepResults'
import { ReadFileView } from '@/app/components/ui/chat/ReadFileView'
import { EditDiffView } from '@/app/components/ui/chat/EditDiffView'
import { LsTreeView } from '@/app/components/ui/chat/LsTreeView'
import { SentMessage } from '@/app/components/ui/chat/SentMessage'
import { ChatInput } from '@/app/components/ui/chat/ChatInput'

import type {
  InspectorDataParts,
  InspectorDirectoryTreeNode,
  InspectorStatusData,
} from '@/app/ai/types'

const now = Date.now()

const sampleAgentText: InspectorDataParts['agentText'] = {
  runId: 'demo-run',
  text: `### Implementation Plan\n\n1. Create a new \`ChatUiGallery\` development tab.\n2. Showcase each Cursor generative UI component.\n3. Wire the gallery into the tab system for quick visual regression checks.\n\nHere is a small example of inline code: \`console.log("hello world")\`.`,
  isFinal: true,
}

const sampleThinkingFinal: InspectorDataParts['thinkingFinal'] = {
  runId: 'demo-run',
  text: `Summarised the latest repository structure, selected representative data for each component, and prepared example payloads to render the chat UI.`,
  startedAtMs: now - 4200,
  completedAtMs: now - 400,
  durationMs: 3800,
}

const sampleThinkingActiveText = `Exploring repository metadata, curating file previews, and coordinating diff visualisations…`

const sampleToolStatuses: Array<InspectorStatusData & { updatedAt: number }> = [
  {
    id: 'status-grep-demo',
    label: 'Grepping',
    phase: 'started',
    callId: 'grep-demo',
    details: 'Searching for "useInspectorChat" in app/components/ui/chat',
    updatedAt: now - 600,
  },
]

const sampleGrepResult: InspectorDataParts['grepResult'] = {
  callId: 'grep-demo',
  args: {
    pattern: 'useInspectorChat',
    path: 'app/components/ui/chat',
    outputMode: 'content',
  },
  result: {
    success: {
      pattern: 'useInspectorChat',
      path: 'app/components/ui/chat',
      outputMode: 'content',
      workspaceResults: {
        'inspector-template': {
          content: {
            matches: [
              {
                file: 'app/components/ChatWindow.tsx',
                matches: [
                  {
                    lineNumber: 36,
                    content: '    messages,',
                    isContextLine: true,
                    contentTruncated: false,
                  },
                  {
                    lineNumber: 37,
                    content: '    sendMessage,',
                    isContextLine: false,
                    contentTruncated: false,
                  },
                  {
                    lineNumber: 38,
                    content: '    isStreaming,',
                    isContextLine: false,
                    contentTruncated: false,
                  },
                  {
                    lineNumber: 39,
                    content: '    statusByCallId,',
                    isContextLine: false,
                    contentTruncated: false,
                  },
                ],
              },
              {
                file: 'app/hooks/use-inspector-chat.ts',
                matches: [
                  {
                    lineNumber: 12,
                    content: 'export function useInspectorChat({ workspacePath }: UseInspectorChatArgs) {',
                    isContextLine: false,
                    contentTruncated: false,
                  },
                  {
                    lineNumber: 48,
                    content: '  const sendMessage = useCallback(async (message: { text: string }) => {',
                    isContextLine: false,
                    contentTruncated: false,
                  },
                ],
              },
            ],
            totalLines: 18,
            totalMatchedLines: 6,
            clientTruncated: false,
            ripgrepTruncated: false,
          },
        },
      },
    },
  },
}

const sampleReadResult: InspectorDataParts['readResult'] = {
  callId: 'read-demo',
  path: 'app/components/ui/chat/AssistantText.tsx',
  content: `export const AssistantText: React.FC<AssistantTextProps> = ({ data }) => {\n  const text = data?.text ?? ''\n  if (!text) return null\n  return (\n    <div className="mb-3 text-sm text-neutral-900 dark:text-neutral-100">\n      <ReactMarkdown remarkPlugins={[remarkGfm]}>\n        {text}\n      </ReactMarkdown>\n    </div>\n  )\n}`,
  readRange: { startLine: 11, endLine: 21 },
  meta: {
    isEmpty: false,
    exceededLimit: false,
    totalLines: 46,
    fileSize: 1024,
  },
}

const sampleEditResult: InspectorDataParts['editResult'] = {
  callId: 'edit-demo',
  path: 'app/components/ui/chat/ChatInput.tsx',
  diff: `@@ -150,6 +150,12 @@ export const ChatInput: React.FC<ChatInputProps> = ({\n               />\n             )}\n           </div>\n+          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">\n+            Tip: Press Enter to send, Shift+Enter for a new line.\n+          </p>\n         </div>\n       </div>\n     </div>`,
  linesAdded: 2,
  linesRemoved: 0,
  newFile: false,
  beforePreview: '... existing code ...',
  afterPreview: '... updated code ...',
}

const sampleTree: InspectorDirectoryTreeNode = {
  absPath: '/Users/you/inspector-template',
  childrenDirs: [
    {
      absPath: '/Users/you/inspector-template/app',
      childrenDirs: [
        {
          absPath: '/Users/you/inspector-template/app/components',
          childrenDirs: [],
          childrenFiles: [
            { name: 'ChatWindow.tsx' },
            { name: 'app.tsx' },
          ],
          childrenWereProcessed: true,
          numFiles: 2,
          fullSubtreeExtensionCounts: { tsx: 2 },
        },
      ],
      childrenFiles: [
        { name: 'renderer.tsx' },
        { name: 'index.html' },
      ],
      childrenWereProcessed: true,
      numFiles: 4,
      fullSubtreeExtensionCounts: { tsx: 3, html: 1 },
    },
  ],
  childrenFiles: [
    { name: 'package.json' },
    { name: 'README.md' },
  ],
  childrenWereProcessed: true,
  numFiles: 6,
  fullSubtreeExtensionCounts: { json: 1, md: 1, tsx: 3, html: 1 },
}

const sampleLsResult: InspectorDataParts['lsResult'] = {
  callId: 'ls-demo',
  root: sampleTree,
  counts: {
    ts: 12,
    tsx: 18,
    json: 2,
  },
}

const sampleUserMessage = `Can you walk me through how the chat window renders streaming tool results?`

type SectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

const Section: React.FC<SectionProps> = ({ title, description, children }) => (
  <section className="space-y-3">
    <header>
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      {description ? (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      ) : null}
    </header>
    <div className="space-y-3">{children}</div>
  </section>
)

export const ChatUiGallery: React.FC = () => {
  const [inputValue, setInputValue] = useState('Inspect the code that generates the diff preview.')
  const activeThinkingStartedAt = now - 1200

  return (
    <div className="h-full w-full overflow-auto bg-neutral-100/80 px-6 py-8 dark:bg-neutral-950/40">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
        <header className="space-y-2">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Chat UI Gallery</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Development-only playground showing the generative UI components that power the Inspector chat experience.
            Use this tab to sanity check visual changes without running a full agent conversation.
          </p>
        </header>

        <Section title="AssistantText" description="Markdown-rendered assistant responses.">
          <AssistantText data={sampleAgentText} />
        </Section>

        <Section title="ThinkingTrace" description="Collapsible reasoning transcript, active and completed states.">
          <ThinkingTrace data={sampleThinkingFinal} />
          <ThinkingTrace
            text={sampleThinkingActiveText}
            isActive
            startedAtMs={activeThinkingStartedAt}
          />
        </Section>

        <Section title="GrepResults" description="Grep results for the workspace.">
          <GrepResults data={sampleGrepResult} isActive />
          <GrepResults data={sampleGrepResult} />
        </Section>

        <Section title="ListTreeView" description="List tree view of the workspace.">
          <LsTreeView data={sampleLsResult} />
          <LsTreeView data={sampleLsResult} isActive />
        </Section>

        <Section title="Tool Outputs" description="Representative payloads for file search, reads, diffs, and directory listings.">
          <GrepResults data={sampleGrepResult} />
          <ReadFileView data={sampleReadResult} />
          <EditDiffView data={sampleEditResult} />
          <LsTreeView data={sampleLsResult} />
        </Section>

        <Section title="User Message & Composer" description="Most recent user prompt and the chat input surface.">
          <SentMessage text={sampleUserMessage} />
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={() => {
              // eslint-disable-next-line no-console
              console.log('Send demo message:', inputValue)
            }}
          />
        </Section>
      </div>
    </div>
  )
}


