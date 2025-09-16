import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface BusinessSubmissionData {
  businessName: string
  category: string
  phone: string
  email: string
  website?: string
  address: string
  city: string
  state: string
  zipCode: string
  serviceArea?: string
  description: string
  services: string
  yearsInBusiness?: number
  teamSize?: number
  licensed?: boolean
  insured?: boolean
  emergencyService?: boolean
  contactName?: string
  primaryPhone?: string
  secondaryPhone?: string
  businessHours?: string
  facebook?: string
  instagram?: string
  // Verification documents (file references)
  licenseNumber?: string
  issuingState?: string
  insuranceProvider?: string
  insuranceAmount?: string
  taxId?: string
  certifications?: string
  verificationConsent?: boolean
  // File upload metadata
  businessLicense?: any
  insuranceCert?: any
  addressProof?: any
  ownerId?: any
  certificationFiles?: unknown[]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract business data from form
    const businessData: BusinessSubmissionData = {
      businessName: formData.get('businessName') as string,
      category: formData.get('category') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string || undefined,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      serviceArea: formData.get('serviceArea') as string || undefined,
      description: formData.get('description') as string,
      services: formData.get('services') as string,
      yearsInBusiness: formData.get('yearsInBusiness') ? parseInt(formData.get('yearsInBusiness') as string) : undefined,
      teamSize: formData.get('teamSize') ? parseInt(formData.get('teamSize') as string) : undefined,
      licensed: formData.get('licensed') === 'true',
      insured: formData.get('insured') === 'true',
      emergencyService: formData.get('emergencyService') === 'true',
      contactName: formData.get('contactName') as string || undefined,
      primaryPhone: formData.get('primaryPhone') as string || undefined,
      secondaryPhone: formData.get('secondaryPhone') as string || undefined,
      businessHours: formData.get('businessHours') as string || undefined,
      facebook: formData.get('facebook') as string || undefined,
      instagram: formData.get('instagram') as string || undefined,
      licenseNumber: formData.get('licenseNumber') as string || undefined,
      issuingState: formData.get('issuingState') as string || undefined,
      insuranceProvider: formData.get('insuranceProvider') as string || undefined,
      insuranceAmount: formData.get('insuranceAmount') as string || undefined,
      taxId: formData.get('taxId') as string || undefined,
      certifications: formData.get('certifications') as string || undefined,
      verificationConsent: formData.get('verificationConsent') === 'true'
    }

    // Validate required fields
    const requiredFields = ['businessName', 'category', 'phone', 'email', 'address', 'city', 'state', 'zipCode', 'description', 'services']
    const missingFields = requiredFields.filter(field => !businessData[field as keyof BusinessSubmissionData])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields: ${missingFields.join(', ')}' },
        { status: 400 }
      )
    }

    // Validate verification consent for listings with verification documents
    const hasVerificationDocs = formData.get('businessLicense') || formData.get('licenseNumber')
    if (hasVerificationDocs && !businessData.verificationConsent) {
      return NextResponse.json(
        { error: 'Verification consent is required when submitting business documents' },
        { status: 400 }
      )
    }

    // Handle file uploads
    const uploadedFiles = await handleFileUploads(formData)

    // Calculate initial verification factors based on submission data
    const verificationFactors = calculateInitialVerificationFactors(businessData, uploadedFiles)

    // Create business submission record
    const submissionData = {
      // Basic business information
      business_name: businessData.businessName,
      business_category: businessData.category,
      phone_number: businessData.phone,
      email: businessData.email,
      website_url: businessData.website,
      
      // Address information
      address_line_1: businessData.address,
      city: businessData.city,
      state: businessData.state,
      postal_code: businessData.zipCode,
      country: 'US',
      
      // Business details
      business_description: businessData.description,
      services_offered: businessData.services,
      years_in_business: businessData.yearsInBusiness,
      employee_count: businessData.teamSize,
      service_area_radius: businessData.serviceArea ? parseInt(businessData.serviceArea) : null,
      
      // Service characteristics
      is_licensed: businessData.licensed,
      is_insured: businessData.insured,
      offers_emergency_service: businessData.emergencyService,
      
      // Contact information
      contact_person_name: businessData.contactName,
      primary_phone: businessData.primaryPhone,
      secondary_phone: businessData.secondaryPhone,
      business_hours: businessData.businessHours,
      
      // Social media
      facebook_url: businessData.facebook,
      instagram_url: businessData.instagram,
      
      // Verification information
      business_license: businessData.licenseNumber,
      license_state: businessData.issuingState,
      tax_id: businessData.taxId,
      insurance_provider: businessData.insuranceProvider,
      insurance_coverage: businessData.insuranceAmount,
      professional_certifications: businessData.certifications,
      
      // File references
      uploaded_documents: uploadedFiles,
      
      // Initial verification data
      verification_factors: verificationFactors,
      verification_score: calculateInitialScore(verificationFactors),
      
      // Status and metadata
      submission_status: hasVerificationDocs ? 'pending_review' : 'basic_listing',
      verification_consent_given: businessData.verificationConsent,
      submitted_at: new Date().toISOString(),
      
      // AI processing metadata
      requires_ai_verification: hasVerificationDocs,
      ai_verification_queued: false
    }

    // Insert business submission
    const { data: submission, error: insertError } = await supabase
      .from('directory.business_submissions')
      .insert(submissionData)
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating business submission:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit business information' },
        { status: 500 }
      )
    }

    // Queue for AI verification if documents were provided
    let verificationJobId = null
    if (hasVerificationDocs && submission) {
      try {
        const { data: jobData } = await supabase
          .rpc('queue_ai_verification', {
            p_business_id: submission.id,
            p_verification_type: 'comprehensive',
            p_priority: 5,
            p_metadata: {
              has_license: !!businessData.licenseNumber,
              has_insurance: !!businessData.insuranceProvider,
              has_tax_id: !!businessData.taxId,
              document_count: uploadedFiles.length,
              submission_source: 'web_form'
            }
          })

        verificationJobId = jobData
        
        // Update submission to mark as queued
        await supabase
          .from('directory.business_submissions')
          .update({ 
            ai_verification_queued: true,
            ai_verification_job_id: verificationJobId
          })
          .eq('id', submission.id)

      } catch (error) {
        console.error('Error queuing AI verification:', error)
        // Continue with submission even if AI queuing fails
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        business_name: submission.business_name,
        status: submission.submission_status,
        verification_job_id: verificationJobId,
        estimated_verification_time: hasVerificationDocs ? '24-48 hours' : 'immediate',
        next_steps: hasVerificationDocs 
          ? [
              'Documents are being reviewed by our verification team',
              'You will receive an email notification when verification is complete',
              'Your business will appear in search results once verified',
              'Create an account to manage your business listing'
            ]
          : [
              'Your basic listing is now live in our directory',
              'Consider adding verification documents for enhanced credibility',
              'Create an account to manage and enhance your listing'
            ]
      }
    })

  } catch (error) {
    console.error('Error processing business submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleFileUploads(formData: FormData): Promise<any[]> {
  const uploadedFiles: unknown[] = []
  
  // Handle different file types
  const fileFields = [
    'businessLicense',
    'insuranceCert', 
    'addressProof',
    'ownerId',
    'certificationFiles'
  ]

  for (const fieldName of fileFields) {
    const files = formData.getAll(fieldName) as File[]
    
    for (const file of files) {
      if (file && file.size > 0) {
        try {
          // In a real implementation, you would upload to a file storage service
          // For now, we'll store file metadata
          const fileMetadata = {
            field_name: fieldName,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            uploaded_at: new Date().toISOString(),
            // In production, you would upload the file and store the URL
            file_url: 'placeholder://files/${Date.now()}-${file.name}',
            verification_status: 'pending'
          }
          
          uploadedFiles.push(fileMetadata)
        } catch (error) {
          console.error('Error processing file ${file.name}:', error)
          // Continue processing other files
        }
      }
    }
  }

  return uploadedFiles
}

function calculateInitialVerificationFactors(businessData: BusinessSubmissionData, uploadedFiles: unknown[]): Record<string, number> {
  const factors = {
    contact_verification: 0,
    location_verification: 0,
    business_verification: 0,
    compliance_verification: 0,
    digital_presence_verification: 0,
    reputation_verification: 0
  }

  // Contact verification (email, phone)
  if (businessData.email) factors.contact_verification += 30
  if (businessData.phone) factors.contact_verification += 30
  if (businessData.primaryPhone && businessData.primaryPhone !== businessData.phone) factors.contact_verification += 20
  if (businessData.contactName) factors.contact_verification += 20

  // Location verification
  if (businessData.address && businessData.city && businessData.state && businessData.zipCode) {
    factors.location_verification += 60
  }
  if (businessData.serviceArea) factors.location_verification += 20
  if (uploadedFiles.some(f => f.field_name === 'addressProof')) factors.location_verification += 20

  // Business verification
  if (businessData.licenseNumber) factors.business_verification += 40
  if (businessData.taxId) factors.business_verification += 30
  if (uploadedFiles.some(f => f.field_name === 'businessLicense')) factors.business_verification += 30

  // Compliance verification
  if (businessData.licensed) factors.compliance_verification += 30
  if (businessData.insured) factors.compliance_verification += 30
  if (businessData.insuranceProvider) factors.compliance_verification += 20
  if (uploadedFiles.some(f => f.field_name === 'insuranceCert')) factors.compliance_verification += 20

  // Digital presence verification
  if (businessData.website) factors.digital_presence_verification += 40
  if (businessData.facebook) factors.digital_presence_verification += 15
  if (businessData.instagram) factors.digital_presence_verification += 15
  if (businessData.email && businessData.email.includes(businessData.businessName.toLowerCase().replace(/[^\w\s-]/g, ''))) {
    factors.digital_presence_verification += 30
  }

  // Reputation verification (initial assessment based on completeness)
  const completenessScore = Object.values(businessData).filter(v => v !== undefined && v !== ').length
  factors.reputation_verification = Math.min(completenessScore * 3, 100)

  return factors
}

function calculateInitialScore(verificationFactors: Record<string, number>): number {
  const weights = {
    contact_verification: 0.2,
    location_verification: 0.2,
    business_verification: 0.2,
    compliance_verification: 0.15,
    digital_presence_verification: 0.15,
    reputation_verification: 0.1
  }

  const totalScore = 0
  for (const [factor, score] of Object.entries(verificationFactors)) {
    totalScore += score * (weights[factor as keyof typeof weights] || 0)
  }

  return Math.round(Math.min(totalScore, 100))
}

// GET endpoint to retrieve business submission status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('id')
    const email = searchParams.get('email')

    if (!submissionId && !email) {
      return NextResponse.json(
        { error: 'Either submission ID or email is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('directory.business_submissions')
      .select('
        id,
        business_name,
        submission_status,
        verification_score,
        trust_badges,
        risk_level,
        submitted_at,
        verified_at,
        ai_verification_job_id
      ')

    if (submissionId) {
      query = query.eq('id', submissionId)
    } else {
      query = query.eq('email', email).order('submitted_at', { ascending: false }).limit(1)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Business submission not found' },
        { status: 404 }
      )
    }

    // Check AI verification job status if applicable
    let verificationStatus = null
    if (data.ai_verification_job_id) {
      const { data: jobData } = await supabase
        .from('ai_mgmt.ai_processing_queue')
        .select('status, created_at, completed_at, error_message')
        .eq('id', data.ai_verification_job_id)
        .single()

      verificationStatus = jobData
    }

    return NextResponse.json({
      submission: data,
      verification_job: verificationStatus
    })

  } catch (error) {
    console.error('Error fetching business submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}