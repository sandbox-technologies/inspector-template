import React from 'react'
import type { CSSProperties, HTMLProps } from 'react'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

type GetLineProps = (lineNumber: number, isDarkMode: boolean) => HTMLProps<HTMLElement>

type CodeBlockProps = {
  code: string
  language?: string
  wrapLongLines?: boolean
  className?: string
  customStyle?: CSSProperties
  getLineProps?: GetLineProps
}

const useIsDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  })

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const update = () => setIsDarkMode(root.classList.contains('dark'))
    update()

    if (typeof MutationObserver === 'undefined') {
      return
    }

    const observer = new MutationObserver(() => update())
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] })
    return () => observer.disconnect()
  }, [])

  return isDarkMode
}

const normalizeLanguage = (language?: string) => {
  if (!language) return 'text'
  const trimmed = language.trim().toLowerCase()
  if (trimmed.length === 0) return 'text'

  if (['html', 'htm', 'xhtml'].includes(trimmed)) return 'markup'
  if (['react', 'jsx', 'javascriptreact'].includes(trimmed)) return 'jsx'
  if (['tsx', 'typescriptreact'].includes(trimmed)) return 'tsx'
  if (trimmed === 'svg') return 'xml'
  if (trimmed === 'shell') return 'bash'
  return trimmed
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  wrapLongLines = false,
  className,
  customStyle,
  getLineProps,
}) => {
  const isDarkMode = useIsDarkMode()

  const theme = React.useMemo(() => (isDarkMode ? vscDarkPlus : vs), [isDarkMode])

  const mergedStyle = React.useMemo(() => {
    const base: CSSProperties = {
      margin: 0,
      borderRadius: '0.5rem',
      padding: '0.75rem 0.9rem',
      fontSize: '0.85rem',
      lineHeight: 1.55,
      background: isDarkMode ? '#1f1f1f' : '#efefef',
      overflowX: 'auto',
      maxHeight: '18rem',
    }
    return { ...base, ...customStyle }
  }, [customStyle, isDarkMode])

  const resolvedLineProps = React.useMemo(() => {
    if (!getLineProps) return undefined
    return (lineNumber: number) => getLineProps(lineNumber, isDarkMode)
  }, [getLineProps, isDarkMode])

  const languageId = normalizeLanguage(language)

  return (
    <SyntaxHighlighter
      className={className}
      language={languageId}
      style={theme}
      customStyle={mergedStyle}
      wrapLongLines={wrapLongLines}
      wrapLines={Boolean(resolvedLineProps)}
      lineProps={resolvedLineProps}
      codeTagProps={{
        style: {
          fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: '0.85rem',
        },
      }}
    >
      {code}
    </SyntaxHighlighter>
  )
}

export default CodeBlock


