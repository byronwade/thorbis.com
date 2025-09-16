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

export type ProductCategory = 'electronics' | 'clothing' | 'home' | 'books' | 'sports' | 'beauty' | 'toys' | 'automotive'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'mobile_pay' | 'gift_card' | 'store_credit'

export interface RetailProduct extends BaseEntity {
  name: string
  description: string
  sku: string
  barcode: string
  category: ProductCategory
  brand: string
  price: number
  costPrice: number
  compareAtPrice?: number
  images: string[]
  inStock: boolean
  stockQuantity: number
  minStock: number
  maxStock: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags: string[]
  variants?: Array<{
    id: string
    name: string
    options: Array<{
      name: string
      value: string
      price?: number
    }>
    stockQuantity: number
  }>
  supplier?: string
  location?: string
  popularity: number
  rating: number
  reviewCount: number
}

export interface RetailOrder extends BaseEntity {
  orderNumber: string
  customerId: string
  customer: Customer
  items: Array<{
    id: string
    productId: string
    product: RetailProduct
    quantity: number
    unitPrice: number
    totalPrice: number
    discount?: number
    variant?: string
  }>
  subtotal: number
  taxAmount: number
  discountAmount: number
  shippingAmount: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  shippingAddress?: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  notes?: string
  orderDate: Date
  shippedDate?: Date
  deliveredDate?: Date
  trackingNumber?: string
  refundAmount?: number
}

export interface RetailTransaction extends BaseEntity {
  transactionNumber: string
  customerId?: string
  customer?: Customer
  items: Array<{
    id: string
    productId: string
    product: RetailProduct
    quantity: number
    unitPrice: number
    totalPrice: number
    discount?: number
  }>
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  cashierId: string
  cashier: {
    id: string
    name: string
  }
  receiptNumber: string
  transactionDate: Date
  refundAmount?: number
  loyaltyPointsEarned?: number
  loyaltyPointsUsed?: number
}

export interface InventoryItem extends BaseEntity {
  productId: string
  product: RetailProduct
  currentStock: number
  reservedStock: number
  availableStock: number
  reorderLevel: number
  reorderQuantity: number
  location: string
  lastRestocked?: Date
  lastSold?: Date
  turnoverRate: number
  supplier?: string
  supplierSku?: string
  unitCost: number
  avgSoldPerDay: number
  daysOfStock: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked' | 'discontinued'
}

export interface LoyaltyCustomer extends Customer {
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  loyaltyPoints: number
  totalSpent: number
  orderCount: number
  averageOrderValue: number
  lastPurchase?: Date
  joinDate: Date
  preferredCategories: ProductCategory[]
  birthday?: Date
  communicationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

export interface Receipt extends BaseEntity {
  receiptNumber: string
  transactionId: string
  customerId?: string
  customer?: LoyaltyCustomer
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
    sku: string
  }>
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  paymentMethod: PaymentMethod
  cashTendered?: number
  changeAmount?: number
  cashier: string
  store: {
    name: string
    address: string
    phone: string
    email: string
  }
  timestamp: Date
  loyaltyPointsEarned?: number
  loyaltyPointsUsed?: number
  refundPolicy: string
}

