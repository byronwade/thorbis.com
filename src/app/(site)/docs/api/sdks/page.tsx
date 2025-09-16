/**
 * API SDKs and Client Libraries
 * Download and installation guides for various programming languages
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Download,
  Code,
  Github,
  Package,
  Copy,
  ExternalLink,
  CheckCircle,
  Star,
  Users,
  Calendar,
  FileText,
  Terminal,
  Zap,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface SDK {
  id: string;
  name: string;
  language: string;
  description: string;
  version: string;
  install_command: string;
  import_example: string;
  usage_example: string;
  github_url: string;
  npm_url?: string;
  pypi_url?: string;
  maven_url?: string;
  stats: {
    downloads: string;
    stars: number;
    last_updated: string;
  };
  features: string[];
  stability: 'stable' | 'beta' | 'alpha';
}

const sdks: SDK[] = [
  {
    id: 'javascript',
    name: '@thorbis/api',
    language: 'JavaScript/TypeScript',
    description: 'Official JavaScript/TypeScript SDK for Thorbis Business OS API with full TypeScript support',
    version: '2.1.4',
    install_command: 'npm install @thorbis/api',
    import_example: 'import { ThorbisAPI } from '@thorbis/api';

const api = new ThorbisAPI({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});',
    usage_example: '// Create a work order
const workOrder = await api.homeServices.workOrders.create({
  customerId: 'cust_123456789',
  serviceType: 'plumbing',
  priority: 'high',
  description: 'Kitchen sink leak repair'
});

// List customers
const customers = await api.homeServices.customers.list({
  page: 1,
  limit: 20,
  search: 'John Doe'
});

// Handle errors with TypeScript
try {
  const invoice = await api.homeServices.invoices.create(invoiceData);
} catch (error) {
  if (error instanceof ThorbisAPIError) {
    console.log('API Error:', error.code, error.message);
  }
}', github_url: 'https://github.com/thorbis/thorbis-js',
    npm_url: 'https://www.npmjs.com/package/@thorbis/api',
    stats: {
      downloads: '25.4k/week',
      stars: 342,
      last_updated: '2024-01-18'
    },
    features: [
      'Full TypeScript support',
      'Auto-generated from OpenAPI spec',
      'Built-in retry logic',
      'Request/response interceptors',
      'Webhook signature verification',
      'React hooks (optional),
      'Next.js integration helpers'
    ],
    stability: 'stable'
  },
  {
    id: 'python',
    name: 'thorbis-python',
    language: 'Python',
    description: 'Official Python SDK with asyncio support and comprehensive error handling',
    version: '1.8.2',
    install_command: 'pip install thorbis-python',
    import_example: 'from thorbis import ThorbisAPI

# Synchronous client
api = ThorbisAPI(api_key='your-api-key')

# Asynchronous client
from thorbis import AsyncThorbisAPI
async_api = AsyncThorbisAPI(api_key='your-api-key`)',
    usage_example: '# Create a customer
customer = api.home_services.customers.create(
    first_name="John",
    last_name="Doe",
    email="john.doe@example.com",
    customer_type="residential"
)

# List work orders with filtering
work_orders = api.home_services.work_orders.list(
    status="pending",
    priority="high",
    page=1,
    limit=50
)

# Async usage
async def create_work_order():
    work_order = await async_api.home_services.work_orders.create(
        customer_id="cust_123456789",
        service_type="plumbing",
        description="Emergency pipe repair"
    )
    return work_order',
    github_url: 'https://github.com/thorbis/thorbis-python',
    pypi_url: 'https://pypi.org/project/thorbis-python/',
    stats: {
      downloads: '18.2k/week',
      stars: 267,
      last_updated: '2024-01-16'
    },
    features: [
      'Synchronous and asynchronous clients',
      'Type hints with Pydantic models',
      'Built-in pagination helpers',
      'Automatic retries with exponential backoff',
      'Django integration utilities',
      'FastAPI compatibility',
      'Webhook validation helpers'
    ],
    stability: 'stable'
  },
  {
    id: 'php',
    name: 'thorbis-php',
    language: 'PHP',
    description: 'Modern PHP SDK with PSR-4 autoloading and comprehensive Laravel integration',
    version: '3.2.1',
    install_command: 'composer require thorbis/thorbis-php',
    import_example: '<?php

require_once 'vendor/autoload.php';

use Thorbis\\ThorbisAPI;

$api = new ThorbisAPI([
    'api_key' => 'your-api-key',
    'environment' => 'production'
]);',
    usage_example: '// Create a work order
$workOrder = $api->homeServices()->workOrders()->create([
    'customer_id' => 'cust_123456789',
    'service_type' => 'plumbing',
    'priority' => 'high',
    'description' => 'Kitchen sink repair'
]);

// List customers with pagination
$customers = $api->homeServices()->customers()->list([
    'page' => 1,
    'limit' => 20,
    'search' => 'John Doe'
]);

// Laravel Facade (if using Laravel package)
use Thorbis;

$invoice = Thorbis::homeServices()->invoices()->create($invoiceData);',
    github_url: 'https://github.com/thorbis/thorbis-php',
    stats: {
      downloads: '12.8k/week',
      stars: 189,
      last_updated: '2024-01-14'
    },
    features: [
      'PSR-4 autoloading',
      'Laravel service provider',
      'Symfony bundle',
      'Guzzle HTTP client',
      'Built-in caching layer',
      'Exception handling',
      'Webhook verification'
    ],
    stability: 'stable'
  },
  {
    id: 'ruby',
    name: 'thorbis-ruby',
    language: 'Ruby',
    description: 'Ruby gem with Rails integration and ActiveRecord-style syntax',
    version: '2.4.6',
    install_command: 'gem install thorbis-ruby',
    import_example: 'require 'thorbis'

Thorbis.configure do |config|
  config.api_key = 'your-api-key`
  config.environment = :production
end',
    usage_example: '# Create a customer
customer = Thorbis::HomeServices::Customer.create(
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  customer_type: "residential"
)

# Find work orders
work_orders = Thorbis::HomeServices::WorkOrder.where(
  status: "pending",
  priority: "high"
).page(1).per(20)

# Rails integration
class WorkOrdersController < ApplicationController
  def create
    @work_order = Thorbis::HomeServices::WorkOrder.create(work_order_params)
    redirect_to @work_order
  end
end',
    github_url: 'https://github.com/thorbis/thorbis-ruby',
    stats: {
      downloads: '8.4k/week',
      stars: 156,
      last_updated: '2024-01-12'
    },
    features: [
      'ActiveRecord-style syntax',
      'Rails integration',
      'Built-in pagination',
      'Automatic error handling',
      'Configuration management',
      'Webhook helpers',
      'JSON serialization'
    ],
    stability: 'stable'
  },
  {
    id: 'go',
    name: 'thorbis-go',
    language: 'Go',
    description: 'High-performance Go SDK with context support and built-in retries',
    version: '1.3.8',
    install_command: 'go get github.com/thorbis/thorbis-go`,
    import_example: `package main

import (
    "context"
    "github.com/thorbis/thorbis-go"
)

func main() {
    client := thorbis.NewClient("your-api-key")
    ctx := context.Background()
}',
    usage_example: '// Create a work order
workOrder, err := client.HomeServices.WorkOrders.Create(ctx, &thorbis.CreateWorkOrderRequest{
    CustomerID:   "cust_123456789",
    ServiceType:  "plumbing",
    Priority:     "high",
    Description:  "Kitchen sink repair",
})
if err != nil {
    log.Fatal(err)
}

// List customers with context timeout
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

customers, err := client.HomeServices.Customers.List(ctx, &thorbis.ListCustomersRequest{
    Page:   1,
    Limit:  20,
    Search: "John Doe",
})',
    github_url: 'https://github.com/thorbis/thorbis-go',
    stats: {
      downloads: '5.2k/week',
      stars: 124,
      last_updated: '2024-01-10'
    },
    features: [
      'Context support',
      'Built-in retries',
      'HTTP/2 support',
      'Structured logging',
      'Request tracing',
      'Error wrapping',
      'Webhook verification'
    ],
    stability: 'stable'
  },
  {
    id: 'csharp',
    name: 'Thorbis.NET',
    language: 'C#/.NET',
    description: '.NET SDK with async/await support and comprehensive XML documentation',
    version: '4.1.2',
    install_command: 'dotnet add package Thorbis.NET`,
    import_example: `using Thorbis;

var client = new ThorbisClient(new ThorbisClientOptions
{
    ApiKey = "your-api-key",
    Environment = ThorbisEnvironment.Production
});',
    usage_example: '// Create a work order
var workOrder = await client.HomeServices.WorkOrders.CreateAsync(new CreateWorkOrderRequest
{
    CustomerId = "cust_123456789",
    ServiceType = "plumbing",
    Priority = WorkOrderPriority.High,
    Description = "Kitchen sink repair"
});

// List customers with LINQ-style filtering
var customers = await client.HomeServices.Customers
    .Where(c => c.CustomerType == CustomerType.Residential)
    .Search("John Doe")
    .Page(1)
    .Limit(20)
    .ToListAsync();

// Dependency injection (ASP.NET Core)
services.AddThorbis(options => 
{
    options.ApiKey = Configuration["Thorbis:ApiKey"];
});',
    github_url: 'https://github.com/thorbis/thorbis-dotnet',
    stats: {
      downloads: '4.8k/week',
      stars: 98,
      last_updated: '2024-01-08'
    },
    features: [
      'Async/await support',
      'LINQ-style queries',
      'Dependency injection',
      'XML documentation',
      'Strong typing',
      'ASP.NET Core integration',
      'ConfigurationProvider support'
    ],
    stability: 'beta'
  }
];

const getStabilityColor = (stability: string) => {
  switch (stability) {
    case 'stable': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'beta': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'alpha': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
  }
};

export default function SDKsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">SDKs & Client Libraries</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Official client libraries and SDKs for popular programming languages
        </p>
        
        <Alert className="mb-6">
          <Package className="h-4 w-4" />
          <AlertTitle>Official Support</AlertTitle>
          <AlertDescription>
            All SDKs are officially maintained by Thorbis and automatically generated from our OpenAPI specification to ensure consistency and up-to-date coverage.
          </AlertDescription>
        </Alert>
      </div>

      {/* SDK Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {sdks.map((sdk) => (
          <Card key={sdk.id} className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {sdk.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {sdk.language} • v{sdk.version}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStabilityColor(sdk.stability)}>
                    {sdk.stability}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {sdk.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {sdk.stats.downloads}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {sdk.stats.stars}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {sdk.stats.last_updated}
                </div>
              </div>

              {/* Installation */}
              <div>
                <h4 className="font-medium mb-2">Installation</h4>
                <div className="relative">
                  <pre className="bg-neutral-900 text-neutral-100 p-3 rounded text-sm overflow-x-auto">
                    <code>{sdk.install_command}</code>
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-1 right-1"
                    onClick={() => navigator.clipboard.writeText(sdk.install_command)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-2">Key Features</h4>
                <div className="flex flex-wrap gap-1">
                  {sdk.features.slice(0, 4).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {sdk.features.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{sdk.features.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={sdk.github_url}>
                    <Github className="h-4 w-4 mr-1" />
                    GitHub
                  </Link>
                </Button>
                {sdk.npm_url && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={sdk.npm_url}>
                      <Package className="h-4 w-4 mr-1" />
                      npm
                    </Link>
                  </Button>
                )}
                {sdk.pypi_url && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={sdk.pypi_url}>
                      <Package className="h-4 w-4 mr-1" />
                      PyPI
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={'/docs/api/sdks/${sdk.id}'}>
                    <FileText className="h-4 w-4 mr-1" />
                    Docs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started Guide */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>
            Get up and running with your preferred SDK in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>
            
            {['javascript', 'python', 'php'].map((lang) => {
              const sdk = sdks.find(s => s.id === lang);
              if (!sdk) return null;
              
              return (
                <TabsContent key={lang} value={lang} className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">1. Install the SDK</h4>
                      <div className="relative">
                        <pre className="bg-neutral-900 text-neutral-100 p-3 rounded text-sm">
                          <code>{sdk.install_command}</code>
                        </pre>
                        <Button variant="outline" size="sm" className="absolute top-1 right-1">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">2. Initialize the Client</h4>
                      <div className="relative">
                        <pre className="bg-neutral-900 text-neutral-100 p-3 rounded text-sm overflow-x-auto">
                          <code>{sdk.import_example}</code>
                        </pre>
                        <Button variant="outline" size="sm" className="absolute top-1 right-1">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">3. Make Your First API Call</h4>
                      <div className="relative">
                        <pre className="bg-neutral-900 text-neutral-100 p-3 rounded text-sm overflow-x-auto max-h-64">
                          <code>{sdk.usage_example}</code>
                        </pre>
                        <Button variant="outline" size="sm" className="absolute top-1 right-1">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Support and Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Github className="h-5 w-5" />
              Open Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              All our SDKs are open source and welcome contributions from the community.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://github.com/thorbis">
                <ExternalLink className="h-4 w-4 mr-1" />
                View on GitHub
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Join our developer community for support, examples, and best practices.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/community">
                <ExternalLink className="h-4 w-4 mr-1" />
                Join Community
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Enterprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Need custom SDK features or enterprise support? Contact our team.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/contact/enterprise">
                <ExternalLink className="h-4 w-4 mr-1" />
                Contact Sales
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}