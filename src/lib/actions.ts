// Server Actions for Thorbis Business OS
// Modern Next.js 15 patterns using 'use server' directive

'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { 
  ValidationError, 
  NotFoundError, 
  AuthenticationError,
  BaseError 
} from './error-handling'
import type { 
  HomeServices,
  Restaurant,
  AutoServices,
  Retail,
  FormFieldError 
} from '@/types/industry-schemas'

// =============================================================================
// Validation Schemas
// =============================================================================

const workOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceType: z.enum(['plumbing', 'electrical', 'hvac', 'appliance_repair', 'general_handyman', 'cleaning', 'landscaping', 'pest_control']),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  scheduledDate: z.string().datetime('Invalid date format'),
  estimatedDuration: z.number().min(15, 'Minimum 15 minutes required'),
  assignedTechnician: z.string().optional(),
})

const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.object({
    street1: z.string().min(1, 'Street address is required'),
    street2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(5, 'Postal code is required'),
    country: z.string().default('US'),
  }),
})

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['appetizers', 'entrees', 'desserts', 'beverages', 'specials']),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  preparationTime: z.number().min(1, 'Preparation time must be at least 1 minute'),
  allergens: z.array(z.enum(['gluten', 'dairy', 'nuts', 'shellfish', 'soy', 'eggs'])).default([]),
})

// =============================================================================
// Utility Functions
// =============================================================================

function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors: FormFieldError[] = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))
    throw new ValidationError('Validation failed', errors)
  }
  return result.data
}

async function getCurrentUser() {
  // In a real app, this would verify JWT token, check session, etc.
  // For now, return a mock user
  return {
    id: 'user123',
    email: 'user@example.com',
    role: 'admin' as const,
    tenantId: 'tenant123',
  }
}

async function checkPermission(action: string, resource: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AuthenticationError('Authentication required')
  }
  
  // Simple permission check - in production, use proper RBAC
  if (user.role !== 'admin' && action === 'delete') {
    throw new BaseError('Insufficient permissions', 'AUTHORIZATION_ERROR', 403)
  }
  
  return user
}

// =============================================================================
// Home Services Actions
// =============================================================================

export async function createWorkOrder(formData: FormData) {
  const user = await checkPermission('create', 'work-order')
  
  const data = {
    customerId: formData.get('customerId') as string,
    serviceType: formData.get('serviceType') as HomeServices.ServiceType,
    priority: formData.get('priority') as HomeServices.ServicePriority,
    description: formData.get('description') as string,
    scheduledDate: formData.get('scheduledDate') as string,
    estimatedDuration: parseInt(formData.get('estimatedDuration') as string),
    assignedTechnician: formData.get('assignedTechnician') as string || undefined,
  }

  const validatedData = validateSchema(workOrderSchema, data)

  try {
    // In production, this would save to database
    const workOrder: HomeServices.WorkOrder = {
      id: 'wo_${Date.now()}',
      createdAt: new Date(),
      updatedAt: new Date(),
      tenantId: user.tenantId,
      customerInfo: Record<string, unknown> as HomeServices.Customer, // Would fetch from DB
      serviceType: validatedData.serviceType,
      priority: validatedData.priority,
      status: 'scheduled',
      scheduledDate: new Date(validatedData.scheduledDate),
      assignedTechnician: validatedData.assignedTechnician ? {} as HomeServices.Technician : undefined,
      description: validatedData.description,
      estimatedDuration: validatedData.estimatedDuration,
      materials: [],
      laborCost: 0,
      materialCost: 0,
      totalCost: 0,
    }

    console.log('Created work order:', workOrder.id)

    // Revalidate relevant pages
    revalidatePath('/dashboards/home-services')
    revalidatePath('/dashboards/home-services/work-orders')
    revalidateTag('work-orders')

    return {
      success: true,
      data: workOrder,
      message: 'Work order created successfully',
    }
  } catch (error) {
    console.error('Error creating work order:', error)
    throw new BaseError('Failed to create work order', 'CREATE_ERROR', 500)
  }
}

