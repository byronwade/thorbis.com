"use client";

import React from 'react';
import UnifiedHeader from '@components/shared/unified-header';

/**
 * Unified Dashboard Layout for all dashboard types
 * Uses the compact unified header with icon-only design for dashboards
 * Maintains consistent navigation patterns across all dashboard types
 */
export default function UnifiedDashboardLayout({ children, dashboardType = "business" }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Compact Dashboard Header with Icon-Only Design */}
      <UnifiedHeader dashboardType={dashboardType} />
      
      {/* Main Content Area - Ensure content isn't hidden behind header */}
      <main className="px-4 py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
