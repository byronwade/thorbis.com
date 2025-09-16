import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Campaign validation schema
const CampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  type: z.enum(["email", "social", "display", "search", "video"]),
  status: z.enum(["draft", "active", "paused", "completed"]).default("draft"),
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
  channels: z.array(z.string()).min(1, "At least one channel is required"),
  content: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    assets: z.array(z.string()).optional(),
  }).optional(),
});

const UpdateCampaignSchema = CampaignSchema.partial();

// GET /api/campaigns - List campaigns with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    // TODO: Replace with actual database query
    const mockCampaigns = [
      {
        id: "1",
        name: "Holiday Sale Email Campaign",
        type: "email",
        status: "active",
        budget: 5000,
        start_date: "2025-01-01T00:00:00Z",
        end_date: "2025-01-31T23:59:59Z",
        performance: {
          impressions: 125000,
          clicks: 8750,
          conversions: 425,
          cost: 2340,
          roi: 3.2
        },
        created_at: "2024-12-15T10:30:00Z",
        updated_at: "2025-01-03T14:20:00Z"
      },
      {
        id: "2", 
        name: "Brand Awareness Social Campaign",
        type: "social",
        status: "active",
        budget: 3000,
        start_date: "2024-12-20T00:00:00Z",
        end_date: "2025-01-20T23:59:59Z",
        performance: {
          impressions: 89000,
          clicks: 4200,
          conversions: 180,
          cost: 1850,
          roi: 2.8
        },
        created_at: "2024-12-18T09:15:00Z",
        updated_at: "2025-01-03T12:45:00Z"
      }
    ];

    // Apply filters
    let filteredCampaigns = mockCampaigns;
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status);
    }
    if (type) {
      filteredCampaigns = filteredCampaigns.filter(c => c.type === type);
    }
    if (search) {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
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
      },
      filters: {
        status: status || null,
        type: type || null,
        search: search || null,
      }
    });

  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = CampaignSchema.parse(body);

    // TODO: Replace with actual database insertion
    const newCampaign = {
      id: Date.now().toString(),
      ...validatedData,
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        roi: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      { 
        campaign: newCampaign,
        message: "Campaign created successfully" 
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
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns - Bulk update campaigns
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaign_ids, updates } = body;

    if (!Array.isArray(campaign_ids) || campaign_ids.length === 0) {
      return NextResponse.json(
        { error: "campaign_ids must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate updates
    const validatedUpdates = UpdateCampaignSchema.parse(updates);

    // TODO: Replace with actual database bulk update
    const updatedCampaigns = campaign_ids.map(id => ({
      id,
      ...validatedUpdates,
      updated_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      updated_campaigns: updatedCampaigns,
      message: `Successfully updated ${campaign_ids.length} campaigns`
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
      { error: "Failed to update campaigns" },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns - Bulk delete campaigns
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaign_ids } = body;

    if (!Array.isArray(campaign_ids) || campaign_ids.length === 0) {
      return NextResponse.json(
        { error: "campaign_ids must be a non-empty array" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database deletion
    // In production, this should be a soft delete with deleted_at timestamp
    
    return NextResponse.json({
      deleted_campaign_ids: campaign_ids,
      message: `Successfully deleted ${campaign_ids.length} campaigns`
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to delete campaigns" },
      { status: 500 }
    );
  }
}