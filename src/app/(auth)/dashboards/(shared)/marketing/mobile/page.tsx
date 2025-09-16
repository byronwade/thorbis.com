"use client";

import { useState } from "react";

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Smartphone,
  Tablet,
  Download,
  QrCode,
  Bell,
  Camera,
  Share2,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Activity,
  BarChart3,
  Mail,
  Calendar,
  Settings,
  Plus,
  Eye,
  Send,
  Edit,
  Play,
  Pause,
  RefreshCw,
  Upload,
  Image,
  MessageCircle,
  Heart,
  Star,
  Zap,
  Target,
  Layers
} from "lucide-react";
import { Button } from '@/components/ui/button';


// Mock mobile app data
interface MobileApp {
  id: string;
  platform: 'iOS' | 'Android';
  version: string;
  build: string;
  status: 'live' | 'beta' | 'development';
  downloads: number;
  rating: number;
  reviews: number;
  last_update: string;
}

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'beta' | 'planned';
  usage: number;
  category: 'content' | 'analytics' | 'engagement' | 'automation';
}

interface MobileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  last_active: string;
  device: string;
  location: string;
  campaigns_created: number;
  posts_published: number;
}

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'campaign' | 'performance' | 'reminder' | 'alert';
  sent_at: string;
  opened: boolean;
  device_count: number;
  open_rate: number;
}

const mockApps: MobileApp[] = [
  {
    id: "1",
    platform: "iOS",
    version: "3.2.1",
    build: "321",
    status: "live",
    downloads: 45678,
    rating: 4.8,
    reviews: 2341,
    last_update: "2025-01-02"
  },
  {
    id: "2",
    platform: "Android",
    version: "3.2.0",
    build: "320",
    status: "live", 
    downloads: 67890,
    rating: 4.7,
    reviews: 3456,
    last_update: "2025-01-02"
  }
];

const mockFeatures: MobileFeature[] = [
  {
    id: "1",
    name: "Campaign Manager",
    description: "Create and manage marketing campaigns on the go",
    icon: "Target",
    status: "active",
    usage: 85.4,
    category: "content"
  },
  {
    id: "2",
    name: "Social Media Posting",
    description: "Schedule and publish posts across platforms",
    icon: "Share2",
    status: "active",
    usage: 92.1,
    category: "content"
  },
  {
    id: "3",
    name: "Real-time Analytics",
    description: "Monitor campaign performance in real-time",
    icon: "BarChart3",
    status: "active",
    usage: 78.9,
    category: "analytics"
  },
  {
    id: "4",
    name: "Push Notifications",
    description: "Send targeted push notifications to users",
    icon: "Bell",
    status: "active",
    usage: 67.3,
    category: "engagement"
  },
  {
    id: "5",
    name: "Content Camera",
    description: "Capture and edit content directly in-app",
    icon: "Camera",
    status: "beta",
    usage: 45.6,
    category: "content"
  },
  {
    id: "6",
    name: "AI Assistant",
    description: "AI-powered marketing assistant for mobile",
    icon: "Zap",
    status: "beta",
    usage: 34.2,
    category: "automation"
  }
];

const mockUsers: MobileUser[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@company.com",
    role: "Marketing Manager",
    last_active: "2 minutes ago",
    device: "iPhone 15 Pro",
    location: "San Francisco, CA",
    campaigns_created: 23,
    posts_published: 156
  },
  {
    id: "2", 
    name: "Marcus Johnson",
    email: "marcus@company.com",
    role: "Content Creator",
    last_active: "15 minutes ago",
    device: "Samsung Galaxy S24",
    location: "Austin, TX",
    campaigns_created: 12,
    posts_published: 234
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    email: "elena@company.com", 
    role: "Social Media Manager",
    last_active: "1 hour ago",
    device: "iPad Pro",
    location: "Miami, FL",
    campaigns_created: 34,
    posts_published: 412
  }
];

