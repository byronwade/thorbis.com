/**
 * Dashboard TypeScript Type Definitions
 * Comprehensive type definitions for dashboard-related components and data structures
 */

import { LucideIcon } from "lucide-react";

// =============================================================================
// USER TYPES
// =============================================================================

export interface User {
	id: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	bio?: string;
	avatar_url?: string;
	workExperience?: WorkExperience[];
	skills?: string[];
	resumeUrl?: string;
	created_at?: string;
	updated_at?: string;
}

export interface WorkExperience {
	id: string;
	title: string;
	company: string;
	location?: string;
	startDate: string;
	endDate?: string;
	description?: string;
	current: boolean;
}

// =============================================================================
// DASHBOARD STATISTICS
// =============================================================================

export type TrendDirection = "up" | "down" | "neutral";

export interface StatTrend {
	value: string;
	change: string;
	trend: TrendDirection;
}

export interface DashboardStats {
	profileViews: StatTrend;
	jobApplications: StatTrend;
	reviewsWritten: StatTrend;
	earnings: StatTrend;
}

export interface DashboardStat {
	title: string;
	value: string;
	change: string;
	trend: TrendDirection;
	icon: LucideIcon;
	description: string;
}

// =============================================================================
// ACTIVITY & UPDATES
// =============================================================================

export type ActivityType = "job_application" | "review_created" | "referral_earned" | "profile_viewed" | "boost_activated";

export interface ActivityItem {
	id: number;
	type: ActivityType;
	title: string;
	description: string;
	timestamp: Date;
	actionLink: string;
	metadata?: Record<string, any>;
}

export type SystemUpdateType = "feature" | "improvement" | "fix" | "security";

export interface SystemUpdate {
	id: number;
	type: SystemUpdateType;
	title: string;
	description: string;
	date: string;
	version: string;
	badge: string;
	icon?: LucideIcon;
	iconColor?: string;
	badgeColor?: string;
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================

export interface QuickAction {
	title: string;
	description: string;
	icon: LucideIcon;
	link: string;
	color: string;
	priority?: number;
	enabled?: boolean;
}

// =============================================================================
// PROFILE COMPLETION
// =============================================================================

export interface ProfileSection {
	key: string;
	name: string;
	completed: boolean;
	weight?: number;
	label?: string;
}

export interface ProfileCompletion {
	percentage: number;
	completedSections: string[];
	missingSections: string[];
	sections?: ProfileSection[];
}

// =============================================================================
// DASHBOARD DATA STRUCTURE
// =============================================================================

export interface DashboardData {
	stats: DashboardStats | null;
	recentActivity: ActivityItem[] | null;
	systemUpdates: SystemUpdate[] | null;
	quickActions: QuickAction[] | null;
	profileCompletion: ProfileCompletion | null;
}

// =============================================================================
// HOOKS RETURN TYPES
// =============================================================================

export interface UseUserDashboardReturn {
	// Data
	dashboardData: DashboardData;
	isLoading: boolean;
	refreshing: boolean;
	user: User | null;

	// Actions
	refreshDashboard: () => Promise<void>;
	updateDashboardSection: (section: keyof DashboardData, data: any) => void;
	initializeDashboard: () => Promise<void>;

	// Computed
	profileCompletion: ProfileCompletion | null;

