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
  Palette,
  Layers,
  Globe,
  Settings,
  Users,
  Package,
  Download,
  Upload,
  Eye,
  Edit,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Code,
  Image,
  Type,
  Zap,
  Shield,
  Database,
  Cloud,
  Star,
  Target,
  BarChart3,
  DollarSign,
  Calendar
} from "lucide-react";
import { Button } from '@/components/ui/button';


// Mock white-label solution data
interface WhiteLabelClient {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'setup' | 'inactive';
  plan: 'starter' | 'professional' | 'enterprise';
  users: number;
  created_date: string;
  last_updated: string;
  custom_branding: boolean;
  custom_domain: boolean;
  revenue: number;
}

interface BrandingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'corporate' | 'creative' | 'minimal' | 'custom';
  preview_url: string;
  features: string[];
  usage_count: number;
  rating: number;
  is_premium: boolean;
}

interface CustomizationFeature {
  id: string;
  name: string;
  description: string;
  type: 'branding' | 'functionality' | 'integration';
  status: 'available' | 'beta' | 'coming_soon';
  plan_requirement: 'starter' | 'professional' | 'enterprise';
  usage_percentage: number;
}

const mockClients: WhiteLabelClient[] = [
  {
    id: "1",
    name: "TechStart Solutions",
    domain: "marketing.techstart.io",
    status: "active",
    plan: "enterprise", 
    users: 45,
    created_date: "2024-12-15",
    last_updated: "2025-01-03",
    custom_branding: true,
    custom_domain: true,
    revenue: 2899
  },
  {
    id: "2",
    name: "Creative Agency Pro",
    domain: "tools.creativeagency.com",
    status: "active",
    plan: "professional",
    users: 23,
    created_date: "2024-12-28",
    last_updated: "2025-01-02",
    custom_branding: true,
    custom_domain: true,
    revenue: 899
  },
  {
    id: "3",
    name: "Small Biz Marketing",
    domain: "app.smallbizmarketing.co",
    status: "setup",
    plan: "starter",
    users: 8,
    created_date: "2025-01-02",
    last_updated: "2025-01-03",
    custom_branding: false,
    custom_domain: false,
    revenue: 299
  }
];

const mockTemplates: BrandingTemplate[] = [
  {
    id: "1",
    name: "Corporate Professional",
    description: "Clean, professional design for enterprise clients",
    category: "corporate",
    preview_url: "/preview/corporate",
    features: ["Custom Logo", "Brand Colors", "Typography", "Professional Layout"],
    usage_count: 234,
    rating: 4.8,
    is_premium: false
  },
  {
    id: "2", 
    name: "Creative Studio",
    description: "Vibrant, creative design for agencies and studios",
    category: "creative",
    preview_url: "/preview/creative",
    features: ["Gradient Backgrounds", "Animation Effects", "Modern Cards", "Bold Typography"],
    usage_count: 156,
    rating: 4.6,
    is_premium: true
  },
  {
    id: "3",
    name: "Minimal Clean",
    description: "Minimalist design focusing on content and functionality",
    category: "minimal",
    preview_url: "/preview/minimal",
    features: ["Clean Lines", "Subtle Colors", "Typography Focus", "Spacious Layout"],
    usage_count: 189,
    rating: 4.7,
    is_premium: false
  },
  {
    id: "4",
    name: "Custom Enterprise",
    description: "Fully customizable template for enterprise branding",
    category: "custom",
    preview_url: "/preview/enterprise",
    features: ["Full Customization", "Advanced Components", "API Integration", "White Glove Setup"],
    usage_count: 67,
    rating: 4.9,
    is_premium: true
  }
];

const mockFeatures: CustomizationFeature[] = [
  {
    id: "1",
    name: "Custom Logo & Branding",
    description: "Upload custom logos, set brand colors, and configure visual identity",
    type: "branding",
    status: "available",
    plan_requirement: "starter",
    usage_percentage: 89.2
  },
  {
    id: "2",
    name: "Custom Domain",
    description: "Use your own domain for the marketing platform",
    type: "branding", 
    status: "available",
    plan_requirement: "professional",
    usage_percentage: 67.8
  },
  {
    id: "3",
    name: "White-label Mobile Apps",
    description: "Custom branded mobile apps for iOS and Android",
    type: "functionality",
    status: "beta",
    plan_requirement: "enterprise",
    usage_percentage: 34.5
  },
  {
    id: "4",
    name: "API Customization",
    description: "Custom API endpoints and integration capabilities",
    type: "integration",
    status: "available", 
    plan_requirement: "enterprise",
    usage_percentage: 45.3
  },
  {
    id: "5",
    name: "Custom Workflows",
    description: "Build custom marketing workflows and automation",
    type: "functionality",
    status: "coming_soon",
    plan_requirement: "professional",
    usage_percentage: 0
  }
];

