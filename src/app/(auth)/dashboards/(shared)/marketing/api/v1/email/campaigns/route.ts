import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Email campaign validation schema
const EmailCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject line is required"),
  from_email: z.string().email("Valid from email is required"),
  from_name: z.string().min(1, "From name is required"),
  template_id: z.string().optional(),
  html_content: z.string().optional(),
  text_content: z.string().optional(),
  audience_id: z.string().min(1, "Audience is required"),
  status: z.enum(["draft", "scheduled", "sending", "sent", "paused"]).default("draft"),
  send_time: z.string().datetime().optional(),
  is_ab_test: z.boolean().default(false),
  ab_test_config: z.object({
    test_percentage: z.number().min(10).max(90),
    winner_criteria: z.enum(["open_rate", "click_rate", "conversion_rate"]),
    test_duration_hours: z.number().min(1).max(72),
  }).optional(),
  personalization: z.object({
    enabled: z.boolean().default(false),
    fields: z.array(z.string()).optional(),
  }).optional(),
  tracking: z.object({
    open_tracking: z.boolean().default(true),
    click_tracking: z.boolean().default(true),
    conversion_tracking: z.boolean().default(false),
    utm_parameters: z.record(z.string()).optional(),
  }).optional(),
});

const UpdateEmailCampaignSchema = EmailCampaignSchema.partial();

// GET /api/email/campaigns - List email campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // TODO: Replace with actual database query
    const mockCampaigns = [
      {
        id: "email_1",
        name: "Welcome Series - Email 1",
        subject: "Welcome to our community! 👋",
        from_email: "hello@company.com",
        from_name: "Company Team",
        status: "sent",
        audience: {
          id: "aud_1",
          name: "New Subscribers",
          size: 1250
        },
        performance: {
          sent: 1250,
          delivered: 1232,
          opened: 456,
          clicked: 89,
          unsubscribed: 3,
          bounced: 18,
          open_rate: 37.0,
          click_rate: 19.5,
          unsubscribe_rate: 0.24
        },
        send_time: "2025-01-03T09:00:00Z",
        created_at: "2025-01-02T14:30:00Z",
        updated_at: "2025-01-03T09:15:00Z"
      },
      {
        id: "email_2",
        name: "Holiday Promotion",
        subject: "🎄 50% off everything - Limited time!",
        from_email: "sales@company.com",
        from_name: "Sales Team",
        status: "scheduled",
        audience: {
          id: "aud_2", 
          name: "Active Customers",
          size: 5420
        },
        send_time: "2025-01-05T10:00:00Z",
        created_at: "2025-01-01T16:20:00Z",
        updated_at: "2025-01-03T11:30:00Z"
      }
    ];

    // Apply filters
    let filteredCampaigns = mockCampaigns;
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status);
    }
    if (search) {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.subject.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      campaigns: paginatedCampaigns,
      pagination: {
        page,
        limit,
        total: filteredCampaigns.length,
        total_pages: Math.ceil(filteredCampaigns.length / limit),
      }
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email campaigns" },
      { status: 500 }
    );
  }
}

// POST /api/email/campaigns - Create new email campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = EmailCampaignSchema.parse(body);

    // TODO: Replace with actual database insertion and email service integration
    const newCampaign = {
      id: `email_${Date.now()}`,
      ...validatedData,
      performance: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        open_rate: 0,
        click_rate: 0,
        unsubscribe_rate: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      { 
        campaign: newCampaign,
        message: "Email campaign created successfully" 
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to create email campaign" },
      { status: 500 }
    );
  }
}