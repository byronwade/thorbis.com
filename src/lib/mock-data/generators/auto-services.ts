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

export type RepairOrderStatus = 'created' | 'assigned' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled'
export type ServiceBayStatus = 'available' | 'occupied' | 'maintenance' | 'out_of_service'
export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'coupe' | 'motorcycle'

export interface Vehicle extends BaseEntity {
  vin: string
  year: number
  make: string
  model: string
  type: VehicleType
  color: string
  mileage: number
  customerId: string
  customer?: Customer
  licensePlate?: string
  engine: string
  transmission: 'manual' | 'automatic' | 'cvt'
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric'
  lastServiceDate?: Date
  nextServiceDue?: Date
  serviceHistory: Array<{
    date: Date
    mileage: number
    services: string[]
    cost: number
  }>
}

export interface RepairOrder extends BaseEntity {
  orderNumber: string
  vehicleId: string
  vehicle: Vehicle
  customerId: string
  customer: Customer
  status: RepairOrderStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  technicianId?: string
  technician?: {
    id: string
    name: string
    avatar?: string
  }
  serviceBayId?: string
  services: Array<{
    id: string
    name: string
    description: string
    laborHours: number
    laborRate: number
    laborCost: number
    parts: Array<{
      id: string
      name: string
      partNumber: string
      quantity: number
      unitCost: number
      totalCost: number
    }>
    totalCost: number
  }>
  symptoms: string
  diagnosis?: string
  estimatedCompletion?: Date
  actualCompletion?: Date
  laborTotal: number
  partsTotal: number
  taxTotal: number
  total: number
  notes?: string
  customerApproved?: boolean
  approvalDate?: Date
}

export interface ServiceBay extends BaseEntity {
  number: string
  name: string
  status: ServiceBayStatus
  type: 'general' | 'alignment' | 'tire' | 'diagnostic' | 'detail' | 'oil_change'
  capacity: 'standard' | 'heavy_duty' | 'motorcycle'
  currentRepairOrderId?: string
  currentRepairOrder?: RepairOrder
  technicianId?: string
  technician?: {
    id: string
    name: string
  }
  equipment: string[]
  estimatedAvailableAt?: Date
  location: {
    zone: string
    position: number
  }
}

export interface AutoTechnician extends BaseEntity {
  name: string
  email: string
  phone: string
  avatar?: string
  active: boolean
  specialties: string[]
  certifications: string[]
  hourlyRate: number
  currentServiceBayId?: string
  performance: {
    avgRepairTime: number
    qualityRating: number
    completedRepairs: number
    customerRating: number
  }
  schedule: {
    shift: 'day' | 'evening' | 'night'
    daysWorking: string[]
  }
}

