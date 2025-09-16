'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  MoreVertical,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  DollarSign,
  Filter,
  Send,
  Copy,
  Archive,
  Trash2,
  User,
  Building,
  Wrench,
  FileText,
  Receipt,
  Tag,
  MessageSquare,
  Camera,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Settings,
  Shield,
  Award,
  Timer,
  MapPin as RouteIcon,
  Navigation,
  Zap,
  Battery,
  Wifi,
  Signal,
  Radio,
  Video,
  Headphones,
  Gauge,
  Target,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer,
  Clipboard,
  ClipboardList,
  ClipboardCheck,
  Package,
  Truck,
  Home,
  Users,
  UserCheck,
  UserX,
  Mail,
  MessageCircle,
  Mic,
  MicOff,
  Layers,
  Grid,
  List,
  LayoutGrid,
  Map,
  Bookmark,
  BookmarkPlus,
  Hash,
  AtSign,
  Percent,
  Hash as NumberIcon
} from 'lucide-react'

import { DataTable } from '@/components/ui/data-table'

interface WorkOrder {
  id: string
  jobNumber: string
  
  // Customer & Property Information
  customer: {
    id: string
    name: string
    email: string
    phone: string
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
    }
    type: 'residential' | 'commercial' | 'industrial'
    accountStatus: 'active' | 'inactive' | 'vip' | 'new' | 'suspended'
    paymentStatus: 'current' | 'overdue' | 'prepaid' | 'credit_hold'
    serviceHistory: {
      totalJobs: number
      lastService: string
      averageRating: number
      totalSpent: number
      preferredTechnician?: string
    }
    communicationPreferences: {
      email: boolean
      sms: boolean
      phone: boolean
      portal: boolean
    }
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
    }
  }
  
  property: {
    id: string
    type: 'residential' | 'commercial' | 'industrial' | 'multi_unit'
    subtype?: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      unit?: string
      coordinates?: { lat: number; lng: number }
      accessInstructions?: string
      keyLocation?: string
      securityCode?: string
    }
    details: {
      yearBuilt?: number
      squareFootage?: number
      stories?: number
      units?: number
      occupancyType?: 'owner_occupied' | 'tenant_occupied' | 'vacant'
    }
    utilities: {
      electric: { provider?: string; accountNumber?: string }
      gas: { provider?: string; accountNumber?: string }
      water: { provider?: string; accountNumber?: string }
    }
    hazards?: Array<{
      type: string
      description: string
      severity: 'low' | 'medium' | 'high'
      mitigation?: string
    }>
  }
  
  // Service Details
  serviceType: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'general' | 'maintenance' | 'emergency' | 'inspection'
  serviceCategory: 'repair' | 'installation' | 'maintenance' | 'inspection' | 'emergency' | 'consultation' | 'warranty'
  title: string
  description: string
  problemDescription: string
  customerComplaint: string
  symptoms: string[]
  equipmentAffected?: Array<{
    type: string
    brand: string
    model: string
    serialNumber?: string
    age?: number
    location: string
  }>
  
  // Status & Priority
  status: 'draft' | 'quoted' | 'approved' | 'scheduled' | 'dispatched' | 'en_route' | 'on_site' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | 'on_hold' | 'rescheduled'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'emergency' | 'critical'
  urgencyReason?: string
  
  // Scheduling & Timeline
  scheduledAt: string | null
  dispatchedAt?: string
  arrivedAt?: string
  startedAt?: string
  completedAt?: string
  duration?: {
    estimated: number // minutes
    actual?: number
    travel?: number
    onSite?: number
    labor?: number
  }
  
  timeWindow?: {
    start: string
    end: string
    preference: 'morning' | 'afternoon' | 'evening' | 'anytime'
    confirmed: boolean
  }
  
  // Assignment & Team
  technician?: {
    id: string
    name: string
    phone: string
    email: string
    skills: string[]
    rating: number
    efficiency: number
    location?: {
      current: string
      coordinates?: { lat: number; lng: number }
      lastUpdated: string
    }
    vehicle?: {
      id: string
      make: string
      model: string
      licensePlate: string
    }
  }
  
  backupTechnician?: {
    id: string
    name: string
    phone: string
  }
  
  supervisor?: {
    id: string
    name: string
    phone: string
  }
  
  // Pricing & Financial
  estimate: {
    // Labor breakdown
    labor: {
      hours: number
      rate: number
      overtime: number
      total: number
      breakdown: Array<{
        description: string
        hours: number
        rate: number
        total: number
      }>
    }
    
    // Materials breakdown
    materials: {
      parts: Array<{
        partNumber: string
        description: string
        quantity: number
        unitCost: number
        markup: number
        total: number
        supplier?: string
        warranty?: string
      }>
      total: number
    }
    
    // Additional costs
    permits: number
    disposal: number
    travel: number
    other: Array<{
      description: string
      amount: number
    }>
    
    // Totals
    subtotal: number
    discount: {
      amount: number
      percentage: number
      reason?: string
    }
    tax: {
      rate: number
      amount: number
    }
    total: number
    
    // Approval tracking
    approvals: Array<{
      amount: number
      approvedBy: string
      approvedAt: string
      method: 'verbal' | 'email' | 'signature' | 'portal'
    }>
  }
  
  // Invoice & Payment
  invoice?: {
    id: string
    number: string
    status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'disputed'
    total: number
    amountPaid: number
    amountDue: number
    sentAt?: string
    paidAt?: string
    paymentMethod?: 'cash' | 'check' | 'credit_card' | 'ach' | 'financing'
  }
  
  // Quality & Safety
  qualityChecklist: Array<{
    item: string
    status: 'pending' | 'completed' | 'failed' | 'n/a'
    notes?: string
    checkedBy?: string
    checkedAt?: string
  }>
  
  safetyRequirements: Array<{
    requirement: string
    mandatory: boolean
    completed: boolean
    verifiedBy?: string
    verifiedAt?: string
  }>
  
  // Parts & Inventory
  partsUsed: Array<{
    partNumber: string
    description: string
    quantity: number
    cost: number
    source: 'truck' | 'warehouse' | 'supplier'
    warrantyMonths?: number
  }>
  
  partsOrdered: Array<{
    partNumber: string
    description: string
    quantity: number
    supplier: string
    orderDate: string
    expectedDelivery?: string
    cost: number
    status: 'ordered' | 'shipped' | 'delivered' | 'installed'
  }>
  
  // Documentation & Communication
  attachments: Array<{
    id: string
    name: string
    type: string
    category: 'photo' | 'document' | 'video' | 'audio' | 'diagram'
    url: string
    uploadedAt: string
    uploadedBy: string
    description?: string
    tags?: string[]
  }>
  
  photos: Array<{
    id: string
    url: string
    type: 'before' | 'during' | 'after' | 'problem' | 'solution' | 'damage'
    description: string
    location: string
    timestamp: string
    gpsCoordinates?: { lat: number; lng: number }
  }>
  
  workLog: Array<{
    id: string
    timestamp: string
    activity: string
    description: string
    technician: string
    duration?: number
    photos?: string[]
    location?: { lat: number; lng: number }
  }>
  
  notes: Array<{
    id: string
    text: string
    author: string
    type: 'general' | 'technical' | 'customer' | 'internal' | 'safety' | 'billing'
    createdAt: string
    priority: 'low' | 'medium' | 'high'
    tags?: string[]
  }>
  
  customerCommunications: Array<{
    id: string
    type: 'call' | 'email' | 'sms' | 'portal' | 'in_person'
    direction: 'inbound' | 'outbound'
    summary: string
    details: string
    timestamp: string
    contactedBy: string
    response?: string
    followUpRequired: boolean
    followUpDate?: string
  }>
  
  // Warranty & Follow-up
  warranty: {
    labor: {
      months: number
      startDate: string
      endDate: string
      terms: string
    }
    parts: Array<{
      partNumber: string
      months: number
      startDate: string
      endDate: string
      supplier: string
    }>
    systemWarranty?: {
      months: number
      startDate: string
      endDate: string
      coverage: string
    }
  }
  
  followUp: {
    required: boolean
    type?: 'maintenance' | 'warranty_check' | 'satisfaction' | 'upsell'
    scheduledDate?: string
    completed?: boolean
    completedAt?: string
    notes?: string
  }
  
  // Customer Feedback & Ratings
  customerFeedback?: {
    rating: {
      overall: number
      quality: number
      timeliness: number
      professionalism: number
      cleanliness: number
    }
    comments: string
    wouldRecommend: boolean
    submittedAt: string
    reviewPlatforms?: Array<{
      platform: string
      rating: number
      posted: boolean
    }>
  }
  
  // Performance Metrics
  metrics: {
    firstTimeFixRate: boolean
    onTimeArrival: boolean
    withinEstimate: boolean
    customerSatisfaction?: number
    profitMargin: number
    efficiency: number
  }
  
  // Compliance & Regulations
  permits: Array<{
    type: string
    number: string
    issuedBy: string
    issuedDate: string
    expiryDate: string
    status: 'pending' | 'approved' | 'expired'
    cost: number
  }>
  
  inspections: Array<{
    type: string
    inspector: string
    scheduledDate: string
    completedDate?: string
    status: 'scheduled' | 'passed' | 'failed' | 'pending'
    notes?: string
    violations?: string[]
  }>
  
  // Tags & Classification
  tags: string[]
  customFields?: Record<string, unknown>
  
  // Audit Trail
  statusHistory: Array<{
    status: WorkOrder['status']
    timestamp: string
    changedBy: string
    reason?: string
    location?: { lat: number; lng: number }
  }>
  
  // System Fields
  createdAt: string
  updatedAt: string
  createdBy: string
  lastModifiedBy: string
  version: number
  source: 'phone' | 'online' | 'mobile' | 'portal' | 'referral' | 'repeat'
}

