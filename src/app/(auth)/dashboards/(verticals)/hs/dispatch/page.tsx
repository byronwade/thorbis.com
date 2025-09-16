'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  AlertTriangle,
  CheckCircle,
  Circle,
  Calendar,
  Truck,
  Wrench,
  DollarSign,
  Timer,
  Navigation,
  MoreVertical,
  LayoutGrid,
  List,
  Map,
  Star,
  UserX,
  AlertCircle,
  Target,
  Zap,
  Activity,
  Settings,
  RefreshCw,
  Eye,
  MessageSquare,
  Send,
  Edit,
  Copy,
  Archive,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Home,
  Building,
  Award,
  Shield,
  Battery,
  Wifi,
  Signal,
  Gauge,
  RadioIcon as Radio,
  Headphones,
  Video,
  FileText,
  ClipboardList,
  Camera,
  Upload,
  Download,
  Share2,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer
} from 'lucide-react'

import { DataTable } from '@/components/ui/data-table'

interface WorkOrder {
  id: string
  jobNumber: string
  customer: {
    id: string
    name: string
    type: 'residential' | 'commercial'
    phone: string
    email: string
    secondaryPhone?: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      coordinates?: { lat: number;
import { Button } from '@/components/ui/button';
import { InlineConfirmBar } from '@/components/ui';
 lng: number }
      notes?: string
      accessInstructions?: string
    }
    preferredTechnician?: string
    serviceHistory: number
    accountStatus: 'active' | 'inactive' | 'vip' | 'new'
    paymentStatus: 'current' | 'overdue' | 'prepaid'
  }
  serviceType: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'general' | 'maintenance' | 'emergency'
  serviceCategory: 'repair' | 'installation' | 'maintenance' | 'inspection' | 'emergency' | 'consultation'
  title: string
  description: string
  problemDescription: string
  symptoms: string[]
  urgencyReason?: string
  
  status: 'created' | 'scheduled' | 'assigned' | 'dispatched' | 'en_route' | 'on_site' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | 'rescheduled'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'emergency'
  
  // Scheduling & Assignment
  scheduledAt: string | null
  estimatedDuration: number
  actualDuration?: number
  timeWindow?: {
    start: string
    end: string
    preference: 'morning' | 'afternoon' | 'evening' | 'anytime'
  }
  
  technician?: {
    id: string
    name: string
    phone: string
    email: string
    status: 'available' | 'busy' | 'break' | 'off_duty' | 'en_route' | 'on_site'
    location: {
      current: string
      coordinates?: { lat: number; lng: number }
      lastUpdated: string
    }
    skills: string[]
    rating: number
    efficiency: number
    certifications: string[]
    vehicleInfo?: {
      id: string
      make: string
      model: string
      year: number
      licensePlate: string
      gpsEnabled: boolean
    }
  }
  
  // Route & Travel Information
  routeInfo?: {
    distance: number // in miles
    estimatedTravelTime: number // in minutes
    actualTravelTime?: number
    traffic: 'light' | 'moderate' | 'heavy'
    route: 'optimal' | 'fastest' | 'shortest'
    etaUpdates: Array<{
      timestamp: string
      eta: string
      reason?: string
    }>
  }
  
  // Pricing & Financial
  estimate: {
    laborCost: number
    materialCost: number
    subtotal: number
    tax: number
    total: number
    approved: boolean
    approvedBy?: string
    approvedAt?: string
    margin?: number
  }
  
  // Parts & Inventory
  requiredParts?: Array<{
    partNumber: string
    description: string
    quantity: number
    available: boolean
    cost: number
    supplier?: string
  }>
  
  // Quality & Safety
  safetyRequirements?: string[]
  specialInstructions?: string[]
  equipmentRequired: string[]
  hazards?: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    mitigation: string
  }>
  
  // Communication & Updates
  customerNotifications: Array<{
    type: 'sms' | 'email' | 'call'
    sentAt: string
    status: 'sent' | 'delivered' | 'read' | 'failed'
    message: string
  }>
  
  statusUpdates: Array<{
    status: WorkOrder['status']
    timestamp: string
    updatedBy: string
    notes?: string
    location?: { lat: number; lng: number }
  }>
  
  // Documentation
  photos?: Array<{
    id: string
    url: string
    description: string
    type: 'before' | 'during' | 'after' | 'problem' | 'solution'
    timestamp: string
  }>
  
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
    uploadedAt: string
  }>
  
  workLog: Array<{
    timestamp: string
    technician: string
    activity: string
    duration?: number
    notes?: string
  }>
  
  // Quality Control
  qualityCheck?: {
    completedBy: string
    completedAt: string
    rating: number
    issues: string[]
    followUpRequired: boolean
  }
  
  customerFeedback?: {
    rating: number
    comments: string
    wouldRecommend: boolean
    submittedAt: string
  }
  
  // Tracking & Analytics
  createdAt: string
  updatedAt: string
  createdBy: string
  source: 'phone' | 'online' | 'mobile_app' | 'referral' | 'repeat_customer'
  tags: string[]
  
  // Warranty & Follow-up
  warrantyInfo?: {
    parts: number // months
    labor: number // months
    fullWarranty: number // months
  }
  
  followUpDate?: string
  followUpType?: 'maintenance' | 'warranty_check' | 'customer_satisfaction'
}

