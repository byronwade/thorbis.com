'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { 
  auditPageContrast, 
  generateContrastReport, 
  applyWCAGColors, 
  useWCAGColors,
  type ContrastAuditResult 
} from '@/lib/color-contrast-audit'
import { 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Settings, 
  RefreshCw, 
  Download,
  Palette,
  Info,
  X
} from 'lucide-react'

// =============================================================================
// Contrast Audit Panel Component
// =============================================================================

interface ContrastAuditPanelProps {
  className?: string
  defaultOpen?: boolean
}

export default function ContrastAuditPanel({ 
  className, 
  defaultOpen = false 
}: ContrastAuditPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isAuditing, setIsAuditing] = useState(false)
  const [auditResults, setAuditResults] = useState<ContrastAuditResult[]>([])
  const [wcagLevel, setWCAGLevel] = useState<'AA' | 'AAA'>('AA')
  const [autoFix, setAutoFix] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<ContrastAuditResult | null>(null)
  
  const { generateReport, applyColors, auditPage } = useWCAGColors(wcagLevel)

  // Run audit on component mount and when WCAG level changes
  useEffect(() => {
    if (isOpen) {
      runAudit()
    }
  }, [isOpen, wcagLevel])

  // Auto-apply WCAG colors when auto-fix is enabled
  useEffect(() => {
    if (autoFix) {
      applyColors()
    }
  }, [autoFix, wcagLevel, applyColors])

  const runAudit = useCallback(async () => {
    setIsAuditing(true)
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const results = auditPage()
      setAuditResults(results)
    } catch (error) {
      console.error('Error running contrast audit:', error)
    } finally {
      setIsAuditing(false)
    }
  }, [auditPage])

  const downloadReport = useCallback(() => {
    const report = generateReport()
    const reportData = {
      timestamp: new Date().toISOString(),
      wcagLevel,
      summary: report.summary,
      issues: report.issues,
      recommendations: report.recommendations,
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contrast-audit-${new Date().toISOString().split('T')[0]}.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [generateReport, wcagLevel])

  const fixIssue = useCallback((issue: ContrastAuditResult) => {
    const element = document.querySelector(issue.selector) as HTMLElement
    if (element) {
      // Apply the WCAG AA compliant color
      element.style.color = issue.suggestions.foregroundAA
      
      // Remove the issue from results
      setAuditResults(prev => prev.filter(r => r.selector !== issue.selector))
    }
  }, [])

  const highlightIssue = useCallback((issue: ContrastAuditResult) => {
    const element = document.querySelector(issue.selector) as HTMLElement
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.style.outline = '3px solid #1C8BFF'
      element.style.outlineOffset = '2px'
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        element.style.outline = ''
        element.style.outlineOffset = ''
      }, 3000)
    }
  }, [])

  const report = generateReport()

  if (!isOpen) {
    return (
      <div className={cn('fixed bottom-4 right-4 z-50', className)}>
        <AccessibleButton
          onClick={() => setIsOpen(true)}
          variant="default"
          size="lg"
          className="shadow-lg"
          ariaLabel="Open contrast audit panel"
        >
          <Eye className="h-5 w-5 mr-2" />
          Contrast Audit
        </AccessibleButton>
      </div>
    )
  }

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50',
      'w-96 max-h-[80vh] overflow-hidden',
      'bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Contrast Audit</h3>
        </div>
        <div className="flex items-center gap-2">
          <AccessibleButton
            onClick={downloadReport}
            variant="ghost"
            size="icon-sm"
            ariaLabel="Download audit report"
          >
            <Download className="h-4 w-4" />
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon-sm"
            ariaLabel="Close audit panel"
          >
            <X className="h-4 w-4" />
          </AccessibleButton>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-300">WCAG Level:</span>
          <div className="flex gap-2">
            {(['AA', 'AAA'] as const).map(level => (
              <AccessibleButton
                key={level}
                onClick={() => setWCAGLevel(level)}
                variant={wcagLevel === level ? 'default' : 'outline'}
                size="sm"
                ariaLabel={'Set WCAG level to ${level}'}
              >
                {level}
              </AccessibleButton>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-300">Auto-fix colors:</span>
          <AccessibleButton
            onClick={() => setAutoFix(!autoFix)}
            variant={autoFix ? 'default' : 'outline'}
            size="sm"
            ariaLabel={'${autoFix ? 'Disable' : 'Enable'} auto-fix colors'}
          >
            <Palette className="h-4 w-4 mr-1" />
            {autoFix ? 'Enabled' : 'Disabled'}
          </AccessibleButton>
        </div>

        <AccessibleButton
          onClick={runAudit}
          disabled={isAuditing}
          variant="outline"
          size="sm"
          className="w-full"
          loading={isAuditing}
          loadingText="Auditing..."
          ariaLabel="Run contrast audit"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isAuditing ? 'Auditing...' : 'Run Audit'}
        </AccessibleButton>
      </div>

      {/* Summary */}
      <div className="p-4 border-b border-neutral-800">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-neutral-800/50 rounded p-2">
            <div className="text-neutral-400">Total Issues</div>
            <div className="text-lg font-semibold text-white">
              {report.summary.failing}
            </div>
          </div>
          <div className="bg-neutral-800/50 rounded p-2">
            <div className="text-neutral-400">Compliance</div>
            <div className={cn(
              'text-lg font-semibold',
              report.summary.compliance >= 95 ? 'text-green-400' :
              report.summary.compliance >= 80 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {report.summary.compliance.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto max-h-96">
        {report.summary.failing === 0 ? (
          <div className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-neutral-300">
              No contrast issues found! 🎉
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              All colors meet WCAG {wcagLevel} standards
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {report.issues.map((issue, index) => (
              <div key={index} className="p-3 hover:bg-neutral-800/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-white truncate">
                        {issue.element}
                      </span>
                    </div>
                    
                    <div className="text-xs text-neutral-400 mb-2">
                      Ratio: {issue.ratio.toFixed(2)}:1 (needs {wcagLevel === 'AA' ? '4.5' : '7`}:1)
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <div 
                        className="w-4 h-4 rounded border border-neutral-600"
                        style={{ backgroundColor: issue.foreground }}
                        title={`Foreground: ${issue.foreground}'}
                      />
                      <span className="text-xs text-neutral-500">on</span>
                      <div 
                        className="w-4 h-4 rounded border border-neutral-600"
                        style={{ backgroundColor: issue.background }}
                        title={'Background: ${issue.background}'}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <AccessibleButton
                        onClick={() => highlightIssue(issue)}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6"
                        ariaLabel="Highlight issue on page"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Show
                      </AccessibleButton>
                      
                      <AccessibleButton
                        onClick={() => fixIssue(issue)}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 text-green-400 hover:text-green-300"
                        ariaLabel="Fix contrast issue"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Fix
                      </AccessibleButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">
              Recommendations
            </span>
          </div>
          <ul className="text-xs text-neutral-400 space-y-1">
            {report.recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Contrast Quick Check Component
// =============================================================================

interface ContrastQuickCheckProps {
  foreground: string
  background: string
  className?: string
}

export function ContrastQuickCheck({ 
  foreground, 
  background, 
  className 
}: ContrastQuickCheckProps) {
  const [result, setResult] = useState<{
    ratio: number
    level: 'AA' | 'AAA' | 'fail'
    isValid: boolean
  } | null>(null)

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import('@/lib/accessibility').then(({ calculateContrastRatio }) => {
      const contrastResult = calculateContrastRatio(foreground, background)
      setResult(contrastResult)
    })
  }, [foreground, background])

  if (!result) {
    return <div className={cn('text-xs text-neutral-500', className)}>Loading...</div>
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 text-xs',
      result.isValid ? 'text-green-400' : 'text-red-400',
      className
    )}>
      {result.isValid ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      <span>
        {result.ratio.toFixed(2)}:1 ({result.level})
      </span>
    </div>
  )
}

// =============================================================================
// WCAG Color Picker Component
// =============================================================================

interface WCAGColorPickerProps {
  value: string
  onChange: (color: string) => void
  background?: string
  level?: 'AA' | 'AAA'
  className?: string
}

export function WCAGColorPicker({
  value,
  onChange,
  background = '#000000',
  level = 'AA',
  className
}: WCAGColorPickerProps) {
  const [suggestions, setSuggestions] = useState<{
    aa: string
    aaa: string
  }>({ aa: value, aaa: value })

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import('@/lib/color-contrast-audit').then(({ enhanceForWCAG_AA, enhanceForWCAG_AAA }) => {
      setSuggestions({
        aa: enhanceForWCAG_AA(value, background),
        aaa: enhanceForWCAG_AAA(value, background)
      })
    })
  }, [value, background])

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-neutral-600"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-xs bg-neutral-800 border border-neutral-600 rounded text-white"
          placeholder="#000000"
        />
      </div>

      <ContrastQuickCheck
        foreground={value}
        background={background}
        className="justify-center"
      />

      {suggestions.aa !== value && (
        <div className="space-y-1">
          <button
            onClick={() => onChange(suggestions.aa)}
            className="w-full text-left px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded text-white"
          >
            WCAG AA: {suggestions.aa}
          </button>
          
          {level === 'AAA' && suggestions.aaa !== value && (
            <button
              onClick={() => onChange(suggestions.aaa)}
              className="w-full text-left px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded text-white"
            >
              WCAG AAA: {suggestions.aaa}
            </button>
          )}
        </div>
      )}
    </div>
  )
}