const mockNotifications: PushNotification[] = [
  {
    id: "1",
    title: "Campaign Performance Alert",
    message: "Your Google Ads campaign CTR increased by 25%",
    type: "performance",
    sent_at: "2025-01-03 14:30:00",
    opened: true,
    device_count: 1245,
    open_rate: 67.8
  },
  {
    id: "2",
    title: "Content Approval Needed",
    message: "3 posts are waiting for your approval",
    type: "reminder",
    sent_at: "2025-01-03 13:45:00",
    opened: false,
    device_count: 567,
    open_rate: 45.2
  },
  {
    id: "3",
    title: "New Campaign Launch",
    message: "Holiday sale campaign is now live!",
    type: "campaign", 
    sent_at: "2025-01-03 12:00:00",
    opened: true,
    device_count: 2341,
    open_rate: 82.4
  }
];

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'beta':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'development':
      case 'planned':
        return <AlertCircle className="h-4 w-4 text-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      live: "bg-green-400/20 text-green-400 border-green-400/30",
      active: "bg-green-400/20 text-green-400 border-green-400/30",
      beta: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      development: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      planned: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30"
    };
    
    return (
      <Badge className={'${variants[status as keyof typeof variants]} border'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <Edit className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'engagement':
        return <Heart className="h-4 w-4" />;
      case 'automation':
        return <Zap className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mobile App Platform</h1>
          <p className="text-neutral-400 mt-2">
            Mobile marketing tools and companion app management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download APK
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Feature
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Downloads</p>
                <p className="text-2xl font-bold text-white">113,568</p>
              </div>
              <Download className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+23% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active Users</p>
                <p className="text-2xl font-bold text-white">8,934</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">89% daily retention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">App Rating</p>
                <p className="text-2xl font-bold text-white">4.75</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-yellow-400">5,797 reviews</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Mobile Revenue</p>
                <p className="text-2xl font-bold text-white">$89,456</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+18% vs desktop</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>App Versions</CardTitle>
                <CardDescription>Current mobile app status across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockApps.map((app) => (
                    <div key={app.id} className="border border-neutral-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {app.platform === 'iOS' ? (
                            <Smartphone className="h-5 w-5 text-neutral-300" />
                          ) : (
                            <Tablet className="h-5 w-5 text-green-400" />
                          )}
                          <div>
                            <p className="font-semibold text-white">{app.platform} App</p>
                            <p className="text-sm text-neutral-400">v{app.version} (Build {app.build})</p>
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-400">Downloads:</p>
                          <p className="text-white font-medium">{app.downloads.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-neutral-400">Rating:</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-white font-medium">{app.rating}</span>
                            <span className="text-neutral-400">({app.reviews})</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-neutral-400">Last Update:</p>
                          <p className="text-white font-medium">{app.last_update}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code Downloads</CardTitle>
                <CardDescription>Share app download links via QR codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-neutral-700 rounded-lg">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-neutral-400 mx-auto mb-3" />
                      <p className="text-neutral-300 font-medium mb-2">Marketing App QR Code</p>
                      <p className="text-sm text-neutral-400 mb-4">Scan to download the mobile app</p>
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" variant="outline">Generate iOS</Button>
                        <Button size="sm" variant="outline">Generate Android</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-400">QR Scans (iOS):</p>
                      <p className="text-white font-medium">2,341</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">QR Scans (Android):</p>
                      <p className="text-white font-medium">3,456</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mobile Usage Analytics</CardTitle>
              <CardDescription>Mobile app usage patterns and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">12.5m</div>
                  <div className="text-xs text-neutral-400">Avg Session Time</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Activity className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">6.2</div>
                  <div className="text-xs text-neutral-400">Sessions Per Day</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Share2 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">1,234</div>
                  <div className="text-xs text-neutral-400">Posts Created</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Target className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">456</div>
                  <div className="text-xs text-neutral-400">Campaigns Created</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile App Features</CardTitle>
              <CardDescription>Feature availability and usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockFeatures.map((feature) => (
                  <div key={feature.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(feature.category)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{feature.name}</p>
                          <p className="text-sm text-neutral-400">{feature.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(feature.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Usage:</span>
                        <span className="text-white">{feature.usage}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: '${feature.usage}%' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Category: {feature.category}</span>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Roadmap</CardTitle>
              <CardDescription>Upcoming mobile app features and improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Voice Commands", status: "planned", quarter: "Q2 2025" },
                  { name: "Offline Mode", status: "development", quarter: "Q1 2025" },
                  { name: "AR Filters", status: "planned", quarter: "Q3 2025" },
                  { name: "Widget Support", status: "development", quarter: "Q1 2025" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-neutral-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-neutral-400">Target: {item.quarter}</p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Mobile Users</CardTitle>
              <CardDescription>Users currently using the mobile app</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.map((user) => (
                  <div key={user.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 font-medium text-sm">
                            {user.name.split(' ').map(n => n[0]).join(')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-neutral-400">{user.email}</p>
                          <p className="text-xs text-neutral-500">{user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">Last active: {user.last_active}</p>
                        <p className="text-xs text-neutral-400">{user.device}</p>
                        <p className="text-xs text-neutral-500">{user.location}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Campaigns:</p>
                        <p className="text-white font-medium">{user.campaigns_created}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Posts:</p>
                        <p className="text-white font-medium">{user.posts_published}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">Message</Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Push Notification Campaigns</CardTitle>
              <CardDescription>Mobile push notification management and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockNotifications.map((notification) => (
                  <div key={notification.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="font-semibold text-white">{notification.title}</p>
                          <p className="text-sm text-neutral-400">{notification.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={'${notification.opened ? 'bg-green-400/20 text-green-400' : 'bg-neutral-600/20 text-neutral-400'} border'}>
                          {notification.opened ? 'Opened' : 'Sent'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Type:</p>
                        <p className="text-white capitalize">{notification.type}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Devices:</p>
                        <p className="text-white">{notification.device_count.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Open Rate:</p>
                        <p className="text-white">{notification.open_rate}%</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Sent:</p>
                        <p className="text-white">{notification.sent_at}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Notification
                </Button>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile App Configuration</CardTitle>
              <CardDescription>Configure mobile app settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-3">App Store Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Automatic Updates</p>
                      <p className="text-sm text-neutral-400">Push app updates to users automatically</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Beta Testing</p>
                      <p className="text-sm text-neutral-400">Manage beta user groups and testing</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Feature Flags</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">AI Assistant</p>
                      <p className="text-sm text-neutral-400">Enable AI features in mobile app</p>
                    </div>
                    <Button variant="outline" size="sm">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Offline Mode</p>
                      <p className="text-sm text-neutral-400">Allow offline content creation</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Biometric Authentication</p>
                      <p className="text-sm text-neutral-400">Enable fingerprint/face ID login</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Session Management</p>
                      <p className="text-sm text-neutral-400">Configure session timeout settings</p>
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