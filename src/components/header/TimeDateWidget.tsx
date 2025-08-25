"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Clock,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Plus,
  Users,
  Phone,
  Mail,
  Video,
  Building,
  Timer,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Star,
  Filter,
  Search,
  Settings,
  Bell,
  Clock3,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  UserCheck,
  UserX,
  PhoneCall,
  MessageSquare,
  VideoIcon,
  MapPinIcon,
  Car,
  Wrench,
  FileText,
  DollarSign,
  BarChart3,
  Activity,
  PieChart,
  Clock4,
  Sunrise,
  Sunset,
  Moon,
  Sun
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface ScheduledEvent {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder' | 'appointment' | 'call' | 'service' | 'follow-up' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  customer?: string;
  duration: number; // minutes
  location?: string;
  notes?: string;
  assignedTo?: string;
  revenue?: number;
  category?: string;
}

interface BusinessMetrics {
  todayAppointments: number;
  completedToday: number;
  overdueTasks: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  revenueToday: number;
  revenueThisWeek: number;
  activeCustomers: number;
}

interface TimeDateWidgetProps {
  className?: string;
  businessHours?: {
    start: string; // "09:00"
    end: string;   // "17:00"
    timezone: string;
  };
}

const TimeDateWidget: React.FC<TimeDateWidgetProps> = ({ 
  className = '',
  businessHours = { start: "09:00", end: "17:00", timezone: "America/New_York" }
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextEvent, setNextEvent] = useState<ScheduledEvent | null>(null);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'schedule' | 'metrics' | 'quick-actions'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const pathname = usePathname();

  // Memoize business hours to prevent unnecessary re-renders
  const memoizedBusinessHours = useMemo(() => businessHours, [
    businessHours.start,
    businessHours.end,
    businessHours.timezone
  ]);

  // Advanced mock data for CSRs and business owners
  const mockEvents: ScheduledEvent[] = useMemo(() => [
    {
      id: '1',
      title: 'HVAC Maintenance - ABC Corp',
      time: '10:00 AM',
      type: 'maintenance',
      priority: 'high',
      status: 'scheduled',
      customer: 'ABC Corporation',
      duration: 120,
      location: '123 Business Ave, Downtown',
      notes: 'Quarterly HVAC system check. Customer requested early morning slot.',
      assignedTo: 'Mike Johnson',
      revenue: 450,
      category: 'Maintenance'
    },
    {
      id: '2',
      title: 'Follow-up Call - Sarah Wilson',
      time: '2:30 PM',
      type: 'call',
      priority: 'medium',
      status: 'scheduled',
      customer: 'Sarah Wilson',
      duration: 30,
      notes: 'Follow up on invoice #1234 payment status',
      assignedTo: 'Lisa Chen',
      revenue: 0,
      category: 'Customer Service'
    },
    {
      id: '3',
      title: 'Emergency Plumbing - Downtown Office',
      time: '4:00 PM',
      type: 'service',
      priority: 'urgent',
      status: 'in-progress',
      customer: 'Downtown Office Complex',
      duration: 90,
      location: '456 Main St, Downtown',
      notes: 'Burst pipe in basement. Emergency response required.',
      assignedTo: 'Emergency Team',
      revenue: 800,
      category: 'Emergency'
    },
    {
      id: '4',
      title: 'Team Standup Meeting',
      time: '9:00 AM',
      type: 'meeting',
      priority: 'low',
      status: 'completed',
      customer: 'Internal',
      duration: 15,
      notes: 'Daily team coordination',
      assignedTo: 'All Staff',
      revenue: 0,
      category: 'Internal'
    },
    {
      id: '5',
      title: 'Quote Presentation - TechStart Inc',
      time: '11:30 AM',
      type: 'appointment',
      priority: 'high',
      status: 'scheduled',
      customer: 'TechStart Inc',
      duration: 60,
      location: 'TechStart Office',
      notes: 'Present annual service contract proposal',
      assignedTo: 'Sales Team',
      revenue: 0,
      category: 'Sales'
    }
  ], []);

  // Business metrics
  const businessMetrics: BusinessMetrics = useMemo(() => ({
    todayAppointments: 8,
    completedToday: 3,
    overdueTasks: 2,
    averageResponseTime: 12, // minutes
    customerSatisfaction: 4.8,
    revenueToday: 2450,
    revenueThisWeek: 12450,
    activeCustomers: 156
  }), []);

  // Memoize the check business hours function
  const checkBusinessHours = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const startParts = memoizedBusinessHours.start.split(':').map(Number);
    const endParts = memoizedBusinessHours.end.split(':').map(Number);
    
    if (startParts.length !== 2 || endParts.length !== 2) return;
    
    const [startHour, startMinute] = startParts;
    const [endHour, endMinute] = endParts;
    
    if (startHour === undefined || startMinute === undefined || 
        endHour === undefined || endMinute === undefined) return;
    
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    
    setIsBusinessOpen(currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes);
  }, [memoizedBusinessHours.start, memoizedBusinessHours.end]);

  // Memoize the find next event function
  const findNextEvent = useCallback(() => {
    const now = new Date();
    
    const next = mockEvents.find(event => {
      const eventTime = new Date();
      const timeParts = event.time.split(' ');
      if (timeParts.length !== 2) return false;
      
      const [time, period] = timeParts;
      if (!time || !period) return false;
      
      const timeComponents = time.split(':').map(Number);
      if (timeComponents.length !== 2) return false;
      
      const [hours, minutes] = timeComponents;
      if (hours === undefined || minutes === undefined) return false;
      
      eventTime.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours, minutes, 0, 0);
      return eventTime > now && event.status === 'scheduled';
    });
    
    setNextEvent(next || null);
  }, [mockEvents]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Initial checks
    checkBusinessHours();
    findNextEvent();

    return () => clearInterval(timer);
  }, [checkBusinessHours, findNextEvent]);

  // Update business hours and next event when time changes
  useEffect(() => {
    checkBusinessHours();
    findNextEvent();
  }, [currentTime, checkBusinessHours, findNextEvent]);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getBusinessStatusIcon = useCallback(() => {
    if (isBusinessOpen) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  }, [isBusinessOpen]);

  const getBusinessStatusText = useCallback(() => {
    return isBusinessOpen ? 'Open' : 'Closed';
  }, [isBusinessOpen]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'appointment': return <CalendarCheck className="h-4 w-4" />;
      case 'service': return <Wrench className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'follow-up': return <MessageSquare className="h-4 w-4" />;
      case 'task': return <Target className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700';
      case 'in-progress': return 'bg-blue-50 text-blue-700';
      case 'overdue': return 'bg-red-50 text-red-700';
      case 'cancelled': return 'bg-gray-50 text-gray-700';
      default: return 'bg-yellow-50 text-yellow-700';
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return mockEvents;
    return mockEvents.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mockEvents, searchQuery]);

  const todayEvents = useMemo(() => 
    filteredEvents.filter(event => event.status !== 'cancelled'), 
    [filteredEvents]
  );

  const overdueEvents = useMemo(() => 
    filteredEvents.filter(event => event.status === 'overdue'), 
    [filteredEvents]
  );

  const upcomingEvents = useMemo(() => 
    filteredEvents.filter(event => event.status === 'scheduled').slice(0, 3), 
    [filteredEvents]
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Time Display */}
      <div className="text-center space-y-2">
        <div className="text-3xl font-bold text-foreground">{formatTime(currentTime)}</div>
        <div className="text-sm text-muted-foreground">{formatDate(currentTime)}</div>
        <div className="text-xs text-muted-foreground">{memoizedBusinessHours.timezone.split('/').pop()}</div>
      </div>

      {/* Business Status */}
      <div className="flex items-center justify-center space-x-2 p-3 bg-muted/30 rounded-lg">
        {getBusinessStatusIcon()}
        <span className="text-sm font-medium">Business {getBusinessStatusText()}</span>
        <span className="text-xs text-muted-foreground">
          {memoizedBusinessHours.start} - {memoizedBusinessHours.end}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{businessMetrics.todayAppointments}</div>
          <div className="text-xs text-muted-foreground">Appointments</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">${businessMetrics.revenueToday.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{businessMetrics.overdueTasks}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </div>
      </div>

      {/* Next Event */}
      {nextEvent && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            {getEventIcon(nextEvent.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium truncate">{nextEvent.title}</p>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(nextEvent.priority)}`}>
                  {nextEvent.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {nextEvent.customer} • {nextEvent.duration}min
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{nextEvent.time}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {todayEvents.map((event) => (
          <div key={event.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(event.priority)}`}>
                    {event.priority}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(event.status)}`}>
                    {event.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {event.customer} • {event.duration}min
                </p>
                {event.location && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {event.location}
                  </p>
                )}
                {event.revenue && event.revenue > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ${event.revenue}
                  </p>
                )}
              </div>
              <div className="text-right ml-3">
                <p className="text-sm font-medium">{event.time}</p>
                <p className="text-xs text-muted-foreground">{event.assignedTo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Performance</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Response Time</span>
            <span className="text-sm font-medium">{businessMetrics.averageResponseTime} min</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Customer Rating</span>
            <span className="text-sm font-medium">{businessMetrics.customerSatisfaction}/5.0</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${businessMetrics.customerSatisfaction * 20}%` }}></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Task Completion</span>
            <span className="text-sm font-medium">{Math.round((businessMetrics.completedToday / businessMetrics.todayAppointments) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(businessMetrics.completedToday / businessMetrics.todayAppointments) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-sm font-bold">${businessMetrics.revenueThisWeek.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Customers</p>
              <p className="text-sm font-bold">{businessMetrics.activeCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h3 className="text-sm font-medium mb-3">Business Hours</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sunrise className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Open</span>
            </div>
            <span className="text-sm font-medium">{memoizedBusinessHours.start}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sunset className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Close</span>
            </div>
            <span className="text-sm font-medium">{memoizedBusinessHours.end}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickActions = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-medium">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="sm" className="h-12 flex-col space-y-1">
          <Plus className="h-4 w-4" />
          <span className="text-xs">New Appointment</span>
        </Button>
        <Button variant="outline" size="sm" className="h-12 flex-col space-y-1">
          <Phone className="h-4 w-4" />
          <span className="text-xs">Schedule Call</span>
        </Button>
        <Button variant="outline" size="sm" className="h-12 flex-col space-y-1">
          <Wrench className="h-4 w-4" />
          <span className="text-xs">Service Request</span>
        </Button>
        <Button variant="outline" size="sm" className="h-12 flex-col space-y-1">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">Follow Up</span>
        </Button>
        <Button variant="outline" size="sm" className="h-12 flex-col space-y-1">
          <FileText className="h-4 w-4" />
          <span className="text-xs">Create Quote</span>
        </Button>
        <Button variant="outline" size="sm" className="h-12 flex-col space-y-1">
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs">View Reports</span>
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground">Recent Activity</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Appointment completed - HVAC Maintenance</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>New customer registered - TechStart Inc</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Payment received - Invoice #1234</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`relative h-7 w-7 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 flex items-center justify-center ${className}`}
          title="Time & Date"
        >
          <Clock className="w-3.5 h-3.5 text-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-6 z-[10001] max-h-[600px] overflow-y-auto">
        <DropdownMenuLabel className="font-normal p-0 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Time & Schedule</p>
                <p className="text-xs text-muted-foreground">Manage your day</p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={selectedView === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedView('overview')}
            className="flex-1 text-xs"
          >
            Overview
          </Button>
          <Button
            variant={selectedView === 'schedule' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedView('schedule')}
            className="flex-1 text-xs"
          >
            Schedule
          </Button>
          <Button
            variant={selectedView === 'metrics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedView('metrics')}
            className="flex-1 text-xs"
          >
            Metrics
          </Button>
          <Button
            variant={selectedView === 'quick-actions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedView('quick-actions')}
            className="flex-1 text-xs"
          >
            Actions
          </Button>
        </div>

        {/* Content based on selected view */}
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'schedule' && renderSchedule()}
        {selectedView === 'metrics' && renderMetrics()}
        {selectedView === 'quick-actions' && renderQuickActions()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TimeDateWidget;
