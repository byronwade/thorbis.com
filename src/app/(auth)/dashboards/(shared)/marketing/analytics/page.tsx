"use client";

import { useState } from "react";
;
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
  Eye,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  Share2,
  Mail,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface ChannelData {
  channel: string;
  visitors: number;
  conversions: number;
  revenue: number;
  cpa: number; // cost per acquisition
  roas: number; // return on ad spend
  trend: "up" | "down" | "stable";
  trendValue: number;
}

interface FunnelStep {
  name: string;
  visitors: number;
  conversionRate: number;
  dropOff: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("conversions");

  // Mock data
  const channelData: ChannelData[] = [
    {
      channel: "Direct",
      visitors: 45230,
      conversions: 2845,
      revenue: 142500,
      cpa: 12.50,
      roas: 4.2,
      trend: "up",
      trendValue: 15.2,
    },
    {
      channel: "Organic Search",
      visitors: 38940,
      conversions: 2156,
      revenue: 108900,
      cpa: 8.75,
      roas: 5.8,
      trend: "up", 
      trendValue: 8.7,
    },
    {
      channel: "Email Marketing",
      visitors: 18420,
      conversions: 1890,
      revenue: 94500,
      cpa: 4.25,
      roas: 12.3,
      trend: "up",
      trendValue: 23.1,
    },
    {
      channel: "Social Media",
      visitors: 25680,
      conversions: 1234,
      revenue: 61700,
      cpa: 18.90,
      roas: 2.9,
      trend: "down",
      trendValue: -5.4,
    },
    {
      channel: "Paid Search",
      visitors: 12340,
      conversions: 892,
      revenue: 71360,
      cpa: 24.50,
      roas: 3.1,
      trend: "stable",
      trendValue: 1.2,
    },
    {
      channel: "Display Ads",
      visitors: 8950,
      conversions: 445,
      revenue: 35600,
      cpa: 32.10,
      roas: 2.1,
      trend: "down",
      trendValue: -12.8,
    },
  ];

  const funnelData: FunnelStep[] = [
    { name: "Website Visitors", visitors: 149560, conversionRate: 100, dropOff: 0 },
    { name: "Engaged Users", visitors: 67402, conversionRate: 45.1, dropOff: 54.9 },
    { name: "Product Views", visitors: 33701, conversionRate: 22.5, dropOff: 22.6 },
    { name: "Add to Cart", visitors: 13480, conversionRate: 9.0, dropOff: 13.5 },
    { name: "Checkout Started", visitors: 8088, conversionRate: 5.4, dropOff: 3.6 },
    { name: "Purchase Completed", visitors: 4462, conversionRate: 3.0, dropOff: 2.4 },
  ];

