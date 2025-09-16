/**
 * API Documentation Home Page
 * Comprehensive documentation for all Thorbis Business OS API endpoints
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Code,
  Book,
  Zap,
  Shield,
  Globe,
  Users,
  Database,
  Settings,
  MessageSquare,
  BarChart,
  CreditCard,
  Truck,
  Home,
  Car,
  Store,
  Utensils,
  ChevronRight,
  ExternalLink,
  Copy,
  Play,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface APISection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  endpoint_count: number;
  status: 'stable' | 'beta' | 'alpha';
  category: 'core' | 'vertical' | 'integration' | 'utility';
}

const apiSections: APISection[] = [
  // Core APIs
  {
    id: 'auth',
    title: 'Authentication & Users',
    description: 'User authentication, session management, and user profiles',
    icon: <Shield className="h-6 w-6" />,
    endpoint_count: 8,
    status: 'stable',
    category: 'core'
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions & Billing',
    description: 'Subscription management, billing cycles, and payment processing',
    icon: <CreditCard className="h-6 w-6" />,
    endpoint_count: 12,
    status: 'stable',
    category: 'core'
  },
  {
    id: 'analytics',
    title: 'Analytics & Reporting',
    description: 'Business intelligence, metrics, and comprehensive reporting',
    icon: <BarChart className="h-6 w-6" />,
    endpoint_count: 15,
    status: 'stable',
    category: 'core'
  },
  
  // Vertical-Specific APIs
  {
    id: 'hs',
    title: 'Home Services',
    description: 'Work orders, technicians, scheduling, and customer management',
    icon: <Home className="h-6 w-6" />,
    endpoint_count: 35,
    status: 'stable',
    category: 'vertical'
  },
  {
    id: 'auto',
    title: 'Auto Services',
    description: 'Vehicle management, service records, and maintenance tracking',
    icon: <Car className="h-6 w-6" />,
    endpoint_count: 18,
    status: 'stable',
    category: 'vertical'
  },
  {
    id: 'rest',
    title: 'Restaurant Management',
    description: 'Order management, inventory, menu planning, and supplier relations',
    icon: <Utensils className="h-6 w-6" />,
    endpoint_count: 22,
    status: 'stable',
    category: 'vertical'
  },
  {
    id: 'ret',
    title: 'Retail Operations',
    description: 'Inventory, POS systems, customer loyalty, and order fulfillment',
    icon: <Store className="h-6 w-6" />,
    endpoint_count: 20,
    status: 'stable',
    category: 'vertical'
  },
  
  // Integration APIs
  {
    id: 'integrations',
    title: 'Third-Party Integrations',
    description: 'QuickBooks, payment gateways, and external service connections',
    icon: <Globe className="h-6 w-6" />,
    endpoint_count: 10,
    status: 'stable',
    category: 'integration'
  },
  {
    id: 'ai',
    title: 'AI & Intelligence',
    description: 'AI chat, business intelligence, and automated insights',
    icon: <Zap className="h-6 w-6" />,
    endpoint_count: 8,
    status: 'beta',
    category: 'integration'
  },
  
  // Utility APIs
  {
    id: 'system',
    title: 'System & Monitoring',
    description: 'Health checks, audit logs, rate limiting, and system status',
    icon: <Settings className="h-6 w-6" />,
    endpoint_count: 12,
    status: 'stable',
    category: 'utility'
  },
  {
    id: 'support',
    title: 'Support & Communications',
    description: 'Ticket management, notifications, and customer support',
    icon: <MessageSquare className="h-6 w-6" />,
    endpoint_count: 6,
    status: 'stable',
    category: 'utility'
  }
];

const quickStartExamples = [
  {
    title: 'Authentication',
    description: 'Get started with user authentication',
    code: 'fetch('/api/v1/auth/user', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})'
  },
  {
    title: 'Create Work Order',
    description: 'Create a new home services work order',
    code: 'fetch('/api/v1/hs/work-orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer_id: 'cust_123',
    service_type: 'plumbing',
    description: 'Leak repair needed',
    priority: 'high'
  })
})'
  },
  {
    title: 'Get Analytics',
    description: 'Retrieve business analytics data',
    code: 'fetch('/api/v1/analytics/financial/revenue?period=month', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'stable': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'beta': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'alpha': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'core': return 'border-l-blue-500';
    case 'vertical': return 'border-l-green-500';
    case 'integration': return 'border-l-purple-500';
    case 'utility': return 'border-l-orange-500';
    default: return 'border-l-neutral-500';
  }
};

export default function APIDocumentationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Thorbis Business OS API</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
          Comprehensive REST API documentation for building powerful business management applications
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="text-sm">
            API Version 1.0
          </Badge>
          <Badge variant="outline" className="text-sm">
            REST
          </Badge>
          <Badge variant="outline" className="text-sm">
            JSON
          </Badge>
          <Badge variant="outline" className="text-sm">
            OpenAPI 3.0
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <Book className="h-8 w-8 mx-auto mb-4 text-blue-500" />
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn the basics of authentication and making your first API call
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs/api/getting-started">
                Start Here
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Play className="h-8 w-8 mx-auto mb-4 text-green-500" />
            <h3 className="font-semibold mb-2">API Playground</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Test API endpoints interactively with live examples
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs/api/playground">
                Try It Now
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Download className="h-8 w-8 mx-auto mb-4 text-purple-500" />
            <h3 className="font-semibold mb-2">OpenAPI Spec</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download the complete OpenAPI specification
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/openapi.json">
                Download
                <Download className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Code className="h-8 w-8 mx-auto mb-4 text-orange-500" />
            <h3 className="font-semibold mb-2">SDKs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Client libraries for popular programming languages
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs/api/sdks">
                View SDKs
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search API endpoints..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Start Examples */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Start Examples
          </CardTitle>
          <CardDescription>
            Copy and paste these examples to get started immediately
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {quickStartExamples.map((example, index) => (
                <TabsTrigger key={index} value={example.title.toLowerCase().replace(' ', '-')}>
                  {example.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {quickStartExamples.map((example, index) => (
              <TabsContent key={index} value={example.title.toLowerCase().replace(' ', '-`)} className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                  <div className="relative">
                    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{example.code}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* API Sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">API Reference</h2>
        
        {/* Filter by Category */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All APIs</TabsTrigger>
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="vertical">Vertical</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="utility">Utility</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiSections.map((section) => (
                <Card key={section.id} className={`hover:shadow-lg transition-shadow border-l-4 ${getCategoryColor(section.category)}'}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {section.icon}
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(section.status)}>
                              {section.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {section.endpoint_count} endpoints
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4">
                      {section.description}
                    </CardDescription>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={'/docs/api/${section.id}'}>
                        View Documentation
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {['core', 'vertical', 'integration', 'utility`].map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apiSections
                  .filter((section) => section.category === category)
                  .map((section) => (
                    <Card key={section.id} className={`hover:shadow-lg transition-shadow border-l-4 ${getCategoryColor(section.category)}'}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {section.icon}
                            <div>
                              <CardTitle className="text-lg">{section.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getStatusColor(section.status)}>
                                  {section.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {section.endpoint_count} endpoints
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="mb-4">
                          {section.description}
                        </CardDescription>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={'/docs/api/${section.id}'}>
                            View Documentation
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Footer Info */}
      <div className="mt-16 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            Our API documentation is continuously updated. If you can't find what you're looking for, reach out to our developer support team.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs/api/support">
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs/api/changelog">
                View Changelog
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs/api/status">
                API Status
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}