// Generators
export const generateRetailProduct = (): RetailProduct => {
  const categories: ProductCategory[] = ['electronics', 'clothing', 'home', 'books', 'sports', 'beauty', 'toys', 'automotive']
  const category = faker.helpers.arrayElement(categories)
  
  const productNames = {
    electronics: ['Wireless Headphones', 'Smartphone', 'Laptop', 'Tablet', 'Smartwatch', 'Bluetooth Speaker', 'Camera', 'Gaming Console'],
    clothing: ['T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Sneakers', 'Sweater', 'Shorts', 'Hoodie'],
    home: ['Coffee Maker', 'Blender', 'Lamp', 'Pillow', 'Blanket', 'Candle', 'Plant Pot', 'Picture Frame'],
    books: ['Fiction Novel', 'Cookbook', 'Biography', 'Self-Help Book', 'Children\'s Book', 'Textbook', 'Magazine', 'Journal']
    sports: ['Running Shoes', 'Yoga Mat', 'Dumbbell Set', 'Tennis Racket', 'Basketball', 'Water Bottle', 'Fitness Tracker', 'Gym Bag'],
    beauty: ['Lipstick', 'Foundation', 'Shampoo', 'Perfume', 'Face Mask', 'Nail Polish', 'Hair Dryer', 'Moisturizer'],
    toys: ['Action Figure', 'Board Game', 'LEGO Set', 'Doll', 'Puzzle', 'Remote Control Car', 'Art Set', 'Educational Toy'],
    automotive: ['Car Phone Mount', 'Air Freshener', 'Seat Covers', 'Floor Mats', 'Car Charger', 'Cleaning Kit', 'Tire Gauge', 'Jump Starter']
  }
  
  const costPrice = generatePrice(5, 200)
  const markup = faker.number.float({ min: 1.5, max: 3.0 })
  const price = Math.round(costPrice * markup * 100) / 100
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 365 }),
    updatedAt: faker.date.recent({ days: 30 }),
    name: faker.helpers.arrayElement(productNames[category]),
    description: faker.lorem.sentence(),
    sku: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
    barcode: faker.string.numeric({ length: 12 }),
    category,
    brand: faker.company.name(),
    price,
    costPrice,
    compareAtPrice: faker.datatype.boolean() ? price * faker.number.float({ min: 1.1, max: 1.4 }) : undefined,
    images: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => faker.image.urlLoremFlickr({ category: category })),
    inStock: faker.datatype.boolean({ probability: 0.9 }),
    stockQuantity: faker.number.int({ min: 0, max: 100 }),
    minStock: faker.number.int({ min: 5, max: 20 }),
    maxStock: faker.number.int({ min: 50, max: 500 }),
    weight: faker.datatype.boolean() ? faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 }) : undefined,
    dimensions: faker.datatype.boolean() ? {
      length: faker.number.float({ min: 1, max: 50, fractionDigits: 1 }),
      width: faker.number.float({ min: 1, max: 30, fractionDigits: 1 }),
      height: faker.number.float({ min: 1, max: 20, fractionDigits: 1 })
    } : undefined,
    tags: faker.helpers.arrayElements([
      'new', 'bestseller', 'sale', 'featured', 'limited', 'eco-friendly', 'premium', 'budget'
    ], { min: 0, max: 3 }),
    variants: faker.datatype.boolean() ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      id: generateId(),
      name: faker.helpers.arrayElement(['Color', 'Size', 'Style']),
      options: Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () => ({
        name: faker.helpers.arrayElement(['Red', 'Blue', 'Small', 'Medium', 'Large']),
        value: faker.helpers.arrayElement(['red', 'blue', 'sm', 'md', 'lg']),
        price: faker.datatype.boolean() ? faker.number.float({ min: -10, max: 50 }) : undefined
      })),
      stockQuantity: faker.number.int({ min: 0, max: 50 })
    })) : undefined,
    supplier: faker.datatype.boolean() ? faker.company.name() : undefined,
    location: faker.helpers.arrayElement(['A1-12', 'B3-45', 'C2-78', 'D1-23', 'E4-56']),
    popularity: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
    rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    reviewCount: faker.number.int({ min: 0, max: 500 })
  }
}

