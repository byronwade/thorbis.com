/**
 * User Dashboard Page - TypeScript Modular Implementation
 * Replaces the original 647-line monolithic dashboard page
 * Uses extracted section components and custom hooks with full type safety
 */

"use client";

import React from "react";
import { StatsOverviewSection, RecentActivitySection, QuickActionsSection, SystemUpdatesSection } from "./sections";
import { MyReviewsSection, SavedBusinessesSection } from "./sections";
import { useUserDashboard } from "@lib/hooks/dashboard/use-user-dashboard";
import { Button } from "@components/ui/button";

import { RefreshCw } from "lucide-react";
import WeatherWidget from "@components/shared/weather-widget";

/**
 * User Dashboard Page Component
 *
 * @description Main dashboard component for authenticated users
 * @returns React functional component displaying user dashboard
 */
type ServerData = {
    stats?: any;
    recentActivity?: any[];
    reviews?: any[];
    savedBusinesses?: any[];
    user?: { id: string };
};

const UserDashboardPage: React.FC<{ serverData?: ServerData }> = ({ serverData }) => {
    const { dashboardData, isLoading, refreshing, user, refreshDashboard } = useUserDashboard();

    const effectiveUser = user || serverData?.user;
    const activity = serverData?.recentActivity || dashboardData.recentActivity;
    const reviews = serverData?.reviews || [];
    const savedBusinesses = serverData?.savedBusinesses || [];



    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || "User"}!</h1>
                    <p className="text-muted-foreground">Here's what's happening with your account today.</p>
                </div>
                <Button variant="outline" onClick={refreshDashboard} disabled={refreshing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Dashboard Content */}
            <div className="space-y-8">
                {/* Weather Widget - Full Width */}
                <WeatherWidget showBusinessImpact={false} />
                
                {/* Main Content Grid */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <StatsOverviewSection user={effectiveUser as any} />
                        <RecentActivitySection activities={activity as any} />
                        <MyReviewsSection reviews={reviews as any} />
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-8">
                        <QuickActionsSection />
                        <SystemUpdatesSection />
                        <SavedBusinessesSection items={savedBusinesses as any} />
                    </div>
                </div>
            </div>
        </div>
    );
};



export default UserDashboardPage;
