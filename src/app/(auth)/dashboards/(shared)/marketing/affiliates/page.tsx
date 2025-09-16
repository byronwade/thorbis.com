"use client";

import { useState } from "react";
import { Button } from '@/components/ui';
import { 
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from '@/components/ui';
import {
  Users,
  DollarSign,
  TrendingUp,
  Link,
  Target,
  Gift,
  Share2,
  BarChart3,
  Eye,
  Settings,
  Plus,
  Edit,
  Download,
  Upload,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Activity,
  Globe,
  Mail,
  MessageSquare,
  Code,
  CreditCard,
  Percent,
  Calendar,
  ExternalLink,
  Copy,
  RefreshCw,
  Award,
  Zap,
  Shield,
  Database,
  Play,
  Pause,
  FileText,
  Image
} from "lucide-react";

// Mock affiliate marketing data
interface Affiliate {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joined_date: string;
  referral_code: string;
  stats: {
    clicks: number;
    conversions: number;
    revenue: number;
    commission_earned: number;
    conversion_rate: number;
  };
  payment_info: {
    method: 'paypal' | 'bank' | 'crypto';
    last_payment: string;
    pending_commission: number;
  };
}

interface Commission {
  id: string;
  affiliate_id: string;
  affiliate_name: string;
  type: 'sale' | 'lead' | 'click';
  amount: number;
  rate: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  transaction_date: string;
  product: string;
  customer_email: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'ended';
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  start_date: string;
  end_date: string;
  affiliates_count: number;
  performance: {
    clicks: number;
    conversions: number;
    revenue: number;
    commission_paid: number;
  };
  requirements: string[];
}

interface CreativeAsset {
  id: string;
  name: string;
  type: 'banner' | 'text_link' | 'email_template' | 'social_post';
  format: string;
  size: string;
  performance: {
    uses: number;
    clicks: number;
    conversions: number;
  };
  url: string;
  created_date: string;
}

const mockAffiliates: Affiliate[] = [
  {
    id: "1",
    name: "Sarah Marketing Pro",
    email: "sarah@marketingpro.com",
    status: "active",
    tier: "gold",
    joined_date: "2024-10-15",
    referral_code: "SARAH2024",
    stats: {
      clicks: 12456,
      conversions: 234,
      revenue: 45678.90,
      commission_earned: 4567.89,
      conversion_rate: 1.88
    },
    payment_info: {
      method: "paypal",
      last_payment: "2025-01-01",
      pending_commission: 1234.56
    }
  },
  {
    id: "2",
    name: "TechReview Blog",
    email: "admin@techreviewblog.com", 
    status: "active",
    tier: "platinum",
    joined_date: "2024-08-22",
    referral_code: "TECHREVIEW",
    stats: {
      clicks: 25678,
      conversions: 567,
      revenue: 89456.78,
      commission_earned: 8945.68,
      conversion_rate: 2.21
    },
    payment_info: {
      method: "bank",
      last_payment: "2025-01-01",
      pending_commission: 2345.67
    }
  },
  {
    id: "3",
    name: "Digital Nomad Hub",
    email: "partnerships@digitalnomad.com",
    status: "pending",
    tier: "bronze",
    joined_date: "2025-01-02",
    referral_code: "NOMAD2025",
    stats: {
      clicks: 234,
      conversions: 12,
      revenue: 1234.56,
      commission_earned: 123.45,
      conversion_rate: 5.13
    },
    payment_info: {
      method: "crypto",
      last_payment: "N/A",
      pending_commission: 123.45
    }
  }
];

const mockCommissions: Commission[] = [
  {
    id: "1",
    affiliate_id: "1",
    affiliate_name: "Sarah Marketing Pro",
    type: "sale",
    amount: 456.78,
    rate: 10,
    status: "approved",
    transaction_date: "2025-01-03 14:30:00",
    product: "Marketing Pro Suite",
    customer_email: "customer@example.com"
  },
  {
    id: "2",
    affiliate_id: "2",
    affiliate_name: "TechReview Blog",
    type: "sale",
    amount: 789.12,
    rate: 15,
    status: "paid",
    transaction_date: "2025-01-03 10:15:00",
    product: "Analytics Dashboard",
    customer_email: "tech@buyer.com"
  },
  {
    id: "3",
    affiliate_id: "1",
    affiliate_name: "Sarah Marketing Pro",
    type: "lead",
    amount: 25.00,
    rate: 25,
    status: "pending",
    transaction_date: "2025-01-03 16:45:00",
    product: "Lead Magnet Download",
    customer_email: "lead@prospect.com"
  }
];

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "New Year Marketing Tools Sale",
    description: "Promote our marketing suite with special New Year pricing",
    status: "active",
    commission_rate: 15,
    commission_type: "percentage",
    start_date: "2025-01-01",
    end_date: "2025-01-31",
    affiliates_count: 45,
    performance: {
      clicks: 45678,
      conversions: 567,
      revenue: 89456.78,
      commission_paid: 13418.52
    },
    requirements: ["Must have 1000+ email subscribers", "Active social media presence"]
  },
  {
    id: "2",
    name: "B2B Software Promotion",
    description: "Target business customers for enterprise tools",
    status: "active",
    commission_rate: 200,
    commission_type: "fixed",
    start_date: "2024-12-01",
    end_date: "2025-03-31",
    affiliates_count: 23,
    performance: {
      clicks: 23456,
      conversions: 234,
      revenue: 234567.89,
      commission_paid: 46800.00
    },
    requirements: ["B2B audience", "Technology focus", "Proven track record"]
  }
];

