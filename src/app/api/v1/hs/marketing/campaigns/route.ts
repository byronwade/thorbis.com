import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Marketing campaign schemas (imported from main route)
const MarketingCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  campaign_type: z.enum(['email', 'sms', 'social', 'ppc', 'print', 'referral', 'direct_mail', 'other']),
  
  // Targeting
  target_customer_types: z.array(z.enum(['residential', 'commercial', 'property_management'])).optional(),
  target_service_types: z.array(z.string()).optional(),
  target_zip_codes: z.array(z.string()).optional(),
  target_demographics: z.object({
    age_min: z.number().optional(),
    age_max: z.number().optional(),
    income_min: z.number().optional(),
    income_max: z.number().optional(),
    home_ownership: z.enum(['owner', 'renter', 'both']).optional(),
  }).optional(),
  
  // Budget and goals
  budget_total: z.number().min(0).optional(),
  budget_daily: z.number().min(0).optional(),
  goal_leads: z.number().min(0).optional(),
  goal_conversions: z.number().min(0).optional(),
  goal_revenue: z.number().min(0).optional(),
  
  // Campaign details
  start_date: z.string().date(),
  end_date: z.string().date().optional(),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
  
  // Tracking
  tracking_phone: z.string().optional(),
  tracking_url: z.string().url().optional(),
  promo_code: z.string().optional(),
  
  // Content
  campaign_assets: z.array(z.object({
    asset_type: z.enum(['image', 'video', 'text', 'html', 'pdf']),
    asset_url: z.string().url(),
    asset_name: z.string(),
    description: z.string().optional(),
  })).optional(),
  
  tags: z.array(z.string()).optional(),
});

const CampaignUpdateSchema = MarketingCampaignSchema.partial();

const CampaignQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  campaign_type: z.enum(['email', 'sms', 'social', 'ppc', 'print', 'referral', 'direct_mail', 'other']).optional(),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled']).optional(),
  sort: z.enum(['created_at', 'name', 'start_date', 'budget_total', 'performance']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  // Performance filters
  min_leads: z.number().optional(),
  min_conversions: z.number().optional(),
  min_roi: z.number().optional(),
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

// Helper function to calculate campaign performance metrics
async function calculateCampaignPerformance(campaignId: string, organizationId: string) {
  // Get leads for this campaign
  const { data: leads } = await supabase
    .from('hs.leads')
    .select('
      id,
      status,
      created_at,
      converted_at,
      converted_revenue,
      lead_score
    ')
    .eq('campaign_id', campaignId)
    .eq('organization_id', organizationId);

  const totalLeads = leads?.length || 0;
  const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
  const totalRevenue = leads?.reduce((sum, lead) => sum + (lead.converted_revenue || 0), 0) || 0;
  
  // Get campaign costs
  const { data: campaign } = await supabase
    .from('hs.marketing_campaigns')
    .select('budget_total, budget_daily, start_date, end_date')
    .eq('id', campaignId)
    .single();

  const totalCost = campaign?.budget_total || 0;
  const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

  return {
    total_leads: totalLeads,
    converted_leads: convertedLeads,
    conversion_rate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
    total_revenue: totalRevenue,
    total_cost: totalCost,
    roi: roi,
    cost_per_lead: totalLeads > 0 ? totalCost / totalLeads : 0,
    cost_per_conversion: convertedLeads > 0 ? totalCost / convertedLeads : 0,
    revenue_per_lead: totalLeads > 0 ? totalRevenue / totalLeads : 0,
    average_lead_score: totalLeads > 0 ? 
      leads!.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / totalLeads : 0,
  };
}

// GET /api/v1/hs/marketing/campaigns - List marketing campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = CampaignQuerySchema.parse(Object.fromEntries(searchParams));

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
      .from('hs.marketing_campaigns')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.campaign_type) {
      supabaseQuery = supabaseQuery.eq('campaign_type', query.campaign_type);
    }
    
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'name.ilike.%${query.search}%,description.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: campaigns, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    // Calculate performance metrics for each campaign
    const campaignsWithMetrics = await Promise.all(
      (campaigns || []).map(async (campaign) => {
        const performance = await calculateCampaignPerformance(campaign.id, organizationId);
        return {
          ...campaign,
          performance,
        };
      })
    );

    // Apply performance filters if specified
    let filteredCampaigns = campaignsWithMetrics;
    
    if (query.min_leads) {
      filteredCampaigns = filteredCampaigns.filter(c => c.performance.total_leads >= query.min_leads!);
    }
    
    if (query.min_conversions) {
      filteredCampaigns = filteredCampaigns.filter(c => c.performance.converted_leads >= query.min_conversions!);
    }
    
    if (query.min_roi) {
      filteredCampaigns = filteredCampaigns.filter(c => c.performance.roi >= query.min_roi!);
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      campaigns: filteredCampaigns,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/marketing/campaigns error:', error);
    
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

// POST /api/v1/hs/marketing/campaigns - Create new marketing campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const campaignData = MarketingCampaignSchema.parse(body);

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

    // Validate date range
    if (campaignData.end_date && new Date(campaignData.end_date) <= new Date(campaignData.start_date)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('hs.marketing_campaigns')
      .insert({
        ...campaignData,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    // Generate tracking URLs and codes if needed
    if (campaign.status === 'active' || campaign.status === 'scheduled') {
      const trackingData: unknown = {};
      
      if (!campaign.tracking_url && campaign.campaign_type === 'ppc`) {
        trackingData.tracking_url = 'https://example.com/track/${campaign.id}';
      }
      
      if (!campaign.promo_code) {
        trackingData.promo_code = '${campaign.name.toUpperCase().replace(/[^\w\s-]/g, '')}${Date.now().toString().slice(-4)}';
      }

      if (Object.keys(trackingData).length > 0) {
        await supabase
          .from('hs.marketing_campaigns')
          .update(trackingData)
          .eq('id', campaign.id);
        
        Object.assign(campaign, trackingData);
      }
    }

    return NextResponse.json(
      { campaign },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/marketing/campaigns error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid campaign data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}