// Comprehensive TypeScript definitions for Thorbis Business OS industry schemas
// Provides strict typing for all industry-specific data structures

// =============================================================================
// Core Base Types
// =============================================================================

export interface BaseEntity {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt?: Date
  readonly tenantId: string
}

export interface User extends BaseEntity {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  notifications: NotificationSettings
  language: string
  timezone: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
}

export type UserRole = 
  | 'admin'
  | 'manager'
  | 'employee'
  | 'technician'
  | 'dispatcher'
  | 'viewer'

// =============================================================================
// Home Services Industry Types
// =============================================================================

export namespace HomeServices {
  export interface WorkOrder extends BaseEntity {
    customerInfo: Customer
    serviceType: ServiceType
    priority: ServicePriority
    status: WorkOrderStatus
    scheduledDate: Date
    completedDate?: Date
    assignedTechnician?: Technician
    description: string
    notes?: string
    estimatedDuration: number // minutes
    actualDuration?: number // minutes
    materials: Material[]
    laborCost: number
    materialCost: number
    totalCost: number
    invoiceId?: string
  }

  export interface Customer extends BaseEntity {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: Address
    serviceHistory: string[]
    preferredTechnician?: string
    notes?: string
    customerSince: Date
  }

  export interface Technician extends BaseEntity {
    userId: string
    licenseNumber?: string
    specializations: ServiceType[]
    isAvailable: boolean
    currentLocation?: GeoCoordinates
    skillRating: number // 1-5
    completedJobs: number
    averageRating: number
  }

  export interface Invoice extends BaseEntity {
    workOrderId: string
    customerId: string
    invoiceNumber: string
    issueDate: Date
    dueDate: Date
    status: InvoiceStatus
    subtotal: number
    tax: number
    total: number
    paidAmount: number
    lineItems: InvoiceLineItem[]
    paymentMethod?: PaymentMethod
    paidDate?: Date
  }

  export type ServiceType = 
    | 'plumbing'
    | 'electrical'
    | 'hvac'
    | 'appliance_repair'
    | 'general_handyman'
    | 'cleaning'
    | 'landscaping'
    | 'pest_control'

  export type ServicePriority = 'low' | 'medium' | 'high' | 'emergency'

  export type WorkOrderStatus = 
    | 'scheduled'
    | 'in_progress' 
    | 'completed'
    | 'cancelled'
    | 'on_hold'

  export type InvoiceStatus = 
    | 'draft'
    | 'sent'
    | 'viewed'
    | 'paid'
    | 'overdue'
    | 'cancelled'
}

// =============================================================================
// Restaurant Industry Types
// =============================================================================

export namespace Restaurant {
  export interface Order extends BaseEntity {
    orderNumber: string
    customerId?: string
    tableNumber?: number
    orderType: OrderType
    status: OrderStatus
    items: OrderItem[]
    subtotal: number
    tax: number
    tip: number
    total: number
    paymentMethod?: PaymentMethod
    specialInstructions?: string
    estimatedReadyTime?: Date
    actualReadyTime?: Date
  }

  export interface MenuItem extends BaseEntity {
    name: string
    description: string
    category: MenuCategory
    price: number
    isAvailable: boolean
    allergens: Allergen[]
    nutritionalInfo?: NutritionalInfo
    preparationTime: number // minutes
    ingredients: Ingredient[]
    imageUrl?: string
  }

  export interface OrderItem {
    menuItemId: string
    quantity: number
    unitPrice: number
    modifications?: string[]
    specialInstructions?: string
  }

  export interface Reservation extends BaseEntity {
    customerName: string
    customerPhone: string
    customerEmail?: string
    partySize: number
    requestedDateTime: Date
    actualDateTime?: Date
    tableNumber?: number
    status: ReservationStatus
    specialRequests?: string
    notes?: string
  }

  export interface Inventory extends BaseEntity {
    ingredientId: string
    currentStock: number
    unitOfMeasure: string
    reorderLevel: number
    reorderQuantity: number
    lastRestocked: Date
    expirationDate?: Date
    supplierId: string
    costPerUnit: number
  }

  export type OrderType = 'dine_in' | 'takeout' | 'delivery' | 'catering'

  export type OrderStatus = 
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'served'
    | 'completed'
    | 'cancelled'

  export type MenuCategory = 
    | 'appetizers'
    | 'entrees'
    | 'desserts'
    | 'beverages'
    | 'specials'

  export type ReservationStatus = 
    | 'confirmed'
    | 'seated'
    | 'completed'
    | 'cancelled'
    | 'no_show'

  export type Allergen = 
    | 'gluten'
    | 'dairy'
    | 'nuts'
    | 'shellfish'
    | 'soy'
    | 'eggs'
}

// =============================================================================
// Auto Services Industry Types
// =============================================================================

export namespace AutoServices {
  export interface RepairOrder extends BaseEntity {
    customerId: string
    vehicleId: string
    orderNumber: string
    status: RepairStatus
    priority: ServicePriority
    serviceType: AutoServiceType
    description: string
    diagnosis?: string
    estimatedCost: number
    actualCost?: number
    estimatedCompletion: Date
    actualCompletion?: Date
    assignedTechnician?: string
    parts: Part[]
    laborHours: number
    laborRate: number
    warranty?: Warranty
  }

