'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Home,
  Wrench,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  MessageSquare,
  Star,
  ChevronRight,
  MapPin,
  CreditCard,
  Receipt,
  User,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeServicesPortalDashboardProps {
  portalAccess: any;
  customer: any;
  accessToken: string;
}

interface ServiceRequest {
  id: string;
  request_number: string;
  service_type: string;
  description: string;
  request_date: string;
  scheduled_date?: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  estimated_cost?: number;
  actual_cost?: number;
  technician_name?: string;
  completion_date?: string;
}

interface Property {
  id: string;
  address: string;
  property_type: 'residential' | 'commercial';
  is_primary: boolean;
  size_sqft?: number;
  year_built?: number;
  service_history_count: number;
}

interface ServicePlan {
  id: string;
  plan_name: string;
  service_type: string;
  frequency: string;
  next_service_date: string;
  status: 'active' | 'paused' | 'expired';
  monthly_cost: number;
}

export default function HomeServicesPortalDashboard({ 
  portalAccess, 
  customer, 
  accessToken 
}: HomeServicesPortalDashboardProps) {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading customer data
    setTimeout(() => {
      // Mock data - in real implementation, fetch from API
      setServiceRequests([
        {
          id: '1',
          request_number: 'REQ-2024-001',
          service_type: 'Plumbing',
          description: 'Kitchen sink leak repair',
          request_date: '2024-01-20',
          scheduled_date: '2024-01-22',
          status: 'scheduled',
          priority: 'high',
          estimated_cost: 250.00,
          technician_name: 'Mike Rodriguez'
        },
        {
          id: '2',
          request_number: 'REQ-2024-002',
          service_type: 'HVAC',
          description: 'Annual maintenance check',
          request_date: '2024-01-15',
          completion_date: '2024-01-18',
          status: 'completed',
          priority: 'medium',
          actual_cost: 180.00,
          technician_name: 'Sarah Williams'
        },
        {
          id: '3',
          request_number: 'REQ-2024-003',
          service_type: 'Electrical',
          description: 'Outlet installation in garage',
          request_date: '2024-01-10',
          status: 'pending',
          priority: 'low',
          estimated_cost: 150.00
        }
      ]);

      setProperties([
        {
          id: '1',
          address: '123 Main Street, Anytown, CA 12345',
          property_type: 'residential',
          is_primary: true,
          size_sqft: 2400,
          year_built: 1995,
          service_history_count: 12
        },
        {
          id: '2',
          address: '456 Oak Avenue, Anytown, CA 12345',
          property_type: 'residential',
          is_primary: false,
          size_sqft: 1800,
          year_built: 2010,
          service_history_count: 5
        }
      ]);

      setServicePlans([
        {
          id: '1',
          plan_name: 'HVAC Maintenance Plan',
          service_type: 'HVAC',
          frequency: 'Quarterly',
          next_service_date: '2024-03-15',
          status: 'active',
          monthly_cost: 29.99
        },
        {
          id: '2',
          plan_name: 'Plumbing Care Plan',
          service_type: 'Plumbing',
          frequency: 'Semi-Annual',
          next_service_date: '2024-06-01',
          status: 'active',
          monthly_cost: 19.99
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [accessToken]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
          Welcome back, {customer.first_name || customer.company_name}!
        </h2>
        <p className="text-blue-700 dark:text-blue-300">
          Manage your home services and track service requests
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Requests</p>
                <p className="text-2xl font-bold">
                  {serviceRequests.filter(r => ['pending', 'scheduled', 'in_progress'].includes(r.status)).length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Home className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Service Plans</p>
                <p className="text-2xl font-bold">{servicePlans.filter(p => p.status === 'active').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Spent</p>
                <p className="text-2xl font-bold">
                  ${serviceRequests.reduce((sum, req) => sum + (req.actual_cost || req.estimated_cost || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Service Requests</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="plans">Service Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Upcoming Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Upcoming Services
              </CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests
                  .filter(req => req.status === 'scheduled')
                  .map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{request.service_type}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {request.scheduled_date} • {request.technician_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${request.estimated_cost?.toFixed(2)}</p>
                        <Badge className={cn("capitalize", getPriorityColor(request.priority))}>
                          {request.priority} Priority
                        </Badge>
                      </div>
                    </div>
                  ))}
                
                {serviceRequests.filter(req => req.status === 'scheduled').length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">No upcoming appointments</p>
                    <Button className="mt-4">Schedule Service</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Service History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Recent Service History
              </CardTitle>
              <CardDescription>Your completed services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests
                  .filter(req => req.status === 'completed')
                  .slice(0, 3)
                  .map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{request.service_type}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {request.completion_date} • {request.technician_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${request.actual_cost?.toFixed(2)}</p>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Service Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                Active Service Plans
              </CardTitle>
              <CardDescription>Your maintenance subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicePlans
                  .filter(plan => plan.status === 'active')
                  .map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{plan.plan_name}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{plan.frequency}</p>
                        </div>
                        <Badge variant="secondary">{plan.status}</Badge>
                      </div>
                      
                      <div className="text-sm">
                        <p className="mb-1">
                          <span className="font-medium">Next Service:</span> {plan.next_service_date}
                        </p>
                        <p>
                          <span className="font-medium">Monthly Cost:</span> ${plan.monthly_cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Request History</CardTitle>
              <CardDescription>All your service requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{request.request_number}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {request.service_type} • {request.request_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(request.actual_cost || request.estimated_cost || 0).toFixed(2)}
                        </p>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{request.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className={cn("font-medium", getPriorityColor(request.priority))}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                        </span>
                        {request.technician_name && (
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Technician: {request.technician_name}
                          </span>
                        )}
                      </div>
                      {request.scheduled_date && (
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Scheduled: {request.scheduled_date}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button>
                  <Wrench className="h-4 w-4 mr-2" />
                  Request New Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-green-500" />
                    Property Details
                    {property.is_primary && (
                      <Badge variant="secondary">Primary</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{property.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-neutral-600 dark:text-neutral-400">Type</p>
                      <p className="capitalize">{property.property_type}</p>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-600 dark:text-neutral-400">Size</p>
                      <p>{property.size_sqft?.toLocaleString()} sq ft</p>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-600 dark:text-neutral-400">Year Built</p>
                      <p>{property.year_built}</p>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-600 dark:text-neutral-400">Service History</p>
                      <p>{property.service_history_count} services</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      View Service History
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Plans</CardTitle>
              <CardDescription>Manage your maintenance subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {servicePlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{plan.plan_name}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{plan.service_type}</p>
                      </div>
                      <Badge className={plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}>
                        {plan.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span>Frequency:</span>
                        <span>{plan.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Service:</span>
                        <span>{plan.next_service_date}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Monthly Cost:</span>
                        <span>${plan.monthly_cost.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Manage Plan
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Wrench className="h-4 w-4" />
              Request Service
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Call
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Receipt className="h-4 w-4" />
              Download Invoices
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4" />
              Leave a Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}