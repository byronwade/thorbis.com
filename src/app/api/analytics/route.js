import { NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@lib/database/supabase/ssr';
import { logger } from '@lib/utils/logger';

/**
 * POST /api/analytics - Handle analytics events from the client
 * Receives and processes analytics events from the Netflix-style analytics system
 */
export async function POST(request) {
  const startTime = performance.now();
  
  try {
    // Parse request body
    const eventData = await request.json();
    
    // Validate required fields
    if (!eventData.event || !eventData.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: event and timestamp' },
        { status: 400 }
      );
    }

    // Get user session for authenticated analytics (optional)
    let userId = null;
    try {
      const response = NextResponse.next();
      const supabase = await createSupabaseRouteHandlerClient(request, response);
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id || null;
    } catch (error) {
      // Continue without user ID for anonymous analytics
      logger.debug('Analytics: Anonymous user tracking', error.message);
    }

    // Sanitize and enrich event data
    const sanitizedEventData = {
      ...eventData,
      userId,
      serverTimestamp: new Date().toISOString(),
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      // Remove any potentially sensitive data
      sessionId: eventData.sessionId ? eventData.sessionId.substring(0, 50) : null,
    };

    // Log analytics event for development/debugging
    logger.info('📊 Analytics Event Received', {
      event: sanitizedEventData.event,
      userId: userId,
      timestamp: sanitizedEventData.timestamp,
      sessionId: sanitizedEventData.sessionId,
    });

    // Store analytics data in Supabase (optional - uncomment if you want to persist)
    // await storeAnalyticsEvent(sanitizedEventData);

    // Send to external analytics services
    await Promise.allSettled([
      // Google Analytics 4 (if configured)
      sendToGA4(sanitizedEventData),
      // Custom analytics processing
      processCustomAnalytics(sanitizedEventData),
    ]);

    const duration = performance.now() - startTime;
    logger.performance(`Analytics API processed in ${duration.toFixed(2)}ms`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Analytics event processed',
        eventId: generateEventId(),
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Analytics API Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics - Get analytics summary (for admin/debug purposes)
 */
export async function GET(request) {
  try {
    // Only allow in development or for authenticated admin users
    if (process.env.NODE_ENV !== 'development') {
      const response = NextResponse.next();
      const supabase = await createSupabaseRouteHandlerClient(request, response);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Check if user is admin (you can modify this logic based on your auth system)
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (userProfile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({
      status: 'Analytics API is running',
      endpoints: {
        POST: 'Submit analytics events',
        GET: 'Get analytics status (admin only)',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Analytics GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics status' },
      { status: 500 }
    );
  }
}

/**
 * Helper Functions
 */

function getClientIP(request) {
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }
  
  return 'unknown';
}

function generateEventId() {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

async function sendToGA4(eventData) {
  // Implement GA4 Measurement Protocol if needed
  // This is a placeholder for GA4 integration
  if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
    try {
      // GA4 Measurement Protocol implementation would go here
      logger.debug('GA4 Analytics: Event would be sent to GA4');
    } catch (error) {
      logger.warn('GA4 Analytics failed:', error);
    }
  }
}

async function processCustomAnalytics(eventData) {
  // Process custom analytics logic
  // You can implement custom processing here based on event types
  
  switch (eventData.event) {
    case 'card_hover_start':
      // Track business card engagement
      logger.debug('Business card hover started:', eventData.businessId);
      break;
      
    case 'scroll_milestone':
      // Track scroll engagement milestones
      logger.debug('Scroll milestone reached:', eventData.milestone);
      break;
      
    case 'core_web_vital_lcp':
      // Monitor Core Web Vitals
      if (eventData.rating === 'poor') {
        logger.warn('Poor LCP detected:', eventData.value);
      }
      break;
      
    default:
      logger.debug('Analytics event processed:', eventData.event);
  }
}

// Optional: Store analytics in Supabase
async function storeAnalyticsEvent(eventData, request) {
  try {
    const response = NextResponse.next();
    const supabase = await createSupabaseRouteHandlerClient(request, response);
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: eventData.event,
        event_data: eventData,
        user_id: eventData.userId,
        session_id: eventData.sessionId,
        timestamp: eventData.serverTimestamp,
        ip_address: eventData.ipAddress,
        user_agent: eventData.userAgent,
      });

    if (error) {
      logger.error('Failed to store analytics event:', error);
    }
  } catch (error) {
    logger.error('Analytics storage error:', error);
  }
}
