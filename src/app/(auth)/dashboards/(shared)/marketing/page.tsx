"use client";

;
import { 
  TrendingUp, 
  Mail, 
  Share2, 
  Globe, 
  Users, 
  MousePointer,
  ArrowUpRight,
  Calendar,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';


interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}

function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs flex items-center gap-1 ${
          trend === "up" ? "text-green-600" : "text-red-600"
        }'}>
          <ArrowUpRight className={'h-3 w-3 ${trend === "down" ? "rotate-180" : ""}'} />
          {change} from last period
        </p>
      </CardContent>
    </Card>
  );
}

export default function MarketingDashboard() {
  const metrics = [
    {
      title: "Total Visitors",
      value: "45,231",
      change: "+20.1%",
      icon: <Users className="h-4 w-4" />,
      trend: "up" as const,
    },
    {
      title: "Email Opens",
      value: "12,843",
      change: "+15.3%", 
      icon: <Mail className="h-4 w-4" />,
      trend: "up" as const,
    },
    {
      title: "Social Engagement",
      value: "8,924",
      change: "+8.7%",
      icon: <Share2 className="h-4 w-4" />,
      trend: "up" as const,
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "+2.1%",
      icon: <Target className="h-4 w-4" />,
      trend: "up" as const,
    },
  ];

  return (
    <div className="relative flex-1 overflow-y-auto flex flex-col min-w-0 gap-6 pt-4 pb-32 px-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your marketing performance across all channels.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Email Campaign
            </CardTitle>
            <CardDescription>
              Create and send targeted email campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start a new campaign or use one of your templates.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-green-500" />
              Social Post
            </CardTitle>
            <CardDescription>
              Schedule posts across all social platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Compose once, publish everywhere with optimal timing.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              Website Builder
            </CardTitle>
            <CardDescription>
              Build and customize your marketing sites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Drag-and-drop site builder with SEO optimization.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Analytics
            </CardTitle>
            <CardDescription>
              Deep dive into your marketing performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track conversions, attribution, and ROI across channels.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-500" />
              Content Calendar
            </CardTitle>
            <CardDescription>
              Plan and schedule all your marketing content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visual calendar with approval workflows and collaboration.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-cyan-500" />
              A/B Testing
            </CardTitle>
            <CardDescription>
              Optimize campaigns with data-driven experiments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Test variations to improve conversion rates and engagement.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your latest marketing activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Summer Sale Email</p>
                <p className="text-sm text-muted-foreground">Sent 2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">24.3% open rate</p>
                <p className="text-sm text-muted-foreground">5,428 recipients</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Instagram Product Launch</p>
                <p className="text-sm text-muted-foreground">Posted yesterday</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-blue-600">892 engagements</p>
                <p className="text-sm text-muted-foreground">12.4k impressions</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Landing Page A/B Test</p>
                <p className="text-sm text-muted-foreground">Running for 3 days</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-purple-600">Variant B +15%</p>
                <p className="text-sm text-muted-foreground">98% confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Review Newsletter Draft</p>
                <p className="text-sm text-muted-foreground">Due in 2 hours</p>
              </div>
              <div className="h-2 w-2 bg-red-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Approve Social Posts</p>
                <p className="text-sm text-muted-foreground">Due tomorrow</p>
              </div>
              <div className="h-2 w-2 bg-yellow-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Update SEO Meta Tags</p>
                <p className="text-sm text-muted-foreground">Due this week</p>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Monthly Analytics Report</p>
                <p className="text-sm text-muted-foreground">Due next week</p>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}