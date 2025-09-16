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

export type RestCheckStatus = 'open' | 'closed' | 'paid' | 'comped' | 'void'
export type RestOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
export type RestTableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning'

export interface RestMenuItem extends BaseEntity {
  name: string
  description: string
  category: 'appetizers' | 'entrees' | 'desserts' | 'beverages' | 'specials'
  price: number
  available: boolean
  ingredients?: string[]
  allergens?: string[]
  dietary?: ('vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free')[]
  image?: string
  prepTime: number // minutes
  calories?: number
}

export interface RestCheck extends BaseEntity {
  checkNumber: string
  customer?: Customer
  tableId: string
  serverId: string
  server: {
    id: string
    name: string
    avatar?: string
  }
  status: RestCheckStatus
  openedAt: Date
  closedAt?: Date
  guests: number
  items: Array<{
    id: string
    menuItemId: string
    menuItem: RestMenuItem
    quantity: number
    unitPrice: number
    modifications?: string[]
    notes?: string
    status: RestOrderStatus
    orderedAt: Date
    servedAt?: Date
  }>
  subtotal: number
  tax: number
  tip?: number
  total: number
  paymentMethod?: 'cash' | 'credit_card' | 'debit_card' | 'mobile_pay'
  splitBills?: Array<{
    id: string
    amount: number
    paymentMethod: string
    paidAt: Date
  }>
  notes?: string
}

export interface RestTable extends BaseEntity {
  number: string
  name?: string
  capacity: number
  status: RestTableStatus
  section: string
  serverId?: string
  server?: {
    id: string
    name: string
  }
  currentCheckId?: string
  reservationId?: string
  location: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface RestReservation extends BaseEntity {
  confirmationCode: string
  customer: Customer
  partySize: number
  requestedTime: Date
  actualTime?: Date
  status: 'confirmed' | 'seated' | 'cancelled' | 'no_show' | 'completed'
  tableId?: string
  specialRequests?: string
  notes?: string
  source: 'phone' | 'online' | 'walk_in' | 'app'
}

export interface RestServer extends BaseEntity {
  name: string
  email: string
  phone: string
  avatar?: string
  active: boolean
  sections: string[]
  shift: {
    start: string
    end: string
    days: string[]
  }
  performance: {
    avgCheckSize: number
    ordersPerHour: number
    customerRating: number
    salesTotal: number
  }
}

export interface RestKitchenTicket extends BaseEntity {
  ticketNumber: string
  checkId: string
  tableNumber: string
  items: Array<{
    id: string
    menuItemId: string
    name: string
    quantity: number
    modifications?: string[]
    notes?: string
    status: RestOrderStatus
    fireTime?: Date
    readyTime?: Date
  }>
  status: RestOrderStatus
  orderedAt: Date
  estimatedReadyTime?: Date
  priority: 'low' | 'normal' | 'high' | 'urgent'
  station: 'cold' | 'hot' | 'grill' | 'fryer' | 'dessert' | 'bar'
}

export interface RestInventoryItem extends BaseEntity {
  name: string
  category: 'protein' | 'produce' | 'dairy' | 'dry_goods' | 'beverages' | 'supplies'
  unit: 'lbs' | 'oz' | 'gallons' | 'pieces' | 'cases' | 'bottles'
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  vendor?: string
  lastOrderedAt?: Date
  expirationDate?: Date
  location: string
}

// Generators
export const generateRestMenuItem = (): RestMenuItem => {
  const categories = ['appetizers', 'entrees', 'desserts', 'beverages', 'specials'] as const
  const category = faker.helpers.arrayElement(categories)
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 7 }),
    name: generateMenuItemName(category),
    description: generateMenuItemDescription(category),
    category,
    price: generateMenuPrice(category),
    available: faker.datatype.boolean({ probability: 0.9 }),
    ingredients: faker.helpers.arrayElements([
      'chicken', 'beef', 'pork', 'fish', 'shrimp', 'pasta', 'rice', 'vegetables',
      'cheese', 'herbs', 'spices', 'sauce', 'bread', 'lettuce', 'tomato'
    ], { min: 3, max: 8 }),
    allergens: faker.helpers.arrayElements([
      'gluten', 'dairy', 'nuts', 'shellfish', 'eggs', 'soy'
    ], { min: 0, max: 3 }),
    dietary: faker.helpers.arrayElements([
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free'
    ], { min: 0, max: 2 }),
    image: faker.datatype.boolean() ? faker.image.url() : undefined,
    prepTime: faker.number.int({ min: 5, max: 45 }),
    calories: faker.number.int({ min: 200, max: 1200 })
  }
}

