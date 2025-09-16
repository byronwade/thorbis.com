/**
 * Advanced Scheduling and Calendar Integration Service
 * 
 * Comprehensive scheduling system with calendar integration, resource management, and automation
 */

export interface ScheduleEvent {
  id: string
  businessId: string
  title: string
  description?: string
  
  // Event timing
  startTime: Date
  endTime: Date
  timezone: string
  allDay: boolean
  
  // Recurrence
  recurrence?: RecurrencePattern
  parentEventId?: string // For recurring event instances
  
  // Event type and categorization
  type: EventType
  category: EventCategory
  priority: EventPriority
  status: EventStatus
  visibility: EventVisibility
  
  // Location and resources
  location?: EventLocation
  resources: ResourceAllocation[]
  
  // Participants
  organizer: EventParticipant
  attendees: EventParticipant[]
  
  // Industry-specific data
  industryData?: {
    homeServices?: {
      customerId: string
      serviceType: string
      estimatedDuration: number
      equipmentNeeded: string[]
      specialInstructions?: string
    }
    restaurant?: {
      tableId?: string
      partySize?: number
      specialRequests?: string
      menuPreferences?: string[]
    }
    auto?: {
      vehicleId: string
      serviceType: string
      estimatedLabor: number
      partsNeeded: string[]
    }
    retail?: {
      customerId?: string
      appointmentType: string
      productInterest?: string[]
    }
    education?: {
      courseId?: string
      classroomId?: string
      instructorId: string
      studentIds: string[]
    }
  }
  
  // Notifications and reminders
  reminders: EventReminder[]
  notifications: NotificationSettings
  
  // Integration data
  externalCalendarIds: Record<string, string> // platform -> external ID
  syncStatus: SyncStatus
  
  // Workflow and automation
  workflow?: EventWorkflow
  autoSchedulingRules?: AutoSchedulingRule[]
  
  // Availability and conflicts
  availabilityChecked: boolean
  conflicts: ScheduleConflict[]
  
  // Metadata
  tags: string[]
  customFields: Record<string, unknown>
  
  // Audit trail
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  version: number
}

export interface Calendar {
  id: string
  businessId: string
  name: string
  description?: string
  
  // Calendar properties
  type: CalendarType
  color: string
  visibility: CalendarVisibility
  
  // Ownership and sharing
  ownerId: string
  sharedWith: CalendarShare[]
  permissions: CalendarPermission[]
  
  // Integration
  externalCalendarId?: string
  platform?: CalendarPlatform
  syncEnabled: boolean
  syncSettings?: CalendarSyncSettings
  
  // Configuration
  timezone: string
  workingHours: WorkingHours
  availability: AvailabilityRules
  bookingRules: BookingRules
  
  // Industry-specific settings
  industryConfig?: {
    homeServices?: {
      serviceAreas: string[]
      travelTime: number
      bufferTime: number
      defaultDuration: number
    }
    restaurant?: {
      tableManagement: boolean
      reservationWindow: number
      maxPartySize: number
    }
    auto?: {
      bayAssignment: boolean
      estimatedServiceTimes: Record<string, number>
    }
    retail?: {
      appointmentTypes: string[]
      consultationRooms: string[]
    }
    education?: {
      academicYear: string
      termDates: DateRange[]
      classSchedules: ClassSchedule[]
    }
  }
  
  // Statistics
  stats: CalendarStats
  
  createdAt: Date
  createdBy: string
  updatedAt: Date
}

export interface ResourceAllocation {
  resourceId: string
  resourceType: ResourceType
  resourceName: string
  quantity: number
  duration: number
  cost?: number
  
  // Resource-specific data
  resourceData?: {
    person?: {
      skills: string[]
      certifications: string[]
      hourlyRate: number
    }
    equipment?: {
      model: string
      serialNumber?: string
      maintenanceStatus: string
    }
    room?: {
      capacity: number
      amenities: string[]
      location: string
    }
    vehicle?: {
      type: string
      capacity: number
      currentLocation?: string
    }
  }
  
  // Allocation status
  status: AllocationStatus
  confirmedAt?: Date
  confirmedBy?: string
}

export interface AppointmentBooking {
  id: string
  businessId: string
  customerId: string
  
