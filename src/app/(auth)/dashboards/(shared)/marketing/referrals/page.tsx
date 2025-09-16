"use client";

import { useState } from "react";
;
import { 
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Gift,
  TrendingUp,
  DollarSign,
  Target,
  Eye,
  Edit3,
  Copy,
  Settings,
  Mail,
  MessageCircle,
  Star,
  Award,
  Zap,
  Calendar,
  BarChart3,
  ArrowUpRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Link,
  Code,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "tiered" | "points";
  status: "active" | "paused" | "draft";
  rewardType: "cash" | "credit" | "discount" | "product";
  referrerReward: number;
  refereeReward: number;
  minimumPurchase?: number;
  expiryDays?: number;
  maxRewards?: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  participants: number;
  conversions: number;
  totalRewards: number;
  conversionRate: number;
}

interface Referral {
  id: string;
  programId: string;
  referrerName: string;
  referrerEmail: string;
  refereeName?: string;
  refereeEmail: string;
  status: "pending" | "completed" | "rewarded" | "expired";
  referralCode: string;
  clickedAt: string;
  convertedAt?: string;
  rewardedAt?: string;
  purchaseValue?: number;
  rewardAmount: number;
  source: string;
}

interface ReferralTier {
  id: string;
  name: string;
  referralsRequired: number;
  rewardMultiplier: number;
  bonusReward: number;
  benefits: string[];
}

const mockPrograms: ReferralProgram[] = [
  {
    id: "1",
    name: "Customer Referral Program",
    description: "Refer friends and earn rewards for each successful conversion",
    type: "fixed",
    status: "active",
    rewardType: "cash",
    referrerReward: 50,
    refereeReward: 25,
    minimumPurchase: 100,
    expiryDays: 30,
    maxRewards: 10,
    startDate: "2024-01-01T00:00:00Z",
    createdAt: "2023-12-15T00:00:00Z",
    participants: 1245,
    conversions: 189,
    totalRewards: 9450,
    conversionRate: 15.18
  },
  {
    id: "2",
    name: "Partner Affiliate Program", 
    description: "Earn commission on every customer you refer who makes a purchase",
    type: "percentage",
    status: "active",
    rewardType: "cash",
    referrerReward: 20,
    refereeReward: 0,
    minimumPurchase: 50,
    startDate: "2023-10-01T00:00:00Z",
    createdAt: "2023-09-15T00:00:00Z",
    participants: 342,
    conversions: 876,
    totalRewards: 43800,
    conversionRate: 35.67
  },
  {
    id: "3",
    name: "VIP Tiered Referrals",
    description: "Multi-tier program with increasing rewards based on referral count",
    type: "tiered", 
    status: "draft",
    rewardType: "credit",
    referrerReward: 100,
    refereeReward: 50,
    minimumPurchase: 200,
    expiryDays: 60,
    startDate: "2024-02-01T00:00:00Z",
    createdAt: "2024-01-20T00:00:00Z",
    participants: 0,
    conversions: 0,
    totalRewards: 0,
    conversionRate: 0
  }
];

const mockReferrals: Referral[] = [
  {
    id: "1",
    programId: "1",
    referrerName: "John Smith",
    referrerEmail: "john.smith@email.com",
    refereeName: "Sarah Wilson",
    refereeEmail: "sarah.wilson@email.com",
    status: "completed",
    referralCode: "JS-REF-001",
    clickedAt: "2024-01-20T10:30:00Z",
    convertedAt: "2024-01-21T14:22:00Z",
    rewardedAt: "2024-01-21T15:00:00Z",
    purchaseValue: 299,
    rewardAmount: 50,
    source: "email"
  },
  {
    id: "2",
    programId: "1", 
    referrerName: "Mike Johnson",
    referrerEmail: "mike.johnson@email.com",
    refereeEmail: "alex.brown@email.com",
    status: "pending",
    referralCode: "MJ-REF-002",
    clickedAt: "2024-01-22T16:45:00Z",
    rewardAmount: 50,
    source: "social"
  },
  {
    id: "3",
    programId: "2",
    referrerName: "Business Partner Inc",
    referrerEmail: "partners@business.com",
    refereeName: "Enterprise Corp",
    refereeEmail: "procurement@enterprise.com", 
    status: "rewarded",
    referralCode: "BP-AFF-003",
    clickedAt: "2024-01-18T09:15:00Z",
    convertedAt: "2024-01-19T11:30:00Z",
    rewardedAt: "2024-01-19T12:00:00Z",
    purchaseValue: 2500,
    rewardAmount: 500,
    source: "website"
  }
];

