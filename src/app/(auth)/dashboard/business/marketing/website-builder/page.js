"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

// Import the website builder dashboard directly
import WebsiteBuilderDashboard from "@components/site/website-builder/WebsiteBuilderDashboard";

/**
 * Website Builder Page
 * Consolidated from standalone website-builder module
 * Create professional websites with drag-and-drop builder
 */
export default function WebsiteBuilderPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/business/marketing">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketing
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Website Builder</h1>
            <p className="text-muted-foreground">
              Create professional websites with our drag-and-drop builder
            </p>
          </div>
        </div>
      </div>

      {/* Website Builder Dashboard */}
      <WebsiteBuilderDashboard 
        businessId="business_123"
        onClose={() => window.history.back()}
      />
    </div>
  );
}
