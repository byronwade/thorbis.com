import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Business submission validation schema
const businessSubmissionSchema = z.object({
  // Basic Business Information
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  category: z.string().min(1, 'Business category is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  website: z.string().url().optional().or(z.literal(')),
  
  // Location Information
  address: z.string().min(5, 'Complete address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  serviceArea: z.string().optional(),
  
  // Services and Details
  description: z.string().min(20, 'Business description must be at least 20 characters'),
  services: z.string().min(10, 'Please describe your services'),
  yearsInBusiness: z.string().optional(),
  teamSize: z.string().optional(),
  
  // Certifications
  licensed: z.boolean().optional(),
  insured: z.boolean().optional(),
  emergencyService: z.boolean().optional(),
  
  // Contact Information (Optional)
  contactName: z.string().optional(),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  businessHours: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
});

// AI-powered business verification and geocoding
async function processBusinessSubmission(data: unknown) {
  try {
    // 1. Geocode the address using a geocoding service
    const fullAddress = '${data.address}, ${data.city}, ${data.state} ${data.zipCode}';
    
    // For now, we'll simulate geocoding - in production, integrate with Google Maps API or similar
    const mockCoordinates = {
      lat: 37.7749 + (Math.random() - 0.5) * 0.1,
      lng: -122.4194 + (Math.random() - 0.5) * 0.1
    };
    
    // 2. AI-powered business verification
    const verificationScore = await calculateBusinessVerificationScore(data);
    
    // 3. Trust badge assignment based on provided information
    const trustBadges = await assignInitialTrustBadges(data);
    
    // 4. Business classification and industry mapping
    const industryMapping = await mapToIndustrySchema(data.category);
    
    return {
      coordinates: mockCoordinates,
      verificationScore,
      trustBadges,
      industryMapping,
      riskLevel: verificationScore > 75 ? 'low' : verificationScore > 50 ? 'medium' : 'high'
    };
  } catch (error) {
    console.error('Error processing business submission:', error);
    throw error;
  }
}

// AI verification scoring system
async function calculateBusinessVerificationScore(data: unknown): Promise<number> {
  const score = 0;
  
  // Basic information completeness (30 points)
  if (data.businessName && data.phone && data.email) score += 15;
  if (data.website) score += 10;
  if (data.description && data.description.length > 50) score += 5;
  
  // Contact verification (25 points)
  if (data.email.includes(data.businessName.toLowerCase().replace(/[^\w\s-]/g, ''))) score += 10;
  if (data.website && data.website.includes(data.businessName.toLowerCase().replace(/[^\w\s-]/g, ''))) score += 15;
  
  // Professional indicators (25 points)
  if (data.licensed) score += 10;
  if (data.insured) score += 10;
  if (data.yearsInBusiness && parseInt(data.yearsInBusiness) > 2) score += 5;
  
  // Service completeness (20 points)
  if (data.services && data.services.length > 100) score += 10;
  if (data.businessHours) score += 5;
  if (data.serviceArea) score += 5;
  
  return Math.min(score, 100);
}

// Initial trust badge assignment
async function assignInitialTrustBadges(data: unknown): Promise<string[]> {
  const badges: string[] = [];
  
  if (data.licensed) badges.push('licensed_business');
  if (data.insured) badges.push('insured_business');
  if (data.emergencyService) badges.push('emergency_service');
  if (data.yearsInBusiness && parseInt(data.yearsInBusiness) > 5) badges.push('established_business');
  
  // AI-powered content analysis badges
  if (data.description.includes('certified') || data.description.includes('professional')) {
    badges.push('professional_service');
  }
  
  badges.push('directory_verified'); // Basic directory submission badge
  
  return badges;
}