const mockCreatives: CreativeAsset[] = [
  {
    id: "1",
    name: "Holiday Banner 728x90",
    type: "banner",
    format: "PNG",
    size: "728x90",
    performance: {
      uses: 156,
      clicks: 2345,
      conversions: 89
    },
    url: "/assets/holiday-banner-728x90.png",
    created_date: "2024-12-15"
  },
  {
    id: "2",
    name: "Marketing Tools Text Link",
    type: "text_link",
    format: "HTML",
    size: "N/A",
    performance: {
      uses: 234,
      clicks: 3456,
      conversions: 123
    },
    url: "/assets/marketing-text-link.html",
    created_date: "2024-12-20"
  },
  {
    id: "3",
    name: "Email Template - Product Launch",
    type: "email_template",
    format: "HTML",
    size: "N/A", 
    performance: {
      uses: 67,
      clicks: 1234,
      conversions: 45
    },
    url: "/assets/product-launch-email.html",
    created_date: "2025-01-01"
  }
];

export default function AffiliatesPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'suspended':
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'paused':
      case 'draft':
        return <Clock className="h-4 w-4 text-neutral-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-400/20 text-green-400 border-green-400/30",
      approved: "bg-green-400/20 text-green-400 border-green-400/30",
      paid: "bg-green-400/20 text-green-400 border-green-400/30",
      pending: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      suspended: "bg-red-400/20 text-red-400 border-red-400/30",
      rejected: "bg-red-400/20 text-red-400 border-red-400/30",
      paused: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30",
      draft: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30",
      inactive: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30",
      ended: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30"
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants]} border'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const variants = {
      bronze: "bg-amber-600/20 text-amber-400 border-amber-600/30",
      silver: "bg-gray-400/20 text-gray-300 border-gray-400/30",
      gold: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      platinum: "bg-purple-400/20 text-purple-400 border-purple-400/30"
    };
    
    return (
      <Badge className={'${variants[tier as keyof typeof variants]} border'}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Affiliate Marketing</h1>
          <p className="text-neutral-400 mt-2">
            Manage affiliates, commissions, and partnership programs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Invite Affiliate
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">$134,567</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+34% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active Affiliates</p>
                <p className="text-2xl font-bold text-white">68</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Users className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400">12 new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Commissions Paid</p>
                <p className="text-2xl font-bold text-white">$18,456</p>
              </div>
              <Gift className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Gift className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-purple-400">$3,421 pending</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">2.1%</p>
              </div>
              <Target className="h-8 w-8 text-orange-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+0.3% improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="creatives">Creatives</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Affiliates</CardTitle>
                <CardDescription>Highest revenue generating partners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAffiliates.slice(0, 3).map((affiliate) => (
                    <div key={affiliate.id} className="flex items-center gap-4 p-3 border border-neutral-800 rounded-lg">
                      <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-medium text-sm">
                          {affiliate.name.split(' ').map(n => n[0]).join(')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{affiliate.name}</p>
                          {getTierBadge(affiliate.tier)}
                        </div>
                        <p className="text-sm text-neutral-400">{affiliate.referral_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${affiliate.stats.revenue.toLocaleString()}</p>
                        <p className="text-xs text-neutral-400">{affiliate.stats.conversions} conversions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Commissions</CardTitle>
                <CardDescription>Latest commission payouts and pending approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCommissions.slice(0, 3).map((commission) => (
                    <div key={commission.id} className="space-y-2 p-3 border border-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-purple-400" />
                          <span className="font-medium text-white">{commission.affiliate_name}</span>
                          {getStatusBadge(commission.status)}
                        </div>
                        <span className="text-white font-bold">${commission.amount}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-neutral-500">Product</p>
                          <p className="text-white">{commission.product}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Rate</p>
                          <p className="text-white">{commission.rate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Affiliate Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for affiliate program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Link className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">89,234</div>
                  <div className="text-xs text-neutral-400">Total Clicks</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">1,876</div>
                  <div className="text-xs text-neutral-400">Total Conversions</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">$67.89</div>
                  <div className="text-xs text-neutral-400">Avg Commission</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">24.5 days</div>
                  <div className="text-xs text-neutral-400">Avg Cookie Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Partners</CardTitle>
              <CardDescription>Manage your affiliate network and partnerships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAffiliates.map((affiliate) => (
                  <div key={affiliate.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 font-medium">
                            {affiliate.name.split(' ').map(n => n[0]).join(')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-white">{affiliate.name}</p>
                            {getStatusBadge(affiliate.status)}
                            {getTierBadge(affiliate.tier)}
                          </div>
                          <p className="text-sm text-neutral-400">{affiliate.email}</p>
                          <p className="text-xs text-neutral-500">Code: {affiliate.referral_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-neutral-400">Clicks:</p>
                        <p className="text-white font-medium">{affiliate.stats.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Conversions:</p>
                        <p className="text-white font-medium">{affiliate.stats.conversions}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Revenue:</p>
                        <p className="text-white font-medium">${affiliate.stats.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Commission:</p>
                        <p className="text-white font-medium">${affiliate.stats.commission_earned.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Conv. Rate:</p>
                        <p className="text-white font-medium">{affiliate.stats.conversion_rate}%</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-neutral-400">Joined: {affiliate.joined_date}</span>
                        <span className="text-neutral-400">Payment: {affiliate.payment_info.method}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Pending: ${affiliate.payment_info.pending_commission}</span>
                        <Button size="sm" variant="outline" className="gap-1">
                          <CreditCard className="h-3 w-3" />
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Tracking</CardTitle>
              <CardDescription>Monitor and manage affiliate commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCommissions.map((commission) => (
                  <div key={commission.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(commission.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{commission.affiliate_name}</p>
                            {getStatusBadge(commission.status)}
                          </div>
                          <p className="text-sm text-neutral-400">{commission.product}</p>
                          <p className="text-xs text-neutral-500">{commission.type} commission</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white text-lg">${commission.amount}</p>
                        <p className="text-xs text-neutral-400">{commission.rate}% rate</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Transaction:</p>
                        <p className="text-white font-medium">{commission.transaction_date}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Customer:</p>
                        <p className="text-white font-medium">{commission.customer_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {commission.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}
                        {commission.status === 'approved' && (
                          <Button size="sm" variant="outline" className="gap-1">
                            <CreditCard className="h-3 w-3" />
                            Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Campaigns</CardTitle>
              <CardDescription>Create and manage affiliate marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center">
                          <Target className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{campaign.name}</p>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <p className="text-sm text-neutral-400">{campaign.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'active' ? (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Pause className="h-3 w-3" />
                            Pause
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Play className="h-3 w-3" />
                            Start
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-neutral-400">Commission:</p>
                        <p className="text-white font-medium">
                          {campaign.commission_type === 'percentage` ? `${campaign.commission_rate}%' : '$${campaign.commission_rate}'}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Affiliates:</p>
                        <p className="text-white font-medium">{campaign.affiliates_count}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Revenue:</p>
                        <p className="text-white font-medium">${campaign.performance.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Paid Out:</p>
                        <p className="text-white font-medium">${campaign.performance.commission_paid.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Duration:</p>
                        <p className="text-white">{campaign.start_date} to {campaign.end_date}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 mb-2">Requirements:</p>
                        <div className="flex flex-wrap gap-1">
                          {campaign.requirements.map((req) => (
                            <Badge key={req} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creatives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Creative Assets</CardTitle>
              <CardDescription>Marketing materials for your affiliate partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockCreatives.map((creative) => (
                  <div key={creative.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-400/20 rounded-lg flex items-center justify-center">
                          {creative.type === 'banner' && <Image className="h-5 w-5 text-orange-400" />}
                          {creative.type === 'text_link' && <Link className="h-5 w-5 text-orange-400" />}
                          {creative.type === 'email_template' && <Mail className="h-5 w-5 text-orange-400" />}
                          {creative.type === 'social_post' && <Share2 className="h-5 w-5 text-orange-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{creative.name}</p>
                          <p className="text-sm text-neutral-400 capitalize">
                            {creative.type.replace('_', ' ')} • {creative.format}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-neutral-400">Uses:</p>
                          <p className="text-white font-medium">{creative.performance.uses}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">Clicks:</p>
                          <p className="text-white font-medium">{creative.performance.clicks}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">Conv:</p>
                          <p className="text-white font-medium">{creative.performance.conversions}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Copy className="h-3 w-3" />
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Program Settings</CardTitle>
              <CardDescription>Configure your affiliate marketing program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-3">Commission Structure</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Default Commission Rate</p>
                      <p className="text-sm text-neutral-400">Base commission percentage for new affiliates</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Tier-based Commissions</p>
                      <p className="text-sm text-neutral-400">Different rates based on affiliate performance</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Payment Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Payment Schedule</p>
                      <p className="text-sm text-neutral-400">How often to process affiliate payments</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Minimum Payout</p>
                      <p className="text-sm text-neutral-400">Minimum commission amount for payouts</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Tracking & Analytics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Cookie Duration</p>
                      <p className="text-sm text-neutral-400">How long to track affiliate referrals</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Attribution Model</p>
                      <p className="text-sm text-neutral-400">How to attribute conversions to affiliates</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}