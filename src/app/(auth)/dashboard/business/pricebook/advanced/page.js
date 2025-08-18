"use client";

import { Button } from "@components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PricebookPro from "@components/dashboard/business/integrations/PricebookPro";

/**
 * Advanced Pricebook Management Page
 * Consolidated from pricebook-pro module
 * Comprehensive service item catalog, pricing, and inventory management system
 */
export default function AdvancedPricebookPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/business/pricebook">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricebook
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Advanced Pricebook</h1>
            <p className="text-muted-foreground">
              Comprehensive service item catalog, pricing, and inventory management system
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Pricebook Dashboard */}
      <PricebookPro />
    </div>
  );
}