export const generateRestCheck = (): RestCheck => {
  const menuItems = Array.from({ length: 5 }, () => generateRestMenuItem())
  const server = {
    id: generateId(),
    name: faker.person.fullName(),
    avatar: faker.image.avatar()
  }
  
  const items = Array.from({ length: faker.number.int({ min: 1, max: 8 }) }, () => {
    const menuItem = faker.helpers.arrayElement(menuItems)
    const quantity = faker.number.int({ min: 1, max: 3 })
    return {
      id: generateId(),
      menuItemId: menuItem.id,
      menuItem,
      quantity,
      unitPrice: menuItem.price,
      modifications: faker.datatype.boolean({ probability: 0.3 }) 
        ? faker.helpers.arrayElements(['no onions', 'extra cheese', 'on the side', 'well done'], { min: 1, max: 2 })
        : undefined,
      notes: faker.datatype.boolean({ probability: 0.2 }) ? faker.lorem.sentence() : undefined,
      status: generateStatus<RestOrderStatus>(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']),
      orderedAt: faker.date.recent({ days: 1 }),
      servedAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent({ days: 1 }) : undefined
    }
  })
  
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const tax = subtotal * 0.0875 // 8.75% tax
  const tip = faker.datatype.boolean({ probability: 0.8 }) ? subtotal * faker.number.float({ min: 0.15, max: 0.25 }) : 0
  const total = subtotal + tax + tip
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 7 }),
    updatedAt: faker.date.recent({ days: 1 }),
    checkNumber: 'CHK-${faker.number.int({ min: 1000, max: 9999 })}',
    customer: faker.datatype.boolean({ probability: 0.3 }) ? generateCustomer() : undefined,
    tableId: generateId(),
    serverId: server.id,
    server,
    status: generateStatus<RestCheckStatus>(['open', 'closed', 'paid', 'comped', 'void']),
    openedAt: faker.date.recent({ days: 1 }),
    closedAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent({ days: 1 }) : undefined,
    guests: faker.number.int({ min: 1, max: 8 }),
    items,
    subtotal,
    tax,
    tip,
    total,
    paymentMethod: faker.datatype.boolean({ probability: 0.7 }) 
      ? faker.helpers.arrayElement(['cash', 'credit_card', 'debit_card', 'mobile_pay'])
      : undefined,
    notes: faker.datatype.boolean({ probability: 0.2 }) ? faker.lorem.sentence() : undefined
  }
}

export const generateRestTable = (): RestTable => {
  const sections = ['main dining', 'patio', 'bar', 'private room', 'counter']
  const section = faker.helpers.arrayElement(sections)
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 1 }),
    number: faker.number.int({ min: 1, max: 50 }).toString(),
    name: faker.datatype.boolean({ probability: 0.3 }) ? 'Table ${faker.number.int({ min: 1, max: 50 })}' : undefined,
    capacity: faker.helpers.weightedArrayElement([
      { value: 2, weight: 4 },
      { value: 4, weight: 3 },
      { value: 6, weight: 2 },
      { value: 8, weight: 1 }
    ]),
    status: generateStatus<RestTableStatus>(['available', 'occupied', 'reserved', 'cleaning']),
    section,
    serverId: faker.datatype.boolean({ probability: 0.7 }) ? generateId() : undefined,
    server: faker.datatype.boolean({ probability: 0.7 }) ? {
      id: generateId(),
      name: faker.person.fullName()
    } : undefined,
    currentCheckId: faker.datatype.boolean({ probability: 0.3 }) ? generateId() : undefined,
    reservationId: faker.datatype.boolean({ probability: 0.2 }) ? generateId() : undefined,
    location: {
      x: faker.number.int({ min: 0, max: 800 }),
      y: faker.number.int({ min: 0, max: 600 }),
      width: faker.number.int({ min: 60, max: 120 }),
      height: faker.number.int({ min: 60, max: 120 })
    }
  }
}