  // Booking details
  title: string
  description?: string
  type: AppointmentType
  status: BookingStatus
  
  // Timing
  requestedStartTime: Date
  requestedEndTime: Date
  confirmedStartTime?: Date
  confirmedEndTime?: Date
  timezone: string
  
  // Service details
  services: BookedService[]
  totalDuration: number
  totalCost: number
  
  // Assigned resources
  assignedTo: string[] // User IDs
  resources: ResourceAllocation[]
  location?: EventLocation
  
  // Customer information
  customerInfo: {
    name: string
    email: string
    phone: string
    preferences?: string[]
    specialRequests?: string
    previousBookings?: number
  }
  
  // Payment and pricing
  pricing: AppointmentPricing
  paymentStatus: PaymentStatus
  
  // Notifications
  reminders: BookingReminder[]
  notificationSettings: NotificationSettings
  
  // Workflow
  workflow?: BookingWorkflow
  
  // Cancellation and rescheduling
  cancellationPolicy?: CancellationPolicy
  rescheduleHistory: RescheduleRecord[]
  
  createdAt: Date
  bookedBy: string
  updatedAt: Date
}

export interface AvailabilitySlot {
  id: string
  startTime: Date
  endTime: Date
  duration: number
  
  // Availability details
  isAvailable: boolean
  resourceId?: string
  resourceType?: ResourceType
  
  // Constraints
  constraints: SlotConstraint[]
  
  // Pricing (if applicable)
  pricing?: SlotPricing
  
  // Booking information
  isBooked: boolean
  bookingId?: string
  
  // Recurring slot information
  recurrenceId?: string
  isRecurring: boolean
}

// Enums
export enum EventType {
  APPOINTMENT = 'appointment',
  MEETING = 'meeting',
  TASK = 'task',
  REMINDER = 'reminder',
  DEADLINE = 'deadline',
  MAINTENANCE = 'maintenance',
  TRAINING = 'training',
  BREAK = 'break',
  BLOCKED_TIME = 'blocked_time',
  SHIFT = 'shift'
}

export enum EventCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  CUSTOMER = 'customer',
  INTERNAL = 'internal',
  MAINTENANCE = 'maintenance',
  TRAINING = 'training',
  MEETING = 'meeting',
  APPOINTMENT = 'appointment'
}

export enum EventPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum EventStatus {
  TENTATIVE = 'tentative',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show'
}

export enum EventVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  CONFIDENTIAL = 'confidential'
}

export enum CalendarType {
  PERSONAL = 'personal',
  TEAM = 'team',
  RESOURCE = 'resource',
  PROJECT = 'project',
  CUSTOMER = 'customer',
  INTEGRATION = 'integration'
}

export enum CalendarVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
  READ_ONLY = 'read_only'
}

export enum CalendarPlatform {
  GOOGLE = 'google',
  OUTLOOK = 'outlook',
  APPLE = 'apple',
  CALDAV = 'caldav',
  EXCHANGE = 'exchange',
  OFFICE365 = 'office365'
}

export enum ResourceType {
  PERSON = 'person',
  EQUIPMENT = 'equipment',
  ROOM = 'room',
  VEHICLE = 'vehicle',
  TOOL = 'tool',
  MATERIAL = 'material'
}

export enum AllocationStatus {
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  UNAVAILABLE = 'unavailable',
  IN_USE = 'in_use',
  COMPLETED = 'completed'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PENDING = 'pending'
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  ERROR = 'error',
  DISABLED = 'disabled'
}

/**
 * Advanced Scheduling Service Class
 */
class SchedulingService {
  
