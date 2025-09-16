import { faker } from '@faker-js/faker'
import { 
  BaseEntity, 
  Customer, 
  generateId, 
  generateCustomer, 
  generatePrice, 
  generateStatus,
  generateArray 
} from './index'

export type HSWorkOrderStatus = 'created' | 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
export type HSServiceType = 'plumbing' | 'electrical' | 'hvac' | 'roofing' | 'flooring' | 'painting' | 'landscaping' | 'cleaning'

export interface HSWorkOrder extends BaseEntity {
  jobNumber: string
  customer: Customer
  serviceType: HSServiceType
  title: string
  description: string
  status: HSWorkOrderStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledAt: Date | null
  completedAt: Date | null
  technicianId: string | null
  technician?: {
    id: string
    name: string
    avatar?: string
    phone: string
  }
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    instructions?: string
  }
  estimate: {
    laborHours: number
    materialCost: number
    laborRate: number
    total: number
  }
  materials: Array<{
    id: string
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  photos?: string[]
  notes?: string
  tags: string[]
}

export interface HSEstimate extends BaseEntity {
  estimateNumber: string
  customer: Customer
  workOrderId?: string
  title: string
  description: string
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  validUntil: Date
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    type: 'labor' | 'material'
  }>
  subtotal: number
  tax: number
  total: number
  terms?: string
  notes?: string
}

export interface HSInvoice extends BaseEntity {
  invoiceNumber: string
  customer: Customer
  workOrderId?: string
  estimateId?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issuedAt: Date
  dueAt: Date
  paidAt?: Date
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    type: 'labor' | 'material'
  }>
  subtotal: number
  tax: number
  total: number
  amountPaid: number
  amountDue: number
  paymentMethod?: 'cash' | 'check' | 'credit_card' | 'ach'
  notes?: string
}

export interface HSTechnician extends BaseEntity {
  name: string
  email: string
  phone: string
  avatar?: string
  specialties: HSServiceType[]
  certifications: string[]
  active: boolean
  location?: {
    lat: number
    lng: number
  }
  schedule?: {
    monday: { start: string; end: string; available: boolean }
    tuesday: { start: string; end: string; available: boolean }
    wednesday: { start: string; end: string; available: boolean }
    thursday: { start: string; end: string; available: boolean }
    friday: { start: string; end: string; available: boolean }
    saturday: { start: string; end: string; available: boolean }
    sunday: { start: string; end: string; available: boolean }
  }
}

// Generators
export const generateHSWorkOrder = (): HSWorkOrder => {
  const customer = generateCustomer()
  const serviceType = faker.helpers.arrayElement<HSServiceType>([
    'plumbing', 'electrical', 'hvac', 'roofing', 'flooring', 'painting', 'landscaping', 'cleaning'
  ])
  
  const laborHours = faker.number.float({ min: 1, max: 8, fractionDigits: 1 })
  const laborRate = faker.number.int({ min: 75, max: 150 })
  const materialCost = generatePrice(50, 500)
  
  const workOrder: HSWorkOrder = {
    id: generateId(),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 7 }),
    jobNumber: 'WO-${faker.number.int({ min: 1000, max: 9999 })}',
    customer,
    serviceType,
    title: generateHSJobTitle(serviceType),
    description: generateHSJobDescription(serviceType),
    status: generateStatus<HSWorkOrderStatus>(['created', 'scheduled', 'assigned', 'in_progress', 'completed', 'cancelled']),
    priority: faker.helpers.weightedArrayElement([
      { value: 'low', weight: 3 },
      { value: 'medium', weight: 5 },
      { value: 'high', weight: 2 },
      { value: 'urgent', weight: 1 }
    ]),
    scheduledAt: faker.datatype.boolean() ? faker.date.soon({ days: 7 }) : null,
    completedAt: faker.datatype.boolean({ probability: 0.3 }) ? faker.date.recent({ days: 7 }) : null,
    technicianId: faker.datatype.boolean() ? generateId() : null,
    technician: faker.datatype.boolean() ? {
      id: generateId(),
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
      phone: faker.phone.number()
    } : undefined,
    location: {
      address: customer.address.street,
      city: customer.address.city,
      state: customer.address.state,
      zipCode: customer.address.zipCode,
      instructions: faker.datatype.boolean() ? faker.lorem.sentence() : undefined
    },
    estimate: {
      laborHours,
      materialCost,
      laborRate,
      total: (laborHours * laborRate) + materialCost
    },
    materials: generateHSMaterials(serviceType),
    photos: faker.datatype.boolean() ? [faker.image.url(), faker.image.url()] : undefined,
    notes: faker.datatype.boolean() ? faker.lorem.paragraph() : undefined,
    tags: faker.helpers.arrayElements(['urgent', 'warranty', 'repeat_customer', 'large_job'], { min: 0, max: 3 })
  }

  return workOrder
}