export const generateRestReservation = (): RestReservation => {
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 7 }),
    updatedAt: faker.date.recent({ days: 1 }),
    confirmationCode: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
    customer: generateCustomer(),
    partySize: faker.number.int({ min: 2, max: 12 }),
    requestedTime: faker.date.soon({ days: 7 }),
    actualTime: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.recent({ days: 1 }) : undefined,
    status: generateStatus(['confirmed', 'seated', 'cancelled', 'no_show', 'completed']),
    tableId: faker.datatype.boolean({ probability: 0.5 }) ? generateId() : undefined,
    specialRequests: faker.datatype.boolean({ probability: 0.3 }) 
      ? faker.helpers.arrayElement([
          'Window table please', 
          'High chair needed', 
          'Birthday celebration', 
          'Wheelchair accessible',
          'Quiet table preferred'
        ])
      : undefined,
    notes: faker.datatype.boolean({ probability: 0.2 }) ? faker.lorem.sentence() : undefined,
    source: faker.helpers.arrayElement(['phone', 'online', 'walk_in', 'app'])
  }
}

export const generateRestServer = (): RestServer => {
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 90 }),
    updatedAt: faker.date.recent({ days: 7 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    avatar: faker.image.avatar(),
    active: faker.datatype.boolean({ probability: 0.9 }),
    sections: faker.helpers.arrayElements(['main dining', 'patio', 'bar', 'private room'], { min: 1, max: 3 }),
    shift: {
      start: faker.helpers.arrayElement(['06:00', '10:00', '14:00', '18:00']),
      end: faker.helpers.arrayElement(['14:00', '18:00', '22:00', '02:00']),
      days: faker.helpers.arrayElements(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], { min: 3, max: 6 })
    },
    performance: {
      avgCheckSize: faker.number.float({ min: 35, max: 85, fractionDigits: 2 }),
      ordersPerHour: faker.number.float({ min: 2.5, max: 6.0, fractionDigits: 1 }),
      customerRating: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
      salesTotal: faker.number.float({ min: 15000, max: 45000, fractionDigits: 2 })
    }
  }
}

export const generateRestKitchenTicket = (): RestKitchenTicket => {
  const menuItems = Array.from({ length: 3 }, () => generateRestMenuItem())
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 1 }),
    updatedAt: faker.date.recent({ days: 1 }),
    ticketNumber: 'TKT-${faker.number.int({ min: 100, max: 999 })}',
    checkId: generateId(),
    tableNumber: faker.number.int({ min: 1, max: 50 }).toString(),
    items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => {
      const menuItem = faker.helpers.arrayElement(menuItems)
      return {
        id: generateId(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: faker.number.int({ min: 1, max: 3 }),
        modifications: faker.datatype.boolean({ probability: 0.3 })
          ? faker.helpers.arrayElements(['no onions', 'extra cheese', 'medium rare', 'on the side'], { min: 1, max: 2 })
          : undefined,
        notes: faker.datatype.boolean({ probability: 0.2 }) ? faker.lorem.sentence() : undefined,
        status: generateStatus<RestOrderStatus>(['pending', 'confirmed', 'preparing', 'ready', 'served']),
        fireTime: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent({ days: 1 }) : undefined,
        readyTime: faker.datatype.boolean({ probability: 0.4 }) ? faker.date.recent({ days: 1 }) : undefined
      }
    }),
    status: generateStatus<RestOrderStatus>(['pending', 'confirmed', 'preparing', 'ready', 'served']),
    orderedAt: faker.date.recent({ days: 1 }),
    estimatedReadyTime: faker.date.soon({ days: 1 }),
    priority: faker.helpers.weightedArrayElement([
      { value: 'normal', weight: 6 },
      { value: 'high', weight: 2 },
      { value: 'urgent', weight: 1 },
      { value: 'low', weight: 1 }
    ]),
    station: faker.helpers.arrayElement(['cold', 'hot', 'grill', 'fryer', 'dessert', 'bar'])
  }
}

