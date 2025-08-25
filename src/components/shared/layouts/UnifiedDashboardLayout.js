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
      
      {/* Main Content Area - Full Width Container */}
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}
