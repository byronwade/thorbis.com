import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Marketing overview query schema
const MarketingQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '6m', '1y', 'custom']).default('30d'),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  
  // Metrics to include
  include_campaigns: z.boolean().default(true),
  include_leads: z.boolean().default(true),
  include_conversions: z.boolean().default(true),
  include_referrals: z.boolean().default(true),
  include_reviews: z.boolean().default(true),
  
  // Filtering
  campaign_id: z.string().uuid().optional(),
  lead_source: z.string().optional(),
  service_type: z.string().optional(),
  
  // Grouping
  group_by: z.enum(['day', 'week', 'month', 'campaign', 'source', 'service_type']).optional(),
});

// Marketing campaign schema
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

// Lead schema
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

// Helper function to get date ranges
function getDateRanges(period: string, startDate?: string, endDate?: string) {
  const now = new Date();
  let start = new Date();
  let end = new Date(now);

  if (period === 'custom' && startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    switch (period) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '6m':
        start.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
  }

  return { start, end };
}

// Helper function to calculate marketing metrics
async function calculateMarketingMetrics(organizationId: string, dateRange: unknown, filters: unknown = {}) {
  // Get campaigns
  let campaignQuery = supabase
    .from('hs.marketing_campaigns')
    .select('*')
    .eq('organization_id', organizationId);

  if (filters.campaign_id) {
    campaignQuery = campaignQuery.eq('id', filters.campaign_id);
  }

  const { data: campaigns } = await campaignQuery;

  // Get leads
  let leadQuery = supabase
    .from('hs.leads')
    .select('
      id,
      source,
      campaign_id,
      service_interest,
      status,
      lead_score,
      urgency,
      created_at,
      converted_at,
      converted_revenue
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  if (filters.lead_source) {
    leadQuery = leadQuery.eq('source', filters.lead_source);
  }
  if (filters.campaign_id) {
    leadQuery = leadQuery.eq('campaign_id', filters.campaign_id);
  }

  const { data: leads } = await leadQuery;

  // Get referrals
  const { data: referrals } = await supabase
    .from('hs.customer_referrals')
    .select('
      id,
      referrer_customer_id,
      referred_customer_id,
      referral_status,
      referral_reward_amount,
      created_at,
      converted_at
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  // Calculate metrics
  const totalLeads = leads?.length || 0;
  const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
  
  const totalRevenue = leads?.reduce((sum, lead) => sum + (lead.converted_revenue || 0), 0) || 0;
  const averageLeadValue = convertedLeads > 0 ? totalRevenue / convertedLeads : 0;

  // Lead source breakdown
  const leadsBySource = leads?.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Lead status breakdown
  const leadsByStatus = leads?.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Campaign performance
  const campaignPerformance = campaigns?.map(campaign => {
    const campaignLeads = leads?.filter(lead => lead.campaign_id === campaign.id) || [];
    const campaignConversions = campaignLeads.filter(lead => lead.status === 'converted');
    const campaignRevenue = campaignConversions.reduce((sum, lead) => sum + (lead.converted_revenue || 0), 0);
    
    return {
      ...campaign,
      lead_count: campaignLeads.length,
      conversion_count: campaignConversions.length,
      conversion_rate: campaignLeads.length > 0 ? (campaignConversions.length / campaignLeads.length) * 100 : 0,
      generated_revenue: campaignRevenue,
      cost_per_lead: campaign.budget_total && campaignLeads.length > 0 ? campaign.budget_total / campaignLeads.length : 0,
      roi: campaign.budget_total && campaignRevenue > 0 ? ((campaignRevenue - campaign.budget_total) / campaign.budget_total) * 100 : 0,
    };
  }) || [];

  return {
    leads: {
      total_leads: totalLeads,
      converted_leads: convertedLeads,
      conversion_rate: conversionRate,
      average_lead_score: leads?.length ? leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / leads.length : 0,
      total_revenue: totalRevenue,
      average_lead_value: averageLeadValue,
      leads_by_source: leadsBySource,
      leads_by_status: leadsByStatus,
    },
    campaigns: {
      active_campaigns: campaigns?.filter(c => c.status === 'active').length || 0,
      total_campaign_budget: campaigns?.reduce((sum, c) => sum + (c.budget_total || 0), 0) || 0,
      campaign_performance: campaignPerformance,
    },
    referrals: {
      total_referrals: referrals?.length || 0,
      successful_referrals: referrals?.filter(r => r.referral_status === 'converted').length || 0,
      referral_conversion_rate: referrals?.length > 0 ? 
        (referrals.filter(r => r.referral_status === 'converted').length / referrals.length) * 100 : 0,
      total_referral_rewards: referrals?.reduce((sum, r) => sum + (r.referral_reward_amount || 0), 0) || 0,
    },
  };
}

// GET /api/v1/hs/marketing - Get marketing overview and metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = MarketingQuerySchema.parse(Object.fromEntries(searchParams));

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

    const dateRange = getDateRanges(query.period, query.start_date, query.end_date);
    const filters = {
      campaign_id: query.campaign_id,
      lead_source: query.lead_source,
      service_type: query.service_type,
    };

    const marketingData: unknown = {
      period: query.period,
      date_range: {
        from: dateRange.start.toISOString(),
        to: dateRange.end.toISOString(),
      },
    };

    // Get marketing metrics
    const metrics = await calculateMarketingMetrics(organizationId, dateRange, filters);
    marketingData.metrics = metrics;

    // Get top performing campaigns
    const topCampaigns = metrics.campaigns.campaign_performance
      .sort((a: unknown, b: unknown) => b.generated_revenue - a.generated_revenue)
      .slice(0, 5);

    marketingData.top_campaigns = topCampaigns;

    // Calculate marketing efficiency
    const totalSpend = metrics.campaigns.total_campaign_budget;
    const totalRevenue = metrics.leads.total_revenue;
    const marketingROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

    marketingData.efficiency = {
      marketing_roi: marketingROI,
      cost_per_lead: metrics.leads.total_leads > 0 ? totalSpend / metrics.leads.total_leads : 0,
      cost_per_conversion: metrics.leads.converted_leads > 0 ? totalSpend / metrics.leads.converted_leads : 0,
      revenue_per_dollar_spent: totalSpend > 0 ? totalRevenue / totalSpend : 0,
    };

    // Get recent activity
    const { data: recentLeads } = await supabase
      .from('hs.leads')
      .select('
        id,
        first_name,
        last_name,
        source,
        service_interest,
        status,
        created_at
      ')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    marketingData.recent_activity = {
      recent_leads: recentLeads || [],
    };

    return NextResponse.json(marketingData);

  } catch (error) {
    console.error('GET /api/v1/hs/marketing error:', error);
    
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