export default function WhiteLabelPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'setup':
      case 'beta':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'inactive':
      case 'coming_soon':
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-400/20 text-green-400 border-green-400/30",
      available: "bg-green-400/20 text-green-400 border-green-400/30",
      setup: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      beta: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      inactive: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30",
      coming_soon: "bg-purple-400/20 text-purple-400 border-purple-400/30"
    };
    
    return (
      <Badge className={'${variants[status as keyof typeof variants]} border'}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' `).slice(1)}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const variants = {
      starter: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      professional: "bg-purple-400/20 text-purple-400 border-purple-400/30", 
      enterprise: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
    };
    
    return (
      <Badge className={'${variants[plan as keyof typeof variants]} border'}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">White-label Solutions</h1>
          <p className="text-neutral-400 mt-2">
            Customize and brand the marketing platform for your clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Config
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active Clients</p>
                <p className="text-2xl font-bold text-white">47</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+12% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">$67,234</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <BarChart3 className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+28% growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Custom Domains</p>
                <p className="text-2xl font-bold text-white">34</p>
              </div>
              <Globe className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Globe className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-purple-400">72% use custom domains</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Template Usage</p>
                <p className="text-2xl font-bold text-white">89%</p>
              </div>
              <Palette className="h-8 w-8 text-orange-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Palette className="h-3 w-3 text-orange-400" />
              <span className="text-xs text-orange-400">646 total customizations</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Setup Guide</CardTitle>
                <CardDescription>Get started with white-label customization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Upload Brand Assets", desc: "Logo, colors, fonts", done: true },
                    { step: "2", title: "Configure Domain", desc: "Set up custom domain", done: true },
                    { step: "3", title: "Customize Interface", desc: "Apply branding template", done: false },
                    { step: "4", title: "Test & Deploy", desc: "Review and go live", done: false }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-4">
                      <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        item.done ? 'bg-green-400/20 text-green-400' : 'bg-neutral-800 text-neutral-400'
              }'}>'
                        {item.done ? <CheckCircle className="h-4 w-4" /> : item.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="text-sm text-neutral-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">Continue Setup</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Customizations</CardTitle>
                <CardDescription>Most requested white-label features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Custom Logo", usage: 94, icon: "Image" },
                    { name: "Brand Colors", usage: 87, icon: "Palette" },
                    { name: "Custom Domain", usage: 72, icon: "Globe" },
                    { name: "Mobile Apps", usage: 45, icon: "Package" }
                  ].map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {item.icon === 'Image' && <Image className="h-4 w-4 text-blue-400" />}
                          {item.icon === 'Palette' && <Palette className="h-4 w-4 text-purple-400" />}
                          {item.icon === 'Globe' && <Globe className="h-4 w-4 text-green-400" />}
                          {item.icon === 'Package` && <Package className="h-4 w-4 text-orange-400" />}
                          <span className="text-white">{item.name}</span>
                        </div>
                        <span className="text-neutral-400">{item.usage}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: '${item.usage}%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>White-label solution financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">$67,234</div>
                  <div className="text-xs text-neutral-400">Monthly Recurring Revenue</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">$1,432</div>
                  <div className="text-xs text-neutral-400">Average Revenue Per Client</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">94%</div>
                  <div className="text-xs text-neutral-400">Client Retention Rate</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Calendar className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">23 months</div>
                  <div className="text-xs text-neutral-400">Average Client Lifetime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>White-label Clients</CardTitle>
              <CardDescription>Manage your white-label client accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClients.map((client) => (
                  <div key={client.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                          <Globe className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{client.name}</p>
                          <p className="text-sm text-neutral-400">{client.domain}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(client.status)}
                        {getPlanBadge(client.plan)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Users:</p>
                        <p className="text-white font-medium">{client.users}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Revenue:</p>
                        <p className="text-white font-medium">${client.revenue}/mo</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Created:</p>
                        <p className="text-white font-medium">{client.created_date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Settings className="h-3 w-3" />
                          Configure
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Visit
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <CheckCircle className={'h-3 w-3 ${client.custom_branding ? 'text-green-400' : 'text-neutral-600'
              }'} />'
                          <span className="text-neutral-400">Custom Branding</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className={'h-3 w-3 ${client.custom_domain ? 'text-green-400' : 'text-neutral-600'
              }`} />'
                          <span className="text-neutral-400">Custom Domain</span>
                        </div>
                      </div>
                      <span className="text-neutral-500">Updated: {client.last_updated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding Templates</CardTitle>
              <CardDescription>Pre-designed templates for quick client setup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTemplates.map((template) => (
                  <div key={template.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg flex items-center justify-center">
                          <Palette className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{template.name}</p>
                            {template.is_premium && (
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-400">{template.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-white">{template.rating}</span>
                          <span className="text-neutral-400">({template.usage_count} uses)</span>
                        </div>
                        <Badge className="bg-neutral-700 text-neutral-300 border-neutral-600">
                          {template.category}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button size="sm" className="flex-1 gap-1">
                          <Copy className="h-3 w-3" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customization Features</CardTitle>
              <CardDescription>Available white-label customization options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFeatures.map((feature) => (
                  <div key={feature.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(feature.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{feature.name}</p>
                            {getPlanBadge(feature.plan_requirement)}
                          </div>
                          <p className="text-sm text-neutral-400">{feature.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(feature.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Client Usage:</span>
                        <span className="text-white">{feature.usage_percentage}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: '${feature.usage_percentage}%' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Type: {feature.type}</span>
                        <span className="text-neutral-500">Min Plan: {feature.plan_requirement}</span>
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
              <CardTitle>White-label Configuration</CardTitle>
              <CardDescription>Global settings for white-label solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-3">Default Branding</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Default Logo</p>
                      <p className="text-sm text-neutral-400">Fallback logo for new clients</p>
                    </div>
                    <Button variant="outline" size="sm">Upload</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Color Palette</p>
                      <p className="text-sm text-neutral-400">Default brand color scheme</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Client Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Auto-provisioning</p>
                      <p className="text-sm text-neutral-400">Automatically create client instances</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Billing Integration</p>
                      <p className="text-sm text-neutral-400">Connect billing and subscription management</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Security & Compliance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Data Isolation</p>
                      <p className="text-sm text-neutral-400">Ensure client data separation</p>
                    </div>
                    <Button variant="outline" size="sm">Review</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Compliance Reports</p>
                      <p className="text-sm text-neutral-400">Generate compliance documentation</p>
                    </div>
                    <Button variant="outline" size="sm">Generate</Button>
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