export const generateHSEstimate = (): HSEstimate => {
  const customer = generateCustomer()
  const lineItems = Array.from({ length: faker.number.int({ min: 2, max: 8 }) }, () => {
    const quantity = faker.number.int({ min: 1, max: 5 })
    const unitPrice = generatePrice(25, 200)
    return {
      id: generateId(),
      description: faker.commerce.productName(),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      type: faker.helpers.arrayElement(['labor', 'material']) as 'labor' | 'material'
    }
  })
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.085 // 8.5% tax
  const total = subtotal + tax

  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 7 }),
    estimateNumber: 'EST-${faker.number.int({ min: 1000, max: 9999 })}',
    customer,
    workOrderId: faker.datatype.boolean() ? generateId() : undefined,
    title: faker.company.buzzPhrase(),
    description: faker.lorem.paragraph(),
    status: generateStatus(['draft', 'sent', 'approved', 'rejected', 'expired']),
    validUntil: faker.date.future({ years: 1 }),
    lineItems,
    subtotal,
    tax,
    total,
    terms: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    notes: faker.datatype.boolean() ? faker.lorem.paragraph() : undefined
  }
}

export const generateHSInvoice = (): HSInvoice => {
  const customer = generateCustomer()
  const lineItems = Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => {
    const quantity = faker.number.int({ min: 1, max: 3 })
    const unitPrice = generatePrice(50, 300)
    return {
      id: generateId(),
      description: faker.commerce.productName(),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      type: faker.helpers.arrayElement(['labor', 'material']) as 'labor' | 'material'
    }
  })
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.085
  const total = subtotal + tax
  const amountPaid = faker.datatype.boolean({ probability: 0.7 }) ? total : faker.number.float({ min: 0, max: total })
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 7 }),
    invoiceNumber: 'INV-${faker.number.int({ min: 1000, max: 9999 })}',
    customer,
    workOrderId: faker.datatype.boolean() ? generateId() : undefined,
    estimateId: faker.datatype.boolean() ? generateId() : undefined,
    status: generateStatus(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
    issuedAt: faker.date.recent({ days: 30 }),
    dueAt: faker.date.soon({ days: 30 }),
    paidAt: amountPaid === total ? faker.date.recent({ days: 15 }) : undefined,
    lineItems,
    subtotal,
    tax,
    total,
    amountPaid,
    amountDue: total - amountPaid,
    paymentMethod: amountPaid > 0 ? faker.helpers.arrayElement(['cash', 'check', 'credit_card', 'ach']) : undefined,
    notes: faker.datatype.boolean() ? faker.lorem.paragraph() : undefined
  }
}

export const generateHSTechnician = (): HSTechnician => ({
  id: generateId(),
  createdAt: faker.date.recent({ days: 90 }),
  updatedAt: faker.date.recent({ days: 7 }),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  avatar: faker.image.avatar(),
  specialties: faker.helpers.arrayElements<HSServiceType>([
    'plumbing', 'electrical', 'hvac', 'roofing', 'flooring', 'painting', 'landscaping', 'cleaning'
  ], { min: 1, max: 3 }),
  certifications: faker.helpers.arrayElements([
    'Licensed Electrician', 'Master Plumber', 'HVAC Certified', 'EPA Certified', 'OSHA 10', 'Lead Safe'
  ], { min: 0, max: 4 }),
  active: faker.datatype.boolean({ probability: 0.9 }),
  location: {
    lat: faker.location.latitude(),
    lng: faker.location.longitude()
  },
  schedule: {
    monday: { start: '08:00', end: '17:00', available: true },
    tuesday: { start: '08:00', end: '17:00', available: true },
    wednesday: { start: '08:00', end: '17:00', available: true },
    thursday: { start: '08:00', end: '17:00', available: true },
    friday: { start: '08:00', end: '17:00', available: true },
    saturday: { start: '09:00', end: '15:00', available: faker.datatype.boolean() },
    sunday: { start: '10:00', end: '14:00', available: faker.datatype.boolean({ probability: 0.3 }) }
  }
})

