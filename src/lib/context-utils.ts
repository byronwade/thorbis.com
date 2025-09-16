export interface ContextMetrics {
  userContext: number
  platformContext: number
  fileContext: number
  inputContext: number
  capabilityContext: number
  total: number
}

export function calculateContextPercentage(
  userPresent: boolean,
  platformPresent: boolean,
  fileCount: number,
  inputLength: number,
  capabilityCount: number
): { percentage: number; metrics: ContextMetrics } {
  const metrics: ContextMetrics = {
    userContext: userPresent ? 15 : 0,
    platformContext: platformPresent ? 20 : 0,
    fileContext: Math.min(fileCount * 8, 25), // Max 25% for files
    inputContext: Math.min(inputLength > 0 ? 10 + (inputLength / 100) * 5 : 0, 15), // Max 15% for input
    capabilityContext: Math.min(capabilityCount * 2, 10), // Max 10% for capabilities
    total: 0
  }

  metrics.total = metrics.userContext + metrics.platformContext + metrics.fileContext + metrics.inputContext + metrics.capabilityContext

  // Add base context percentage
  const basePercentage = 45
  const finalPercentage = Math.min(95, basePercentage + metrics.total)

  return {
    percentage: finalPercentage,
    metrics
  }
}

export function getIndustryLabel(industry: string): string {
  const labels: Record<string, string> = {
    hs: 'Home Services',
    rest: 'Restaurant',
    auto: 'Auto Services',
    ret: 'Retail'
  }
  return labels[industry] || 'Platform'
}

export function getContextTooltip(percentage: number, metrics: ContextMetrics): string {
  const parts = []
  
  if (metrics.userContext > 0) {
    parts.push(`User: ${metrics.userContext}%`)
  }
  if (metrics.platformContext > 0) {
    parts.push(`Platform: ${metrics.platformContext}%`)
  }
  if (metrics.fileContext > 0) {
    parts.push(`Files: ${metrics.fileContext}%`)
  }
  if (metrics.inputContext > 0) {
    parts.push(`Input: ${metrics.inputContext.toFixed(1)}%`)
  }
  if (metrics.capabilityContext > 0) {
    parts.push('Tools: ${metrics.capabilityContext}%')
  }

  return 'Context: ${percentage.toFixed(1)}%
${parts.join('
')}'
}