export interface AutoPart extends BaseEntity {
  name: string
  partNumber: string
  category: 'engine' | 'transmission' | 'brakes' | 'suspension' | 'electrical' | 'body' | 'interior' | 'tires' | 'fluids' | 'filters'
  brand: string
  description: string
  unitCost: number
  retailPrice: number
  currentStock: number
  minStock: number
  maxStock: number
  supplier: string
  location: string
  compatibility: string[] // Vehicle makes/models this part fits
  lastOrdered?: Date
  leadTime: number // days
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

export interface Estimate extends BaseEntity {
  estimateNumber: string
  vehicleId: string
  vehicle: Vehicle
  customerId: string
  customer: Customer
  status: 'draft' | 'sent' | 'approved' | 'declined' | 'expired'
  validUntil: Date
  services: Array<{
    id: string
    name: string
    description: string
    laborHours: number
    laborRate: number
    laborCost: number
    parts: Array<{
      id: string
      name: string
      partNumber: string
      quantity: number
      unitCost: number
      totalCost: number
    }>
    totalCost: number
  }>
  symptoms: string
  recommendations?: string
  laborTotal: number
  partsTotal: number
  taxTotal: number
  total: number
  sentAt?: Date
  approvedAt?: Date
  declinedAt?: Date
  notes?: string
}

// Generators
export const generateVehicle = (): Vehicle => {
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Nissan', 'Mazda']
  const make = faker.helpers.arrayElement(makes)
  const year = faker.date.between({ from: '2005-01-01', to: new Date() }).getFullYear()
  
  const models: Record<string, string[]> = {
    Toyota: ['Camry', 'Corolla', 'Prius', 'RAV4', 'Highlander'],
    Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit'],
    Ford: ['F-150', 'Fusion', 'Escape', 'Explorer', 'Mustang'],
    Chevrolet: ['Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Camaro'],
    BMW: ['3 Series', '5 Series', 'X3', 'X5', 'Z4'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'A-Class'],
    Audi: ['A4', 'A6', 'Q5', 'Q7', 'TT'],
    Volkswagen: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf'],
    Nissan: ['Altima', 'Sentra', 'Rogue', 'Pathfinder', '370Z'],
    Mazda: ['CX-5', 'Mazda3', 'CX-9', 'Mazda6', 'MX-5']
  }
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 365 }),
    updatedAt: faker.date.recent({ days: 30 }),
    vin: faker.vehicle.vin(),
    year,
    make,
    model: faker.helpers.arrayElement(models[make] || ['Unknown']),
    type: faker.helpers.arrayElement(['sedan', 'suv', 'truck', 'van', 'coupe', 'motorcycle']),
    color: faker.vehicle.color(),
    mileage: faker.number.int({ min: 5000, max: 250000 }),
    customerId: generateId(),
    customer: generateCustomer(),
    licensePlate: faker.vehicle.vrm(),
    engine: '${faker.number.float({ min: 1.0, max: 6.0, fractionDigits: 1 })}L ${faker.helpers.arrayElement(['I4', 'V6', 'V8'])}',
    transmission: faker.helpers.arrayElement(['manual', 'automatic', 'cvt']),
    fuelType: faker.helpers.arrayElement(['gasoline', 'diesel', 'hybrid', 'electric']),
    lastServiceDate: faker.date.recent({ days: 90 }),
    nextServiceDue: faker.date.soon({ days: 90 }),
    serviceHistory: Array.from({ length: faker.number.int({ min: 1, max: 8 }) }, () => ({
      date: faker.date.past({ years: 2 }),
      mileage: faker.number.int({ min: 1000, max: 200000 }),
      services: faker.helpers.arrayElements([
        'Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Diagnostics',
        'Transmission Service', 'Air Filter Replacement', 'Spark Plug Replacement'
      ], { min: 1, max: 4 }),
      cost: generatePrice(50, 800)
    }))
  }
}

export const generateRepairOrder = (): RepairOrder => {
  const vehicle = generateVehicle()
  const services = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => {
    const laborHours = faker.number.float({ min: 0.5, max: 8, fractionDigits: 1 })
    const laborRate = faker.number.int({ min: 80, max: 150 })
    const laborCost = laborHours * laborRate
    
    const parts = Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => {
      const quantity = faker.number.int({ min: 1, max: 4 })
      const unitCost = generatePrice(10, 500)
      return {
        id: generateId(),
        name: faker.helpers.arrayElement([
          'Brake Pad Set', 'Oil Filter', 'Air Filter', 'Spark Plugs',
          'Brake Rotor', 'Transmission Fluid', 'Coolant', 'Serpentine Belt'
        ]),
        partNumber: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
        quantity,
        unitCost,
        totalCost: quantity * unitCost
      }
    })
    
    const partsCost = parts.reduce((sum, part) => sum + part.totalCost, 0)
    
    return {
      id: generateId(),
      name: faker.helpers.arrayElement([
        'Oil Change Service', 'Brake Repair', 'Engine Diagnostics',
        'Transmission Service', 'Tire Replacement', 'Battery Replacement',
        'Cooling System Service', 'Suspension Repair'
      ]),
      description: faker.lorem.sentence(),
      laborHours,
      laborRate,
      laborCost,
      parts,
      totalCost: laborCost + partsCost
    }
  })
  
  const laborTotal = services.reduce((sum, service) => sum + service.laborCost, 0)
  const partsTotal = services.reduce((sum, service) => 
    sum + service.parts.reduce((partSum, part) => partSum + part.totalCost, 0), 0
  )
  const taxTotal = (laborTotal + partsTotal) * 0.08
  const total = laborTotal + partsTotal + taxTotal
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 7 }),
    orderNumber: 'RO-${new Date().getFullYear()}-${faker.number.int({ min: 1000, max: 9999 })}',
    vehicleId: vehicle.id,
    vehicle,
    customerId: vehicle.customerId,
    customer: vehicle.customer!,
    status: generateStatus<RepairOrderStatus>([
      'created', 'assigned', 'in_progress', 'waiting_parts', 'waiting_approval', 'completed', 'cancelled'
    ]),
    priority: faker.helpers.weightedArrayElement([
      { value: 'normal', weight: 6 },
      { value: 'high', weight: 2 },
      { value: 'urgent', weight: 1 },
      { value: 'low', weight: 1 }
    ]),
    technicianId: faker.datatype.boolean() ? generateId() : undefined,
    technician: faker.datatype.boolean() ? {
      id: generateId(),
      name: faker.person.fullName(),
      avatar: faker.image.avatar()
    } : undefined,
    serviceBayId: faker.datatype.boolean() ? generateId() : undefined,
    services,
    symptoms: faker.helpers.arrayElement([
      'Engine making strange noise',
      'Brakes squeaking when stopping',
      'Car not starting consistently',
      'Transmission shifting roughly',
      'Air conditioning not cooling',
      'Engine overheating',
      'Strange vibration while driving',
      'Check engine light on'
    ]),
    diagnosis: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    estimatedCompletion: faker.date.soon({ days: 3 }),
    actualCompletion: faker.datatype.boolean() ? faker.date.recent({ days: 1 }) : undefined,
    laborTotal,
    partsTotal,
    taxTotal,
    total,
    notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    customerApproved: faker.datatype.boolean(),
    approvalDate: faker.datatype.boolean() ? faker.date.recent({ days: 2 }) : undefined
  }
}

