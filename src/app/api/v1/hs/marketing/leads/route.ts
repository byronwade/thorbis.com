import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lead schema (imported from main marketing route)
const LeadSchema = z.object({
  source: z.enum(['website', 'phone', 'referral', 'social', 'email', 'walk_in', 'advertisement', 'other']),
  campaign_id: z.string().uuid().optional(),
  
  // Contact information
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(20),
  company_name: z.string().max(255).optional(),
  
  // Address
  address_line_1: z.string().max(255).optional(),
  address_line_2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state_province: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  
  // Lead details
  service_interest: z.array(z.string()).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  budget_range: z.enum(['under_500', '500_1000', '1000_2500', '2500_5000', 'over_5000']).optional(),
  preferred_contact_time: z.string().optional(),
  
  // Qualification
  lead_score: z.number().min(0).max(100).optional(),
  qualification_notes: z.string().optional(),
  
  // Status
  status: z.enum(['new', 'contacted', 'qualified', 'quoted', 'converted', 'lost', 'nurturing']).default('new'),
  
  // Source tracking
  referrer_url: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const LeadUpdateSchema = LeadSchema.partial();

const LeadQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  source: z.enum(['website', 'phone', 'referral', 'social', 'email', 'walk_in', 'advertisement', 'other']).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'quoted', 'converted', 'lost', 'nurturing']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  budget_range: z.enum(['under_500', '500_1000', '1000_2500', '2500_5000', 'over_5000']).optional(),
  campaign_id: z.string().uuid().optional(),
  
  // Scoring filters
  min_score: z.number().min(0).max(100).optional(),
  max_score: z.number().min(0).max(100).optional(),
  
  // Date filters
  created_after: z.string().date().optional(),
  created_before: z.string().date().optional(),
  
  sort: z.enum(['created_at', 'lead_score', 'last_name', 'urgency', 'status']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Lead conversion schema
const LeadConversionSchema = z.object({
  converted_to_customer_id: z.string().uuid().optional(),
  conversion_revenue: z.number().min(0).optional(),
  conversion_notes: z.string().optional(),
  work_order_id: z.string().uuid().optional(),
  estimate_id: z.string().uuid().optional(),
});

// Lead scoring schema
const LeadScoringSchema = z.object({
  score: z.number().min(0).max(100),
  scoring_criteria: z.object({
    budget_match: z.number().min(0).max(25).optional(),
    urgency_level: z.number().min(0).max(25).optional(),
    service_fit: z.number().min(0).max(25).optional(),
    contact_quality: z.number().min(0).max(25).optional(),
  }).optional(),
  scoring_notes: z.string().optional(),
});

// Helper function to get user's organization
async function getUserOrganization(userId: string) {
  const { data: membership } = await supabase
    .from('user_mgmt.organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  return membership?.organization_id;
}

// Helper function to calculate lead score automatically
function calculateLeadScore(lead: unknown): number {
  const score = 0;
  
  // Budget scoring (0-25 points)
  const budgetScores = {
    'under_500': 5,
    '500_1000': 10,
    '1000_2500': 15,
    '2500_5000': 20,
    'over_5000': 25,
  };
  score += budgetScores[lead.budget_range as keyof typeof budgetScores] || 0;
  
  // Urgency scoring (0-25 points)
  const urgencyScores = {
    'low': 5,
    'medium': 10,
    'high': 20,
    'urgent': 25,
  };
  score += urgencyScores[lead.urgency as keyof typeof urgencyScores] || 10;
  
  // Service interest scoring (0-25 points)
  if (lead.service_interest && lead.service_interest.length > 0) {
    score += Math.min(25, lead.service_interest.length * 5);
  }
  
  // Contact completeness scoring (0-25 points)
  const contactScore = 0;
  if (lead.email) contactScore += 8;
  if (lead.phone) contactScore += 8;
  if (lead.address_line_1) contactScore += 5;
  if (lead.company_name) contactScore += 4;
  score += contactScore;
  
  return Math.min(100, score);
}

// GET /api/v1/hs/marketing/leads - List leads with advanced filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = LeadQuerySchema.parse(Object.fromEntries(searchParams));

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Build query
    let supabaseQuery = supabase
      .from('hs.leads')
      .select('
        *,
        campaigns:campaign_id(
          name,
          campaign_type
        )
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.source) {
      supabaseQuery = supabaseQuery.eq('source', query.source);
    }
    
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }
    
    if (query.urgency) {
      supabaseQuery = supabaseQuery.eq('urgency', query.urgency);
    }
    
    if (query.budget_range) {
      supabaseQuery = supabaseQuery.eq('budget_range', query.budget_range);
    }
    
    if (query.campaign_id) {
      supabaseQuery = supabaseQuery.eq('campaign_id', query.campaign_id);
    }
    
    if (query.min_score) {
      supabaseQuery = supabaseQuery.gte('lead_score', query.min_score);
    }
    
    if (query.max_score) {
      supabaseQuery = supabaseQuery.lte('lead_score', query.max_score);
    }
    
    if (query.created_after) {
      supabaseQuery = supabaseQuery.gte('created_at', query.created_after);
    }
    
    if (query.created_before) {
      supabaseQuery = supabaseQuery.lte('created_at', query.created_before);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%,email.ilike.%${query.search}%,phone.ilike.%${query.search}%,company_name.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: leads, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Calculate summary statistics
    const { data: allLeads } = await supabase
      .from('hs.leads')
      .select('status, lead_score, created_at')
      .eq('organization_id', organizationId);

    const summary = {
      total_leads: allLeads?.length || 0,
      new_leads: allLeads?.filter(lead => lead.status === 'new').length || 0,
      qualified_leads: allLeads?.filter(lead => lead.status === 'qualified').length || 0,
      converted_leads: allLeads?.filter(lead => lead.status === 'converted').length || 0,
      average_score: allLeads?.length ? 
        allLeads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / allLeads.length : 0,
      conversion_rate: allLeads?.length ? 
        (allLeads.filter(lead => lead.status === 'converted').length / allLeads.length) * 100 : 0,
    };

    return NextResponse.json({
      leads: leads || [],
      summary,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/marketing/leads error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/hs/marketing/leads - Create new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leadData = LeadSchema.parse(body);

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Validate campaign exists if provided
    if (leadData.campaign_id) {
      const { data: campaign } = await supabase
        .from('hs.marketing_campaigns')
        .select('id')
        .eq('id', leadData.campaign_id)
        .eq('organization_id', organizationId)
        .single();

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate leads (same email or phone)
    if (leadData.email || leadData.phone) {
      let duplicateQuery = supabase
        .from('hs.leads')
        .select('id, first_name, last_name')
        .eq('organization_id', organizationId);

      if (leadData.email) {
        duplicateQuery = duplicateQuery.eq('email', leadData.email);
      } else if (leadData.phone) {
        duplicateQuery = duplicateQuery.eq('phone', leadData.phone);
      }

      const { data: duplicates } = await duplicateQuery.limit(1);
      
      if (duplicates && duplicates.length > 0) {
        return NextResponse.json(
          { 
            error: 'Duplicate lead detected',
            existing_lead: duplicates[0],
            message: 'Lead already exists for ${duplicates[0].first_name} ${duplicates[0].last_name}'
          },
          { status: 409 }
        );
      }
    }

    // Calculate lead score if not provided
    if (!leadData.lead_score) {
      leadData.lead_score = calculateLeadScore(leadData);
    }

    // Create lead
    const { data: lead, error } = await supabase
      .from('hs.leads')
      .insert({
        ...leadData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select('
        *,
        campaigns:campaign_id(
          name,
          campaign_type
        )
      ')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Create activity log entry
    await supabase
      .from('hs.lead_activity_log')
      .insert({
        lead_id: lead.id,
        activity_type: 'created',
        activity_description: 'Lead was created',
        metadata: {
          source: leadData.source,
          initial_score: lead.lead_score,
        },
        organization_id: organizationId,
        created_by: user.id,
      });

    // Auto-assign lead based on rules (if configured)
    // This could be expanded to include territory-based assignment, load balancing, etc.
    if (leadData.service_interest && leadData.service_interest.length > 0) {
      // Find technicians with matching skills
      const { data: technicians } = await supabase
        .from('hs.technicians')
        .select('id, first_name, last_name, skills')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .overlaps('skills', leadData.service_interest);

      if (technicians && technicians.length > 0) {
        // Simple round-robin assignment (could be more sophisticated)
        const assignedTechnician = technicians[0];
        
        await supabase
          .from('hs.leads')
          .update({ assigned_technician_id: assignedTechnician.id })
          .eq('id', lead.id);

        // Log assignment
        await supabase
          .from('hs.lead_activity_log')
          .insert({
            lead_id: lead.id,
            activity_type: 'assigned',
            activity_description: 'Lead assigned to ${assignedTechnician.first_name} ${assignedTechnician.last_name}',
            metadata: {
              technician_id: assignedTechnician.id,
              assignment_reason: 'skill_match',
            },
            organization_id: organizationId,
            created_by: user.id,
          });
      }
    }

    return NextResponse.json(
      { 
        lead,
        message: 'Lead created successfully',
        auto_score: !body.lead_score ? lead.lead_score : null,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/marketing/leads error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid lead data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}