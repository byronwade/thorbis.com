/**
 * User Dashboard API v1
 * Provides comprehensive user dashboard data with performance optimization
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";

// User dashboard query validation schema
const userDashboardQuerySchema = z.object({
  sections: z
    .array(z.enum(["stats", "activity", "profile", "notifications", "quick_actions"]))
    .optional()
    .default(["stats", "activity", "profile"]),
  period: z.enum(["7d", "30d", "90d"]).default("30d"),
  limit: z.coerce.number().min(1).max(100).default(10),
});

type UserDashboardQuery = z.infer<typeof userDashboardQuerySchema>;

/**
 * GET /api/v1/users/dashboard - Get user dashboard data
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = userDashboardQuerySchema.parse(Object.fromEntries(searchParams));

    // For now, simulate authentication
    // In production, this would require proper authentication middleware
    const mockUser = {
      id: "mock-user-id",
      email: "user@example.com",
      name: "Mock User",
      role: "user",
    };

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    // Calculate date range for metrics
    const now = new Date();
    const periodDays = { "7d": 7, "30d": 30, "90d": 90 }[queryParams.period];
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const dashboardData: unknown = {};

    // Fetch user stats if requested
    if (queryParams.sections.includes("stats")) {
      // Mock stats data - in production this would come from database
      dashboardData.stats = {
        profileViews: {
          value: "1,234",
          change: "+15.2%",
          trend: "up",
          description: `Views in last ${queryParams.period}`,
        },
        reviewsWritten: {
          value: "12",
          change: "+3",
          trend: "up",
          description: `Reviews in last ${queryParams.period}`,
        },
        businessesFollowed: {
          value: "24",
          change: "+2",
          trend: "up",
          description: `Businesses followed in last ${queryParams.period}`,
        },
        helpfulVotes: {
          value: "89",
          change: "+12",
          trend: "up",
          description: `Helpful votes received in last ${queryParams.period}`,
        },
      };
    }

    // Fetch recent activity if requested
    if (queryParams.sections.includes("activity")) {
      // Mock activity data - in production this would come from database
      dashboardData.activity = [
        {
          id: "1",
          type: "review",
          title: "Left a review for Joe's Pizza",
          description: "Rated 5 stars - Great pizza and service!",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          metadata: { businessName: "Joe's Pizza", rating: 5 },
        },
        {
          id: "2",
          type: "follow",
          title: "Started following Mike's Auto Repair",
          description: "Added to your following list",
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          metadata: { businessName: "Mike's Auto Repair" },
        },
        {
          id: "3",
          type: "helpful_vote",
          title: "Your review was marked helpful",
          description: "Your review of Coffee Corner received 5 helpful votes",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          metadata: { businessName: "Coffee Corner", votes: 5 },
        },
      ].slice(0, queryParams.limit);
    }

    // Fetch profile completion if requested
    if (queryParams.sections.includes("profile")) {
      // Mock profile data - in production this would come from database
      const profileSections = [
        { key: "basicInfo", completed: true, name: "Basic Information" },
        { key: "contactDetails", completed: true, name: "Contact Details" },
        { key: "preferences", completed: false, name: "Preferences" },
        { key: "avatar", completed: false, name: "Profile Photo" },
        { key: "bio", completed: false, name: "Bio & Interests" },
      ];

      const completedSections = profileSections.filter((section) => section.completed);
      const missingSections = profileSections.filter((section) => !section.completed);
      const completionPercentage = Math.round((completedSections.length / profileSections.length) * 100);

      dashboardData.profile = {
        completion: {
          percentage: completionPercentage,
          completedSections: completedSections.map((s) => ({ key: s.key, name: s.name })),
          missingSections: missingSections.map((s) => ({ key: s.key, name: s.name })),
        },
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          avatar_url: null,
          bio: null,
          location: null,
          website: null,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        },
      };
    }

    // Fetch notifications if requested
    if (queryParams.sections.includes("notifications")) {
      // Mock notifications data - in production this would come from database
      dashboardData.notifications = [
        {
          id: "1",
          title: "New review on your favorite business",
          message: "Joe's Pizza has a new 5-star review",
          type: "business_update",
          read: false,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        },
        {
          id: "2",
          title: "Your review was featured",
          message: "Your review of Coffee Corner was featured in this week's highlights",
          type: "review_featured",
          read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
      ];
    }

    // Quick actions if requested
    if (queryParams.sections.includes("quick_actions")) {
      dashboardData.quickActions = [
        {
          id: "write_review",
          title: "Write a Review",
          description: "Share your experience with a business",
          icon: "edit",
          href: "/write-review",
        },
        {
          id: "find_business",
          title: "Find Businesses",
          description: "Discover new places in your area",
          icon: "search",
          href: "/search",
        },
        {
          id: "update_profile",
          title: "Update Profile",
          description: "Complete your profile for better recommendations",
          icon: "user",
          href: "/profile/edit",
        },
      ];
    }

    const queryTime = performance.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        dashboard: dashboardData,
        metadata: {
          userId: mockUser.id,
          period: queryParams.period,
          sections: queryParams.sections,
          generatedAt: new Date().toISOString(),
        },
      },
      meta: {
        performance: {
          queryTime,
          cacheHit: false,
        },
        filters: queryParams,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("User dashboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "FETCH_ERROR",
        message: "Failed to fetch dashboard data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export type UserDashboardResponse = {
  success: true;
  data: {
    dashboard: {
      stats?: {
        profileViews: {
          value: string;
          change: string;
          trend: "up" | "down";
          description: string;
        };
        reviewsWritten: {
          value: string;
          change: string;
          trend: "up" | "down";
          description: string;
        };
        businessesFollowed: {
          value: string;
          change: string;
          trend: "up" | "down";
          description: string;
        };
        helpfulVotes: {
          value: string;
          change: string;
          trend: "up" | "down";
          description: string;
        };
      };
      activity?: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        created_at: string;
        metadata: Record<string, unknown>;
      }>;
      profile?: {
        completion: {
          percentage: number;
          completedSections: Array<{ key: string; name: string }>;
          missingSections: Array<{ key: string; name: string }>;
        };
        user: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          created_at: string;
        };
      };
      notifications?: Array<{
        id: string;
        title: string;
        message: string;
        type: string;
        read: boolean;
        created_at: string;
      }>;
      quickActions?: Array<{
        id: string;
        title: string;
        description: string;
        icon: string;
        href: string;
      }>;
    };
    metadata: {
      userId: string;
      period: string;
      sections: string[];
      generatedAt: string;
    };
  };
  meta: {
    performance: {
      queryTime: number;
      cacheHit: boolean;
    };
    filters: UserDashboardQuery;
  };
  timestamp: string;
};