import { faker } from '@faker-js/faker'

// Base interfaces for common entities across industries
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface Customer extends BaseEntity {
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  notes?: string
}

export interface Business extends BaseEntity {
  name: string
  description: string
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  website?: string
  logo?: string
  trustBadges: {
    licensed: boolean
    insured: boolean
    verified: boolean
    backgroundChecked: boolean
  }
  metrics: {
    totalJobs: number
    completionRate: number
    avgResponseTime: string
    customerSatisfaction: number
  }
}

export interface User extends BaseEntity {
  name: string
  email: string
  role: 'owner' | 'admin' | 'employee' | 'technician' | 'server' | 'mechanic'
  avatar?: string
  active: boolean
}

// Shared generator functions
export const generateId = (): string => faker.string.uuid()

export const generateCustomer = (): Customer => ({
  id: generateId(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  address: {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode()
  },
  notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined
})

export const generateBusiness = (industry: Business['industry']): Business => ({
  id: generateId(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  name: faker.company.name(),
  description: faker.company.catchPhrase(),
  industry,
  email: faker.internet.email(),
  phone: faker.phone.number(),
  address: {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode()
  },
  website: faker.internet.url(),
  logo: faker.image.avatar(),
  trustBadges: {
    licensed: faker.datatype.boolean({ probability: 0.8 }),
    insured: faker.datatype.boolean({ probability: 0.9 }),
    verified: faker.datatype.boolean({ probability: 0.85 }),
    backgroundChecked: faker.datatype.boolean({ probability: 0.7 })
  },
  metrics: {
    totalJobs: faker.number.int({ min: 50, max: 2000 }),
    completionRate: faker.number.float({ min: 85, max: 100, fractionDigits: 1 }),
    avgResponseTime: '${faker.number.int({ min: 15, max: 60 })} min',
    customerSatisfaction: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 })
  }
})

export const generateUser = (): User => ({
  id: generateId(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(['owner', 'admin', 'employee', 'technician', 'server', 'mechanic']),
  avatar: faker.image.avatar(),
  active: faker.datatype.boolean({ probability: 0.9 })
})

// Utility functions
export const generateArray = <T>(generator: () => T, count: number): T[] => 
  Array.from({ length: count }, generator)

export const generateDateRange = (days: number = 30) => ({
  start: faker.date.recent({ days }),
  end: faker.date.soon({ days: days / 2 })
})

export const generatePrice = (min: number = 50, max: number = 1000): number =>
  parseFloat(faker.commerce.price({ min, max }))

export const generateStatus = <T extends string>(statuses: T[]): T =>
  faker.helpers.arrayElement(statuses)

export const generatePriority = (): 'low' | 'medium' | 'high' | 'urgent' =>
  faker.helpers.weightedArrayElement([
    { value: 'low', weight: 3 },
    { value: 'medium', weight: 5 }, 
    { value: 'high', weight: 2 },
    { value: 'urgent', weight: 1 }
  ])

// Industry-specific data will be in separate files
export * from './home-services'
export * from './restaurant'
export * from './auto-services'
export * from './retail'
