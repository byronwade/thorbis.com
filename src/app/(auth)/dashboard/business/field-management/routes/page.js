'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Navigation,
  Truck,
  Route,
  Calculator,
  Users,
  Calendar,
  Filter,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';

export default function RoutesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock route data
  const routes = [
    {
      id: 'ROUTE-001',
      name: 'North Springfield Route',
      technician: 'Mike Rodriguez',
      vehicle: 'VAN-001 (Ford Transit)',
      date: '2024-08-25',
      status: 'active',
      totalJobs: 6,
      completedJobs: 3,
      estimatedDuration: '8 hours',
      totalDistance: '45 miles',
      startTime: '08:00 AM',
      estimatedEnd: '04:00 PM',
      currentLocation: '456 Main St',
      jobs: [
        { id: 'JOB-001', address: '123 Main St', status: 'completed' },
        { id: 'JOB-002', address: '456 Oak Ave', status: 'completed' },
        { id: 'JOB-003', address: '789 Pine St', status: 'in-progress' },
        { id: 'JOB-004', address: '321 Elm St', status: 'pending' },
        { id: 'JOB-005', address: '654 Maple Ave', status: 'pending' },
        { id: 'JOB-006', address: '987 Cedar St', status: 'pending' }
      ]
    },
    {
      id: 'ROUTE-002',
      name: 'South Springfield Route',
      technician: 'Sarah Chen',
      vehicle: 'TRUCK-002 (Chevy Silverado)',
      date: '2024-08-25',
      status: 'completed',
      totalJobs: 4,
      completedJobs: 4,
      estimatedDuration: '6 hours',
      totalDistance: '32 miles',
      startTime: '09:00 AM',
      estimatedEnd: '03:00 PM',
      currentLocation: 'Depot',
      jobs: [
        { id: 'JOB-007', address: '111 First St', status: 'completed' },
        { id: 'JOB-008', address: '222 Second St', status: 'completed' },
        { id: 'JOB-009', address: '333 Third St', status: 'completed' },
        { id: 'JOB-010', address: '444 Fourth St', status: 'completed' }
      ]
    },
    {
      id: 'ROUTE-003',
      name: 'East Springfield Emergency',
      technician: 'David Wilson',
      vehicle: 'VAN-003 (Ram ProMaster)',
      date: '2024-08-25',
      status: 'planned',
      totalJobs: 3,
      completedJobs: 0,
      estimatedDuration: '4 hours',
      totalDistance: '28 miles',
      startTime: '01:00 PM',
      estimatedEnd: '05:00 PM',
      currentLocation: 'Not started',
      jobs: [
        { id: 'JOB-011', address: '555 East Ave', status: 'pending' },
        { id: 'JOB-012', address: '666 Northeast St', status: 'pending' },
        { id: 'JOB-013', address: '777 Southeast Dr', status: 'pending' }
      ]
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'planned': 'bg-gray-100 text-gray-800 border-gray-200',
      'active': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'delayed': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const routeStats = {
    total: routes.length,
    active: routes.filter(r => r.status === 'active').length,
    completed: routes.filter(r => r.status === 'completed').length,
    planned: routes.filter(r => r.status === 'planned').length,
    totalJobs: routes.reduce((sum, route) => sum + route.totalJobs, 0),
    totalMiles: routes.reduce((sum, route) => sum + parseInt(route.totalDistance), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Route Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan and optimize technician routes for maximum efficiency</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calculator className="h-4 w-4 mr-2" />
            Route Optimizer
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Route
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Route className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Routes</p>
                <p className="text-2xl font-bold">{routeStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Navigation className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-blue-600">{routeStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Planned</p>
                <p className="text-2xl font-bold">{routeStats.planned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{routeStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold">{routeStats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Miles</p>
                <p className="text-2xl font-bold">{routeStats.totalMiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search routes, technicians, or route IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
              >
                <option value="all">All Statuses</option>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routes List */}
      <div className="grid gap-4">
        {filteredRoutes.map((route) => (
          <Card key={route.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">{route.name}</h3>
                    <Badge className={`${getStatusColor(route.status)} border`}>
                      {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Technician: {route.technician}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>Vehicle: {route.vehicle}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date: {route.date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Start: {route.startTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Est. End: {route.estimatedEnd}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Distance: {route.totalDistance}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-4 w-4" />
                      <span>Current: {route.currentLocation}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Job Progress: {route.completedJobs}/{route.totalJobs}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round((route.completedJobs / route.totalJobs) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(route.completedJobs / route.totalJobs) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Jobs List */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                      Jobs on Route ({route.jobs.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {route.jobs.map((job, index) => (
                        <div
                          key={job.id}
                          className={`text-xs p-2 rounded border ${
                            job.status === 'completed'
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : job.status === 'in-progress'
                              ? 'bg-blue-50 border-blue-200 text-blue-800'
                              : 'bg-gray-50 border-gray-200 text-gray-800'
                          }`}
                        >
                          <div className="font-medium">{job.id}</div>
                          <div className="text-xs opacity-75">{job.address}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Map
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No routes found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or create a new route.</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Route
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
