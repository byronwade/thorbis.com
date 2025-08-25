"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { ArrowLeft, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import FleetManagementDashboard from "@components/dashboard/business/integrations/FleetManagementPro";

/**
 * Fleet Management Dashboard Page
 * Consolidated fleet and fleet-pro functionality
 * Full-featured enterprise fleet management dashboard and control center
 */
export default function FleetManagementPage() {
  return (
    		<div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/business">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Fleet Management</h1>
            <p className="text-muted-foreground">
              Enterprise fleet tracking, maintenance, and driver management system
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/business/settings?section=fleet-management">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Fleet Settings
            </Button>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://thorbis.com/fleet-management" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Learn More
            </a>
          </Button>
        </div>
      </div>

      {/* Fleet Management Dashboard Component */}
      <FleetManagementDashboard />
    </div>
  );
}
