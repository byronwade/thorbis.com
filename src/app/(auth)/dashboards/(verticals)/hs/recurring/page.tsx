import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  RefreshCw,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Copy,
  Filter,
  Search,
  Download,
  Upload,
  Star,
  MapPin,
  Wrench,
  FileText,
  Phone,
  Mail,
  User,
  Building,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  Timer,
  Bell,
  Calendar as CalIcon,
  CreditCard,
  Tag,
  History,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

import { DataTable } from '@/components/ui/data-table'

interface RecurringService {
  id: string
  name: string
  description: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    address: string
    tier: 'standard' | 'premium' | 'vip'
  }
  service: {
    type: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'maintenance' | 'inspection'
    category: string
    description: string
    tasks: Array<{
      id: string
      name: string
      description: string
      estimatedDuration: number
      requiredSkills: string[]
      parts: Array<{
        name: string
        quantity: number
        partNumber?: string
      }>
    }>
  }
  schedule: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'custom'
    interval: number
    startDate: string
    endDate?: string
    preferredDay?: string
    preferredTime?: string
    timeWindow: string
    blackoutDates: string[]
    seasonalAdjustments: Array<{
      season: 'spring' | 'summer' | 'fall' | 'winter'
      adjustment: 'skip' | 'reschedule' | 'priority'
      reason: string
    }>
  }
  assignment: {
    method: 'auto' | 'fixed' | 'preferred'
    technicianId?: string
    preferredTechnicians: string[]
    skillRequirements: string[]
    routeOptimization: boolean
  }
  pricing: {
    model: 'flat_rate' | 'hourly' | 'tiered' | 'contract'
    basePrice: number
    hourlyRate?: number
    contractTerms?: {
      duration: number
      totalValue: number
      paymentSchedule: 'monthly' | 'quarterly' | 'annual'
      discountPercentage: number
    }
    adjustments: Array<{
      type: 'seasonal' | 'volume' | 'loyalty' | 'emergency'
      value: number
      description: string
    }>
  }
  contract: {
    status: 'draft' | 'active' | 'paused' | 'cancelled' | 'expired'
    signedDate?: string
    renewalDate?: string
    autoRenew: boolean
    terms: {
      duration: number
      cancellationPolicy: string
      serviceGuarantees: string[]
      includedServices: string[]
      exclusions: string[]
    }
  }
  performance: {
    completionRate: number
    averageRating: number
    lastServiceDate?: string
    nextServiceDate?: string
    totalServices: number
    missedServices: number
    customerSatisfaction: number
  }
  notifications: {
    customerReminders: {
      enabled: boolean
      daysBefore: number[]
      methods: ('email' | 'sms' | 'phone' | 'app')[]
    }
    technicianAssignment: {
      enabled: boolean
      daysBefore: number
    }
    renewalReminders: {
      enabled: boolean
      daysBefore: number[]
    }
  }
  billing: {
    method: 'invoice' | 'auto_pay' | 'pre_pay'
    paymentTerms: string
    invoiceSchedule: 'per_service' | 'monthly' | 'quarterly' | 'annual'
    lastInvoiceDate?: string
    nextInvoiceDate?: string
    totalRevenue: number
    outstandingBalance: number
  }
  history: Array<{
    id: string
    date: string
    status: 'completed' | 'cancelled' | 'rescheduled' | 'missed'
    technician?: string
    duration?: number
    notes?: string
    customerRating?: number
    issues?: string[]
    nextScheduledDate?: string
  }>
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface RecurringTemplate {
  id: string
  name: string
  description: string
  category: 'hvac' | 'plumbing' | 'electrical' | 'maintenance' | 'inspection'
  serviceType: string
  defaultSchedule: {
    frequency: RecurringService['schedule']['frequency']
    interval: number
    timeWindow: string
  }
  tasks: RecurringService['service']['tasks']
  pricing: {
    basePrice: number
    hourlyRate?: number
  }
  isActive: boolean
  usageCount: number
  createdBy: string
  createdAt: string
}