  const topPages = [
    { page: "/", views: 89420, conversions: 1245, conversionRate: 1.39 },
    { page: "/pricing", views: 34560, conversions: 2890, conversionRate: 8.36 },
    { page: "/features", views: 28930, conversions: 456, conversionRate: 1.58 },
    { page: "/about", views: 12340, conversions: 123, conversionRate: 1.00 },
    { page: "/contact", views: 8950, conversions: 892, conversionRate: 9.97 },
  ];

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === "up") return <ArrowUpRight className="h-3 w-3 text-green-600" />;
    if (trend === "down") return <ArrowDownRight className="h-3 w-3 text-red-600" />;
    return <Equal className="h-3 w-3 text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Analytics</h1>
          <p className="text-muted-foreground">
            Track performance, attribution, and ROI across all your marketing channels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 border rounded-md bg-background"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$514,560</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9,462</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$54.32</div>
            <p className="text-xs text-red-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              -2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2x</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +0.8x from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>Revenue and conversion data by marketing channel</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="px-3 py-2 border rounded-md bg-background text-sm"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="conversions">Conversions</option>
                <option value="revenue">Revenue</option>
                <option value="visitors">Visitors</option>
                <option value="roas">ROAS</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channelData.map((channel) => (
              <div key={channel.channel} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {channel.channel === "Direct" && <Globe className="h-5 w-5" />}
                    {channel.channel === "Organic Search" && <Target className="h-5 w-5" />}
                    {channel.channel === "Email Marketing" && <Mail className="h-5 w-5" />}
                    {channel.channel === "Social Media" && <Share2 className="h-5 w-5" />}
                    {channel.channel === "Paid Search" && <MousePointer className="h-5 w-5" />}
                    {channel.channel === "Display Ads" && <Eye className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{channel.channel}</h4>
                    <div className="text-sm text-muted-foreground">
                      {channel.visitors.toLocaleString()} visitors
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right">
                    <div className="font-medium">{channel.conversions.toLocaleString()}</div>
                    <div className="text-muted-foreground">Conversions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${channel.revenue.toLocaleString()}</div>
                    <div className="text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${channel.cpa}</div>
                    <div className="text-muted-foreground">CPA</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{channel.roas}x</div>
                    <div className="text-muted-foreground">ROAS</div>
                  </div>
                  <div className={`text-right ${getTrendColor(channel.trend)}'}>
                    <div className="flex items-center gap-1 font-medium">
                      {getTrendIcon(channel.trend, channel.trendValue)}
                      {channel.trendValue > 0 ? "+" : ""}{channel.trendValue}%
                    </div>
                    <div className="text-muted-foreground">Trend</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>User journey from visitor to customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((step, index) => (
                <div key={step.name} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {step.visitors.toLocaleString()} ({step.conversionRate}%)
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ width: '${step.conversionRate}%' }}
                    />
                  </div>
                  {index < funnelData.length - 1 && step.dropOff > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      -{step.dropOff}% drop-off to next step
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Converting Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Converting Pages</CardTitle>
            <CardDescription>Pages driving the most conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{page.page}</div>
                      <div className="text-sm text-muted-foreground">
                        {page.views.toLocaleString()} views
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{page.conversions}</div>
                    <div className="text-sm text-muted-foreground">
                      {page.conversionRate}% CVR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device & Browser Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
            <CardDescription>Traffic breakdown by device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>Desktop</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">54.2%</div>
                  <div className="text-sm text-muted-foreground">81,023 visits</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">38.7%</div>
                  <div className="text-sm text-muted-foreground">57,891 visits</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>Tablet</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">7.1%</div>
                  <div className="text-sm text-muted-foreground">10,646 visits</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Geographic traffic distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>🇺🇸 United States</span>
                <div className="text-right">
                  <div className="font-medium">42.3%</div>
                  <div className="text-sm text-muted-foreground">63,245 visits</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>🇬🇧 United Kingdom</span>
                <div className="text-right">
                  <div className="font-medium">18.7%</div>
                  <div className="text-sm text-muted-foreground">27,956 visits</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>🇨🇦 Canada</span>
                <div className="text-right">
                  <div className="font-medium">12.1%</div>
                  <div className="text-sm text-muted-foreground">18,089 visits</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>🇦🇺 Australia</span>
                <div className="text-right">
                  <div className="font-medium">8.9%</div>
                  <div className="text-sm text-muted-foreground">13,309 visits</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attribution Model</CardTitle>
            <CardDescription>How conversions are attributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Last Click</span>
                <div className="text-right">
                  <div className="font-medium">45.2%</div>
                  <div className="text-sm text-muted-foreground">4,279 conv.</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>First Click</span>
                <div className="text-right">
                  <div className="font-medium">28.9%</div>
                  <div className="text-sm text-muted-foreground">2,734 conv.</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Linear</span>
                <div className="text-right">
                  <div className="font-medium">15.7%</div>
                  <div className="text-sm text-muted-foreground">1,485 conv.</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Position Based</span>
                <div className="text-right">
                  <div className="font-medium">10.2%</div>
                  <div className="text-sm text-muted-foreground">964 conv.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}