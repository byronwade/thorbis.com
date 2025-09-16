// Comprehensive offline appointment scheduling and calendar management system
// Handles appointment creation, scheduling, conflicts, recurring patterns, and calendar sync

import { EventEmitter } from 'events';

export interface AppointmentMetadata {
  id: string;
  appointmentNumber: string;
  title: string;
  description: string;
  
  // Scheduling
  startTime: Date;
  endTime: Date;
  timeZone: string;
  allDay: boolean;
  duration: number; // minutes
  
  // Participants
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  assignedStaff: string[];
  
  // Location
  location: AppointmentLocation;
  serviceLocation?: string;
  meetingUrl?: string; // for virtual appointments
  
  // Type and status
  type: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  category: AppointmentCategory;
  
  // Recurring
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  parentAppointmentId?: string; // for recurring instances
  
  // Business details
  serviceId?: string;
  serviceName?: string;
  estimatedDuration: number;
  cost?: number;
  
  // Reminders and notifications
  reminders: AppointmentReminder[];
  notifications: AppointmentNotification[];
  
  // Metadata
  tags: string[];
  notes: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Sync and conflict resolution
  lastSynced?: Date;
  syncStatus: 'pending' | 'synced' | 'conflict' | 'failed';
  conflictData?: any;
  version: number;
  
  // Custom fields for industry-specific data
  customFields: Record<string, unknown>;
}

export type AppointmentType = 
  | 'consultation'
  | 'service'
  | 'followup'
  | 'estimate'
  | 'inspection'
  | 'delivery'
  | 'pickup'
  | 'maintenance'
  | 'emergency'
  | 'meeting'
  | 'training'
  | 'other';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled'
  | 'pending_confirmation';

export type AppointmentPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'emergency';

export type AppointmentCategory = 
  | 'service_call'
  | 'office_visit'
  | 'virtual_meeting'
  | 'site_visit'
  | 'delivery'
  | 'pickup'
  | 'inspection'
  | 'consultation'
  | 'training'
  | 'other';

export type AppointmentLocation = 
  | 'on_site'
  | 'office'
  | 'virtual'
  | 'customer_location'
  | 'third_party';

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // every N days/weeks/months/years
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number; // for monthly patterns
  weekOfMonth?: number; // 1st, 2nd, etc. week
  endDate?: Date;
  occurrences?: number; // max number of occurrences
  exceptions?: Date[]; // dates to skip
}

export interface AppointmentReminder {
  id: string;
  type: 'email' | 'sms' | 'push' | 'calendar';
  minutesBefore: number;
  sent: boolean;
  sentAt?: Date;
  recipientType: 'customer' | 'staff' | 'both';
  message?: string;
}

export interface AppointmentNotification {
  id: string;
  type: 'created' | 'updated' | 'cancelled' | 'reminder' | 'started' | 'completed';
  message: string;
  timestamp: Date;
  read: boolean;
  recipientId: string;
}

export interface AppointmentConflict {
  id: string;
  appointmentId: string;
  conflictType: 'time_overlap' | 'staff_unavailable' | 'location_unavailable' | 'customer_conflict';
  description: string;
  conflictingAppointmentId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoResolvable: boolean;
  suggestedResolution?: string;
}

export interface AppointmentFilter {
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatus[];
  type?: AppointmentType[];
  assignedStaff?: string[];
  customerId?: string;
  location?: AppointmentLocation[];
  priority?: AppointmentPriority[];
  tags?: string[];
  searchQuery?: string;
  organizationId?: string;
}

