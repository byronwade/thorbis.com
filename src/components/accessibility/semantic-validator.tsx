'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Eye,
  Settings,
  RefreshCw,
  Download,
  X,
  FileText,
  Navigation as NavigationIcon
} from 'lucide-react'

// =============================================================================
// Types for Semantic Structure Validation
// =============================================================================

interface LandmarkElement {
  tagName: string
  role: string | null
  ariaLabel: string | null
  ariaLabelledBy: string | null
  id: string | null
  textContent: string
  selector: string
  hasMultipleOfSameType: boolean
  isRequired: boolean
  isMissing: boolean
}

interface HeadingElement {
  level: number
  text: string
  selector: string
  hasProperHierarchy: boolean
  isSkippingLevels: boolean
}

interface ValidationIssue {
  type: 'landmark' | 'heading' | 'list' | 'table' | 'form' | 'image' | 'link'
  severity: 'error' | 'warning' | 'info'
  element: string
  selector: string
  message: string
  suggestion: string
  wcagReference: string
}

interface SemanticValidationReport {
  landmarks: LandmarkElement[]
  headings: HeadingElement[]
  issues: ValidationIssue[]
  summary: {
    totalIssues: number
    errors: number
    warnings: number
    score: number
    compliance: 'excellent' | 'good' | 'fair' | 'poor'
  }
}

// =============================================================================
// Semantic Structure Validation Logic
// =============================================================================

class SemanticValidator {
  static validateLandmarks(): LandmarkElement[] {
    const landmarks: LandmarkElement[] = []
    const requiredLandmarks = ['banner', 'main', 'contentinfo']
    const landmarkSelectors = [
      'header[role="banner"], header:not([role])',
      'main[role="main"], main:not([role])',
      'footer[role="contentinfo"], footer:not([role])',
      '[role="navigation"], nav',
      '[role="complementary"], aside',
      '[role="region"]',
      '[role="search"]',
      '[role="form"]'
    ]

    // Find all landmark elements
    landmarkSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach((element, index) => {
        const tagName = element.tagName.toLowerCase()
        const role = element.getAttribute('role') || this.getImplicitRole(tagName)
        const ariaLabel = element.getAttribute('aria-label')
        const ariaLabelledBy = element.getAttribute('aria-labelledby')
        const id = element.getAttribute('id')
        const textContent = element.textContent?.trim().substring(0, 50) || '
        
        landmarks.push({
          tagName,
          role,
          ariaLabel,
          ariaLabelledBy,
          id,
          textContent,
          selector: this.getElementSelector(element, index),
          hasMultipleOfSameType: false,
          isRequired: requiredLandmarks.includes(role || '),
          isMissing: false
        })
      })
    })