export const generateServiceBay = (): ServiceBay => {
  const bayNumber = faker.number.int({ min: 1, max: 12 }).toString()
  const currentRepairOrder = faker.datatype.boolean({ probability: 0.6 }) ? generateRepairOrder() : undefined
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 365 }),
    updatedAt: faker.date.recent({ days: 1 }),
    number: bayNumber,
    name: 'Bay ${bayNumber}',
    status: currentRepairOrder 
      ? generateStatus<ServiceBayStatus>(['occupied'])
      : generateStatus<ServiceBayStatus>(['available', 'maintenance', 'out_of_service']),
    type: faker.helpers.arrayElement(['general', 'alignment', 'tire', 'diagnostic', 'detail', 'oil_change']),
    capacity: faker.helpers.arrayElement(['standard', 'heavy_duty', 'motorcycle']),
    currentRepairOrderId: currentRepairOrder?.id,
    currentRepairOrder,
    technicianId: currentRepairOrder ? generateId() : undefined,
    technician: currentRepairOrder ? {
      id: generateId(),
      name: faker.person.fullName()
    } : undefined,
    equipment: faker.helpers.arrayElements([
      'Hydraulic Lift', 'Air Compressor', 'Diagnostic Scanner', 'Wheel Balancer',
      'Brake Lathe', 'Tire Changer', 'Oil Drain', 'Compressed Air'
    ], { min: 2, max: 6 }),
    estimatedAvailableAt: currentRepairOrder 
      ? faker.date.soon({ days: 1 })
      : undefined,
    location: {
      zone: faker.helpers.arrayElement(['A', 'B', 'C']),
      position: faker.number.int({ min: 1, max: 4 })
    }
  }
}

export const generateAutoTechnician = (): AutoTechnician => {
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 365 }),
    updatedAt: faker.date.recent({ days: 7 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    avatar: faker.image.avatar(),
    active: faker.datatype.boolean({ probability: 0.9 }),
    specialties: faker.helpers.arrayElements([
      'Engine Repair', 'Transmission', 'Brakes', 'Electrical', 'Air Conditioning',
      'Suspension', 'Diagnostics', 'Tune-ups', 'Tire Service', 'Oil Changes'
    ], { min: 2, max: 5 }),
    certifications: faker.helpers.arrayElements([
      'ASE Certified', 'Manufacturer Certified', 'EPA 609', 'State Inspection License',
      'Hybrid/Electric Vehicle', 'Diesel Engine', 'Performance Tuning'
    ], { min: 1, max: 4 }),
    hourlyRate: faker.number.int({ min: 25, max: 65 }),
    currentServiceBayId: faker.datatype.boolean({ probability: 0.7 }) ? generateId() : undefined,
    performance: {
      avgRepairTime: faker.number.float({ min: 2.5, max: 8.0, fractionDigits: 1 }),
      qualityRating: faker.number.float({ min: 4.2, max: 5.0, fractionDigits: 1 }),
      completedRepairs: faker.number.int({ min: 450, max: 1200 }),
      customerRating: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 })
    },
    schedule: {
      shift: faker.helpers.arrayElement(['day', 'evening', 'night']),
      daysWorking: faker.helpers.arrayElements([
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ], { min: 4, max: 6 })
    }
  }
}

