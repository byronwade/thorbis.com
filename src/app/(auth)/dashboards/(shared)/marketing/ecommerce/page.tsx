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
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Star,
  Plus,
  Settings,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Search,
  Target,
  Zap,
  BarChart3,
  Calendar,
  Mail,
  Share2,
  Image,
  Tag,
  Globe,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Copy,
  Play,
  Pause,
  Activity,
  Layers,
  Database,
  CreditCard
} from "lucide-react";
import { Button } from '@/components/ui/button';


// Mock e-commerce marketing data
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  performance: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    conversion_rate: number;
  };
  campaigns: string[];
  status: 'active' | 'low_stock' | 'out_of_stock';
  last_updated: string;
}

interface Campaign {
  id: string;
  name: string;
  type: 'abandoned_cart' | 'product_recommendation' | 'cross_sell' | 'upsell' | 'win_back';
  status: 'active' | 'paused' | 'draft';
  products: string[];
  performance: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  automation_rules: string[];
  created_date: string;
}

interface Store {
  id: string;
  name: string;
  platform: 'shopify' | 'woocommerce' | 'magento' | 'bigcommerce';
  url: string;
  status: 'connected' | 'syncing' | 'error';
  products_synced: number;
  last_sync: string;
  revenue_tracked: number;
  orders_tracked: number;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: string;
  size: number;
  revenue_per_customer: number;
  last_purchase_days: number;
  status: 'active' | 'inactive';
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    category: "Electronics",
    price: 129.99,
    stock: 245,
    image: "/products/headphones.jpg",
    performance: {
      views: 12456,
      clicks: 1834,
      conversions: 234,
      revenue: 30419.66,
      conversion_rate: 12.8
    },
    campaigns: ["Holiday Sale", "Electronics Promo"],
    status: "active",
    last_updated: "2025-01-03 14:30:00"
  },
  {
    id: "2",
    name: "Smart Fitness Tracker",
    sku: "SFT-002", 
    category: "Wearables",
    price: 89.99,
    stock: 12,
    image: "/products/fitness-tracker.jpg",
    performance: {
      views: 8934,
      clicks: 1245,
      conversions: 156,
      revenue: 14038.44,
      conversion_rate: 12.5
    },
    campaigns: ["Fitness January", "Health & Wellness"],
    status: "low_stock",
    last_updated: "2025-01-03 13:45:00"
  },
  {
    id: "3",
    name: "Organic Coffee Blend",
    sku: "OCB-003",
    category: "Food & Beverage",
    price: 24.99,
    stock: 0,
    image: "/products/coffee.jpg",
    performance: {
      views: 5678,
      clicks: 834,
      conversions: 89,
      revenue: 2224.11,
      conversion_rate: 10.7
    },
    campaigns: ["Morning Boost"],
    status: "out_of_stock",
    last_updated: "2025-01-02 16:20:00"
  }
];

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Abandoned Cart Recovery",
    type: "abandoned_cart",
    status: "active",
    products: ["Electronics", "Wearables"],
    performance: {
      sent: 5689,
      opened: 2845,
      clicked: 567,
      converted: 234,
      revenue: 28456.78
    },
    automation_rules: ["15 min delay", "Email sequence", "Push notification"],
    created_date: "2024-12-15"
  },
  {
    id: "2",
    name: "Product Recommendations",
    type: "product_recommendation",
    status: "active",
    products: ["All Categories"],
    performance: {
      sent: 12345,
      opened: 6789,
      clicked: 1234,
      converted: 456,
      revenue: 45678.90
    },
    automation_rules: ["AI-powered", "Based on behavior", "Seasonal trends"],
    created_date: "2024-12-20"
  },
  {
    id: "3",
    name: "Cross-sell Electronics",
    type: "cross_sell",
    status: "paused",
    products: ["Electronics", "Accessories"],
    performance: {
      sent: 3456,
      opened: 1789,
      clicked: 345,
      converted: 123,
      revenue: 15234.56
    },
    automation_rules: ["Post-purchase", "Related products", "Discount offer"],
    created_date: "2025-01-01"
  }
];

