'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Eye,
  Send,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Phone,
  MapPin,
  MoreVertical,
  FileText,
  CreditCard,
  Download,
  Filter,
  Receipt,
  TrendingUp,
  Users,
  RefreshCw,
  Archive,
  Mail,
  Copy,
  Printer,
  Banknote,
  Building,
  User,
  Calculator,
  PieChart,
  BarChart3,
  Target,
  Activity,
  Zap,
  Shield,
  Bookmark,
  Settings,
  Search,
  Hash,
  Tag,
  Star,
  Award,
  Briefcase,
  CreditCard as CardIcon,
  Wallet,
  LineChart,
  AreaChart,
  Repeat,
  ChevronRight,
  ExternalLink,
  History,
  Bell,
  HelpCircle,
  Info,
  Layers,
  Package,
  Truck,
  Home,
  MapPin as LocationIcon,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Database,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Battery,
  Power,
  Plug,
  Link,
  Share,
  Upload,
  Import,
  FileCheck,
  FileX,
  FilePlus,
  FolderOpen,
  Save,
  Trash,
  RotateCcw,
  Undo,
  Redo,
  Maximize,
  Minimize,
  Move,
  Expand,
  LayoutGrid
} from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
// import { InlineConfirmBar } from '@thorbis/ui'


interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxable: boolean
}

interface InvoiceAnalytics {
  financial: {
    totalRevenue: number
    outstandingAmount: number
    averageInvoiceValue: number
    collectionRate: number
    daysToPayment: number
    profitMargin: number
  }
  performance: {
    invoicesGenerated: number
    paymentConversionRate: number
    overdueRate: number
    disputeRate: number
    reminderEffectiveness: number
    customerSatisfaction: number
  }
  trends: {
    revenueGrowth: number
    paymentVelocity: number
    seasonalPatterns: Array<{
      month: string
      revenue: number
      invoiceCount: number
    }>
    customerSegmentation: {
      residential: { count: number; revenue: number }
      commercial: { count: number; revenue: number }
    }
  }
  predictions: {
    expectedRevenue: number
    cashFlowForecast: Array<{
      date: string
      expectedInflow: number
      outstandingRisk: number
    }>
    collectionProbability: {
      high: number
      medium: number
      low: number
    }
  }
}

interface Invoice {
  id: string
  invoiceNumber: string
  