const statusColors = {
  draft: 'text-neutral-500',
  quoted: 'text-cyan-500',
  approved: 'text-green-600',
  scheduled: 'text-blue-500',
  dispatched: 'text-purple-500',
  en_route: 'text-indigo-500',
  on_site: 'text-yellow-500',
  in_progress: 'text-orange-500',
  paused: 'text-amber-500',
  completed: 'text-green-500',
  cancelled: 'text-red-500',
  on_hold: 'text-yellow-600',
  rescheduled: 'text-pink-500'
}

const priorityColors = {
  low: 'text-neutral-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
  emergency: 'text-red-600 font-bold animate-pulse',
  critical: 'text-red-700 font-bold animate-pulse'
}

// Work Order Analytics Interface
interface WorkOrderAnalytics {
  productivity: {
    completionRate: number
    averageDuration: number
    firstTimeFixRate: number
    reworkRate: number
    onTimePerformance: number
  }
  
  financial: {
    totalRevenue: number
    averageJobValue: number
    profitMargin: number
    collectionRate: number
    outstandingAmount: number
  }
  
  quality: {
    customerSatisfaction: number
    complaintRate: number
    callbackRate: number
    warrantyClaimRate: number
    qualityScore: number
  }
  
  efficiency: {
    schedulingAccuracy: number
    resourceUtilization: number
    travelOptimization: number
    partAvailability: number
    technicalEfficiency: number
  }
  
