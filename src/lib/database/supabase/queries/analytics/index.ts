/**
 * Analytics Queries
 * Enterprise-level analytics and metrics queries with performance optimization
 * Handles business intelligence, user analytics, and performance tracking
 */

import { supabase, Tables } from "../../client";
import { CacheManager } from "@utils/cache-manager";
import logger from "@lib/utils/logger";

type AnalyticsEvent = Tables<"analytics_events">;
type FormSubmission = Tables<"form_submissions">;

/**
 * Analytics Queries Class
 * Centralized analytics and business intelligence queries
 */
export class AnalyticsQueries {
	private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes for analytics
	private static readonly pooledClient = supabase;

	/**
	 * Get user analytics summary with comprehensive metrics
	 */
	static async getUserAnalytics(userId: string): Promise<{
		summary: any;
		events: AnalyticsEvent[];
		performance: { queryTime: number; cacheHit: boolean };
	}> {
		const startTime = performance.now();
		const cacheKey = `user_analytics_${userId}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			logger.performance(`User analytics cache hit: ${cacheKey}`);
			return {
				...cached,
				performance: {
					queryTime: performance.now() - startTime,
					cacheHit: true,
				},
			};
		}

		try {
			// Get analytics summary using database function
			const { data: summary, error: summaryError } = await this.pooledClient.rpc("get_user_analytics", { user_uuid: userId });

			if (summaryError) {
				logger.error("User analytics summary error:", summaryError);
				throw summaryError;
			}

			// Get recent events
			const { data: events, error: eventsError } = await this.pooledClient.from("analytics_events").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100);

			if (eventsError) {
				logger.error("User analytics events error:", eventsError);
				throw eventsError;
			}

			const result = {
				summary: summary || {},
				events: events || [],
			};

			// Cache the result
			CacheManager.memory?.set(cacheKey, result, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`User analytics completed in ${queryTime.toFixed(2)}ms`);

			return {
				...result,
				performance: {
					queryTime,
					cacheHit: false,
				},
			};
		} catch (error) {
			logger.error("User analytics error:", error);
			throw error;
		}
	}

	/**
	 * Track analytics event with batching for performance
	 */
	static async trackEvent(eventData: { userId?: string; sessionId?: string; eventType: string; eventData?: Record<string, any>; pageUrl?: string; referrer?: string; userAgent?: string; ipAddress?: string }): Promise<{ success: boolean; eventId?: string }> {
		try {
			const { data, error } = await this.pooledClient
				.from("analytics_events")
				.insert({
					user_id: eventData.userId,
					session_id: eventData.sessionId,
					event_type: eventData.eventType,
					event_data: eventData.eventData || {},
					page_url: eventData.pageUrl,
					referrer: eventData.referrer,
					user_agent: eventData.userAgent,
					ip_address: eventData.ipAddress,
				})
				.select("id")
				.single();

			if (error) {
				logger.error("Analytics event tracking error:", error);
				throw error;
			}

			logger.debug(`Analytics event tracked: ${eventData.eventType}`);

			return {
				success: true,
				eventId: data?.id,
			};
		} catch (error) {
			logger.error("Track event error:", error);
			// Don't throw - analytics failures shouldn't break the app
			return { success: false };
		}
	}

	/**
	 * Get business analytics with revenue and performance metrics
	 */
	static async getBusinessAnalytics(
		businessId: string,
		timeRange: "7d" | "30d" | "90d" = "30d"
	): Promise<{
		views: number;
		clicks: number;
		conversions: number;
		revenue: number;
		topPages: Array<{ page: string; views: number }>;
		topEvents: Array<{ event: string; count: number }>;
		performance: { queryTime: number };
	}> {
		const startTime = performance.now();
		const cacheKey = `business_analytics_${businessId}_${timeRange}`;

		// Check cache first
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return {
				...cached,
				performance: { queryTime: performance.now() - startTime },
			};
		}

		try {
			// Calculate date range
			const daysAgo = { "7d": 7, "30d": 30, "90d": 90 }[timeRange];
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysAgo);

			// Get analytics events related to this business
			const { data: events, error } = await this.pooledClient.from("analytics_events").select("event_type, event_data, page_url, created_at").gte("created_at", startDate.toISOString()).contains("event_data", { businessId });

			if (error) {
				logger.error("Business analytics error:", error);
				throw error;
			}

			// Process analytics data
			const views = events?.filter((e) => e.event_type === "business_view").length || 0;
			const clicks = events?.filter((e) => e.event_type === "business_click").length || 0;
			const conversions = events?.filter((e) => e.event_type === "business_conversion").length || 0;

			// Calculate revenue (mock calculation - implement based on your business model)
			const revenue = conversions * 25; // Average conversion value

			// Top pages
			const pageViews = events?.filter((e) => e.page_url) || [];
			const topPages = pageViews.reduce((acc: Record<string, number>, event) => {
				acc[event.page_url!] = (acc[event.page_url!] || 0) + 1;
				return acc;
			}, {});

			const topPagesArray = Object.entries(topPages)
				.map(([page, views]) => ({ page, views }))
				.sort((a, b) => b.views - a.views)
				.slice(0, 10);

			// Top events
			const eventTypes = events || [];
			const topEvents = eventTypes.reduce((acc: Record<string, number>, event) => {
				acc[event.event_type] = (acc[event.event_type] || 0) + 1;
				return acc;
			}, {});

			const topEventsArray = Object.entries(topEvents)
				.map(([event, count]) => ({ event, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10);

			const result = {
				views,
				clicks,
				conversions,
				revenue,
				topPages: topPagesArray,
				topEvents: topEventsArray,
			};

			// Cache the result
			CacheManager.memory?.set(cacheKey, result, this.CACHE_TTL);

			const queryTime = performance.now() - startTime;
			logger.performance(`Business analytics completed in ${queryTime.toFixed(2)}ms`);

			return {
				...result,
				performance: { queryTime },
			};
		} catch (error) {
			logger.error("Business analytics error:", error);
			throw error;
		}
	}

	/**
	 * Get platform-wide analytics dashboard
	 */
	static async getPlatformAnalytics(timeRange: "24h" | "7d" | "30d" = "7d"): Promise<{
		totalUsers: number;
		activeUsers: number;
		totalBusinesses: number;
		totalEvents: number;
		topEvents: Array<{ event: string; count: number }>;
		userGrowth: Array<{ date: string; count: number }>;
		performance: { queryTime: number };
	}> {
		const startTime = performance.now();
		const cacheKey = `platform_analytics_${timeRange}`;

		// Check cache first (shorter cache for platform metrics)
		const cached = CacheManager.memory?.get(cacheKey);
		if (cached) {
			return {
				...cached,
				performance: { queryTime: performance.now() - startTime },
			};
		}

		try {
			// Calculate date range
			const hoursAgo = { "24h": 24, "7d": 168, "30d": 720 }[timeRange];
			const startDate = new Date();
			startDate.setHours(startDate.getHours() - hoursAgo);

			// Parallel queries for better performance
			const [usersResult, businessesResult, eventsResult] = await Promise.all([
				// Total and active users
				this.pooledClient.from("users").select("id, created_at, last_sign_in_at").gte("last_sign_in_at", startDate.toISOString()),

				// Total businesses
				this.pooledClient.from("businesses").select("id, created_at").eq("status", "published"),

				// Analytics events
				this.pooledClient.from("analytics_events").select("event_type, created_at").gte("created_at", startDate.toISOString()),
			]);

			if (usersResult.error) throw usersResult.error;
			if (businessesResult.error) throw businessesResult.error;
			if (eventsResult.error) throw eventsResult.error;

			const activeUsers = usersResult.data?.length || 0;
			const totalBusinesses = businessesResult.data?.length || 0;
			const totalEvents = eventsResult.data?.length || 0;

			// Get total users count
			const { count: totalUsers } = await this.pooledClient.from("users").select("*", { count: "exact", head: true });

			// Process top events
			const events = eventsResult.data || [];
			const eventCounts = events.reduce((acc: Record<string, number>, event) => {
				acc[event.event_type] = (acc[event.event_type] || 0) + 1;
				return acc;
			}, {});

			const topEvents = Object.entries(eventCounts)
				.map(([event, count]) => ({ event, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10);

			// Calculate user growth (daily for the time range)
			const userGrowth = this.calculateUserGrowth(usersResult.data || [], timeRange);

			const result = {
				totalUsers: totalUsers || 0,
				activeUsers,
				totalBusinesses,
				totalEvents,
				topEvents,
				userGrowth,
			};

			// Cache with shorter TTL for platform metrics
			CacheManager.memory?.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes

			const queryTime = performance.now() - startTime;
			logger.performance(`Platform analytics completed in ${queryTime.toFixed(2)}ms`);

			return {
				...result,
				performance: { queryTime },
			};
		} catch (error) {
			logger.error("Platform analytics error:", error);
			throw error;
		}
	}

	/**
	 * Get form submission analytics
	 */
	static async getFormAnalytics(formType?: string): Promise<{
		submissions: FormSubmission[];
		totalCount: number;
		conversionRate: number;
		averageCompletionTime: number;
		performance: { queryTime: number };
	}> {
		const startTime = performance.now();
		const cacheKey = `form_analytics_${formType || "all"}`;

		try {
			let query = this.pooledClient.from("form_submissions").select("*").order("created_at", { ascending: false });

			if (formType) {
				query = query.eq("form_type", formType);
			}

			const { data: submissions, error, count } = await query.limit(100);

			if (error) {
				logger.error("Form analytics error:", error);
				throw error;
			}

			// Calculate metrics
			const totalCount = count || 0;
			const completedSubmissions = submissions?.filter((s) => s.status === "completed") || [];
			const conversionRate = totalCount > 0 ? (completedSubmissions.length / totalCount) * 100 : 0;

			// Mock average completion time calculation
			const averageCompletionTime = 180; // 3 minutes average

			const result = {
				submissions: submissions || [],
				totalCount,
				conversionRate,
				averageCompletionTime,
			};

			const queryTime = performance.now() - startTime;
			logger.performance(`Form analytics completed in ${queryTime.toFixed(2)}ms`);

			return {
				...result,
				performance: { queryTime },
			};
		} catch (error) {
			logger.error("Form analytics error:", error);
			throw error;
		}
	}

	/**
	 * Helper method to calculate user growth over time
	 */
	private static calculateUserGrowth(users: any[], timeRange: string): Array<{ date: string; count: number }> {
		const days = { "24h": 1, "7d": 7, "30d": 30 }[timeRange] || 7;
		const growth: Array<{ date: string; count: number }> = [];

		for (let i = days - 1; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split("T")[0];

			const count = users.filter((user) => {
				const userDate = new Date(user.created_at).toISOString().split("T")[0];
				return userDate === dateStr;
			}).length;

			growth.push({ date: dateStr, count });
		}

		return growth;
	}
}