// Helper functions
const generateHSJobTitle = (serviceType: HSServiceType): string => {
  const titles = {
    plumbing: ['Leak Repair', 'Toilet Installation', 'Pipe Replacement', 'Water Heater Service', 'Drain Cleaning'],
    electrical: ['Outlet Installation', 'Panel Upgrade', 'Light Fixture Install', 'Wiring Repair', 'Circuit Installation'],
    hvac: ['AC Repair', 'Furnace Maintenance', 'Duct Cleaning', 'Thermostat Install', 'System Tune-up'],
    roofing: ['Roof Repair', 'Gutter Cleaning', 'Shingle Replacement', 'Roof Inspection', 'Leak Fix'],
    flooring: ['Hardwood Install', 'Carpet Replacement', 'Tile Repair', 'Floor Refinishing', 'Vinyl Install'],
    painting: ['Interior Painting', 'Exterior Painting', 'Cabinet Refinish', 'Deck Staining', 'Trim Work'],
    landscaping: ['Lawn Mowing', 'Tree Trimming', 'Garden Design', 'Irrigation Install', 'Fertilization'],
    cleaning: ['Deep Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Post Construction', 'Move-in Clean']
  }
  
  return faker.helpers.arrayElement(titles[serviceType])
}

const generateHSJobDescription = (serviceType: HSServiceType): string => {
  const descriptions = {
    plumbing: faker.helpers.arrayElement([
      'Customer reports water leak under kitchen sink',
      'Install new toilet in master bathroom',
      'Replace old galvanized pipes with copper',
      'Water heater not producing hot water'
    ]),
    electrical: faker.helpers.arrayElement([
      'Install additional outlets in home office',
      'Upgrade electrical panel to 200 amp service', 
      'Replace flickering light fixtures in dining room',
      'Troubleshoot circuit breaker that keeps tripping'
    ]),
    hvac: faker.helpers.arrayElement([
      'Air conditioner not cooling properly',
      'Annual furnace maintenance and cleaning',
      'Clean air ducts throughout house',
      'Install programmable thermostat'
    ]),
    roofing: faker.helpers.arrayElement([
      'Fix leak over living room during rain',
      'Clean gutters and check for damage',
      'Replace missing shingles after storm',
      'Complete roof inspection before sale'
    ]),
    flooring: faker.helpers.arrayElement([
      'Install hardwood flooring in bedrooms',
      'Replace worn carpet in living areas',
      'Repair cracked tiles in bathroom',
      'Refinish existing hardwood floors'
    ]),
    painting: faker.helpers.arrayElement([
      'Paint interior walls in neutral colors',
      'Touch up exterior paint before listing',
      'Refinish kitchen cabinets',
      'Stain deck and outdoor furniture'
    ]),
    landscaping: faker.helpers.arrayElement([
      'Weekly lawn care and maintenance',
      'Trim overgrown trees and bushes',
      'Design and install flower garden',
      'Repair broken sprinkler system'
    ]),
    cleaning: faker.helpers.arrayElement([
      'Deep clean entire house before move-in',
      'Professional carpet cleaning service',
      'Clean all windows inside and outside',
      'Clean up after renovation project'
    ])
  }
  
  return descriptions[serviceType]
}

const generateHSMaterials = (serviceType: HSServiceType) => {
  const materialTypes = {
    plumbing: ['Copper Pipe', 'PVC Fittings', 'Water Heater', 'Faucet', 'Toilet'],
    electrical: ['Wire (12 AWG)', 'Outlet', 'Light Switch', 'Circuit Breaker', 'Conduit'],
    hvac: ['Air Filter', 'Thermostat', 'Ductwork', 'Refrigerant', 'Motor'],
    roofing: ['Asphalt Shingles', 'Roofing Nails', 'Tar Paper', 'Flashing', 'Ridge Vent'],
    flooring: ['Hardwood Planks', 'Tile', 'Grout', 'Underlayment', 'Trim'],
    painting: ['Paint (Gallon)', 'Primer', 'Brush', 'Roller', 'Drop Cloth'],
    landscaping: ['Mulch', 'Plants', 'Fertilizer', 'Sprinkler Head', 'Soil'],
    cleaning: ['Cleaning Supplies', 'Equipment Rental', 'Protective Gear', 'Vacuum Bags', 'Chemicals']
  }
  
  return faker.helpers.arrayElements(materialTypes[serviceType], { min: 1, max: 5 }).map(name => ({
    id: generateId(),
    name,
    quantity: faker.number.int({ min: 1, max: 10 }),
    unitPrice: generatePrice(5, 100),
    total: 0 // Will be calculated
  })).map(item => ({
    ...item,
    total: item.quantity * item.unitPrice
  }))
}