interface Technician {
  id: string
  employeeId: string
  name: string
  email: string
  phone: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  
  // Status & Availability
  status: 'available' | 'busy' | 'break' | 'lunch' | 'off_duty' | 'en_route' | 'on_site' | 'unavailable'
  availability: {
    monday: { start: string; end: string; available: boolean }
    tuesday: { start: string; end: string; available: boolean }
    wednesday: { start: string; end: string; available: boolean }
    thursday: { start: string; end: string; available: boolean }
    friday: { start: string; end: string; available: boolean }
    saturday: { start: string; end: string; available: boolean }
    sunday: { start: string; end: string; available: boolean }
  }
  
  // Location & Vehicle
  location: {
    current: string
    coordinates: { lat: number; lng: number }
    lastUpdated: string
    zone: string
    homeBase: string
  }
  
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string
    color: string
    vin: string
    gpsEnabled: boolean
    fuelLevel?: number
    mileage: number
    lastService: string
    nextService: string
    insurance: {
      provider: string
      policyNumber: string
      expiresAt: string
    }
    inspection: {
      expiresAt: string
      status: 'valid' | 'expired' | 'due_soon'
    }
  }
  
  // Job Assignment & Queue
  currentJob?: {
    jobId: string
    jobNumber: string
    startedAt: string
    estimatedCompletion: string
    customerName: string
    address: string
    status: 'en_route' | 'on_site' | 'in_progress' | 'paused'
  }
  
  jobQueue: Array<{
    jobId: string
    jobNumber: string
    scheduledAt: string
    priority: string
    customerName: string
    serviceType: string
    estimatedDuration: number
  }>
  
  // Skills & Certifications
  skills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    certified: boolean
    certificationDate?: string
    expiryDate?: string
  }>
  
  certifications: Array<{
    name: string
    number: string
    issuedBy: string
    issuedDate: string
    expiryDate: string
    status: 'active' | 'expired' | 'pending_renewal'
    documents: string[]
  }>
  
  specializations: string[]
  languages: string[]
  
  // Performance Metrics
  rating: {
    overall: number
    quality: number
    timeliness: number
    communication: number
    professionalism: number
    reviews: number
  }
  
  efficiency: {
    percentage: number
    jobsPerDay: number
    avgJobTime: number
    firstTimeFixRate: number
    callbackRate: number
  }
  
  // Financial & Revenue
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
    thisYear: number
    lifetime: number
  }
  
  compensation: {
    hourlyRate?: number
    commissionRate?: number
    bonusEligible: boolean
    overtimeRate?: number
  }
  
  // Statistics
  statistics: {
    completedJobs: {
      today: number
      thisWeek: number
      thisMonth: number
      thisYear: number
      lifetime: number
    }
    
    customerSatisfaction: {
      averageRating: number
      totalReviews: number
      recommendationRate: number
    }
    
    productivity: {
      hoursWorked: number
      jobsCompleted: number
      revenueGenerated: number
      efficiencyRating: number
    }
    
    safety: {
      incidentFree: number // days
      safetyScore: number
      trainingComplete: boolean
      lastSafetyTraining: string
    }
  }
  
  // Equipment & Inventory
  equipment: Array<{
    id: string
    name: string
    type: string
    serialNumber: string
    condition: 'excellent' | 'good' | 'fair' | 'poor'
    lastMaintenance: string
    nextMaintenance: string
  }>
  
  inventory: Array<{
    partNumber: string
    description: string
    quantity: number
    location: 'truck' | 'warehouse' | 'job_site'
    cost: number
  }>
  
  // Communication & Connectivity
  deviceInfo: {
    mobilePhone: {
      number: string
      model: string
      carrier: string
      dataEnabled: boolean
      gpsEnabled: boolean
      lastSeen: string
    }
    
    tablet?: {
      model: string
      serialNumber: string
      appVersion: string
      lastSync: string
    }
    
    radio?: {
      channel: string
      frequency: string
      batteryLevel: number
      signalStrength: number
    }
  }
  
  // Training & Development
  training: Array<{
    course: string
    completedAt: string
    expiryDate?: string
    certificateUrl?: string
    instructor: string
    score?: number
  }>
  
  // Employment Information
  employment: {
    startDate: string
    department: string
    position: string
    supervisor: string
    employmentType: 'full_time' | 'part_time' | 'contractor'
    probationEndDate?: string
    performanceReviews: Array<{
      date: string
      reviewer: string
      score: number
      notes: string
    }>
  }
  
  // Personal Information
  personal: {
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    dateOfBirth: string
    socialSecurityNumber?: string // encrypted
    driverLicense: {
      number: string
      expiryDate: string
      state: string
      class: string
      restrictions?: string[]
    }
  }
  
  // Timestamps
  createdAt: string
  updatedAt: string
  lastLogin?: string
  lastLocationUpdate: string
}

