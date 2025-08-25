'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, Filter, Phone, PhoneCall, User, Clock, 
  Calendar, MapPin, AlertTriangle, CheckCircle, Play,
  Pause, Volume2, MessageSquare, Edit, Eye
} from 'lucide-react';

export default function ServiceCallsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const serviceCalls = [
    {
      id: 'CALL-001', customer: 'Johnson Manufacturing', phone: '(555) 123-4567',
      type: 'Emergency', status: 'completed', priority: 'high',
      startTime: '2024-08-24 14:30', endTime: '2024-08-24 14:45',
      duration: '15 min', agent: 'Sarah Chen', 
      issue: 'HVAC system complete failure - no cooling in server room',
      resolution: 'Dispatched emergency technician Mike Rodriguez - ETA 30 minutes',
      followUp: 'Scheduled follow-up for system inspection',
      recording: 'available'
    },
    {
      id: 'CALL-002', customer: 'Thompson Residence', phone: '(555) 234-5678', 
      type: 'Appointment', status: 'in-progress', priority: 'medium',
      startTime: '2024-08-25 10:15', endTime: null,
      duration: '12 min', agent: 'Mike Rodriguez',
      issue: 'Schedule bathroom plumbing renovation consultation',
      resolution: 'Appointment scheduled for 2024-08-27 at 2:00 PM',
      followUp: 'Send confirmation email with preparation checklist',
      recording: 'in-progress'
    },
    {
      id: 'CALL-003', customer: 'Davis Electric Corp', phone: '(555) 345-6789',
      type: 'Quote Request', status: 'pending', priority: 'low', 
      startTime: '2024-08-25 09:20', endTime: '2024-08-25 09:35',
      duration: '15 min', agent: 'David Wilson',
      issue: 'Request quote for electrical panel upgrade - 200A service',
      resolution: 'Gathering information for detailed quote preparation',
      followUp: 'Site visit required - scheduling coordinator will call back',
      recording: 'available'
    }
  ];

  const stats = {
    total: serviceCalls.length,
    completed: serviceCalls.filter(c => c.status === 'completed').length,
    inProgress: serviceCalls.filter(c => c.status === 'in-progress').length,
    pending: serviceCalls.filter(c => c.status === 'pending').length,
    avgDuration: '14 min'
  };

  const getStatusColor = (status) => ({
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800', 
    pending: 'bg-yellow-100 text-yellow-800'
  }[status] || 'bg-gray-100 text-gray-800');

  const getPriorityColor = (priority) => ({
    high: 'text-red-600',
    medium: 'text-yellow-600', 
    low: 'text-green-600'
  }[priority] || 'text-gray-600');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Calls</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer service calls and phone interactions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" />Call Queue</Button>
          <Button><Plus className="h-4 w-4 mr-2" />Log Call</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Calls', value: stats.total, icon: PhoneCall, color: 'text-blue-600' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600' },
          { label: 'In Progress', value: stats.inProgress, icon: Play, color: 'text-blue-600' },
          { label: 'Pending', value: stats.pending, icon: Pause, color: 'text-yellow-600' },
          { label: 'Avg Duration', value: stats.avgDuration, icon: Clock, color: 'text-purple-600' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search calls, customers, issues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2">
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {serviceCalls.filter(call => 
          call.customer.toLowerCase().includes(searchTerm.toLowerCase()) && 
          (statusFilter === 'all' || call.status === statusFilter)
        ).map((call) => (
          <Card key={call.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold">{call.customer}</h3>
                    <Badge className={getStatusColor(call.status)}>{call.status.replace('-', ' ')}</Badge>
                    <Badge variant="outline">{call.type}</Badge>
                    <span className={`text-sm font-medium ${getPriorityColor(call.priority)}`}>
                      {call.priority} priority
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{call.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Agent: {call.agent}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {call.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{call.startTime}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">Issue: </span>
                      <span className="text-gray-600 dark:text-gray-400">{call.issue}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">Resolution: </span>
                      <span className="text-gray-600 dark:text-gray-400">{call.resolution}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">Follow-up: </span>
                      <span className="text-gray-600 dark:text-gray-400">{call.followUp}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {call.recording === 'available' && (
                    <Button variant="outline" size="sm">
                      <Volume2 className="h-4 w-4 mr-1" />Play Recording
                    </Button>
                  )}
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Details</Button>
                  <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" />Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
