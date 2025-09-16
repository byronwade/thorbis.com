import { cn } from '@/lib/utils'
import React from 'react'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ValidatedSelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  touched?: boolean
  description?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export const ValidatedSelect = React.forwardRef<HTMLSelectElement, ValidatedSelectProps>(
  ({ 
    label,
    options,
    value,
    onChange,
    error,
    touched,
    description,
    required,
    placeholder,
    disabled,
    className,
    id,
    ...props 
  }, ref) => {
    const hasError = touched && error
    const selectId = id || 'select-${Math.random().toString(36).substr(2, 9)}'

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      
      // Validate that the selected value exists in the options
      const isValidOption = !value || options.some(option => option.value === value);
      
      if (isValidOption) {
        onChange?.(value)
      } else {
        // Log potential tampering attempt
        fetch('/api/v1/logs/security', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'validated-select',
            action: 'invalid_option_selected',
            attemptedValue: value,
            availableOptions: options.map(o => o.value),
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}); // Silent fail for logging
        
        // Reset to empty value or first valid option
        onChange?.(');
      }
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={selectId} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <select
            {...props}
            id={selectId}
            ref={ref}
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
                'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed',
                hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : `,
                className
              )}
            aria-invalid={hasError}
            aria-describedby={
              description ? `${selectId}-description` : 
              hasError ? `${selectId}-error` : 
              undefined
            }
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Status indicator */}
          {hasError && (
            <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>

        {/* Description */}
        {description && !hasError && (
          <p id={`${selectId}-description'} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {/* Error message */}
        {hasError && (
          <p id={'${selectId}-error'} className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

ValidatedSelect.displayName = 'ValidatedSelect'