const statusColors = {
  created: 'text-neutral-500',
  scheduled: 'text-blue-500',
  assigned: 'text-purple-500', 
  dispatched: 'text-indigo-500',
  en_route: 'text-cyan-500',
  on_site: 'text-yellow-500',
  in_progress: 'text-orange-500',
  paused: 'text-amber-500',
  completed: 'text-green-500',
  cancelled: 'text-red-500',
  rescheduled: 'text-pink-500'
}

const priorityColors = {
  low: 'text-neutral-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
  emergency: 'text-red-600 animate-pulse'
}

// Route optimization and analytics interfaces
interface RouteOptimization {
  optimizedRoutes: Array<{
    technicianId: string
    jobs: string[]
    totalDistance: number
    totalTime: number
    savings: {
      timeMinutes: number
      fuelGallons: number
      costDollars: number
    }
    efficiency: number
  }>
  lastOptimized: string
  nextOptimization: string
}

interface DispatchMetrics {
  efficiency: {
    averageResponseTime: number
    firstTimeFixRate: number
    jobCompletionRate: number
    customerSatisfaction: number
    routeOptimization: number
  }
  realTime: {
    activeJobs: number
    techniciansOnDuty: number
    averageJobDuration: number
    todaysRevenue: number
    callsWaiting: number
    emergencyJobs: number
  }
  trends: Array<{
    metric: string
    current: number
    previous: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }>
}

