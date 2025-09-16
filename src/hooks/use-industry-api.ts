'use client'

import { useAPI, useAPIMutation, usePaginatedAPI, useUserAPI } from './use-api'
import { useAppStore } from '@/lib/store'

// =============================================================================
// Industry-Specific Types
// =============================================================================

// Home Services Types
export interface WorkOrder {
  id: string
  customerId: string
  serviceType: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate: string
  completedDate?: string
  description: string
  technicianId?: string
  estimatedDuration: number
  actualDuration?: number
  totalCost: number
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  serviceHistory: WorkOrder[]
  totalSpent: number
  createdAt: string
}

// Restaurant Types
export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  ingredients: string[]
  allergens: string[]
  available: boolean
  preparationTime: number
  calories?: number
  imageUrl?: string
}

export interface Order {
  id: string
  tableNumber?: number
  customerName?: string
  items: Array<{
    menuItemId: string
    quantity: number
    customizations?: string[]
    price: number
  }>
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid'
  orderType: 'dine_in' | 'takeout' | 'delivery'
  totalAmount: number
  taxAmount: number
  tipAmount?: number
  createdAt: string
  estimatedReadyTime?: string
}

// Auto Services Types
export interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  mileage: number
  customerId: string
  licensePlate: string
  color: string
  engineType: string
  serviceHistory: RepairOrder[]
}

export interface RepairOrder {
  id: string
  vehicleId: string
  customerId: string
  services: Array<{
    serviceCode: string
    description: string
    laborHours: number
    parts: Array<{
      partNumber: string
      description: string
      quantity: number
      unitPrice: number
    }>
    totalCost: number
  }>
  status: 'estimate' | 'approved' | 'in_progress' | 'completed' | 'invoiced'
  createdDate: string
  completedDate?: string
  totalLabor: number
  totalParts: number
  totalCost: number
}

// Retail Types
export interface Product {
  id: string
  sku: string
  name: string
  description: string
  price: number
  costPrice: number
  category: string
  brand: string
  stockQuantity: number
  lowStockThreshold: number
  barcode?: string
  imageUrls: string[]
  attributes: Record<string, string>
  isActive: boolean
}

export interface SaleTransaction {
  id: string
  transactionDate: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    discount?: number
    totalPrice: number
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'digital'
  cashierId: string
  customerId?: string
}

// =============================================================================
// Home Services API Hooks
// =============================================================================

export function useHomeServicesAPI() {
  const industry = useAppStore(state => state.user?.preferences.industry)
  const enabled = industry === 'hs'

  // Work Orders
  const useWorkOrders = (page?: number, filters?: Record<string, unknown>) => {
    return usePaginatedAPI<WorkOrder>(
      enabled ? '/api/hs/work-orders' : null,
      page,
      20,
      { params: filters }
    )
  }

  const useWorkOrder = (workOrderId: string | null) => {
    return useAPI<WorkOrder>(
      enabled && workOrderId ? '/api/hs/work-orders/${workOrderId}' : null
    )
  }

  const useCreateWorkOrder = () => {
    return useAPIMutation<WorkOrder, Partial<WorkOrder>>(
      '/api/hs/work-orders',
      'POST',
      {
        relatedKeys: ['/api/hs/work-orders'],
        onSuccess: (data) => {
          console.log('Work order created:', data)
        }
      }
    )
  }

  const useUpdateWorkOrder = (workOrderId: string) => {
    return useAPIMutation<WorkOrder, Partial<WorkOrder>>(
      '/api/hs/work-orders/${workOrderId}',
      'PUT',
      {
        relatedKeys: ['/api/hs/work-orders', '/api/hs/work-orders/${workOrderId}']
      }
    )
  }

  // Customers
  const useCustomers = (page?: number, search?: string) => {
    return usePaginatedAPI<Customer>(
      enabled ? '/api/hs/customers' : null,
      page,
      20,
      { params: { search } }
    )
  }

  const useCustomer = (customerId: string | null) => {
    return useAPI<Customer>(
      enabled && customerId ? '/api/hs/customers/${customerId}' : null
    )
  }

  // Dashboard Data
  const useDashboardStats = () => {
    return useAPI<{
      totalWorkOrders: number
      completedToday: number
      revenue: number
      activeCustomers: number
      upcomingAppointments: WorkOrder[]
    }>(
      enabled ? '/api/hs/dashboard/stats' : null,
      { refreshInterval: 30000 } // Refresh every 30 seconds
    )
  }

  return {
    useWorkOrders,
    useWorkOrder,
    useCreateWorkOrder,
    useUpdateWorkOrder,
    useCustomers,
    useCustomer,
    useDashboardStats
  }
}

// =============================================================================
// Restaurant API Hooks
// =============================================================================