const mockStores: Store[] = [
  {
    id: "1",
    name: "TechGear Store",
    platform: "shopify",
    url: "techgear.myshopify.com",
    status: "connected",
    products_synced: 1245,
    last_sync: "2025-01-03 14:30:00",
    revenue_tracked: 156789.45,
    orders_tracked: 2341
  },
  {
    id: "2", 
    name: "Wellness Hub",
    platform: "woocommerce",
    url: "wellnesshub.com",
    status: "syncing",
    products_synced: 567,
    last_sync: "2025-01-03 13:45:00",
    revenue_tracked: 89456.78,
    orders_tracked: 1234
  },
  {
    id: "3",
    name: "Fashion Forward",
    platform: "magento",
    url: "fashionforward.com",
    status: "error",
    products_synced: 0,
    last_sync: "2025-01-02 10:15:00",
    revenue_tracked: 0,
    orders_tracked: 0
  }
];

const mockSegments: Segment[] = [
  {
    id: "1",
    name: "High-Value Customers",
    description: "Customers with >$500 lifetime value",
    criteria: "LTV > $500 AND Orders > 3",
    size: 1234,
    revenue_per_customer: 756.89,
    last_purchase_days: 15,
    status: "active"
  },
  {
    id: "2",
    name: "At-Risk Customers",
    description: "Haven't purchased in 90+ days",
    criteria: "Last Purchase > 90 days AND LTV > $100",
    size: 567,
    revenue_per_customer: 234.56,
    last_purchase_days: 120,
    status: "active"
  },
  {
    id: "3",
    name: "New Electronics Buyers",
    description: "First-time electronics category buyers",
    criteria: "Electronics Purchase = 1 AND Days Since First Purchase < 30",
    size: 890,
    revenue_per_customer: 145.78,
    last_purchase_days: 8,
    status: "active"
  }
];

