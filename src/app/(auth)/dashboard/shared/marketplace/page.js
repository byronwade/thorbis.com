"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ArrowLeft, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import IntegrationMarketplace from "@components/dashboard/business/integrations/IntegrationMarketplace";
import { IntegrationVisibility } from "@components/dashboard/business/integrations/IntegrationVisibility";

/**
 * Dedicated Integration Marketplace Page
 * Provides a full-page experience for browsing and installing integrations
 */
export default function MarketplacePage() {
  return (
    <IntegrationVisibility featureKey="integration_marketplace">
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
              <h1 className="text-3xl font-bold">Integration Marketplace</h1>
              <p className="text-muted-foreground">
                Discover and install powerful integrations to enhance your business operations
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/business/settings?section=integrations">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage Installed
              </Button>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://thorbis.com/integrations" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Developer Docs
              </a>
            </Button>
          </div>
        </div>

        {/* Marketplace Component */}
        <IntegrationMarketplace />

        {/* Additional Resources */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integration Support</CardTitle>
              <CardDescription>
                Need help with integrations? Our support team is here to assist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/business/support">
                    Get Help
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <a 
                    href="https://thorbis.com/help/integrations" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Documentation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Integrations</CardTitle>
              <CardDescription>
                Need a custom integration? We can build it for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge variant="outline" className="text-sm">
                  Enterprise Feature
                </Badge>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a 
                    href="mailto:integrations@thorbis.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Contact Sales
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Partner Program</CardTitle>
              <CardDescription>
                Build integrations for the Thorbis ecosystem and reach thousands of businesses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a 
                    href="https://thorbis.com/partners" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Learn More
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </IntegrationVisibility>
  );
}
