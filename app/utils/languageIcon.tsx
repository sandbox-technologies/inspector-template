import React from 'react'
import type { ComponentType } from 'react'

// Import devicon components dynamically
import JavascriptOriginalIcon from '@devicon/react/javascript/original'
import TypescriptOriginalIcon from '@devicon/react/typescript/original'
import ReactOriginalIcon from '@devicon/react/react/original'
import PythonOriginalIcon from '@devicon/react/python/original'
import JavaOriginalIcon from '@devicon/react/java/original'
import CplusplusOriginalIcon from '@devicon/react/cplusplus/original'
import CsharpOriginalIcon from '@devicon/react/csharp/original'
import GoOriginalIcon from '@devicon/react/go/original'
import RustOriginalIcon from '@devicon/react/rust/original'
import RubyOriginalIcon from '@devicon/react/ruby/original'
import PhpOriginalIcon from '@devicon/react/php/original'
import SwiftOriginalIcon from '@devicon/react/swift/original'
import KotlinOriginalIcon from '@devicon/react/kotlin/original'
import DartOriginalIcon from '@devicon/react/dart/original'
import ScalaOriginalIcon from '@devicon/react/scala/original'
import Html5OriginalIcon from '@devicon/react/html5/original'
import Css3OriginalIcon from '@devicon/react/css3/original'
import SassOriginalIcon from '@devicon/react/sass/original'
import LessOriginalIcon from '@devicon/react/less/plain-wordmark'
import JsonOriginalIcon from '@devicon/react/json/original'
import MarkdownOriginalIcon from '@devicon/react/markdown/original'
import VuejsOriginalIcon from '@devicon/react/vuejs/original'
import AngularOriginalIcon from '@devicon/react/angularjs/original'
import NodejsOriginalIcon from '@devicon/react/nodejs/original'
import DockerOriginalIcon from '@devicon/react/docker/original'
import GitOriginalIcon from '@devicon/react/git/original'
import BashOriginalIcon from '@devicon/react/bash/original'
import YamlOriginalIcon from '@devicon/react/yaml/original'
import XmlOriginalIcon from '@devicon/react/xml/original'
import LuaOriginalIcon from '@devicon/react/lua/original'
import PerlOriginalIcon from '@devicon/react/perl/original'
import ROriginalIcon from '@devicon/react/r/original'
import MatlabOriginalIcon from '@devicon/react/matlab/original'
import SqlOriginalIcon from '@devicon/react/mysql/original'
import PostgresqlOriginalIcon from '@devicon/react/postgresql/original'

type LanguageIconMap = Record<string, ComponentType<{ className?: string; size?: string | number }>>

const languageIconMap: LanguageIconMap = {
  javascript: JavascriptOriginalIcon,
  js: JavascriptOriginalIcon,
  jsx: ReactOriginalIcon,
  typescript: TypescriptOriginalIcon,
  ts: TypescriptOriginalIcon,
  tsx: ReactOriginalIcon,
  python: PythonOriginalIcon,
  py: PythonOriginalIcon,
  java: JavaOriginalIcon,
  cpp: CplusplusOriginalIcon,
  cxx: CplusplusOriginalIcon,
  c: CplusplusOriginalIcon,
  csharp: CsharpOriginalIcon,
  cs: CsharpOriginalIcon,
  go: GoOriginalIcon,
  rust: RustOriginalIcon,
  rs: RustOriginalIcon,
  ruby: RubyOriginalIcon,
  rb: RubyOriginalIcon,
  php: PhpOriginalIcon,
  swift: SwiftOriginalIcon,
  kotlin: KotlinOriginalIcon,
  kt: KotlinOriginalIcon,
  dart: DartOriginalIcon,
  scala: ScalaOriginalIcon,
  html: Html5OriginalIcon,
  htm: Html5OriginalIcon,
  xhtml: Html5OriginalIcon,
  css: Css3OriginalIcon,
  sass: SassOriginalIcon,
  scss: SassOriginalIcon,
  less: LessOriginalIcon,
  json: JsonOriginalIcon,
  markdown: MarkdownOriginalIcon,
  md: MarkdownOriginalIcon,
  vue: VuejsOriginalIcon,
  vuejs: VuejsOriginalIcon,
  angular: AngularOriginalIcon,
  angularjs: AngularOriginalIcon,
  nodejs: NodejsOriginalIcon,
  node: NodejsOriginalIcon,
  docker: DockerOriginalIcon,
  dockerfile: DockerOriginalIcon,
  git: GitOriginalIcon,
  bash: BashOriginalIcon,
  sh: BashOriginalIcon,
  shell: BashOriginalIcon,
  zsh: BashOriginalIcon,
  yaml: YamlOriginalIcon,
  yml: YamlOriginalIcon,
  xml: XmlOriginalIcon,
  svg: XmlOriginalIcon,
  lua: LuaOriginalIcon,
  perl: PerlOriginalIcon,
  pl: PerlOriginalIcon,
  r: ROriginalIcon,
  matlab: MatlabOriginalIcon,
  sql: SqlOriginalIcon,
  mysql: SqlOriginalIcon,
  postgresql: PostgresqlOriginalIcon,
  postgres: PostgresqlOriginalIcon,
}

