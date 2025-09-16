import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Campaign validation schema (same as in route.ts)
const UpdateCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").optional(),
  type: z.enum(["email", "social", "display", "search", "video"]).optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  budget: z.number().positive("Budget must be positive").optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  target_audience: z.object({
    demographics: z.record(z.any()).optional(),
    interests: z.array(z.string()).optional(),
    behaviors: z.array(z.string()).optional(),
  }).optional(),
  goals: z.object({
    primary_metric: z.string(),
    target_value: z.number(),
    secondary_metrics: z.array(z.string()).optional(),
  }).optional(),
  channels: z.array(z.string()).optional(),
  content: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    assets: z.array(z.string()).optional(),
  }).optional(),
}).partial();

interface RouteContext {
  params: {
    id: string;
  };
}

// GET /api/campaigns/[id] - Get specific campaign
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database query
    const mockCampaign = {
      id,
      name: "Holiday Sale Email Campaign",
      type: "email",
      status: "active",
      budget: 5000,
      start_date: "2025-01-01T00:00:00Z",
      end_date: "2025-01-31T23:59:59Z",
      target_audience: {
        demographics: {
          age_range: "25-45",
          gender: "all",
          location: "US, CA, UK"
        },
        interests: ["holiday shopping", "deals", "fashion"],
        behaviors: ["frequent buyers", "email subscribers"]
      },
      goals: {
        primary_metric: "revenue",
        target_value: 50000,
        secondary_metrics: ["clicks", "conversions", "email_opens"]
      },
      channels: ["email", "social"],
      content: {
        title: "Holiday Sale - Up to 70% Off",
        description: "Don't miss our biggest sale of the year!",
        assets: ["email_template_1", "hero_banner", "product_images"]
      },
      performance: {
        impressions: 125000,
        clicks: 8750,
        conversions: 425,
        cost: 2340,
        roi: 3.2,
        engagement_rate: 7.2,
        conversion_rate: 4.85
      },
      analytics: {
        daily_performance: [
          { date: "2025-01-01", impressions: 5200, clicks: 364, conversions: 18 },
          { date: "2025-01-02", impressions: 4800, clicks: 336, conversions: 16 },
          { date: "2025-01-03", impressions: 6100, clicks: 427, conversions: 21 }
        ],
        channel_breakdown: {
          email: { impressions: 75000, clicks: 5250, conversions: 255 },
          social: { impressions: 50000, clicks: 3500, conversions: 170 }
        },
        audience_insights: {
          top_demographics: [
            { segment: "25-34 Female", percentage: 35 },
            { segment: "35-44 Male", percentage: 28 },
            { segment: "25-34 Male", percentage: 22 }
          ],
          top_locations: [
            { location: "California", percentage: 25 },
            { location: "New York", percentage: 18 },
            { location: "Texas", percentage: 12 }
          ]
        }
      },
      created_at: "2024-12-15T10:30:00Z",
      updated_at: "2025-01-03T14:20:00Z"
    };

    return NextResponse.json({ campaign: mockCampaign });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update specific campaign
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Validate request body
    const validatedData = UpdateCampaignSchema.parse(body);

    // TODO: Replace with actual database update
    const updatedCampaign = {
      id,
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      campaign: updatedCampaign,
      message: "Campaign updated successfully"
    });

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
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete specific campaign
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database soft delete
    // In production, this should set deleted_at timestamp instead of hard delete
    
    return NextResponse.json({
      message: `Campaign ${id} deleted successfully'
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}

// PATCH /api/campaigns/[id] - Partial update (e.g., status changes)
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Handle specific actions
    const { action, ...updates } = body;

    if (action) {
      switch (action) {
        case "activate":
          updates.status = "active";
          updates.start_date = updates.start_date || new Date().toISOString();
          break;
        case "pause":
          updates.status = "paused";
          break;
        case "complete":
          updates.status = "completed";
          updates.end_date = updates.end_date || new Date().toISOString();
          break;
        case "duplicate":
          // TODO: Create duplicate campaign logic
          return NextResponse.json({
            message: "Campaign duplicated successfully",
            new_campaign_id: '${id}_copy_${Date.now()}'
          });
        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }
    }

    // Validate updates
    const validatedData = UpdateCampaignSchema.parse(updates);

    // TODO: Replace with actual database update
    const updatedCampaign = {
      id,
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      campaign: updatedCampaign,
      message: "Campaign updated successfully"
    });

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
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}