    // Check for multiple landmarks of same type
    const roleCounts = landmarks.reduce((counts, landmark) => {
      const role = landmark.role || 'unknown'
      counts[role] = (counts[role] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    landmarks.forEach(landmark => {
      if (roleCounts[landmark.role || 'unknown'] > 1) {
        landmark.hasMultipleOfSameType = true
      }
    })

    return landmarks
  }

  static validateHeadingStructure(): HeadingElement[] {
    const headings: HeadingElement[] = []
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    
    let previousLevel = 0
    
    headingElements.forEach((element, index) => {
      const level = parseInt(element.tagName.charAt(1))
      const text = element.textContent?.trim() || '
      const selector = this.getElementSelector(element, index)
      
      const isSkippingLevels = level > previousLevel + 1
      const hasProperHierarchy = index === 0 ? level === 1 : level <= previousLevel + 1
      
      headings.push({
        level,
        text,
        selector,
        hasProperHierarchy,
        isSkippingLevels
      })
      
      previousLevel = level
    })

    return headings
  }

  static validateSemanticStructure(): ValidationIssue[] {
    const issues: ValidationIssue[] = []

    // Check for missing landmarks
    const hasMain = document.querySelector('main, [role="main"]')
    const hasHeader = document.querySelector('header[role="banner"], header:not([role]), [role="banner"]')
    const hasFooter = document.querySelector('footer[role="contentinfo"], footer:not([role]), [role="contentinfo"]')

    if (!hasMain) {
      issues.push({
        type: 'landmark',
        severity: 'error',
        element: 'main',
        selector: 'document',
        message: 'Missing main landmark',
        suggestion: 'Add a <main> element or element with role="main" to identify the primary content area',
        wcagReference: 'WCAG 2.1 - 2.4.1 Bypass Blocks'
      })
    }

    if (!hasHeader) {
      issues.push({
        type: 'landmark',
        severity: 'warning',
        element: 'header',
        selector: 'document',
        message: 'Missing header landmark',
        suggestion: 'Add a <header> element or element with role="banner" for site header',
        wcagReference: 'WCAG 2.1 - 2.4.1 Bypass Blocks'
      })
    }

    if (!hasFooter) {
      issues.push({
        type: 'landmark',
        severity: 'warning',
        element: 'footer',
        selector: 'document',
        message: 'Missing footer landmark',
        suggestion: 'Add a <footer> element or element with role="contentinfo" for site footer',
        wcagReference: 'WCAG 2.1 - 2.4.1 Bypass Blocks'
      })
    }

    // Check heading structure
    const headings = this.validateHeadingStructure()
    if (headings.length > 0 && headings[0].level !== 1) {
      issues.push({
        type: 'heading',
        severity: 'error',
        element: 'h1',
        selector: headings[0].selector,
        message: 'Page does not start with h1',
        suggestion: 'Ensure the page starts with an h1 element for proper heading hierarchy',
        wcagReference: 'WCAG 2.1 - 1.3.1 Info and Relationships'
      })
    }

    headings.forEach((heading, index) => {
      if (heading.isSkippingLevels) {
        issues.push({
          type: 'heading',
          severity: 'warning',
          element: `h${heading.level}',
          selector: heading.selector,
          message: 'Heading level ${heading.level} skips previous levels',
          suggestion: 'Use proper heading hierarchy without skipping levels',
          wcagReference: 'WCAG 2.1 - 1.3.1 Info and Relationships'
        })
      }
    })

    // Check for images without alt text
    const images = document.querySelectorAll('img')
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt')
      const role = img.getAttribute('role')
      
      if (alt === null && role !== 'presentation' && role !== 'none') {
        issues.push({
          type: 'image',
          severity: 'error',
          element: 'img',
          selector: this.getElementSelector(img, index),
          message: 'Image missing alt attribute',
          suggestion: 'Add alt attribute with descriptive text or role="presentation" for decorative images',
          wcagReference: 'WCAG 2.1 - 1.1.1 Non-text Content'
        })
      }
    })

    // Check for forms without labels
    const inputs = document.querySelectorAll('input, textarea, select')
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id')
      const ariaLabel = input.getAttribute('aria-label')
      const ariaLabelledBy = input.getAttribute('aria-labelledby')
      const hasLabel = id && document.querySelector('label[for="${id}"]')
      
      if (!hasLabel && !ariaLabel && !ariaLabelledBy && input.getAttribute('type') !== 'hidden') {
        issues.push({
          type: 'form',
          severity: 'error',
          element: input.tagName.toLowerCase(),
          selector: this.getElementSelector(input, index),
          message: 'Form field missing accessible label',
          suggestion: 'Add a <label> element, aria-label, or aria-labelledby attribute',
          wcagReference: 'WCAG 2.1 - 3.3.2 Labels or Instructions'
        })
      }
    })

    // Check for links without accessible names
    const links = document.querySelectorAll('a[href]')
    links.forEach((link, index) => {
      const textContent = link.textContent?.trim()
      const ariaLabel = link.getAttribute('aria-label')
      const ariaLabelledBy = link.getAttribute('aria-labelledby')
      const title = link.getAttribute('title')
      
      if (!textContent && !ariaLabel && !ariaLabelledBy && !title) {
        issues.push({
          type: 'link',
          severity: 'error',
          element: 'a',
          selector: this.getElementSelector(link, index),
          message: 'Link missing accessible name',
          suggestion: 'Add descriptive text content, aria-label, or title attribute to the link',
          wcagReference: 'WCAG 2.1 - 2.4.4 Link Purpose (In Context)'
        })
      }
      
      if (textContent && (textContent.toLowerCase() === 'click here' || textContent.toLowerCase() === 'read more')) {
        issues.push({
          type: 'link',
          severity: 'warning',
          element: 'a',
          selector: this.getElementSelector(link, index),
          message: 'Link text is not descriptive',
          suggestion: 'Use more descriptive link text that explains the link purpose',
          wcagReference: 'WCAG 2.1 - 2.4.4 Link Purpose (In Context)'
        })
      }
    })

    // Check for tables without headers
    const tables = document.querySelectorAll('table')
    tables.forEach((table, index) => {
      const hasHeaders = table.querySelectorAll('th').length > 0
      const caption = table.querySelector('caption')
      
      if (!hasHeaders) {
        issues.push({
          type: 'table',
          severity: 'warning',
          element: 'table',
          selector: this.getElementSelector(table, index),
          message: 'Table missing header cells',
          suggestion: 'Use <th> elements to identify table headers',
          wcagReference: 'WCAG 2.1 - 1.3.1 Info and Relationships'
        })
      }
      
      if (!caption && table.querySelectorAll('tr').length > 2) {
        issues.push({
          type: 'table',
          severity: 'info',
          element: 'table',
          selector: this.getElementSelector(table, index),
          message: 'Table missing caption',
          suggestion: 'Consider adding a <caption> element to describe the table purpose',
          wcagReference: 'WCAG 2.1 - 1.3.1 Info and Relationships'
        })
      }
    })

    return issues
  }

  private static getImplicitRole(tagName: string): string {
    const implicitRoles: Record<string, string> = {
      'header': 'banner',
      'main': 'main',
      'footer': 'contentinfo',
      'nav': 'navigation',
      'aside': 'complementary',
      'section': 'region',
      'article': 'article',
      'form': 'form'
    }
    
    return implicitRoles[tagName] || '
  }

  private static getElementSelector(element: Element, index: number): string {
    const tagName = element.tagName.toLowerCase()
    const id = element.getAttribute('id')
    const className = element.getAttribute('class`)
    
    if (id) {
      return '#${id}'
    }
    
    if (className) {
      return '${tagName}.${className.split(' ')[0]}'
    }
    
    return '${tagName}:nth-child(${index + 1})'
  }

  static generateReport(): SemanticValidationReport {
    const landmarks = this.validateLandmarks()
    const headings = this.validateHeadingStructure()
    const issues = this.validateSemanticStructure()
    
    const errors = issues.filter(issue => issue.severity === 'error').length
    const warnings = issues.filter(issue => issue.severity === 'warning').length
    const totalIssues = issues.length
    
    // Calculate score (100 - (errors * 10 + warnings * 5 + info * 1))
    const infoCount = totalIssues - errors - warnings
    const score = Math.max(0, 100 - (errors * 10 + warnings * 5 + infoCount * 1))
    
    let compliance: 'excellent' | 'good' | 'fair' | 'poor'
    if (score >= 90) compliance = 'excellent'
    else if (score >= 75) compliance = 'good'
    else if (score >= 50) compliance = 'fair'
    else compliance = 'poor'
    
    return {
      landmarks,
      headings,
      issues,
      summary: {
        totalIssues,
        errors,
        warnings,
        score,
        compliance
      }
    }
  }
}

// =============================================================================
// Semantic Validator Panel Component
// =============================================================================

interface SemanticValidatorPanelProps {
  className?: string
  defaultOpen?: boolean
}

export default function SemanticValidatorPanel({ 
  className, 
  defaultOpen = false 
}: SemanticValidatorPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isValidating, setIsValidating] = useState(false)
  const [report, setReport] = useState<SemanticValidationReport | null>(null)
  const [selectedTab, setSelectedTab] = useState<'landmarks' | 'headings' | 'issues'>('issues')

  const runValidation = useCallback(async () => {
    setIsValidating(true)
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const validationReport = SemanticValidator.generateReport()
      setReport(validationReport)
    } catch (error) {
      console.error('Error running semantic validation:', error)
    } finally {
      setIsValidating(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && !report) {
      runValidation()
    }
  }, [isOpen, report, runValidation])

  const downloadReport = useCallback(() => {
    if (!report) return
    
    const reportData = {
      timestamp: new Date().toISOString(),
      ...report
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'semantic-validation-${new Date().toISOString().split('T')[0]}.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [report])

  const highlightElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.style.outline = '3px solid #1C8BFF'
      element.style.outlineOffset = '2px'
      
      setTimeout(() => {
        element.style.outline = ''
        element.style.outlineOffset = ''
      }, 3000)
    }
  }, [])

  if (!isOpen) {
    return (
      <div className={cn('fixed bottom-4 left-4 z-50', className)}>
        <AccessibleButton
          onClick={() => setIsOpen(true)}
          variant="default"
          size="lg"
          className="shadow-lg"
          ariaLabel="Open semantic validator panel"
        >
          <FileText className="h-5 w-5 mr-2" />
          Semantic Validator
        </AccessibleButton>
      </div>
    )
  }

  return (
    <div className={cn(
      'fixed bottom-4 left-4 z-50',
      'w-96 max-h-[80vh] overflow-hidden',
      'bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Semantic Validator</h3>
        </div>
        <div className="flex items-center gap-2">
          <AccessibleButton
            onClick={downloadReport}
            variant="ghost"
            size="icon-sm"
            ariaLabel="Download validation report"
            disabled={!report}
          >
            <Download className="h-4 w-4" />
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon-sm"
            ariaLabel="Close validator panel"
          >
            <X className="h-4 w-4" />
          </AccessibleButton>
        </div>
      </div>

      {/* Summary */}
      {report && (
        <div className="p-4 border-b border-neutral-800">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-neutral-800/50 rounded p-2">
              <div className="text-neutral-400">Score</div>
              <div className={cn(
                'text-lg font-semibold',
                report.summary.compliance === 'excellent' ? 'text-green-400' :
                report.summary.compliance === 'good' ? 'text-blue-400' :
                report.summary.compliance === 'fair' ? 'text-yellow-400' : 'text-red-400'
              )}>
                {report.summary.score}/100
              </div>
            </div>
            <div className="bg-neutral-800/50 rounded p-2">
              <div className="text-neutral-400">Issues</div>
              <div className={cn(
                'text-lg font-semibold',
                report.summary.errors > 0 ? 'text-red-400' :
                report.summary.warnings > 0 ? 'text-yellow-400' : 'text-green-400'
              )}>
                {report.summary.totalIssues}
              </div>
            </div>
          </div>
          
          <AccessibleButton
            onClick={runValidation}
            disabled={isValidating}
            variant="outline"
            size="sm"
            className="w-full mt-3"
            loading={isValidating}
            loadingText="Validating..."
            ariaLabel="Run semantic validation"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isValidating ? 'Validating...' : 'Re-validate'}
          </AccessibleButton>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        {(['issues', 'landmarks', 'headings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium',
              'border-b-2 transition-colors',
              selectedTab === tab
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-300'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-h-96">
        {!report ? (
          <div className="p-4 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-neutral-400">Validating semantic structure...</p>
          </div>
        ) : (
          <>
            {selectedTab === 'issues' && (
              <div className="divide-y divide-neutral-800">
                {report.issues.length === 0 ? (
                  <div className="p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-300">
                      No semantic issues found! 🎉
                    </p>
                  </div>
                ) : (
                  report.issues.map((issue, index) => (
                    <div key={index} className="p-3 hover:bg-neutral-800/30">
                      <div className="flex items-start gap-2">
                        {issue.severity === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                        ) : issue.severity === 'warning' ? (
                          <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white mb-1">
                            {issue.message}
                          </p>
                          <p className="text-xs text-neutral-400 mb-2">
                            Element: {issue.element}
                          </p>
                          <p className="text-xs text-neutral-500 mb-2">
                            {issue.suggestion}
                          </p>
                          
                          <div className="flex gap-2">
                            <AccessibleButton
                              onClick={() => highlightElement(issue.selector)}
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6"
                              ariaLabel="Highlight element on page"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Show
                            </AccessibleButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedTab === 'landmarks' && (
              <div className="p-4 space-y-3">
                {report.landmarks.map((landmark, index) => (
                  <div 
                    key={index}
                    className={cn(
                      'p-3 rounded border',
                      landmark.hasMultipleOfSameType
                        ? 'border-yellow-800 bg-yellow-900/20'
                        : 'border-neutral-700 bg-neutral-800/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">
                        {landmark.role}
                      </span>
                      {landmark.hasMultipleOfSameType && (
                        <span className="text-xs text-yellow-400">
                          Multiple
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <p className="text-neutral-400">
                        Tag: {landmark.tagName}
                      </p>
                      {landmark.ariaLabel && (
                        <p className="text-neutral-400">
                          Label: {landmark.ariaLabel}
                        </p>
                      )}
                      {landmark.textContent && (
                        <p className="text-neutral-400">
                          Content: {landmark.textContent}
                        </p>
                      )}
                    </div>
                    
                    <AccessibleButton
                      onClick={() => highlightElement(landmark.selector)}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 mt-2"
                      ariaLabel="Highlight landmark on page"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Show
                    </AccessibleButton>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'headings' && (
              <div className="p-4 space-y-2">
                {report.headings.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center">
                    No headings found
                  </p>
                ) : (
                  report.headings.map((heading, index) => (
                    <div 
                      key={index}
                      className={cn(
                        'p-2 rounded border flex items-center justify-between',
                        !heading.hasProperHierarchy
                          ? 'border-red-800 bg-red-900/20'
                          : 'border-neutral-700 bg-neutral-800/30'
                      )}
                      style={{ marginLeft: '${(heading.level - 1) * 12}px' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-neutral-700 px-1 rounded">
                            H{heading.level}
                          </span>
                          <span className="text-sm text-white truncate">
                            {heading.text || '<empty>'}
                          </span>
                        </div>
                      </div>
                      
                      <AccessibleButton
                        onClick={() => highlightElement(heading.selector)}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 ml-2"
                        ariaLabel="Highlight heading on page"
                      >
                        <Eye className="h-3 w-3" />
                      </AccessibleButton>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}