  trends: Array<{
    metric: string
    current: number
    previous: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
    period: string
  }>
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>(')
  
  // Enhanced state for new features
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'timeline' | 'analytics' | 'workflow'>('table')
  const [analytics, setAnalytics] = useState<WorkOrderAnalytics | null>(null)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  const fetchWorkOrders = async () => {
    try {
      // Generate comprehensive mock data
      const mockWorkOrders: unknown[] = Array.from({ length: 50 }, (_, i) => ({
        id: 'wo-${i + 1}',
        jobNumber: 'WO-2024-${String(i + 1).padStart(4, '0')}',
        customer: {
          id: 'cust-${(i % 10) + 1}',
          name: [
            'John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson',
            'Diana Prince', 'Mike Davis', 'Sarah Connor', 'Tony Stark', 'Bruce Wayne`
          ][i % 10],
          email: `customer${(i % 10) + 1}@email.com`,
          phone: '(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}',
          address: {
            street: '${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Elm', 'Pine', 'Cedar'][i % 5]} St',
            city: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth'][i % 5],
            state: 'TX',
            zipCode: String(78700 + Math.floor(Math.random() * 100))
          }
        },
        property: {
          type: i % 3 === 0 ? 'commercial' : 'residential',
          address: {
            street: '${Math.floor(Math.random() * 9999) + 1} ${['Business', 'Office', 'Industrial', 'Retail', 'Corporate'][i % 5]} Dr',
            city: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth'][i % 5],
            state: 'TX',
            zipCode: String(78700 + Math.floor(Math.random() * 100))
          }
        },
        serviceType: ['hvac', 'plumbing', 'electrical', 'appliance', 'general', 'maintenance'][i % 6],
        category: ['repair', 'installation', 'maintenance', 'inspection', 'emergency'][i % 5],
        title: [
          'AC Unit Repair - No Cooling',
          'Water Heater Installation',
          'Electrical Panel Upgrade',
          'Dishwasher Repair',
          'General Maintenance Check',
          'Furnace Inspection',
          'Plumbing Leak Repair',
          'Outlet Installation',
          'Appliance Replacement',
          'HVAC System Cleaning'
        ][i % 10],
        description: [
          'Customer reports AC unit not cooling properly. Need to diagnose and repair.',
          'Install new 50-gallon water heater, remove old unit.',
          'Upgrade electrical panel from 100 to 200 amp service.',
          'Dishwasher not draining properly, needs repair.',
          'Annual maintenance check for HVAC system.',
          'Pre-winter furnace inspection and tune-up.',
          'Kitchen sink leak repair under cabinet.',
          'Install GFCI outlets in bathroom.',
          'Replace broken garbage disposal unit.',
          'Clean and service entire HVAC system.'
        ][i % 10],
        status: ['draft', 'scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled', 'on_hold'][i % 7] as WorkOrder['status'],
        priority: ['low', 'medium', 'high', 'urgent', 'emergency'][i % 5] as WorkOrder['priority'],
        scheduledAt: i % 3 === 0 ? null : new Date(Date.now() + (i * 86400000)).toISOString(),
        completedAt: i % 7 === 0 ? new Date(Date.now() - (i * 3600000)).toISOString() : null,
        technician: i % 2 === 0 ? undefined : {
          id: 'tech-${(i % 5) + 1}',
          name: ['Mike Tech', 'Sarah Fix', 'Tom Service', 'Amy Repair', 'David Tools`][i % 5],
          phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          email: `tech${(i % 5) + 1}@company.com`
        },
        estimate: {
          labor: Math.floor(Math.random() * 2000) + 200,
          materials: Math.floor(Math.random() * 1500) + 100,
          tax: 0,
          total: 0,
          laborHours: Math.floor(Math.random() * 8) + 1,
          laborRate: [65, 75, 85, 95, 105][i % 5],
          materialCost: Math.floor(Math.random() * 1500) + 100
        },
        invoice: i % 4 === 0 ? {
          id: 'inv-${i + 1}',
          number: 'INV-2024-${String(i + 1).padStart(4, '0')}',
          status: ['draft', 'sent', 'paid', 'overdue'][i % 4] as 'draft' | 'sent' | 'paid' | 'overdue',
          total: Math.floor(Math.random() * 4000) + 500
        } : undefined,
        attachments: [
          {
            id: 'att-${i}-1',
            name: 'before_photo.jpg',
            type: 'image/jpeg',
            url: '/attachments/before_photo.jpg',
            uploadedAt: new Date(Date.now() - (i * 3600000)).toISOString()
          }
        ],
        notes: [
          {
            id: 'note-${i}-1',
            text: 'Initial assessment completed. Need to order parts.',
            author: 'Mike Tech',
            createdAt: new Date(Date.now() - (i * 3600000)).toISOString()
          }
        ],
        tags: [
          ['urgent', 'warranty'],
          ['routine', 'commercial'],
          ['emergency', 'after-hours'],
          ['maintenance', 'contract'],
          ['installation', 'new-customer']
        ][i % 5],
        createdAt: new Date(Date.now() - (i * 3600000)).toISOString(),
        updatedAt: new Date(Date.now() - (i * 1800000)).toISOString(),
        createdBy: 'System'
      }))

      // Calculate totals for estimates
      mockWorkOrders.forEach(wo => {
        wo.estimate.tax = (wo.estimate.labor + wo.estimate.materials) * 0.08
        wo.estimate.total = wo.estimate.labor + wo.estimate.materials + wo.estimate.tax
      })
      
      setWorkOrders(mockWorkOrders)
    } catch (error) {
      console.error('Error generating work orders: ', error)
      setWorkOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = (action: string) => {
    setBulkAction(action)
    setShowBulkActions(true)
  }

  const confirmBulkAction = () => {
    console.log('Performing ${bulkAction} on work orders:', selectedRows)
    setShowBulkActions(false)
    setSelectedRows([])
    setBulkAction(')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Circle className="h-4 w-4 fill-current" />
      case 'cancelled': return <Circle className="h-4 w-4" />
      default: return <Circle className="h-4 w-4" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'urgent': return <AlertTriangle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  const columns = [
    {
      key: 'jobNumber',
      label: 'Job #',
      width: '120px',
      render: (workOrder: unknown) => (
        <div className="font-mono text-sm font-medium text-blue-400">
          {workOrder.jobNumber}
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (workOrder: unknown) => (
        <div>
          <div className="font-medium">{workOrder.customer.name}</div>
          <div className="text-sm text-muted-foreground flex items-center mt-1">
            <Building className="h-3 w-3 mr-1" />
            {workOrder.property.type === 'commercial' ? 'Commercial' : 'Residential'}
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
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <span className="capitalize">{workOrder.serviceType}</span>
            <span>•</span>
            <span className="capitalize">{workOrder.category}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (workOrder: unknown) => (
        <div className={'flex items-center ${statusColors[workOrder.status as keyof typeof statusColors]}'}>
          {getStatusIcon(workOrder.status)}
          <span className="capitalize text-sm ml-2">{workOrder.status.replace('_', ' ')}</span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '100px',
      render: (workOrder: unknown) => (
        <div className={'flex items-center ${priorityColors[workOrder.priority as keyof typeof priorityColors]}'}>
          {getPriorityIcon(workOrder.priority)}
          <span className="capitalize text-sm ml-1">{workOrder.priority}</span>
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
        <div>
          <div className="font-medium">
            ${workOrder.estimate.total.toLocaleString()}
          </div>
          {workOrder.invoice && (
            <div className={'text-xs mt-1 ${
              workOrder.invoice.status === 'paid' ? 'text-green-600' :
              workOrder.invoice.status === 'overdue' ? 'text-red-600' :
              `text-yellow-600'}'}>'
              {workOrder.invoice.status.toUpperCase()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      width: '120px',
      render: (workOrder: unknown) => (
        <div className="flex flex-wrap gap-1">
          {workOrder.tags.slice(0, 2).map((tag: unknown, index: unknown) => (
            <span key={index} className="bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded text-xs">
              {tag}
            </span>
          ))}
          {workOrder.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{workOrder.tags.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: ',
      width: '50px',
      render: (workOrder: unknown) => (
        <div className="flex items-center">
          <button className="text-neutral-400 hover:text-white p-1">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const bulkActions = [
    {
      label: 'Assign Technician',
      icon: User,
      onClick: () => handleBulkAction('assign'),
      variant: 'default' as const
    },
    {
      label: 'Schedule',
      icon: Calendar,
      onClick: () => handleBulkAction('schedule'),
      variant: 'outline' as const
    },
    {
      label: 'Update Status',
      icon: Circle,
      onClick: () => handleBulkAction('status'),
      variant: 'outline' as const
    },
    {
      label: 'Send Invoice',
      icon: Send,
      onClick: () => handleBulkAction('invoice'),
      variant: 'outline' as const
    },
    {
      label: 'Archive',
      icon: Archive,
      onClick: () => handleBulkAction('archive'),
      variant: 'outline' as const,
      destructive: true
    }
  ]

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Dispatched', value: 'dispatched' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'On Hold', value: 'on_hold' },
        { label: 'Cancelled', value: 'cancelled' }
      ],
      value: 'all',
      onChange: (value: string) => console.log('Status filter: ', value)
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Emergency', value: 'emergency' },
        { label: 'Urgent', value: 'urgent' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
      ],
      value: 'all',
      onChange: (value: string) => console.log('Priority filter: ', value)
    },
    {
      key: 'serviceType',
      label: 'Service Type',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        { label: 'HVAC', value: 'hvac' },
        { label: 'Plumbing', value: 'plumbing' },
        { label: 'Electrical', value: 'electrical' },
        { label: 'Appliance', value: 'appliance' },
        { label: 'General', value: 'general' },
        { label: 'Maintenance', value: 'maintenance' }
      ],
      value: 'all',
      onChange: (value: string) => console.log('Service type filter: ', value)
    }
  ]

  // Quick stats
  const totalWorkOrders = workOrders.length
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed').length
  const inProgressWorkOrders = workOrders.filter(wo => wo.status === 'in_progress').length
  const urgentWorkOrders = workOrders.filter(wo => ['urgent', 'emergency'].includes(wo.priority)).length
  const totalRevenue = workOrders
    .filter(wo => wo.status === 'completed`)
    .reduce((sum, wo) => sum + wo.estimate.total, 0)

  return (
    <div className="min-h-screen bg-neutral-950">
      
      <InlineConfirmBar
        isOpen={showBulkActions}
        title={'${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} Work Orders'}
        description={'${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} ${selectedRows.length} selected work order${selectedRows.length > 1 ? 's' : '}?'}
        confirmText="Confirm"
        onConfirm={confirmBulkAction}
        onCancel={() => setShowBulkActions(false)}
      />
      
      {/* Header with Stats */}
      <div className="border-b border-neutral-800 bg-neutral-900">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Work Orders</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Manage all service requests and jobs across your business
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded">
                <button
                  onClick={() => setViewMode('table')}
                  className={'px-3 py-1.5 text-xs font-medium rounded-l flex items-center gap-1.5 ${
                    viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}'}
                >
                  <List className="h-3.5 w-3.5" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={'px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
                    viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}'}
                >
                  <Grid className="h-3.5 w-3.5" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={'px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
                    viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}'}
                >
                  <Activity className="h-3.5 w-3.5" />
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={'px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
                    viewMode === 'analytics' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}'}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics
                </button>
                <button
                  onClick={() => setViewMode('workflow')}
                  className={'px-3 py-1.5 text-xs font-medium rounded-r flex items-center gap-1.5 ${
                    viewMode === 'workflow' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}'}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Workflow
                </button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Work Order
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 rounded-lg p-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Total</p>
                  <p className="text-lg font-semibold text-white">{totalWorkOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Completed</p>
                  <p className="text-lg font-semibold text-white">{completedWorkOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600/10 rounded-lg p-2">
                  <Wrench className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">In Progress</p>
                  <p className="text-lg font-semibold text-white">{inProgressWorkOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-600/10 rounded-lg p-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Urgent</p>
                  <p className="text-lg font-semibold text-white">{urgentWorkOrders}</p>
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
                  <p className="text-lg font-semibold text-white">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {viewMode === 'analytics' && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Productivity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Completion Rate</span>
                    <span className="text-green-400 font-medium">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Avg Duration</span>
                    <span className="text-white font-medium">2.4 hrs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">First-Time Fix</span>
                    <span className="text-green-400 font-medium">89.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">On-Time Performance</span>
                    <span className="text-blue-400 font-medium">91.5%</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Financial
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Total Revenue</span>
                    <span className="text-green-400 font-medium">${totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Avg Job Value</span>
                    <span className="text-white font-medium">${Math.floor(totalRevenue / (completedWorkOrders || 1)).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Profit Margin</span>
                    <span className="text-green-400 font-medium">32.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Collection Rate</span>
                    <span className="text-blue-400 font-medium">96.8%</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Quality
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Customer Satisfaction</span>
                    <span className="text-yellow-400 font-medium">4.7/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Complaint Rate</span>
                    <span className="text-green-400 font-medium">0.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Callback Rate</span>
                    <span className="text-green-400 font-medium">3.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Quality Score</span>
                    <span className="text-blue-400 font-medium">92.3%</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-500" />
                  Efficiency
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Scheduling Accuracy</span>
                    <span className="text-blue-400 font-medium">87.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Resource Utilization</span>
                    <span className="text-green-400 font-medium">84.6%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Travel Optimization</span>
                    <span className="text-purple-400 font-medium">91.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Parts Availability</span>
                    <span className="text-orange-400 font-medium">93.7%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Trends */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Performance Trends
                </h3>
                <div className="flex items-center gap-2">
                  {['week', 'month', 'quarter', 'year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setFilterPeriod(period as any)}
                      className={'px-3 py-1.5 text-xs font-medium rounded ${
                        filterPeriod === period
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'}'}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { metric: 'Completion Rate', current: 94.2, previous: 91.8, trend: 'up' },
                  { metric: 'Customer Satisfaction', current: 4.7, previous: 4.5, trend: 'up' },
                  { metric: 'Average Response Time', current: 2.3, previous: 2.8, trend: 'up' },
                  { metric: 'Profit Margin', current: 32.5, previous: 29.7, trend: 'up' }
                ].map((trend, i) => (
                  <div key={trend.metric} className="bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-400">{trend.metric}</span>
                      <div className={'flex items-center gap-1 text-xs ${
                        trend.trend === 'up' ? 'text-green-500' : `text-red-500'}'}>'
                        {trend.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        +{((trend.current - trend.previous) / trend.previous * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {trend.metric.includes('Time') ? '${trend.current}h' :
                       trend.metric.includes('Satisfaction') ? trend.current :
                       trend.metric.includes('Rate') || trend.metric.includes('Margin') ? '${trend.current}%' :
                       trend.current}
                    </div>
                    <div className="text-xs text-neutral-500">vs previous period</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Order Workflow Analysis */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Workflow Analysis
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-base font-medium text-white mb-4">Status Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries({
                      'Completed': { count: completedWorkOrders, color: 'green' },
                      'In Progress': { count: inProgressWorkOrders, color: 'orange' },
                      'Scheduled': { count: workOrders.filter(wo => wo.status === 'scheduled').length, color: 'blue' },
                      'Draft': { count: workOrders.filter(wo => wo.status === 'draft').length, color: 'gray' },
                      'On Hold': { count: workOrders.filter(wo => wo.status === 'on_hold').length, color: 'yellow' }
                    }).map(([status, data]) => {
                      const percentage = (data.count / totalWorkOrders * 100).toFixed(1)
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={'w-3 h-3 rounded-full bg-${data.color}-500'}></div>
                            <span className="text-neutral-300">{status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{data.count}</span>
                            <span className="text-neutral-400 text-sm">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-medium text-white mb-4">Priority Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries({
                      'Emergency': { count: workOrders.filter(wo => wo.priority === 'emergency').length, color: 'red' },
                      'Urgent': { count: workOrders.filter(wo => wo.priority === 'urgent').length, color: 'orange' },
                      'High': { count: workOrders.filter(wo => wo.priority === 'high').length, color: 'yellow' },
                      'Medium': { count: workOrders.filter(wo => wo.priority === 'medium').length, color: 'blue' },
                      'Low': { count: workOrders.filter(wo => wo.priority === 'low').length, color: 'gray' }
                    }).map(([priority, data]) => {
                      const percentage = (data.count / totalWorkOrders * 100).toFixed(1)
                      return (
                        <div key={priority} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={'w-3 h-3 rounded-full bg-${data.color}-500'}></div>
                            <span className="text-neutral-300">{priority}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{data.count}</span>
                            <span className="text-neutral-400 text-sm">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Service Type Performance */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-500" />
                Service Type Performance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['HVAC', 'Plumbing', 'Electrical', 'Appliance', 'General', 'Maintenance'].map((service, i) => {
                  const serviceJobs = workOrders.filter(wo => 
                    wo.serviceType?.toLowerCase() === service.toLowerCase()
                  )
                  const completedJobs = serviceJobs.filter(wo => wo.status === 'completed')
                  const avgValue = completedJobs.length > 0 
                    ? Math.floor(completedJobs.reduce((sum, wo) => sum + (wo.estimate?.total || 0), 0) / completedJobs.length)
                    : 0
                  
                  return (
                    <div key={service} className="bg-neutral-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">{service}</h4>
                        <span className="text-blue-400 text-sm font-medium">
                          {serviceJobs.length} jobs
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Completed:</span>
                          <span className="text-green-400">{completedJobs.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Avg Value:</span>
                          <span className="text-white">${avgValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Success Rate:</span>
                          <span className="text-green-400">
                            {serviceJobs.length > 0 ? Math.floor(completedJobs.length / serviceJobs.length * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'table' && (
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 h-full">
            {(DataTable as any)({
              data: workOrders,
              columns: columns,
              loading: loading,
              searchable: true,
              searchPlaceholder: "Search work orders, customers, or job numbers...",
              selectable: true,
              selectedRows: selectedRows,
              onSelectionChange: setSelectedRows,
              getRowId: (workOrder: unknown) => workOrder.id,
              bulkActions: bulkActions,
              filters: filters,
              onRowClick: (workOrder: unknown) => {
                console.log('Navigate to work order: ', workOrder.id)
              },
              emptyState: (
                <div className="text-center py-12">
                  <div className="text-neutral-300 text-lg mb-2">No work orders found</div>
                  <p className="text-neutral-500 mb-4">
                    Create your first work order to get started
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
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

        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workOrders.slice(0, 20).map((workOrder) => (
              <div key={workOrder.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-blue-400">{workOrder.jobNumber}</span>
                    {getPriorityIcon(workOrder.priority)}
                  </div>
                  <div className={'px-2 py-1 text-xs font-medium rounded ${
                    workOrder.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                    workOrder.status === 'in_progress' ? 'bg-orange-900/50 text-orange-400' :
                    `bg-neutral-800 text-neutral-400'}'}>'
                    {workOrder.status.replace('_', ' ')}
                  </div>
                </div>

                <h3 className="font-medium text-white mb-2 line-clamp-2">{workOrder.title}</h3>
                <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{workOrder.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-neutral-500" />
                    <span className="text-neutral-300">{workOrder.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span className="text-neutral-400">{workOrder.customer.address.city}, {workOrder.customer.address.state}</span>
                  </div>
                  {workOrder.technician && (
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3 h-3 text-neutral-500" />
                      <span className="text-neutral-300">{workOrder.technician.name}</span>
                    </div>
                  )}
                  {workOrder.scheduledAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span className="text-neutral-400">
                        {new Date(workOrder.scheduledAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800">
                  <span className="text-green-400 font-medium">
                    ${workOrder.estimate.total.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    {workOrder.tags.slice(0, 2).map((tag: unknown, index: unknown) => (
                      <span key={index} className="bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(viewMode === 'timeline' || viewMode === 'workflow') && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 h-full">
            <div className="flex items-center justify-center h-full text-neutral-400">
              <div className="text-center">
                {viewMode === 'timeline' ? (
                  <>
                    <Activity className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Timeline View</p>
                    <p className="text-sm mt-2 max-w-md">
                      Interactive timeline showing work order progression and milestones
                    </p>
                  </>
                ) : (
                  <>
                    <Layers className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Workflow Management</p>
                    <p className="text-sm mt-2 max-w-md">
                      Advanced workflow designer and process automation tools
                    </p>
                  </>
                )}
                <p className="text-xs mt-3 text-neutral-500">(Coming soon)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
