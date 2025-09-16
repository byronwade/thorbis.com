/**
 * Smart Dashboard Root Layout
 * 
 * Automatically detects the current route and configures the appropriate:
 * - Industry-specific sidebar and navigation
 * - App name and branding
 * - PWA install banners
 * - Theme and UI providers
 * 
 * Supports all dashboard route patterns:
 * - /dashboards/(verticals)/{industry} - Industry-specific dashboards (hs, auto, rest, ret, investigations)
 * - /dashboards/(shared)/{feature} - Cross-industry shared features (money, marketing, courses, ai, analytics)
 * - /dashboards/(admin)/{tool} - Administrative tools and API documentation
 * 
 * This unified approach eliminates the need for individual layout files in each route group,
 * following the REUSE FIRST, CREATE LAST principle.
 */

import { SmartDashboardLayout } from '@/components/smart-dashboard-layout'

interface DashboardsLayoutProps {
  children: React.ReactNode
}

export default function DashboardsLayout({ children }: DashboardsLayoutProps) {
  return (
    <SmartDashboardLayout>
      {children}
    </SmartDashboardLayout>
  )
}