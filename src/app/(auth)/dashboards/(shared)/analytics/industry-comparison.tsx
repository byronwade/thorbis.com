"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wrench, Utensils, Car, Store } from "lucide-react";

interface IndustryData {
  [key: string]: {
    revenue: number;
    users: number;
    conversion: number;
  };
}

interface IndustryComparisonProps {
  data: IndustryData;
}

export function IndustryComparison({ data }: IndustryComparisonProps) {
  const industries = [
    { key: "hs", name: "Home Services", icon: Wrench, color: "#3b82f6" },
    { key: "rest", name: "Restaurant", icon: Utensils, color: "#10b981" },
    { key: "auto", name: "Auto Services", icon: Car, color: "#f59e0b" },
    { key: "ret", name: "Retail", icon: Store, color: "#ef4444" }
  ];

  // Calculate max values for progress bars
  const maxRevenue = Math.max(...Object.values(data).map(d => d.revenue));
  const maxUsers = Math.max(...Object.values(data).map(d => d.users));
  const maxConversion = Math.max(...Object.values(data).map(d => d.conversion));

  return (
    <div className="space-y-6">
      {industries.map((industry) => {
        const industryData = data[industry.key];
        if (!industryData) return null;

        const Icon = industry.icon;
        
        return (
          <div key={industry.key} className="p-4 rounded-lg bg-gradient-to-r from-neutral-900 to-neutral-800 border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: industry.color + "20", border: `1px solid ${industry.color}40` }}
                >
                  <Icon className="h-5 w-5" style={{ color: industry.color }} />
                </div>
                <div>
                  <div className="font-medium">{industry.name}</div>
                  <div className="text-sm text-muted-foreground">Industry Performance</div>
                </div>
              </div>
              <Badge variant="outline" style={{ color: industry.color, borderColor: industry.color + "40" }}>
                Top Performer
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="text-sm font-medium">${industryData.revenue.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(industryData.revenue / maxRevenue) * 100} 
                  className="h-2"
                />
              </div>

              {/* Users */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="text-sm font-medium">{industryData.users.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(industryData.users / maxUsers) * 100} 
                  className="h-2"
                />
              </div>

              {/* Conversion */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="text-sm font-medium">{industryData.conversion}%</span>
                </div>
                <Progress 
                  value={(industryData.conversion / maxConversion) * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Performance indicators */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-700">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Revenue per User: ${Math.round(industryData.revenue / industryData.users)}</span>
                <span>Growth Rate: +{Math.floor(Math.random() * 20 + 5)}%</span>
              </div>
              <div className="text-xs">
                <span 
                  className="px-2 py-1 rounded-full text-xs"
                  style={{ 
                    backgroundColor: industry.color + "20", 
                    color: industry.color 
                  }}
                >
                  {industryData.conversion > 4 ? "High" : industryData.conversion > 2 ? "Medium" : "Low"} Performance
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}