export const generateRestInventoryItem = (): RestInventoryItem => {
  const categories = ['protein', 'produce', 'dairy', 'dry_goods', 'beverages', 'supplies'] as const
  const category = faker.helpers.arrayElement(categories)
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 7 }),
    name: generateInventoryItemName(category),
    category,
    unit: getUnitForCategory(category),
    currentStock: faker.number.int({ min: 0, max: 100 }),
    minStock: faker.number.int({ min: 5, max: 20 }),
    maxStock: faker.number.int({ min: 50, max: 200 }),
    unitCost: generatePrice(0.50, 50),
    vendor: faker.datatype.boolean({ probability: 0.8 }) ? faker.company.name() : undefined,
    lastOrderedAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent({ days: 7 }) : undefined,
    expirationDate: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.soon({ days: 30 }) : undefined,
    location: faker.helpers.arrayElement(['walk-in cooler', 'dry storage', 'freezer', 'bar', 'prep area'])
  }
}

// Helper functions
const generateMenuItemName = (category: RestMenuItem['category']): string => {
  const names = {
    appetizers: ['Buffalo Wings', 'Calamari Rings', 'Spinach Dip', 'Bruschetta', 'Mozzarella Sticks'],
    entrees: ['Grilled Salmon', 'Ribeye Steak', 'Chicken Parmesan', 'Pasta Alfredo', 'Fish Tacos'],
    desserts: ['Chocolate Cake', 'Tiramisu', 'Ice Cream Sundae', 'Cheesecake', 'Crème Brûlée'],
    beverages: ['House Wine', 'Craft Beer', 'Fresh Juice', 'Coffee', 'Iced Tea'],
    specials: ["Chef's Special", 'Seasonal Catch', 'Market Soup', 'Daily Pasta', 'Featured Cocktail']'
  }
  
  return faker.helpers.arrayElement(names[category])
}

const generateMenuItemDescription = (category: RestMenuItem['category']): string => {
  const descriptions = {
    appetizers: [
      'Crispy wings tossed in our signature buffalo sauce',
      'Fresh calamari rings served with marinara sauce',
      'Creamy spinach and artichoke dip with tortilla chips',
      'Toasted baguette topped with fresh tomato and basil'
    ],
    entrees: [
      'Fresh Atlantic salmon grilled to perfection with lemon',
      'Premium ribeye steak cooked to your liking',
      'Breaded chicken breast with marinara and mozzarella',
      'Creamy pasta with our house-made alfredo sauce'
    ],
    desserts: [
      'Rich chocolate cake with vanilla ice cream',
      'Traditional Italian tiramisu with espresso',
      'Vanilla ice cream with your choice of toppings',
      'New York style cheesecake with berry compote'
    ],
    beverages: [
      'Selection of red and white wines by the glass',
      'Local craft beer on tap',
      'Fresh squeezed orange juice',
      'Premium roasted coffee blend'
    ],
    specials: [
      "Today's featured creation by our executive chef",'
      'Fresh catch of the day prepared your way',
      'Seasonal soup made with local ingredients',
      'House-made pasta with seasonal vegetables'
    ]
  }
  
  return faker.helpers.arrayElement(descriptions[category])
}

