'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Eye,
  Star,
  Building,
  User,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Circle
} from 'lucide-react'

import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { InlineConfirmBar } from '@/components/ui'

interface Customer {
  id: string
  type: 'residential' | 'commercial'
  name: string
  companyName?: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    coordinates?: { lat: number; lng: number }
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  contactPerson?: string
  status: 'active' | 'inactive' | 'prospect' | 'lead'
  priority: 'standard' | 'vip' | 'high_value'
  rating: number
  totalJobs: number
  totalRevenue: number
  lastJobDate: string | null
  nextScheduledDate: string | null
  tags: string[]
  source: 'referral' | 'website' | 'google' | 'facebook' | 'direct' | 'other'
  assignedRep?: {
    id: string
    name: string
    email: string
  }
  notes: Array<{
    id: string
    text: string
    author: string
    createdAt: string
    type: 'general' | 'billing' | 'service' | 'complaint'
  }>
  properties: Array<{
    id: string
    name: string
    type: 'primary' | 'secondary'
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    details: {
      squareFootage?: number
      yearBuilt?: number
      hvacSystem?: string
      plumbingAge?: number
      electricalAge?: number
    }
  }>
  preferences: {
    communicationMethod: 'phone' | 'email' | 'sms' | 'any'
    bestTimeToCall: string
    serviceReminders: boolean
    marketingEmails: boolean
  }
  financialInfo: {
    creditRating?: 'excellent' | 'good' | 'fair' | 'poor'
    paymentTerms: string
    discountLevel: number
    outstandingBalance: number
  }
  createdAt: string
  updatedAt: string
}

const statusColors = {
  active: 'text-green-500',
  inactive: 'text-neutral-500',
  prospect: 'text-blue-500',
  lead: 'text-yellow-500'
}