// Industry classification mapping
async function mapToIndustrySchema(category: string): Promise<string> {
  const industryMap: { [key: string]: string } = {
    'home-services': 'hs',
    'restaurant': 'rest', 
    'auto-services': 'auto',
    'retail': 'ret',
    'healthcare': 'hs',
    'professional-services': 'hs',
    'beauty-wellness': 'hs',
    'education': 'courses',
    'real-estate': 'hs',
    'other': 'hs'
  };
  
  return industryMap[category] || 'hs';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the submission
    const validatedData = businessSubmissionSchema.parse(body);
    
    // Process the business submission with AI verification
    const processedData = await processBusinessSubmission(validatedData);
    
    // Create business submission record in database
    const { data: submission, error: submissionError } = await supabase
      .from('directory.business_submissions')
      .insert({
        // Basic Information
        business_name: validatedData.businessName,
        business_category: validatedData.category,
        primary_phone: validatedData.phone,
        primary_email: validatedData.email,
        website_url: validatedData.website || null,
        
        // Location
        address_line_1: validatedData.address,
        city: validatedData.city,
        state_province: validatedData.state,
        postal_code: validatedData.zipCode,
        service_area: validatedData.serviceArea || null,
        location_coordinates: 'POINT(${processedData.coordinates.lng} ${processedData.coordinates.lat})',
        
        // Services
        business_description: validatedData.description,
        primary_services: validatedData.services,
        years_in_business: validatedData.yearsInBusiness ? parseInt(validatedData.yearsInBusiness) : null,
        team_size: validatedData.teamSize ? parseInt(validatedData.teamSize) : null,
        
        // Certifications
        is_licensed: validatedData.licensed || false,
        is_insured: validatedData.insured || false,
        offers_emergency_service: validatedData.emergencyService || false,
        
        // Contact Information
        contact_person_name: validatedData.contactName || null,
        secondary_phone: validatedData.primaryPhone || null,
        additional_phone: validatedData.secondaryPhone || null,
        business_hours: validatedData.businessHours ? JSON.parse(validatedData.businessHours) : null,
        social_media_facebook: validatedData.facebook || null,
        social_media_instagram: validatedData.instagram || null,
        
        // AI Processing Results
        verification_score: processedData.verificationScore,
        trust_badges: processedData.trustBadges,
        risk_level: processedData.riskLevel,
        industry_classification: processedData.industryMapping,
        ai_processing_details: {
          factors: processedData.factors || [],
          recommendations: processedData.recommendations || []
        },
        
        // Status and Tracking
        submission_status: 'pending_review',
        submission_source: 'web_form',
        ai_processed_at: new Date().toISOString(),
        
        // Search optimization
        search_keywords: processedData.searchKeywords || [],
        
        // Audit Fields
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (submissionError) {
      console.error('Database error:', submissionError);
      return NextResponse.json(
        { error: 'Failed to save business submission' },
        { status: 500 }
      );
    }

    // Create audit trail entry
    await supabase.from('audit_mgmt.activity_logs').insert({
      business_id: null, // Anonymous submission
      user_id: null,
      action: 'business_directory_submission',
      resource_type: 'business_submission',
      resource_id: submission.id,
      details: {
        submission_data: {
          business_name: validatedData.businessName,
          category: validatedData.category,
          verification_score: processedData.verificationScore
        }
      },
      ip_address: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      created_at: new Date().toISOString()
    });

    // Trigger AI-powered review process (async)
    await scheduleBusinessReview(submission.id, processedData);

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      verificationScore: processedData.verificationScore,
      trustBadges: processedData.trustBadges,
      estimatedReviewTime: processedData.riskLevel === 'low' ? '24 hours' : 
                          processedData.riskLevel === 'medium' ? '2-3 business days' : 
                          '3-5 business days'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }
    
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process business submission' },
      { status: 500 }
    );
  }
}

// Schedule AI-powered business review
async function scheduleBusinessReview(submissionId: string, processedData: unknown) {
  try {
    // Insert review task into queue
    await supabase.from('ai_mgmt.review_queue').insert({
      submission_id: submissionId,
      review_type: 'business_directory_verification',
      priority: processedData.riskLevel === 'high' ? 1 : 
               processedData.riskLevel === 'medium' ? 2 : 3,
      verification_score: processedData.verificationScore,
      trust_badges: processedData.trustBadges,
      scheduled_for: new Date(Date.now() + (processedData.riskLevel === 'low' ? 
        2 * 60 * 60 * 1000 : // 2 hours for low risk
        4 * 60 * 60 * 1000   // 4 hours for medium/high risk
      )).toISOString(),
      created_at: new Date().toISOString()
    });
    
    // Log the review scheduling
    console.log('Scheduled review for submission ${submissionId} with ${processedData.riskLevel} risk level');
    
  } catch (error) {
    console.error('Failed to schedule business review:', error);
  }
}

// GET endpoint for searching existing businesses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query && !category && !location) {
      return NextResponse.json({ businesses: [] });
    }
    
    let supabaseQuery = supabase
      .from('directory.business_submissions')
      .select('
        id,
        business_name,
        business_category,
        city,
        state_province,
        address_line_1,
        primary_phone,
        verification_score,
        trust_badges,
        business_description
      ')
      .eq('submission_status', 'approved')
      .limit(limit);
    
    if (query) {
      supabaseQuery = supabaseQuery.or(
        'business_name.ilike.%${query}%,business_description.ilike.%${query}%,primary_services.ilike.%${query}%'
      );
    }
    
    if (category) {
      supabaseQuery = supabaseQuery.eq('business_category', category);
    }
    
    if (location) {
      supabaseQuery = supabaseQuery.or(
        'city.ilike.%${location}%,state_province.ilike.%${location}%'
      );
    }
    
    const { data: businesses, error } = await supabaseQuery;
    
    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
    
    return NextResponse.json({ businesses: businesses || [] });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}