export const generateAutoPart = (): AutoPart => {
  const categories = ['engine', 'transmission', 'brakes', 'suspension', 'electrical', 'body', 'interior', 'tires', 'fluids', 'filters'] as const
  const category = faker.helpers.arrayElement(categories)
  
  const partNames = {
    engine: ['Engine Oil', 'Spark Plugs', 'Air Filter', 'Fuel Filter', 'Timing Belt'],
    transmission: ['Transmission Fluid', 'Clutch Kit', 'CV Joint', 'Transmission Filter'],
    brakes: ['Brake Pads', 'Brake Rotors', 'Brake Fluid', 'Brake Lines', 'Brake Calipers'],
    suspension: ['Shock Absorbers', 'Struts', 'Springs', 'Sway Bar Links', 'Control Arms'],
    electrical: ['Battery', 'Alternator', 'Starter', 'Ignition Coil', 'Fuses'],
    body: ['Headlight', 'Tail Light', 'Door Handle', 'Mirror', 'Bumper'],
    interior: ['Seat Covers', 'Floor Mats', 'Dashboard', 'Steering Wheel', 'Air Freshener'],
    tires: ['All-Season Tires', 'Winter Tires', 'Performance Tires', 'Tire Valve'],
    fluids: ['Coolant', 'Power Steering Fluid', 'Brake Fluid', 'Windshield Washer'],
    filters: ['Oil Filter', 'Air Filter', 'Cabin Filter', 'Fuel Filter']
  }
  
  const unitCost = generatePrice(5, 500)
  const markup = faker.number.float({ min: 1.2, max: 2.5 })
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 365 }),
    updatedAt: faker.date.recent({ days: 30 }),
    name: faker.helpers.arrayElement(partNames[category]),
    partNumber: faker.string.alphanumeric({ length: 12 }).toUpperCase(),
    category,
    brand: faker.helpers.arrayElement([
      'OEM', 'Bosch', 'ACDelco', 'Motorcraft', 'Genuine Toyota',
      'Honda Genuine', 'Mopar', 'BMW Original', 'Mercedes-Benz Genuine'
    ]),
    description: faker.lorem.sentence(),
    unitCost,
    retailPrice: unitCost * markup,
    currentStock: faker.number.int({ min: 0, max: 50 }),
    minStock: faker.number.int({ min: 2, max: 10 }),
    maxStock: faker.number.int({ min: 20, max: 100 }),
    supplier: faker.company.name(),
    location: faker.helpers.arrayElement([
      'A1-05', 'B2-12', 'C3-08', 'D1-15', 'E2-03', 'F1-21'
    ]),
    compatibility: faker.helpers.arrayElements([
      'Toyota Camry', 'Honda Civic', 'Ford F-150', 'Chevrolet Silverado',
      'BMW 3 Series', 'Mercedes-Benz C-Class', 'Universal'
    ], { min: 1, max: 4 }),
    lastOrdered: faker.datatype.boolean() ? faker.date.recent({ days: 30 }) : undefined,
    leadTime: faker.number.int({ min: 1, max: 14 }),
    weight: faker.datatype.boolean() ? faker.number.float({ min: 0.1, max: 50, fractionDigits: 1 }) : undefined,
    dimensions: faker.datatype.boolean() ? {
      length: faker.number.float({ min: 1, max: 36, fractionDigits: 1 }),
      width: faker.number.float({ min: 1, max: 24, fractionDigits: 1 }),
      height: faker.number.float({ min: 1, max: 18, fractionDigits: 1 })
    } : undefined
  }
}

