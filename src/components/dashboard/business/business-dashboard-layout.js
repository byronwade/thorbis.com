"use client";

import React from 'react';
import { BusinessHeader } from './business-header';
import { BusinessNavigation } from './business-navigation';
import useAuth from '@hooks/use-auth';

/**
 * Self-contained Business Dashboard Layout
 * Provides navigation and header specifically for business dashboard
 */
export default function BusinessDashboardLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Business Dashboard Header */}
      <BusinessHeader user={user} />

      <div className="flex">
        {/* Business Navigation Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
          <BusinessNavigation />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 pt-16">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
