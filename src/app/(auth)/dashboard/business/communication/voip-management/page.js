"use client";

import { Button } from "@components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import VoipPro from "@components/dashboard/business/integrations/VoipPro";

/**
 * VoIP Management Page
 * Consolidated from voip-pro module
 * Professional call center management with AI-powered insights and real-time collaboration
 */
export default function VoipManagementPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/business/communication">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communication
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">VoIP Management</h1>
            <p className="text-muted-foreground">
              Professional call center management with AI-powered insights and real-time collaboration
            </p>
          </div>
        </div>
      </div>

      {/* VoIP Management Dashboard */}
      <VoipPro />
    </div>
  );
}