  /**
   * Create a new schedule event
   */
  async createEvent(
    businessId: string,
    eventData: Partial<ScheduleEvent>
  ): Promise<ScheduleEvent> {
    const event: ScheduleEvent = {
      id: 'event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      title: eventData.title!,
      description: eventData.description,
      startTime: eventData.startTime!,
      endTime: eventData.endTime!,
      timezone: eventData.timezone || 'UTC',
      allDay: eventData.allDay || false,
      recurrence: eventData.recurrence,
      parentEventId: eventData.parentEventId,
      type: eventData.type || EventType.APPOINTMENT,
      category: eventData.category || EventCategory.WORK,
      priority: eventData.priority || EventPriority.NORMAL,
      status: eventData.status || EventStatus.TENTATIVE,
      visibility: eventData.visibility || EventVisibility.PRIVATE,
      location: eventData.location,
      resources: eventData.resources || [],
      organizer: eventData.organizer!,
      attendees: eventData.attendees || [],
      industryData: eventData.industryData,
      reminders: eventData.reminders || [],
      notifications: eventData.notifications || this.getDefaultNotifications(),
      externalCalendarIds: eventData.externalCalendarIds || {},
      syncStatus: SyncStatus.PENDING,
      workflow: eventData.workflow,
      autoSchedulingRules: eventData.autoSchedulingRules,
      availabilityChecked: false,
      conflicts: [],
      tags: eventData.tags || [],
      customFields: eventData.customFields || {},
      createdAt: new Date(),
      createdBy: eventData.createdBy!,
      updatedAt: new Date(),
      updatedBy: eventData.createdBy!,
      version: 1
    }
    
    // Check for conflicts
    await this.checkAvailabilityAndConflicts(event)
    
    // Apply auto-scheduling rules
    if (event.autoSchedulingRules && event.autoSchedulingRules.length > 0) {
      await this.applyAutoSchedulingRules(event)
    }
    
    // Sync with external calendars
    await this.syncWithExternalCalendars(event)
    
    await this.logSchedulingActivity('event_created', businessId, eventData.createdBy!, { eventId: event.id })
    
    return event
  }
  