const generateMenuPrice = (category: RestMenuItem['category']): number => {
  const priceRanges = {
    appetizers: { min: 8, max: 18 },
    entrees: { min: 16, max: 45 },
    desserts: { min: 6, max: 12 },
    beverages: { min: 3, max: 15 },
    specials: { min: 20, max: 55 }
  }
  
  const range = priceRanges[category]
  return parseFloat(faker.commerce.price({ min: range.min, max: range.max }))
}

const generateInventoryItemName = (category: RestInventoryItem['category']): string => {
  const names = {
    protein: ['Chicken Breast', 'Ground Beef', 'Salmon Fillet', 'Shrimp', 'Pork Tenderloin'],
    produce: ['Lettuce', 'Tomatoes', 'Onions', 'Bell Peppers', 'Mushrooms'],
    dairy: ['Milk', 'Eggs', 'Butter', 'Cheese', 'Heavy Cream'],
    dry_goods: ['Flour', 'Rice', 'Pasta', 'Olive Oil', 'Salt'],
    beverages: ['Soda', 'Beer', 'Wine', 'Juice', 'Coffee'],
    supplies: ['Napkins', 'Plates', 'Cups', 'Utensils', 'Cleaning Supplies']
  }
  
  return faker.helpers.arrayElement(names[category])
}

const getUnitForCategory = (category: RestInventoryItem['category']): RestInventoryItem['unit'] => {
  const units = {
    protein: ['lbs', 'pieces'],
    produce: ['lbs', 'pieces'],
    dairy: ['gallons', 'lbs', 'pieces'],
    dry_goods: ['lbs', 'cases'],
    beverages: ['bottles', 'cases', 'gallons'],
    supplies: ['pieces', 'cases']
  }
  
  return faker.helpers.arrayElement(units[category]) as RestInventoryItem['unit']
}

// Simple data generators for API routes
export function generateRestaurantData(count = 50) {
  return Array.from({ length: count }, () => generateRestCheck())
}

export function generateRestaurantChecks(count = 20) {
  const checks = []
  
  for (let i = 0; i < count; i++) {
    const items = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => {
      const price = parseFloat(faker.commerce.price({ min: 8, max: 35 }))
      const quantity = faker.number.int({ min: 1, max: 3 })
      return {
        id: faker.string.uuid(),
        name: faker.helpers.arrayElement([
          'Margherita Pizza', 'Caesar Salad', 'Grilled Salmon', 'Chicken Alfredo', 
          'Ribeye Steak', 'Fish Tacos', 'Mushroom Risotto', 'BBQ Ribs',
          'Shrimp Scampi', 'Vegetable Pasta', 'House Burger', 'Lobster Roll'
        ]),
        quantity,
        price,
        modifications: faker.datatype.boolean() 
          ? [faker.helpers.arrayElement(['No onions', 'Extra cheese', 'Medium rare', 'On the side'])]
          : undefined
      }
    })
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.08
    const tip = faker.datatype.boolean() ? subtotal * faker.number.float({ min: 0.15, max: 0.25 }) : undefined
    const total = subtotal + tax + (tip || 0)
    
    checks.push({
      id: faker.string.uuid(),
      checkNumber: faker.number.int({ min: 1000, max: 9999 }),
      tableNumber: faker.number.int({ min: 1, max: 50 }).toString(),
      server: faker.person.fullName(),
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      tip: tip ? Math.round(tip * 100) / 100 : undefined,
      total: Math.round(total * 100) / 100,
      status: faker.helpers.arrayElement(['open', 'closed', 'paid', 'comped']),
      paymentMethod: faker.datatype.boolean() 
        ? faker.helpers.arrayElement(['Credit Card', 'Cash', 'Debit Card', 'Mobile Pay'])
        : undefined,
      openedAt: faker.date.recent({ days: 3 }),
      closedAt: faker.datatype.boolean() ? faker.date.recent({ days: 2 }) : undefined,
      customerCount: faker.number.int({ min: 1, max: 8 }),
    })
  }
  
  return checks
}

