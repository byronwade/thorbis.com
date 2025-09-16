"use client";

import { AnalyticsChart } from "./analytics-chart";

export function RevenueChart() {
  // Generate mock revenue data
  const revenueData = generateRevenueData();

  return (
    <div className="p-6 pt-2">
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Last 30 days</span>
          <span>Daily Revenue</span>
        </div>
      </div>
      <AnalyticsChart 
        data={revenueData}
        height={280}
        color="#10b981"
      />
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">$124.5K</div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">$4.15K</div>
          <div className="text-sm text-muted-foreground">Daily Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">+12.5%</div>
          <div className="text-sm text-muted-foreground">Growth</div>
        </div>
      </div>
    </div>
  );
}

function generateRevenueData() {
  const data = [];
  const now = new Date();
  
  for (const i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate revenue with some trend and randomness
    const baseRevenue = 3000;
    const trend = (29 - i) * 50; // Upward trend
    const randomness = (Math.random() - 0.5) * 1000;
    const weekendMultiplier = [0, 6].includes(date.getDay()) ? 1.3 : 1; // Weekend boost
    
    const value = Math.max(1000, baseRevenue + trend + randomness) * weekendMultiplier;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value)
    });
  }
  
  return data;
}