export default function DispatchPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [showBulkAssign, setShowBulkAssign] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'map' | 'analytics'>('board')
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // New enhanced state
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimization | null>(null)
  const [dispatchMetrics, setDispatchMetrics] = useState<DispatchMetrics | null>(null)
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null)
  const [filterZone, setFilterZone] = useState<string>('all')
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [autoDispatch, setAutoDispatch] = useState(false)

  useEffect(() => {
    fetchWorkOrders()
    fetchTechnicians()
  }, [])

  const fetchWorkOrders = async () => {
    try {
      // Generate mock data for development
      // In production, this would fetch from your actual API
      const techNames = ['Mike Tech', 'Sarah Fix', 'Tom Service', 'Amy Repair', 'David Tools', 'Lisa Pro']
      const mockWorkOrders = Array.from({ length: 30 }, (_, i) => ({
        id: 'wo-${i + 1}',
        jobNumber: 'WO-2024-${String(i + 1).padStart(4, '0')}',
        customer: {
          name: ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', 'Diana Prince`][i % 6],
          phone: '(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}',
          address: {
            street: '${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Elm', 'First', 'Second', 'Pine'][i % 6]} St',
            city: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'Plano'][i % 6],
            state: 'TX',
            zipCode: String(78700 + Math.floor(Math.random() * 100))
          }
        },
        serviceType: ['hvac', 'plumbing', 'electrical', 'appliance', 'general', 'maintenance'][i % 6],
        title: [
          'AC Unit Repair',
          'Water Heater Installation',
          'Electrical Panel Upgrade',
          'Dishwasher Repair',
          'General Maintenance',
          'Preventive Maintenance'
        ][i % 6],
        status: ['created', 'scheduled', 'assigned', 'in_progress', 'completed', 'cancelled'][i % 6] as WorkOrder['status'],
        priority: ['low', 'medium', 'high', 'urgent'][i % 4] as WorkOrder['priority`],
        scheduledAt: i % 3 === 0 ? null : new Date(Date.now() + (i * 86400000)).toISOString(),
        technician: i % 2 === 0 ? undefined : {
          id: `tech-${(i % 6) + 1}',
          name: techNames[i % 6],
          phone: '(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}',
          status: ['available', 'busy', 'break'][i % 3] as 'available' | 'busy' | 'break',
          location: ['Downtown', 'North Austin', 'South Austin', 'East Austin', 'Cedar Park'][i % 5],
          skills: [['hvac', 'electrical'], ['plumbing', 'general'], ['electrical', 'appliance'], ['hvac', 'plumbing'], ['general', 'maintenance'], ['electrical', 'hvac']][i % 6],
          rating: 4.2 + (Math.random() * 0.7)
        },
        estimate: {
          total: Math.floor(Math.random() * 4500) + 500
        },
        duration: 1 + Math.floor(Math.random() * 4),
        description: [
          'Customer reports no cooling from AC unit',
          'Install new water heater, remove old unit',
          'Upgrade electrical panel to 200 amp',
          'Dishwasher not draining properly',
          'Annual maintenance check',
          'Quarterly preventive maintenance'
        ][i % 6],
        createdAt: new Date(Date.now() - (i * 3600000)).toISOString(),
        updatedAt: new Date(Date.now() - (i * 1800000)).toISOString()
      }))
      
      setWorkOrders(mockWorkOrders)
    } catch (error) {
      console.error('Error generating work orders:', error)
      setWorkOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const mockTechnicians = [
        {
          id: 'tech-1',
          name: 'Mike Tech',
          phone: '(555) 123-4567',
          status: 'busy',
          location: 'Downtown Austin',
          currentJob: 'WO-2024-0002',
          skills: ['hvac', 'electrical'],
          rating: 4.8,
          completedJobs: 247,
          revenue: 125000
        },
        {
          id: 'tech-2',
          name: 'Sarah Fix',
          phone: '(555) 234-5678',
          status: 'available',
          location: 'Service Center',
          skills: ['plumbing', 'general'],
          rating: 4.6,
          completedJobs: 189,
          revenue: 95000
        },
        {
          id: 'tech-3',
          name: 'Tom Service',
          phone: '(555) 345-6789',
          status: 'busy',
          location: 'North Austin',
          currentJob: 'WO-2024-0008',
          skills: ['electrical', 'appliance'],
          rating: 4.9,
          completedJobs: 312,
          revenue: 185000
        },
        {
          id: 'tech-4',
          name: 'Amy Repair',
          phone: '(555) 456-7890',
          status: 'break',
          location: 'Cedar Park',
          skills: ['hvac', 'plumbing'],
          rating: 4.7,
          completedJobs: 203,
          revenue: 110000
        },
        {
          id: 'tech-5',
          name: 'David Tools',
          phone: '(555) 567-8901',
          status: 'available',
          location: 'South Austin',
          skills: ['general', 'maintenance'],
          rating: 4.5,
          completedJobs: 156,
          revenue: 78000
        },
        {
          id: 'tech-6',
          name: 'Lisa Pro',
          phone: '(555) 678-9012',
          status: 'off_duty',
          location: 'East Austin',
          skills: ['electrical', 'hvac'],
          rating: 4.8,
          completedJobs: 278,
          revenue: 142000
        }
      ]
      
      setTechnicians(mockTechnicians)
    } catch (error) {
      console.error('Error generating technicians:', error)
      setTechnicians([])
    }
  }

  const handleAssignBulk = () => {
    setShowBulkAssign(true)
  }

  const confirmBulkAssign = () => {
    // In a real app, this would assign technicians to selected work orders
    console.log('Assigning work orders:', selectedRows)
    setShowBulkAssign(false)
    setSelectedRows([])
  }

  const getTechStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-red-500'
      case 'break': return 'bg-yellow-500'
      case 'off_duty': return 'bg-neutral-500'
      default: return 'bg-neutral-500'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 text-white'
      case 'high': return 'bg-orange-600 text-white'
      case 'medium': return 'bg-yellow-600 text-white'
      case 'low': return 'bg-green-600 text-white'
      default: return 'bg-neutral-600 text-white'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-neutral-700 text-neutral-300'
      case 'scheduled': return 'bg-neutral-700 text-blue-500'
      case 'assigned': return 'bg-purple-700 text-purple-300'
      case 'in_progress': return 'bg-orange-700 text-orange-300'
      case 'completed': return 'bg-green-700 text-green-300'
      case 'cancelled': return 'bg-red-700 text-red-300'
      default: return 'bg-neutral-700 text-neutral-300'
    }
  }

  const availableTechnicians = technicians.filter(t => t.status === 'available')
  const busyTechnicians = technicians.filter(t => t.status === 'busy')
  const onBreakTechnicians = technicians.filter(t => t.status === 'break')

  const todaysRevenue = workOrders
    .filter(wo => wo.status === 'completed' && 
      new Date(wo.updatedAt).toDateString() === new Date().toDateString())
    .reduce((sum, wo) => sum + wo.estimate.total, 0)

  const completedToday = workOrders.filter(wo => 
    wo.status === 'completed' && 
    new Date(wo.updatedAt).toDateString() === new Date().toDateString()
  ).length

  const columns = [
    {
      key: 'jobNumber',
      label: 'Job #',
      width: '120px',
      render: (workOrder: unknown) => (
        <div className="font-mono text-sm">{workOrder.jobNumber}</div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (workOrder: unknown) => (
        <div>
          <div className="font-medium">{workOrder.customer.name}</div>
          <div className="text-sm text-muted-foreground flex items-center mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            {workOrder.customer.address.city}, {workOrder.customer.address.state}
          </div>
        </div>
      )
    },
    {
      key: 'title',
      label: 'Service',
      render: (workOrder: unknown) => (
        <div>
          <div className="font-medium">{workOrder.title}</div>
          <div className="text-sm text-muted-foreground capitalize">{workOrder.serviceType}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (workOrder: unknown) => (
        <div className={'flex items-center ${statusColors[workOrder.status as keyof typeof statusColors]}'}>
          {workOrder.status === 'completed' ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : workOrder.status === 'in_progress' ? (
            <Circle className="h-4 w-4 mr-2 fill-current" />
          ) : (
            <Circle className="h-4 w-4 mr-2" />
          )}
          <span className="capitalize text-sm">{workOrder.status.replace('_', ' ')}</span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '100px',
      render: (workOrder: unknown) => (
        <div className={'flex items-center ${priorityColors[workOrder.priority as keyof typeof priorityColors]}'}>
          {workOrder.priority === 'urgent' && <AlertTriangle className="h-4 w-4 mr-1" />}
          <span className="capitalize text-sm">{workOrder.priority}</span>
        </div>
      )
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled',
      width: '150px',
      render: (workOrder: unknown) => workOrder.scheduledAt ? (
        <div className="text-sm">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(workOrder.scheduledAt).toLocaleDateString()}
          </div>
          <div className="flex items-center text-muted-foreground mt-1">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(workOrder.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Not scheduled</span>
      )
    },
    {
      key: 'technician',
      label: 'Technician',
      width: '140px',
      render: (workOrder: unknown) => workOrder.technician ? (
        <div>
          <div className="font-medium text-sm">{workOrder.technician.name}</div>
          <div className="text-xs text-muted-foreground flex items-center mt-1">
            <Phone className="h-3 w-3 mr-1" />
            {workOrder.technician.phone}
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Unassigned</span>
      )
    },
    {
      key: 'estimate',
      label: 'Value',
      width: '100px',
      align: 'right',
      render: (workOrder: unknown) => (
        <div className="font-medium">
          ${workOrder.estimate.total.toLocaleString()}
        </div>
      )
    }
  ]

  const bulkActions = [
    {
      label: 'Assign Technician',
      icon: User,
      onClick: handleAssignBulk,
      variant: 'default' as const
    },
    {
      label: 'Schedule',
      icon: Calendar,
      onClick: (selectedWorkOrders: WorkOrder[]) => {
        console.log('Scheduling work orders:', selectedWorkOrders)
      },
      variant: 'outline' as const
    }
  ]

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Created', value: 'created' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Assigned', value: 'assigned' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' }
      ],
      value: 'all',
      onChange: (value: string) => console.log('Status filter:', value)
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' }
      ],
      value: 'all',
      onChange: (value: string) => console.log('Priority filter:', value)
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      
      <InlineConfirmBar
        isOpen={showBulkAssign}
        title="Assign Technician"
        description={'Assign a technician to ${selectedRows.length} selected work order${selectedRows.length > 1 ? 's' : '}?'}
        confirmText="Assign"
        onConfirm={confirmBulkAssign}
        onCancel={() => setShowBulkAssign(false)}
      />
      
      {/* Enhanced Header with Stats */}
      <div className="border-b border-neutral-800 bg-neutral-900">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Dispatch Board</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Schedule, assign and track work orders across your team
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Work Order
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Available</p>
                  <p className="text-lg font-semibold text-white">{availableTechnicians.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-600/10 rounded-lg p-2">
                  <Wrench className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Busy</p>
                  <p className="text-lg font-semibold text-white">{busyTechnicians.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-800 rounded-lg p-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Completed</p>
                  <p className="text-lg font-semibold text-white">{completedToday}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Revenue</p>
                  <p className="text-lg font-semibold text-white">${todaysRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600/10 rounded-lg p-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Urgent</p>
                  <p className="text-lg font-semibold text-white">
                    {workOrders.filter(wo => wo.priority === 'urgent').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>
              
              <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded">
                <button
                  onClick={() => setViewMode('list')}
                  className={'px-3 py-1.5 text-xs font-medium rounded-l flex items-center gap-1.5 ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-neutral-400 hover:text-white'
              }'}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('board')}
                  className={'px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
                    viewMode === 'board' ? 'bg-blue-500 text-white' : 'text-neutral-400 hover:text-white'
              }'}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Board
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={'px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
                    viewMode === 'analytics' ? 'bg-blue-500 text-white' : 'text-neutral-400 hover:text-white'
              }'}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={'px-3 py-1.5 text-xs font-medium rounded-r flex items-center gap-1.5 ${
                    viewMode === 'map' ? 'bg-blue-500 text-white' : 'text-neutral-400 hover:text-white'
              }'}
                >
                  <Map className="h-3.5 w-3.5" />
                  Map
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search work orders..."
                  className="bg-neutral-800 border border-neutral-700 rounded pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-400 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {viewMode === 'board' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Technicians Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 h-fit">
                <h3 className="text-base font-medium text-white mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Team ({technicians.length})
                </h3>
                <div className="space-y-3">
                  {technicians.map((tech) => (
                    <div key={tech.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 hover:bg-neutral-750 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                          <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-neutral-300" />
                          </div>
                          <div className={'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-800 ${getTechStatusColor(tech.status)}'}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{tech.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-neutral-400">{tech.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs text-neutral-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{tech.location}</span>
                        </div>
                        {tech.currentJob && (
                          <div className="flex items-center gap-1 text-orange-400">
                            <Wrench className="h-3 w-3" />
                            <span>Working on {tech.currentJob}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tech.skills.map((skill: unknown) => (
                            <span key={skill} className="bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded text-xs capitalize">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
                {/* Unscheduled Column */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <h3 className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                      <Circle className="h-4 w-4" />
                      Unscheduled
                      <span className="bg-neutral-700 text-neutral-300 text-xs px-2 py-0.5 rounded-full ml-auto">
                        {workOrders.filter(wo => wo.status === 'created').length}
                      </span>
                    </h3>
                  </div>
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                    {workOrders.filter(wo => wo.status === 'created').map((order) => (
                      <div key={order.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 cursor-pointer hover:bg-neutral-750 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className={'text-xs px-2 py-0.5 rounded font-medium ${getPriorityBadgeColor(order.priority)}'}>
                            {order.priority.toUpperCase()}
                          </span>
                          <button className="text-neutral-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-medium text-white mb-1">{order.title}</h4>
                        <p className="text-xs text-neutral-400 mb-2">{order.customer.name}</p>
                        <div className="space-y-1 text-xs text-neutral-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{order.customer.address.city}, {order.customer.address.state}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span>{order.duration}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${order.estimate.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheduled Column */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <h3 className="text-sm font-medium text-blue-400 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Scheduled
                      <span className="bg-neutral-800 text-blue-500 text-xs px-2 py-0.5 rounded-full ml-auto">
                        {workOrders.filter(wo => wo.status === 'scheduled').length}
                      </span>
                    </h3>
                  </div>
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                    {workOrders.filter(wo => wo.status === 'scheduled').map((order) => (
                      <div key={order.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 cursor-pointer hover:bg-neutral-750 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className={'text-xs px-2 py-0.5 rounded font-medium ${getPriorityBadgeColor(order.priority)}'}>
                            {order.priority.toUpperCase()}
                          </span>
                          <button className="text-neutral-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-medium text-white mb-1">{order.title}</h4>
                        <p className="text-xs text-neutral-400 mb-2">{order.customer.name}</p>
                        {order.scheduledAt && (
                          <div className="flex items-center gap-1 text-xs text-blue-400 mb-2">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(order.scheduledAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="space-y-1 text-xs text-neutral-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{order.customer.address.city}, {order.customer.address.state}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span>{order.duration}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${order.estimate.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned/In Progress Column */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <h3 className="text-sm font-medium text-orange-400 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      In Progress
                      <span className="bg-orange-900 text-orange-300 text-xs px-2 py-0.5 rounded-full ml-auto">
                        {workOrders.filter(wo => ['assigned', 'in_progress'].includes(wo.status)).length}
                      </span>
                    </h3>
                  </div>
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                    {workOrders.filter(wo => ['assigned', 'in_progress'].includes(wo.status)).map((order) => (
                      <div key={order.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 cursor-pointer hover:bg-neutral-750 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className={'text-xs px-2 py-0.5 rounded font-medium ${getPriorityBadgeColor(order.priority)}'}>
                            {order.priority.toUpperCase()}
                          </span>
                          <button className="text-neutral-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-medium text-white mb-1">{order.title}</h4>
                        <p className="text-xs text-neutral-400 mb-2">{order.customer.name}</p>
                        {order.technician && (
                          <div className="flex items-center gap-1 text-xs text-green-400 mb-2">
                            {order.status === 'in_progress' ? <Wrench className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                            <span>{order.technician.name} - {order.status === 'in_progress' ? 'Working' : 'En Route'}</span>
                          </div>
                        )}
                        <div className="space-y-1 text-xs text-neutral-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{order.customer.address.city}, {order.customer.address.state}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span>{order.duration}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${order.estimate.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed Column */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <h3 className="text-sm font-medium text-green-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                      <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded-full ml-auto">
                        {workOrders.filter(wo => wo.status === 'completed').length}
                      </span>
                    </h3>
                  </div>
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                    {workOrders.filter(wo => wo.status === 'completed').map((order) => (
                      <div key={order.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 cursor-pointer hover:bg-neutral-750 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <span className={'text-xs px-2 py-0.5 rounded font-medium ${getPriorityBadgeColor(order.priority)}'}>
                            {order.priority.toUpperCase()}
                          </span>
                          <button className="text-neutral-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-medium text-white mb-1">{order.title}</h4>
                        <p className="text-xs text-neutral-400 mb-2">{order.customer.name}</p>
                        {order.technician && (
                          <div className="flex items-center gap-1 text-xs text-green-400 mb-2">
                            <CheckCircle className="h-3 w-3" />
                            <span>Completed by {order.technician.name}</span>
                          </div>
                        )}
                        <div className="space-y-1 text-xs text-neutral-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{order.customer.address.city}, {order.customer.address.state}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span>{order.duration}h</span>
                            </div>
                            <div className="flex items-center gap-1 text-green-400">
                              <DollarSign className="h-3 w-3" />
                              <span>${order.estimate.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-6">
            {/* Real-time Dispatch Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Efficiency Metrics */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-500" />
                  Efficiency Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Response Time</span>
                    <span className="text-white font-medium">12.5 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">First-Time Fix</span>
                    <span className="text-green-400 font-medium">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Job Completion</span>
                    <span className="text-green-400 font-medium">97.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Route Optimization</span>
                    <span className="text-blue-400 font-medium">87.3%</span>
                  </div>
                </div>
              </div>

              {/* Live Operations */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Live Operations
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Active Jobs</span>
                    <span className="text-orange-400 font-medium">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Techs on Duty</span>
                    <span className="text-green-400 font-medium">12/15</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Avg Job Duration</span>
                    <span className="text-white font-medium">2.4 hrs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Emergency Queue</span>
                    <span className="text-red-400 font-medium">3</span>
                  </div>
                </div>
              </div>

              {/* Performance Trends */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Performance Trends
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Customer Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-400 font-medium">+2.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Revenue per Tech</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-400 font-medium">+8.4%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Call-Back Rate</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-3 h-3 text-green-500" />
                      <span className="text-green-400 font-medium">-1.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Schedule Adherence</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-400 font-medium">+5.7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Optimization Results */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-indigo-500" />
                  Route Optimization Results
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-optimize Routes
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">2.3 hrs</div>
                  <div className="text-sm text-neutral-400">Time Saved Daily</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">47 miles</div>
                  <div className="text-sm text-neutral-400">Distance Reduced</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">$187</div>
                  <div className="text-sm text-neutral-400">Daily Fuel Savings</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-400">91%</div>
                  <div className="text-sm text-neutral-400">Efficiency Score</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-medium text-white">Optimized Technician Routes</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {['Mike Rodriguez', 'Sarah Davis', 'Tom Chen', 'Amy Foster'].map((tech, i) => (
                    <div key={tech} className="bg-neutral-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-white">{tech}</h5>
                        <span className="text-green-400 text-sm font-medium">
                          +{Math.floor(Math.random() * 60) + 15} min saved
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Jobs Assigned:</span>
                          <span className="text-white">{Math.floor(Math.random() * 3) + 3}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Total Distance:</span>
                          <span className="text-white">{Math.floor(Math.random() * 20) + 15} miles</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Efficiency:</span>
                          <span className="text-green-400">{Math.floor(Math.random() * 15) + 85}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Technician Tracking */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Real-time Technician Tracking
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {technicians.slice(0, 6).map((tech, i) => (
                  <div key={tech.id} className="bg-neutral-800/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-neutral-300" />
                        </div>
                        <div className={'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-800 ${getTechStatusColor(tech.status)}'}></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{tech.name}</h4>
                        <p className="text-sm text-neutral-400 capitalize">{tech.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span className="text-neutral-300">{tech.location}</span>
                      </div>
                      {tech.currentJob && (
                        <div className="flex items-center gap-2">
                          <Wrench className="w-3 h-3 text-orange-400" />
                          <span className="text-orange-300">On Job: {tech.currentJob}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-300">Updated: {Math.floor(Math.random() * 5) + 1}m ago</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
                        <div className="text-xs text-neutral-400">Today's Jobs</div>'
                        <div className="text-white font-medium">{tech.completedJobs}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 h-full">
            <div className="flex items-center justify-center h-full text-neutral-400">
              <div className="text-center">
                <Map className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Interactive Map View</p>
                <p className="text-sm mt-2 max-w-md">
                  See real-time technician locations, work order addresses, and optimal routing
                </p>
                <p className="text-xs mt-3 text-neutral-500">(Map integration coming soon)</p>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 h-full overflow-hidden">
            {(DataTable as any)({
              data: workOrders,
              columns: columns,
              loading: loading,
              searchable: true,
              searchPlaceholder: "Search work orders...",
              selectable: true,
              selectedRows: selectedRows,
              onSelectionChange: setSelectedRows,
              getRowId: (workOrder: unknown) => workOrder.id,
              bulkActions: bulkActions,
              filters: filters,
              onRowClick: (workOrder: unknown) => {
                console.log('Navigate to work order:', workOrder.id)
              },
              emptyState: (
                <div className="text-center py-12">
                  <div className="text-neutral-300 text-lg mb-2">No work orders found</div>
                  <p className="text-neutral-500 mb-4">
                    Create your first work order to get started
                  </p>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Work Order
                  </Button>
                </div>
              ),
              density: "comfortable",
              className: "h-full dispatch-table-dark"
            })}
          </div>
        )}
      </div>
    </div>
  )
}