export const generateEstimate = (): Estimate => {
  const vehicle = generateVehicle()
  const services = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => {
    const laborHours = faker.number.float({ min: 0.5, max: 6, fractionDigits: 1 })
    const laborRate = faker.number.int({ min: 80, max: 150 })
    const laborCost = laborHours * laborRate
    
    const parts = Array.from({ length: faker.number.int({ min: 0, max: 2 }) }, () => {
      const quantity = faker.number.int({ min: 1, max: 2 })
      const unitCost = generatePrice(15, 300)
      return {
        id: generateId(),
        name: faker.helpers.arrayElement([
          'Brake Pad Set', 'Oil Filter', 'Air Filter', 'Spark Plugs', 'Brake Rotor'
        ]),
        partNumber: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
        quantity,
        unitCost,
        totalCost: quantity * unitCost
      }
    })
    
    const partsCost = parts.reduce((sum, part) => sum + part.totalCost, 0)
    
    return {
      id: generateId(),
      name: faker.helpers.arrayElement([
        'Brake Service', 'Oil Change', 'Engine Tune-up', 'Transmission Service'
      ]),
      description: faker.lorem.sentence(),
      laborHours,
      laborRate,
      laborCost,
      parts,
      totalCost: laborCost + partsCost
    }
  })
  
  const laborTotal = services.reduce((sum, service) => sum + service.laborCost, 0)
  const partsTotal = services.reduce((sum, service) => 
    sum + service.parts.reduce((partSum, part) => partSum + part.totalCost, 0), 0
  )
  const taxTotal = (laborTotal + partsTotal) * 0.08
  const total = laborTotal + partsTotal + taxTotal
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 14 }),
    updatedAt: faker.date.recent({ days: 3 }),
    estimateNumber: 'EST-${new Date().getFullYear()}-${faker.number.int({ min: 1000, max: 9999 })}',
    vehicleId: vehicle.id,
    vehicle,
    customerId: vehicle.customerId,
    customer: vehicle.customer!,
    status: generateStatus(['draft', 'sent', 'approved', 'declined', 'expired']),
    validUntil: faker.date.soon({ days: 30 }),
    services,
    symptoms: faker.helpers.arrayElement([
      'Brakes making noise', 'Engine running rough', 'Need routine maintenance',
      'Check engine light on', 'Strange vibration'
    ]),
    recommendations: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    laborTotal,
    partsTotal,
    taxTotal,
    total,
    sentAt: faker.datatype.boolean() ? faker.date.recent({ days: 7 }) : undefined,
    approvedAt: faker.datatype.boolean() ? faker.date.recent({ days: 3 }) : undefined,
    declinedAt: faker.datatype.boolean() ? faker.date.recent({ days: 5 }) : undefined,
    notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined
  }
}

// Main data generator for dashboard
export function generateAutoServicesData() {
  const repairOrders = Array.from({ length: 15 }, () => generateRepairOrder())
  const serviceBays = Array.from({ length: 8 }, () => generateServiceBay())
  const vehicles = Array.from({ length: 25 }, () => generateVehicle())
  const parts = Array.from({ length: 50 }, () => generateAutoPart())
  const estimates = Array.from({ length: 10 }, () => generateEstimate())
  
  const activeRepairOrders = repairOrders.filter(ro => 
    ['assigned', 'in_progress', 'waiting_parts', 'waiting_approval'].includes(ro.status)
  ).length
  
  const availableBays = serviceBays.filter(bay => bay.status === 'available').length
  const completedToday = repairOrders.filter(ro => 
    ro.status === 'completed' && 
    ro.actualCompletion && 
    ro.actualCompletion.toDateString() === new Date().toDateString()
  ).length
  
  const dailyRevenue = repairOrders
    .filter(ro => 
      ro.status === 'completed' && 
      ro.actualCompletion && 
      ro.actualCompletion.toDateString() === new Date().toDateString()
    )
    .reduce((sum, ro) => sum + ro.total, 0)
  
  const avgRepairTime = repairOrders
    .filter(ro => ro.actualCompletion)
    .reduce((sum, ro, _, arr) => {
      if (ro.actualCompletion) {
        const hours = (ro.actualCompletion.getTime() - ro.createdAt.getTime()) / (1000 * 60 * 60)
        return sum + hours / arr.length
      }
      return sum
    }, 0)
  
  const pendingEstimates = estimates.filter(est => est.status === 'sent').length
  
  return {
    metrics: {
      dailyRevenue: Math.round(dailyRevenue * 100) / 100,
      activeRepairOrders,
      availableBays,
      completedToday,
      avgRepairTime: Math.round(avgRepairTime * 10) / 10,
      pendingEstimates,
    },
    repairOrders,
    serviceBays,
    vehicles,
    parts,
    estimates,
    recentActivity: [],
    upcomingAppointments: [],
  }
}
