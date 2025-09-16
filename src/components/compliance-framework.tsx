"use client"

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Database, 
  Lock, 
  Eye,
  Download,
  Calendar
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ComplianceCheck {
  id: string
  check_type: string
  status: 'passed' | 'failed' | 'warning' | 'pending'
  score: number
  description: string
  last_checked: string
  next_check_due: string
  details: Record<string, unknown>
  remediation_steps?: string[]
}

interface ComplianceFramework {
  business_id: string
  framework_type: string
  overall_score: number
  compliance_level: 'non_compliant' | 'basic' | 'standard' | 'enhanced' | 'premium'
  checks: ComplianceCheck[]
  last_assessment: string
  next_assessment_due: string
  certifications: string[]
  audit_trail: unknown[]
}

interface ComplianceFrameworkProps {
  businessId: string
  frameworkTypes?: string[]
  showAuditTrail?: boolean
}

const FRAMEWORK_TYPES = {
  gdpr: 'GDPR Compliance',
  hipaa: 'HIPAA Compliance', 
  sox: 'SOX Compliance',
  pci_dss: 'PCI DSS Compliance',
  iso_27001: 'ISO 27001 Compliance',
  ccpa: 'CCPA Compliance',
  general: 'General Business Compliance'
}

const COMPLIANCE_LEVELS = {
  non_compliant: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
  basic: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertTriangle },
  standard: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Shield },
  enhanced: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  premium: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: CheckCircle }
}

const CHECK_STATUS_ICONS = {
  passed: CheckCircle,
  failed: XCircle,
  warning: AlertTriangle,
  pending: Clock
}

const CHECK_STATUS_COLORS = {
  passed: 'text-green-600',
  failed: 'text-red-600',
  warning: 'text-yellow-600',
  pending: 'text-blue-600'
}