  /**
   * Get events with filtering and pagination
   */
  async getEvents(
    businessId: string,
    filters: {
      calendarIds?: string[]
      startDate?: Date
      endDate?: Date
      type?: EventType[]
      status?: EventStatus[]
      category?: EventCategory[]
      attendeeId?: string
      resourceId?: string
      searchTerm?: string
      tags?: string[]
      limit?: number
      offset?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
  ): Promise<{
    events: ScheduleEvent[]
    totalCount: number
    pagination: {
      page: number
      limit: number
      totalPages: number
    }
    summary: {
      upcoming: number
      today: number
      thisWeek: number
      overdue: number
      conflicts: number
    }
  }> {
    // Mock implementation
    return {
      events: [],
      totalCount: 0,
      pagination: {
        page: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
        limit: filters.limit || 20,
        totalPages: 0
      },
      summary: {
        upcoming: 0,
        today: 0,
        thisWeek: 0,
        overdue: 0,
        conflicts: 0
      }
    }
  }
  
  /**
   * Create calendar
   */
  async createCalendar(
    businessId: string,
    calendarData: Partial<Calendar>
  ): Promise<Calendar> {
    const calendar: Calendar = {
      id: 'cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      name: calendarData.name!,
      description: calendarData.description,
      type: calendarData.type || CalendarType.PERSONAL,
      color: calendarData.color || '#1C8BFF',
      visibility: calendarData.visibility || CalendarVisibility.PRIVATE,
      ownerId: calendarData.ownerId!,
      sharedWith: calendarData.sharedWith || [],
      permissions: calendarData.permissions || [],
      externalCalendarId: calendarData.externalCalendarId,
      platform: calendarData.platform,
      syncEnabled: calendarData.syncEnabled || false,
      syncSettings: calendarData.syncSettings,
      timezone: calendarData.timezone || 'UTC',
      workingHours: calendarData.workingHours || this.getDefaultWorkingHours(),
      availability: calendarData.availability || this.getDefaultAvailability(),
      bookingRules: calendarData.bookingRules || this.getDefaultBookingRules(),
      industryConfig: calendarData.industryConfig,
      stats: {
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        conflictedEvents: 0,
        lastActivity: new Date()
      },
      createdAt: new Date(),
      createdBy: calendarData.createdBy!,
      updatedAt: new Date()
    }
    
    return calendar
  }
  
  /**
   * Book appointment
   */
  async bookAppointment(
    businessId: string,
    bookingData: Partial<AppointmentBooking>
  ): Promise<AppointmentBooking> {
    // Check availability
    const availableSlots = await this.getAvailableSlots(
      businessId,
      {
        startDate: bookingData.requestedStartTime!,
        endDate: bookingData.requestedEndTime!,
        duration: bookingData.totalDuration || 60,
        resourceIds: bookingData.assignedTo,
        serviceTypes: bookingData.services?.map(s => s.serviceId)
      }
    )
    
    if (availableSlots.length === 0) {
      throw new Error('No available slots for the requested time')
    }
    
    const booking: AppointmentBooking = {
      id: 'booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      businessId,
      customerId: bookingData.customerId!,
      title: bookingData.title!,
      description: bookingData.description,
      type: bookingData.type || AppointmentType.CONSULTATION,
      status: BookingStatus.PENDING,
      requestedStartTime: bookingData.requestedStartTime!,
      requestedEndTime: bookingData.requestedEndTime!,
      timezone: bookingData.timezone || 'UTC',
      services: bookingData.services || [],
      totalDuration: bookingData.totalDuration || 60,
      totalCost: bookingData.totalCost || 0,
      assignedTo: bookingData.assignedTo || [],
      resources: bookingData.resources || [],
      location: bookingData.location,
      customerInfo: bookingData.customerInfo!,
      pricing: bookingData.pricing || this.calculatePricing(bookingData.services || []),
      paymentStatus: PaymentStatus.UNPAID,
      reminders: bookingData.reminders || this.getDefaultReminders(),
      notificationSettings: bookingData.notificationSettings || this.getDefaultNotifications(),
      workflow: bookingData.workflow,
      cancellationPolicy: bookingData.cancellationPolicy,
      rescheduleHistory: [],
      createdAt: new Date(),
      bookedBy: bookingData.bookedBy!,
      updatedAt: new Date()
    }
    
    // Create corresponding calendar event
    const event = await this.createEvent(businessId, {
      title: booking.title,
      startTime: booking.requestedStartTime,
      endTime: booking.requestedEndTime,
      type: EventType.APPOINTMENT,
      organizer: {
        id: 'system',
        name: 'System',
        email: 'system@thorbis.com',
        role: 'organizer',
        status: 'accepted'
      },
      createdBy: booking.bookedBy
    })
    
    await this.logSchedulingActivity('appointment_booked`, businessId, booking.bookedBy, { bookingId: booking.id })
    
    return booking
  }
  
  /**
   * Get available time slots
   */
  async getAvailableSlots(
    businessId: string,
    criteria: {
      startDate: Date
      endDate: Date
      duration: number
      resourceIds?: string[]
      serviceTypes?: string[]
      locationId?: string
      timezone?: string
    }
  ): Promise<AvailabilitySlot[]> {
    // Mock implementation - would integrate with calendar availability, resource schedules, etc.
    const slots: AvailabilitySlot[] = []
    
    // Generate sample slots
    const startDate = new Date(criteria.startDate)
    const endDate = new Date(criteria.endDate)
    const slotDuration = criteria.duration
    
    for (const date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      // Generate slots for working hours (9 AM to 5 PM)
      for (const hour = 9; hour < 17; hour++) {
        const slotStart = new Date(date)
        slotStart.setHours(hour, 0, 0, 0)
        
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)
        
        // Check if slot is within working hours
        if (slotEnd.getHours() <= 17) {
          slots.push({
            id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: new Date(slotStart),
            endTime: new Date(slotEnd),
            duration: slotDuration,
            isAvailable: Math.random() > 0.3, // 70% availability simulation
            constraints: [],
            isBooked: false,
            isRecurring: false
          })
        }
      }
    }
    
    return slots.filter(slot => slot.isAvailable)
  }
  
  /**
   * Get scheduling dashboard
   */
  async getSchedulingDashboard(
    businessId: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<{
    summary: {
      totalEvents: number
      upcomingEvents: number
      todayEvents: number
      weekEvents: number
      overdueEvents: number
      conflictedEvents: number
      utilizationRate: number
    }
    upcomingEvents: ScheduleEvent[]
    resourceUtilization: Array<{
      resourceId: string
      resourceName: string
      utilizationPercentage: number
      scheduledHours: number
      availableHours: number
    }>
    calendarStats: Array<{
      calendarId: string
      calendarName: string
      eventCount: number
      utilizationRate: number
    }>
    trends: Array<{
      date: string
      eventCount: number
      bookingCount: number
      utilizationRate: number
    }>
    conflicts: ScheduleConflict[]
  }> {
    // Mock implementation
    return {
      summary: {
        totalEvents: 0,
        upcomingEvents: 0,
        todayEvents: 0,
        weekEvents: 0,
        overdueEvents: 0,
        conflictedEvents: 0,
        utilizationRate: 0
      },
      upcomingEvents: [],
      resourceUtilization: [],
      calendarStats: [],
      trends: [],
      conflicts: []
    }
  }
  
  /**
   * Sync with external calendar platforms
   */
  async syncWithExternalCalendars(event: ScheduleEvent): Promise<void> {
    // Mock implementation - would integrate with Google Calendar, Outlook, etc.
    console.log(`Syncing event ${event.id} with external calendars')
    
    // Update sync status
    event.syncStatus = SyncStatus.SYNCED
  }
  
  /**
   * Check availability and conflicts
   */
  private async checkAvailabilityAndConflicts(event: ScheduleEvent): Promise<void> {
    // Mock implementation - would check against existing events, resource availability, etc.
    event.availabilityChecked = true
    event.conflicts = []
  }
  
  /**
   * Apply auto-scheduling rules
   */
  private async applyAutoSchedulingRules(event: ScheduleEvent): Promise<void> {
    // Mock implementation - would apply business rules for automatic scheduling
    console.log('Applying auto-scheduling rules for event ${event.id}')
  }
  
  /**
   * Calculate pricing for services
   */
  private calculatePricing(services: BookedService[]): AppointmentPricing {
    return {
      basePrice: 0,
      serviceCharges: [],
      discounts: [],
      taxes: [],
      totalPrice: 0,
      currency: 'USD'
    }
  }
  
  /**
   * Get default configurations
   */
  private getDefaultNotifications(): NotificationSettings {
    return {
      email: true,
      sms: false,
      push: true,
      inApp: true,
      webhooks: []
    }
  }
  
  private getDefaultWorkingHours(): WorkingHours {
    return {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '09:00', end: '12:00', enabled: false },
      sunday: { start: '09:00', end: '12:00', enabled: false }
    }
  }
  
  private getDefaultAvailability(): AvailabilityRules {
    return {
      advanceBookingDays: 30,
      minimumNoticeHours: 24,
      maxBookingsPerDay: 10,
      bufferTimeBetweenAppointments: 15,
      allowDoubleBooking: false
    }
  }
  
  private getDefaultBookingRules(): BookingRules {
    return {
      requireApproval: false,
      allowCancellation: true,
      cancellationHours: 24,
      allowRescheduling: true,
      rescheduleHours: 24,
      maxReschedulesAllowed: 3,
      requirePaymentUpfront: false
    }
  }
  
  private getDefaultReminders(): BookingReminder[] {
    return [
      {
        type: 'email',
        timing: 24 * 60, // 24 hours before
        message: 'Reminder: You have an appointment tomorrow'
      },
      {
        type: 'sms',
        timing: 60, // 1 hour before
        message: 'Reminder: Your appointment is in 1 hour'
      }
    ]
  }
  
  private async logSchedulingActivity(
    activity: string,
    businessId: string,
    userId: string,
    details: Record<string, unknown>
  ): Promise<void> {
    console.log('Scheduling Activity: ${activity} by ${userId} for business ${businessId}', details)
  }
}

// Supporting interfaces and types
interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: Date
  occurrences?: number
  weekdays?: number[]
  monthDay?: number
  exceptions?: Date[]
}

interface EventLocation {
  type: 'physical' | 'virtual' | 'hybrid'
  name?: string
  address?: string
  coordinates?: { latitude: number; longitude: number }
  virtualUrl?: string
  virtualPlatform?: string
  instructions?: string
}

interface EventParticipant {
  id: string
  name: string
  email: string
  role: 'organizer' | 'attendee' | 'optional' | 'resource'
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
  responseTime?: Date
}

interface EventReminder {
  type: 'email' | 'sms' | 'push' | 'popup'
  timing: number // minutes before event
  message?: string
  delivered?: boolean
  deliveredAt?: Date
}

interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
  webhooks: string[]
}

interface EventWorkflow {
  steps: WorkflowStep[]
  approvalRequired: boolean
  autoApprove: boolean
  escalationRules: EscalationRule[]
}

interface AutoSchedulingRule {
  id: string
  name: string
  condition: string
  action: string
  priority: number
  enabled: boolean
}

interface ScheduleConflict {
  type: 'overlap' | 'resource' | 'availability' | 'constraint'
  description: string
  conflictingEventId?: string
  conflictingResourceId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  suggestions: string[]
}

interface CalendarShare {
  userId: string
  permission: 'view' | 'edit' | 'manage'
  sharedBy: string
  sharedAt: Date
  expiresAt?: Date
}

interface CalendarPermission {
  userId: string
  role: string
  permissions: string[]
  grantedBy: string
  grantedAt: Date
}

interface CalendarSyncSettings {
  bidirectional: boolean
  syncFrequency: number // minutes
  conflictResolution: 'local' | 'remote' | 'prompt'
  fieldMappings: Record<string, string>
}

interface WorkingHours {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

interface DaySchedule {
  enabled: boolean
  start: string // HH:MM format
  end: string // HH:MM format
  breaks?: TimeSlot[]
}

interface TimeSlot {
  start: string
  end: string
  description?: string
}

interface AvailabilityRules {
  advanceBookingDays: number
  minimumNoticeHours: number
  maxBookingsPerDay: number
  bufferTimeBetweenAppointments: number
  allowDoubleBooking: boolean
  blackoutDates?: Date[]
  specialAvailability?: SpecialAvailability[]
}

interface SpecialAvailability {
  date: Date
  available: boolean
  workingHours?: DaySchedule
  reason?: string
}

interface BookingRules {
  requireApproval: boolean
  allowCancellation: boolean
  cancellationHours: number
  allowRescheduling: boolean
  rescheduleHours: number
  maxReschedulesAllowed: number
  requirePaymentUpfront: boolean
  depositPercentage?: number
}

interface CalendarStats {
  totalEvents: number
  upcomingEvents: number
  completedEvents: number
  conflictedEvents: number
  lastActivity: Date
  utilizationRate?: number
}

enum AppointmentType {
  CONSULTATION = 'consultation',
  SERVICE = 'service',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  MAINTENANCE = 'maintenance',
  TRAINING = 'training',
  MEETING = 'meeting'
}

interface BookedService {
  serviceId: string
  serviceName: string
  duration: number
  price: number
  description?: string
  requiresResources?: string[]
}

interface AppointmentPricing {
  basePrice: number
  serviceCharges: PriceComponent[]
  discounts: PriceComponent[]
  taxes: PriceComponent[]
  totalPrice: number
  currency: string
}

interface PriceComponent {
  name: string
  amount: number
  type: 'fixed' | 'percentage'
  description?: string
}

interface BookingReminder {
  type: 'email' | 'sms' | 'push'
  timing: number // minutes before appointment
  message: string
  sent?: boolean
  sentAt?: Date
}

interface BookingWorkflow {
  requiresConfirmation: boolean
  approvalSteps: ApprovalStep[]
  automatedActions: AutomatedAction[]
}

interface ApprovalStep {
  stepId: string
  approverRole: string
  required: boolean
  timeout: number
}

interface AutomatedAction {
  trigger: string
  action: string
  parameters: Record<string, unknown>
}

interface CancellationPolicy {
  allowCancellation: boolean
  minimumNoticeHours: number
  cancellationFee?: number
  refundPolicy: string
}

interface RescheduleRecord {
  oldStartTime: Date
  oldEndTime: Date
  newStartTime: Date
  newEndTime: Date
  reason: string
  rescheduledBy: string
  rescheduledAt: Date
}

interface SlotConstraint {
  type: 'resource' | 'service' | 'capacity' | 'custom'
  description: string
  parameters: Record<string, unknown>
}

interface SlotPricing {
  basePrice: number
  currency: string
  dynamicPricing?: boolean
  demandMultiplier?: number
}

interface WorkflowStep {
  id: string
  name: string
  type: string
  order: number
  configuration: Record<string, unknown>
}

interface EscalationRule {
  condition: string
  escalateTo: string[]
  delay: number
  message?: string
}

interface DateRange {
  start: Date
  end: Date
  name?: string
}

interface ClassSchedule {
  courseId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomId: string
  instructorId: string
}

// Export singleton instance
export const schedulingService = new SchedulingService()