export function useRestaurantAPI() {
  const industry = useAppStore(state => state.user?.preferences.industry)
  const enabled = industry === 'rest'

  // Menu Management
  const useMenuItems = (category?: string) => {
    return useAPI<MenuItem[]>(
      enabled ? '/api/rest/menu-items' : null,
      { params: { category } }
    )
  }

  const useMenuItem = (itemId: string | null) => {
    return useAPI<MenuItem>(
      enabled && itemId ? '/api/rest/menu-items/${itemId}' : null
    )
  }

  const useCreateMenuItem = () => {
    return useAPIMutation<MenuItem, Partial<MenuItem>>(
      '/api/rest/menu-items',
      'POST',
      { relatedKeys: ['/api/rest/menu-items'] }
    )
  }

  // Orders
  const useOrders = (status?: string, orderType?: string) => {
    return useAPI<Order[]>(
      enabled ? '/api/rest/orders' : null,
      { 
        params: { status, orderType },
        refreshInterval: 5000 // Refresh every 5 seconds for real-time updates
      }
    )
  }

  const useCreateOrder = () => {
    return useAPIMutation<Order, Partial<Order>>(
      '/api/rest/orders',
      'POST',
      { relatedKeys: ['/api/rest/orders'] }
    )
  }

  const useUpdateOrderStatus = (orderId: string) => {
    return useAPIMutation<Order, { status: Order['status'] }>(
      '/api/rest/orders/${orderId}/status',
      'PATCH',
      { relatedKeys: ['/api/rest/orders'] }
    )
  }

  // Kitchen Display System
  const useKitchenOrders = () => {
    return useAPI<Order[]>(
      enabled ? '/api/rest/kitchen/orders' : null,
      { refreshInterval: 2000 } // Very frequent updates for kitchen
    )
  }

  return {
    useMenuItems,
    useMenuItem,
    useCreateMenuItem,
    useOrders,
    useCreateOrder,
    useUpdateOrderStatus,
    useKitchenOrders
  }
}

// =============================================================================
// Auto Services API Hooks
// =============================================================================