	// Utilities
	calculateProfileCompletion: () => ProfileCompletion;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface StatsOverviewSectionProps {
	user?: User | null;
}

export interface RecentActivitySectionProps {
	activities?: ActivityItem[];
	isLoading?: boolean;
}

export interface SystemUpdatesSectionProps {
	updates?: SystemUpdate[];
	isLoading?: boolean;
}

export interface QuickActionsSectionProps {
	actions?: QuickAction[];
	isLoading?: boolean;
}

// =============================================================================
// LOCALHUB SPECIFIC TYPES (Enhanced for LocalHub dashboard)
// =============================================================================

export type ChangeType = "positive" | "negative" | "neutral";
export type BusinessStatus = "active" | "inactive" | "pending" | "suspended";
export type SubscriptionPlan = "basic" | "pro" | "premium" | "enterprise";
export type ActivityType = "signup" | "subscription" | "payment" | "upgrade" | "customization" | "business_update" | "review_added" | "support_request";

export interface LocalHubStatTrend {
	value: number;
	change: number;
	changeType: ChangeType;
	previousPeriod?: number;
	target?: number;
}

export interface DirectoryStats {
	monthlyRevenue: LocalHubStatTrend;
	activeBusinesses: LocalHubStatTrend;
	directoryViews: LocalHubStatTrend;
	yourShare: LocalHubStatTrend;
	searchQueries?: LocalHubStatTrend;
	conversionRate?: LocalHubStatTrend;
	avgSessionDuration?: LocalHubStatTrend;
}

export interface BusinessMetrics {
	averageRevenuePerBusiness: number;
	newBusinessesThisWeek: number;
	upgradesThisWeek: number;
	monthlyGrowthRate: number;
	churnRate?: number;
	avgSubscriptionLength?: number;
	topPerformingCategories?: string[];
}

export interface LocalHubActivity {
	id: string;
	type: ActivityType;
	title: string;
	description: string;
	time: string;
	timestamp: Date;
	icon: any; // LucideIcon type
	iconColor: string;
	action?: string;
	actionLink?: string;
	badge?: string;
	badgeColor?: string;
	businessId?: string;
	businessName?: string;
	metadata?: Record<string, any>;
}

export interface HealthMetric {
	metric: string;
	value: number;
	status: "excellent" | "good" | "warning" | "critical";
	target: number;
	trend: "improving" | "stable" | "declining";
	icon?: any;
	description?: string;
	lastUpdated?: Date;
}

export interface DirectoryHealth {
	metrics: HealthMetric[];
	overallScore: number;
	overallStatus: string;
	insights?: string[];
	recommendations?: string[];
}

export interface RevenueBreakdown {
	plan: string;
	count: number;
	revenue: number;
	monthlyRate: number;
	percentage?: number;
	color?: string;
	growth?: number;
}

export interface RevenueBreakdownData {
	breakdown: RevenueBreakdown[];
	totalRevenue: number;
	platformFee: number;
	yourShare: number;
	totalBusinesses: number;
	averageRevenuePerBusiness?: number;
	projectedRevenue?: number;
	revenueGrowth?: number;
}

export interface Business {
	id: string;
	name: string;
	category: string;
	plan: SubscriptionPlan;
	status: BusinessStatus;
	monthlyRevenue: number;
	joinedDate: Date;
	lastActivity: Date;
	contactEmail: string;
	phone?: string;
	address?: string;
	rating?: number;
	reviewCount?: number;
	website?: string;
	verified: boolean;
	featured: boolean;
	photosCount?: number;
}

export interface GrowthAnalytics {
	monthlyGrowthRate: number;
	quarterlyGrowthRate: number;
	yearOverYearGrowth: number;
	businessRetentionRate: number;
	revenueProjections: Array<{
		month: string;
		projected: number;
		actual?: number;
	}>;
	topGrowthDrivers: Array<{
		factor: string;
		impact: number;
		trend: "up" | "down" | "stable";
	}>;
}

export interface PerformanceInsights {
	directoryPerformance: {
		uniqueVisitors: number;
		pageViews: number;
		bounceRate: number;
		avgSessionDuration: number;
		searchQueries: number;
		clickThroughRate: number;
	};
	topSearchTerms: Array<{
		term: string;
		count: number;
		growth: number;
	}>;
	businessPerformance: Array<{
		businessId: string;
		businessName: string;
		views: number;
		clicks: number;
		inquiries: number;
		conversionRate: number;
	}>;
	categoryPerformance: Array<{
		category: string;
		businessCount: number;
		avgRevenue: number;
		popularity: number;
	}>;
}

export interface LocalHubDashboardData {
	directoryStats: DirectoryStats | null;
	recentActivity: LocalHubActivity[] | null;
	revenueBreakdown: RevenueBreakdownData | null;
	directoryHealth: DirectoryHealth | null;
	businessMetrics: BusinessMetrics | null;
	businesses?: Business[] | null;
	growthAnalytics?: GrowthAnalytics | null;
	performanceInsights?: PerformanceInsights | null;
}

export interface UseLocalHubDashboardReturn {
	// Data
	dashboardData: LocalHubDashboardData;
	isLoading: boolean;
	refreshing: boolean;
	user: User | null;

	// Actions
	refreshDashboard: () => Promise<void>;
	updateDashboardSection: (section: keyof LocalHubDashboardData, data: any) => void;
	initializeDashboard: () => Promise<void>;
	trackDashboardAction: (action: string, metadata?: Record<string, any>) => Promise<void>;

	// Computed
	directoryStats: DirectoryStats | null;
	recentActivity: LocalHubActivity[] | null;
	revenueBreakdown: RevenueBreakdownData | null;
	directoryHealth: DirectoryHealth | null;
	businessMetrics: BusinessMetrics | null;

	// Utilities
	calculateBusinessMetrics: (revenueData: RevenueBreakdownData, activityData: LocalHubActivity[]) => BusinessMetrics | null;
}

// =============================================================================
// LOCALHUB COMPONENT PROPS
// =============================================================================

export interface LocalHubStatsSectionProps {
	stats: DirectoryStats | null;
}

export interface LocalHubActivitySectionProps {
	activities: LocalHubActivity[] | null;
}

export interface LocalHubRevenueBreakdownSectionProps {
	revenueData: RevenueBreakdownData | null;
	expanded?: boolean;
}

export interface LocalHubDirectoryHealthSectionProps {
	healthData: DirectoryHealth | null;
}

export interface LocalHubBusinessManagementSectionProps {
	businesses?: Business[] | null;
}

export interface LocalHubGrowthAnalyticsSectionProps {
	growthData?: GrowthAnalytics | null;
}

export interface LocalHubPerformanceInsightsSectionProps {
	performanceData?: PerformanceInsights | null;
	expanded?: boolean;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface DashboardApiResponse<T = any> {
	data: T;
	success: boolean;
	message?: string;
	error?: string;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface DashboardSettings {
	emailNotifications: boolean;
	pushNotifications: boolean;
	dashboardLayout: "compact" | "standard" | "detailed";
	theme: "light" | "dark" | "system";
	language: string;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface AnalyticsEvent {
	userId: string;
	action: string;
	metadata: Record<string, any>;
	timestamp?: number;
}

export interface PerformanceMetric {
	name: string;
	value: number;
	unit: string;
	timestamp: number;
}
