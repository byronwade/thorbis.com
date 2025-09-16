import { Button } from '@/components/ui/button';
'use client'

import { useState, useEffect } from 'react'
import { 
  User,
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
  Bell,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Download,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Home,
  Wrench,
  DollarSign,
  Camera,
  Upload,
  Lock,
  Shield,
  Globe,
  Smartphone,
  BookOpen,
  HelpCircle,
  Heart,
  ThumbsUp,
  Send,
  Paperclip,
  Calendar as CalIcon,
  Receipt,
  History,
  Award,
  Gift,
  Target,
  TrendingUp
} from 'lucide-react'

import { DataTable } from '@/components/ui/data-table'

interface CustomerProfile {
  id: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    avatar?: string
    joinDate: string
    tier: 'standard' | 'premium' | 'vip'
  }
  addresses: Array<{
    id: string
    type: 'home' | 'business' | 'rental'
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    isPrimary: boolean
    notes?: string
    propertyDetails: {
      type: 'single_family' | 'apartment' | 'condo' | 'commercial'
      size: string
      yearBuilt?: string
      hvacSystem?: string
      plumbingType?: string
      electricalPanel?: string
    }
  }>
  preferences: {
    communicationMethod: 'email' | 'sms' | 'phone' | 'app'
    appointmentReminders: boolean
    marketingEmails: boolean
    serviceNotifications: boolean
    emergencyContact?: string
    specialInstructions?: string
  }
  loyalty: {
    points: number
    tier: string
    nextTierPoints: number
    rewards: Array<{
      id: string
      name: string
      points: number
      description: string
      isRedeemable: boolean
    }>
    referrals: {
      count: number
      rewards: number
    }
  }
}

interface ServiceRequest {
  id: string
  type: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'maintenance' | 'emergency'
  category: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  title: string
  description: string
  location: {
    addressId: string
    specificLocation?: string
    accessInstructions?: string
  }
  scheduling: {
    preferredDate?: string
    preferredTimeWindow?: string
    flexibility: 'strict' | 'flexible' | 'asap'
    avoidTimes?: string[]
  }
  attachments: Array<{
    id: string
    name: string
    type: 'photo' | 'video' | 'document'
    url: string
    description?: string
  }>
  status: 'draft' | 'submitted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  estimatedCost?: {
    min: number
    max: number
  }
}

interface ServiceHistory {
  id: string
  workOrderNumber: string
  type: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'maintenance'
  service: string
  description: string
  technician: {
    name: string
    photo?: string
    rating: number
  }
  date: string
  duration: number
  status: 'completed' | 'cancelled' | 'no_show'
  address: string
  cost: {
    parts: number
    labor: number
    tax: number
    total: number
  }
  warranty: {
    parts: number
    labor: number
    expires: string
  }
  photos: string[]
  invoice: {
    number: string
    url: string
  }
  rating?: {
    overall: number
    punctuality: number
    quality: number
    cleanliness: number
    communication: number
    review?: string
    photos?: string[]
  }
  followUp?: {
    scheduled: boolean
    date?: string
    type: 'maintenance' | 'inspection' | 'warranty'
  }
}

interface Invoice {
  id: string
  invoiceNumber: string
  workOrderNumber: string
  date: string
  dueDate: string
  status: 'paid' | 'pending' | 'overdue' | 'partial'
  amount: {
    subtotal: number
    tax: number
    discount: number
    total: number
    paid: number
    balance: number
  }
  services: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  paymentMethod?: string
  paymentDate?: string
  downloadUrl: string
}