export function useAutoServicesAPI() {
  const industry = useAppStore(state => state.user?.preferences.industry)
  const enabled = industry === 'auto'

  // Vehicles
  const useVehicles = (customerId?: string) => {
    return useAPI<Vehicle[]>(
      enabled ? '/api/auto/vehicles` : null,
      { params: { customerId } }
    )
  }

  const useVehicle = (vehicleId: string | null) => {
    return useAPI<Vehicle>(
      enabled && vehicleId ? `/api/auto/vehicles/${vehicleId}' : null
    )
  }

  const useVehicleByVIN = (vin: string | null) => {
    return useAPI<Vehicle>(
      enabled && vin ? '/api/auto/vehicles/by-vin/${vin}' : null
    )
  }

  // Repair Orders
  const useRepairOrders = (page?: number, filters?: Record<string, unknown>) => {
    return usePaginatedAPI<RepairOrder>(
      enabled ? '/api/auto/repair-orders' : null,
      page,
      20,
      { params: filters }
    )
  }

  const useRepairOrder = (repairOrderId: string | null) => {
    return useAPI<RepairOrder>(
      enabled && repairOrderId ? '/api/auto/repair-orders/${repairOrderId}' : null
    )
  }

  const useCreateRepairOrder = () => {
    return useAPIMutation<RepairOrder, Partial<RepairOrder>>(
      '/api/auto/repair-orders',
      'POST',
      { relatedKeys: ['/api/auto/repair-orders'] }
    )
  }

  // Service Bays
  const useServiceBays = () => {
    return useAPI<Array<{
      id: string
      number: number
      isOccupied: boolean
      currentRepairOrderId?: string
      estimatedCompletion?: string
    }>>(
      enabled ? '/api/auto/service-bays' : null,
      { refreshInterval: 10000 } // Update every 10 seconds
    )
  }

  return {
    useVehicles,
    useVehicle,
    useVehicleByVIN,
    useRepairOrders,
    useRepairOrder,
    useCreateRepairOrder,
    useServiceBays
  }
}

// =============================================================================
// Retail API Hooks
// =============================================================================

export function useRetailAPI() {
  const industry = useAppStore(state => state.user?.preferences.industry)
  const enabled = industry === 'ret'

  // Products
  const useProducts = (page?: number, filters?: Record<string, unknown>) => {
    return usePaginatedAPI<Product>(
      enabled ? '/api/ret/products` : null,
      page,
      50,
      { params: filters }
    )
  }

  const useProduct = (productId: string | null) => {
    return useAPI<Product>(
      enabled && productId ? `/api/ret/products/${productId}' : null
    )
  }

  const useProductBySKU = (sku: string | null) => {
    return useAPI<Product>(
      enabled && sku ? '/api/ret/products/by-sku/${sku}' : null
    )
  }

  const useCreateProduct = () => {
    return useAPIMutation<Product, Partial<Product>>(
      '/api/ret/products',
      'POST',
      { relatedKeys: ['/api/ret/products'] }
    )
  }

  const useUpdateProduct = (productId: string) => {
    return useAPIMutation<Product, Partial<Product>>(
      '/api/ret/products/${productId}',
      'PUT',
      { relatedKeys: ['/api/ret/products', '/api/ret/products/${productId}'] }
    )
  }

  // Sales
  const useSales = (page?: number, dateRange?: { start: string; end: string }) => {
    return usePaginatedAPI<SaleTransaction>(
      enabled ? '/api/ret/sales' : null,
      page,
      50,
      { params: dateRange }
    )
  }

  const useCreateSale = () => {
    return useAPIMutation<SaleTransaction, Partial<SaleTransaction>>(
      '/api/ret/sales',
      'POST',
      { relatedKeys: ['/api/ret/sales', '/api/ret/inventory'] }
    )
  }

  // Inventory
  const useInventory = (lowStock?: boolean) => {
    return useAPI<Array<Product & { reorderLevel: number; reorderQuantity: number }>>(
      enabled ? '/api/ret/inventory' : null,
      { params: { lowStock } }
    )
  }

  const useUpdateStock = () => {
    return useAPIMutation<Product, { productId: string; quantity: number; type: 'add' | 'remove' | 'set' }>(
      '/api/ret/inventory/update-stock',
      'POST',
      { relatedKeys: ['/api/ret/inventory', '/api/ret/products'] }
    )
  }

  // POS System
  const usePOSSession = () => {
    return useUserAPI<{
      sessionId: string
      cashierId: string
      startTime: string
      startingCash: number
      currentCash: number
      totalSales: number
      transactionCount: number
    }>('/api/ret/pos/session')
  }

  return {
    useProducts,
    useProduct,
    useProductBySKU,
    useCreateProduct,
    useUpdateProduct,
    useSales,
    useCreateSale,
    useInventory,
    useUpdateStock,
    usePOSSession
  }
}

// =============================================================================
// Courses API Hooks
// =============================================================================

export function useCoursesAPI() {
  const industry = useAppStore(state => state.user?.preferences.industry)
  const enabled = industry === 'courses'

  const useCourses = (category?: string) => {
    return useAPI<Array<{
      id: string
      title: string
      description: string
      category: string
      difficulty: 'beginner' | 'intermediate' | 'advanced'
      duration: number
      enrolledStudents: number
      rating: number
      instructor: string
      thumbnailUrl: string
    }>>(
      enabled ? '/api/courses' : null,
      { params: { category } }
    )
  }

  const useCourse = (courseId: string | null) => {
    return useAPI<{
      id: string
      title: string
      description: string
      lessons: Array<{
        id: string
        title: string
        duration: number
        completed: boolean
        videoUrl: string
      }>
      progress: number
      enrolled: boolean
    }>(
      enabled && courseId ? '/api/courses/${courseId}' : null
    )
  }

  const useEnrollInCourse = () => {
    return useAPIMutation<{ success: boolean }, { courseId: string }>(
      '/api/courses/enroll',
      'POST',
      { relatedKeys: ['/api/courses'] }
    )
  }

  return {
    useCourses,
    useCourse,
    useEnrollInCourse
  }
}

// =============================================================================
// Cross-Industry Hooks
// =============================================================================

export function useAnalyticsAPI() {
  const useRevenueData = (period: '7d' | '30d' | '90d' | '1y') => {
    return useAPI<{
      totalRevenue: number
      previousPeriod: number
      percentageChange: number
      dailyData: Array<{
        date: string
        revenue: number
      }>
    }>('/api/analytics/revenue?period=${period}')
  }

  const useCustomerMetrics = () => {
    return useAPI<{
      totalCustomers: number
      newCustomers: number
      retentionRate: number
      averageOrderValue: number
    }>('/api/analytics/customers')
  }

  return {
    useRevenueData,
    useCustomerMetrics
  }
}

export function useNotificationsAPI() {
  const useNotifications = () => {
    return useUserAPI<Array<{
      id: string
      title: string
      message: string
      type: 'info' | 'success' | 'warning' | 'error'
      read: boolean
      createdAt: string
    }>>('/api/notifications')
  }

  const useMarkNotificationRead = () => {
    return useAPIMutation<{ success: boolean }, { notificationId: string }>(
      '/api/notifications/mark-read',
      'POST',
      { relatedKeys: ['/api/notifications'] }
    )
  }

  return {
    useNotifications,
    useMarkNotificationRead
  }
}