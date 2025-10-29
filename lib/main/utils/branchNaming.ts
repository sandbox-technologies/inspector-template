/**
 * Generate branch name for a new workspace
 * Format: <project-name>/<yyyyMMdd-HHmmss>
 * 
 * This is abstracted to allow for future LLM-based naming
 */
export function generateBranchName(projectName: string, now = new Date()): string {
  // Sanitize project name for git branch naming
  const sanitizedProject = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) // Limit length for readability

  // Format timestamp as yyyyMMdd-HHmmss
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  const timestamp = `${year}${month}${day}-${hours}${minutes}${seconds}`
  
  return `${sanitizedProject}/${timestamp}`
}
