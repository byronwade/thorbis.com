'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  MoreHorizontal,
  Filter,
  Settings,
  RefreshCw
} from 'lucide-react';

import { useOfflineAppointments } from '@/lib/offline-appointment-manager';
import type { 
  AppointmentMetadata,
  AppointmentStatus,
  AppointmentPriority,
  AppointmentLocation
} from '@/lib/offline-appointment-manager';

interface AppointmentCalendarProps {
  onCreateAppointment?: (date?: Date, time?: string) => void;
  onEditAppointment?: (appointmentId: string) => void;
  onViewAppointment?: (appointmentId: string) => void;
  selectedStaff?: string[];
  viewType?: 'month' | 'week' | 'day';
}

export default function AppointmentCalendar({
  onCreateAppointment,
  onEditAppointment,
  onViewAppointment,
  selectedStaff = [],
  viewType: initialViewType = 'month'
}: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<AppointmentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>(initialViewType);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentMetadata | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [staffFilter, setStaffFilter] = useState<string[]>(selectedStaff);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus[]>([]);

  const appointmentManager = useOfflineAppointments();

  useEffect(() => {
    loadAppointments();
  }, [currentDate, viewType, staffFilter, statusFilter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      
      const result = await appointmentManager.searchAppointments({
        startDate,
        endDate,
        assignedStaff: staffFilter.length > 0 ? staffFilter : undefined,
        status: statusFilter.length > 0 ? statusFilter : undefined
      }, {
        sortBy: 'startTime',
        sortOrder: 'asc',
        limit: 200
      });

      setAppointments(result.appointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    let startDate: Date;
    let endDate: Date;

    switch (viewType) {
      case 'day':
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'month':
      default:
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate.toDateString() === date.toDateString() &&
             appointmentDate.getHours() === hour;
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
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

  const getPriorityIndicator = (priority: AppointmentPriority) => {
    switch (priority) {
      case 'emergency': return '🔴';
      case 'urgent': return '🟠';
      case 'high': return '🟡';
      case 'normal': return '🟢';
      case 'low': return '⚪';
      default: return '🟢';
    }
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

  const handleAppointmentClick = (appointment: AppointmentMetadata) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleTimeSlotClick = (date: Date, hour?: number) => {
    const timeString = hour !== undefined ? '${hour.toString().padStart(2, '0')}:00' : undefined;
    onCreateAppointment?.(date, timeString);
  };

  const renderMonthView = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfMonth.getDay());

    const calendarDays = [];
    const currentCalendarDate = new Date(firstDayOfCalendar);

    for (const week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dayAppointments = getAppointmentsForDate(currentCalendarDate);
        const isCurrentMonth = currentCalendarDate.getMonth() === currentDate.getMonth();
        const isToday = currentCalendarDate.toDateString() === new Date().toDateString();

        weekDays.push(
          <div
            key={currentCalendarDate.toISOString()}
            className={'min-h-32 p-2 border border-neutral-700 cursor-pointer hover:bg-neutral-800 transition-colors ${
              !isCurrentMonth ? 'opacity-30' : '
            } ${isToday ? 'bg-blue-500/10 border-blue-500/30' : `}'}
            onClick={() => handleTimeSlotClick(new Date(currentCalendarDate))}
          >
            <div className="text-sm text-neutral-400 mb-1">{currentCalendarDate.getDate()}</div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map(appointment => (
                <div
                  key={appointment.id}
                  className={'text-xs p-1 rounded truncate cursor-pointer ${getStatusColor(appointment.status)} hover:opacity-80'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAppointmentClick(appointment);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{getPriorityIndicator(appointment.priority)}</span>
                    <span>{formatTime(appointment.startTime)}</span>
                    <span className="truncate">{appointment.title}</span>
                  </div>
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-neutral-500">
                  +{dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );

        currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
      }
      calendarDays.push(
        <div key={week} className="grid grid-cols-7 gap-1">
          {weekDays}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-neutral-400 text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        {calendarDays}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = [];
    for (const i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    const timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      timeSlots.push(hour);
    }

    return (
      <div className="grid grid-cols-8 gap-1">
        {/* Time column */}
        <div className="space-y-1">
          <div className="h-12"></div> {/* Header spacer */}
          {timeSlots.map(hour => (
            <div key={hour} className="h-16 text-xs text-neutral-400 p-1">
              {hour === 12 ? '12 PM` : hour > 12 ? `${hour - 12} PM` : '${hour} AM'}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map(day => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toISOString()} className="space-y-1">
              <div className={'h-12 p-2 text-center border border-neutral-700 ${isToday ? 'bg-blue-500/10 border-blue-500/30' : '}'}>
                <div className="text-xs text-neutral-400">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm text-white">{day.getDate()}</div>
              </div>
              
              {timeSlots.map(hour => {
                const slotAppointments = getAppointmentsForTimeSlot(day, hour);
                return (
                  <div
                    key={hour}
                    className="h-16 border border-neutral-700 cursor-pointer hover:bg-neutral-800 transition-colors p-1"
                    onClick={() => handleTimeSlotClick(day, hour)}
                  >
                    {slotAppointments.map(appointment => (
                      <div
                        key={appointment.id}
                        className={'text-xs p-1 rounded mb-1 cursor-pointer ${getStatusColor(appointment.status)} hover:opacity-80'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(appointment);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>{getPriorityIndicator(appointment.priority)}</span>
                          <span className="truncate">{appointment.title}</span>
                        </div>
                        <div className="text-xs opacity-80">{appointment.customerName}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      timeSlots.push(hour);
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          {timeSlots.map(hour => {
            const slotAppointments = getAppointmentsForTimeSlot(currentDate, hour);
            return (
              <div key={hour} className="flex items-start gap-4">
                <div className="w-20 text-sm text-neutral-400 pt-2">
                  {hour === 12 ? '12:00 PM` : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM'}
                </div>
                <div
                  className="flex-1 min-h-16 border border-neutral-700 rounded cursor-pointer hover:bg-neutral-800 transition-colors p-2"
                  onClick={() => handleTimeSlotClick(currentDate, hour)}
                >
                  {slotAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className={'p-2 rounded mb-2 cursor-pointer ${getStatusColor(appointment.status)} hover:opacity-80'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppointmentClick(appointment);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getPriorityIndicator(appointment.priority)}</span>
                          <span className="font-medium">{appointment.title}</span>
                        </div>
                        <div className="text-xs">
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </div>
                      </div>
                      <div className="text-sm opacity-80 mt-1">{appointment.customerName}</div>
                      <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
                        <span>{getLocationIcon(appointment.location)}</span>
                        <span>{appointment.location.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day summary */}
        <div className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Day Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Appointments:</span>
                  <span className="text-white">{getAppointmentsForDate(currentDate).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Confirmed:</span>
                  <span className="text-white">
                    {getAppointmentsForDate(currentDate).filter(a => a.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">In Progress:</span>
                  <span className="text-white">
                    {getAppointmentsForDate(currentDate).filter(a => a.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Completed:</span>
                  <span className="text-white">
                    {getAppointmentsForDate(currentDate).filter(a => a.status === 'completed').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    switch (viewType) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return '${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}';
      case 'month':
      default:
        return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="text-xl font-bold text-white">{getViewTitle()}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Select value={viewType} onValueChange={(value: unknown) => setViewType(value)}>
            <SelectTrigger className="w-32 bg-neutral-800 border-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={loadAppointments} disabled={loading}>
            <RefreshCw className={'h-4 w-4 ${loading ? 'animate-spin' : '}'} />
          </Button>

          <Button onClick={() => onCreateAppointment?.()}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {viewType === 'month' && renderMonthView()}
              {viewType === 'week' && renderWeekView()}
              {viewType === 'day' && renderDayView()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
          <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedAppointment.title}
              </DialogTitle>
              <DialogDescription>
                Appointment #{selectedAppointment.appointmentNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Status and Priority */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(selectedAppointment.status)}>
                  {selectedAppointment.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getPriorityIndicator(selectedAppointment.priority)} {selectedAppointment.priority}
                </Badge>
              </div>

              {/* Time and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-neutral-400" />
                  <span className="text-white">{selectedAppointment.startTime.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <span className="text-white">
                    {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div>
                <h4 className="text-white font-medium mb-2">Customer</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-400" />
                    <span className="text-white">{selectedAppointment.customerName}</span>
                  </div>
                  {selectedAppointment.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-neutral-400" />
                      <span className="text-white">{selectedAppointment.customerPhone}</span>
                    </div>
                  )}
                  {selectedAppointment.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-neutral-400" />
                      <span className="text-white">{selectedAppointment.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-white font-medium mb-2">Location</h4>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span className="text-white">
                    {getLocationIcon(selectedAppointment.location)} {selectedAppointment.location.replace('_', ' ')}
                  </span>
                </div>
                {selectedAppointment.serviceLocation && (
                  <p className="text-neutral-400 text-sm mt-1 ml-6">{selectedAppointment.serviceLocation}</p>
                )}
              </div>

              {/* Description */}
              {selectedAppointment.description && (
                <div>
                  <h4 className="text-white font-medium mb-2">Description</h4>
                  <p className="text-neutral-400">{selectedAppointment.description}</p>
                </div>
              )}

              {/* Assigned Staff */}
              {selectedAppointment.assignedStaff.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Assigned Staff</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedAppointment.assignedStaff.map(staff => (
                      <Badge key={staff} variant="outline" className="text-xs">
                        {staff}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-neutral-800">
                <Button onClick={() => onEditAppointment?.(selectedAppointment.id)}>
                  Edit Appointment
                </Button>
                <Button variant="outline" onClick={() => setShowAppointmentDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}