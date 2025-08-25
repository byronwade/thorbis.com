"use client";

import { Button } from "@components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FieldSchedulerPro from "@components/dashboard/business/integrations/FieldSchedulerPro";

/**
 * Advanced Field Scheduler Page
 * Consolidated from field-scheduler-pro module
 * Advanced field service scheduling with team management and real-time updates
 */
export default function AdvancedSchedulerPage() {
  return (
    		<div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/business/schedule">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Schedule
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Advanced Field Scheduler</h1>
            <p className="text-muted-foreground">
              Advanced field service scheduling with team management and real-time updates
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Scheduler Dashboard */}
      <FieldSchedulerPro />
    </div>
  );
}