export interface AppointmentSearchOptions {
  sortBy?: 'startTime' | 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface AppointmentSearchResult {
  appointments: AppointmentMetadata[];
  total: number;
  hasMore: boolean;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  staffMember?: string;
  location?: string;
  reason?: string; // if not available
}

export interface AvailabilityRequest {
  date: Date;
  duration: number; // minutes
  staffMembers?: string[];
  location?: AppointmentLocation;
  serviceId?: string;
}

export interface CalendarSync {
  providerId: string;
  providerType: 'google' | 'outlook' | 'apple' | 'ical' | 'exchange';
  enabled: boolean;
  lastSync?: Date;
  syncDirection: 'import' | 'export' | 'bidirectional';
  calendarId?: string;
  accessToken?: string;
  refreshToken?: string;
  syncConflicts: CalendarSyncConflict[];
}

export interface CalendarSyncConflict {
  id: string;
  appointmentId: string;
  externalEventId: string;
  conflictType: 'time_mismatch' | 'status_mismatch' | 'deleted_external' | 'deleted_local';
  lastModified: Date;
  resolution?: 'use_local' | 'use_external' | 'merge' | 'skip';
}

export class OfflineAppointmentManager extends EventEmitter {
  private static instance: OfflineAppointmentManager | null = null;
  private dbName = 'offline_appointments';
  private appointments: Map<string, AppointmentMetadata> = new Map();
  private conflicts: Map<string, AppointmentConflict> = new Map();
  private calendarSyncs: Map<string, CalendarSync> = new Map();
  private initialized = false;

  private constructor() {
    super();
    this.initialize();
  }

  static getInstance(): OfflineAppointmentManager {
    if (!OfflineAppointmentManager.instance) {
      OfflineAppointmentManager.instance = new OfflineAppointmentManager();
    }
    return OfflineAppointmentManager.instance;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadFromIndexedDB();
      this.initialized = true;
      this.emit('manager_initialized');
    } catch (error) {
      console.error('Failed to initialize appointment manager:', error);
      throw new Error('Appointment manager initialization failed');
    }
  }

  private async loadFromIndexedDB(): Promise<void> {
    // Implementation would load appointments from IndexedDB
    // For now, we'll simulate with empty data
    console.log('Loading appointments from IndexedDB...');
  }

  // Appointment Management

