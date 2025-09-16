"use client";

import { useState } from "react";
;
import { 
  Mail,
  Plus,
  Send,
  Eye,
  Calendar,
  Users,
  BarChart3,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  MousePointer,
  UserCheck,
  Filter,
  Search
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sent" | "sending" | "failed";
  recipients: number;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  template: string;
  metrics?: {
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
  };
}

const mockCampaigns: EmailCampaign[] = [
  {
    id: "1",
    name: "Summer Sale Newsletter",
    subject: "🌞 Summer Sale: Up to 50% Off Everything!",
    status: "sent",
    recipients: 15420,
    sentAt: "2 days ago",
    createdAt: "3 days ago",
    template: "Newsletter Template",
    metrics: {
      delivered: 15180,
      opened: 3795,
      clicked: 568,
      unsubscribed: 23,
      bounced: 240,
    },
  },
  {
    id: "2",
    name: "Product Launch Announcement",
    subject: "Introducing Our Revolutionary AI Tools",
    status: "scheduled",
    recipients: 8500,
    scheduledFor: "Tomorrow at 10:00 AM",
    createdAt: "1 day ago",
    template: "Product Launch Template",
  },
  {
    id: "3",
    name: "Weekly Digest",
    subject: "Your Weekly Business Insights",
    status: "sending",
    recipients: 12300,
    createdAt: "Today",
    template: "Digest Template",
    metrics: {
      delivered: 4200,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      bounced: 15,
    },
  },
  {
    id: "4",
    name: "Welcome Series - Part 1",
    subject: "Welcome to Thorbis! Let's get you started",
    status: "draft",
    recipients: 0,
    createdAt: "Today",
    template: "Welcome Email Template",
  },
];

export default function EmailPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(mockCampaigns);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled": return <Clock className="h-4 w-4 text-blue-600" />;
      case "sending": return <Send className="h-4 w-4 text-orange-600" />;
      case "draft": return <Edit3 className="h-4 w-4 text-gray-600" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "text-green-600 bg-green-100 border-green-200";
      case "scheduled": return "text-blue-600 bg-blue-100 border-blue-200";
      case "sending": return "text-orange-600 bg-orange-100 border-orange-200";
      case "draft": return "text-gray-600 bg-gray-100 border-gray-200";
      case "failed": return "text-red-600 bg-red-100 border-red-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const calculateOpenRate = (metrics: unknown) => {
    if (!metrics || metrics.delivered === 0) return 0;
    return ((metrics.opened / metrics.delivered) * 100).toFixed(1);
  };

  const calculateClickRate = (metrics: unknown) => {
    if (!metrics || metrics.delivered === 0) return 0;
    return ((metrics.clicked / metrics.delivered) * 100).toFixed(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create, send, and track email campaigns with advanced analytics and automation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/email/templates">
              <Eye className="h-4 w-4 mr-2" />
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/email/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.status === "sent").length} sent this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.recipients, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.7%</div>
            <p className="text-xs text-muted-foreground">
              +0.8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Newsletter
            </CardTitle>
            <CardDescription>
              Send regular updates to your subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/email/campaigns/new?type=newsletter">
                Create Newsletter
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Promotional
            </CardTitle>
            <CardDescription>
              Announce sales, products, or special offers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/email/campaigns/new?type=promotional">
                Create Promotion
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-500" />
              Welcome Series
            </CardTitle>
            <CardDescription>
              Automated welcome emails for new subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/email/automation/new?type=welcome">
                Setup Automation
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="px-3 py-2 border rounded-md bg-background"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="draft">Draft</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(campaign.status)}
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription>{campaign.subject}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Campaign Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Recipients:</span>
                  <div className="font-medium">{campaign.recipients.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Template:</span>
                  <div className="font-medium">{campaign.template}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <div className="font-medium">{campaign.createdAt}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {campaign.status === "scheduled" ? "Scheduled for:" : "Sent:"}
                  </span>
                  <div className="font-medium">
                    {campaign.scheduledFor || campaign.sentAt || "—"}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              {campaign.metrics && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {campaign.metrics.delivered.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {campaign.metrics.opened.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Opened ({calculateOpenRate(campaign.metrics)}%)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {campaign.metrics.clicked.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Clicked ({calculateClickRate(campaign.metrics)}%)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {campaign.metrics.unsubscribed}
                    </div>
                    <div className="text-xs text-muted-foreground">Unsubscribed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {campaign.metrics.bounced}
                    </div>
                    <div className="text-xs text-muted-foreground">Bounced</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                {campaign.status === "draft" && (
                  <>
                    <Button size="sm" asChild>
                      <Link href={`/email/campaigns/${campaign.id}/edit'}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Send Test
                    </Button>
                  </>
                )}
                {campaign.status === "scheduled" && (
                  <>
                    <Button size="sm" variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Schedule
                    </Button>
                    <Button size="sm" variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </Button>
                  </>
                )}
                {campaign.status === "sent" && (
                  <>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={'/email/campaigns/${campaign.id}/analytics'}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No campaigns found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Create your first email campaign to get started"}
          </p>
          {(!searchQuery && statusFilter === "all") && (
            <Button className="mt-4" asChild>
              <Link href="/email/campaigns/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}