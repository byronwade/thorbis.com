'use client'

import { Button } from '@/components/ui/button';
import { InlineConfirmBar } from '@/components/ui';

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  DollarSign,
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Copy,
  Send,
  Download,
  FileText,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

import { DataTable } from '@/components/ui/data-table'

interface EstimateLineItem {
  id: string
  category: 'labor' | 'material' | 'equipment' | 'permit' | 'other'
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discount: number
  total: number
  taxable: boolean
}

interface Estimate {
  id: string
  estimateNumber: string
  title: string
  description: string
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'converted'
  priority: 'standard' | 'urgent' | 'rush'
  
  // Customer information
  customer: {
    id: string
    name: string
    type: 'residential' | 'commercial'
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
  }

  // Service details
  serviceType: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'general' | 'maintenance'
  serviceCategory: 'repair' | 'installation' | 'maintenance' | 'inspection' | 'emergency'
  
  // Pricing tiers (Good, Better, Best)
  pricingTiers: {
    good: {
      name: string
      description: string
      lineItems: EstimateLineItem[]
      subtotal: number
      tax: number
      discount: number
      total: number
    }
    better: {
      name: string
      description: string
      lineItems: EstimateLineItem[]
      subtotal: number
      tax: number
      discount: number
      total: number
    }
    best: {
      name: string
      description: string
      lineItems: EstimateLineItem[]
      subtotal: number
      tax: number
      discount: number
      total: number
    }
  }

  // Selected tier by customer
  selectedTier?: 'good' | 'better' | 'best'

  // Estimate metadata
  estimatedDuration: number // in hours
  validUntil: string
  assignedTo: {
    id: string
    name: string
    email: string
    role: 'estimator' | 'technician' | 'sales'
  }
  
  // Approval workflow
  approvalRequired: boolean
  approvedBy?: {
    id: string
    name: string
    approvedAt: string
    comments?: string
  }
  
  // Conversion tracking
  convertedToJob?: {
    jobId: string
    convertedAt: string
    actualCost: number
    profitMargin: number
  }
  
  // Customer interaction
  sentAt?: string
  viewedAt?: string
  customerComments?: string
  customerRating?: number
  
  // Templates and photos
  templateUsed?: string
  photos: Array<{
    id: string
    url: string
    description: string
    uploadedAt: string
  }>
  
  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy: string
}

const statusColors = {
  draft: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  converted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
}

