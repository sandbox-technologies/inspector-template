/**
 * Extract development server URL from process output
 * Supports common frameworks and their URL patterns
 */
export function extractDevUrlFromOutput(line: string): string | null {
  // Skip lines that are just warnings about ports being in use
  if (line.includes('Port') && line.includes('is in use')) {
    return null
  }
  
  // Common URL patterns used by dev servers
  const patterns = [
    // Next.js specific patterns (handle both regular and Turbopack)
    /^\s*-\s+Local:\s+(https?:\/\/[^\s]+)/i,
    /[▲△▽▼►▶◀◁]\s+.*?-\s+Local:\s+(https?:\/\/[^\s]+)/i,
    /\s+-\s+Local:\s+(https?:\/\/[^\s]+)/i,
    
    // Next.js, Create React App, Vite, etc.
    /Local:\s+(https?:\/\/[^\s]+)/i,
    /ready on\s+(https?:\/\/[^\s]+)/i,
    /listening on\s+(https?:\/\/[^\s]+)/i,
    /server running at\s+(https?:\/\/[^\s]+)/i,
    /available at\s+(https?:\/\/[^\s]+)/i,
    /Server started on\s+(https?:\/\/[^\s]+)/i,
    /Running at\s+(https?:\/\/[^\s]+)/i,
    /started at\s+(https?:\/\/[^\s]+)/i,
    /Server is running at\s+(https?:\/\/[^\s]+)/i,
    
    // Vite specific
    /➜\s+Local:\s+(https?:\/\/[^\s]+)/i,
    /Local:\s+(https?:\/\/[^\s]+)/i,
    
    // Webpack Dev Server
    /Project is running at\s+(https?:\/\/[^\s]+)/i,
    /webpack output is served from\s+(https?:\/\/[^\s]+)/i,
    
    // Nuxt
    /Listening on:\s+(https?:\/\/[^\s]+)/i,
    
    // Angular
    /\*\*\s+Angular Live Development Server.+?(https?:\/\/[^\s]+)/i,
    
    // Vue CLI
    /App running at:\s*\n\s*-\s*Local:\s+(https?:\/\/[^\s]+)/im,
    
    // Remix
    /Remix App Server started at\s+(https?:\/\/[^\s]+)/i,
    
    // SvelteKit
    /listening on\s+(https?:\/\/[^\s]+)/i,
    
    // Generic patterns - check these last (but not in warning/error messages)
    /^\s*(https?:\/\/localhost:\d+)\s*$/,
    /^\s*(https?:\/\/127\.0\.0\.1:\d+)\s*$/,
    /^\s*(https?:\/\/0\.0\.0\.0:\d+)\s*$/,
    /^\s*(https?:\/\/\[::\]:\d+)\s*$/,
    /^\s*(https?:\/\/\[::1\]:\d+)\s*$/,
  ]

  for (const pattern of patterns) {
    const match = line.match(pattern)
    if (match) {
      // Get the URL from either the first capture group or the full match
      let url = match[1] || match[0]
      
      // Normalize 0.0.0.0 or :: to localhost
      url = url.replace(/0\.0\.0\.0/, 'localhost')
      url = url.replace(/\[::\]/, 'localhost')
      url = url.replace(/\[::1\]/, 'localhost')
      
      return url
    }
  }

  // Special case: just port numbers (e.g., "Listening on port 3000", "Port: 8080")
  const portMatch = line.match(/(?:port|listening on|Port:)\s*(\d{4,5})/i)
  if (portMatch && portMatch[1]) {
    return `http://localhost:${portMatch[1]}`
  }

  // Another pattern: "http://localhost:3000" without any prefix text
  const standaloneUrl = line.match(/^\s*(https?:\/\/(?:localhost|127\.0\.0\.1):\d+)\s*$/i)
  if (standaloneUrl && standaloneUrl[1]) {
    return standaloneUrl[1]
  }

  return null
}
