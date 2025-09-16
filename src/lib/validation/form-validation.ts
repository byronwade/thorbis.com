import { z } from 'zod'

// Generic form validation result type
export interface ValidationResult<T = any> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
  fieldErrors?: Record<string, string>
}

// Generic form validation function
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData
    }
  } catch (_error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      const fieldErrors: Record<string, string> = {}
      
      error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(issue.message)
        
        // Store first error for each field for simple display
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      })
      
      return {
        success: false,
        errors,
        fieldErrors
      }
    }
    
    return {
      success: false,
      errors: { root: ['Validation failed'] },
      fieldErrors: { root: 'Validation failed' }
    }
  }
}

// Field-level validation for real-time feedback
export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldPath: string,
  value: unknown,
  fullData?: Partial<T>
): { isValid: boolean; error?: string } {
  try {
    // For complex validations that require the full object
    if (fullData) {
      schema.parse({ ...fullData, [fieldPath]: value })
    } else {
      // Extract field schema for standalone validation
      const fieldSchema = extractFieldSchema(schema, fieldPath)
      if (fieldSchema) {
        fieldSchema.parse(value)
      }
    }
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const relevantIssue = error.issues.find(issue => 
        issue.path.join('.') === fieldPath
      )
      if (relevantIssue) {
        return { isValid: false, error: relevantIssue.message }
      }
    }
    return { isValid: false, error: 'Invalid value' }
  }
}

// Extract individual field schema from object schema
function extractFieldSchema(schema: z.ZodSchema<unknown>, fieldPath: string): z.ZodSchema<unknown> | null {
  try {
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape
      const pathParts = fieldPath.split('.')
      
      let currentSchema = shape[pathParts[0]]
      for (const i = 1; i < pathParts.length; i++) {
        if (currentSchema instanceof z.ZodObject) {
          currentSchema = currentSchema.shape[pathParts[i]]
        } else {
          return null
        }
      }
      
      return currentSchema
    }
  } catch {
    return null
  }
  return null
}

// Async validation for database-dependent validations
export async function validateFieldAsync<T>(
  validator: (value: T) => Promise<boolean>,
  value: T,
  errorMessage: string
): Promise<{ isValid: boolean; error?: string }> {
  try {
    const isValid = await validator(value)
    return { isValid, error: isValid ? undefined : errorMessage }
  } catch {
    return { isValid: false, error: 'Validation failed' }
  }
}

// Common field validators
export const commonValidators = {
  // Account code uniqueness
  accountCode: async (code: string, excludeId?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/accounts/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, excludeId })
      })
      
      if (!response.ok) {
        return false
      }
      
      const { isUnique } = await response.json()
      return isUnique
    } catch {
      return false
    }
  },

  // Invoice number uniqueness
  invoiceNumber: async (invoiceNumber: string, excludeId?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/invoices/validate-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceNumber, excludeId })
      })
      
      if (!response.ok) {
        return false
      }
      
      const { isUnique } = await response.json()
      return isUnique
    } catch {
      return false
    }
  },

  // Customer email uniqueness
  customerEmail: async (email: string, excludeId?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/customers/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, excludeId })
      })
      
      if (!response.ok) {
        return false
      }
      
      const { isUnique } = await response.json()
      return isUnique
    } catch {
      return false
    }
  }
}

// Validation error display utilities
export function getFieldError(
  errors: Record<string, string[]> | undefined,
  fieldPath: string
): string | undefined {
  return errors?.[fieldPath]?.[0]
}

export function hasFieldError(
  errors: Record<string, string[]> | undefined,
  fieldPath: string
): boolean {
  return Boolean(errors?.[fieldPath]?.length)
}

export function getErrorMessage(
  fieldErrors: Record<string, string> | undefined,
  fieldPath: string
): string | undefined {
  return fieldErrors?.[fieldPath]
}

// Form submission validation with loading state
export interface FormSubmissionState {
  isSubmitting: boolean
  isValid: boolean
  errors?: Record<string, string[]>
  fieldErrors?: Record<string, string>
}

export async function validateFormSubmission<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  data: unknown,
  submitHandler: (validData: TInput) => Promise<TOutput>
): Promise<{ success: boolean; result?: TOutput; errors?: ValidationResult['errors'] }> {
  const validation = validateForm(schema, data)
  
  if (!validation.success) {
    return {
      success: false,
      errors: validation.errors
    }
  }
  
  try {
    const result = await submitHandler(validation.data!)
    return {
      success: true,
      result
    }
  } catch (error) {
    return {
      success: false,
      errors: {
        submit: [error instanceof Error ? error.message : 'Submission failed']
      }
    }
  }
}

// Validation helpers for common patterns
export const validationHelpers = {
  // Format validation errors for display
  formatErrors: (errors: Record<string, string[]>): string[] => {
    return Object.values(errors).flat()
  },

  // Check if form has any errors
  hasErrors: (errors: Record<string, string[]> | undefined): boolean => {
    if (!errors) return false
    return Object.values(errors).some(fieldErrors => fieldErrors.length > 0)
  },

  // Get all error messages as a flat array
  getAllErrorMessages: (errors: Record<string, string[]> | undefined): string[] => {
    if (!errors) return []
    return Object.values(errors).flat()
  },

  // Create error object from single message
  createFieldError: (field: string, message: string): Record<string, string[]> => {
    return { [field]: [message] }
  }
}