export function generateRestaurantMenuItems(count = 30) {
  const categories = ['Appetizers', 'Salads', 'Pizza', 'Pasta', 'Entrees', 'Desserts', 'Beverages']
  const menuItems = []
  
  const itemsByCategory: Record<string, string[]> = {
    'Appetizers': ['Bruschetta', 'Mozzarella Sticks', 'Calamari', 'Wings', 'Nachos'],
    'Salads': ['Caesar Salad', 'Garden Salad', 'Greek Salad', 'Spinach Salad', 'Cobb Salad'],
    'Pizza': ['Margherita', 'Pepperoni', 'Supreme', 'Hawaiian', 'Meat Lovers', 'Vegetarian'],
    'Pasta': ['Spaghetti Carbonara', 'Chicken Alfredo', 'Penne Arrabbiata', 'Lasagna', 'Ravioli'],
    'Entrees': ['Grilled Salmon', 'Ribeye Steak', 'Chicken Parmesan', 'Pork Chops', 'Fish & Chips'],
    'Desserts': ['Tiramisu', 'Cheesecake', 'Chocolate Cake', 'Ice Cream', 'Cannoli'],
    'Beverages': ['Coffee', 'Tea', 'Soda', 'House Wine', 'Beer', 'Cocktails']
  }
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(categories)
    const items = itemsByCategory[category]
    const name = faker.helpers.arrayElement(items)
    
    let price = 0
    switch (category) {
      case 'Appetizers': price = parseFloat(faker.commerce.price({ min: 8, max: 16 })); break
      case 'Salads': price = parseFloat(faker.commerce.price({ min: 12, max: 18 })); break
      case 'Pizza': price = parseFloat(faker.commerce.price({ min: 14, max: 24 })); break
      case 'Pasta': price = parseFloat(faker.commerce.price({ min: 16, max: 26 })); break
      case 'Entrees': price = parseFloat(faker.commerce.price({ min: 20, max: 38 })); break
      case 'Desserts': price = parseFloat(faker.commerce.price({ min: 6, max: 12 })); break
      case 'Beverages': price = parseFloat(faker.commerce.price({ min: 3, max: 15 })); break
    }
    
    menuItems.push({
      id: faker.string.uuid(),
      name,
      description: faker.lorem.sentence(),
      price,
      category,
      available: faker.datatype.boolean(0.9), // 90% chance available
      popular: faker.datatype.boolean(0.3), // 30% chance popular
      dietary: faker.helpers.arrayElements(['vegetarian', 'vegan', 'gluten-free', 'dairy-free'], 
                                           faker.number.int({ min: 0, max: 2 })),
      cookTime: faker.number.int({ min: 5, max: 30 }),
      allergens: faker.helpers.arrayElements(['gluten', 'dairy', 'nuts', 'shellfish', 'eggs'], 
                                             faker.number.int({ min: 0, max: 3 })),
      soldToday: faker.number.int({ min: 0, max: 50 }),
      revenue: parseFloat(faker.commerce.price({ min: 0, max: 500 })),
    })
  }
  
  return menuItems
}

export function generateMenuCategories() {
  return [
    { id: '1', name: 'Appetizers', description: 'Start your meal right', sortOrder: 1, active: true, itemCount: 8 },
    { id: '2', name: 'Salads', description: 'Fresh and healthy options', sortOrder: 2, active: true, itemCount: 6 },
    { id: '3', name: 'Pizza', description: 'Wood-fired pizzas', sortOrder: 3, active: true, itemCount: 12 },
    { id: '4', name: 'Pasta', description: 'Italian classics', sortOrder: 4, active: true, itemCount: 10 },
    { id: '5', name: 'Entrees', description: 'Main courses', sortOrder: 5, active: true, itemCount: 15 },
    { id: '6', name: 'Desserts', description: 'Sweet endings', sortOrder: 6, active: true, itemCount: 7 },
    { id: '7', name: 'Beverages', description: 'Drinks and cocktails', sortOrder: 7, active: true, itemCount: 20 },
  ]
}