export function ComplianceFramework({ 
  businessId, 
  frameworkTypes = ['general'], 
  showAuditTrail = false 
}: ComplianceFrameworkProps) {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)

  useEffect(() => {
    fetchComplianceData()
  }, [businessId, frameworkTypes])

  const fetchComplianceData = async () => {
    try {
      setLoading(true)
      
      // Fetch compliance framework data from our AI verification system
      const { data, error } = await supabase
        .from('ai_mgmt.verification_results')
        .select('
          *,
          compliance_checks:ai_mgmt.compliance_checks(*)
        ')
        .eq('business_id', businessId)
        .in('verification_type', frameworkTypes)

      if (error) {
        throw error
      }

      // Transform data into compliance framework format
      const frameworkData = frameworkTypes.map(type => {
        const verificationData = data?.find(d => d.verification_type === type)
        
        return {
          business_id: businessId,
          framework_type: type,
          overall_score: verificationData?.verification_score || 0,
          compliance_level: getComplianceLevel(verificationData?.verification_score || 0),
          checks: generateComplianceChecks(type, verificationData),
          last_assessment: verificationData?.created_at || new Date().toISOString(),
          next_assessment_due: getNextAssessmentDate(verificationData?.created_at),
          certifications: verificationData?.certifications || [],
          audit_trail: verificationData?.audit_trail || []
        }
      })

      setFrameworks(frameworkData)
      if (frameworkData.length > 0 && !selectedFramework) {
        setSelectedFramework(frameworkData[0].framework_type)
      }

    } catch (err) {
      console.error('Error fetching compliance data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load compliance data')
    } finally {
      setLoading(false)
    }
  }

  const getComplianceLevel = (score: number): ComplianceFramework['compliance_level'] => {
    if (score >= 95) return 'premium'
    if (score >= 85) return 'enhanced'
    if (score >= 70) return 'standard'
    if (score >= 50) return 'basic'
    return 'non_compliant'
  }

  const getNextAssessmentDate = (lastAssessment?: string) => {
    const last = new Date(lastAssessment || Date.now())
    const next = new Date(last)
    next.setMonth(next.getMonth() + 6) // 6-month reassessment cycle
    return next.toISOString()
  }

  const generateComplianceChecks = (frameworkType: string, verificationData: unknown): ComplianceCheck[] => {
    const baseChecks = [
      {
        id: '${frameworkType}-data-protection',
        check_type: 'data_protection',
        status: verificationData?.verification_score > 70 ? 'passed' : 'warning',
        score: verificationData?.verification_score || 0,
        description: 'Data protection and privacy policies implementation',
        last_checked: verificationData?.created_at || new Date().toISOString(),
        next_check_due: getNextAssessmentDate(verificationData?.created_at),
        details: verificationData?.verification_details || {}
      },
      {
        id: '${frameworkType}-security',
        check_type: 'security_controls',
        status: verificationData?.verification_score > 80 ? 'passed' : 'warning',
        score: Math.min((verificationData?.verification_score || 0) + 10, 100),
        description: 'Security controls and access management',
        last_checked: verificationData?.created_at || new Date().toISOString(),
        next_check_due: getNextAssessmentDate(verificationData?.created_at),
        details: verificationData?.security_details || {}
      },
      {
        id: '${frameworkType}-documentation',
        check_type: 'documentation',
        status: verificationData?.verification_score > 60 ? 'passed' : 'pending',
        score: Math.max((verificationData?.verification_score || 0) - 20, 0),
        description: 'Required documentation and record keeping',
        last_checked: verificationData?.created_at || new Date().toISOString(),
        next_check_due: getNextAssessmentDate(verificationData?.created_at),
        details: verificationData?.documentation_details || {}
      }
    ]

    // Add framework-specific checks
    if (frameworkType === 'gdpr') {
      baseChecks.push({
        id: 'gdpr-consent',
        check_type: 'consent_management',
        status: 'pending',
        score: 75,
        description: 'GDPR consent management and user rights implementation',
        last_checked: new Date().toISOString(),
        next_check_due: getNextAssessmentDate(),
        details: Record<string, unknown>,
        remediation_steps: [
          'Implement explicit consent mechanisms',
          'Provide clear data processing notices',
          'Enable user data deletion requests',
          'Maintain consent records'
        ]
      })
    }

    return baseChecks as ComplianceCheck[]
  }

  const runComplianceCheck = async (frameworkType: string) => {
    try {
      setLoading(true)
      
      // Trigger AI compliance verification
      const response = await fetch('/api/v1/compliance/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          framework_type: frameworkType,
          full_assessment: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to run compliance check')
      }

      const result = await response.json()
      
      // Refresh compliance data
      await fetchComplianceData()
      
    } catch (err) {
      console.error('Error running compliance check:', err)
      setError(err instanceof Error ? err.message : 'Failed to run compliance check')
    } finally {
      setLoading(false)
    }
  }

  const exportComplianceReport = async (frameworkType: string) => {
    try {
      const response = await fetch('/api/v1/compliance/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          framework_type: frameworkType,
          format: 'pdf'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'compliance-report-${frameworkType}-${new Date().toISOString().split('T')[0]}.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (err) {
      console.error('Error exporting report:', err)
    }
  }

  if (loading && frameworks.length === 0) {
    return (
      <div className="flex items-center space-x-2 p-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-neutral-600">Loading compliance frameworks...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const currentFramework = frameworks.find(f => f.framework_type === selectedFramework) || frameworks[0]

  if (!currentFramework) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No compliance frameworks configured for this business.</AlertDescription>
      </Alert>
    )
  }

  const complianceConfig = COMPLIANCE_LEVELS[currentFramework.compliance_level]
  const ComplianceLevelIcon = complianceConfig.icon

  return (
    <div className="space-y-6">
      {/* Framework Selection */}
      {frameworks.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {frameworks.map((framework) => (
            <Button
              key={framework.framework_type}
              variant={selectedFramework === framework.framework_type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFramework(framework.framework_type)}
              className="whitespace-nowrap"
            >
              {FRAMEWORK_TYPES[framework.framework_type as keyof typeof FRAMEWORK_TYPES] || framework.framework_type}
            </Button>
          ))}
        </div>
      )}

      {/* Overall Compliance Status */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <ComplianceLevelIcon className="h-5 w-5" />
              <span>{FRAMEWORK_TYPES[currentFramework.framework_type as keyof typeof FRAMEWORK_TYPES]}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={complianceConfig.color}>
                {currentFramework.compliance_level.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => runComplianceCheck(currentFramework.framework_type)}
                disabled={loading}
              >
                <Shield className="h-4 w-4 mr-1" />
                Re-assess
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Compliance Score</span>
              <span className="text-lg font-bold text-blue-600">
                {currentFramework.overall_score}/100
              </span>
            </div>
            <Progress value={currentFramework.overall_score} className="h-2" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {currentFramework.checks.filter(c => c.status === 'passed').length}
              </div>
              <div className="text-xs text-neutral-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {currentFramework.checks.filter(c => c.status === 'warning').length}
              </div>
              <div className="text-xs text-neutral-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {currentFramework.checks.filter(c => c.status === 'failed`).length}
              </div>
              <div className="text-xs text-neutral-600">Failed</div>
            </div>
          </div>

          {/* Last Assessment */}
          <div className="flex items-center justify-between text-xs text-neutral-500 border-t pt-2">
            <span>Last assessed: {new Date(currentFramework.last_assessment).toLocaleDateString()}</span>
            <span>Next due: {new Date(currentFramework.next_assessment_due).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Compliance Checks</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportComplianceReport(currentFramework.framework_type)}
            >
              <Download className="h-4 w-4 mr-1" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentFramework.checks.map((check) => {
            const StatusIcon = CHECK_STATUS_ICONS[check.status]
            const statusColor = CHECK_STATUS_COLORS[check.status]
            
            return (
              <div key={check.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <StatusIcon className={`h-5 w-5 ${statusColor} mt-0.5'} />
                    <div>
                      <h4 className="font-medium text-sm">{check.description}</h4>
                      <p className="text-xs text-neutral-600">
                        Last checked: {new Date(check.last_checked).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{check.score}/100</div>
                    <Badge 
                      variant="outline" 
                      className={'text-xs ${CHECK_STATUS_COLORS[check.status]}'}
                    >
                      {check.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {check.status === 'failed' && check.remediation_steps && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <h5 className="text-xs font-medium text-red-700 mb-2">Required Actions:</h5>
                    <ul className="text-xs text-red-600 space-y-1">
                      {check.remediation_steps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Progress value={check.score} className="h-1" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Certifications */}
      {currentFramework.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Active Certifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentFramework.certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="justify-start p-2">
                  <FileText className="h-3 w-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail */}
      {showAuditTrail && currentFramework.audit_trail.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Audit Trail</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentFramework.audit_trail.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-neutral-400" />
                    <span>{entry.action || 'Assessment completed'}</span>
                  </div>
                  <span className="text-neutral-500 text-xs">
                    {new Date(entry.timestamp || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ComplianceFramework