const mockTiers: ReferralTier[] = [
  {
    id: "1",
    name: "Bronze",
    referralsRequired: 1,
    rewardMultiplier: 1.0,
    bonusReward: 0,
    benefits: ["Standard referral rewards", "Access to referral dashboard"]
  },
  {
    id: "2", 
    name: "Silver",
    referralsRequired: 5,
    rewardMultiplier: 1.5,
    bonusReward: 100,
    benefits: ["1.5x referral rewards", "$100 bonus", "Priority support"]
  },
  {
    id: "3",
    name: "Gold", 
    referralsRequired: 15,
    rewardMultiplier: 2.0,
    bonusReward: 500,
    benefits: ["2x referral rewards", "$500 bonus", "Exclusive events", "Personal account manager"]
  }
];

export default function ReferralsPage() {
  const [programs, setPrograms] = useState<ReferralProgram[]>(mockPrograms);
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals);
  const [tiers, setTiers] = useState<ReferralTier[]>(mockTiers);
  const [activeTab, setActiveTab] = useState<"overview" | "programs" | "referrals" | "analytics">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "paused": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "draft": return <Edit3 className="h-4 w-4 text-gray-600" />;
      case "completed": 
      case "rewarded": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "expired": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getProgramTypeLabel = (type: string) => {
    switch (type) {
      case "percentage": return "% Commission";
      case "fixed": return "Fixed Amount";
      case "tiered": return "Tiered Rewards";
      case "points": return "Points System";
      default: return type;
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case "cash": return "Cash";
      case "credit": return "Account Credit";
      case "discount": return "Discount Code";
      case "product": return "Free Product";
      default: return type;
    }
  };

  const totalParticipants = programs.reduce((sum, p) => sum + p.participants, 0);
  const totalConversions = programs.reduce((sum, p) => sum + p.conversions, 0);
  const totalRewards = programs.reduce((sum, p) => sum + p.totalRewards, 0);
  const avgConversionRate = programs.length > 0 
    ? programs.reduce((sum, p) => sum + p.conversionRate, 0) / programs.length 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral Programs</h1>
          <p className="text-muted-foreground">
            Create and manage referral programs to turn customers into advocates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "overview" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "programs" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("programs")}
        >
          Programs
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "referrals" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("referrals")}
        >
          Referrals
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "analytics" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Overview Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalParticipants.toLocaleString()}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalConversions.toLocaleString()}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +18.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rewards Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRewards.toLocaleString()}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +25.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Programs Overview */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Programs</CardTitle>
                <CardDescription>Programs with highest conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs
                    .filter(p => p.status === "active")
                    .sort((a, b) => b.conversionRate - a.conversionRate)
                    .slice(0, 3)
                    .map((program) => (
                      <div key={program.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <Gift className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{program.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {program.participants} participants • {program.conversions} conversions
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{program.conversionRate.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Conversion Rate</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Referral Activity</CardTitle>
                <CardDescription>Latest referral conversions and rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrals
                    .sort((a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime())
                    .slice(0, 4)
                    .map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {getStatusIcon(referral.status)}
                          </div>
                          <div>
                            <div className="font-medium">{referral.referrerName}</div>
                            <div className="text-sm text-muted-foreground">
                              {referral.refereeName ? `Referred ${referral.refereeName}` : `Referral pending`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${referral.rewardAmount}</div>
                          <div className="text-sm text-muted-foreground capitalize">{referral.status}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Tiers</CardTitle>
              <CardDescription>Reward levels based on referral performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {tiers.map((tier) => (
                  <div key={tier.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tier.name === "Bronze" ? "bg-orange-100" :
                        tier.name === "Silver" ? "bg-gray-100" :
                        "bg-yellow-100"
                      }`}>
                        <Award className={`h-5 w-5 ${
                          tier.name === "Bronze" ? "text-orange-600" :
                          tier.name === "Silver" ? "text-gray-600" :
                          "text-yellow-600"
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{tier.name} Tier</h4>
                        <p className="text-sm text-muted-foreground">
                          {tier.referralsRequired}+ referrals
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Multiplier:</span>
                        <span className="font-medium">{tier.rewardMultiplier}x</span>
                      </div>
                      {tier.bonusReward > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm">Bonus:</span>
                          <span className="font-medium">${tier.bonusReward}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-1">Benefits:</div>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Programs Tab */}
      {activeTab === "programs" && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search programs..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Program
            </Button>
          </div>

          <div className="space-y-4">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Gift className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{program.name}</h3>
                          {getStatusIcon(program.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            program.status === "active" 
                              ? "bg-green-100 text-green-700"
                              : program.status === "paused"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}>
                            {program.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">{program.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{getProgramTypeLabel(program.type)}</span>
                          <span>{getRewardTypeLabel(program.rewardType)}</span>
                          <span>Created {new Date(program.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Program Details */}
                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Reward Structure</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Referrer Reward:</span>
                          <span>
                            {program.type === "percentage" ? `${program.referrerReward}%` : `$${program.referrerReward}`}
                          </span>
                        </div>
                        {program.refereeReward > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Referee Reward:</span>
                            <span>
                              {program.type === "percentage" ? `${program.refereeReward}%` : `$${program.refereeReward}`}
                            </span>
                          </div>
                        )}
                        {program.minimumPurchase && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Min Purchase:</span>
                            <span>${program.minimumPurchase}</span>
                          </div>
                        )}
                        {program.expiryDays && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires In:</span>
                            <span>{program.expiryDays} days</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Program Limits</h4>
                      <div className="text-sm space-y-1">
                        {program.maxRewards && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Rewards:</span>
                            <span>{program.maxRewards} per referrer</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Start Date:</span>
                          <span>{new Date(program.startDate).toLocaleDateString()}</span>
                        </div>
                        {program.endDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">End Date:</span>
                            <span>{new Date(program.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid gap-6 md:grid-cols-4 mb-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{program.participants}</div>
                      <div className="text-sm text-muted-foreground">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{program.conversions}</div>
                      <div className="text-sm text-muted-foreground">Conversions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">${program.totalRewards.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Rewards Paid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{program.conversionRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Program
                    </Button>
                    <Button size="sm" variant="outline">
                      <Code className="h-4 w-4 mr-2" />
                      Get Code
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Referrals Tab */}
      {activeTab === "referrals" && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search referrals..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                />
              </div>
              <select className="px-3 py-2 border rounded-md bg-background">
                <option value="all">All Programs</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
              <select className="px-3 py-2 border rounded-md bg-background">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rewarded">Rewarded</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Referrals</CardTitle>
              <CardDescription>Track individual referral performance and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals.map((referral) => {
                  const program = programs.find(p => p.id === referral.programId);
                  return (
                    <div key={referral.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getStatusIcon(referral.status)}
                          </div>
                          <div>
                            <h4 className="font-medium">{referral.referrerName}</h4>
                            <div className="text-sm text-muted-foreground">{referral.referrerEmail}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Program: {program?.name} • Code: {referral.referralCode}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize mb-2 ${
                            referral.status === "completed" || referral.status === "rewarded"
                              ? "bg-green-100 text-green-700"
                              : referral.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }'}>
                            {referral.status}
                          </div>
                          <div className="font-medium">${referral.rewardAmount}</div>
                          <div className="text-sm text-muted-foreground">Reward</div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Referee:</span>
                          <div className="font-medium">
                            {referral.refereeName || "Not converted"}
                          </div>
                          <div className="text-muted-foreground">{referral.refereeEmail}</div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Timeline:</span>
                          <div>Clicked: {new Date(referral.clickedAt).toLocaleDateString()}</div>
                          {referral.convertedAt && (
                            <div>Converted: {new Date(referral.convertedAt).toLocaleDateString()}</div>
                          )}
                          {referral.rewardedAt && (
                            <div>Rewarded: {new Date(referral.rewardedAt).toLocaleDateString()}</div>
                          )}
                        </div>

                        <div>
                          <span className="text-muted-foreground">Details:</span>
                          <div>Source: {referral.source}</div>
                          {referral.purchaseValue && (
                            <div>Purchase: ${referral.purchaseValue}</div>
                          )}
                        </div>
                      </div>

                      {referral.status === "completed" && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                          <Button size="sm">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Process Reward
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Contact Referrer
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid gap-6">
          {/* Performance Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Referral Volume Trend</CardTitle>
                <CardDescription>New referrals over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-medium">245 referrals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Month</span>
                    <span className="font-medium">198 referrals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Growth</span>
                    <span className="font-medium text-green-600">+23.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Attribution</CardTitle>
                <CardDescription>Revenue from referral programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Referral Revenue</span>
                    <span className="font-medium">$125,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Revenue</span>
                    <span className="font-medium">$890,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contribution</span>
                    <span className="font-medium">14.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
                <CardDescription>Most successful referrers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        1
                      </div>
                      <span className="text-sm font-medium">John Smith</span>
                    </div>
                    <span className="text-sm text-muted-foreground">12 referrals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        2
                      </div>
                      <span className="text-sm font-medium">Business Partner Inc</span>
                    </div>
                    <span className="text-sm text-muted-foreground">8 referrals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        3
                      </div>
                      <span className="text-sm font-medium">Sarah Wilson</span>
                    </div>
                    <span className="text-sm text-muted-foreground">6 referrals</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Program Performance Comparison</CardTitle>
                <CardDescription>Conversion rates by program</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs.filter(p => p.status === "active").map((program) => (
                    <div key={program.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{program.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {program.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: '${Math.min(program.conversionRate * 2, 100)}%' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{program.conversions} conversions</span>
                        <span>{program.participants} participants</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral Sources</CardTitle>
                <CardDescription>Where referrals are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">45%</div>
                      <div className="text-sm text-muted-foreground">156 referrals</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      <span>Social Media</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">32%</div>
                      <div className="text-sm text-muted-foreground">111 referrals</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Website</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">18%</div>
                      <div className="text-sm text-muted-foreground">62 referrals</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Direct Share</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">5%</div>
                      <div className="text-sm text-muted-foreground">17 referrals</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}