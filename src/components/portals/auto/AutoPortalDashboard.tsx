'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Car,
  Wrench,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Phone,
  MessageSquare,
  Download,
  Star,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoPortalDashboardProps {
  portalAccess: any;
  customer: any;
  accessToken: string;
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin: string;
  license_plate: string;
  mileage: number;
  color: string;
  status: 'active' | 'in_service' | 'retired';
}

interface ServiceRecord {
  id: string;
  service_date: string;
  service_type: string;
  description: string;
  mileage: number;
  cost: number;
  status: 'completed' | 'pending' | 'in_progress';
  technician_name: string;
  next_service_due?: string;
}

interface MaintenanceAlert {
  id: string;
  vehicle_id: string;
  alert_type: 'oil_change' | 'tire_rotation' | 'brake_inspection' | 'general_maintenance';
  message: string;
  urgency: 'low' | 'medium' | 'high';
  due_date: string;
  due_mileage?: number;
}

export default function AutoPortalDashboard({ 
  portalAccess, 
  customer, 
  accessToken 
}: AutoPortalDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading customer data
    setTimeout(() => {
      // Mock data - in real implementation, fetch from API
      setVehicles([
        {
          id: '1',
          year: 2019,
          make: 'Toyota',
          model: 'Camry',
          vin: '1N4AL3AP9DC123456',
          license_plate: 'ABC-123',
          mileage: 45000,
          color: 'Silver',
          status: 'active'
        },
        {
          id: '2', 
          year: 2021,
          make: 'Honda',
          model: 'Civic',
          vin: '2T1BURHE0FC123456',
          license_plate: 'XYZ-789',
          mileage: 25000,
          color: 'Blue',
          status: 'active'
        }
      ]);

      setServiceRecords([
        {
          id: '1',
          service_date: '2024-01-15',
          service_type: 'Oil Change',
          description: 'Full synthetic oil change and filter replacement',
          mileage: 44500,
          cost: 75.99,
          status: 'completed',
          technician_name: 'Mike Johnson',
          next_service_due: '2024-04-15'
        },
        {
          id: '2',
          service_date: '2024-01-20',
          service_type: 'Brake Inspection',
          description: 'Brake pads and rotors inspection',
          mileage: 25000,
          cost: 125.00,
          status: 'completed',
          technician_name: 'Sarah Williams'
        }
      ]);

      setMaintenanceAlerts([
        {
          id: '1',
          vehicle_id: '1',
          alert_type: 'oil_change',
          message: 'Oil change due soon',
          urgency: 'medium',
          due_date: '2024-04-15',
          due_mileage: 48000
        },
        {
          id: '2',
          vehicle_id: '2',
          alert_type: 'tire_rotation',
          message: 'Tire rotation recommended',
          urgency: 'low',
          due_date: '2024-03-01',
          due_mileage: 30000
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [accessToken]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 dark:text-red-400';
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
      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
          Welcome back, {customer.first_name || customer.company_name}!
        </h2>
        <p className="text-red-700 dark:text-red-300">
          Keep track of your vehicle maintenance and service history
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Vehicles</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
              <Car className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Alerts</p>
                <p className="text-2xl font-bold">{maintenanceAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Services</p>
                <p className="text-2xl font-bold">{serviceRecords.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Spent</p>
                <p className="text-2xl font-bold">
                  ${serviceRecords.reduce((sum, record) => sum + record.cost, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="service-history">Service History</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Maintenance Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Maintenance Alerts
              </CardTitle>
              <CardDescription>Upcoming maintenance recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceAlerts.map((alert) => {
                  const vehicle = vehicles.find(v => v.id === alert.vehicle_id);
                  return (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", {
                          'bg-red-500': alert.urgency === 'high',
                          'bg-yellow-500': alert.urgency === 'medium',
                          'bg-green-500': alert.urgency === 'low'
                        })} />
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {vehicle?.year} {vehicle?.make} {vehicle?.model}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Due: {alert.due_date}</p>
                        {alert.due_mileage && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            @ {alert.due_mileage.toLocaleString()} miles
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-500" />
                Recent Services
              </CardTitle>
              <CardDescription>Your latest service appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{record.service_type}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {record.service_date} • {record.technician_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${record.cost.toFixed(2)}</p>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-red-500" />
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <CardDescription>{vehicle.color} • {vehicle.license_plate}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-neutral-600 dark:text-neutral-400">VIN</p>
                      <p className="font-mono">{vehicle.vin}</p>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-600 dark:text-neutral-400">Mileage</p>
                      <p>{vehicle.mileage.toLocaleString()} miles</p>
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

        <TabsContent value="service-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Service History</CardTitle>
              <CardDescription>All maintenance and repair records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{record.service_type}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {record.service_date} • {record.mileage.toLocaleString()} miles
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${record.cost.toFixed(2)}</p>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{record.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Technician: {record.technician_name}
                      </p>
                      {record.next_service_due && (
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Next service: {record.next_service_due}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Schedule Service
              </CardTitle>
              <CardDescription>Book your next appointment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center">
                  <Calendar className="h-6 w-6 mb-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Phone className="h-6 w-6 mb-2" />
                  Call Shop
                </Button>
              </div>
              
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Need help scheduling? Contact us:
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    (555) 123-4567
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">No upcoming appointments</p>
                <Button className="mt-4">Schedule Service</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Download Service Records
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4" />
              Leave a Review
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Find Our Location
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}