/**
 * Detects the programming language from a file path
 */
export function detectLanguageFromPath(path?: string): string | undefined {
  if (!path) return undefined
  const lower = path.toLowerCase()
  
  // Extract file extension
  const lastDot = lower.lastIndexOf('.')
  if (lastDot === -1) return undefined
  
  const extension = lower.substring(lastDot + 1)
  
  // Handle special cases
  if (lower.endsWith('.tsx')) return 'tsx'
  if (lower.endsWith('.jsx')) return 'jsx'
  if (lower.endsWith('.dockerfile')) return 'docker'
  if (lower.includes('dockerfile')) return 'docker'
  
  return extension
}

/**
 * Gets the appropriate devicon component for a file path
 * Returns undefined if no matching icon is found
 */
export function getLanguageIconComponent(
  path?: string
): ComponentType<{ className?: string; size?: string | number }> | undefined {
  const language = detectLanguageFromPath(path)
  if (!language) return undefined
  
  return languageIconMap[language]
}

/**
 * Renders a language icon for a file path
 * Falls back to a default icon if no match is found
 */
export function LanguageIcon({ 
  path, 
  className = '',
  size = '1em',
  fallback = '📄'
}: { 
  path?: string
  className?: string
  size?: string | number
  fallback?: string
}) {
  const IconComponent = getLanguageIconComponent(path)
  
  if (IconComponent) {
    return <IconComponent className={className} size={size} />
  }
  
  return <span className={className}>{fallback}</span>
}

/**
 * Gets icon metadata (component and color class) for a file path
 * Useful for components that need to render icons with custom styling
 */
export function getLanguageIconData(path?: string): {
  component: ComponentType<{ className?: string; size?: string | number }> | null
  fallback: string
  colorClass: string
} {
  const IconComponent = getLanguageIconComponent(path)
  const language = detectLanguageFromPath(path)
  
  // Default fallback
  const fallback = '📄'
  
  // Color classes based on language families
  let colorClass = 'text-neutral-400 dark:text-neutral-500'
  
  if (!language) {
    return { component: null, fallback, colorClass }
  }
  
  // Set color classes based on language families
  if (['javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx', 'react', 'nodejs', 'node'].includes(language)) {
    colorClass = 'text-blue-400 dark:text-blue-400'
  } else if (['python', 'py'].includes(language)) {
    colorClass = 'text-yellow-400 dark:text-yellow-400'
  } else if (['html', 'htm', 'xhtml'].includes(language)) {
    colorClass = 'text-orange-400 dark:text-orange-400'
  } else if (['css', 'sass', 'scss', 'less'].includes(language)) {
    colorClass = 'text-blue-400 dark:text-blue-400'
  } else if (['json'].includes(language)) {
    colorClass = 'text-yellow-400 dark:text-yellow-400'
  } else if (['java'].includes(language)) {
    colorClass = 'text-red-400 dark:text-red-400'
  } else if (['rust', 'rs'].includes(language)) {
    colorClass = 'text-orange-500 dark:text-orange-500'
  } else if (['go'].includes(language)) {
    colorClass = 'text-cyan-400 dark:text-cyan-400'
  } else if (['ruby', 'rb'].includes(language)) {
    colorClass = 'text-red-500 dark:text-red-500'
  } else if (['vue', 'vuejs'].includes(language)) {
    colorClass = 'text-green-400 dark:text-green-400'
  } else if (['docker', 'dockerfile'].includes(language)) {
    colorClass = 'text-blue-400 dark:text-blue-400'
  }
  
  return {
    component: IconComponent || null,
    fallback,
    colorClass,
  }
}

