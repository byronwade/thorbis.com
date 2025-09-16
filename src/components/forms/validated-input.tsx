import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  touched?: boolean
  isValidating?: boolean
  isValid?: boolean
  description?: string
  required?: boolean
  onValueChange?: (value: string) => void
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ 
    label,
    error,
    touched,
    isValidating,
    isValid,
    description,
    required,
    onValueChange,
    onChange,
    className,
    ...props 
  }, ref) => {
    const hasError = touched && error
    const showSuccess = touched && !error && !isValidating && isValid
    const inputId = props.id || 'input-${Math.random().toString(36).substr(2, 9)}'

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Input sanitization based on input type
      switch (props.type) {
        case 'email':
          // Trim whitespace and limit length for email
          value = value.trim().slice(0, 254);
          // Remove dangerous characters
          value = value.replace(/[^\w\s-]/g, '');
          break;
        
        case 'password':
          // Limit password length but don't trim (spaces might be intentional)
          value = value.slice(0, 128);
          break;
        
        case 'text':
          // Trim whitespace and remove dangerous characters
          value = value.trim().slice(0, props.maxLength || 255);
          value = value.replace(/[^\w\s-]/g, '');
          break;
        
        case 'number':
          // Allow only numeric characters, decimal point, and minus sign
          value = value.replace(/[^\w\s-]/g, '');
          break;
        
        case 'tel':
          // Allow only numeric characters, spaces, hyphens, parentheses, and plus
          value = value.replace(/[^\w\s-]/g, '').slice(0, 20);
          break;
        
        case 'url':
          // Trim whitespace and limit length
          value = value.trim().slice(0, 2048);
          break;
        
        default:
          // For other input types, apply basic length limit
          if (props.maxLength) {
            value = value.slice(0, props.maxLength);
          }
      }
      
      // Update the event with sanitized value
      const sanitizedEvent = {
        ...e,
        target: {
          ...e.target,
          value: value
        }
      };
      
      onChange?.(sanitizedEvent as React.ChangeEvent<HTMLInputElement>)
      onValueChange?.(value)
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            {...props}
            id={inputId}
            ref={ref}
            onChange={handleChange}
            className={'
              pr-10
              ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '}
              ${showSuccess ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : '}
              ${className || '`}
            `}
            aria-invalid={hasError}
            aria-describedby={
              description ? `${inputId}-description` : 
              hasError ? `${inputId}-error` : 
              undefined
            }
          />
          
          {/* Status indicator */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isValidating && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            )}
            {hasError && !isValidating && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            {showSuccess && !isValidating && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>

        {/* Description */}
        {description && !hasError && (
          <p id={`${inputId}-description'} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {/* Error message */}
        {hasError && (
          <p id={'${inputId}-error'} className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

ValidatedInput.displayName = 'ValidatedInput'