export default function CustomerPortalPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'history' | 'billing' | 'profile' | 'rewards'>('dashboard')
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceHistory | null>(null)

  useEffect(() => {
    fetchPortalData()
  }, [])

  const fetchPortalData = async () => {
    try {
      // Generate comprehensive customer portal data
      const mockProfile: CustomerProfile = {
        id: 'cust-001',
        personalInfo: {
          firstName: 'Jennifer',
          lastName: 'Martinez',
          email: 'jennifer.martinez@email.com',
          phone: '(217) 555-0123',
          avatar: '/images/customer-avatar.jpg',
          joinDate: '2022-03-15T00:00:00Z',
          tier: 'premium'
        },
        addresses: [
          {
            id: 'addr-001',
            type: 'home',
            name: 'Primary Residence',
            address: '1847 Oak Street',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            isPrimary: true,
            notes: 'Blue house with white trim. Key under mat if nobody answers.',
            propertyDetails: {
              type: 'single_family',
              size: '2,400 sq ft',
              yearBuilt: '1998',
              hvacSystem: 'Central Air + Gas Furnace',
              plumbingType: 'PVC/Copper',
              electricalPanel: '200A Main Panel'
            }
          },
          {
            id: 'addr-002',
            type: 'rental',
            name: 'Rental Property',
            address: '3421 Maple Avenue',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62702',
            isPrimary: false,
            notes: 'Tenant: Sarah Johnson. Call before service.',
            propertyDetails: {
              type: 'apartment',
              size: '1,200 sq ft',
              yearBuilt: '2005',
              hvacSystem: 'Window Units + Baseboard Heat',
              plumbingType: 'PVC',
              electricalPanel: '100A Panel'
            }
          }
        ],
        preferences: {
          communicationMethod: 'sms',
          appointmentReminders: true,
          marketingEmails: false,
          serviceNotifications: true,
          emergencyContact: '(217) 555-0456 (Husband - Michael)',
          specialInstructions: 'Large dog (friendly). Please call before entering backyard.'
        },
        loyalty: {
          points: 2450,
          tier: 'Gold',
          nextTierPoints: 3000,
          rewards: [
            {
              id: 'reward-001',
              name: '10% Off Next Service',
              points: 500,
              description: 'Save 10% on your next service call',
              isRedeemable: true
            },
            {
              id: 'reward-002',
              name: 'Free Diagnostic',
              points: 750,
              description: 'Complimentary diagnostic for any service',
              isRedeemable: true
            },
            {
              id: 'reward-003',
              name: 'Priority Scheduling',
              points: 1000,
              description: 'Get priority booking for 30 days',
              isRedeemable: true
            },
            {
              id: 'reward-004',
              name: 'Annual Maintenance Plan',
              points: 2500,
              description: 'One year of preventive maintenance',
              isRedeemable: false
            }
          ],
          referrals: {
            count: 3,
            rewards: 150
          }
        }
      }

      const mockServiceRequests: ServiceRequest[] = [
        {
          id: 'req-001',
          type: 'hvac',
          category: 'Air Conditioning',
          priority: 'high',
          title: 'AC Not Cooling Properly',
          description: 'The air conditioner is running but not cooling the house effectively. Thermostat is set to 68°F but house temperature stays around 75°F. System seems to be running constantly.',
          location: {
            addressId: 'addr-001',
            specificLocation: 'Main floor living room thermostat',
            accessInstructions: 'Use front door, key under mat if nobody home'
          },
          scheduling: {
            preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            preferredTimeWindow: '9:00 AM - 12:00 PM',
            flexibility: 'flexible',
            avoidTimes: ['5:00 PM - 7:00 PM (dinner time)']
          },
          attachments: [
            {
              id: 'att-001',
              name: 'thermostat-photo.jpg',
              type: 'photo',
              url: '/images/thermostat.jpg',
              description: 'Current thermostat reading'
            },
            {
              id: 'att-002',
              name: 'outdoor-unit.jpg',
              type: 'photo',
              url: '/images/outdoor-unit.jpg',
              description: 'Outdoor AC unit - seems to have ice buildup'
            }
          ],
          status: 'submitted',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          estimatedCost: {
            min: 150,
            max: 450
          }
        }
      ]

      const mockServiceHistory: ServiceHistory[] = Array.from({ length: 12 }, (_, i) => {
        const serviceTypes = ['hvac', 'plumbing', 'electrical', 'appliance', 'maintenance'] as const
        const services = {
          hvac: ['AC Repair', 'Heating Service', 'Duct Cleaning', 'Thermostat Install'],
          plumbing: ['Drain Cleaning', 'Leak Repair', 'Water Heater Service', 'Toilet Repair'],
          electrical: ['Outlet Installation', 'Panel Upgrade', 'Light Fixture', 'Wiring Repair'],
          appliance: ['Washer Repair', 'Dryer Service', 'Refrigerator Fix', 'Dishwasher'],
          maintenance: ['Annual Tune-up', 'Safety Inspection', 'Filter Change', 'System Check']
        }
        
        const type = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]
        const service = services[type][Math.floor(Math.random() * services[type].length)]
        const cost = Math.floor(Math.random() * 800) + 150
        const parts = Math.floor(cost * (Math.random() * 0.4 + 0.2))
        const labor = Math.floor(cost * 0.6)
        const tax = Math.floor(cost * 0.08)
        
        return {
          id: 'hist-${String(i + 1).padStart(3, '0')}',
          workOrderNumber: 'WO-2024-${String(i + 1200).padStart(4, '0')}',
          type,
          service,
          description: 'Professional ${service.toLowerCase()} service with comprehensive inspection and repair.',
          technician: {
            name: ['Mike Rodriguez', 'Sarah Johnson', 'David Chen', 'Amy Williams'][Math.floor(Math.random() * 4)],
            rating: Math.random() * 1 + 4 // 4.0 to 5.0
          },
          date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          duration: Math.floor(Math.random() * 180) + 60, // 1-4 hours
          status: Math.random() < 0.95 ? 'completed' : 'cancelled',
          address: i % 2 === 0 ? '1847 Oak Street, Springfield, IL' : '3421 Maple Avenue, Springfield, IL',
          cost: {
            parts,
            labor,
            tax,
            total: parts + labor + tax
          },
          warranty: {
            parts: Math.floor(Math.random() * 24) + 12, // 12-36 months
            labor: Math.floor(Math.random() * 12) + 6, // 6-18 months
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          photos: i % 3 === 0 ? ['/images/before.jpg', '/images/after.jpg'] : [],
          invoice: {
            number: 'INV-2024-${String(i + 1200).padStart(4, '0')}',
            url: '/invoices/invoice-${i + 1}.pdf'
          },
          rating: Math.random() < 0.8 ? {
            overall: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            punctuality: Math.floor(Math.random() * 2) + 4,
            quality: Math.floor(Math.random() * 2) + 4,
            cleanliness: Math.floor(Math.random() * 2) + 4,
            communication: Math.floor(Math.random() * 2) + 4,
            review: Math.random() < 0.5 ? 'Excellent service! Very professional and thorough.' : undefined
          } : undefined
        }
      })

      const mockInvoices: Invoice[] = Array.from({ length: 8 }, (_, i) => {
        const subtotal = Math.floor(Math.random() * 700) + 200
        const tax = Math.floor(subtotal * 0.08)
        const discount = i % 4 === 0 ? Math.floor(subtotal * 0.1) : 0
        const total = subtotal + tax - discount
        const status = i < 2 ? 'pending' : i < 6 ? 'paid' : i < 7 ? 'overdue' : 'partial'
        const paid = status === 'paid' ? total : status === 'partial' ? Math.floor(total * 0.5) : 0
        
        return {
          id: 'inv-${String(i + 1).padStart(3, '0')}',
          invoiceNumber: 'INV-2024-${String(i + 2000).padStart(4, '0')}',
          workOrderNumber: 'WO-2024-${String(i + 2000).padStart(4, '0')}',
          date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status,
          amount: {
            subtotal,
            tax,
            discount,
            total,
            paid,
            balance: total - paid
          },
          services: [
            {
              description: 'HVAC Service Call',
              quantity: 1,
              rate: Math.floor(subtotal * 0.6),
              amount: Math.floor(subtotal * 0.6)
            },
            {
              description: 'Parts & Materials',
              quantity: 1,
              rate: Math.floor(subtotal * 0.4),
              amount: Math.floor(subtotal * 0.4)
            }
          ],
          paymentMethod: status === 'paid' ? ['Credit Card', 'Bank Transfer', 'Check'][Math.floor(Math.random() * 3)] : undefined,
          paymentDate: status === 'paid' ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          downloadUrl: '/invoices/invoice-${i + 1}.pdf'
        }
      })

      setProfile(mockProfile)
      setServiceRequests(mockServiceRequests)
      setServiceHistory(mockServiceHistory)
      setInvoices(mockInvoices)
    } catch (error) {
      console.error('Error fetching portal data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPortalStats = () => {
    if (!profile) return { totalServices: 0, totalSpent: 0, loyaltyPoints: 0, nextAppointment: null }
    
    const totalServices = serviceHistory.filter(s => s.status === 'completed').length
    const totalSpent = serviceHistory
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.cost.total, 0)
    const loyaltyPoints = profile.loyalty.points
    const nextAppointment = serviceRequests.find(r => r.status === 'scheduled')

    return {
      totalServices,
      totalSpent,
      loyaltyPoints,
      nextAppointment,
      pendingInvoices: invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length,
      averageRating: serviceHistory
        .filter(s => s.rating)
        .reduce((sum, s) => sum + (s.rating?.overall || 0), 0) / serviceHistory.filter(s => s.rating).length || 0
    }
  }

  const stats = getPortalStats()

  const historyColumns = [
    {
      key: 'workOrderNumber',
      label: 'Work Order',
      render: (row: unknown) => (
        <span className="font-mono text-sm text-blue-400">{row.workOrderNumber}</span>
      )
    },
    {
      key: 'service',
      label: 'Service',
      render: (row: unknown) => (
        <div>
          <div className="font-medium text-white">{row.service}</div>
          <div className="text-sm text-neutral-400">{row.type.toUpperCase()}</div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (row: unknown) => (
        <span className="text-neutral-300">
          {new Date(row.date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'technician.name',
      label: 'Technician',
      render: (row: unknown) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium mr-3">
            {row.technician.name.split(' ').map((n: string) => n[0]).join(')}
          </div>
          <span className="text-white">{row.technician.name}</span>
        </div>
      )
    },
    {
      key: 'cost.total',
      label: 'Total',
      render: (row: unknown) => (
        <span className="text-green-400 font-medium">
          ${row.cost.total.toLocaleString()}
        </span>
      )
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (row: unknown) => (
        <div>
          {row.rating ? (
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={'h-4 w-4 ${
                    star <= row.rating.overall 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-neutral-600'
              }'} '
                />
              ))}
            </div>
          ) : (
            <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700 text-xs">
              Rate Service
            </Button>
          )}
        </div>
      )
    }
  ]

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (row: unknown) => (
        <span className="font-mono text-sm text-blue-400">{row.invoiceNumber}</span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (row: unknown) => (
        <span className="text-neutral-300">
          {new Date(row.date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'amount.total',
      label: 'Amount',
      render: (row: unknown) => (
        <span className="text-white font-medium">
          ${row.amount.total.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: unknown) => (
        <div className={'px-3 py-1 rounded-full text-sm font-medium ${
          row.status === 'paid' ? 'bg-green-800 text-green-200' :
          row.status === 'pending' ? 'bg-yellow-800 text-yellow-200' :
          row.status === 'overdue' ? 'bg-red-800 text-red-200' :
          'bg-blue-800 text-blue-200'
              }'}>'
          {row.status.toUpperCase()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: unknown) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          {(row.status === 'pending' || row.status === 'overdue') && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="h-4 w-4 mr-1" />
              Pay
            </Button>
          )}
        </div>
      )
    }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {profile?.personalInfo.firstName}!
            </h2>
            <p className="text-blue-200">
              You're a {profile?.personalInfo.tier} customer with {profile?.loyalty.points} loyalty points'
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{profile?.loyalty.tier}</div>
            <div className="text-blue-200 text-sm">Member Since {new Date(profile?.personalInfo.joinDate || ').getFullYear()}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-blue-400">
              <Wrench className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{stats.totalServices}</h3>
            <p className="text-sm text-neutral-400">Total Services</p>
            <p className="text-xs text-neutral-500">Lifetime history</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-green-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">${stats.totalSpent.toLocaleString()}</h3>
            <p className="text-sm text-neutral-400">Total Spent</p>
            <p className="text-xs text-neutral-500">All time</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-purple-400">
              <Award className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{stats.loyaltyPoints}</h3>
            <p className="text-sm text-neutral-400">Loyalty Points</p>
            <p className="text-xs text-neutral-500">{profile?.loyalty.nextTierPoints! - stats.loyaltyPoints} to next tier</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-yellow-400">
              <Star className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{stats.averageRating?.toFixed(1) || '0.0'}</h3>
            <p className="text-sm text-neutral-400">Avg Rating Given</p>
            <p className="text-xs text-neutral-500">Your service ratings</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Request Service
            </Button>
            <Button variant="outline" className="w-full bg-neutral-800 border-neutral-700 justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
            <Button variant="outline" className="w-full bg-neutral-800 border-neutral-700 justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {serviceHistory.slice(0, 3).map((service) => (
              <div key={service.id} className="flex items-center p-2 bg-neutral-800/50 rounded-lg">
                <div className={'w-3 h-3 rounded-full mr-3 ${
                  service.status === 'completed' ? 'bg-green-500' : 'bg-red-500`
              }'} />'
                <div className="flex-1">
                  <div className="text-white text-sm">{service.service}</div>
                  <div className="text-neutral-400 text-xs">
                    {new Date(service.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-green-400 text-sm font-medium">
                  ${service.cost.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Available Rewards</h3>
          <div className="space-y-3">
            {profile?.loyalty.rewards.filter(r => r.isRedeemable).slice(0, 3).map((reward) => (
              <div key={reward.id} className="p-2 bg-neutral-800/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-white text-sm font-medium">{reward.name}</div>
                  <div className="text-purple-400 text-sm">{reward.points} pts</div>
                </div>
                <div className="text-neutral-400 text-xs">{reward.description}</div>
                <Button size="sm" className="w-full mt-2 bg-purple-600 hover:bg-purple-700">
                  Redeem
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Items */}
      {((stats.pendingInvoices || 0) > 0 || serviceRequests.length > 0) && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Attention Required</h3>
          <div className="space-y-3">
            {(stats.pendingInvoices || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-900/20 border border-orange-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-orange-400 mr-3" />
                  <div>
                    <div className="text-white font-medium">Outstanding Invoices</div>
                    <div className="text-orange-300 text-sm">{stats.pendingInvoices} unpaid invoice(s)</div>
                  </div>
                </div>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  View & Pay
                </Button>
              </div>
            )}
            {serviceRequests.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-3" />
                  <div>
                    <div className="text-white font-medium">Pending Service Requests</div>
                    <div className="text-blue-300 text-sm">{serviceRequests.length} request(s) awaiting scheduling</div>
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  View Requests
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderServiceRequest = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Service Requests</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {serviceRequests.map((request) => (
        <div key={request.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{request.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className={'px-2 py-1 rounded text-xs font-medium ${
                  request.priority === 'emergency' ? 'bg-red-800 text-red-200' :
                  request.priority === 'high' ? 'bg-orange-800 text-orange-200' :
                  request.priority === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                  'bg-neutral-800 text-neutral-200`
              }'}>'
                  {request.priority.toUpperCase()} PRIORITY
                </div>
                <div className={'px-2 py-1 rounded text-xs font-medium ${
                  request.status === 'submitted' ? 'bg-blue-800 text-blue-200' :
                  request.status === 'scheduled' ? 'bg-green-800 text-green-200' :
                  'bg-neutral-800 text-neutral-200'
              }'}>'
                  {request.status.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-400">Estimated Cost</div>
              <div className="text-lg font-semibold text-green-400">
                ${request.estimatedCost?.min} - ${request.estimatedCost?.max}
              </div>
            </div>
          </div>

          <p className="text-neutral-300 mb-4">{request.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-white mb-2">Location</h4>
              <div className="text-sm text-neutral-300">
                {profile?.addresses.find(a => a.id === request.location.addressId)?.name}
              </div>
              <div className="text-sm text-neutral-400">
                {profile?.addresses.find(a => a.id === request.location.addressId)?.address}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Preferred Schedule</h4>
              <div className="text-sm text-neutral-300">
                {request.scheduling.preferredDate && new Date(request.scheduling.preferredDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-neutral-400">
                {request.scheduling.preferredTimeWindow}
              </div>
            </div>
          </div>

          {request.attachments.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-white mb-2">Attachments</h4>
              <div className="flex gap-2">
                {request.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center p-2 bg-neutral-800/50 rounded-lg">
                    <Camera className="h-4 w-4 text-neutral-400 mr-2" />
                    <span className="text-sm text-neutral-300">{attachment.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit Request
            </Button>
            {request.status === 'submitted' && (
              <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700 text-red-400 border-red-800 hover:bg-red-900">
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Request
              </Button>
            )}
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      ))}

      {serviceRequests.length === 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <Wrench className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Service Requests</h3>
          <p className="text-neutral-400 mb-4">You don't have any pending service requests.</p>'
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Request Service
          </Button>
        </div>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'services':
        return renderServiceRequest()
      case 'history':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Service History</h2>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
              {(DataTable as any)({
                columns: historyColumns,
                data: serviceHistory,
                className: "border-0"
              })}
            </div>
          </div>
        )
      case 'billing':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Billing & Payments</h2>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Statements
                </Button>
              </div>
            </div>

            {/* Outstanding Balance Alert */}
            {invoices.some(i => i.status === 'overdue') && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                  <div>
                    <div className="text-red-400 font-medium">Overdue Balance</div>
                    <div className="text-red-300 text-sm">
                      You have overdue invoices that require immediate attention.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
              {(DataTable as any)({
                columns: invoiceColumns,
                data: invoices,
                className: "border-0"
              })}
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Profile Settings</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">First Name</label>
                      <input
                        type="text"
                        value={profile?.personalInfo.firstName}
                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={profile?.personalInfo.lastName}
                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile?.personalInfo.email}
                      className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profile?.personalInfo.phone}
                      className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Service Addresses</h3>
                <div className="space-y-3">
                  {profile?.addresses.map((address) => (
                    <div key={address.id} className="p-3 bg-neutral-800/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-white">{address.name}</div>
                        {address.isPrimary && (
                          <div className="px-2 py-1 bg-blue-800 text-blue-200 text-xs rounded">
                            Primary
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-neutral-300">
                        {address.address}, {address.city}, {address.state} {address.zipCode}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {address.propertyDetails.type.replace('_', ' ')} • {address.propertyDetails.size}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 bg-neutral-800 border-neutral-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Communication Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Preferred Contact Method</label>
                  <select className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white">
                    <option value="email">Email</option>
                    <option value="sms">SMS/Text</option>
                    <option value="phone">Phone</option>
                    <option value="app">App Notifications</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Emergency Contact</label>
                  <input
                    type="text"
                    value={profile?.preferences.emergencyContact}
                    className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                    readOnly
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-white mb-3">Notification Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile?.preferences.appointmentReminders}
                      className="mr-3"
                      readOnly
                    />
                    <span className="text-neutral-300">Appointment reminders</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile?.preferences.serviceNotifications}
                      className="mr-3"
                      readOnly
                    />
                    <span className="text-neutral-300">Service notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile?.preferences.marketingEmails}
                      className="mr-3"
                      readOnly
                    />
                    <span className="text-neutral-300">Marketing emails</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )
      case 'rewards':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Loyalty & Rewards</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{profile?.loyalty.points}</div>
                <div className="text-sm text-neutral-400">Available Points</div>
              </div>
            </div>

            {/* Loyalty Status */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{profile?.loyalty.tier} Member</h3>
                  <p className="text-purple-200">
                    {profile?.loyalty.nextTierPoints! - profile?.loyalty.points!} points to {profile?.loyalty.tier === 'Gold' ? 'Platinum' : 'next tier`}
                  </p>
                </div>
                <Award className="h-12 w-12 text-yellow-400" />
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                  style={{ width: '${(profile?.loyalty.points! / profile?.loyalty.nextTierPoints!) * 100}%' }}
                />
              </div>
            </div>

            {/* Available Rewards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile?.loyalty.rewards.map((reward) => (
                <div key={reward.id} className={'border rounded-lg p-4 ${
                  reward.isRedeemable 
                    ? 'bg-neutral-900 border-neutral-800' 
                    : 'bg-neutral-800/50 border-neutral-700 opacity-75'
              }'}>'
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-white">{reward.name}</h4>
                    <div className="text-purple-400 font-bold">{reward.points} pts</div>
                  </div>
                  <p className="text-neutral-300 text-sm mb-4">{reward.description}</p>
                  <Button 
                    size="sm" 
                    disabled={!reward.isRedeemable}
                    className={reward.isRedeemable 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-neutral-700 cursor-not-allowed'
                    }
                  >
                    {reward.isRedeemable ? 'Redeem' : 'Not Enough Points'}
                  </Button>
                </div>
              ))}
            </div>

            {/* Referral Program */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Referral Program</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-green-400">{profile?.loyalty.referrals.count}</div>
                    <div className="text-neutral-400">Successful Referrals</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-purple-400">{profile?.loyalty.referrals.rewards}</div>
                    <div className="text-neutral-400">Bonus Points Earned</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Share Your Referral Code</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="JENNIFER2024"
                      className="flex-1 p-2 bg-neutral-800 border border-neutral-700 rounded text-white font-mono"
                      readOnly
                    />
                    <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700">
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-neutral-400 mt-2">
                    Earn 100 points for each friend who uses your code!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-925">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {profile?.personalInfo.firstName?.[0]}{profile?.personalInfo.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Customer Portal</h1>
                <p className="mt-1 text-sm text-neutral-400">
                  Manage your services, billing, and account preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-neutral-800/50 p-1 rounded-lg">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: Home },
              { key: 'services', label: 'Service Requests', icon: Wrench },
              { key: 'history', label: 'Service History', icon: History },
              { key: 'billing', label: 'Billing', icon: CreditCard },
              { key: 'profile', label: 'Profile', icon: User },
              { key: 'rewards', label: 'Rewards', icon: Award }
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
    </div>
  )
}