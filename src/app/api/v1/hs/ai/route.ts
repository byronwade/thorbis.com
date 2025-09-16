import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// AI analytics query schema
const AIAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '6m', '1y']).default('30d'),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  context_type: z.enum(['customer_service', 'technical_support', 'sales', 'general', 'emergency']).optional(),
  include_trends: z.boolean().default(true),
  include_performance: z.boolean().default(true),
  include_intents: z.boolean().default(true),
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

// Helper function to calculate AI performance metrics
async function calculateAIPerformanceMetrics(organizationId: string, dateRange: unknown) {
  // Get chat sessions data
  const { data: sessions } = await supabase
    .from('hs.ai_chat_sessions')
    .select('
      id,
      session_status,
      context_type,
      priority,
      created_at,
      resolved_at,
      escalated_at,
      escalation_reason
    ')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  // Get messages data
  const { data: messages } = await supabase
    .from('hs.ai_chat_messages')
    .select('
      id,
      message_type,
      intent,
      confidence_score,
      requires_human_handoff,
      created_at,
      session_id
    ')
    .in('session_id', sessions?.map(s => s.id) || [])
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  const totalSessions = sessions?.length || 0;
  const resolvedSessions = sessions?.filter(s => s.session_status === 'resolved').length || 0;
  const escalatedSessions = sessions?.filter(s => s.session_status === 'escalated').length || 0;
  const activeSessions = sessions?.filter(s => s.session_status === 'active').length || 0;

  const totalMessages = messages?.length || 0;
  const userMessages = messages?.filter(m => m.message_type === 'user').length || 0;
  const aiMessages = messages?.filter(m => m.message_type === 'ai').length || 0;

  // Calculate resolution metrics
  const resolvedSessionsData = sessions?.filter(s => s.resolved_at) || [];
  const avgResolutionTime = resolvedSessionsData.length > 0 ? 
    resolvedSessionsData.reduce((sum, s) => {
      const duration = new Date(s.resolved_at!).getTime() - new Date(s.created_at).getTime();
      return sum + duration;
    }, 0) / resolvedSessionsData.length : 0;

  // Calculate escalation metrics
  const escalationRate = totalSessions > 0 ? (escalatedSessions / totalSessions) * 100 : 0;
  const avgEscalationTime = sessions?.filter(s => s.escalated_at).reduce((sum, s, _, arr) => {
    const duration = new Date(s.escalated_at!).getTime() - new Date(s.created_at).getTime();
    return sum + duration / arr.length;
  }, 0) || 0;

  // Calculate confidence metrics
  const aiMessagesWithConfidence = messages?.filter(m => m.message_type === 'ai' && m.confidence_score) || [];
  const avgConfidenceScore = aiMessagesWithConfidence.length > 0 ?
    aiMessagesWithConfidence.reduce((sum, m) => sum + (m.confidence_score || 0), 0) / aiMessagesWithConfidence.length : 0;

  return {
    sessions: {
      total: totalSessions,
      resolved: resolvedSessions,
      escalated: escalatedSessions,
      active: activeSessions,
      resolution_rate: totalSessions > 0 ? (resolvedSessions / totalSessions) * 100 : 0,
      escalation_rate: escalationRate,
      avg_resolution_time_minutes: Math.round(avgResolutionTime / (1000 * 60)),
      avg_escalation_time_minutes: Math.round(avgEscalationTime / (1000 * 60)),
    },
    messages: {
      total: totalMessages,
      user_messages: userMessages,
      ai_messages: aiMessages,
      messages_per_session: totalSessions > 0 ? totalMessages / totalSessions : 0,
      avg_confidence_score: avgConfidenceScore,
    },
    context_breakdown: {
      customer_service: sessions?.filter(s => s.context_type === 'customer_service').length || 0,
      technical_support: sessions?.filter(s => s.context_type === 'technical_support').length || 0,
      sales: sessions?.filter(s => s.context_type === 'sales').length || 0,
      emergency: sessions?.filter(s => s.context_type === 'emergency').length || 0,
      general: sessions?.filter(s => s.context_type === 'general').length || 0,
    },
    priority_breakdown: {
      urgent: sessions?.filter(s => s.priority === 'urgent').length || 0,
      high: sessions?.filter(s => s.priority === 'high').length || 0,
      medium: sessions?.filter(s => s.priority === 'medium').length || 0,
      low: sessions?.filter(s => s.priority === 'low').length || 0,
    },
  };
}

// Helper function to analyze intent patterns
async function analyzeIntentPatterns(organizationId: string, messages: unknown[]) {
  // Count intent occurrences
  const intentCounts = messages?.reduce((acc, message) => {
    if (message.intent) {
      acc[message.intent] = (acc[message.intent] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate intent success rates (based on whether escalation was required)
  const intentSuccessRates = {} as Record<string, { count: number; successful: number; rate: number }>;
  
  messages?.forEach(message => {
    if (message.intent) {
      if (!intentSuccessRates[message.intent]) {
        intentSuccessRates[message.intent] = { count: 0, successful: 0, rate: 0 };
      }
      intentSuccessRates[message.intent].count++;
      if (!message.requires_human_handoff) {
        intentSuccessRates[message.intent].successful++;
      }
    }
  });

  // Calculate success rates
  Object.keys(intentSuccessRates).forEach(intent => {
    const data = intentSuccessRates[intent];
    data.rate = data.count > 0 ? (data.successful / data.count) * 100 : 0;
  });

  // Get top intents by volume
  const topIntents = Object.entries(intentCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([intent, count]) => ({
      intent,
      count,
      success_rate: intentSuccessRates[intent]?.rate || 0,
      confidence_avg: messages?.filter(m => m.intent === intent)
        .reduce((sum, m, _, arr) => sum + (m.confidence_score || 0) / arr.length, 0) || 0,
    }));

  return {
    total_intents: Object.keys(intentCounts).length,
    intent_counts: intentCounts,
    intent_success_rates: intentSuccessRates,
    top_intents: topIntents,
    most_successful_intent: topIntents.sort((a, b) => b.success_rate - a.success_rate)[0] || null,
    least_successful_intent: topIntents.sort((a, b) => a.success_rate - b.success_rate)[0] || null,
  };
}

// Helper function to calculate usage trends
async function calculateUsageTrends(organizationId: string, dateRange: unknown) {
  // Get daily session counts
  const { data: dailySessions } = await supabase
    .from('hs.ai_chat_sessions')
    .select('created_at, context_type, session_status')
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString())
    .order('created_at');

  // Group by date
  const dailyData = dailySessions?.reduce((acc, session) => {
    const date = new Date(session.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        total_sessions: 0,
        resolved_sessions: 0,
        escalated_sessions: 0,
        emergency_sessions: 0,
      };
    }
    
    acc[date].total_sessions++;
    if (session.session_status === 'resolved') acc[date].resolved_sessions++;
    if (session.session_status === 'escalated') acc[date].escalated_sessions++;
    if (session.context_type === 'emergency') acc[date].emergency_sessions++;
    
    return acc;
  }, {} as Record<string, unknown>) || {};

  const timelineData = Object.values(dailyData).sort((a: unknown, b: unknown) => a.date.localeCompare(b.date));

  // Calculate growth trends
  const totalSessions = timelineData.reduce((sum: number, day: unknown) => sum + day.total_sessions, 0);
  const avgDailySessions = timelineData.length > 0 ? totalSessions / timelineData.length : 0;
  
  // Simple trend calculation (last 7 days vs previous 7 days)
  const last7Days = timelineData.slice(-7);
  const previous7Days = timelineData.slice(-14, -7);
  
  const last7Total = last7Days.reduce((sum: number, day: unknown) => sum + day.total_sessions, 0);
  const previous7Total = previous7Days.reduce((sum: number, day: unknown) => sum + day.total_sessions, 0);
  
  const weekOverWeekGrowth = previous7Total > 0 ? ((last7Total - previous7Total) / previous7Total) * 100 : 0;

  return {
    timeline: timelineData,
    summary: {
      total_sessions: totalSessions,
      avg_daily_sessions: avgDailySessions,
      week_over_week_growth: weekOverWeekGrowth,
      peak_day: timelineData.reduce((peak: unknown, day: unknown) => 
        day.total_sessions > (peak?.total_sessions || 0) ? day : peak, null),
    },
  };
}

// GET /api/v1/hs/ai - Get AI system overview and analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = AIAnalyticsQuerySchema.parse(Object.fromEntries(searchParams));

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
    const analyticsData: unknown = {
      period: query.period,
      date_range: {
        from: dateRange.start.toISOString(),
        to: dateRange.end.toISOString(),
      },
    };

    // Get performance metrics
    if (query.include_performance) {
      analyticsData.performance = await calculateAIPerformanceMetrics(organizationId, dateRange);
    }

    // Get usage trends
    if (query.include_trends) {
      analyticsData.trends = await calculateUsageTrends(organizationId, dateRange);
    }

    // Get intent analysis
    if (query.include_intents) {
      const { data: messages } = await supabase
        .from('hs.ai_chat_messages')
        .select('
          intent,
          confidence_score,
          requires_human_handoff,
          created_at,
          session_id
        ')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      analyticsData.intent_analysis = await analyzeIntentPatterns(organizationId, messages || []);
    }

    // Get real-time system status
    const { data: activeSessions } = await supabase
      .from('hs.ai_chat_sessions')
      .select('id, priority, context_type, created_at')
      .eq('organization_id', organizationId)
      .eq('session_status', 'active')
      .order('created_at', { ascending: false });

    const { data: escalatedSessions } = await supabase
      .from('hs.ai_chat_sessions')
      .select('id, priority, escalation_reason, escalated_at')
      .eq('organization_id', organizationId)
      .eq('session_status', 'escalated')
      .order('escalated_at', { ascending: false })
      .limit(10);

    analyticsData.real_time_status = {
      active_sessions: activeSessions?.length || 0,
      escalated_sessions: escalatedSessions?.length || 0,
      urgent_sessions: activeSessions?.filter(s => s.priority === 'urgent').length || 0,
      emergency_sessions: activeSessions?.filter(s => s.context_type === 'emergency').length || 0,
      recent_escalations: escalatedSessions || [],
      system_health: {
        status: 'operational', // This would be determined by actual system monitoring
        response_time_avg: 250, // milliseconds - would be calculated from actual data
        uptime_percentage: 99.9,
        last_updated: new Date().toISOString(),
      },
    };

    // Calculate key insights and recommendations
    const insights = [];
    
    if (analyticsData.performance?.sessions.escalation_rate > 30) {
      insights.push({
        type: 'warning',
        title: 'High Escalation Rate',
        description: '${analyticsData.performance.sessions.escalation_rate.toFixed(1)}% of sessions are being escalated to human agents',
        recommendation: 'Consider improving AI training data or adding more context-specific responses',
      });
    }

    if (analyticsData.intent_analysis?.least_successful_intent?.success_rate < 50) {
      insights.push({
        type: 'improvement',
        title: 'Intent Performance Issue',
        description: '"${analyticsData.intent_analysis.least_successful_intent.intent}" intent has low success rate',
        recommendation: 'Review and improve AI responses for this intent category',
      });
    }

    if (analyticsData.trends?.summary.week_over_week_growth > 50) {
      insights.push({
        type: 'positive',
        title: 'High Usage Growth',
        description: 'AI chat usage has grown ${analyticsData.trends.summary.week_over_week_growth.toFixed(1)}% week-over-week',
        recommendation: 'Monitor system capacity and consider scaling resources',
      });
    }

    analyticsData.insights = insights;

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('GET /api/v1/hs/ai error:', error);
    
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