const statusIcons = {
  draft: FileText,
  sent: Send,
  viewed: Eye,
  approved: CheckCircle,
  rejected: XCircle,
  expired: Clock,
  converted: TrendingUp
}

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEstimates()
  }, [])

  const fetchEstimates = async () => {
    try {
      // Generate comprehensive mock estimate data with tiered pricing
      const mockEstimates: Estimate[] = Array.from({ length: 75 }, (_, i) => {
        const serviceTypes: Estimate['serviceType'][] = ['hvac', 'plumbing', 'electrical', 'appliance', 'general', 'maintenance']
        const serviceCategories: Estimate['serviceCategory'][] = ['repair', 'installation', 'maintenance', 'inspection', 'emergency']
        const statuses: Estimate['status'][] = ['draft', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'converted']
        const priorities: Estimate['priority'][] = ['standard', 'urgent', 'rush']
        
        const customerNames = [
          'John Smith', 'Jane Doe', 'Robert Johnson', 'Sarah Wilson', 'Michael Brown',
          'Emily Davis', 'David Miller', 'Lisa Garcia', 'Christopher Martinez', 'Amanda Anderson',
          'James Taylor', 'Jennifer Thomas', 'William Jackson', 'Elizabeth White', 'Richard Harris'
        ]
        
        const jobTitles = [
          'HVAC System Replacement', 'Water Heater Installation', 'Electrical Panel Upgrade',
          'Dishwasher Repair', 'Furnace Maintenance', 'Plumbing Leak Fix', 'AC Unit Service',
          'Appliance Installation', 'Emergency Heating Repair', 'Kitchen Remodel Electrical'
        ]
        
        const serviceType = serviceTypes[i % serviceTypes.length]
        const serviceCategory = serviceCategories[i % serviceCategories.length]
        const status = statuses[i % statuses.length]
        const customerName = customerNames[i % customerNames.length]
        const title = jobTitles[i % jobTitles.length]
        
        // Generate realistic pricing based on service type
        const baseLaborRate = serviceType === 'electrical' ? 95 : serviceType === 'plumbing' ? 85 : 75
        const baseMaterialMultiplier = serviceType === 'hvac' ? 2.5 : serviceType === 'appliance' ? 1.8 : 1.2
        
        // Good tier (basic option)
        const goodLabor = Math.floor(Math.random() * 800) + 200
        const goodMaterials = Math.floor(goodLabor * baseMaterialMultiplier * 0.8)
        const goodSubtotal = goodLabor + goodMaterials
        const goodTax = goodSubtotal * 0.08
        const goodTotal = goodSubtotal + goodTax
        
        // Better tier (recommended option)
        const betterLabor = Math.floor(goodLabor * 1.4)
        const betterMaterials = Math.floor(goodMaterials * 1.5)
        const betterSubtotal = betterLabor + betterMaterials
        const betterTax = betterSubtotal * 0.08
        const betterTotal = betterSubtotal + betterTax
        
        // Best tier (premium option)
        const bestLabor = Math.floor(goodLabor * 1.8)
        const bestMaterials = Math.floor(goodMaterials * 2.0)
        const bestSubtotal = bestLabor + bestMaterials
        const bestTax = bestSubtotal * 0.08
        const bestTotal = bestSubtotal + bestTax
        
        const selectedTiers = ['good', 'better', 'best'] as const
        const selectedTier = i % 3 === 0 ? selectedTiers[Math.floor(Math.random() * 3)] : undefined
        
        const createdAt = new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
        const validUntil = new Date(createdAt.getTime() + (30 * 24 * 60 * 60 * 1000))
        
        return {
          id: 'est-${i + 1}',
          estimateNumber: 'EST-2024-${String(i + 1).padStart(4, '0')}`,
          title,
          description: `Comprehensive ${serviceType} ${serviceCategory} service with detailed assessment and professional installation/repair.',
          status,
          priority: priorities[i % priorities.length],
          
          customer: {
            id: 'cust-${(i % 15) + 1}',
            name: customerName,
            type: i % 4 === 0 ? 'commercial' : 'residential',
            email: '${customerName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
            phone: '(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}',
            address: {
              street: '${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Cedar', 'Elm'][i % 5]} St',
              city: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth'][i % 5],
              state: 'TX',
              zipCode: String(78700 + Math.floor(Math.random() * 100))
            }
          },
          
          serviceType,
          serviceCategory,
          
          pricingTiers: {
            good: {
              name: 'Essential Service',
              description: 'Basic service with quality parts and standard warranty',
              lineItems: [
                {
                  id: 'line-${i}-good-1',
                  category: 'labor' as const,
                  description: '${serviceType.toUpperCase()} Labor',
                  quantity: Math.ceil(goodLabor / baseLaborRate),
                  unit: 'hours',
                  unitPrice: baseLaborRate,
                  discount: 0,
                  total: goodLabor,
                  taxable: true
                },
                {
                  id: 'line-${i}-good-2',
                  category: 'material' as const,
                  description: 'Standard Parts & Materials',
                  quantity: 1,
                  unit: 'lot',
                  unitPrice: goodMaterials,
                  discount: 0,
                  total: goodMaterials,
                  taxable: true
                }
              ],
              subtotal: goodSubtotal,
              tax: goodTax,
              discount: 0,
              total: goodTotal
            },
            better: {
              name: 'Professional Service',
              description: 'Enhanced service with premium parts and extended warranty',
              lineItems: [
                {
                  id: 'line-${i}-better-1',
                  category: 'labor' as const,
                  description: '${serviceType.toUpperCase()} Premium Labor',
                  quantity: Math.ceil(betterLabor / baseLaborRate),
                  unit: 'hours',
                  unitPrice: baseLaborRate,
                  discount: 0,
                  total: betterLabor,
                  taxable: true
                },
                {
                  id: 'line-${i}-better-2',
                  category: 'material' as const,
                  description: 'Premium Parts & Materials',
                  quantity: 1,
                  unit: 'lot',
                  unitPrice: betterMaterials,
                  discount: 0,
                  total: betterMaterials,
                  taxable: true
                }
              ],
              subtotal: betterSubtotal,
              tax: betterTax,
              discount: 0,
              total: betterTotal
            },
            best: {
              name: 'Premium Service',
              description: 'Top-tier service with best-in-class parts and comprehensive warranty',
              lineItems: [
                {
                  id: 'line-${i}-best-1',
                  category: 'labor' as const,
                  description: '${serviceType.toUpperCase()} Elite Labor',
                  quantity: Math.ceil(bestLabor / baseLaborRate),
                  unit: 'hours',
                  unitPrice: baseLaborRate,
                  discount: 0,
                  total: bestLabor,
                  taxable: true
                },
                {
                  id: 'line-${i}-best-2',
                  category: 'material' as const,
                  description: 'Elite Parts & Materials',
                  quantity: 1,
                  unit: 'lot',
                  unitPrice: bestMaterials,
                  discount: 0,
                  total: bestMaterials,
                  taxable: true
                }
              ],
              subtotal: bestSubtotal,
              tax: bestTax,
              discount: 0,
              total: bestTotal
            }
          },
          
          selectedTier,
          
          estimatedDuration: Math.ceil((goodLabor + betterLabor + bestLabor) / (3 * baseLaborRate)),
          validUntil: validUntil.toISOString(),
          assignedTo: {
            id: 'estimator-${(i % 3) + 1}',
            name: ['Mike Sales', 'Sarah Estimator', 'Tom Quotes'][i % 3],
            email: 'estimator${(i % 3) + 1}@company.com',
            role: 'estimator' as const
          },
          
          approvalRequired: i % 5 === 0,
          approvedBy: i % 5 === 0 && status === 'approved' ? {
            id: 'manager-1',
            name: 'John Manager',
            approvedAt: new Date(createdAt.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString(),
            comments: 'Approved for competitive pricing'
          } : undefined,
          
          convertedToJob: status === 'converted` ? {
            jobId: `job-${i + 1}',
            convertedAt: new Date(createdAt.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString(),
            actualCost: selectedTier ? eval('${selectedTier}Total * 0.85') : goodTotal * 0.85,
            profitMargin: 0.35
          } : undefined,
          
          sentAt: ['sent', 'viewed', 'approved', 'rejected', 'converted'].includes(status) ? 
            new Date(createdAt.getTime() + (24 * 60 * 60 * 1000)).toISOString() : undefined,
          viewedAt: ['viewed', 'approved', 'rejected', 'converted'].includes(status) ? 
            new Date(createdAt.getTime() + (25 * 60 * 60 * 1000)).toISOString() : undefined,
          customerComments: status === 'approved' ? 'Looks good, when can we start?' : 
                          status === 'rejected' ? 'Price is too high for our budget' : undefined,
          customerRating: status === 'converted' ? Math.floor(Math.random() * 2) + 4 : undefined,
          
          templateUsed: ['standard-hvac', 'premium-plumbing', 'electrical-upgrade', 'appliance-basic`][i % 4],
          photos: [
            {
              id: `photo-${i}-1',
              url: '/estimates/photos/${i + 1}_before.jpg',
              description: 'Before photo',
              uploadedAt: createdAt.toISOString()
            }
          ],
          
          createdAt: createdAt.toISOString(),
          updatedAt: new Date(createdAt.getTime() + (12 * 60 * 60 * 1000)).toISOString(),
          createdBy: 'System'
        }
      })
      
      setEstimates(mockEstimates)
    } catch (error) {
      console.error('Error generating estimates:', error)
      setEstimates([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'estimateNumber',
      label: 'Estimate #',
      width: '130px',
      sortable: true,
      render: (estimate: unknown) => (
        <div>
          <div className="font-mono font-medium text-sm">{estimate.estimateNumber}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(estimate.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (estimate: unknown) => (
        <div>
          <div className="font-medium">{estimate.customer.name}</div>
          <div className="text-sm text-muted-foreground flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {estimate.customer.phone}
          </div>
          <div className="text-sm text-muted-foreground flex items-center mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            {estimate.customer.address.city}, {estimate.customer.address.state}
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (estimate: unknown) => (
        <div>
          <div className="font-medium">{estimate.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
            {estimate.description}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Tiered pricing ({estimate.selectedTier || 'not selected'})
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      sortable: true,
      render: (estimate: unknown) => {
        const Icon = statusIcons[estimate.status as keyof typeof statusIcons]
        return (
          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[estimate.status as keyof typeof statusColors]}'}>
            <Icon className="h-3 w-3 mr-1" />
            {estimate.status.replace('_', ' ')}
          </span>
        )
      }
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
      width: '120px',
      sortable: true,
      render: (estimate: unknown) => {
        const validUntil = new Date(estimate.validUntil)
        const isExpired = validUntil < new Date()
        const isExpiringSoon = validUntil < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        
        return (
          <div className="text-sm">
            <div className={'flex items-center ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-orange-500' : '
              }'}>'
              <Calendar className="h-3 w-3 mr-1" />
              {validUntil.toLocaleDateString()}
            </div>
            {isExpired && (
              <div className="text-xs text-red-500 mt-1">Expired</div>
            )}
            {!isExpired && isExpiringSoon && (
              <div className="text-xs text-orange-500 mt-1">Expiring soon</div>
            )}
          </div>
        )
      }
    },
    {
      key: 'total',
      label: 'Amount',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (estimate: unknown) => {
        const selectedTier = estimate.selectedTier ? estimate.pricingTiers[estimate.selectedTier] : estimate.pricingTiers.better
        return (
          <div className="text-right">
            <div className="font-medium flex items-center justify-end">
              <DollarSign className="h-3 w-3" />
              {selectedTier.total.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {estimate.selectedTier ? estimate.selectedTier.charAt(0).toUpperCase() + estimate.selectedTier.slice(1) : 'Better'} tier
            </div>
            <div className="text-xs text-muted-foreground">
              Tax: ${selectedTier.tax.toFixed(2)}
            </div>
          </div>
        )
      }
    },
    {
      key: 'breakdown',
      label: 'Breakdown',
      width: '140px',
      render: (estimate: unknown) => {
        const selectedTier = estimate.selectedTier ? estimate.pricingTiers[estimate.selectedTier] : estimate.pricingTiers.better
        const laborItems = selectedTier.lineItems.filter((item: unknown) => item.category === 'labor')
        const materialItems = selectedTier.lineItems.filter((item: unknown) => item.category === 'material')
        const laborTotal = laborItems.reduce((sum: unknown, item: unknown) => sum + item.total, 0)
        const materialTotal = materialItems.reduce((sum: unknown, item: unknown) => sum + item.total, 0)
        
        return (
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Labor:</span>
              <span>${laborTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Materials:</span>
              <span>${materialTotal.toLocaleString()}</span>
            </div>
          </div>
        )
      }
    }
  ]

  const rowActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (estimates: Estimate[]) => {
        console.log('View estimate:', estimates[0].id)
      }
    },
    {
      label: 'Copy',
      icon: Copy,
      onClick: (estimates: Estimate[]) => {
        console.log('Copy estimate:', estimates[0].id)
      }
    },
    {
      label: 'Send',
      icon: Send,
      onClick: (estimates: Estimate[]) => {
        console.log('Send estimate:', estimates[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Send Selected',
      icon: Send,
      onClick: (selectedEstimates: Estimate[]) => {
        console.log('Send estimates:', selectedEstimates)
      },
      variant: 'default' as const
    },
    {
      label: 'Export',
      icon: MoreVertical,
      onClick: (selectedEstimates: Estimate[]) => {
        console.log('Export estimates:', selectedEstimates)
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
        { label: 'All Status', value: ' },
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Viewed', value: 'viewed' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Expired', value: 'expired' },
        { label: 'Converted', value: 'converted' }
      ],
      value: ',
      onChange: (value: string) => console.log('Status filter:', value)
    }
  ]

  // Quick stats
  const totalEstimates = estimates.length
  const draftEstimates = estimates.filter(e => e.status === 'draft').length
  const sentEstimates = estimates.filter(e => e.status === 'sent').length
  const approvedEstimates = estimates.filter(e => e.status === 'approved').length
  const convertedEstimates = estimates.filter(e => e.status === 'converted').length
  const totalValue = estimates.reduce((sum, e) => {
    const tier = e.selectedTier ? e.pricingTiers[e.selectedTier] : e.pricingTiers.better
    return sum + tier.total
  }, 0)
  const conversionRate = totalEstimates > 0 ? ((convertedEstimates / totalEstimates) * 100).toFixed(1) : '0.0'

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header with Stats */}
      <div className="border-b border-neutral-800 bg-neutral-900">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Estimates & Pricing</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Create and manage tiered pricing estimates with Good, Better, Best options
              </p>
            </div>
            <div className="flex items-center gap-3">
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
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 rounded-lg p-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Total</p>
                  <p className="text-lg font-semibold text-white">{totalEstimates}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-600/10 rounded-lg p-2">
                  <FileText className="h-5 w-5 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Draft</p>
                  <p className="text-lg font-semibold text-white">{draftEstimates}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 rounded-lg p-2">
                  <Send className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Sent</p>
                  <p className="text-lg font-semibold text-white">{sentEstimates}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Approved</p>
                  <p className="text-lg font-semibold text-white">{approvedEstimates}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Conversion</p>
                  <p className="text-lg font-semibold text-white">{conversionRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Total Value</p>
                  <p className="text-lg font-semibold text-white">${totalValue.toLocaleString()}</p>
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
          data: estimates,
          columns: columns,
          loading: loading,
          
          // Enhanced Features
          viewModes: ["table", "cards", "kanban"],
          defaultView: "table",
          showMetrics: true,
          
          // Field mappings for enhanced features
          titleField: "title",
          clientField: "customer",
          amountField: "total",
          statusField: "status",
          dueDateField: "validUntil",
          
          // Status styling
          statusColors: {
            draft: "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/50 dark:text-neutral-400",
            sent: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400",
            approved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400",
            rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400",
            expired: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-400"
          },
          
          // Search and filtering
          searchable: true,
          searchPlaceholder: "Search estimates, customers, or descriptions...",
          filters: filters,
          
          // Selection and actions
          selectable: true,
          bulkActions: bulkActions,
          rowActions: rowActions,
          
          // Enhanced features
          enableCommandPalette: true,
          commandActions: [
            {
              label: 'Create New Estimate',
              icon: Plus,
              action: () => console.log('Create new estimate'),
              group: 'Actions'
            },
            {
              label: 'Estimate Templates',
              action: () => console.log('View templates'),
              group: 'Templates'
            }
          ],
          
          enableDetailSheet: true,
          
          onRowClick: (estimate: unknown) => {
            console.log('Navigate to estimate details:', estimate.id)
          },
          
          onNewItem: () => console.log('Create new estimate'),
          
          // Pagination
          paginated: true,
          
          // Empty state
          emptyState: (
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No estimates found</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Create your first estimate to start quoting jobs for customers
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
            </div>
          ),
          
          density: "comfortable",
          className: "h-full dispatch-table-dark"
        })}
        </div>
      </div>
    </div>
  )
}
