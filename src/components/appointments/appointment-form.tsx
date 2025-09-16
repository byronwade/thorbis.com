'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Save,
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Bell,
  Repeat,
  Video,
  Users
} from 'lucide-react';

import { useOfflineAppointments } from '@/lib/offline-appointment-manager';
import type { 
  AppointmentMetadata,
  AppointmentType,
  AppointmentPriority,
  AppointmentLocation,
  AppointmentCategory,
  RecurringPattern,
  AppointmentReminder
} from '@/lib/offline-appointment-manager';

interface AppointmentFormProps {
  appointment?: AppointmentMetadata;
  onSave: (appointmentId: string) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
  preselectedDate?: Date;
  preselectedTime?: string;
}

export default function AppointmentForm({
  appointment,
  onSave,
  onCancel,
  mode = 'create',
  preselectedDate,
  preselectedTime
}: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    title: ',
    description: ',
    type: 'consultation' as AppointmentType,
    category: 'office_visit' as AppointmentCategory,
    priority: 'normal' as AppointmentPriority,
    location: 'office' as AppointmentLocation,
    
    // Date and time
    date: ',
    startTime: ',
    endTime: ',
    allDay: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Customer
    customerName: ',
    customerEmail: ',
    customerPhone: ',
    
    // Location details
    serviceLocation: ',
    meetingUrl: ',
    
    // Staff
    assignedStaff: [] as string[],
    
    // Service details
    serviceId: ',
    serviceName: ',
    estimatedDuration: 60, // minutes
    cost: 0,
    
    // Recurring
    isRecurring: false,
    recurringType: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurringInterval: 1,
    recurringEndDate: ',
    recurringOccurrences: 0,
    daysOfWeek: [] as number[],
    
    // Other
    tags: [] as string[],
    notes: '
  });

  const [reminders, setReminders] = useState<Omit<AppointmentReminder, 'id' | 'sent' | 'sentAt'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [availableStaff] = useState(['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson']);

  const appointmentManager = useOfflineAppointments();

  useEffect(() => {
    if (appointment && mode === 'edit') {
      setFormData({
        title: appointment.title,
        description: appointment.description,
        type: appointment.type,
        category: appointment.category,
        priority: appointment.priority,
        location: appointment.location,
        date: appointment.startTime.toISOString().split('T')[0],
        startTime: appointment.startTime.toTimeString().slice(0, 5),
        endTime: appointment.endTime.toTimeString().slice(0, 5),
        allDay: appointment.allDay,
        timeZone: appointment.timeZone,
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail || ',
        customerPhone: appointment.customerPhone || ',
        serviceLocation: appointment.serviceLocation || ',
        meetingUrl: appointment.meetingUrl || ',
        assignedStaff: appointment.assignedStaff,
        serviceId: appointment.serviceId || ',
        serviceName: appointment.serviceName || ',
        estimatedDuration: appointment.estimatedDuration,
        cost: appointment.cost || 0,
        isRecurring: appointment.isRecurring,
        recurringType: appointment.recurringPattern?.type || 'weekly',
        recurringInterval: appointment.recurringPattern?.interval || 1,
        recurringEndDate: appointment.recurringPattern?.endDate?.toISOString().split('T')[0] || ',
        recurringOccurrences: appointment.recurringPattern?.occurrences || 0,
        daysOfWeek: appointment.recurringPattern?.daysOfWeek || [],
        tags: appointment.tags,
        notes: appointment.notes
      });

      setReminders(appointment.reminders.map(r => ({
        type: r.type,
        minutesBefore: r.minutesBefore,
        recipientType: r.recipientType,
        message: r.message
      })));
    } else {
      // Set preselected values for new appointments
      if (preselectedDate) {
        setFormData(prev => ({
          ...prev,
          date: preselectedDate.toISOString().split('T')[0]
        }));
      }
      if (preselectedTime) {
        setFormData(prev => ({
          ...prev,
          startTime: preselectedTime,
          endTime: calculateEndTime(preselectedTime, 60)
        }));
      }
    }
  }, [appointment, mode, preselectedDate, preselectedTime]);

  useEffect(() => {
    // Auto-calculate end time when start time or duration changes
    if (formData.startTime && formData.estimatedDuration) {
      const endTime = calculateEndTime(formData.startTime, formData.estimatedDuration);
      setFormData(prev => ({ ...prev, endTime }));
    }
  }, [formData.startTime, formData.estimatedDuration]);

  useEffect(() => {
    // Check for conflicts when date, time, or staff changes
    if (formData.date && formData.startTime && formData.endTime && formData.assignedStaff.length > 0) {
      checkConflicts();
    }
  }, [formData.date, formData.startTime, formData.endTime, formData.assignedStaff]);

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate.toTimeString().slice(0, 5);
  };

  const checkConflicts = async () => {
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}');
      const endDateTime = new Date('${formData.date}T${formData.endTime}');

      const conflictResults = await appointmentManager.checkConflicts({
        startTime: startDateTime,
        endTime: endDateTime,
        assignedStaff: formData.assignedStaff,
        location: formData.location,
        serviceLocation: formData.serviceLocation,
        excludeAppointmentId: appointment?.id
      });

      setConflicts(conflictResults);
    } catch (error) {
      console.error('Failed to check conflicts:', error);
    }
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStaffToggle = (staff: string) => {
    setFormData(prev => ({
      ...prev,
      assignedStaff: prev.assignedStaff.includes(staff)
        ? prev.assignedStaff.filter(s => s !== staff)
        : [...prev.assignedStaff, staff]
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const addReminder = () => {
    setReminders(prev => [...prev, {
      type: 'email',
      minutesBefore: 60,
      recipientType: 'customer',
      message: '
    }]);
  };

  const updateReminder = (index: number, field: string, value: unknown) => {
    setReminders(prev => prev.map((reminder, i) => 
      i === index ? { ...reminder, [field]: value } : reminder
    ));
  };

  const removeReminder = (index: number) => {
    setReminders(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.customerName.trim()) {
        throw new Error('Customer name is required');
      }
      if (!formData.date) {
        throw new Error('Date is required');
      }
      if (!formData.startTime) {
        throw new Error('Start time is required');
      }
      if (formData.assignedStaff.length === 0) {
        throw new Error('At least one staff member must be assigned');
      }

      // Check for critical conflicts
      const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
      if (criticalConflicts.length > 0) {
        throw new Error('Cannot save appointment: Critical conflicts detected`);
      }

      const startDateTime = new Date(`${formData.date}T${formData.startTime}');
      const endDateTime = new Date('${formData.date}T${formData.endTime}');

      const appointmentData = {
        title: formData.title,
        description: formData.description,
        startTime: startDateTime,
        endTime: endDateTime,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        assignedStaff: formData.assignedStaff,
        location: formData.location,
        serviceLocation: formData.serviceLocation || undefined,
        type: formData.type,
        category: formData.category,
        priority: formData.priority,
        serviceId: formData.serviceId || undefined,
        serviceName: formData.serviceName || undefined,
        cost: formData.cost || undefined,
        tags: formData.tags,
        notes: formData.notes,
        reminders,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.isRecurring ? {
          type: formData.recurringType,
          interval: formData.recurringInterval,
          daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek : undefined,
          endDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
          occurrences: formData.recurringOccurrences || undefined,
          exceptions: []
        } : undefined
      };

      let appointmentId: string;

      if (mode === 'edit' && appointment) {
        await appointmentManager.updateAppointment(appointment.id, appointmentData);
        appointmentId = appointment.id;
      } else {
        appointmentId = await appointmentManager.createAppointment(appointmentData);
      }

      onSave(appointmentId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save appointment');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {mode === 'edit' ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          {appointment && (
            <p className="text-neutral-400">#{appointment.appointmentNumber}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Scheduling Conflicts Detected</p>
              <ul className="text-yellow-400 text-sm mt-1 space-y-1">
                {conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict.description}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-neutral-400">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Appointment title"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-neutral-400">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about the appointment"
                  className="bg-neutral-800 border-neutral-700"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type" className="text-neutral-400">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>

                <div>
                  <Label htmlFor="category" className="text-neutral-400">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_call">Service Call</SelectItem>
                      <SelectItem value="office_visit">Office Visit</SelectItem>
                      <SelectItem value="virtual_meeting">Virtual Meeting</SelectItem>
                      <SelectItem value="site_visit">Site Visit</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-neutral-400">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date" className="text-neutral-400">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>

                <div>
                  <Label htmlFor="startTime" className="text-neutral-400">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>

                <div>
                  <Label htmlFor="endTime" className="text-neutral-400">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-neutral-400">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 0)}
                    className="bg-neutral-800 border-neutral-700"
                    min="15"
                    step="15"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="allDay"
                    checked={formData.allDay}
                    onCheckedChange={(checked) => handleInputChange('allDay', checked)}
                  />
                  <Label htmlFor="allDay" className="text-neutral-400">All day event</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName" className="text-neutral-400">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Customer or business name"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail" className="text-neutral-400">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="customer@example.com"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-neutral-400">Phone</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-neutral-400">Location Type</Label>
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">{getLocationIcon('office')} Office</SelectItem>
                    <SelectItem value="on_site">{getLocationIcon('on_site')} On-site</SelectItem>
                    <SelectItem value="virtual">{getLocationIcon('virtual')} Virtual</SelectItem>
                    <SelectItem value="customer_location">{getLocationIcon('customer_location')} Customer Location</SelectItem>
                    <SelectItem value="third_party">{getLocationIcon('third_party')} Third Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.location === 'on_site' || formData.location === 'customer_location' || formData.location === 'third_party') && (
                <div>
                  <Label htmlFor="serviceLocation" className="text-neutral-400">Address</Label>
                  <Input
                    id="serviceLocation"
                    value={formData.serviceLocation}
                    onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              )}

              {formData.location === 'virtual' && (
                <div>
                  <Label htmlFor="meetingUrl" className="text-neutral-400">Meeting URL</Label>
                  <Input
                    id="meetingUrl"
                    type="url"
                    value={formData.meetingUrl}
                    onChange={(e) => handleInputChange('meetingUrl', e.target.value)}
                    placeholder="https://zoom.us/j/123456789"
                    className="bg-neutral-800 border-neutral-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recurring Settings */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Repeat className="h-5 w-5" />
                Recurring Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                />
                <Label htmlFor="isRecurring" className="text-neutral-400">Make this a recurring appointment</Label>
              </div>

              {formData.isRecurring && (
                <div className="space-y-4 border-l-2 border-blue-500/30 pl-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recurringType" className="text-neutral-400">Repeat</Label>
                      <Select value={formData.recurringType} onValueChange={(value) => handleInputChange('recurringType', value)}>
                        <SelectTrigger className="bg-neutral-800 border-neutral-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="recurringInterval" className="text-neutral-400">Every</Label>
                      <Input
                        id="recurringInterval"
                        type="number"
                        value={formData.recurringInterval}
                        onChange={(e) => handleInputChange('recurringInterval', parseInt(e.target.value) || 1)}
                        className="bg-neutral-800 border-neutral-700"
                        min="1"
                      />
                    </div>
                  </div>

                  {formData.recurringType === 'weekly' && (
                    <div>
                      <Label className="text-neutral-400">Days of Week</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <Button
                            key={day}
                            variant={formData.daysOfWeek.includes(index) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              const newDays = formData.daysOfWeek.includes(index)
                                ? formData.daysOfWeek.filter(d => d !== index)
                                : [...formData.daysOfWeek, index];
                              handleInputChange('daysOfWeek', newDays);
                            }}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recurringEndDate" className="text-neutral-400">End Date (optional)</Label>
                      <Input
                        id="recurringEndDate"
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                        className="bg-neutral-800 border-neutral-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="recurringOccurrences" className="text-neutral-400">Max Occurrences (optional)</Label>
                      <Input
                        id="recurringOccurrences"
                        type="number"
                        value={formData.recurringOccurrences || ''}
                        onChange={(e) => handleInputChange('recurringOccurrences`, parseInt(e.target.value) || 0)}
                        className="bg-neutral-800 border-neutral-700"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Staff Assignment */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Staff *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableStaff.map(staff => (
                  <div key={staff} className="flex items-center space-x-2">
                    <Checkbox
                      id={`staff-${staff}'}
                      checked={formData.assignedStaff.includes(staff)}
                      onCheckedChange={() => handleStaffToggle(staff)}
                    />
                    <Label htmlFor={'staff-${staff}'} className="text-neutral-400">{staff}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="serviceName" className="text-neutral-400">Service Name</Label>
                <Input
                  id="serviceName"
                  value={formData.serviceName}
                  onChange={(e) => handleInputChange('serviceName', e.target.value)}
                  placeholder="Service description"
                  className="bg-neutral-800 border-neutral-700"
                />
              </div>

              <div>
                <Label htmlFor="cost" className="text-neutral-400">Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="bg-neutral-800 border-neutral-700"
                  step="0.01"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Reminders
                </CardTitle>
                <Button size="sm" onClick={addReminder}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <p className="text-neutral-400 text-sm">No reminders set</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder, index) => (
                    <div key={index} className="border border-neutral-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Select 
                          value={reminder.type} 
                          onValueChange={(value) => updateReminder(index, 'type', value)}
                        >
                          <SelectTrigger className="w-24 bg-neutral-800 border-neutral-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="push">Push</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReminder(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={reminder.minutesBefore}
                          onChange={(e) => updateReminder(index, 'minutesBefore', parseInt(e.target.value) || 0)}
                          placeholder="Minutes"
                          className="bg-neutral-800 border-neutral-700"
                          min="0"
                        />
                        <Select 
                          value={reminder.recipientType} 
                          onValueChange={(value) => updateReminder(index, 'recipientType', value)}
                        >
                          <SelectTrigger className="bg-neutral-800 border-neutral-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="urgent, followup, consultation..."
                className="bg-neutral-800 border-neutral-700"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
                className="bg-neutral-800 border-neutral-700"
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}