export default function RecurringServicePage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'templates' | 'calendar' | 'analytics' | 'billing'>('overview')
  const [services, setServices] = useState<RecurringService[]>([])
  const [templates, setTemplates] = useState<RecurringTemplate[]>([])
  const [selectedService, setSelectedService] = useState<RecurringService | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    frequency: 'all',
    technician: 'all',
    serviceType: 'all',
    customer: 'all'
  })
  const [searchTerm, setSearchTerm] = useState(')
  const [expandedServices, setExpandedServices] = useState<string[]>([])

  useEffect(() => {
    fetchRecurringData()
  }, [])

  const fetchRecurringData = async () => {
    try {
      // Generate comprehensive recurring service data
      const mockServices: RecurringService[] = Array.from({ length: 42 }, (_, i) => {
        const frequencies = ['weekly', 'monthly', 'quarterly', 'semi_annual', 'annual'] as const
        const serviceTypes = ['hvac', 'plumbing', 'electrical', 'appliance', 'maintenance', 'inspection'] as const
        const statuses = ['active', 'paused', 'cancelled', 'expired'] as const
        const customers = [
          'Jennifer Martinez', 'Robert Wilson', 'Sarah Thompson', 'Michael Davis',
          'Amy Johnson', 'David Brown', 'Lisa Anderson', 'Thomas Miller'
        ]
        
        const frequency = frequencies[Math.floor(Math.random() * frequencies.length)]
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]
        const statusOptions = ['active', 'cancelled', 'paused', 'expired', 'draft'] as const
        const status = Math.random() < 0.6 ? 'active' : Math.random() < 0.75 ? 'paused' : Math.random() < 0.85 ? 'cancelled' : Math.random() < 0.95 ? 'expired' : 'draft'
        const customer = customers[Math.floor(Math.random() * customers.length)]
        const basePrice = Math.floor(Math.random() * 300) + 100
        const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        const completionRate = Math.random() * 30 + 70 // 70-100%
        const totalServices = Math.floor(Math.random() * 24) + 6
        
        return {
          id: 'recurring-${String(i + 1).padStart(3, '0')}',
          name: '${serviceType.toUpperCase()} ${frequency.charAt(0).toUpperCase() + frequency.slice(1).replace('_', ' ')} Service - ${customer}`,
          description: 'Professional ${serviceType} maintenance and inspection service',
          customer: {
            id: 'customer-${String(i % 20 + 1).padStart(3, '0')}',
            name: customer,
            email: '${customer.toLowerCase().replace(' ', '.')}@email.com',
            phone: '(217) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}',
            address: '${Math.floor(Math.random() * 9999) + 1} ${['Oak', 'Maple', 'Pine', 'Cedar', 'Elm'][Math.floor(Math.random() * 5)]} Street, Springfield, IL 627${String(Math.floor(Math.random() * 10)).padStart(2, '0')}',
            tier: Math.random() < 0.2 ? 'vip' : Math.random() < 0.5 ? 'premium' : 'standard'
          },
          service: {
            type: serviceType,
            category: serviceType === 'hvac' ? 'System Maintenance' :
                     serviceType === 'plumbing' ? 'Preventive Service' :
                     serviceType === 'electrical' ? 'Safety Inspection' :
                     serviceType === 'maintenance' ? 'General Maintenance' : 'Equipment Inspection',
            description: 'Comprehensive ${serviceType} system inspection, maintenance, and preventive care',
            tasks: [
              {
                id: 'task-001',
                name: serviceType === 'hvac' ? 'Filter Replacement' :
                      serviceType === 'plumbing' ? 'Drain Inspection' :
                      serviceType === 'electrical' ? 'Panel Inspection' : 'System Check',
                description: 'Primary maintenance task',
                estimatedDuration: 30,
                requiredSkills: [serviceType.toUpperCase()],
                parts: [{
                  name: serviceType === 'hvac' ? 'HVAC Filter' : 'Maintenance Kit',
                  quantity: 1
                }]
              },
              {
                id: 'task-002',
                name: 'System Testing',
                description: 'Comprehensive system performance testing',
                estimatedDuration: 45,
                requiredSkills: [serviceType.toUpperCase(), 'Diagnostics'],
                parts: []
              }
            ]
          },
          schedule: {
            frequency,
            interval: frequency === 'weekly' ? Math.floor(Math.random() * 2) + 1 :
                     frequency === 'monthly' ? Math.floor(Math.random() * 3) + 1 : 1,
            startDate: startDate.toISOString().split('T')[0],
            endDate: Math.random() < 0.3 ? new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
            preferredDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Math.floor(Math.random() * 5)],
            preferredTime: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM'][Math.floor(Math.random() * 4)],
            timeWindow: '2-hour window',
            blackoutDates: [],
            seasonalAdjustments: frequency === 'quarterly' ? [
              {
                season: 'winter',
                adjustment: 'priority',
                reason: 'Peak heating season maintenance'
              }
            ] : []
          },
          assignment: {
            method: Math.random() < 0.6 ? 'auto' : Math.random() < 0.8 ? 'preferred' : 'fixed',
            technicianId: Math.random() < 0.4 ? 'tech-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}' : undefined,
            preferredTechnicians: ['tech-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}'],
            skillRequirements: [serviceType.toUpperCase()],
            routeOptimization: true
          },
          pricing: {
            model: Math.random() < 0.7 ? 'flat_rate' : Math.random() < 0.5 ? 'contract' : 'hourly',
            basePrice,
            hourlyRate: Math.random() < 0.3 ? Math.floor(Math.random() * 50) + 75 : undefined,
            contractTerms: Math.random() < 0.3 ? {
              duration: 12,
              totalValue: basePrice * (frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1),
              paymentSchedule: 'monthly',
              discountPercentage: Math.floor(Math.random() * 15) + 5
            } : undefined,
            adjustments: []
          },
          contract: {
            status,
            signedDate: status !== 'draft' ? startDate.toISOString() : undefined,
            renewalDate: status === 'active' ? new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            autoRenew: Math.random() < 0.8,
            terms: {
              duration: 12,
              cancellationPolicy: '30 days written notice',
              serviceGuarantees: ['24-hour response time', 'Parts warranty', 'Satisfaction guarantee'],
              includedServices: ['Regular maintenance', 'Emergency calls', 'Parts replacement'],
              exclusions: ['Major repairs', 'Equipment replacement']
            }
          },
          performance: {
            completionRate,
            averageRating: Math.random() * 1.5 + 3.5, // 3.5-5.0
            lastServiceDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            nextServiceDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalServices,
            missedServices: Math.floor(totalServices * (1 - completionRate / 100)),
            customerSatisfaction: Math.random() * 20 + 80 // 80-100%
          },
          notifications: {
            customerReminders: {
              enabled: true,
              daysBefore: [7, 1],
              methods: ['email', 'sms']
            },
            technicianAssignment: {
              enabled: true,
              daysBefore: 3
            },
            renewalReminders: {
              enabled: true,
              daysBefore: [60, 30, 7]
            }
          },
          billing: {
            method: Math.random() < 0.6 ? 'auto_pay' : Math.random() < 0.8 ? 'invoice' : 'pre_pay',
            paymentTerms: 'Net 30',
            invoiceSchedule: frequency === 'monthly' ? 'monthly' : frequency === 'quarterly' ? 'quarterly' : 'per_service',
            lastInvoiceDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            nextInvoiceDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalRevenue: basePrice * totalServices,
            outstandingBalance: Math.random() < 0.2 ? Math.floor(Math.random() * basePrice * 2) : 0
          },
          history: Array.from({ length: Math.min(totalServices, 6) }, (_, j) => ({
            id: 'history-${i}-${j}',
            date: new Date(startDate.getTime() + j * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: Math.random() < completionRate / 100 ? 'completed' : 
                   Math.random() < 0.7 ? 'rescheduled' : 
                   Math.random() < 0.9 ? 'cancelled' : 'missed',
            technician: 'Tech-${Math.floor(Math.random() * 5) + 1}',
            duration: Math.floor(Math.random() * 60) + 60,
            customerRating: Math.random() < 0.8 ? Math.floor(Math.random() * 2) + 4 : undefined,
            notes: Math.random() < 0.4 ? 'Service completed successfully. All systems operating normally.' : undefined
          })),
          createdBy: 'System Administrator',
          createdAt: startDate.toISOString(),
          updatedAt: new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      const mockTemplates: RecurringTemplate[] = [
        {
          id: 'template-001',
          name: 'HVAC Seasonal Maintenance',
          description: 'Comprehensive HVAC system maintenance for optimal performance',
          category: 'hvac',
          serviceType: 'Preventive Maintenance',
          defaultSchedule: {
            frequency: 'quarterly',
            interval: 1,
            timeWindow: '2-hour window'
          },
          tasks: [
            {
              id: 'task-hvac-001',
              name: 'Filter Replacement',
              description: 'Replace HVAC filters and inspect air quality',
              estimatedDuration: 30,
              requiredSkills: ['HVAC', 'Maintenance'],
              parts: [{ name: 'HVAC Filter', quantity: 2 }]
            },
            {
              id: 'task-hvac-002',
              name: 'System Inspection',
              description: 'Complete system inspection and performance testing',
              estimatedDuration: 60,
              requiredSkills: ['HVAC', 'Diagnostics'],
              parts: []
            },
            {
              id: 'task-hvac-003',
              name: 'Refrigerant Check',
              description: 'Check refrigerant levels and system pressure',
              estimatedDuration: 30,
              requiredSkills: ['HVAC', 'Refrigeration'],
              parts: []
            }
          ],
          pricing: {
            basePrice: 185,
            hourlyRate: 95
          },
          isActive: true,
          usageCount: 24,
          createdBy: 'System Administrator',
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'template-002',
          name: 'Plumbing Preventive Service',
          description: 'Regular plumbing maintenance to prevent issues',
          category: 'plumbing',
          serviceType: 'Preventive Maintenance',
          defaultSchedule: {
            frequency: 'semi_annual',
            interval: 1,
            timeWindow: '2-hour window'
          },
          tasks: [
            {
              id: 'task-plumb-001',
              name: 'Drain Inspection',
              description: 'Inspect all drains for clogs and buildup',
              estimatedDuration: 45,
              requiredSkills: ['Plumbing'],
              parts: []
            },
            {
              id: 'task-plumb-002',
              name: 'Water Pressure Test',
              description: 'Test water pressure throughout the system',
              estimatedDuration: 30,
              requiredSkills: ['Plumbing'],
              parts: []
            },
            {
              id: 'task-plumb-003',
              name: 'Fixture Maintenance',
              description: 'Maintain and adjust plumbing fixtures',
              estimatedDuration: 45,
              requiredSkills: ['Plumbing'],
              parts: [{ name: 'Maintenance Kit', quantity: 1 }]
            }
          ],
          pricing: {
            basePrice: 165,
            hourlyRate: 85
          },
          isActive: true,
          usageCount: 18,
          createdBy: 'System Administrator',
          createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      setServices(mockServices)
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Error fetching recurring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecurringStats = () => {
    const activeServices = services.filter(s => s.contract.status === 'active')
    const totalRevenue = services.reduce((sum, s) => sum + s.billing.totalRevenue, 0)
    const avgCompletionRate = services.reduce((sum, s) => sum + s.performance.completionRate, 0) / services.length
    const upcomingServices = services.filter(s => 
      s.performance.nextServiceDate && 
      new Date(s.performance.nextServiceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length
    const overdueServices = services.filter(s =>
      s.performance.nextServiceDate &&
      new Date(s.performance.nextServiceDate) < new Date()
    ).length
    const outstandingBalance = services.reduce((sum, s) => sum + s.billing.outstandingBalance, 0)

    return {
      totalServices: services.length,
      activeServices: activeServices.length,
      totalRevenue,
      avgCompletionRate,
      upcomingServices,
      overdueServices,
      outstandingBalance,
      avgRating: services.reduce((sum, s) => sum + s.performance.averageRating, 0) / services.length
    }
  }

  const stats = getRecurringStats()

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filters.status === 'all' || service.contract.status === filters.status
    const matchesFrequency = filters.frequency === 'all' || service.schedule.frequency === filters.frequency
    const matchesServiceType = filters.serviceType === 'all' || service.service.type === filters.serviceType

    return matchesSearch && matchesStatus && matchesFrequency && matchesServiceType
  })

  const toggleServiceExpanded = (serviceId: string) => {
    setExpandedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const serviceColumns = [
    {
      accessorKey: 'name',
      header: 'Service',
      cell: ({ row }: { row: any }) => (
        <div className="min-w-0">
          <div className="font-medium text-white truncate">{row.original.customer.name}</div>
          <div className="text-sm text-neutral-400 truncate">{row.original.service.category}</div>
          <div className="text-xs text-neutral-500">{row.original.schedule.frequency}</div>
        </div>
      )
    },
    {
      accessorKey: 'contract.status',
      header: 'Status',
      cell: ({ row }: { row: any }) => (
        <div className={'px-3 py-1 rounded-full text-sm font-medium ${
          row.original.contract.status === 'active' ? 'bg-green-800 text-green-200' :
          row.original.contract.status === 'paused' ? 'bg-yellow-800 text-yellow-200' :
          row.original.contract.status === 'cancelled' ? 'bg-red-800 text-red-200' :
          row.original.contract.status === 'expired' ? 'bg-neutral-800 text-neutral-200' :
          'bg-blue-800 text-blue-200'
              }'}>'
          {row.original.contract.status.toUpperCase()}
        </div>
      )
    },
    {
      accessorKey: 'performance.nextServiceDate',
      header: 'Next Service',
      cell: ({ row }: { row: any }) => (
        <div>
          {row.original.performance.nextServiceDate ? (
            <div>
              <div className="text-white">
                {new Date(row.original.performance.nextServiceDate).toLocaleDateString()}
              </div>
              <div className={'text-xs ${
                new Date(row.original.performance.nextServiceDate) < new Date() ? 'text-red-400' :
                new Date(row.original.performance.nextServiceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'text-yellow-400' :
                'text-neutral-400'
              }'}>'
                {new Date(row.original.performance.nextServiceDate) < new Date() ? 'Overdue' :
                 new Date(row.original.performance.nextServiceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'This Week' :
                 'Scheduled'}
              </div>
            </div>
          ) : (
            <span className="text-neutral-400">Not scheduled</span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'performance.completionRate',
      header: 'Completion Rate',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center">
          <div className="flex-1 bg-neutral-800 rounded-full h-2 mr-2">
            <div 
              className={'h-2 rounded-full ${
                row.original.performance.completionRate >= 95 ? 'bg-green-500' :
                row.original.performance.completionRate >= 85 ? 'bg-blue-500' :
                row.original.performance.completionRate >= 75 ? 'bg-yellow-500' : 'bg-red-500`
              }'}
              style={{ width: '${row.original.performance.completionRate}%' }}
            />
          </div>
          <span className="text-sm text-white font-medium">
            {row.original.performance.completionRate.toFixed(0)}%
          </span>
        </div>
      )
    },
    {
      accessorKey: 'billing.totalRevenue',
      header: 'Revenue',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="text-green-400 font-medium">
            ${row.original.billing.totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-400">
            ${row.original.pricing.basePrice} per service
          </div>
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setSelectedService(row.original)}
            className="text-neutral-400 hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-blue-400">
              <RefreshCw className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{stats.activeServices}</h3>
            <p className="text-sm text-neutral-400">Active Services</p>
            <p className="text-xs text-neutral-500">{stats.totalServices} total</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-green-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-sm text-neutral-400">Total Revenue</p>
            <p className="text-xs text-neutral-500">All time</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-purple-400">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{stats.avgCompletionRate.toFixed(0)}%</h3>
            <p className="text-sm text-neutral-400">Completion Rate</p>
            <p className="text-xs text-neutral-500">Average across all services</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-yellow-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{stats.upcomingServices}</h3>
            <p className="text-sm text-neutral-400">Upcoming This Week</p>
            <p className="text-xs text-neutral-500">{stats.overdueServices} overdue</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.overdueServices > 0 || stats.outstandingBalance > 0) && (
        <div className="space-y-3">
          {stats.overdueServices > 0 && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <div>
                  <div className="text-red-400 font-medium">Overdue Services</div>
                  <div className="text-red-300 text-sm">
                    {stats.overdueServices} service{stats.overdueServices > 1 ? 's' : '} require immediate attention
                  </div>
                </div>
              </div>
            </div>
          )}
          {stats.outstandingBalance > 0 && (
            <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-orange-400 mr-3" />
                <div>
                  <div className="text-orange-400 font-medium">Outstanding Balance</div>
                  <div className="text-orange-300 text-sm">
                    ${stats.outstandingBalance.toLocaleString()} in unpaid invoices
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Services */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Upcoming Services</h3>
          <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>
        <div className="space-y-3">
          {filteredServices
            .filter(s => s.performance.nextServiceDate && 
                        new Date(s.performance.nextServiceDate) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(a.performance.nextServiceDate!).getTime() - new Date(b.performance.nextServiceDate!).getTime())
            .slice(0, 5)
            .map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="text-white font-medium">{service.customer.name}</div>
                    <div className={'ml-2 px-2 py-1 rounded text-xs ${
                      service.customer.tier === 'vip' ? 'bg-purple-800 text-purple-200' :
                      service.customer.tier === 'premium' ? 'bg-blue-800 text-blue-200' :
                      'bg-neutral-700 text-neutral-300`
              }'}>'
                      {service.customer.tier.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-sm text-neutral-400">{service.service.category}</div>
                  <div className="text-xs text-neutral-500">
                    {service.performance.nextServiceDate && new Date(service.performance.nextServiceDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">${service.pricing.basePrice}</div>
                  <div className={'text-xs ${
                    new Date(service.performance.nextServiceDate!) < new Date() ? 'text-red-400' :
                    new Date(service.performance.nextServiceDate!) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? 'text-yellow-400' :
                    'text-neutral-400'
              }'}>'
                    {new Date(service.performance.nextServiceDate!) < new Date() ? 'Overdue' :
                     new Date(service.performance.nextServiceDate!) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? 'Due Soon' :
                     'Scheduled'}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Service Frequency Distribution</h3>
          <div className="space-y-3">
            {['monthly', 'quarterly', 'semi_annual', 'annual'].map((frequency) => {
              const count = services.filter(s => s.schedule.frequency === frequency).length
              const percentage = (count / services.length) * 100
              return (
                <div key={frequency} className="flex items-center justify-between">
                  <span className="text-neutral-300 capitalize">{frequency.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-neutral-800 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: '${percentage}%' }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Service Categories</h3>
          <div className="space-y-3">
            {['hvac', 'plumbing', 'electrical', 'maintenance'].map((type) => {
              const count = services.filter(s => s.service.type === type).length
              const revenue = services
                .filter(s => s.service.type === type)
                .reduce((sum, s) => sum + s.billing.totalRevenue, 0)
              return (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <span className="text-neutral-300 capitalize">{type}</span>
                    <div className="text-xs text-neutral-400">{count} services</div>
                  </div>
                  <div className="text-green-400 font-medium">
                    ${revenue.toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  const renderServices = () => (
    <div className="space-y-4">
      {filteredServices.map((service) => {
        const isExpanded = expandedServices.includes(service.id)
        return (
          <div key={service.id} className="bg-neutral-900 border border-neutral-800 rounded-lg">
            {/* Main Service Row */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleServiceExpanded(service.id)}
                      className="p-0 h-auto mr-2 text-neutral-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <h3 className="text-lg font-semibold text-white">{service.customer.name}</h3>
                    <div className={'ml-2 px-2 py-1 rounded text-xs ${
                      service.customer.tier === 'vip' ? 'bg-purple-800 text-purple-200' :
                      service.customer.tier === 'premium' ? 'bg-blue-800 text-blue-200' :
                      'bg-neutral-700 text-neutral-300'
              }'}>'
                      {service.customer.tier.toUpperCase()}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-neutral-400">Service</div>
                      <div className="text-white">{service.service.category}</div>
                      <div className="text-xs text-neutral-500">{service.service.type.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400">Schedule</div>
                      <div className="text-white capitalize">{service.schedule.frequency.replace('_', ' ')}</div>
                      <div className="text-xs text-neutral-500">{service.schedule.preferredTime}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400">Next Service</div>
                      <div className={'text-white ${
                        service.performance.nextServiceDate && new Date(service.performance.nextServiceDate) < new Date() ? 'text-red-400' : '
              }'}>'
                        {service.performance.nextServiceDate ? 
                          new Date(service.performance.nextServiceDate).toLocaleDateString() : 
                          'Not scheduled'
                        }
                      </div>
                      <div className="text-xs text-neutral-500">
                        {service.performance.completionRate.toFixed(0)}% completion rate
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400">Revenue</div>
                      <div className="text-green-400 font-medium">${service.billing.totalRevenue.toLocaleString()}</div>
                      <div className="text-xs text-neutral-500">${service.pricing.basePrice} per service</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className={'px-3 py-1 rounded-full text-sm font-medium ${
                    service.contract.status === 'active' ? 'bg-green-800 text-green-200' :
                    service.contract.status === 'paused' ? 'bg-yellow-800 text-yellow-200' :
                    service.contract.status === 'cancelled' ? 'bg-red-800 text-red-200' :
                    service.contract.status === 'expired' ? 'bg-neutral-800 text-neutral-200' :
                    'bg-blue-800 text-blue-200'
              }'}>'
                    {service.contract.status.toUpperCase()}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-neutral-800 p-6 bg-neutral-800/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Service Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Service Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Description:</span>
                          <span className="text-neutral-300 max-w-xs text-right">{service.service.description}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Tasks:</span>
                          <span className="text-neutral-300">{service.service.tasks.length} tasks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Est. Duration:</span>
                          <span className="text-neutral-300">
                            {service.service.tasks.reduce((sum, task) => sum + task.estimatedDuration, 0)} min
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Assignment</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Method:</span>
                          <span className="text-neutral-300 capitalize">{service.assignment.method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Skills Required:</span>
                          <span className="text-neutral-300">{service.assignment.skillRequirements.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Route Optimization:</span>
                          <span className={'${service.assignment.routeOptimization ? 'text-green-400' : 'text-red-400'
              }'}>'
                            {service.assignment.routeOptimization ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance & Billing */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Completion Rate:</span>
                          <span className="text-green-400">{service.performance.completionRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Average Rating:</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-white">{service.performance.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Total Services:</span>
                          <span className="text-neutral-300">{service.performance.totalServices}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Billing</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Payment Method:</span>
                          <span className="text-neutral-300 capitalize">{service.billing.method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Invoice Schedule:</span>
                          <span className="text-neutral-300 capitalize">{service.billing.invoiceSchedule.replace('_', ' ')}</span>
                        </div>
                        {service.billing.outstandingBalance > 0 && (
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Outstanding:</span>
                            <span className="text-red-400">${service.billing.outstandingBalance.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent History */}
                {service.history.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-white mb-3">Recent Service History</h4>
                    <div className="space-y-2">
                      {service.history.slice(-3).map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-2 bg-neutral-800/50 rounded">
                          <div className="flex items-center">
                            <div className={'w-2 h-2 rounded-full mr-2 ${
                              record.status === 'completed' ? 'bg-green-500' :
                              record.status === 'cancelled' ? 'bg-red-500' :
                              record.status === 'rescheduled' ? 'bg-yellow-500' : 'bg-neutral-500`
              }'} />'
                            <span className="text-sm text-neutral-300">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-neutral-500 ml-2">
                              by {record.technician}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.customerRating && (
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                <span className="text-xs text-white">{record.customerRating}</span>
                              </div>
                            )}
                            <span className={'text-xs px-2 py-1 rounded ${
                              record.status === 'completed' ? 'bg-green-800 text-green-200' :
                              record.status === 'cancelled' ? 'bg-red-800 text-red-200' :
                              record.status === 'rescheduled' ? 'bg-yellow-800 text-yellow-200' :
                              'bg-neutral-700 text-neutral-300`
              }'}>'
                              {record.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Service Templates</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{template.name}</h3>
                <p className="text-sm text-neutral-400 capitalize">{template.category}</p>
              </div>
              <div className={'px-2 py-1 rounded text-xs ${
                template.isActive ? 'bg-green-800 text-green-200' : 'bg-neutral-800 text-neutral-200'
              }'}>'
                {template.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <p className="text-sm text-neutral-300 mb-4">{template.description}</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Default Schedule:</span>
                <span className="text-white capitalize">
                  {template.defaultSchedule.frequency.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Tasks:</span>
                <span className="text-white">{template.tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Base Price:</span>
                <span className="text-green-400">${template.pricing.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Usage:</span>
                <span className="text-white">{template.usageCount} times</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Copy className="h-4 w-4 mr-2" />
                Use Template
              </Button>
              <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'services':
        return renderServices()
      case 'templates':
        return renderTemplates()
      case 'calendar':
        return (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 h-96 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-400">Recurring service calendar view</p>
              <p className="text-sm text-neutral-500 mt-1">Interactive calendar for scheduling recurring services</p>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue Trends</h3>
                <div className="h-64 flex items-center justify-center bg-neutral-800/50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">Monthly recurring revenue trends</p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Service Distribution</h3>
                <div className="h-64 flex items-center justify-center bg-neutral-800/50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">Service type and frequency breakdown</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'billing':
        return (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recurring Billing Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-800/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">${stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-neutral-400">Total Revenue</div>
                </div>
                <div className="bg-neutral-800/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">${stats.outstandingBalance.toLocaleString()}</div>
                  <div className="text-sm text-neutral-400">Outstanding Balance</div>
                </div>
                <div className="bg-neutral-800/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {services.filter(s => s.billing.method === 'auto_pay').length}
                  </div>
                  <div className="text-sm text-neutral-400">Auto-Pay Customers</div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-925">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Recurring Services</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Manage recurring service contracts, maintenance schedules, and customer agreements
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Recurring Service
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search services or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={filters.frequency}
                onChange={(e) => setFilters(prev => ({ ...prev, frequency: e.target.value }))}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Frequencies</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi_annual">Semi-Annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-neutral-800/50 p-1 rounded-lg">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'services', label: 'Services', icon: RefreshCw },
              { key: 'templates', label: 'Templates', icon: FileText },
              { key: 'calendar', label: 'Calendar', icon: Calendar },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp },
              { key: 'billing', label: 'Billing', icon: CreditCard }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
                className={activeTab === tab.key 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                }
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin" />
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-neutral-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">{selectedService.name}</h3>
                <Button variant="ghost" onClick={() => setSelectedService(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Name:</span>
                        <span className="text-white">{selectedService.customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Phone:</span>
                        <span className="text-white">{selectedService.customer.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Email:</span>
                        <span className="text-white">{selectedService.customer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Tier:</span>
                        <div className={'px-2 py-1 rounded text-xs ${
                          selectedService.customer.tier === 'vip' ? 'bg-purple-800 text-purple-200' :
                          selectedService.customer.tier === 'premium' ? 'bg-blue-800 text-blue-200' :
                          'bg-neutral-700 text-neutral-300'
              }'}>'
                          {selectedService.customer.tier.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Service Schedule</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Frequency:</span>
                        <span className="text-white capitalize">{selectedService.schedule.frequency.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Preferred Day:</span>
                        <span className="text-white">{selectedService.schedule.preferredDay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Preferred Time:</span>
                        <span className="text-white">{selectedService.schedule.preferredTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Next Service:</span>
                        <span className="text-white">
                          {selectedService.performance.nextServiceDate ? 
                            new Date(selectedService.performance.nextServiceDate).toLocaleDateString() : 
                            'Not scheduled'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Service Tasks</h4>
                    <div className="space-y-2">
                      {selectedService.service.tasks.map((task) => (
                        <div key={task.id} className="p-3 bg-neutral-800/50 rounded-lg">
                          <div className="font-medium text-white text-sm">{task.name}</div>
                          <div className="text-xs text-neutral-400">{task.description}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-neutral-500">{task.estimatedDuration} min</span>
                            <div className="flex gap-1">
                              {task.requiredSkills.map(skill => (
                                <span key={skill} className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs">
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

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Completion Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-neutral-800 rounded-full h-2">
                            <div 
                              className={'h-2 rounded-full ${
                                selectedService.performance.completionRate >= 95 ? 'bg-green-500' :
                                selectedService.performance.completionRate >= 85 ? 'bg-blue-500' :
                                'bg-yellow-500`
              }'}
                              style={{ width: '${selectedService.performance.completionRate}%' }}
                            />
                          </div>
                          <span className="text-white font-medium">
                            {selectedService.performance.completionRate.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Average Rating:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-white">{selectedService.performance.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Total Services:</span>
                        <span className="text-white">{selectedService.performance.totalServices}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Missed Services:</span>
                        <span className="text-red-400">{selectedService.performance.missedServices}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Billing Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Payment Method:</span>
                        <span className="text-white capitalize">{selectedService.billing.method.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Base Price:</span>
                        <span className="text-green-400">${selectedService.pricing.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Total Revenue:</span>
                        <span className="text-green-400 font-medium">${selectedService.billing.totalRevenue.toLocaleString()}</span>
                      </div>
                      {selectedService.billing.outstandingBalance > 0 && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Outstanding:</span>
                          <span className="text-red-400">${selectedService.billing.outstandingBalance.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Contract Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Status:</span>
                        <div className={'px-2 py-1 rounded text-xs ${
                          selectedService.contract.status === 'active' ? 'bg-green-800 text-green-200' :
                          selectedService.contract.status === 'paused' ? 'bg-yellow-800 text-yellow-200' :
                          'bg-red-800 text-red-200'
              }'}>'
                          {selectedService.contract.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Auto Renew:</span>
                        <span className={selectedService.contract.autoRenew ? 'text-green-400' : 'text-red-400'}>
                          {selectedService.contract.autoRenew ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {selectedService.contract.renewalDate && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Renewal Date:</span>
                          <span className="text-white">
                            {new Date(selectedService.contract.renewalDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-800">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Service
                </Button>
                <Button variant="outline" className="bg-neutral-800 border-neutral-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Now
                </Button>
                <Button variant="outline" className="bg-neutral-800 border-neutral-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}