import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface ComplianceVerificationRequest {
  business_id: string
  framework_type: string
  full_assessment: boolean
}

interface ComplianceCheck {
  check_type: string
  status: 'passed' | 'failed' | 'warning' | 'pending'
  score: number
  description: string
  details: Record<string, unknown>
  remediation_steps?: string[]
}

// Compliance framework configurations
const COMPLIANCE_FRAMEWORKS = {
  gdpr: {
    name: 'GDPR Compliance',
    required_checks: [
      'data_protection_policy',
      'consent_management',
      'data_breach_procedures',
      'user_rights_implementation',
      'data_processing_records',
      'privacy_impact_assessment'
    ],
    passing_score: 85
  },
  hipaa: {
    name: 'HIPAA Compliance',
    required_checks: [
      'administrative_safeguards',
      'physical_safeguards', 
      'technical_safeguards',
      'breach_notification',
      'business_associate_agreements',
      'risk_assessment'
    ],
    passing_score: 90
  },
  pci_dss: {
    name: 'PCI DSS Compliance',
    required_checks: [
      'firewall_configuration',
      'password_security',
      'cardholder_data_protection',
      'encryption_in_transit',
      'vulnerability_management',
      'access_control'
    ],
    passing_score: 95
  },
  general: {
    name: 'General Business Compliance',
    required_checks: [
      'business_registration',
      'tax_compliance',
      'licensing_requirements',
      'insurance_coverage',
      'employment_law_compliance',
      'environmental_compliance'
    ],
    passing_score: 70
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ComplianceVerificationRequest = await request.json()
    const { business_id, framework_type, full_assessment } = body

    if (!business_id || !framework_type) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id, framework_type' },
        { status: 400 }
      )
    }

    const framework = COMPLIANCE_FRAMEWORKS[framework_type as keyof typeof COMPLIANCE_FRAMEWORKS]
    if (!framework) {
      return NextResponse.json(
        { error: 'Unsupported framework type: ${framework_type}' },
        { status: 400 }
      )
    }

    // Fetch business data for verification
    const { data: businessData, error: businessError } = await supabase
      .from('directory.business_submissions')
      .select('*')
      .eq('id', business_id)
      .single()

    if (businessError || !businessData) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Run AI-powered compliance verification
    const complianceChecks = await runComplianceVerification(
      businessData,
      framework_type,
      framework,
      full_assessment
    )

    // Calculate overall compliance score
    const overallScore = calculateOverallScore(complianceChecks)
    const complianceLevel = getComplianceLevel(overallScore, framework.passing_score)

    // Store verification results
    const verificationResult = {
      business_id,
      verification_type: framework_type,
      verification_score: overallScore,
      compliance_level: complianceLevel,
      framework_name: framework.name,
      checks: complianceChecks,
      verification_details: {
        framework_type,
        checks_performed: complianceChecks.length,
        passing_score_required: framework.passing_score,
        full_assessment,
        assessed_at: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      expires_at: getExpirationDate()
    }

    const { data: savedResult, error: saveError } = await supabase
      .from('ai_mgmt.verification_results')
      .upsert(verificationResult, { 
        onConflict: 'business_id,verification_type' 
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving verification result:', saveError)
      return NextResponse.json(
        { error: 'Failed to save verification results' },
        { status: 500 }
      )
    }

    // Update business trust badges and compliance status
    await updateBusinessCompliance(business_id, framework_type, overallScore, complianceLevel)

    return NextResponse.json({
      success: true,
      verification_result: savedResult,
      compliance_score: overallScore,
      compliance_level: complianceLevel,
      framework: framework.name,
      checks: complianceChecks
    })

  } catch (error) {
    console.error('Error in compliance verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function runComplianceVerification(businessData: unknown,
  frameworkType: string, framework: unknown,
  fullAssessment: boolean
): Promise<ComplianceCheck[]> {
  const checks: ComplianceCheck[] = []

  // Run framework-specific compliance checks
  switch (frameworkType) {
    case 'gdpr':
      checks.push(...await runGDPRChecks(businessData, fullAssessment))
      break
    case 'hipaa':
      checks.push(...await runHIPAAChecks(businessData, fullAssessment))
      break
    case 'pci_dss':
      checks.push(...await runPCIDSSChecks(businessData, fullAssessment))
      break
    case 'general':
    default:
      checks.push(...await runGeneralComplianceChecks(businessData, fullAssessment))
      break
  }

  return checks
}

async function runGDPRChecks(businessData: unknown, fullAssessment: boolean): Promise<ComplianceCheck[]> {
  return [
    {
      check_type: 'data_protection_policy',
      status: businessData.privacy_policy_url ? 'passed' : 'failed',
      score: businessData.privacy_policy_url ? 95 : 25,
      description: 'Data protection policy and privacy notice implementation',
      details: {
        has_privacy_policy: !!businessData.privacy_policy_url,
        policy_url: businessData.privacy_policy_url,
        last_updated: businessData.privacy_policy_updated || null
      },
      remediation_steps: !businessData.privacy_policy_url ? [
        'Create comprehensive privacy policy',
        'Publish privacy notice on website',
        'Include data processing purposes and legal basis',
        'Provide contact information for data protection'
      ] : undefined
    },
    {
      check_type: 'consent_management',
      status: businessData.consent_mechanism ? 'passed' : 'warning',
      score: businessData.consent_mechanism ? 85 : 45,
      description: 'User consent collection and management system',
      details: {
        has_consent_system: !!businessData.consent_mechanism,
        consent_types: businessData.consent_types || [],
        withdrawal_mechanism: businessData.consent_withdrawal || false
      },
      remediation_steps: !businessData.consent_mechanism ? [
        'Implement explicit consent mechanisms',
        'Provide granular consent options',
        'Enable easy consent withdrawal',
        'Maintain consent records'
      ] : undefined
    },
    {
      check_type: 'user_rights_implementation',
      status: businessData.user_rights_portal ? 'passed' : 'failed',
      score: businessData.user_rights_portal ? 90 : 30,
      description: 'Implementation of user rights (access, rectification, deletion)',
      details: {
        has_rights_portal: !!businessData.user_rights_portal,
        supported_rights: businessData.supported_rights || [],
        response_time: businessData.rights_response_time || null
      },
      remediation_steps: !businessData.user_rights_portal ? [
        'Create user rights request portal',
        'Implement data access functionality',
        'Enable data deletion requests',
        'Establish 30-day response process'
      ] : undefined
    }
  ]
}

async function runHIPAAChecks(businessData: unknown, fullAssessment: boolean): Promise<ComplianceCheck[]> {
  return [
    {
      check_type: 'administrative_safeguards',
      status: businessData.hipaa_officer ? 'passed' : 'failed',
      score: businessData.hipaa_officer ? 88 : 20,
      description: 'Administrative safeguards and HIPAA officer designation',
      details: {
        has_hipaa_officer: !!businessData.hipaa_officer,
        training_program: businessData.hipaa_training || false,
        policies_documented: businessData.hipaa_policies || false
      },
      remediation_steps: !businessData.hipaa_officer ? [
        'Designate HIPAA Security Officer',
        'Implement workforce training program',
        'Document administrative policies',
        'Conduct regular risk assessments'
      ] : undefined
    },
    {
      check_type: 'technical_safeguards',
      status: businessData.encryption_at_rest && businessData.encryption_in_transit ? 'passed' : 'failed',
      score: (businessData.encryption_at_rest && businessData.encryption_in_transit) ? 92 : 35,
      description: 'Technical safeguards including encryption and access controls',
      details: {
        encryption_at_rest: businessData.encryption_at_rest || false,
        encryption_in_transit: businessData.encryption_in_transit || false,
        access_controls: businessData.access_controls || false,
        audit_logging: businessData.audit_logging || false
      },
      remediation_steps: !(businessData.encryption_at_rest && businessData.encryption_in_transit) ? [
        'Implement end-to-end encryption',
        'Enable access logging and monitoring',
        'Set up automatic logoff mechanisms',
        'Deploy intrusion detection systems'
      ] : undefined
    }
  ]
}

async function runPCIDSSChecks(businessData: unknown, fullAssessment: boolean): Promise<ComplianceCheck[]> {
  return [
    {
      check_type: 'cardholder_data_protection',
      status: businessData.pci_compliant ? 'passed' : 'failed',
      score: businessData.pci_compliant ? 95 : 15,
      description: 'Cardholder data protection and secure storage',
      details: {
        pci_certified: businessData.pci_compliant || false,
        data_encrypted: businessData.card_data_encryption || false,
        secure_storage: businessData.secure_storage || false,
        tokenization: businessData.tokenization || false
      },
      remediation_steps: !businessData.pci_compliant ? [
        'Implement PCI DSS compliant payment processing',
        'Encrypt all cardholder data',
        'Use secure payment processors',
        'Obtain PCI DSS certification'
      ] : undefined
    }
  ]
}

async function runGeneralComplianceChecks(businessData: unknown, fullAssessment: boolean): Promise<ComplianceCheck[]> {
  return [
    {
      check_type: 'business_registration',
      status: businessData.business_license ? 'passed' : 'failed',
      score: businessData.business_license ? 90 : 30,
      description: 'Business registration and licensing requirements',
      details: {
        has_business_license: !!businessData.business_license,
        license_number: businessData.license_number,
        license_expiry: businessData.license_expiry,
        registration_state: businessData.business_state
      },
      remediation_steps: !businessData.business_license ? [
        'Obtain required business license',
        'Register with appropriate authorities',
        'Maintain current registration status',
        'Update license information regularly'
      ] : undefined
    },
    {
      check_type: 'tax_compliance',
      status: businessData.tax_id ? 'passed' : 'warning',
      score: businessData.tax_id ? 85 : 50,
      description: 'Tax registration and compliance status',
      details: {
        has_tax_id: !!businessData.tax_id,
        tax_registration: businessData.tax_registration || false,
        sales_tax_permit: businessData.sales_tax_permit || false
      },
      remediation_steps: !businessData.tax_id ? [
        'Obtain Federal Tax ID (EIN)',
        'Register for state and local taxes',
        'Set up sales tax collection if applicable',
        'Maintain current tax filings'
      ] : undefined
    },
    {
      check_type: 'insurance_coverage',
      status: businessData.insurance_coverage ? 'passed' : 'warning',
      score: businessData.insurance_coverage ? 75 : 40,
      description: 'Business insurance and liability coverage',
      details: {
        has_insurance: !!businessData.insurance_coverage,
        coverage_types: businessData.insurance_types || [],
        coverage_amounts: businessData.coverage_amounts || {},
        policy_expiry: businessData.insurance_expiry
      },
      remediation_steps: !businessData.insurance_coverage ? [
        'Obtain business liability insurance',
        'Consider professional indemnity insurance',
        'Maintain adequate coverage levels',
        'Keep policies current and accessible'
      ] : undefined
    }
  ]
}

function calculateOverallScore(checks: ComplianceCheck[]): number {
  if (checks.length === 0) return 0
  const totalScore = checks.reduce((sum, check) => sum + check.score, 0)
  return Math.round(totalScore / checks.length)
}

function getComplianceLevel(score: number, passingScore: number): string {
  if (score >= passingScore) return 'compliant'
  if (score >= passingScore * 0.8) return 'mostly_compliant'
  if (score >= passingScore * 0.6) return 'partially_compliant'
  return 'non_compliant'
}

function getExpirationDate(): string {
  const expiry = new Date()
  expiry.setMonth(expiry.getMonth() + 6) // 6 months validity
  return expiry.toISOString()
}

async function updateBusinessCompliance(
  businessId: string, 
  frameworkType: string, 
  score: number, 
  level: string
) {
  try {
    // Update business compliance status
    const { error } = await supabase
      .from('directory.business_submissions')
      .update({
        compliance_status: level,
        compliance_score: score,
        compliance_frameworks: [frameworkType],
        compliance_last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)

    if (error) {
      console.error('Error updating business compliance:', error)
    }

    // Add compliance badge if meeting requirements
    if (level === 'compliant') {
      const badgeType = '${frameworkType}_compliant'
      
      await supabase.rpc('add_trust_badge', {
        p_business_id: businessId,
        p_badge_type: badgeType,
        p_badge_level: 'verified',
        p_verification_score: score,
        p_expires_at: getExpirationDate()
      })
    }

  } catch (error) {
    console.error('Error updating business compliance status:', error)
  }
}