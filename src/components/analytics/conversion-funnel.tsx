"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export function ConversionFunnel() {
  const funnelData: FunnelStage[] = [
    { name: "Website Visitors", count: 10000, percentage: 100, color: "#3b82f6" },
    { name: "Product Views", count: 6500, percentage: 65, color: "#10b981" },
    { name: "Add to Cart", count: 2200, percentage: 22, color: "#f59e0b" },
    { name: "Checkout Started", count: 1100, percentage: 11, color: "#ef4444" },
    { name: "Purchase Complete", count: 340, percentage: 3.4, color: "#8b5cf6" }
  ];

  return (
    <div className="space-y-6">
      {funnelData.map((stage, index) => {
        const dropOffRate = index > 0 ? 
          ((funnelData[index - 1].count - stage.count) / funnelData[index - 1].count * 100).toFixed(1) 
          : null;

        return (
          <div key={stage.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="font-medium">{stage.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {stage.count.toLocaleString()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {stage.percentage}%
                </span>
              </div>
            </div>
            
            <Progress 
              value={stage.percentage} 
              className="h-2"
              style={{
                // @ts-ignore
                '--progress-background': stage.color
              }}
            />

            {dropOffRate && (
              <div className="text-xs text-red-400 ml-6">
                -{dropOffRate}% drop-off from previous stage
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
        <div className="text-sm font-medium mb-2">Conversion Summary</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Overall Conversion</div>
            <div className="text-lg font-bold text-purple-400">3.4%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Revenue per Visitor</div>
            <div className="text-lg font-bold">$12.46</div>
          </div>
        </div>
      </div>
    </div>
  );
}