// Home Services Price Book Types
// Comprehensive type definitions for hierarchical price book system

export interface PricebookCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  image?: string
  sortOrder: number
  active: boolean
  parentId?: string
  children?: PricebookCategory[]
  serviceCount: number
  avgPrice: number
  createdAt: string
  updatedAt: string
}

export interface ServiceMaterial {
  id: string
  name: string
  description: string
  unitPrice: number
  unit: string // 'each', 'linear_foot', 'square_foot', 'gallon', etc.
  quantity: number
  markup: number // percentage
  required: boolean
  category: string
  supplier?: string
  partNumber?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceAttachment {
  id: string
  name: string
  type: 'image' | 'pdf' | 'video' | 'document'
  url: string
  thumbnail?: string
  description?: string
  fileSize: number
  mimeType: string
  sortOrder: number
  createdAt: string
}

export interface ServicePricing {
  basePrice: number
  laborRate: number
  estimatedHours: number
  materialCosts: number
  totalEstimate: number
  minPrice?: number
  maxPrice?: number
  markup: number // percentage
  profitMargin: number // percentage
  regionalMultiplier?: number
  lastUpdated: string
}

export interface PricebookService {
  id: string
  name: string
  description: string
  customerDescription: string // Customer-friendly description
  categoryId: string
  
  // Pricing information
  pricing: ServicePricing
  
  // Materials and components
  materials: ServiceMaterial[]
  requiredMaterials: string[] // IDs of required materials
  optionalMaterials: string[] // IDs of optional add-ons
  
  // Visual assets
  attachments: ServiceAttachment[]
  primaryImage?: string
  galleryImages: string[]
  videoUrl?: string
  
  // Service characteristics
  serviceType: 'inspection' | 'installation' | 'repair' | 'maintenance' | 'emergency'
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert'
  duration: {
    min: number // minutes
    max: number // minutes
    average: number // minutes
  }
  
  // Warranty and guarantees
  warranty: {
    duration: number // days
    description: string
    type: 'parts' | 'labor' | 'full'
  }
  
  // Requirements and prerequisites
  requirements: string[]
  tools: string[]
  certifications: string[]
  
  // Business metrics
  active: boolean
  featured: boolean
  popularity: number // usage frequency
  rating: number // internal quality rating
  timesUsed: number
  lastUsed?: string
  avgJobValue: number
  
  // SEO and searchability
  tags: string[]
  keywords: string[]
  searchTerms: string[]
  
  // Administrative
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
  version: number
}

export interface EstimateLine {
  id: string
  serviceId: string
  service: PricebookService
  quantity: number
  unitPrice: number
  materialCosts: number
  laborCosts: number
  subtotal: number
  notes?: string
  customizations?: {
    [key: string]: any
  }
}

export interface PricebookEstimate {
  id: string
  customerId?: string
  projectName: string
  description: string
  
  // Line items
  lines: EstimateLine[]
  
  // Totals
  subtotal: number
  laborTotal: number
  materialTotal: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  total: number
  
  // Terms and conditions
  validUntil: string
  terms: string
  notes: string
  
  // Status
  status: 'draft' | 'presented' | 'accepted' | 'rejected' | 'expired'
  
  // Metadata
  createdBy: string
  presentedAt?: string
  acceptedAt?: string
  createdAt: string
  updatedAt: string
}

export interface PricebookSettings {
  // Display preferences
  defaultView: 'categories' | 'list' | 'tiles'
  showPricing: boolean
  showMaterials: boolean
  showImages: boolean
  
  // Pricing settings
  defaultMarkup: number
  laborRateDefault: number
  regionalPricingEnabled: boolean
  showCostBreakdown: boolean
  
  // Customer presentation
  presentationMode: boolean
  showTechnicalDetails: boolean
  allowCustomerSelfService: boolean
  requireApprovalForPricing: boolean
  
  // Administrative
  autoSaveEnabled: boolean
  auditTrailEnabled: boolean
  bulkOperationsEnabled: boolean
  
  updatedAt: string
}

export interface PricebookViewState {
  currentCategoryId?: string
  selectedServiceIds: string[]
  searchQuery: string
  filters: {
    serviceType?: string[]
    priceRange?: [number, number]
    duration?: [number, number]
    difficulty?: string[]
    active?: boolean
    featured?: boolean
  }
  sortBy: 'name' | 'price' | 'popularity' | 'updated' | 'category'
  sortOrder: 'asc' | 'desc'
  viewMode: 'tiles' | 'list' | 'presentation'
  presentationMode: boolean
}

// Navigation breadcrumb for category hierarchy
export interface PricebookBreadcrumb {
  id: string
  name: string
  path: string
}

// Analytics and reporting types
export interface PricebookAnalytics {
  totalServices: number
  activeServices: number
  avgServicePrice: number
  totalRevenue: number
  mostPopularServices: PricebookService[]
  recentlyUpdated: PricebookService[]
  categoryBreakdown: {
    categoryId: string
    categoryName: string
    serviceCount: number
    revenue: number
  }[]
}