  // Enhanced customer information
  customer: {
    id: string
    name: string
    type: 'residential' | 'commercial'
    email: string
    phone: string
    secondaryPhone?: string
    website?: string
    taxId?: string
    
    // Address information
    address: {
      street: string
      street2?: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    billingAddress?: {
      street: string
      street2?: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    
    // Customer financial profile
    creditProfile: {
      creditLimit: number
      currentBalance: number
      paymentHistory: {
        averageDaysToPayment: number
        onTimePaymentRate: number
        totalInvoices: number
        totalPaid: number
      }
      riskScore: 'low' | 'medium' | 'high'
      preferredPaymentMethod: string
    }
    
    // Relationship data
    customerSince: string
    lastContactDate?: string
    accountManager?: {
      id: string
      name: string
      email: string
      phone: string
    }
    tags: string[]
    segment: 'vip' | 'regular' | 'new' | 'at_risk'
    communicationPreferences: {
      email: boolean
      sms: boolean
      phone: boolean
      postalMail: boolean
    }
  }
  
  // Related records and project tracking
  workOrderId?: string
  estimateId?: string
  projectId?: string
  contractId?: string
  recurringBillingId?: string
  parentInvoiceId?: string
  childInvoiceIds?: string[]
  
  // Enhanced invoice details
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'disputed' | 'refunded' | 'written_off'
  priority: 'standard' | 'urgent' | 'high_value' | 'vip_customer'
  category: 'service' | 'product' | 'recurring' | 'deposit' | 'final' | 'progress' | 'milestone' | 'warranty' | 'emergency'
  billingType: 'one_time' | 'recurring' | 'milestone' | 'time_and_materials' | 'fixed_price'
  
  // Enhanced date tracking
  issuedAt: string
  dueAt: string
  paidAt?: string
  sentAt?: string
  viewedAt?: string
  acknowledgedAt?: string
  approvedAt?: string
  disputedAt?: string
  resolvedAt?: string
  voidedAt?: string
  
  // Line items with enhanced tracking
  lineItems: InvoiceLineItem[]
  
  // Comprehensive financial details
  subtotal: number
  taxRate: number
  tax: number
  discountAmount: number
  discountPercentage: number
  shippingCost: number
  handlingFee: number
  total: number
  amountPaid: number
  amountDue: number
  amountRefunded: number
  
  // Currency and international
  currency: string
  exchangeRate?: number
  originalCurrency?: string
  originalAmount?: number
  
  // Payment terms and conditions
  paymentTerms: string
  earlyPaymentDiscount?: {
    percentage: number
    daysFromIssue: number
    description: string
  }
  latePaymentFee: {
    type: 'percentage' | 'flat_fee'
    amount: number
    gracePeriodDays: number
  }
  
  // Enhanced payment tracking
  paymentMethods: Array<{
    method: 'cash' | 'check' | 'credit_card' | 'ach' | 'wire' | 'paypal' | 'crypto' | 'financing'
    isPreferred: boolean
    fees?: number
    processingTime?: string
  }>
  
  // Comprehensive payment history
  payments: Array<{
    id: string
    amount: number
    method: 'cash' | 'check' | 'credit_card' | 'ach' | 'wire' | 'paypal' | 'crypto' | 'financing'
    reference?: string
    confirmationNumber?: string
    bankReference?: string
    paidAt: string
    processedAt?: string
    clearedAt?: string
    fees: number
    notes?: string
    processor?: string
    gateway?: string
    status: 'pending' | 'processing' | 'cleared' | 'failed' | 'refunded'
  }>
  
  // Collections and late fees
  lateFees: number
  collectionNotes?: string
  collectionStatus?: 'none' | 'notice_sent' | 'final_notice' | 'collections' | 'legal'
  collectionAgency?: {
    name: string
    contactInfo: string
    assignedDate: string
  }
  
  // Detailed service information
  serviceType?: 'hvac' | 'plumbing' | 'electrical' | 'appliance' | 'general' | 'maintenance' | 'emergency' | 'installation'
  serviceDate?: string
  serviceCompletedDate?: string
  serviceLocation?: {
    address: string
    coordinates?: { lat: number; lng: number }
    accessNotes?: string
  }
  
  // Team and resource allocation
  team: {
    primary: {
      id: string
      name: string
      email: string
      role: 'technician' | 'supervisor' | 'specialist'
      hourlyRate?: number
      hoursWorked?: number
    }
    secondary?: Array<{
      id: string
      name: string
      email: string
      role: string
      hourlyRate?: number
      hoursWorked?: number
    }>
  }
  
  // Project and job tracking
  projectDetails?: {
    phase: string
    milestone: string
    percentComplete: number
    estimatedCompletion: string
    actualCompletion?: string
    changeOrders?: Array<{
      id: string
      description: string
      amount: number
      approvedAt: string
    }>
  }
  
  // Enhanced automation and communication
  automation: {
    autoSendReminders: boolean
    reminderSchedule: Array<{
      daysBefore: number
      type: 'email' | 'sms' | 'phone'
      template: string
    }>
    remindersSent: number
    lastReminderSent?: string
    followUpSchedule?: Array<{
      date: string
      type: 'call' | 'email' | 'visit'
      notes?: string
    }>
  }
  
  // Communication history
  communications: Array<{
    id: string
    type: 'email' | 'phone' | 'sms' | 'in_person' | 'portal_message'
    direction: 'inbound' | 'outbound'
    subject?: string
    summary: string
    timestamp: string
    staff: string
    response?: string
  }>
  
  // Quality and satisfaction tracking
  qualityMetrics: {
    customerSatisfactionScore?: number
    npsScore?: number
    serviceRating?: number
    timelinessRating?: number
    communicationRating?: number
    followUpRequired: boolean
    warrantyProvided: boolean
    warrantyPeriod?: string
  }
  
  // Documentation and attachments
  notes: string
  internalNotes: string
  attachments: Array<{
    id: string
    name: string
    type: string
    category: 'invoice' | 'receipt' | 'contract' | 'photo' | 'document' | 'signature'
    url: string
    size: number
    uploadedAt: string
    uploadedBy: string
    isPublic: boolean
  }>
  
  // Legal and compliance
  taxDetails: {
    taxExempt: boolean
    taxExemptionNumber?: string
    taxJurisdiction: string
    applicableTaxes: Array<{
      type: string
      rate: number
      amount: number
      jurisdiction: string
    }>
  }
  
  // Enhanced financial tracking
  costBreakdown: {
    laborCost: number
    materialCost: number
    equipmentCost: number
    subcontractorCost: number
    overheadCost: number
    profitMargin: number
    actualCost: number
    estimatedCost: number
    variance: number
  }
  
  // Reporting and analytics tags
  reportingTags: {
    department: string
    salesRep: string
    source: 'website' | 'referral' | 'repeat_customer' | 'marketing' | 'cold_call'
    campaign?: string
    businessUnit: string
  }
  
  // Approval workflow
  approvalWorkflow: {
    requiresApproval: boolean
    approvalThreshold: number
    approvers: Array<{
      id: string
      name: string
      role: string
      approvedAt?: string
      comments?: string
    }>
    currentApprover?: string
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'not_required'
  }
  
  // Integration and sync
  integrations: {
    quickbooksId?: string
    xeroId?: string
    salesforceId?: string
    stripeId?: string
    lastSyncedAt?: string
    syncStatus: 'synced' | 'pending' | 'failed' | 'not_applicable'
    syncErrors?: string[]
  }
  
  // Audit and version control
  auditTrail: Array<{
    id: string
    action: 'created' | 'updated' | 'sent' | 'paid' | 'voided' | 'refunded'
    changes: Record<string, { old: any; new: any }>
    timestamp: string
    user: string
    ipAddress?: string
    reason?: string
  }>
  version: number
  
  // Enhanced timestamps
  createdAt: string
  updatedAt: string
  createdBy: string
  lastModifiedBy: string
  archivedAt?: string
  archivedBy?: string
  deletedAt?: string
  deletedBy?: string
  restoredAt?: string
  restoredBy?: string
}

const statusColors = {
  draft: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  cancelled: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  disputed: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

const statusIcons = {
  draft: FileText,
  sent: Send,
  viewed: Eye,
  paid: CheckCircle,
  partial: AlertTriangle,
  overdue: Clock,
  cancelled: MoreVertical,
  disputed: AlertTriangle
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>(')
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'analytics' | 'collections' | 'reports'>('table')
  const [analytics, setAnalytics] = useState<InvoiceAnalytics | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [filterCategory, setFilterCategory] = useState<string>(')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  useEffect(() => {
    fetchInvoices()
    generateAnalytics()
  }, [])
  
  useEffect(() => {
    if (invoices.length > 0) {
      generateAnalytics()
    }
  }, [invoices, dateRange])

  const generateAnalytics = async () => {
    try {
      const mockAnalytics: InvoiceAnalytics = {
        financial: {
          totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
          outstandingAmount: invoices.filter(i => ['sent', 'viewed', 'partial', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.amountDue, 0),
          averageInvoiceValue: invoices.length > 0 ? invoices.reduce((sum, i) => sum + i.total, 0) / invoices.length : 0,
          collectionRate: invoices.length > 0 ? (invoices.filter(i => i.status === 'paid').length / invoices.length * 100) : 0,
          daysToPayment: 18.5,
          profitMargin: 32.4
        },
        performance: {
          invoicesGenerated: invoices.length,
          paymentConversionRate: 87.3,
          overdueRate: 8.2,
          disputeRate: 1.1,
          reminderEffectiveness: 73.5,
          customerSatisfaction: 4.6
        },
        trends: {
          revenueGrowth: 12.8,
          paymentVelocity: 92.4,
          seasonalPatterns: [
            { month: 'Jan', revenue: 125000, invoiceCount: 45 },
            { month: 'Feb', revenue: 138000, invoiceCount: 52 },
            { month: 'Mar', revenue: 142000, invoiceCount: 48 },
            { month: 'Apr', revenue: 156000, invoiceCount: 58 },
            { month: 'May', revenue: 163000, invoiceCount: 61 },
            { month: 'Jun', revenue: 178000, invoiceCount: 67 }
          ],
          customerSegmentation: {
            residential: { count: invoices.filter(i => i.customer.type === 'residential').length, revenue: 89000 },
            commercial: { count: invoices.filter(i => i.customer.type === 'commercial').length, revenue: 234000 }
          }
        },
        predictions: {
          expectedRevenue: 890000,
          cashFlowForecast: [
            { date: '2024-12-01', expectedInflow: 45000, outstandingRisk: 12 },
            { date: '2024-12-15', expectedInflow: 67000, outstandingRisk: 8 },
            { date: '2025-01-01', expectedInflow: 78000, outstandingRisk: 15 }
          ],
          collectionProbability: {
            high: 78.5,
            medium: 16.2,
            low: 5.3
          }
        }
      }
      
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error generating analytics:', error)
    }
  }

  const fetchInvoices = async () => {
    try {
      // Generate comprehensive mock invoice data
      const mockInvoices: Invoice[] = Array.from({ length: 125 }, (_, i) => {
        const statuses: Invoice['status'][] = ['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled', 'disputed']
        const priorities: Invoice['priority'][] = ['standard', 'urgent', 'high_value']
        const categories: Invoice['category'][] = ['service', 'product', 'recurring', 'deposit', 'final']
        const paymentMethods = ['cash', 'check', 'credit_card', 'ach', 'wire'] as const
        
        const customerNames = [
          'John Smith', 'Jane Doe', 'Robert Johnson', 'Sarah Wilson', 'Michael Brown',
          'Emily Davis', 'David Miller', 'Lisa Garcia', 'Christopher Martinez', 'Amanda Anderson',
          'Tech Solutions LLC', 'Green Valley Restaurant', 'Metro Office Complex', 'City Medical Center'
        ]
        
        const serviceTypes = ['hvac', 'plumbing', 'electrical', 'appliance', 'general', 'maintenance'] as const
        
        const status = statuses[i % statuses.length]
        const priority = priorities[i % priorities.length]
        const category = categories[i % categories.length]
        const customerName = customerNames[i % customerNames.length]
        const isCommercial = customerName.includes('LLC') || customerName.includes('Restaurant') || customerName.includes('Complex') || customerName.includes('Center')
        const serviceType = serviceTypes[i % serviceTypes.length]
        
        // Generate realistic pricing
        const baseAmount = isCommercial ? Math.floor(Math.random() * 5000) + 1000 : Math.floor(Math.random() * 2000) + 300
        const discountPercentage = i % 7 === 0 ? Math.floor(Math.random() * 20) + 5 : 0
        const subtotal = baseAmount
        const discountAmount = Math.floor(subtotal * (discountPercentage / 100))
        const afterDiscount = subtotal - discountAmount
        const taxRate = 0.08
        const tax = Math.floor(afterDiscount * taxRate)
        const total = afterDiscount + tax
        
        // Payment logic based on status
        let amountPaid = 0
        let payments: Invoice['payments'] = []
        
        if (status === 'paid') {
          amountPaid = total
          payments = [{
            id: `payment-${i}-1',
            amount: total,
            method: paymentMethods[i % paymentMethods.length],
            reference: 'REF-${i + 1}-${Math.floor(Math.random() * 1000)}',
            paidAt: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            notes: 'Full payment received',
            fees: 0,
            status: 'cleared' as const
          }]
        } else if (status === 'partial`) {
          amountPaid = Math.floor(total * (0.3 + Math.random() * 0.4)) // 30-70% paid
          payments = [{
            id: `payment-${i}-1',
            amount: amountPaid,
            method: paymentMethods[i % paymentMethods.length],
            reference: 'REF-${i + 1}-${Math.floor(Math.random() * 1000)}',
            paidAt: new Date(Date.now() - (Math.random() * 15 * 24 * 60 * 60 * 1000)).toISOString(),
            notes: 'Partial payment',
            fees: 0,
            status: 'cleared` as const
          }]
        }
        
        const amountDue = total - amountPaid
        
        // Generate line items
        const lineItems: InvoiceLineItem[] = [
          {
            id: `line-${i}-1`,
            description: `${serviceType.toUpperCase()} Labor - ${category} service',
            quantity: Math.ceil(Math.random() * 8) + 1,
            unitPrice: isCommercial ? 95 : 75,
            amount: Math.floor(baseAmount * 0.6),
            taxable: true
          },
          {
            id: 'line-${i}-2',
            description: 'Parts and Materials',
            quantity: 1,
            unitPrice: Math.floor(baseAmount * 0.4),
            amount: Math.floor(baseAmount * 0.4),
            taxable: true
          }
        ]
        
        const createdDate = new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
        const dueDate = new Date(createdDate.getTime() + (30 * 24 * 60 * 60 * 1000))
        const isOverdue = status === 'overdue`
        
        return {
          id: 'inv-${i + 1}',
          invoiceNumber: 'INV-2024-${String(i + 1).padStart(4, '0')}',
          
          // Enhanced customer information
          customer: {
            id: 'cust-${(i % 25) + 1}',
            name: customerName,
            type: isCommercial ? 'commercial' : 'residential',
            email: '${customerName.toLowerCase().replace(/\s+/g, '.')}@${isCommercial ? 'company' : 'email'}.com`,
            phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            secondaryPhone: i % 3 === 0 ? '(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}' : undefined,
            website: isCommercial ? 'www.${customerName.toLowerCase().replace(/[^\w\s-]/g, '')}.com` : undefined,
            taxId: isCommercial ? '${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000000) + 1000000}' : undefined,
            
            address: {
              street: '${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Business', 'Industrial', 'Corporate'][i % 5]} ${isCommercial ? 'Dr' : 'St'}',
              street2: i % 7 === 0 ? 'Suite ${Math.floor(Math.random() * 500) + 100}' : undefined,
              city: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth'][i % 5],
              state: 'TX',
              zipCode: String(78700 + Math.floor(Math.random() * 100)),
              country: 'USA'
            },
            billingAddress: i % 8 === 0 ? {
              street: 'PO Box ${Math.floor(Math.random() * 9999) + 1}',
              city: ['Austin', 'Dallas', 'Houston'][i % 3],
              state: 'TX',
              zipCode: String(78700 + Math.floor(Math.random() * 100)),
              country: 'USA'
            } : undefined,
            
            // Customer financial profile
            creditProfile: {
              creditLimit: isCommercial ? Math.floor(Math.random() * 50000) + 10000 : Math.floor(Math.random() * 10000) + 2000,
              currentBalance: Math.floor(Math.random() * 5000),
              paymentHistory: {
                averageDaysToPayment: Math.floor(Math.random() * 30) + 15,
                onTimePaymentRate: 0.7 + Math.random() * 0.3,
                totalInvoices: Math.floor(Math.random() * 50) + 10,
                totalPaid: Math.floor(Math.random() * 100000) + 25000
              },
              riskScore: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
              preferredPaymentMethod: ['credit_card', 'ach', 'check'][Math.floor(Math.random() * 3)]
            },
            
            // Relationship data
            customerSince: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            lastContactDate: i % 5 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            accountManager: isCommercial ? {
              id: 'manager-${(i % 3) + 1}',
              name: ['Sarah Johnson', 'Mike Roberts', 'Lisa Chen`][i % 3],
              email: `manager${(i % 3) + 1}@company.com',
              phone: '(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}'
            } : undefined,
            tags: ['reliable', 'repeat_customer', 'priority', 'payment_issues', 'vip', 'new_customer'].slice(0, Math.floor(Math.random() * 3) + 1),
            segment: ['vip', 'regular', 'new', 'at_risk'][Math.floor(Math.random() * 4)] as 'vip' | 'regular' | 'new' | 'at_risk`,
            communicationPreferences: {
              email: true,
              sms: Math.random() > 0.5,
              phone: Math.random() > 0.7,
              postalMail: Math.random() > 0.8
            }
          },
          
          // Related records and project tracking
          workOrderId: i % 3 === 0 ? `wo-${i + 1}` : undefined,
          estimateId: i % 4 === 0 ? `est-${i + 1}` : undefined,
          projectId: isCommercial && i % 5 === 0 ? `proj-${i + 1}' : undefined,
          contractId: isCommercial && i % 6 === 0 ? 'contract-${i + 1}' : undefined,
          recurringBillingId: category === 'recurring` ? `recurring-${i + 1}` : undefined,
          parentInvoiceId: i % 10 === 0 ? `inv-${i}` : undefined,
          childInvoiceIds: i % 8 === 0 ? [`inv-${i + 101}', 'inv-${i + 102}'] : undefined,
          
          // Enhanced invoice details
          status,
          priority: priority === 'standard' && isCommercial && total > 10000 ? 'high_value' : 
                   customerName.includes('VIP') ? 'vip_customer' : priority,
          category,
          billingType: ['one_time', 'recurring', 'milestone', 'time_and_materials', 'fixed_price'][i % 5] as any,
          
          issuedAt: createdDate.toISOString(),
          dueAt: dueDate.toISOString(),
          paidAt: status === 'paid' ? payments[0]?.paidAt : undefined,
          sentAt: ['sent', 'viewed', 'paid', 'partial', 'overdue'].includes(status) ? 
            new Date(createdDate.getTime() + (24 * 60 * 60 * 1000)).toISOString() : undefined,
          viewedAt: ['viewed', 'paid', 'partial'].includes(status) ? 
            new Date(createdDate.getTime() + (36 * 60 * 60 * 1000)).toISOString() : undefined,
          
          lineItems,
          
          // Comprehensive financial details
          subtotal,
          taxRate,
          tax,
          discountAmount,
          discountPercentage,
          shippingCost: isCommercial ? Math.floor(Math.random() * 200) + 50 : 0,
          handlingFee: Math.floor(Math.random() * 50) + 10,
          total,
          amountPaid,
          amountDue,
          amountRefunded: status === 'refunded' ? Math.floor(total * 0.3) : 0,
          
          // Currency and international
          currency: 'USD',
          exchangeRate: i % 15 === 0 ? 1.08 : undefined,
          originalCurrency: i % 15 === 0 ? 'EUR' : undefined,
          originalAmount: i % 15 === 0 ? Math.floor(total / 1.08) : undefined,
          
          // Payment terms and conditions
          paymentTerms: isCommercial ? 'Net 30' : 'Due on completion',
          earlyPaymentDiscount: isCommercial && i % 7 === 0 ? {
            percentage: 2,
            daysFromIssue: 10,
            description: '2% discount if paid within 10 days'
          } : undefined,
          latePaymentFee: {
            type: 'percentage',
            amount: 1.5,
            gracePeriodDays: 5
          },
          
          // Enhanced payment tracking
          paymentMethods: [
            { method: 'credit_card', isPreferred: true, fees: Math.floor(total * 0.029), processingTime: '1-2 business days' },
            { method: 'ach', isPreferred: false, fees: 5, processingTime: '3-5 business days' },
            { method: 'check', isPreferred: false, fees: 0, processingTime: '5-7 business days' }
          ],
          
          // Enhanced payment history
          payments: payments.map(payment => ({
            ...payment,
            confirmationNumber: 'CONF-${Math.floor(Math.random() * 1000000)}',
            bankReference: payment.method === 'ach' ? 'ACH-${Math.floor(Math.random() * 100000)}' : undefined,
            processedAt: payment.paidAt,
            clearedAt: new Date(new Date(payment.paidAt).getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString(),
            fees: payment.method === 'credit_card' ? Math.floor(payment.amount * 0.029) : payment.method === 'ach' ? 5 : 0,
            processor: payment.method === 'credit_card' ? 'Stripe' : payment.method === 'ach' ? 'Plaid' : 'Internal',
            gateway: payment.method === 'credit_card' ? 'Stripe Connect' : undefined,
            status: 'cleared' as const
          })),
          
          // Collections and late fees
          lateFees: isOverdue ? Math.floor(total * 0.05) : 0,
          collectionNotes: isOverdue ? 'Payment overdue - follow up required' : undefined,
          collectionStatus: status === 'overdue' ? 
            ['none', 'notice_sent', 'final_notice', 'collections'][Math.floor(Math.random() * 4)] as any : 'none',
          collectionAgency: status === 'overdue' && i % 20 === 0 ? {
            name: 'Professional Collections Inc',
            contactInfo: 'collections@pci.com',
            assignedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          } : undefined,
          
          // Detailed service information
          serviceType: serviceType,
          serviceDate: new Date(createdDate.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
          serviceCompletedDate: new Date(createdDate.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
          serviceLocation: {
            address: '${Math.floor(Math.random() * 9999) + 1} Service Location St, Austin, TX',
            coordinates: { lat: 30.2672 + (Math.random() - 0.5) * 0.1, lng: -97.7431 + (Math.random() - 0.5) * 0.1 },
            accessNotes: i % 5 === 0 ? 'Gate code: 1234, Dog on property' : undefined
          },
          
          // Team and resource allocation
          team: {
            primary: {
              id: 'tech-${(i % 5) + 1}',
              name: ['Mike Tech', 'Sarah Service', 'Tom Repair', 'Amy Fix', 'David Tools'][i % 5],
              email: 'tech${(i % 5) + 1}@company.com',
              role: ['technician', 'supervisor', 'specialist'][Math.floor(Math.random() * 3)] as any,
              hourlyRate: 75 + Math.floor(Math.random() * 50),
              hoursWorked: Math.floor(Math.random() * 8) + 2
            },
            secondary: i % 4 === 0 ? [{
              id: 'helper-${i % 3 + 1}',
              name: ['John Helper', 'Mary Assistant', 'Bob Support'][i % 3],
              email: 'helper${i % 3 + 1}@company.com',
              role: 'assistant',
              hourlyRate: 45,
              hoursWorked: Math.floor(Math.random() * 6) + 1
            }] : undefined
          },
          
          // Enhanced automation and communication
          automation: {
            autoSendReminders: i % 3 === 0,
            reminderSchedule: [
              { daysBefore: 7, type: 'email', template: 'upcoming_payment' },
              { daysBefore: 1, type: 'email', template: 'payment_due_tomorrow' },
              { daysBefore: -3, type: 'sms', template: 'payment_overdue' },
              { daysBefore: -7, type: 'phone', template: 'collection_call' }
            ],
            remindersSent: isOverdue ? Math.floor(Math.random() * 3) + 1 : 0,
            lastReminderSent: isOverdue ? new Date(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() : undefined,
            followUpSchedule: status === 'overdue' ? [{
              date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'call',
              notes: 'Follow up on overdue payment'
            }] : undefined
          },
          
          // Communication history
          communications: [
            {
              id: 'comm-${i}-1',
              type: 'email',
              direction: 'outbound',
              subject: 'Invoice Sent',
              summary: 'Invoice sent to customer via email',
              timestamp: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
              staff: 'System',
              response: status === 'paid' ? 'Customer confirmed receipt and payment processed' : undefined
            }
          ],
          
          // Quality and satisfaction tracking
          qualityMetrics: {
            customerSatisfactionScore: status === 'paid' ? Math.floor(Math.random() * 2) + 4 : undefined,
            npsScore: status === 'paid' ? Math.floor(Math.random() * 4) + 7 : undefined,
            serviceRating: Math.floor(Math.random() * 2) + 4,
            timelinessRating: Math.floor(Math.random() * 2) + 4,
            communicationRating: Math.floor(Math.random() * 2) + 4,
            followUpRequired: Math.random() > 0.8,
            warrantyProvided: serviceType !== 'maintenance',
            warrantyPeriod: serviceType !== 'maintenance' ? '1 year' : undefined
          },
          
          // Documentation and notes
          notes: category === 'recurring' ? 'Monthly recurring service contract' :
                 status === 'disputed' ? 'Customer disputes service quality' :
                 priority === 'urgent' ? 'Urgent payment required for emergency service' : ',
          internalNotes: i % 5 === 0 ? 'Customer prefers morning appointments' : ',
          attachments: [{
            id: 'attach-${i}-1',
            name: 'service_receipt.pdf',
            type: 'application/pdf',
            category: 'receipt',
            url: '/invoices/attachments/${i + 1}_receipt.pdf',
            size: Math.floor(Math.random() * 1000000) + 100000,
            uploadedAt: createdDate.toISOString(),
            uploadedBy: 'System',
            isPublic: true
          }],
          
          
          // Legal and compliance
          taxDetails: {
            taxExempt: isCommercial && i % 12 === 0,
            taxExemptionNumber: isCommercial && i % 12 === 0 ? 'EXEMPT-${Math.floor(Math.random() * 100000)}' : undefined,
            taxJurisdiction: 'Texas',
            applicableTaxes: [{
              type: 'Sales Tax',
              rate: 0.08,
              amount: tax,
              jurisdiction: 'Travis County, TX'
            }]
          },
          
          // Enhanced financial tracking
          costBreakdown: {
            laborCost: Math.floor(subtotal * 0.4),
            materialCost: Math.floor(subtotal * 0.3),
            equipmentCost: Math.floor(subtotal * 0.1),
            subcontractorCost: Math.floor(subtotal * 0.1),
            overheadCost: Math.floor(subtotal * 0.1),
            profitMargin: 0.35,
            actualCost: Math.floor(subtotal * 0.65),
            estimatedCost: Math.floor(subtotal * 0.68),
            variance: Math.floor(subtotal * 0.03)
          },
          
          // Reporting and analytics tags
          reportingTags: {
            department: serviceType === 'hvac' ? 'HVAC' : serviceType === 'plumbing' ? 'Plumbing' : 'General',
            salesRep: ['Mike Sales', 'Sarah Rep', 'Tom Closer'][i % 3],
            source: ['website', 'referral', 'repeat_customer', 'marketing', 'cold_call'][i % 5] as any,
            campaign: i % 6 === 0 ? 'Spring Maintenance Special' : undefined,
            businessUnit: isCommercial ? 'Commercial' : 'Residential'
          },
          
          // Approval workflow
          approvalWorkflow: {
            requiresApproval: total > 5000,
            approvalThreshold: 5000,
            approvers: total > 5000 ? [{
              id: 'manager-1',
              name: 'John Manager',
              role: 'Operations Manager',
              approvedAt: total > 5000 && status !== 'draft' ? createdDate.toISOString() : undefined,
              comments: 'Approved for standard processing'
            }] : [],
            currentApprover: total > 5000 && status === 'draft' ? 'manager-1' : undefined,
            approvalStatus: total > 5000 ? (status === 'draft' ? 'pending' : 'approved') : 'not_required`
          },
          
          // Integration and sync
          integrations: {
            quickbooksId: i % 8 === 0 ? `QB-${i + 1000}' : undefined,
            xeroId: undefined,
            salesforceId: isCommercial && i % 6 === 0 ? 'SF-${i + 2000}' : undefined,
            stripeId: payments.length > 0 && payments[0].method === 'credit_card' ? 'pi_${Math.random().toString(36).substr(2, 24)}' : undefined,
            lastSyncedAt: i % 4 === 0 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
            syncStatus: 'synced',
            syncErrors: undefined
          },
          
          // Audit and version control
          auditTrail: [
            {
              id: 'audit-${i}-1',
              action: 'created',
              changes: Record<string, unknown>,
              timestamp: createdDate.toISOString(),
              user: 'System',
              ipAddress: '192.168.1.100',
              reason: 'Invoice generation from work order'
            }
          ],
          version: 1,
          
          // Enhanced timestamps
          createdAt: createdDate.toISOString(),
          updatedAt: new Date(createdDate.getTime() + (12 * 60 * 60 * 1000)).toISOString(),
          createdBy: 'System',
          lastModifiedBy: 'System',
          archivedAt: undefined,
          archivedBy: undefined,
          deletedAt: undefined,
          deletedBy: undefined,
          restoredAt: undefined,
          restoredBy: undefined
        }
      })
      
      setInvoices(mockInvoices)
    } catch (error) {
      console.error('Error generating invoices:', error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = (action: string) => {
    setBulkAction(action)
    setShowBulkActions(true)
  }

  const confirmBulkAction = () => {
    console.log('Performing ${bulkAction} on invoices:', selectedRows)
    setShowBulkActions(false)
    setSelectedRows([])
    setBulkAction(')
  }

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      width: '140px',
      sortable: true,
      render: (invoice: unknown) => (
        <div>
          <div className="font-mono font-medium text-sm text-blue-400">{invoice.invoiceNumber}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(invoice.issuedAt).toLocaleDateString()}
          </div>
          {invoice.workOrderId && (
            <div className="text-xs text-muted-foreground">
              WO: {invoice.workOrderId}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (invoice: unknown) => (
        <div className="flex items-center gap-3">
          <div className={'h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
            invoice.customer.type === 'commercial' ? 'bg-blue-500' : 'bg-green-500'
              }'}>'
            {invoice.customer.type === 'commercial' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-medium text-white">{invoice.customer.name}</div>
            <div className="text-sm text-neutral-400 flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {invoice.customer.phone}
            </div>
            <div className="text-sm text-neutral-400 flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {invoice.customer.address.city}, {invoice.customer.address.state}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'service',
      label: 'Service',
      render: (invoice: unknown) => (
        <div>
          <div className="font-medium capitalize">{invoice.serviceType || 'General'}</div>
          <div className="text-sm text-neutral-400 capitalize">{invoice.category}</div>
          {invoice.technician && (
            <div className="text-xs text-neutral-500 mt-1">
              Tech: {invoice.technician.name}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      sortable: true,
      render: (invoice: unknown) => {
        const Icon = statusIcons[invoice.status as keyof typeof statusIcons]
        return (
          <div>
            <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors]}'}>
              <Icon className="h-3 w-3 mr-1" />
              {invoice.status.replace('_', ' ')}
            </span>
            {invoice.priority !== 'standard' && (
              <div className={'text-xs mt-1 ${
                invoice.priority === 'urgent' ? 'text-red-400' : 'text-orange-400'
              }'}>'
                {invoice.priority.replace('_', ' ')}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      width: '120px',
      sortable: true,
      render: (invoice: unknown) => {
        const dueDate = new Date(invoice.dueAt)
        const isOverdue = dueDate < new Date() && invoice.status !== 'paid'
        const isDueSoon = dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && invoice.status !== 'paid'
        
        return (
          <div className="text-sm">
            <div className={'flex items-center ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-orange-500' : '
              }'}>'
              <Calendar className="h-3 w-3 mr-1" />
              {dueDate.toLocaleDateString()}
            </div>
            {isOverdue && (
              <div className="text-xs text-red-500 mt-1">Overdue</div>
            )}
            {!isOverdue && isDueSoon && (
              <div className="text-xs text-orange-500 mt-1">Due soon</div>
            )}
          </div>
        )
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      width: '140px',
      align: 'right',
      sortable: true,
      render: (invoice: unknown) => (
        <div className="text-right">
          <div className="font-medium flex items-center justify-end">
            <DollarSign className="h-3 w-3" />
            {invoice.total.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Paid: ${invoice.amountPaid.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Due: ${invoice.amountDue.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      width: '100px',
      render: (invoice: unknown) => {
        const paymentPercentage = invoice.total > 0 ? (invoice.amountPaid / invoice.total) * 100 : 0
        
        return (
          <div className="text-sm">
            <div className="text-xs text-muted-foreground mb-1">
              {Math.round(paymentPercentage)}% paid
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all" 
                style={{ width: '${paymentPercentage}%' }}
              />
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
      onClick: (invoices: Invoice[]) => {
        console.log('View invoice:', invoices[0].id)
      }
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (invoices: Invoice[]) => {
        console.log('Edit invoice:', invoices[0].id)
      }
    },
    {
      label: 'Send',
      icon: Send,
      onClick: (invoices: Invoice[]) => {
        console.log('Send invoice:', invoices[0].id)
      }
    }
  ]

  const bulkActions = [
    {
      label: 'Send Invoices',
      icon: Send,
      onClick: () => handleBulkAction('send'),
      variant: 'default' as const
    },
    {
      label: 'Mark as Paid',
      icon: CheckCircle,
      onClick: () => handleBulkAction('mark_paid'),
      variant: 'outline' as const
    },
    {
      label: 'Send Reminders',
      icon: Mail,
      onClick: () => handleBulkAction('send_reminders'),
      variant: 'outline' as const
    },
    {
      label: 'Export PDF',
      icon: Download,
      onClick: () => handleBulkAction('export_pdf'),
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
        { label: 'All Status', value: ' },
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Viewed', value: 'viewed' },
        { label: 'Paid', value: 'paid' },
        { label: 'Partial', value: 'partial' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Disputed', value: 'disputed' }
      ],
      value: ',
      onChange: (value: string) => console.log('Status filter:', value)
    }
  ]

  // Financial Statistics
  const totalInvoices = invoices.length
  const draftInvoices = invoices.filter(i => i.status === 'draft').length
  const sentInvoices = invoices.filter(i => i.status === 'sent').length
  const paidInvoices = invoices.filter(i => i.status === 'paid').length
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)
  const outstandingAmount = invoices.filter(i => ['sent', 'viewed', 'partial', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.amountDue, 0)
  const averageInvoiceValue = totalInvoices > 0 ? invoices.reduce((sum, i) => sum + i.total, 0) / totalInvoices : 0
  const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices * 100).toFixed(1) : '0.0`

  return (
    <div className="min-h-screen bg-neutral-950">
      {showBulkActions && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 flex items-center justify-between">
          <div>
            <h3 className="font-medium">{'${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} Invoices'}</h3>
            <p className="text-sm">{'${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} ${selectedRows.length} selected invoice${selectedRows.length > 1 ? 's' : '}?'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBulkActions(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkAction} className="bg-white text-blue-600 hover:bg-neutral-100">
              Confirm
            </Button>
          </div>
        </div>
      )}
      
      {/* Header with Financial Stats */}
      <div className="border-b border-neutral-800 bg-neutral-900">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Financial Management & Analytics</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Comprehensive invoicing system with advanced payment tracking, collections, and financial analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-neutral-900 border border-neutral-700 rounded-lg p-1">
                {[
                  { mode: 'table' as const, icon: FileText, label: 'Table' },
                  { mode: 'cards' as const, icon: LayoutGrid, label: 'Cards' },
                  { mode: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
                  { mode: 'collections' as const, icon: AlertTriangle, label: 'Collections' },
                  { mode: 'reports' as const, icon: PieChart, label: 'Reports' }
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      viewMode === mode 
                        ? 'bg-blue-600 text-white' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }'}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
                Export Reports
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Payment Portal
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex bg-neutral-900 border border-neutral-700 rounded-lg p-1">
              {[
                { period: '7d' as const, label: '7 Days' },
                { period: '30d' as const, label: '30 Days' },
                { period: '90d' as const, label: '90 Days' },
                { period: '1y' as const, label: '1 Year' }
              ].map(({ period, label }) => (
                <button
                  key={period}
                  onClick={() => setDateRange(period)}
                  className={'px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    dateRange === period 
                      ? 'bg-blue-600 text-white' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }'}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {analytics && (
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span>Revenue Growth: {analytics.trends.revenueGrowth}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span>Collection Rate: {analytics.financial.collectionRate.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Financial Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 rounded-lg p-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Total</p>
                  <p className="text-lg font-semibold text-white">{totalInvoices}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/10 rounded-lg p-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Paid</p>
                  <p className="text-lg font-semibold text-white">{paidInvoices}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-600/10 rounded-lg p-2">
                  <Clock className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Overdue</p>
                  <p className="text-lg font-semibold text-white">{overdueInvoices}</p>
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
                <div className="bg-orange-600/10 rounded-lg p-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Outstanding</p>
                  <p className="text-lg font-semibold text-white">${outstandingAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600/10 rounded-lg p-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Collection Rate</p>
                  <p className="text-lg font-semibold text-white">{collectionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {viewMode === 'analytics' && analytics ? (
          <div className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Financial Performance */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Financial Performance</h3>
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-neutral-400">Total Revenue</div>
                    <div className="text-2xl font-bold text-white">${analytics.financial.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Outstanding Amount</div>
                    <div className="text-lg font-semibold text-orange-400">${analytics.financial.outstandingAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Avg Invoice Value</div>
                    <div className="text-lg font-semibold text-neutral-300">${analytics.financial.averageInvoiceValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Profit Margin</div>
                    <div className="text-lg font-semibold text-green-400">{analytics.financial.profitMargin}%</div>
                  </div>
                </div>
              </div>

              {/* Collection Metrics */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Collection Metrics</h3>
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-neutral-400">Collection Rate</div>
                    <div className="text-2xl font-bold text-white">{analytics.financial.collectionRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Days to Payment</div>
                    <div className="text-lg font-semibold text-neutral-300">{analytics.financial.daysToPayment} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Overdue Rate</div>
                    <div className="text-lg font-semibold text-red-400">{analytics.performance.overdueRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Reminder Effectiveness</div>
                    <div className="text-lg font-semibold text-green-400">{analytics.performance.reminderEffectiveness}%</div>
                  </div>
                </div>
              </div>

              {/* Performance Analytics */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
                  <Activity className="h-5 w-5 text-purple-400" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-neutral-400">Invoices Generated</div>
                    <div className="text-2xl font-bold text-white">{analytics.performance.invoicesGenerated}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Payment Conversion</div>
                    <div className="text-lg font-semibold text-green-400">{analytics.performance.paymentConversionRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Dispute Rate</div>
                    <div className="text-lg font-semibold text-orange-400">{analytics.performance.disputeRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Customer Satisfaction</div>
                    <div className="text-lg font-semibold text-blue-400">{analytics.performance.customerSatisfaction}/5.0</div>
                  </div>
                </div>
              </div>

              {/* Predictions & Forecasting */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Predictions</h3>
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-neutral-400">Expected Revenue</div>
                    <div className="text-2xl font-bold text-white">${analytics.predictions.expectedRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-400">Collection Probability</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">High: {analytics.predictions.collectionProbability.high}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-400">Medium: {analytics.predictions.collectionProbability.medium}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400">Low: {analytics.predictions.collectionProbability.low}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Trends Chart */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-400" />
                  <span className="text-sm text-neutral-400">Monthly Performance</span>
                </div>
              </div>
              <div className="space-y-4">
                {analytics.trends.seasonalPatterns.map((pattern, index) => (
                  <div key={pattern.month} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-neutral-300 w-12">{pattern.month}</div>
                      <div className="flex-1 bg-neutral-800 rounded-full h-2 max-w-xs">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all" 
                          style={{ width: '${(pattern.revenue / 200000) * 100}%' }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">${pattern.revenue.toLocaleString()}</div>
                      <div className="text-xs text-neutral-400">{pattern.invoiceCount} invoices</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Segmentation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Customer Segmentation</h3>
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-neutral-300">Residential</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">${analytics.trends.customerSegmentation.residential.revenue.toLocaleString()}</div>
                      <div className="text-xs text-neutral-400">{analytics.trends.customerSegmentation.residential.count} customers</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-neutral-300">Commercial</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">${analytics.trends.customerSegmentation.commercial.revenue.toLocaleString()}</div>
                      <div className="text-xs text-neutral-400">{analytics.trends.customerSegmentation.commercial.count} customers</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Cash Flow Forecast</h3>
                  <AreaChart className="h-5 w-5 text-green-400" />
                </div>
                <div className="space-y-3">
                  {analytics.predictions.cashFlowForecast.map((forecast, index) => (
                    <div key={forecast.date} className="flex items-center justify-between">
                      <div className="text-sm text-neutral-300">
                        {new Date(forecast.date).toLocaleDateString()}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">${forecast.expectedInflow.toLocaleString()}</div>
                        <div className="text-xs text-red-400">Risk: {forecast.outstandingRisk}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'collections' ? (
          <div className="space-y-6">
            {/* Collections Dashboard */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Collections Management</h3>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Generate Collection Report
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="text-sm text-neutral-400">Overdue Invoices</div>
                  <div className="text-2xl font-bold text-red-400">{overdueInvoices}</div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="text-sm text-neutral-400">Overdue Amount</div>
                  <div className="text-2xl font-bold text-red-400">
                    ${invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amountDue, 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="text-sm text-neutral-400">In Collections</div>
                  <div className="text-2xl font-bold text-orange-400">
                    {invoices.filter(i => i.collectionStatus && i.collectionStatus !== 'none').length}
                  </div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="text-sm text-neutral-400">Recovery Rate</div>
                  <div className="text-2xl font-bold text-green-400">73.2%</div>
                </div>
              </div>
              
              {/* Overdue Invoices Table */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">Overdue Invoices Requiring Action</h4>
                <div className="space-y-2">
                  {invoices.filter(i => i.status === 'overdue').slice(0, 10).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-red-900/50">
                      <div className="flex items-center gap-4">
                        <div className="text-red-400">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-neutral-400">{invoice.customer.name}</div>
                          <div className="text-xs text-neutral-500">
                            Due: {new Date(invoice.dueAt).toLocaleDateString()}
                            {invoice.collectionStatus !== 'none' && (
                              <span className="ml-2 text-orange-400">• {invoice.collectionStatus?.replace('_', ' ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">${invoice.amountDue.toLocaleString()}</div>
                        <div className="text-sm text-red-400">+ ${invoice.lateFees} late fees</div>
                        <div className="text-xs text-neutral-500">
                          {invoice.automation.remindersSent} reminders sent
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          Collections
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'reports' ? (
          <div className="space-y-6">
            {/* Reports Dashboard */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Financial Reports</h3>
                <div className="flex items-center gap-3">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <PieChart className="h-8 w-8 text-blue-400" />
                    <div>
                      <h4 className="font-medium text-white">Aging Report</h4>
                      <p className="text-sm text-neutral-400">Outstanding invoices by age</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Generate
                  </Button>
                </div>
                
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-8 w-8 text-green-400" />
                    <div>
                      <h4 className="font-medium text-white">Revenue Analysis</h4>
                      <p className="text-sm text-neutral-400">Revenue trends and projections</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Generate
                  </Button>
                </div>
                
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-8 w-8 text-purple-400" />
                    <div>
                      <h4 className="font-medium text-white">Collection Report</h4>
                      <p className="text-sm text-neutral-400">Payment collection metrics</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 h-full">
            {(DataTable as any)({
              data: invoices,
              columns: columns,
              searchable: false,
              className: "h-full dispatch-table-dark"
            })}
          </div>
        )}
      </div>
    </div>
  )
}
