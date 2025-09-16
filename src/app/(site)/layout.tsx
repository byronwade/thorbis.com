import React from "react";
import { MarketingHeader } from "@/components/marketing-header";
import { SubHeaderNavigation } from "@/components/sub-header-navigation";
import { MarketingFooter } from "@/components/marketing-footer";
import { PageErrorBoundary } from "@/components/error-handling/error-boundary";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Marketing Header */}
      <MarketingHeader />
      
      {/* Sub-Header Navigation */}
      <SubHeaderNavigation />
      
      {/* Main Content */}
      <PageErrorBoundary>
        {children}
      </PageErrorBoundary>
      
      {/* Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}