const priorityColors = {
  standard: 'text-neutral-500',
  vip: 'text-purple-500',
  high_value: 'text-orange-500'
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>(')
  const [filterType, setFilterType] = useState<'all' | 'residential' | 'commercial'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | Customer['status']>('all')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      // Generate comprehensive mock customer data
      const mockCustomers: Customer[] = Array.from({ length: 100 }, (_, i) => {
        const isCommercial = i % 4 === 0
        const customerTypes = ['residential', 'commercial'] as const
        const statuses: Customer['status'][] = ['active', 'inactive', 'prospect', 'lead']
        const priorities: Customer['priority'][] = ['standard', 'vip', 'high_value']
        const sources: Customer['source'][] = ['referral', 'website', 'google', 'facebook', 'direct', 'other']
        
        const residentialNames = [
          'John Smith', 'Jane Doe', 'Robert Johnson', 'Sarah Wilson', 'Michael Brown',
          'Emily Davis', 'David Miller', 'Lisa Garcia', 'Christopher Martinez', 'Amanda Anderson',
          'James Taylor', 'Jennifer Thomas', 'William Jackson', 'Elizabeth White', 'Richard Harris'
        ]
        
        const commercialNames = [
          'ABC Corp', 'TechFlow Solutions', 'Green Valley Restaurant', 'Premier Medical Center', 'Downtown Retail Plaza',
          'Metro Office Complex', 'Sunrise Manufacturing', 'City Hall', 'Westside Shopping Center', 'Eagle Construction'
        ]
        
        const name = isCommercial ? commercialNames[i % commercialNames.length] : residentialNames[i % residentialNames.length]
        const totalJobs = Math.floor(Math.random() * 25) + 1
        const avgJobValue = isCommercial ? 2500 : 450
        const totalRevenue = totalJobs * (avgJobValue + Math.random() * avgJobValue)
        
        return {
          id: 'cust-${i + 1}',
          type: isCommercial ? 'commercial' : 'residential',
          name,
          companyName: isCommercial ? name : undefined,
          email: '${name.toLowerCase().replace(/\s+/g, '.')}@${isCommercial ? 'company' : 'email'}.com`,
          phone: '(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}',
          address: {
            street: '${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Cedar', 'Elm', 'Maple'][i % 6]} St',
            city: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth'][i % 5],
            state: 'TX',
            zipCode: String(78700 + Math.floor(Math.random() * 100)),
            coordinates: {
              lat: 30.2672 + (Math.random() - 0.5) * 0.1,
              lng: -97.7431 + (Math.random() - 0.5) * 0.1
            }
          },
          contactPerson: isCommercial ? residentialNames[i % residentialNames.length] : undefined,
          status: statuses[i % statuses.length],
          priority: priorities[i % priorities.length],
          rating: Math.floor(Math.random() * 5) + 1,
          totalJobs,
          totalRevenue: Math.round(totalRevenue),
          lastJobDate: i % 3 === 0 ? null : new Date(Date.now() - (Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
          nextScheduledDate: i % 4 === 0 ? new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString() : null,
          tags: [
            ['premium', 'loyal'],
            ['new-customer', 'referral'],
            ['maintenance-plan', 'priority'],
            ['commercial', 'contract'],
            ['residential', 'warranty']
          ][i % 5],
          source: sources[i % sources.length],
          assignedRep: i % 3 === 0 ? {
            id: 'rep-${i % 5 + 1}',
            name: ['Mike Sales', 'Sarah Rep', 'Tom Account', 'Amy Customer', 'Dave Relations`][i % 5],
            email: `rep${i % 5 + 1}@company.com'
          } : undefined,
          notes: [
            {
              id: 'note-${i}-1',
              text: 'Prefers morning appointments. Has 2 dogs.',
              author: 'System',
              createdAt: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
              type: 'service'
            }
          ],
          properties: isCommercial ? [
            {
              id: 'prop-${i}-1',
              name: 'Main Building',
              type: 'primary',
              address: {
                street: '${Math.floor(Math.random() * 9999) + 1} Business Dr',
                city: ['Austin', 'Dallas', 'Houston'][i % 3],
                state: 'TX',
                zipCode: String(78700 + Math.floor(Math.random() * 100))
              },
              details: {
                squareFootage: Math.floor(Math.random() * 50000) + 5000,
                yearBuilt: 1990 + Math.floor(Math.random() * 30),
                hvacSystem: ['Central Air', 'Rooftop Units', 'Split System'][i % 3]
              }
            }
          ] : [
            {
              id: 'prop-${i}-1',
              name: 'Primary Residence',
              type: 'primary',
              address: {
                street: '${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine'][i % 3]} St',
                city: ['Austin', 'Dallas', 'Houston'][i % 3],
                state: 'TX',
                zipCode: String(78700 + Math.floor(Math.random() * 100))
              },
              details: {
                squareFootage: Math.floor(Math.random() * 3000) + 1200,
                yearBuilt: 1980 + Math.floor(Math.random() * 40),
                hvacSystem: ['Central Air', 'Heat Pump', 'Window Units'][i % 3],
                plumbingAge: Math.floor(Math.random() * 30) + 5,
                electricalAge: Math.floor(Math.random() * 25) + 10
              }
            }
          ],
          preferences: {
            communicationMethod: ['phone', 'email', 'sms', 'any'][i % 4] as 'phone' | 'email' | 'sms' | 'any',
            bestTimeToCall: ['Morning (8-12)', 'Afternoon (12-5)', 'Evening (5-8)', 'Anytime'][i % 4],
            serviceReminders: i % 2 === 0,
            marketingEmails: i % 3 === 0
          },
          financialInfo: {
            creditRating: ['excellent', 'good', 'fair', 'poor'][i % 4] as 'excellent' | 'good' | 'fair' | 'poor',
            paymentTerms: isCommercial ? 'Net 30' : 'Due on completion',
            discountLevel: i % 5 === 0 ? 10 : 0,
            outstandingBalance: i % 6 === 0 ? Math.floor(Math.random() * 2000) : 0
          },
          createdAt: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
          updatedAt: new Date(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
        }
      })
      
      setCustomers(mockCustomers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = (action: string) => {
    setBulkAction(action)
    setShowBulkActions(true)
  }

  const confirmBulkAction = () => {
    console.log('Performing ${bulkAction} on customers:', selectedRows)
    setShowBulkActions(false)
    setSelectedRows([])
    setBulkAction(')
  }

  const getStatusIcon = (status: Customer['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'inactive': return <XCircle className="h-4 w-4" />
      case 'prospect': return <Clock className="h-4 w-4" />
      case 'lead': return <AlertTriangle className="h-4 w-4" />
      default: return <Circle className="h-4 w-4" />
    }
  }

  const getPriorityIcon = (priority: Customer['priority']) => {
    switch (priority) {
      case 'vip': return <Star className="h-4 w-4 text-purple-500" />
      case 'high_value': return <DollarSign className="h-4 w-4 text-orange-500" />
      default: return null
    }
  }

  const filteredCustomers = customers.filter(customer => {
    if (filterType !== 'all' && customer.type !== filterType) return false
    if (filterStatus !== 'all' && customer.status !== filterStatus) return false
    return true
  })

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      width: '200px',
      render: (customer: unknown) => (
        <div className="flex items-center gap-3">
          <div className={'h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
            customer.type === 'commercial' ? 'bg-blue-500' : 'bg-green-500'
          }'}>
            {customer.type === 'commercial' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-medium text-white flex items-center gap-2">
              {customer.name}
              {getPriorityIcon(customer.priority)}
            </div>
            <div className="text-sm text-neutral-400">
              {customer.type === 'commercial' && customer.contactPerson && (
                <span>Contact: {customer.contactPerson}</span>
              )}
              {customer.type === 'residential' && customer.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact Info',
      width: '180px',
      render: (customer: unknown) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-neutral-300">
            <Phone className="h-3 w-3 mr-2" />
            {customer.phone}
          </div>
          <div className="flex items-center text-sm text-neutral-300">
            <Mail className="h-3 w-3 mr-2" />
            <span className="truncate">{customer.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      width: '150px',
      render: (customer: unknown) => (
        <div className="flex items-start text-sm text-neutral-300">
          <MapPin className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div>{customer.address.city}, {customer.address.state}</div>
            <div className="text-xs text-neutral-500">{customer.address.zipCode}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (customer: unknown) => (
        <div className={'flex items-center ${statusColors[customer.status as keyof typeof statusColors]}'}>
          {getStatusIcon(customer.status)}
          <span className="capitalize text-sm ml-2">{customer.status}</span>
        </div>
      )
    },
    {
      key: 'jobStats',
      label: 'Jobs & Revenue',
      width: '140px',
      render: (customer: unknown) => (
        <div className="text-sm">
          <div className="text-white font-medium">{customer.totalJobs} jobs</div>
          <div className="text-green-400">${customer.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-neutral-500">
            ⭐ {customer.rating}.0 rating
          </div>
        </div>
      )
    },
    {
      key: 'lastJob',
      label: 'Last Job',
      width: '120px',
      render: (customer: unknown) => customer.lastJobDate ? (
        <div className="text-sm">
          <div className="text-neutral-300">
            {new Date(customer.lastJobDate).toLocaleDateString()}
          </div>
          <div className="text-xs text-neutral-500">
            {Math.floor((Date.now() - new Date(customer.lastJobDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </div>
        </div>
      ) : (
        <span className="text-neutral-500 text-sm">No jobs yet</span>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      width: '120px',
      render: (customer: unknown) => (
        <div className="flex flex-wrap gap-1">
          {customer.tags.slice(0, 2).map((tag: unknown, index: number) => (
            <span key={index} className="bg-neutral-700 text-neutral-300 px-2 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
          {customer.tags.length > 2 && (
            <span className="text-xs text-neutral-500">
              +{customer.tags.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: ',
      width: '60px',
      render: (customer: unknown) => (
        <div className="flex items-center gap-1">
          <button className="text-neutral-400 hover:text-white p-1">
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-neutral-400 hover:text-white p-1">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const bulkActions = [
    {
      label: 'Assign Rep',
      icon: User,
      onClick: () => handleBulkAction('assign_rep'),
      variant: 'default' as const
    },
    {
      label: 'Add Tags',
      icon: Plus,
      onClick: () => handleBulkAction('add_tags'),
      variant: 'outline' as const
    },
    {
      label: 'Send Campaign',
      icon: Mail,
      onClick: () => handleBulkAction('send_campaign'),
      variant: 'outline' as const
    },
    {
      label: 'Export',
      icon: Download,
      onClick: () => handleBulkAction('export'),
      variant: 'outline' as const
    }
  ]

  const filters = [
    {
      key: 'type',
      label: 'Customer Type',
      type: 'select' as const,
      options: [
        { label: 'All Types', value: 'all' },
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' }
      ],
      value: filterType,
      onChange: (value: string) => setFilterType(value as typeof filterType)
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Prospect', value: 'prospect' },
        { label: 'Lead', value: 'lead' }
      ],
      value: filterStatus,
      onChange: (value: string) => setFilterStatus(value as typeof filterStatus)
    }
  ]

  // Quick stats
  const totalCustomers = filteredCustomers.length
  const activeCustomers = filteredCustomers.filter(c => c.status === 'active').length
  const vipCustomers = filteredCustomers.filter(c => c.priority === 'vip').length
  const totalRevenue = filteredCustomers.reduce((sum, c) => sum + c.totalRevenue, 0)
  const avgRating = filteredCustomers.reduce((sum, c) => sum + c.rating, 0) / filteredCustomers.length

  return (
    <div className="min-h-screen bg-neutral-950">
      <InlineConfirmBar
        isOpen={showBulkActions}
        title={'${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1).replace('_', ' ')} Customers'}
        description={'${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1).replace('_', ' ')} ${selectedRows.length} selected customer${selectedRows.length > 1 ? 's' : '}?'}
        confirmText="Confirm"
        onConfirm={confirmBulkAction}
        onCancel={() => setShowBulkActions(false)}
      />
      
      {/* Header with Stats */}
      <div className="border-b border-neutral-800 bg-neutral-900">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Customer Management</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Manage your customer relationships, properties, and service history
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 rounded-lg p-2">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Total</p>
                  <p className="text-lg font-semibold text-white">{totalCustomers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Active</p>
                  <p className="text-lg font-semibold text-white">{activeCustomers}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600/10 rounded-lg p-2">
                  <Star className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">VIP</p>
                  <p className="text-lg font-semibold text-white">{vipCustomers}</p>
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

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-600/10 rounded-lg p-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Avg Rating</p>
                  <p className="text-lg font-semibold text-white">{avgRating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 h-full">
          {(DataTable as any)({
            data: filteredCustomers,
            columns: columns,
            searchable: false,
            className: "h-full dispatch-table-dark"
          })}
        </div>
      </div>
    </div>
  )
}
