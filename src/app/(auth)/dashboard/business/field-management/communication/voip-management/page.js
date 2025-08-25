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
    <div className="space-y-4">
      {/* VoIP Management Dashboard */}
      <VoipPro />
    </div>
  );
}
