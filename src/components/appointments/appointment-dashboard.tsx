'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { 
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  X,
  Edit,
  Trash2,
  Grid,
  List,
  CalendarDays,
  RefreshCw,
  Bell,
  Settings
} from 'lucide-react';

import { useOfflineAppointments } from '@/lib/offline-appointment-manager';
import type { 
  AppointmentMetadata, 
  AppointmentFilter, 
  AppointmentSearchOptions,
  AppointmentStatus,
  AppointmentType,
  AppointmentPriority,
  AppointmentLocation 
} from '@/lib/offline-appointment-manager';

interface AppointmentDashboardProps {
  onCreateAppointment?: () => void;
  onEditAppointment?: (appointmentId: string) => void;
  onViewAppointment?: (appointmentId: string) => void;
  selectedDate?: Date;
  viewMode?: 'calendar' | 'list' | 'grid';
}

export default function AppointmentDashboard({
  onCreateAppointment,
  onEditAppointment,
  onViewAppointment,
  selectedDate = new Date(),
  viewMode: initialViewMode = 'calendar'
}: AppointmentDashboardProps) {
  const [appointments, setAppointments] = useState<AppointmentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'grid'>(initialViewMode);
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [searchQuery, setSearchQuery] = useState(');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | '>(');
  const [typeFilter, setTypeFilter] = useState<AppointmentType | '>(');
  const [staffFilter, setStaffFilter] = useState(');
  const [showFilters, setShowFilters] = useState(false);
  const [statistics, setStatistics] = useState<unknown>(null);

  const appointmentManager = useOfflineAppointments();

  useEffect(() => {
    loadAppointments();
    loadStatistics();
  }, [currentDate, searchQuery, statusFilter, typeFilter, staffFilter]);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const filter: AppointmentFilter = {
        searchQuery: searchQuery || undefined,
        status: statusFilter ? [statusFilter] : undefined,
        type: typeFilter ? [typeFilter] : undefined,
        assignedStaff: staffFilter ? [staffFilter] : undefined
      };

      // For calendar view, load appointments for the current month
      if (viewMode === 'calendar') {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        filter.startDate = startOfMonth;
        filter.endDate = endOfMonth;
      } else {
        // For list/grid view, load appointments for the current week
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        filter.startDate = startOfWeek;
        filter.endDate = endOfWeek;
      }

      const options: AppointmentSearchOptions = {
        sortBy: 'startTime',
        sortOrder: 'asc',
        limit: 100
      };

      const result = await appointmentManager.searchAppointments(filter, options);
      setAppointments(result.appointments);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await appointmentManager.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentManager.updateStatus(appointmentId, newStatus);
      await loadAppointments();
      await loadStatistics();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await appointmentManager.deleteAppointment(appointmentId);
      await loadAppointments();
      await loadStatistics();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete appointment');
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    const colors = {
      scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
      in_progress: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      no_show: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      rescheduled: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      pending_confirmation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: AppointmentPriority) => {
    const colors = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      normal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
      emergency: 'bg-red-600/30 text-red-300 border-red-600/40'
    };
    return colors[priority];
  };

  const getLocationIcon = (location: AppointmentLocation) => {
    switch (location) {
      case 'office': return '🏢';
      case 'on_site': return '🏠';
      case 'virtual': return '💻';
      case 'customer_location': return '📍';
      case 'third_party': return '🏢';
      default: return '📍';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appt => {
      const apptDate = new Date(appt.startTime);
      return apptDate.toDateString() === date.toDateString();
    });
  };

  const getTodayAppointments = () => {
    const today = new Date();
    return getAppointmentsForDate(today);
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return appointments.filter(appt => {
      const apptDate = new Date(appt.startTime);
      return apptDate > today;
    }).slice(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Appointments</h2>
          <p className="text-neutral-400">Manage and schedule appointments</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <div className="flex border rounded-md bg-neutral-800 border-neutral-700">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-r-none"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={onCreateAppointment}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Today</p>
                  <p className="text-2xl font-bold text-white">{statistics.todayAppointments}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">This Week</p>
                  <p className="text-2xl font-bold text-white">{statistics.weekAppointments}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{statistics.total}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Conflicts</p>
                  <p className="text-2xl font-bold text-white">{statistics.conflicts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | ')}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as AppointmentType | ')}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Filter by staff..."
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Mini Calendar */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
                className="rounded-md border-0"
                modifiers={{
                  hasAppointments: (date) => getAppointmentsForDate(date).length > 0
                }}
                modifiersClassNames={{
                  hasAppointments: 'bg-blue-500/20 text-blue-400'
                }}
              />
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {getTodayAppointments().length === 0 ? (
                <p className="text-neutral-400 text-sm">No appointments today</p>
              ) : (
                <div className="space-y-2">
                  {getTodayAppointments().slice(0, 3).map(appointment => (
                    <div key={appointment.id} className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{appointment.title}</p>
                        <p className="text-neutral-400 text-xs">
                          {formatTime(appointment.startTime)} - {appointment.customerName}
                        </p>
                      </div>
                      <Badge variant="outline" className={'text-xs ${getStatusColor(appointment.status)}'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                  {getTodayAppointments().length > 3 && (
                    <p className="text-neutral-400 text-xs text-center">
                      +{getTodayAppointments().length - 3} more appointments
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              {getUpcomingAppointments().length === 0 ? (
                <p className="text-neutral-400 text-sm">No upcoming appointments</p>
              ) : (
                <div className="space-y-2">
                  {getUpcomingAppointments().map(appointment => (
                    <div key={appointment.id} className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{appointment.title}</p>
                        <p className="text-neutral-400 text-xs">
                          {appointment.startTime.toLocaleDateString()} - {appointment.customerName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main View */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : viewMode === 'calendar' ? (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const prev = new Date(currentDate);
                        prev.setMonth(prev.getMonth() - 1);
                        setCurrentDate(prev);
                      }}
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const next = new Date(currentDate);
                        next.setMonth(next.getMonth() + 1);
                        setCurrentDate(next);
                      }}
                    >
                      →
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-neutral-400 text-sm font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6);
                    const dayAppointments = getAppointmentsForDate(date);
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={i}
                        className={'min-h-24 p-1 border border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors ${
                          !isCurrentMonth ? 'opacity-30' : '
                        } ${isToday ? 'bg-blue-500/10 border-blue-500/30' : '}'}
                        onClick={() => setCurrentDate(date)}
                      >
                        <div className="text-xs text-neutral-400 mb-1">{date.getDate()}</div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map(appointment => (
                            <div
                              key={appointment.id}
                              className="text-xs p-1 bg-blue-500/20 text-blue-400 rounded truncate cursor-pointer hover:bg-blue-500/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewAppointment?.(appointment.id);
                              }}
                            >
                              {formatTime(appointment.startTime)} {appointment.title}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-neutral-500">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : viewMode === 'list' ? (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Appointments List</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-neutral-400">No appointments found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map(appointment => (
                      <Card key={appointment.id} className="bg-neutral-800 border-neutral-700 hover:border-neutral-600 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-white font-medium truncate">{appointment.title}</h3>
                                <Badge variant="outline" className={getStatusColor(appointment.status)}>
                                  {appointment.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                                  {appointment.priority}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-neutral-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {appointment.startTime.toLocaleDateString()} {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{appointment.customerName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{getLocationIcon(appointment.location)} {appointment.location.replace('_', ' ')}</span>
                                </div>
                              </div>
                              
                              {appointment.description && (
                                <p className="text-neutral-400 text-sm mt-2 truncate">{appointment.description}</p>
                              )}
                            </div>
                            
                            <div className="flex gap-1 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditAppointment?.(appointment.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">No appointments found</p>
                </div>
              ) : (
                appointments.map(appointment => (
                  <Card key={appointment.id} className="bg-neutral-900 border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-white text-base truncate">{appointment.title}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditAppointment?.(appointment.id);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAppointment(appointment.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3" onClick={() => onViewAppointment?.(appointment.id)}>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className={getStatusColor(appointment.status)}>
                          {appointment.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                          {appointment.priority}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Clock className="h-3 w-3" />
                          <span>{appointment.startTime.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-400">
                          <User className="h-3 w-3" />
                          <span className="truncate">{appointment.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-400">
                          <MapPin className="h-3 w-3" />
                          <span>{getLocationIcon(appointment.location)} {appointment.location.replace('_', ' ')}</span>
                        </div>
                      </div>
                      
                      {appointment.assignedStaff.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {appointment.assignedStaff.slice(0, 2).map(staff => (
                            <Badge key={staff} variant="outline" className="text-xs">
                              {staff}
                            </Badge>
                          ))}
                          {appointment.assignedStaff.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{appointment.assignedStaff.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}