export const generateRetailTransaction = (): RetailTransaction => {
  const products = Array.from({ length: 5 }, () => generateRetailProduct())
  const customer = faker.datatype.boolean({ probability: 0.7 }) ? generateCustomer() : undefined
  
  const items = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => {
    const product = faker.helpers.arrayElement(products)
    const quantity = faker.number.int({ min: 1, max: 3 })
    const unitPrice = product.price
    const discount = faker.datatype.boolean({ probability: 0.2 }) ? faker.number.float({ min: 0.05, max: 0.3 }) : 0
    const totalPrice = (unitPrice * quantity) * (1 - discount)
    
    return {
      id: generateId(),
      productId: product.id,
      product,
      quantity,
      unitPrice,
      totalPrice,
      discount: discount > 0 ? discount * unitPrice * quantity : undefined
    }
  })
  
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const discountAmount = items.reduce((sum, item) => sum + (item.discount || 0), 0)
  const taxAmount = subtotal * 0.08
  const total = subtotal + taxAmount
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 7 }),
    updatedAt: faker.date.recent({ days: 1 }),
    transactionNumber: 'TXN-${faker.string.numeric({ length: 8 })}',
    customerId: customer?.id,
    customer,
    items,
    subtotal,
    taxAmount,
    discountAmount,
    total,
    paymentMethod: faker.helpers.arrayElement(['cash', 'credit_card', 'debit_card', 'mobile_pay', 'gift_card']),
    paymentStatus: generateStatus(['completed', 'pending', 'failed`]),
    cashierId: generateId(),
    cashier: {
      id: generateId(),
      name: faker.person.fullName()
    },
    receiptNumber: `RCP-${faker.string.numeric({ length: 8 })}',
    transactionDate: faker.date.recent({ days: 1 }),
    refundAmount: faker.datatype.boolean({ probability: 0.05 }) ? faker.number.float({ min: 10, max: total }) : undefined,
    loyaltyPointsEarned: customer ? Math.floor(total / 10) : undefined,
    loyaltyPointsUsed: faker.datatype.boolean({ probability: 0.2 }) ? faker.number.int({ min: 50, max: 500 }) : undefined
  }
}

export const generateRetailOrder = (): RetailOrder => {
  const products = Array.from({ length: 5 }, () => generateRetailProduct())
  const customer = generateCustomer()
  
  const items = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => {
    const product = faker.helpers.arrayElement(products)
    const quantity = faker.number.int({ min: 1, max: 2 })
    const unitPrice = product.price
    const discount = faker.datatype.boolean({ probability: 0.3 }) ? faker.number.float({ min: 5, max: 25 }) : 0
    const totalPrice = (unitPrice * quantity) - discount
    
    return {
      id: generateId(),
      productId: product.id,
      product,
      quantity,
      unitPrice,
      totalPrice,
      discount: discount > 0 ? discount : undefined,
      variant: product.variants ? faker.helpers.arrayElement(product.variants).name : undefined
    }
  })
  
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const discountAmount = items.reduce((sum, item) => sum + (item.discount || 0), 0)
  const shippingAmount = subtotal > 50 ? 0 : 9.99
  const taxAmount = subtotal * 0.08
  const total = subtotal + taxAmount + shippingAmount
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 7 }),
    orderNumber: 'ORD-${faker.string.numeric({ length: 8 })}',
    customerId: customer.id,
    customer,
    items,
    subtotal,
    taxAmount,
    discountAmount,
    shippingAmount,
    total,
    status: generateStatus<OrderStatus>(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    paymentStatus: generateStatus<PaymentStatus>(['pending', 'completed', 'failed']),
    paymentMethod: faker.helpers.arrayElement(['credit_card', 'debit_card', 'mobile_pay']),
    shippingAddress: {
      name: customer.name,
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode(),
      country: 'US'
    },
    notes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : undefined,
    orderDate: faker.date.recent({ days: 30 }),
    shippedDate: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.recent({ days: 7 }) : undefined,
    deliveredDate: faker.datatype.boolean({ probability: 0.4 }) ? faker.date.recent({ days: 3 }) : undefined,
    trackingNumber: faker.datatype.boolean({ probability: 0.6 }) ? faker.string.alphanumeric({ length: 12 }).toUpperCase() : undefined,
    refundAmount: faker.datatype.boolean({ probability: 0.05 }) ? faker.number.float({ min: 20, max: total }) : undefined
  }
}

export const generateInventoryItem = (): InventoryItem => {
  const product = generateRetailProduct()
  const currentStock = faker.number.int({ min: 0, max: 200 })
  const reservedStock = faker.number.int({ min: 0, max: Math.floor(currentStock * 0.3) })
  const availableStock = currentStock - reservedStock
  const avgSoldPerDay = faker.number.float({ min: 0.5, max: 10, fractionDigits: 1 })
  const daysOfStock = currentStock > 0 ? Math.floor(currentStock / avgSoldPerDay) : 0
  
  let status: InventoryItem['status'] = 'in_stock'
  if (currentStock === 0) status = 'out_of_stock'
  else if (currentStock <= product.minStock) status = 'low_stock'
  else if (currentStock >= product.maxStock) status = 'overstocked'
  
  return {
    id: generateId(),
    createdAt: faker.date.recent({ days: 365 }),
    updatedAt: faker.date.recent({ days: 1 }),
    productId: product.id,
    product,
    currentStock,
    reservedStock,
    availableStock,
    reorderLevel: product.minStock,
    reorderQuantity: faker.number.int({ min: 50, max: 200 }),
    location: product.location || faker.helpers.arrayElement(['A1-12', 'B3-45', 'C2-78']),
    lastRestocked: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent({ days: 30 }) : undefined,
    lastSold: faker.datatype.boolean({ probability: 0.8 }) ? faker.date.recent({ days: 7 }) : undefined,
    turnoverRate: faker.number.float({ min: 0.1, max: 5.0, fractionDigits: 2 }),
    supplier: product.supplier,
    supplierSku: faker.datatype.boolean() ? faker.string.alphanumeric({ length: 10 }).toUpperCase() : undefined,
    unitCost: product.costPrice,
    avgSoldPerDay,
    daysOfStock,
    status
  }
}

export const generateLoyaltyCustomer = (): LoyaltyCustomer => {
  const baseCustomer = generateCustomer()
  const orderCount = faker.number.int({ min: 1, max: 50 })
  const totalSpent = faker.number.float({ min: 50, max: 5000 })
  const averageOrderValue = totalSpent / orderCount
  
  let loyaltyTier: LoyaltyCustomer['loyaltyTier'] = 'bronze'
  if (totalSpent > 2000) loyaltyTier = 'platinum'
  else if (totalSpent > 1000) loyaltyTier = 'gold'
  else if (totalSpent > 500) loyaltyTier = 'silver'
  
  return {
    ...baseCustomer,
    loyaltyTier,
    loyaltyPoints: faker.number.int({ min: 0, max: 2000 }),
    totalSpent,
    orderCount,
    averageOrderValue,
    lastPurchase: faker.datatype.boolean({ probability: 0.8 }) ? faker.date.recent({ days: 30 }) : undefined,
    joinDate: faker.date.past({ years: 3 }),
    preferredCategories: faker.helpers.arrayElements(['electronics', 'clothing', 'home', 'books', 'sports'] as ProductCategory[], { min: 1, max: 3 }),
    birthday: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.birthdate() : undefined,
    communicationPreferences: {
      email: faker.datatype.boolean({ probability: 0.8 }),
      sms: faker.datatype.boolean({ probability: 0.6 }),
      push: faker.datatype.boolean({ probability: 0.4 })
    }
  }
}

// Main data generator for dashboard
export function generateRetailData() {
  const products = Array.from({ length: 30 }, () => generateRetailProduct())
  const transactions = Array.from({ length: 20 }, () => generateRetailTransaction())
  const orders = Array.from({ length: 15 }, () => generateRetailOrder())
  const inventory = Array.from({ length: 25 }, () => generateInventoryItem())
  const customers = Array.from({ length: 15 }, () => generateLoyaltyCustomer())
  
  const dailySales = transactions
    .filter(txn => txn.transactionDate.toDateString() === new Date().toDateString())
    .reduce((sum, txn) => sum + txn.total, 0)
  
  const transactionsToday = transactions.filter(txn => 
    txn.transactionDate.toDateString() === new Date().toDateString()
  ).length
  
  const avgTransactionValue = transactionsToday > 0 ? dailySales / transactionsToday : 0
  const inventoryValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
  const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length
  const totalProducts = products.length
  const activeCustomers = customers.filter(c => c.lastPurchase && c.lastPurchase > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length
  
  // Find top selling product
  const productSales = products.map(product => ({
    product,
    salesCount: transactions.reduce((sum, txn) => 
      sum + txn.items.filter(item => item.productId === product.id).reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
  }))
  const topSellingProduct = productSales.reduce((best, current) => 
    current.salesCount > (best?.salesCount || 0) ? current : best
  )?.product?.name || 'Wireless Headphones'
  
  return {
    metrics: {
      dailySales: Math.round(dailySales * 100) / 100,
      transactionsToday,
      avgTransactionValue: Math.round(avgTransactionValue * 100) / 100,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      lowStockItems,
      totalProducts,
      activeCustomers,
      topSellingProduct
    },
    products,
    transactions,
    orders,
    inventory,
    customers,
    recentTransactions: transactions.slice(0, 10),
    topProducts: productSales.sort((a, b) => b.salesCount - a.salesCount).slice(0, 5),
    lowStockAlerts: inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').slice(0, 10)
  }
}