  export interface Vehicle extends BaseEntity {
    customerId: string
    make: string
    model: string
    year: number
    vin: string
    licensePlate: string
    mileage: number
    color: string
    engine: EngineInfo
    serviceHistory: string[]
    nextServiceDue: Date
    notes?: string
  }

  export interface Part extends BaseEntity {
    partNumber: string
    description: string
    manufacturer: string
    category: PartCategory
    price: number
    cost: number
    quantityOnHand: number
    reorderLevel: number
    isCore: boolean
    warranty?: Warranty
    supplierInfo: SupplierInfo
  }

  export interface Estimate extends BaseEntity {
    customerId: string
    vehicleId: string
    estimateNumber: string
    status: EstimateStatus
    validUntil: Date
    services: EstimateService[]
    parts: EstimatePart[]
    laborTotal: number
    partsTotal: number
    tax: number
    grandTotal: number
    notes?: string
    convertedToRepairOrder?: string
  }

  export type AutoServiceType = 
    | 'oil_change'
    | 'brake_service'
    | 'transmission'
    | 'engine_repair'
    | 'tire_service'
    | 'electrical'
    | 'ac_service'
    | 'diagnostic'
    | 'inspection'

  export type RepairStatus = 
    | 'estimate'
    | 'approved'
    | 'in_progress'
    | 'waiting_parts'
    | 'quality_check'
    | 'completed'
    | 'delivered'

  export type PartCategory = 
    | 'engine'
    | 'transmission'
    | 'brakes'
    | 'suspension'
    | 'electrical'
    | 'body'
    | 'interior'
}

// =============================================================================
// Retail Industry Types
// =============================================================================

export namespace Retail {
  export interface Product extends BaseEntity {
    sku: string
    name: string
    description: string
    category: ProductCategory
    brand: string
    price: number
    cost: number
    stockQuantity: number
    reorderLevel: number
    reorderQuantity: number
    isActive: boolean
    weight?: number
    dimensions?: Dimensions
    images: string[]
    attributes: ProductAttribute[]
    suppliers: SupplierInfo[]
  }

  export interface Sale extends BaseEntity {
    saleNumber: string
    customerId?: string
    cashierId: string
    items: SaleItem[]
    subtotal: number
    tax: number
    discount: number
    total: number
    amountPaid: number
    change: number
    paymentMethod: PaymentMethod
    refunded?: boolean
    refundAmount?: number
    refundDate?: Date
  }

  export interface Customer extends BaseEntity {
    firstName: string
    lastName: string
    email?: string
    phone?: string
    address?: Address
    dateOfBirth?: Date
    loyaltyNumber?: string
    totalSpent: number
    visitCount: number
    lastVisit: Date
    preferences: CustomerPreferences
  }

  export interface Inventory extends BaseEntity {
    productId: string
    locationId: string
    quantityOnHand: number
    quantityReserved: number
    quantityAvailable: number
    lastCountDate: Date
    reorderPoint: number
    maxStock: number
    avgMonthlySales: number
    seasonalityFactor?: number
  }

  export type ProductCategory = 
    | 'electronics'
    | 'clothing'
    | 'books'
    | 'home_garden'
    | 'sports'
    | 'toys'
    | 'health_beauty'
    | 'automotive'

  export interface ProductAttribute {
    name: string
    value: string
    type: 'text' | 'number' | 'boolean' | 'select'
  }
}

// =============================================================================
// Shared Common Types
// =============================================================================

export interface Address {
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface GeoCoordinates {
  latitude: number
  longitude: number
}

export interface Material {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  type: 'labor' | 'material' | 'service'
}

export interface Warranty {
  duration: number // months
  type: 'parts' | 'labor' | 'full'
  terms: string
  startDate: Date
  endDate: Date
}

export interface SupplierInfo {
  supplierId: string
  supplierName: string
  contactPerson?: string
  phone?: string
  email?: string
  leadTime: number // days
  minimumOrder?: number
}

export interface NutritionalInfo {
  calories: number
  protein: number // grams
  carbs: number // grams
  fat: number // grams
  fiber?: number // grams
  sodium?: number // mg
}

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  allergens: Allergen[]
}

export interface EngineInfo {
  type: string
  size: string
  cylinders: number
  fuel: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
  transmission: 'manual' | 'automatic' | 'cvt'
}

export interface EstimateService {
  description: string
  laborHours: number
  laborRate: number
  total: number
}

export interface EstimatePart {
  partId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Dimensions {
  length: number
  width: number
  height: number
  unit: 'inches' | 'cm' | 'mm'
}

export interface SaleItem {
  productId: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface CustomerPreferences {
  communicationMethod: 'email' | 'sms' | 'phone' | 'none'
  marketingOptIn: boolean
  preferredContactTime?: 'morning' | 'afternoon' | 'evening'
  notes?: string
}

export type PaymentMethod = 
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'check'
  | 'digital_wallet'
  | 'store_credit'
  | 'financing'

export type EstimateStatus = 
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'declined'
  | 'expired'

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: ApiError[]
  pagination?: PaginationInfo
  meta?: Record<string, unknown>
}

export interface ApiError {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// =============================================================================
// Form Validation Types
// =============================================================================

export interface FormFieldError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: FormFieldError[]
}

// =============================================================================
// Performance and Analytics Types
// =============================================================================

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  context?: Record<string, string>
}

export interface AnalyticsEvent {
  eventName: string
  eventAction: string
  eventValue?: number
  userId?: string
  sessionId: string
  properties: Record<string, unknown>
  timestamp: Date
}