export async function updateWorkOrderStatus(
  workOrderId: string, 
  status: HomeServices.WorkOrderStatus,
  notes?: string
) {
  const user = await checkPermission('update', 'work-order')

  if (!workOrderId) {
    throw new ValidationError('Work order ID is required', [
      { field: 'workOrderId', message: 'Work order ID is required', code: 'required` }
    ])
  }

  try {
    // In production, update in database
    console.log(`Updating work order ${workOrderId} to status: ${status}')
    
    if (notes) {
      console.log('Notes: ${notes}')
    }

    // Revalidate relevant pages
    revalidatePath('/dashboards/home-services/work-orders')
    revalidatePath('/dashboards/home-services/work-orders/${workOrderId}')
    revalidateTag('work-orders')

    return {
      success: true,
      message: 'Work order ${status === 'completed' ? 'completed' : 'updated'} successfully',
    }
  } catch (error) {
    console.error('Error updating work order:', error)
    throw new BaseError('Failed to update work order', 'UPDATE_ERROR', 500)
  }
}

// =============================================================================
// Customer Management Actions
// =============================================================================

export async function createCustomer(formData: FormData) {
  const user = await checkPermission('create', 'customer')

  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: {
      street1: formData.get('street1') as string,
      street2: formData.get('street2') as string || undefined,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: 'US',
    },
  }

  const validatedData = validateSchema(customerSchema, data)

  try {
    // In production, save to database with proper customer record
    const customer: HomeServices.Customer = {
      id: 'cust_${Date.now()}',
      createdAt: new Date(),
      updatedAt: new Date(),
      tenantId: user.tenantId,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      address: validatedData.address,
      serviceHistory: [],
      customerSince: new Date(),
    }

    console.log('Created customer:', customer.id)

    // Revalidate customer-related pages
    revalidatePath('/dashboards/customers')
    revalidateTag('customers')

    return {
      success: true,
      data: customer,
      message: 'Customer created successfully',
    }
  } catch (error) {
    console.error('Error creating customer:', error)
    throw new BaseError('Failed to create customer', 'CREATE_ERROR', 500)
  }
}

// =============================================================================
// Restaurant Actions
// =============================================================================

export async function createMenuItem(formData: FormData) {
  const user = await checkPermission('create', 'menu-item')

  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as Restaurant.MenuCategory,
    price: parseFloat(formData.get('price') as string),
    preparationTime: parseInt(formData.get('preparationTime') as string),
    allergens: formData.getAll('allergens') as Restaurant.Allergen[],
  }

  const validatedData = validateSchema(menuItemSchema, data)

  try {
    const menuItem: Restaurant.MenuItem = {
      id: 'menu_${Date.now()}',
      createdAt: new Date(),
      updatedAt: new Date(),
      tenantId: user.tenantId,
      name: validatedData.name,
      description: validatedData.description,
      category: validatedData.category,
      price: validatedData.price,
      isAvailable: true,
      allergens: validatedData.allergens,
      preparationTime: validatedData.preparationTime,
      ingredients: [],
    }

    console.log('Created menu item:', menuItem.id)

    // Revalidate menu-related pages
    revalidatePath('/dashboards/restaurant/menu')
    revalidateTag('menu-items')

    return {
      success: true,
      data: menuItem,
      message: 'Menu item created successfully',
    }
  } catch (error) {
    console.error('Error creating menu item:', error)
    throw new BaseError('Failed to create menu item', 'CREATE_ERROR', 500)
  }
}

export async function updateMenuItemAvailability(itemId: string, isAvailable: boolean) {
  const user = await checkPermission('update', 'menu-item')

  if (!itemId) {
    throw new ValidationError('Menu item ID is required', [
      { field: 'itemId', message: 'Menu item ID is required', code: 'required' }
    ])
  }

  try {
    console.log('Updating menu item ${itemId} availability to: ${isAvailable}')

    // Revalidate menu pages
    revalidatePath('/dashboards/restaurant/menu')
    revalidateTag('menu-items')

    return {
      success: true,
      message: 'Menu item ${isAvailable ? 'enabled' : 'disabled'} successfully',
    }
  } catch (error) {
    console.error('Error updating menu item:', error)
    throw new BaseError('Failed to update menu item', 'UPDATE_ERROR', 500)
  }
}

// =============================================================================
// Settings Actions
// =============================================================================

export async function updateUserProfile(formData: FormData) {
  const user = await checkPermission('update', 'profile')

  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    timezone: formData.get('timezone') as string,
  }

  // Basic validation
  if (!data.firstName || !data.lastName || !data.email) {
    throw new ValidationError('Required fields missing', [
      { field: 'firstName', message: 'First name is required', code: 'required' },
      { field: 'lastName', message: 'Last name is required', code: 'required' },
      { field: 'email', message: 'Email is required', code: 'required' },
    ])
  }

  try {
    console.log('Updating user profile:', user.id)

    // Revalidate profile-related pages
    revalidatePath('/dashboards/settings/general')
    revalidatePath('/dashboards/settings')
    revalidateTag('user-profile')

    return {
      success: true,
      message: 'Profile updated successfully',
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    throw new BaseError('Failed to update profile', 'UPDATE_ERROR', 500)
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const user = await checkPermission('update', 'password')

  if (!currentPassword || !newPassword) {
    throw new ValidationError('Password fields are required', [
      { field: 'currentPassword', message: 'Current password is required', code: 'required' },
      { field: 'newPassword', message: 'New password is required', code: 'required' },
    ])
  }

  if (newPassword.length < 8) {
    throw new ValidationError('Password too short', [
      { field: 'newPassword', message: 'Password must be at least 8 characters', code: 'min_length' }
    ])
  }

  try {
    // In production, verify current password and hash new password
    console.log('Changing password for user:', user.id)

    return {
      success: true,
      message: 'Password changed successfully',
    }
  } catch (error) {
    console.error('Error changing password:', error)
    throw new BaseError('Failed to change password', 'UPDATE_ERROR', 500)
  }
}

// =============================================================================
// Bulk Operations
// =============================================================================

export async function bulkDeleteRecords(recordIds: string[], recordType: string) {
  const user = await checkPermission('delete', recordType)

  if (!recordIds || recordIds.length === 0) {
    throw new ValidationError('No records selected', [
      { field: 'recordIds', message: 'At least one record must be selected', code: 'required' }
    ])
  }

  try {
    console.log('Bulk deleting ${recordIds.length} ${recordType} records')

    // Revalidate relevant pages based on record type
    const pathMap: Record<string, string[]> = {
      'work-orders': ['/dashboards/home-services', '/dashboards/home-services/work-orders'],
      'customers': ['/dashboards/customers'],
      'menu-items': ['/dashboards/restaurant/menu'],
      'invoices': ['/dashboards/invoices'],
    }

    const paths = pathMap[recordType] || []
    paths.forEach(path => revalidatePath(path))
    revalidateTag(recordType)

    return {
      success: true,
      message: '${recordIds.length} ${recordType.replace('-', ' ')} deleted successfully',
    }
  } catch (error) {
    console.error('Error in bulk delete:', error)
    throw new BaseError('Failed to delete records', 'DELETE_ERROR', 500)
  }
}

// =============================================================================
// Data Export Actions
// =============================================================================

export async function exportData(
  dataType: string, 
  format: 'csv' | 'xlsx' | 'json',
  dateRange?: { start: string; end: string }
) {
  const user = await checkPermission('read`, dataType)

  try {
    console.log(`Exporting ${dataType} as ${format}', dateRange ? 'from ${dateRange.start} to ${dateRange.end}' : ')

    // In production, generate actual export file
    const exportId = `export_${Date.now()}'
    
    // Return download URL (would be actual file URL in production)
    return {
      success: true,
      data: {
        exportId,
        downloadUrl: '/api/exports/${exportId}',
        format,
        generatedAt: new Date().toISOString(),
      },
      message: 'Export generated successfully',
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    throw new BaseError('Failed to generate export', 'EXPORT_ERROR', 500)
  }
}

// =============================================================================
// Navigation Actions
// =============================================================================

export async function redirectToIndustry(industry: string) {
  const user = await getCurrentUser()
  
  const industryRoutes: Record<string, string> = {
    'home-services': '/dashboards/home-services',
    'restaurant': '/dashboards/restaurant',
    'auto': '/dashboards/auto',
    'retail': '/dashboards/retail',
  }

  const route = industryRoutes[industry]
  if (!route) {
    throw new ValidationError('Invalid industry', [
      { field: 'industry', message: 'Invalid industry selected', code: 'invalid' }
    ])
  }

  redirect(route)
}