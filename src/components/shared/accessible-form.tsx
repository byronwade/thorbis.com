'use client'

import * as React from 'react'
import { cn } from '@thorbis/design'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

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
 * AccessibleFormField - Fully accessible form field with WCAG compliance
 * Includes proper labeling, error handling, and focus management
 */
export const AccessibleFormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
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
    const inputId = React.useId()
    const errorId = React.useId()
    const helpId = React.useId()
    
    // Build aria-describedby attribute
    const describedByIds = [
      error && errorId,
      helpText && helpId,
      ariaDescribedBy
    ].filter(Boolean).join(' ')

    return (
      <div className={cn('space-y-2', className)}>
        {/* Label */}
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium',
            'text-neutral-700 dark:text-neutral-200',
            disabled && 'opacity-60',
            labelClassName
          )}
        >
          {label}
          {required && (
            <span 
              className="text-red-500 ml-1" 
              aria-label="required"
            >
              *
            </span>
          )}
        </label>

        {/* Input */}
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
            aria-required={required ? 'true' : 'false'}
            aria-describedby={describedByIds || undefined}
            autoComplete={autoComplete}
            pattern={pattern}
            min={min}
            max={max}
            step={step}
            className={cn(
              'w-full px-3 py-2 rounded-md',
              'bg-white dark:bg-neutral-800',
              'border border-neutral-300 dark:border-neutral-600',
              'text-neutral-900 dark:text-neutral-100',
              'placeholder:text-neutral-500 dark:placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'focus:ring-offset-white dark:focus:ring-offset-neutral-900',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-150',
              error && 'border-red-500 dark:border-red-400',
              inputClassName
            )}
            {...props}
          />
          
          {/* Error icon */}
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle 
                className="h-5 w-5 text-red-500" 
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            className={cn(
              'flex items-start space-x-1',
              'text-sm text-red-600 dark:text-red-400',
              errorClassName
            )}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Help text */}
        {helpText && !error && (
          <div
            id={helpId}
            className={cn(
              'flex items-start space-x-1',
              'text-sm text-neutral-600 dark:text-neutral-400',
              helpClassName
            )}
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

/**
 * AccessibleForm - Form wrapper with proper ARIA attributes and validation
 */
interface AccessibleFormProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  noValidate?: boolean
}

export function AccessibleForm({
  children,
  onSubmit,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  noValidate = false,
  ...props
}: AccessibleFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Announce form submission to screen readers
    const liveRegion = document.getElementById('form-live-region')
    if (liveRegion) {
      liveRegion.textContent = 'Form is being submitted...'
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit(e)
      
      // Announce success
      if (liveRegion) {
        liveRegion.textContent = 'Form submitted successfully'
      }
    } catch (_error) {
      // Announce error
      if (liveRegion) {
        liveRegion.textContent = 'Form submission failed. Please check the errors and try again.'
      }
      
      // Focus first error field
      const firstErrorField = formRef.current?.querySelector('[aria-invalid="true"]') as HTMLElement
      firstErrorField?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={cn('space-y-6', className)}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-busy={isSubmitting}
        noValidate={noValidate}
        {...props}
      >
        {children}
      </form>
      
      {/* Live region for form announcements */}
      <div
        id="form-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  )
}

/**
 * AccessibleFieldset - Groups related form fields with proper labeling
 */
interface AccessibleFieldsetProps {
  legend: string
  children: React.ReactNode
  className?: string
  legendClassName?: string
  required?: boolean
}

export function AccessibleFieldset({
  legend,
  children,
  className,
  legendClassName,
  required = false
}: AccessibleFieldsetProps) {
  return (
    <fieldset className={cn('space-y-4', className)}>
      <legend className={cn(
        'text-base font-medium',
        'text-neutral-900 dark:text-neutral-100',
        legendClassName
      )}>
        {legend}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </legend>
      {children}
    </fieldset>
  )
}

/**
 * AccessibleFormSuccess - Success message component
 */
interface AccessibleFormSuccessProps {
  message: string
  className?: string
}

export function AccessibleFormSuccess({
  message,
  className
}: AccessibleFormSuccessProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center space-x-2',
        'p-4 rounded-md',
        'bg-green-50 dark:bg-green-900/20',
        'text-green-800 dark:text-green-200',
        className
      )}
    >
      <CheckCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

/**
 * AccessibleFormError - Form-level error message
 */
interface AccessibleFormErrorProps {
  errors: string[]
  className?: string
}

export function AccessibleFormError({
  errors,
  className
}: AccessibleFormErrorProps) {
  if (errors.length === 0) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'p-4 rounded-md',
        'bg-red-50 dark:bg-red-900/20',
        'border border-red-200 dark:border-red-800',
        className
      )}
    >
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" aria-hidden="true" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            There {errors.length === 1 ? 'was an error' : 'were errors'} with your submission
          </h3>
          <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}