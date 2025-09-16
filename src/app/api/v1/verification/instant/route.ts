import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface InstantVerificationRequest {
  businessName: string
  licenseNumber?: string
  issuingState?: string
  taxId?: string
  taxIdType?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: InstantVerificationRequest = await request.json()
    const { businessName, licenseNumber, issuingState, taxId, taxIdType } = body

    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      )
    }

    const verificationResults: Record<string, string> = {}

    // Business License Verification
    if (licenseNumber && issuingState) {
      const licenseResult = await verifyBusinessLicense(licenseNumber, issuingState, businessName)
      verificationResults.businessLicense = licenseResult.status
    }

    // Tax ID/EIN Verification
    if (taxId && taxIdType) {
      const taxIdResult = await verifyTaxId(taxId, taxIdType, businessName)
      verificationResults.taxId = taxIdResult.status
    }

    // Calculate overall verification score
    const verifiedCount = Object.values(verificationResults).filter(status => status === 'verified').length
    const totalChecks = Object.keys(verificationResults).length
    const verificationScore = totalChecks > 0 ? Math.round((verifiedCount / totalChecks) * 100) : 0

    return NextResponse.json({
      success: true,
      verificationResults,
      verificationScore,
      verificationSummary: {
        total_checks: totalChecks,
        verified_count: verifiedCount,
        pending_count: Object.values(verificationResults).filter(status => status === 'pending').length,
        failed_count: Object.values(verificationResults).filter(status => status === 'failed').length
      }
    })

  } catch (error) {
    console.error('Error in instant verification:', error)
    return NextResponse.json(
      { error: 'Verification service unavailable' },
      { status: 500 }
    )
  }
}

async function verifyBusinessLicense(licenseNumber: string, issuingState: string, businessName: string) {
  try {
    // Simulate business license verification
    // In production, this would integrate with:
    // - Middesk API for comprehensive business verification
    // - State-specific business license databases
    // - Secretary of State APIs for business registration verification
    
    // Mock verification logic based on realistic patterns
    const mockVerificationDelay = Math.random() * 2000 + 1000 // 1-3 seconds

    await new Promise(resolve => setTimeout(resolve, mockVerificationDelay))

    // Simulate verification success/failure based on license number pattern
    const isValidFormat = /^[A-Z]{1,3}[0-9]{4,8}$|^[0-9]{6,10}$/.test(licenseNumber)
    const hasValidState = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'].includes(issuingState)
    
    // Higher chance of verification if format is valid
    const verificationChance = isValidFormat && hasValidState ? 0.85 : 0.4
    const isVerified = Math.random() < verificationChance

    const result = {
      status: isVerified ? 'verified' : (Math.random() < 0.7 ? 'pending' : 'failed'),
      provider: 'middesk',
      verification_time: new Date().toISOString(),
      details: {
        license_number: licenseNumber,
        issuing_state: issuingState,
        business_name_match: isVerified,
        database_check: isVerified ? 'active' : 'pending_review'
      }
    }

    // Store verification attempt in database
    await supabase
      .from('ai_mgmt.verification_attempts')
      .insert({
        verification_type: 'business_license',
        input_data: {
          license_number: licenseNumber,
          issuing_state: issuingState,
          business_name: businessName
        },
        result: result,
        created_at: new Date().toISOString()
      })

    return result

  } catch (error) {
    console.error('Business license verification error:', error)
    return {
      status: 'pending',
      provider: 'manual_review',
      error: 'Verification service temporarily unavailable'
    }
  }
}

async function verifyTaxId(taxId: string, taxIdType: string, businessName: string) {
  try {
    // Simulate Tax ID/EIN verification
    // In production, this would integrate with:
    // - IRS Business Verification API
    // - Signzy for direct IRS database matching
    // - TIN Matching services for business verification
    
    const mockVerificationDelay = Math.random() * 3000 + 2000 // 2-5 seconds

    await new Promise(resolve => setTimeout(resolve, mockVerificationDelay))

    // Validate Tax ID format
    let isValidFormat = false
    if (taxIdType === 'EIN') {
      isValidFormat = /^[0-9]{2}-[0-9]{7}$/.test(taxId)
    } else if (taxIdType === 'SSN') {
      isValidFormat = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/.test(taxId)
    } else if (taxIdType === 'ITIN') {
      isValidFormat = /^9[0-9]{2}-[0-9]{2}-[0-9]{4}$/.test(taxId)
    }

    // Higher verification chance for EINs (business tax IDs)
    const verificationChance = taxIdType === 'EIN' && isValidFormat ? 0.9 : 0.6
    const isVerified = Math.random() < verificationChance

    const result = {
      status: isVerified ? 'verified' : (Math.random() < 0.8 ? 'pending' : 'failed'),
      provider: 'irs_tin_matching',
      verification_time: new Date().toISOString(),
      details: {
        tax_id_type: taxIdType,
        format_valid: isValidFormat,
        database_match: isVerified,
        business_name_match: isVerified
      }
    }

    // Store verification attempt
    await supabase
      .from('ai_mgmt.verification_attempts')
      .insert({
        verification_type: 'tax_id',
        input_data: {
          tax_id_type: taxIdType,
          business_name: businessName
          // Don't store the actual tax ID for security
        },
        result: result,
        created_at: new Date().toISOString()
      })

    return result

  } catch (error) {
    console.error('Tax ID verification error:', error)
    return {
      status: 'pending',
      provider: 'manual_review',
      error: 'Tax ID verification service temporarily unavailable'
    }
  }
}

// GET endpoint for checking verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const verificationType = searchParams.get('type')
    const businessName = searchParams.get('business_name')

    if (!verificationType || !businessName) {
      return NextResponse.json(
        { error: 'Verification type and business name are required' },
        { status: 400 }
      )
    }

    // Fetch recent verification attempts
    const { data, error } = await supabase
      .from('ai_mgmt.verification_attempts')
      .select('*')
      .eq('verification_type', verificationType)
      .ilike('input_data->business_name', '%${businessName}%')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      verification_attempts: data || []
    })

  } catch (error) {
    console.error('Error fetching verification status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    )
  }
}