  async createAppointment(appointmentData: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    assignedStaff: string[];
    location: AppointmentLocation;
    serviceLocation?: string;
    type: AppointmentType;
    category: AppointmentCategory;
    priority?: AppointmentPriority;
    serviceId?: string;
    serviceName?: string;
    cost?: number;
    tags?: string[];
    notes?: string;
    reminders?: Omit<AppointmentReminder, 'id' | 'sent' | 'sentAt'>[];
    isRecurring?: boolean;
    recurringPattern?: RecurringPattern;
    organizationId?: string;
    customFields?: Record<string, unknown>;
  }): Promise<string> {
    const appointmentId = `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    const appointmentNumber = 'APT-${Date.now().toString().slice(-6)}';
    
    // Check for conflicts
    const conflicts = await this.checkConflicts({
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      assignedStaff: appointmentData.assignedStaff,
      location: appointmentData.location,
      serviceLocation: appointmentData.serviceLocation
    });

    if (conflicts.length > 0 && conflicts.some(c => c.severity === 'critical')) {
      throw new Error('Cannot create appointment: Critical conflicts detected');
    }

    const appointment: AppointmentMetadata = {
      id: appointmentId,
      appointmentNumber,
      title: appointmentData.title,
      description: appointmentData.description || ',
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      allDay: false,
      duration: Math.round((appointmentData.endTime.getTime() - appointmentData.startTime.getTime()) / 60000),
      customerName: appointmentData.customerName,
      customerEmail: appointmentData.customerEmail,
      customerPhone: appointmentData.customerPhone,
      assignedStaff: appointmentData.assignedStaff,
      location: appointmentData.location,
      serviceLocation: appointmentData.serviceLocation,
      type: appointmentData.type,
      status: 'scheduled',
      priority: appointmentData.priority || 'normal',
      category: appointmentData.category,
      isRecurring: appointmentData.isRecurring || false,
      recurringPattern: appointmentData.recurringPattern,
      serviceId: appointmentData.serviceId,
      serviceName: appointmentData.serviceName,
      estimatedDuration: Math.round((appointmentData.endTime.getTime() - appointmentData.startTime.getTime()) / 60000),
      cost: appointmentData.cost,
      reminders: (appointmentData.reminders || []).map(reminder => ({
        ...reminder,
        id: 'reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
        sent: false
      })),
      notifications: [],
      tags: appointmentData.tags || [],
      notes: appointmentData.notes || ',
      organizationId: appointmentData.organizationId || 'default',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current_user', // Would get from auth context
      syncStatus: 'pending',
      version: 1,
      customFields: appointmentData.customFields || {}
    };

    this.appointments.set(appointmentId, appointment);
    await this.saveToIndexedDB();

    // Handle recurring appointments
    if (appointment.isRecurring && appointment.recurringPattern) {
      await this.createRecurringInstances(appointment);
    }

    this.emit('appointment_created', { appointment });
    
    return appointmentId;
  }

  async updateAppointment(appointmentId: string, updates: Partial<AppointmentMetadata>): Promise<void> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error('Appointment ${appointmentId} not found');
    }

    // Check for conflicts if time or staff changes
    if (updates.startTime || updates.endTime || updates.assignedStaff) {
      const conflicts = await this.checkConflicts({
        startTime: updates.startTime || appointment.startTime,
        endTime: updates.endTime || appointment.endTime,
        assignedStaff: updates.assignedStaff || appointment.assignedStaff,
        location: updates.location || appointment.location,
        serviceLocation: updates.serviceLocation || appointment.serviceLocation,
        excludeAppointmentId: appointmentId
      });

      if (conflicts.length > 0 && conflicts.some(c => c.severity === 'critical')) {
        throw new Error('Cannot update appointment: Critical conflicts detected');
      }
    }

    const updatedAppointment = {
      ...appointment,
      ...updates,
      updatedAt: new Date(),
      version: appointment.version + 1,
      syncStatus: 'pending' as const
    };

    this.appointments.set(appointmentId, updatedAppointment);
    await this.saveToIndexedDB();

    this.emit('appointment_updated', { 
      appointmentId, 
      appointment: updatedAppointment,
      changes: updates 
    });
  }

  async deleteAppointment(appointmentId: string, deleteRecurring = false): Promise<void> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error('Appointment ${appointmentId} not found');
    }

    // Handle recurring appointments
    if (deleteRecurring && appointment.isRecurring) {
      await this.deleteRecurringAppointments(appointmentId);
    }

    this.appointments.delete(appointmentId);
    await this.saveToIndexedDB();

    this.emit('appointment_deleted', { appointmentId, appointment });
  }

  async getAppointment(appointmentId: string): Promise<AppointmentMetadata | null> {
    return this.appointments.get(appointmentId) || null;
  }

  // Scheduling and Conflicts

  async checkConflicts(request: {
    startTime: Date;
    endTime: Date;
    assignedStaff: string[];
    location: AppointmentLocation;
    serviceLocation?: string;
    excludeAppointmentId?: string;
  }): Promise<AppointmentConflict[]> {
    const conflicts: AppointmentConflict[] = [];

    for (const [id, appointment] of this.appointments) {
      if (request.excludeAppointmentId === id) continue;
      if (appointment.status === 'cancelled') continue;

      // Check time overlap
      const hasTimeOverlap = this.hasTimeOverlap(
        request.startTime,
        request.endTime,
        appointment.startTime,
        appointment.endTime
      );

      if (hasTimeOverlap) {
        // Check staff conflicts
        const staffConflict = request.assignedStaff.some(staff => 
          appointment.assignedStaff.includes(staff)
        );

        if (staffConflict) {
          conflicts.push({
            id: 'conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
            appointmentId: id,
            conflictType: 'staff_unavailable',
            description: 'Staff member(s) already scheduled for overlapping appointment',
            conflictingAppointmentId: appointment.id,
            severity: 'critical',
            autoResolvable: false,
            suggestedResolution: 'Reschedule or assign different staff'
          });
        }

        // Check location conflicts for physical locations
        if (request.location === appointment.location && 
            request.serviceLocation === appointment.serviceLocation &&
            (request.location === 'office' || request.location === 'customer_location')) {
          conflicts.push({
            id: 'conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
            appointmentId: id,
            conflictType: 'location_unavailable',
            description: 'Location already booked for overlapping appointment',
            conflictingAppointmentId: appointment.id,
            severity: 'high',
            autoResolvable: false,
            suggestedResolution: 'Use different location or reschedule'
          });
        }
      }
    }

    return conflicts;
  }

  private hasTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }

  async getAvailableTimeSlots(request: AvailabilityRequest): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const startOfDay = new Date(request.date);
    startOfDay.setHours(8, 0, 0, 0); // Business hours start
    const endOfDay = new Date(request.date);
    endOfDay.setHours(18, 0, 0, 0); // Business hours end

    const slotDuration = 30; // 30-minute slots
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + request.duration * 60000);
      
      if (slotEnd <= endOfDay) {
        const conflicts = await this.checkConflicts({
          startTime: currentTime,
          endTime: slotEnd,
          assignedStaff: request.staffMembers || [],
          location: request.location || 'office'
        });

        slots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
          available: conflicts.length === 0,
          reason: conflicts.length > 0 ? 'Staff or location conflict' : undefined
        });
      }

      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    return slots;
  }

  // Search and filtering

  async searchAppointments(
    filter: AppointmentFilter = {},
    options: AppointmentSearchOptions = {}
  ): Promise<AppointmentSearchResult> {
    let filteredAppointments = Array.from(this.appointments.values());

    // Apply filters
    if (filter.startDate) {
      filteredAppointments = filteredAppointments.filter(appt => 
        appt.startTime >= filter.startDate!
      );
    }

    if (filter.endDate) {
      filteredAppointments = filteredAppointments.filter(appt => 
        appt.endTime <= filter.endDate!
      );
    }

    if (filter.status?.length) {
      filteredAppointments = filteredAppointments.filter(appt => 
        filter.status!.includes(appt.status)
      );
    }

    if (filter.type?.length) {
      filteredAppointments = filteredAppointments.filter(appt => 
        filter.type!.includes(appt.type)
      );
    }

    if (filter.assignedStaff?.length) {
      filteredAppointments = filteredAppointments.filter(appt => 
        filter.assignedStaff!.some(staff => appt.assignedStaff.includes(staff))
      );
    }

    if (filter.customerId) {
      filteredAppointments = filteredAppointments.filter(appt => 
        appt.customerId === filter.customerId
      );
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredAppointments = filteredAppointments.filter(appt => 
        appt.title.toLowerCase().includes(query) ||
        appt.description.toLowerCase().includes(query) ||
        appt.customerName.toLowerCase().includes(query) ||
        appt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filter.organizationId) {
      filteredAppointments = filteredAppointments.filter(appt => 
        appt.organizationId === filter.organizationId
      );
    }

    // Apply sorting
    const sortBy = options.sortBy || 'startTime';
    const sortOrder = options.sortOrder || 'asc';

    filteredAppointments.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'startTime':
          aValue = a.startTime.getTime();
          bValue = b.startTime.getTime();
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'priority':
          const priorityOrder = { low: 0, normal: 1, high: 2, urgent: 3, emergency: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[sortBy as keyof AppointmentMetadata];
          bValue = b[sortBy as keyof AppointmentMetadata];
      }

      if (sortOrder === 'desc`) {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const total = filteredAppointments.length;
    const paginatedAppointments = filteredAppointments.slice(offset, offset + limit);

    return {
      appointments: paginatedAppointments,
      total,
      hasMore: offset + limit < total
    };
  }

  // Recurring appointments

  private async createRecurringInstances(parentAppointment: AppointmentMetadata): Promise<void> {
    if (!parentAppointment.recurringPattern) return;

    const pattern = parentAppointment.recurringPattern;
    const instances: AppointmentMetadata[] = [];
    
    let currentDate = new Date(parentAppointment.startTime);
    const duration = parentAppointment.endTime.getTime() - parentAppointment.startTime.getTime();
    
    const count = 0;
    const maxOccurrences = pattern.occurrences || 52; // Default to 1 year worth
    const endDate = pattern.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    while (count < maxOccurrences && currentDate <= endDate) {
      // Skip the original appointment
      if (currentDate.getTime() !== parentAppointment.startTime.getTime()) {
        // Check if this date is an exception
        const isException = pattern.exceptions?.some(exception => 
          exception.toDateString() === currentDate.toDateString()
        );

        if (!isException) {
          const instanceId = `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${count}';
          const instanceStartTime = new Date(currentDate);
          const instanceEndTime = new Date(currentDate.getTime() + duration);

          const instance: AppointmentMetadata = {
            ...parentAppointment,
            id: instanceId,
            appointmentNumber: '${parentAppointment.appointmentNumber}-${count + 1}',
            startTime: instanceStartTime,
            endTime: instanceEndTime,
            parentAppointmentId: parentAppointment.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
          };

          instances.push(instance);
          this.appointments.set(instanceId, instance);
        }
      }

      // Calculate next occurrence
      currentDate = this.getNextOccurrence(currentDate, pattern);
      count++;
    }

    if (instances.length > 0) {
      await this.saveToIndexedDB();
      this.emit('recurring_appointments_created', { 
        parentAppointmentId: parentAppointment.id, 
        instances 
      });
    }
  }

  private getNextOccurrence(currentDate: Date, pattern: RecurringPattern): Date {
    const nextDate = new Date(currentDate);

    switch (pattern.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;
      
      case 'weekly':
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          // Find next occurrence based on days of week
          const daysToAdd = 1;
          while (daysToAdd <= 7) {
            const testDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
            if (pattern.daysOfWeek.includes(testDate.getDay())) {
              return testDate;
            }
            daysToAdd++;
          }
        } else {
          nextDate.setDate(nextDate.getDate() + 7 * pattern.interval);
        }
        break;
      
      case 'monthly':
        if (pattern.dayOfMonth) {
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
          nextDate.setDate(pattern.dayOfMonth);
        } else {
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        }
        break;
      
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        break;
    }

    return nextDate;
  }

  private async deleteRecurringAppointments(parentAppointmentId: string): Promise<void> {
    const toDelete: string[] = [];
    
    for (const [id, appointment] of this.appointments) {
      if (appointment.parentAppointmentId === parentAppointmentId) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      this.appointments.delete(id);
    }

    await this.saveToIndexedDB();
  }

  // Status management

  async updateStatus(appointmentId: string, newStatus: AppointmentStatus, note?: string): Promise<void> {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) {
      throw new Error('Appointment ${appointmentId} not found');
    }

    const oldStatus = appointment.status;
    appointment.status = newStatus;
    appointment.updatedAt = new Date();
    appointment.version += 1;
    appointment.syncStatus = 'pending';

    // Add status change notification
    const notification: AppointmentNotification = {
      id: 'notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      type: 'updated',
      message: note || 'Status changed from ${oldStatus} to ${newStatus}',
      timestamp: new Date(),
      read: false,
      recipientId: appointment.createdBy
    };

    appointment.notifications.push(notification);

    this.appointments.set(appointmentId, appointment);
    await this.saveToIndexedDB();

    this.emit('status_changed', {
      appointmentId,
      oldStatus,
      newStatus,
      note,
      appointment
    });
  }

  // Calendar sync

  async setupCalendarSync(syncConfig: Omit<CalendarSync, 'syncConflicts'>): Promise<void> {
    const calendarSync: CalendarSync = {
      ...syncConfig,
      syncConflicts: []
    };

    this.calendarSyncs.set(syncConfig.providerId, calendarSync);
    await this.saveToIndexedDB();

    this.emit('calendar_sync_configured', { syncConfig: calendarSync });
  }

  async syncWithExternalCalendar(providerId: string): Promise<void> {
    const syncConfig = this.calendarSyncs.get(providerId);
    if (!syncConfig || !syncConfig.enabled) {
      throw new Error('Calendar sync not configured or disabled for provider ${providerId}');
    }

    try {
      // Implementation would sync with external calendar
      // For now, we'll simulate the process
      
      syncConfig.lastSync = new Date();
      this.calendarSyncs.set(providerId, syncConfig);
      await this.saveToIndexedDB();

      this.emit('calendar_sync_completed', { providerId, timestamp: new Date() });
    } catch (_error) {
      this.emit('calendar_sync_failed', { providerId, error });
      throw error;
    }
  }

  // Data management

  async getPendingSyncAppointments(): Promise<AppointmentMetadata[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.syncStatus === 'pending' || appointment.syncStatus === 'failed'
    );
  }

  async getAppointmentsByDate(date: Date): Promise<AppointmentMetadata[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.appointments.values()).filter(appointment => 
      appointment.startTime >= startOfDay && appointment.startTime <= endOfDay
    );
  }

  async getAppointmentsByWeek(startDate: Date): Promise<AppointmentMetadata[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return Array.from(this.appointments.values()).filter(appointment => 
      appointment.startTime >= startDate && appointment.startTime < endDate
    );
  }

  async getStatistics(organizationId?: string): Promise<{
    total: number;
    byStatus: Record<AppointmentStatus, number>;
    byType: Record<AppointmentType, number>;
    byPriority: Record<AppointmentPriority, number>;
    unsynced: number;
    conflicts: number;
    todayAppointments: number;
    weekAppointments: number;
  }> {
    let appointments = Array.from(this.appointments.values());
    
    if (organizationId) {
      appointments = appointments.filter(appt => appt.organizationId === organizationId);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const stats = {
      total: appointments.length,
      byStatus: Record<string, unknown> as Record<AppointmentStatus, number>,
      byType: Record<string, unknown> as Record<AppointmentType, number>,
      byPriority: Record<string, unknown> as Record<AppointmentPriority, number>,
      unsynced: appointments.filter(appt => appt.syncStatus === 'pending' || appt.syncStatus === 'failed').length,
      conflicts: this.conflicts.size,
      todayAppointments: appointments.filter(appt => 
        appt.startTime >= today && appt.startTime < tomorrow
      ).length,
      weekAppointments: appointments.filter(appt => 
        appt.startTime >= startOfWeek && appt.startTime < endOfWeek
      ).length
    };

    // Count by status
    appointments.forEach(appt => {
      stats.byStatus[appt.status] = (stats.byStatus[appt.status] || 0) + 1;
    });

    // Count by type
    appointments.forEach(appt => {
      stats.byType[appt.type] = (stats.byType[appt.type] || 0) + 1;
    });

    // Count by priority
    appointments.forEach(appt => {
      stats.byPriority[appt.priority] = (stats.byPriority[appt.priority] || 0) + 1;
    });

    return stats;
  }

  private async saveToIndexedDB(): Promise<void> {
    // Implementation would save to IndexedDB
    // For now, we'll simulate the operation
    console.log('Saving appointments to IndexedDB...');
  }

  // Cleanup and maintenance

  async cleanup(olderThanDays = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const deletedCount = 0;
    const toDelete: string[] = [];

    for (const [id, appointment] of this.appointments) {
      if (appointment.endTime < cutoffDate && 
          (appointment.status === 'completed' || appointment.status === 'cancelled')) {
        toDelete.push(id);
        deletedCount++;
      }
    }

    for (const id of toDelete) {
      this.appointments.delete(id);
    }

    if (deletedCount > 0) {
      await this.saveToIndexedDB();
      this.emit('cleanup_completed', { deletedCount });
    }

    return deletedCount;
  }
}

// Factory function
export function createOfflineAppointmentManager(): OfflineAppointmentManager {
  return OfflineAppointmentManager.getInstance();
}

// React hook
export function useOfflineAppointments() {
  const manager = OfflineAppointmentManager.getInstance();
  
  return {
    // Appointment management
    createAppointment: manager.createAppointment.bind(manager),
    updateAppointment: manager.updateAppointment.bind(manager),
    deleteAppointment: manager.deleteAppointment.bind(manager),
    getAppointment: manager.getAppointment.bind(manager),
    
    // Status management
    updateStatus: manager.updateStatus.bind(manager),
    
    // Scheduling
    checkConflicts: manager.checkConflicts.bind(manager),
    getAvailableTimeSlots: manager.getAvailableTimeSlots.bind(manager),
    
    // Search and filtering
    searchAppointments: manager.searchAppointments.bind(manager),
    getAppointmentsByDate: manager.getAppointmentsByDate.bind(manager),
    getAppointmentsByWeek: manager.getAppointmentsByWeek.bind(manager),
    
    // Calendar sync
    setupCalendarSync: manager.setupCalendarSync.bind(manager),
    syncWithExternalCalendar: manager.syncWithExternalCalendar.bind(manager),
    
    // Data management
    getPendingSyncAppointments: manager.getPendingSyncAppointments.bind(manager),
    getStatistics: manager.getStatistics.bind(manager),
    cleanup: manager.cleanup.bind(manager),
    
    // Events
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}