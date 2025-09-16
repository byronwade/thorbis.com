'use client'

import React, { forwardRef, useId, useState, useEffect, useCallback } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useKeyboardNavigation, generateAriaProps, useScreenReaderAnnouncement } from '@/lib/accessibility'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info } from 'lucide-react'
import { AccessibleButton } from './accessible-button'

// =============================================================================
// Form Variants and Styles
// =============================================================================

const formVariants = cva([
  'space-y-6',
  'p-6',
  'rounded-lg',
  'border',
  'bg-background',
], {
  variants: {
    variant: {
      default: 'border-neutral-700 bg-neutral-900/30',
      card: 'border-neutral-700 bg-neutral-900/50 shadow-lg',
      inline: 'border-transparent bg-transparent p-0',
      bordered: 'border-neutral-600 bg-neutral-900/60',
    },
    size: {
      sm: 'p-4 space-y-4',
      default: 'p-6 space-y-6',
      lg: 'p-8 space-y-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

const fieldVariants = cva([
  'w-full',
  'px-3',
  'py-2',
  'rounded-md',
  'border',
  'bg-background',
  'text-foreground',
  'transition-all',
  'duration-200',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-blue-500',
  'focus:border-transparent',
  'disabled:opacity-50',
  'disabled:cursor-not-allowed',
], {
  variants: {
    size: {
      sm: 'px-2 py-1 text-sm',
      default: 'px-3 py-2',
      lg: 'px-4 py-3 text-lg',
    },
    state: {
      default: 'border-neutral-700 hover:border-neutral-600',
      error: 'border-red-500 focus:ring-red-500',
      success: 'border-green-500 focus:ring-green-500',
      warning: 'border-yellow-500 focus:ring-yellow-500',
    },
  },
  defaultVariants: {
    size: 'default',
    state: 'default',
  },
})

// =============================================================================
// Form Context
// =============================================================================

interface FormContextType {
  formId: string
  errors: Record<string, string>
  touched: Record<string, boolean>
  setFieldError: (field: string, error: string | null) => void
  setFieldTouched: (field: string, touched: boolean) => void
  validateField: (field: string, value: unknown) => Promise<string | null>
}

const FormContext = React.createContext<FormContextType | null>(null)

export function useFormContext() {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error('Form components must be used within an AccessibleForm')
  }
  return context
}

// =============================================================================
// Main Form Component
// =============================================================================

export interface AccessibleFormProps
  extends React.FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof formVariants> {
  /**
   * Form submission handler
   */
  onSubmit: (data: FormData) => void | Promise<void>
  
  /**
   * Validation schema or function
   */
  validate?: (data: FormData) => Record<string, string> | Promise<Record<string, string>>
  
  /**
   * Form title for accessibility
   */
  title?: string
  
  /**
   * Form description for accessibility
   */
  description?: string
  
  /**
   * Whether form is currently submitting
   */
  isSubmitting?: boolean
  
  /**
   * Success message after submission
   */
  successMessage?: string
  
  /**
   * General error message
   */
  errorMessage?: string
  
  /**
   * Auto-focus first field on mount
   */
  autoFocusFirst?: boolean
  
  /**
   * Enable live validation
   */
  liveValidation?: boolean
}

export const AccessibleForm = forwardRef<HTMLFormElement, AccessibleFormProps>(
  ({
    className,
    variant,
    size,
    onSubmit,
    validate,
    title,
    description,
    isSubmitting = false,
    successMessage,
    errorMessage,
    autoFocusFirst = true,
    liveValidation = true,
    children,
    ...props
  }, ref) => {
    const formId = useId()
    const containerRef = React.useRef<HTMLFormElement>(null)
    const announce = useScreenReaderAnnouncement()
    
    // Form state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [isValidating, setIsValidating] = useState(false)
    
    // Combine refs
    const formRef = React.useCallback((node: HTMLFormElement) => {
      if (containerRef.current) {
        containerRef.current = node
      }
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }, [ref])
    
    // Keyboard navigation
    useKeyboardNavigation(containerRef, {
      focusableSelector: 'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])',
      trapFocus: false,
      wrap: true,
    })
    
    // Auto-focus first field
    useEffect(() => {
      if (autoFocusFirst && containerRef.current) {
        const firstInput = containerRef.current.querySelector(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
        ) as HTMLElement
        
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 100)
        }
      }
    }, [autoFocusFirst])
    
    // Form validation
    const validateForm = useCallback(async (formData: FormData): Promise<Record<string, string>> => {
      if (!validate) return {}
      
      setIsValidating(true)
      try {
        const result = await validate(formData)
        return result || {}
      } catch (error) {
        console.error('Form validation error:', error)
        return { _form: 'Validation failed. Please try again.' }
      } finally {
        setIsValidating(false)
      }
    }, [validate])
    
    // Field error management
    const setFieldError = useCallback((field: string, error: string | null) => {
      setErrors(prev => {
        const newErrors = { ...prev }
        if (error) {
          newErrors[field] = error
        } else {
          delete newErrors[field]
        }
        return newErrors
      })
    }, [])
    
    const setFieldTouched = useCallback((field: string, touched: boolean) => {
      setTouched(prev => ({ ...prev, [field]: touched }))
    }, [])
    
    const validateField = useCallback(async (field: string, value: unknown): Promise<string | null> => {
      if (!validate || !liveValidation) return null
      
      const formData = new FormData()
      formData.set(field, value)
      
      try {
        const errors = await validate(formData)
        return errors[field] || null
      } catch {
        return null
      }
    }, [validate, liveValidation])
    
    // Form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      
      if (isSubmitting) return
      
      const formData = new FormData(event.currentTarget)
      
      // Validate form
      const validationErrors = await validateForm(formData)
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        
        // Announce validation errors
        const errorCount = Object.keys(validationErrors).length
        announce(
          'Form has ${errorCount} validation error${errorCount === 1 ? ' : 's'}. Please fix and try again.',
          'assertive'
        )
        
        // Focus first error field
        const firstErrorField = Object.keys(validationErrors)[0]
        if (firstErrorField && firstErrorField !== '_form') {
          const fieldElement = containerRef.current?.querySelector('[name="${firstErrorField}"]') as HTMLElement
          fieldElement?.focus()
        }
        
        return
      }
      
      // Clear errors and submit
      setErrors({})
      
      try {
        await onSubmit(formData)
        
        if (successMessage) {
          announce(successMessage, 'polite')
        }
      } catch (error) {
        console.error('Form submission error:', error)
        setErrors({ _form: errorMessage || 'An error occurred. Please try again.' })
        announce('Form submission failed. Please try again.', 'assertive`)
      }
    }
    
    // Context value
    const contextValue: FormContextType = {
      formId,
      errors,
      touched,
      setFieldError,
      setFieldTouched,
      validateField,
    }
    
    return (
      <FormContext.Provider value={contextValue}>
        <form
          ref={formRef}
          id={formId}
          className={cn(formVariants({ variant, size }), className)}
          onSubmit={handleSubmit}
          noValidate
          aria-label={title}
          aria-describedby={description ? `${formId}-description' : undefined}
          {...props}
        >
          {/* Form header */}
          {(title || description) && (
            <div className="space-y-2">
              {title && (
                <h2 className="text-xl font-semibold text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p 
                  id={'${formId}-description'}
                  className="text-sm text-neutral-400"
                >
                  {description}
                </p>
              )}
            </div>
          )}
          
          {/* General form error */}
          {errors._form && (
            <div 
              className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-md"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{errors._form}</span>
            </div>
          )}
          
          {/* Success message */}
          {successMessage && !Object.keys(errors).length && (
            <div 
              className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-md"
              role="alert"
              aria-live="polite"
            >
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              <span className="text-green-300 text-sm">{successMessage}</span>
            </div>
          )}
          
          {/* Form loading indicator */}
          {isValidating && (
            <div 
              className="text-center py-2"
              aria-live="polite"
              aria-label="Validating form"
            >
              <span className="text-sm text-neutral-400">Validating...</span>
            </div>
          )}
          
          {children}
        </form>
      </FormContext.Provider>
    )
  }
)

AccessibleForm.displayName = 'AccessibleForm`

// =============================================================================
// Form Field Components
// =============================================================================

export interface FormFieldProps {
  /**
   * Field name
   */
  name: string
  
  /**
   * Field label
   */
  label: string
  
  /**
   * Help text or description
   */
  description?: string
  
  /**
   * Whether field is required
   */
  required?: boolean
  
  /**
   * Custom validation function
   */
  validate?: (value: unknown) => string | null | Promise<string | null>
  
  children: React.ReactNode
}

export function FormField({ 
  name, 
  label, 
  description, 
  required = false,
  validate,
  children 
}: FormFieldProps) {
  const { formId, errors, touched, setFieldError, setFieldTouched, validateField } = useFormContext()
  const fieldId = `${formId}-${name}`
  const errorId = `${fieldId}-error'
  const descriptionId = '${fieldId}-description'
  
  const error = errors[name]
  const isTouched = touched[name]
  const hasError = error && isTouched
  
  // Handle field validation
  const handleBlur = useCallback(async (value: unknown) => {
    setFieldTouched(name, true)
    
    if (validate) {
      const error = await validate(value)
      setFieldError(name, error)
    } else {
      const error = await validateField(name, value)
      setFieldError(name, error)
    }
  }, [name, validate, validateField, setFieldError, setFieldTouched])
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-neutral-300"
      >
        {label}
        {required && (
          <span className="text-red-400 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-xs text-neutral-500">
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          name,
          required,
          'aria-invalid': hasError,
          'aria-describedby': cn(
            description && descriptionId,
            hasError && errorId
          ),
          onBlur: (e: React.FocusEvent) => {
            handleBlur(e.target.value)
            // Call original onBlur if it exists
            const originalOnBlur = (children as React.ReactElement).props.onBlur
            if (originalOnBlur) originalOnBlur(e)
          },
          className: cn(
            fieldVariants({
              state: hasError ? 'error' : 'default'
            }),
            (children as React.ReactElement).props.className
          ),
        })}
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
        )}
      </div>
      
      {hasError && (
        <p 
          id={errorId}
          className="text-sm text-red-400 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// Input Components
// =============================================================================

export interface InputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof fieldVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, state, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(fieldVariants({ size, state }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps 
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof fieldVariants> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, state, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          fieldVariants({ size, state }),
          'min-h-[80px] resize-vertical',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

// =============================================================================
// Password Input with Toggle
// =============================================================================

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean
  toggleLabel?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, toggleLabel = 'Toggle password visibility', className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const announce = useScreenReaderAnnouncement()
    
    const toggleVisibility = () => {
      const newState = !showPassword
      setShowPassword(newState)
      announce(
        'Password is now ${newState ? 'visible' : 'hidden'}',
        'polite'
      )
    }
    
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          {...props}
        />
        
        {showToggle && (
          <AccessibleButton
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute inset-y-0 right-0 px-3 text-neutral-400 hover:text-neutral-300"
            onClick={toggleVisibility}
            ariaLabel={toggleLabel}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </AccessibleButton>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

// =============================================================================
// Select Component
// =============================================================================

export interface SelectProps 
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof fieldVariants> {
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size, state, placeholder, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          fieldVariants({ size, state }),
          'appearance-none cursor-pointer',
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'

// =============================================================================
// Checkbox Component
// =============================================================================

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, children, ...props }, ref) => {
    const id = useId()
    const descriptionId = description ? '${id}-description' : undefined
    
    return (
      <div className="flex items-start gap-3">
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-800',
            'text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          aria-describedby={descriptionId}
          {...props}
        />
        
        <div className="space-y-1">
          {(label || children) && (
            <label 
              htmlFor={id}
              className="text-sm font-medium text-neutral-300 cursor-pointer"
            >
              {label || children}
            </label>
          )}
          
          {description && (
            <p id={descriptionId} className="text-xs text-neutral-500">
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// =============================================================================
// Form Actions
// =============================================================================

export interface FormActionsProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'right' | 'center' | 'between'
}

export function FormActions({ children, className, align = 'right' }: FormActionsProps) {
  const alignmentClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
  }
  
  return (
    <div className={cn(
      'flex items-center gap-3 pt-6 border-t border-neutral-800',
      alignmentClasses[align],
      className
    )}>
      {children}
    </div>
  )
}

// =============================================================================
// Help Text Component
// =============================================================================

export interface HelpTextProps {
  children: React.ReactNode
  className?: string
  variant?: 'info' | 'warning' | 'error' | 'success'
}

export function HelpText({ children, className, variant = 'info' }: HelpTextProps) {
  const icons = {
    info: Info,
    warning: AlertCircle,
    error: AlertCircle,
    success: CheckCircle2,
  }
  
  const colors = {
    info: 'text-blue-400 border-blue-800 bg-blue-900/20',
    warning: 'text-yellow-400 border-yellow-800 bg-yellow-900/20',
    error: 'text-red-400 border-red-800 bg-red-900/20',
    success: 'text-green-400 border-green-800 bg-green-900/20',
  }
  
  const Icon = icons[variant]
  
  return (
    <div className={cn(
      'flex items-start gap-2 p-3 border rounded-md text-sm',
      colors[variant],
      className
    )}>
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

// =============================================================================
// Legacy Components (kept for compatibility)
// =============================================================================

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'date' | 'time' | 'datetime-local'
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  error?: string
  helpText?: string
  autoComplete?: string
  pattern?: string
  min?: string | number
  max?: string | number
  step?: string | number
  className?: string
  inputClassName?: string
  labelClassName?: string
  errorClassName?: string
  helpClassName?: string
  'aria-describedby'?: string
}

/**
 * AccessibleFormField - Legacy component for backward compatibility
 * @deprecated Use FormField with Input components instead
 */
export const AccessibleFormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    readOnly = false,
    error,
    helpText,
    autoComplete,
    pattern,
    min,
    max,
    step,
    className,
    inputClassName,
    labelClassName,
    errorClassName,
    helpClassName,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const inputId = useId()
    const errorId = useId()
    const helpId = useId()
    
    const describedByIds = [
      error && errorId,
      helpText && helpId,
      ariaDescribedBy
    ].filter(Boolean).join(' ')

    return (
      <div className={cn('space-y-2', className)}>
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium text-neutral-300',
            disabled && 'opacity-60',
            labelClassName
          )}
        >
          {label}
          {required && (
            <span className="text-red-400 ml-1" aria-label="required">*</span>
          )}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedByIds || undefined}
            autoComplete={autoComplete}
            pattern={pattern}
            min={min}
            max={max}
            step={step}
            className={cn(
              fieldVariants({ state: error ? 'error' : 'default' }),
              inputClassName
            )}
            {...props}
          />
          
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
          )}
        </div>

        {error && (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            className={cn('flex items-start space-x-1 text-sm text-red-400', errorClassName)}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {helpText && !error && (
          <div
            id={helpId}
            className={cn('flex items-start space-x-1 text-sm text-neutral-400', helpClassName)}
          >
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{helpText}</span>
          </div>
        )}
      </div>
    )
  }
)

AccessibleFormField.displayName = 'AccessibleFormField'

// Export all components
export { formVariants, fieldVariants }