export default function EcommercePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'paused':
      case 'syncing':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'error':
      case 'out_of_stock':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'low_stock':
        return <AlertCircle className="h-4 w-4 text-orange-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-400/20 text-green-400 border-green-400/30",
      connected: "bg-green-400/20 text-green-400 border-green-400/30",
      paused: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      syncing: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      draft: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30",
      error: "bg-red-400/20 text-red-400 border-red-400/30",
      low_stock: "bg-orange-400/20 text-orange-400 border-orange-400/30",
      out_of_stock: "bg-red-400/20 text-red-400 border-red-400/30",
      inactive: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30"
    };
    
    return (
      <Badge className={'${variants[status as keyof typeof variants]} border'}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      shopify: ShoppingCart,
      woocommerce: Package,
      magento: Database,
      bigcommerce: Globe
    };
    
    const IconComponent = icons[platform as keyof typeof icons] || ShoppingCart;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">E-commerce Marketing</h1>
          <p className="text-neutral-400 mt-2">
            Advanced product marketing, automation, and store integrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
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
                <p className="text-2xl font-bold text-white">$246,246</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+23% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Products Tracked</p>
                <p className="text-2xl font-bold text-white">1,812</p>
              </div>
              <Package className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Package className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400">Across 3 stores</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">12.4%</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+1.8% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active Campaigns</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <Zap className="h-8 w-8 text-orange-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3 text-orange-400" />
              <span className="text-xs text-orange-400">6 automated</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Products driving the most revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 border border-neutral-800 rounded-lg">
                      <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-neutral-400">{product.category} • {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${product.performance.revenue.toLocaleString()}</p>
                        <p className="text-xs text-neutral-400">{product.performance.conversions} sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Recent campaign metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCampaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-400" />
                          <span className="font-medium text-white">{campaign.name}</span>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <span className="text-white font-bold">${campaign.performance.revenue.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-neutral-500">Sent</p>
                          <p className="text-white">{campaign.performance.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Opened</p>
                          <p className="text-white">{((campaign.performance.opened / campaign.performance.sent) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Clicked</p>
                          <p className="text-white">{((campaign.performance.clicked / campaign.performance.sent) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Converted</p>
                          <p className="text-white">{((campaign.performance.converted / campaign.performance.sent) * 100).toFixed(1)}%</p>
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
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>E-commerce performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">$89.45</div>
                  <div className="text-xs text-neutral-400">Average Order Value</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">$345.67</div>
                  <div className="text-xs text-neutral-400">Customer Lifetime Value</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <RefreshCw className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">2.3</div>
                  <div className="text-xs text-neutral-400">Repeat Purchase Rate</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">45 days</div>
                  <div className="text-xs text-neutral-400">Avg Time Between Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Track and optimize individual product marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProducts.map((product) => (
                  <div key={product.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-white">{product.name}</p>
                            {getStatusBadge(product.status)}
                          </div>
                          <p className="text-sm text-neutral-400">{product.category} • SKU: {product.sku}</p>
                          <p className="text-sm text-neutral-300">${product.price} • {product.stock} in stock</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Views:</p>
                        <p className="text-white font-medium">{product.performance.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Clicks:</p>
                        <p className="text-white font-medium">{product.performance.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Conversions:</p>
                        <p className="text-white font-medium">{product.performance.conversions}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Revenue:</p>
                        <p className="text-white font-medium">${product.performance.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Conv. Rate:</p>
                        <p className="text-white font-medium">{product.performance.conversion_rate}%</p>
                      </div>
                    </div>
                    
                    {product.campaigns.length > 0 && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <p className="text-sm text-neutral-400 mb-2">Active Campaigns:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.campaigns.map((campaign) => (
                              <Badge key={campaign} variant="outline" className="text-xs">
                                {campaign}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>E-commerce Campaigns</CardTitle>
              <CardDescription>Automated marketing campaigns for your products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-400/20 rounded-lg flex items-center justify-center">
                          <Zap className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{campaign.name}</p>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <p className="text-sm text-neutral-400 capitalize">
                            {campaign.type.replace('_', ' ')} campaign
                          </p>
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
                            Resume
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-neutral-400">Sent:</p>
                        <p className="text-white font-medium">{campaign.performance.sent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Open Rate:</p>
                        <p className="text-white font-medium">
                          {((campaign.performance.opened / campaign.performance.sent) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Click Rate:</p>
                        <p className="text-white font-medium">
                          {((campaign.performance.clicked / campaign.performance.sent) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Conversion:</p>
                        <p className="text-white font-medium">
                          {((campaign.performance.converted / campaign.performance.sent) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Revenue:</p>
                        <p className="text-white font-medium">${campaign.performance.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400 mb-2">Products:</p>
                        <div className="flex flex-wrap gap-1">
                          {campaign.products.map((product) => (
                            <Badge key={product} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-neutral-400 mb-2">Automation Rules:</p>
                        <div className="flex flex-wrap gap-1">
                          {campaign.automation_rules.map((rule) => (
                            <Badge key={rule} className="bg-blue-400/20 text-blue-400 border-blue-400/30 border text-xs">
                              {rule}
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

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Stores</CardTitle>
              <CardDescription>Manage your e-commerce platform integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStores.map((store) => (
                  <div key={store.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                          {getPlatformIcon(store.platform)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{store.name}</p>
                            {getStatusBadge(store.status)}
                          </div>
                          <p className="text-sm text-neutral-400">
                            {store.platform.charAt(0).toUpperCase() + store.platform.slice(1)} • {store.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Sync
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Products:</p>
                        <p className="text-white font-medium">{store.products_synced.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Orders Tracked:</p>
                        <p className="text-white font-medium">{store.orders_tracked.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Revenue:</p>
                        <p className="text-white font-medium">${store.revenue_tracked.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Last Sync:</p>
                        <p className="text-white font-medium">{store.last_sync}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>E-commerce customer segmentation for targeted marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSegments.map((segment) => (
                  <div key={segment.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{segment.name}</p>
                            {getStatusBadge(segment.status)}
                          </div>
                          <p className="text-sm text-neutral-400">{segment.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">Target</Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-neutral-400">Size:</p>
                        <p className="text-white font-medium">{segment.size.toLocaleString()} customers</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Avg Revenue:</p>
                        <p className="text-white font-medium">${segment.revenue_per_customer}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Last Purchase:</p>
                        <p className="text-white font-medium">{segment.last_purchase_days} days avg</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Potential:</p>
                        <p className="text-white font-medium">
                          ${(segment.size * segment.revenue_per_customer).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-neutral-900 rounded text-sm">
                      <p className="text-neutral-400">Criteria:</p>
                      <p className="text-neutral-300 font-mono">{segment.criteria}</p>
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
              <CardTitle>E-commerce Settings</CardTitle>
              <CardDescription>Configure e-commerce marketing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-3">Store Connections</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Auto-sync Products</p>
                      <p className="text-sm text-neutral-400">Automatically sync product data every hour</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Inventory Alerts</p>
                      <p className="text-sm text-neutral-400">Get notified when products are low in stock</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Campaign Automation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Abandoned Cart Recovery</p>
                      <p className="text-sm text-neutral-400">Automatically send cart recovery emails</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Product Recommendations</p>
                      <p className="text-sm text-neutral-400">AI-powered product suggestions</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Analytics & Tracking</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Revenue Attribution</p>
                      <p className="text-sm text-neutral-400">Track revenue back to marketing campaigns</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Customer Lifetime Value</p>
                      <p className="text-sm text-neutral-400">Calculate and track CLV metrics</p>
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