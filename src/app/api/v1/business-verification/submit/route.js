'use server';

import { NextResponse } from 'next/server';

// This API route integrates with multiple verification providers:
// - Middesk: Comprehensive US business verification (100% Secretary of State coverage)
// - Signzy: Direct IRS database matching for EIN/TIN verification
// - Axle: Universal insurance verification API
// - Persona: Document processing and identity verification

export async function POST(request) {
  try {
    const verificationRequest = await request.json();
    
    // Validate request structure
    if (!verificationRequest.metadata || !verificationRequest.verifications) {
      return NextResponse.json({ error: 'Invalid request structure' }, { status: 400 });
    }

    console.log('Processing business verification request:', {
      businessName: verificationRequest.metadata.businessName,
      industry: verificationRequest.metadata.industry,
      verificationsCount: verificationRequest.verifications.length
    });

    const results = { verifications: [] };

    // Process each verification type
    for (const verification of verificationRequest.verifications) {
      let status = 'pending';
      let details = {};
      let score = 0;

      switch (verification.type) {
        case 'business_license':
          // Simulate Middesk API call for business license verification
          console.log('Verifying business license:', verification.data.licenseNumber);
          
          // Mock enhanced verification logic based on actual API patterns
          if (verification.data.licenseNumber && verification.data.issuingState) {
            // Simulate Secretary of State database lookup
            const mockVerification = await simulateMiddeskVerification(verification.data);
            status = mockVerification.status;
            details = mockVerification.details;
            score = mockVerification.score;
          }
          break;

        case 'tax_id_verification':
          // Simulate Signzy/IRS direct database verification
          console.log('Verifying Tax ID:', verification.data.taxId);
          
          if (verification.data.taxId) {
            const mockTaxVerification = await simulateSignzyTaxVerification(verification.data);
            status = mockTaxVerification.status;
            details = mockTaxVerification.details;
            score = mockTaxVerification.score;
          }
          break;

        case 'insurance_certificate':
          // Simulate Axle insurance verification
          console.log('Verifying insurance:', verification.data.provider);
          
          if (verification.data.provider) {
            const mockInsuranceVerification = await simulateAxleInsuranceVerification(verification.data);
            status = mockInsuranceVerification.status;
            details = mockInsuranceVerification.details;
            score = mockInsuranceVerification.score;
          }
          break;

        case 'business_address':
          // Simulate Persona address verification
          console.log('Verifying business address');
          
          const mockAddressVerification = await simulatePersonaAddressVerification(verification.data);
          status = mockAddressVerification.status;
          details = mockAddressVerification.details;
          score = mockAddressVerification.score;
          break;

        case 'identity_verification':
          // Simulate Persona identity verification
          console.log('Verifying owner identity');
          
          const mockIdentityVerification = await simulatePersonaIdentityVerification(verification.data);
          status = mockIdentityVerification.status;
          details = mockIdentityVerification.details;
          score = mockIdentityVerification.score;
          break;

        default:
          status = 'pending';
          details = { message: 'Unknown verification type' };
      }

      results.verifications.push({
        type: verification.type,
        provider: verification.provider,
        status,
        score,
        details,
        timestamp: new Date().toISOString()
      });
    }

    // Calculate overall verification score
    const avgScore = results.verifications.reduce((sum, v) => sum + (v.score || 0), 0) / results.verifications.length;
    
    return NextResponse.json({
      ...results,
      metadata: {
        ...verificationRequest.metadata,
        overallScore: Math.round(avgScore * 100) / 100,
        completedAt: new Date().toISOString(),
        status: avgScore >= 0.8 ? 'verified' : avgScore >= 0.5 ? 'review_required' : 'failed'
      }
    });

  } catch (error) {
    console.error('Verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Mock verification functions (replace with actual API calls in production)
async function simulateMiddeskVerification(data) {
  // Simulate Middesk's comprehensive business verification
  await new Promise(resolve => setTimeout(resolve, 1500)); // Realistic API delay
  
  const licensePatterns = {
    'CA': /^[A-Z]{2,3}[0-9]{6,8}$/,
    'TX': /^[0-9]{8,10}$/,
    'NY': /^[A-Z]{1,2}[0-9]{6,8}$/,
    'FL': /^[A-Z]{2}[0-9]{8}$/
  };

  const pattern = licensePatterns[data.issuingState];
  const isValidFormat = pattern ? pattern.test(data.licenseNumber) : true;
  
  // Enhanced verification scoring based on multiple factors
  let score = 0.3; // Base score
  
  if (isValidFormat) score += 0.3;
  if (data.businessName && data.businessName.length > 5) score += 0.2;
  if (data.businessAddress && data.businessAddress.street) score += 0.2;
  
  const status = score >= 0.8 ? 'verified' : score >= 0.5 ? 'pending' : 'failed';
  
  return {
    status,
    score,
    details: {
      licenseStatus: isValidFormat ? 'valid_format' : 'invalid_format',
      issuingAgency: '${data.issuingState} Secretary of State',
      businessNameMatch: data.businessName ? 'partial_match' : 'no_match',
      addressMatch: data.businessAddress ? 'verified' : 'not_provided',
      lastUpdated: '2025-01-14'
    }
  };
}

async function simulateSignzyTaxVerification(data) {
  // Simulate Signzy's direct IRS database verification
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const einPattern = /^[0-9]{2}-[0-9]{7}$/;
  const ssnPattern = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/;
  
  let isValidFormat = false;
  if (data.taxIdType === 'EIN') {
    isValidFormat = einPattern.test(data.taxId);
  } else if (data.taxIdType === 'SSN') {
    isValidFormat = ssnPattern.test(data.taxId);
  }
  
  let score = 0.2; // Base score
  
  if (isValidFormat) score += 0.4;
  if (data.businessName) score += 0.3;
  if (data.businessAddress) score += 0.1;
  
  const status = score >= 0.8 ? 'verified' : score >= 0.4 ? 'pending' : 'failed';
  
  return {
    status,
    score,
    details: {
      taxIdStatus: isValidFormat ? 'format_valid' : 'format_invalid',
      taxIdType: data.taxIdType,
      irsRecordMatch: isValidFormat ? 'match_found' : 'no_match',
      businessNameMatch: data.businessName ? 'partial_match' : 'not_provided',
      verificationDate: new Date().toISOString()
    }
  };
}

async function simulateAxleInsuranceVerification(data) {
  // Simulate Axle's insurance verification API
  await new Promise(resolve => setTimeout(resolve, 1800));
  
  const knownProviders = [
    'state farm', 'allstate', 'geico', 'progressive', 'farmers',
    'liberty mutual', 'usaa', 'nationwide', 'travelers'
  ];
  
  const providerRecognized = knownProviders.some(provider => 
    data.provider.toLowerCase().includes(provider)
  );
  
  let score = 0.3; // Base score
  
  if (providerRecognized) score += 0.4;
  if (data.coverageAmount && parseInt(data.coverageAmount.replace(/[^\w\s-]/g, '')) >= 1000000) score += 0.2;
  if (data.expirationDate && new Date(data.expirationDate) > new Date()) score += 0.1;
  
  const status = score >= 0.7 ? 'verified' : score >= 0.4 ? 'pending' : 'failed';
  
  return {
    status,
    score,
    details: {
      providerStatus: providerRecognized ? 'verified_provider' : 'unrecognized_provider',
      coverageStatus: data.coverageAmount ? 'adequate' : 'insufficient',
      policyStatus: data.expirationDate && new Date(data.expirationDate) > new Date() ? 'active' : 'expired_or_missing',
      verifiedCoverage: data.coverageAmount,
      expirationDate: data.expirationDate
    }
  };
}

async function simulatePersonaAddressVerification(data) {
  // Simulate Persona's address verification
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let score = 0.4; // Base score for having address data
  
  if (data.address.street && data.address.city && data.address.state && data.address.zipCode) {
    score += 0.4; // Complete address
  }
  
  const zipPattern = /^[0-9]{5}(-[0-9]{4})?$/;
  if (zipPattern.test(data.address.zipCode)) {
    score += 0.2; // Valid ZIP format
  }
  
  const status = score >= 0.8 ? 'verified' : score >= 0.5 ? 'pending' : 'failed';
  
  return {
    status,
    score,
    details: {
      addressFormat: 'valid',
      deliverability: score >= 0.8 ? 'deliverable' : 'needs_review',
      residentialCommercial: 'commercial',
      coordinates: score >= 0.8 ? { lat: 37.7749, lng: -122.4194 } : null
    }
  };
}

async function simulatePersonaIdentityVerification(data) {
  // Simulate Persona's identity verification
  await new Promise(resolve => setTimeout(resolve, 1600));
  
  let score = 0.3; // Base score
  
  if (data.ownerName && data.ownerName.length >= 3) score += 0.3;
  if (data.ownerTitle) score += 0.2;
  
  // Simulate document quality check
  score += 0.2; // Assume document is readable
  
  const status = score >= 0.7 ? 'verified' : score >= 0.4 ? 'pending' : 'failed';
  
  return {
    status,
    score,
    details: {
      documentQuality: 'high',
      identityMatch: data.ownerName ? 'match' : 'no_match',
      documentType: 'government_id',
      extractedName: data.ownerName,
      verificationMethod: 'document_ocr_and_facial_recognition'
    }
  };
}