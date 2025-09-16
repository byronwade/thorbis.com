/**
 * Home Services API Documentation
 * Comprehensive documentation for all Home Services API endpoints
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Home,
  Users,
  Calendar,
  Wrench,
  DollarSign,
  FileText,
  MessageSquare,
  Camera,
  Clock,
  Repeat,
  BarChart,
  Zap,
  Shield,
  Copy,
  ExternalLink,
  ArrowRight,
  CheckCircle,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth_required: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response_example?: any;
}

interface APISection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  endpoints: APIEndpoint[];
}

const apiSections: APISection[] = [
  {
    id: 'customers',
    title: 'Customer Management',
    description: 'Manage customer profiles, properties, and contact information',
    icon: <Users className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/hs/customers',
        description: 'List all customers with pagination and filtering',
        auth_required: true,
        parameters: [
          { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20)' },
          { name: 'search', type: 'string', required: false, description: 'Search by name, email, or phone' },
          { name: 'customer_type', type: 'string', required: false, description: 'Filter by customer type' },
        ],
        response_example: {
          success: true,
          data: [
            {
              id: 'cust_123456789',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone: '+1-555-123-4567',
              customer_type: 'residential',
              properties_count: 2,
              active_subscriptions: 3,
              created_at: '2024-01-15T10:30:00Z'
            }
          ],
          meta: {
            pagination: {
              page: 1,
              limit: 20,
              total: 150,
              has_next: true,
              has_previous: false
            }
          }
        }
      },
      {
        method: 'POST',
        path: '/api/v1/hs/customers',
        description: 'Create a new customer record',
        auth_required: true,
        parameters: [
          { name: 'first_name', type: 'string', required: true, description: 'Customer first name' },
          { name: 'last_name', type: 'string', required: true, description: 'Customer last name' },
          { name: 'email', type: 'string', required: true, description: 'Customer email address' },
          { name: 'phone', type: 'string', required: false, description: 'Customer phone number' },
          { name: 'customer_type', type: 'string', required: true, description: 'Type: residential or commercial' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/hs/customers/{id}',
        description: 'Get detailed customer information including properties',
        auth_required: true,
      },
      {
        method: 'PUT',
        path: '/api/v1/hs/customers/{id}',
        description: 'Update customer information',
        auth_required: true,
      },
    ]
  },
  {
    id: 'work-orders',
    title: 'Work Orders',
    description: 'Create and manage service work orders and job scheduling',
    icon: <Wrench className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/hs/work-orders',
        description: 'List work orders with filtering and status tracking',
        auth_required: true,
        parameters: [
          { name: 'status', type: 'string', required: false, description: 'Filter by status: pending, in_progress, completed, cancelled' },
          { name: 'technician_id', type: 'string', required: false, description: 'Filter by assigned technician' },
          { name: 'priority', type: 'string', required: false, description: 'Filter by priority: low, medium, high, emergency' },
          { name: 'service_type', type: 'string', required: false, description: 'Filter by service type' },
        ],
        response_example: {
          success: true,
          data: [
            {
              id: 'wo_987654321',
              customer_id: 'cust_123456789',
              property_id: 'prop_456789123',
              service_type: 'plumbing',
              priority: 'high',
              status: 'in_progress',
              description: 'Kitchen sink leak repair',
              scheduled_date: '2024-01-22T09:00:00Z',
              technician_id: 'tech_345678912',
              estimated_duration: 120,
              created_at: '2024-01-20T14:30:00Z'
            }
          ]
        }
      },
      {
        method: 'POST',
        path: '/api/v1/hs/work-orders',
        description: 'Create a new work order',
        auth_required: true,
        parameters: [
          { name: 'customer_id', type: 'string', required: true, description: 'Customer ID' },
          { name: 'property_id', type: 'string', required: true, description: 'Property ID' },
          { name: 'service_type', type: 'string', required: true, description: 'Type of service needed' },
          { name: 'priority', type: 'string', required: true, description: 'Priority level' },
          { name: 'description', type: 'string', required: true, description: 'Work order description' },
          { name: 'scheduled_date', type: 'string', required: false, description: 'Preferred scheduling date (ISO 8601)' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/hs/work-orders/{id}',
        description: 'Get detailed work order information with timeline',
        auth_required: true,
      },
      {
        method: 'PUT',
        path: '/api/v1/hs/work-orders/{id}/status',
        description: 'Update work order status and progress',
        auth_required: true,
      },
    ]
  },
  {
    id: 'technicians',
    title: 'Technician Management',
    description: 'Manage technician profiles, schedules, and availability',
    icon: <Settings className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/hs/technicians',
        description: 'List all technicians with availability status',
        auth_required: true,
        parameters: [
          { name: 'available_only', type: 'boolean', required: false, description: 'Show only available technicians' },
          { name: 'specialization', type: 'string', required: false, description: 'Filter by specialization' },
          { name: 'location', type: 'string', required: false, description: 'Filter by service area' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/hs/technicians/{id}/schedule',
        description: 'Get technician schedule and availability',
        auth_required: true,
        parameters: [
          { name: 'start_date', type: 'string', required: false, description: 'Start date for schedule (ISO 8601)' },
          { name: 'end_date', type: 'string', required: false, description: 'End date for schedule (ISO 8601)' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/hs/technicians/{id}/availability',
        description: 'Update technician availability',
        auth_required: true,
      },
    ]
  },
  {
    id: 'invoicing',
    title: 'Invoicing & Estimates',
    description: 'Generate invoices, estimates, and manage billing',
    icon: <FileText className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/hs/invoices',
        description: 'List invoices with payment status',
        auth_required: true,
        parameters: [
          { name: 'status', type: 'string', required: false, description: 'Filter by payment status: draft, sent, paid, overdue' },
          { name: 'customer_id', type: 'string', required: false, description: 'Filter by customer' },
          { name: 'date_range', type: 'string', required: false, description: 'Date range filter' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/hs/invoices',
        description: 'Create a new invoice',
        auth_required: true,
      },
      {
        method: 'GET',
        path: '/api/v1/hs/estimates',
        description: 'List estimates and proposals',
        auth_required: true,
      },
      {
        method: 'POST',
        path: '/api/v1/hs/estimates',
        description: 'Create a new estimate',
        auth_required: true,
      },
    ]
  },
  {
    id: 'scheduling',
    title: 'Scheduling & Calendar',
    description: 'Manage appointments, schedules, and calendar events',
    icon: <Calendar className="h-5 w-5" />,
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/hs/schedule/calendar',
        description: 'Get calendar view with appointments',
        auth_required: true,
        parameters: [
          { name: 'view', type: 'string', required: false, description: 'Calendar view: day, week, month' },
          { name: 'start_date', type: 'string', required: false, description: 'Start date (ISO 8601)' },
          { name: 'technician_id', type: 'string', required: false, description: 'Filter by technician' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/hs/schedule/appointments',
        description: 'Schedule a new appointment',
        auth_required: true,
      },
      {
        method: 'PUT',
        path: '/api/v1/hs/schedule/appointments/{id}',
        description: 'Update or reschedule appointment',
        auth_required: true,
      },
    ]
  },
  {
    id: 'portal',
    title: 'Customer Portal',
    description: 'Customer self-service portal and access management',
    icon: <Shield className="h-5 w-5" />,
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/hs/portal/access-tokens',
        description: 'Generate customer portal access token',
        auth_required: true,
        parameters: [
          { name: 'customer_id', type: 'string', required: true, description: 'Customer ID' },
          { name: 'expires_in', type: 'number', required: false, description: 'Token expiration in hours (default: 168)' },
          { name: 'permissions', type: 'object', required: false, description: 'Portal access permissions' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/hs/portal/customer-data/{token}',
        description: 'Get customer data for portal display',
        auth_required: false,
      },
      {
        method: 'POST',
        path: '/api/v1/hs/portal/service-requests',
        description: 'Customer-submitted service request',
        auth_required: false,
      },
    ]
  },
];

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'PUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
  }
};

export default function HomeServicesAPIPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Home Services API</h1>
            <p className="text-muted-foreground">
              Complete API reference for home services management
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            35 Endpoints
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Stable
          </Badge>
          <Badge variant="outline">
            Authentication Required
          </Badge>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Start Example
          </CardTitle>
          <CardDescription>
            Create a work order and schedule a technician
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{'// 1. Create a work order
const workOrder = await fetch('/api/v1/hs/work-orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer_id: 'cust_123456789',
    property_id: 'prop_456789123',
    service_type: 'plumbing',
    priority: 'high',
    description: 'Kitchen sink leak repair',
    scheduled_date: '2024-01-22T09:00:00Z'
  })
});

// 2. Assign a technician
const assignment = await fetch('/api/v1/hs/work-orders/{work_order_id}/assign', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    technician_id: 'tech_345678912',
    estimated_duration: 120
  })
});'}</code>
              </pre>
              <Button variant="outline" size="sm" className="absolute top-2 right-2">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Sections */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">API Reference</h2>
        
        {apiSections.map((section) => (
          <Card key={section.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {section.icon}
                {section.title}
                <Badge variant="outline" className="ml-auto">
                  {section.endpoints.length} endpoints
                </Badge>
              </CardTitle>
              <CardDescription>
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {section.endpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                        {endpoint.auth_required && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Auth Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {endpoint.description}
                    </p>

                    {endpoint.parameters && (
                      <div className="mb-4">
                        <h5 className="font-medium mb-2 text-sm">Parameters</h5>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-center gap-3 text-sm">
                              <code className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs">
                                {param.name}
                              </code>
                              <span className="text-muted-foreground">{param.type}</span>
                              {param.required ? (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Optional</Badge>
                              )}
                              <span className="text-muted-foreground flex-1">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {endpoint.response_example && (
                      <div>
                        <h5 className="font-medium mb-2 text-sm">Example Response</h5>
                        <div className="relative">
                          <pre className="bg-neutral-900 text-neutral-100 p-3 rounded text-xs overflow-x-auto max-h-48">
                            <code>{JSON.stringify(endpoint.response_example, null, 2)}</code>
                          </pre>
                          <Button variant="outline" size="sm" className="absolute top-2 right-2">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Related Resources */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-500" />
            Related Resources
          </CardTitle>
          <CardDescription>
            Additional resources for Home Services API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex-col space-y-2" asChild>
              <Link href="/docs/api/playground?section=hs">
                <Zap className="h-5 w-5" />
                <span>Try in Playground</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2" asChild>
              <Link href="/docs/api/webhooks">
                <MessageSquare className="h-5 w-5" />
                <span>Webhook Events</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2" asChild>
              <Link href="/docs/api/sdks">
                <ExternalLink className="h-5 w-5" />
                <span>Download SDKs</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Alert className="mt-8">
        <Shield className="h-4 w-4" />
        <AlertTitle>Common Error Codes</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-2 text-sm">
            <div><code>HS_CUSTOMER_NOT_FOUND</code> - Customer ID does not exist</div>
            <div><code>HS_TECHNICIAN_UNAVAILABLE</code> - Technician not available for scheduling</div>
            <div><code>HS_INVALID_SERVICE_TYPE</code> - Service type not supported</div>
            <div><code>HS_SCHEDULING_CONFLICT</code> - Time slot already booked</div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}