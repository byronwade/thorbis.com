import { cn } from '@/lib/utils'
import React from 'react'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle } from 'lucide-react'

export interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  touched?: boolean
  isValid?: boolean
  description?: string
  required?: boolean
  onValueChange?: (value: string) => void
  maxLength?: number
  showCharCount?: boolean
}

export const ValidatedTextarea = React.forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({ 
    label,
    error,
    touched,
    isValid,
    description,
    required,
    onValueChange,
    onChange,
    maxLength,
    showCharCount,
    className,
    value,
    ...props 
  }, ref) => {
    const hasError = touched && error
    const showSuccess = touched && !error && isValid
    const textareaId = props.id || 'textarea-${Math.random().toString(36).substr(2, 9)}'
    const charCount = typeof value === 'string' ? value.length : 0

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value;
      
      // Input sanitization for textarea
      // Remove dangerous characters that could be used for XSS or injection
      value = value.replace(/[^\w\s-]/g, '');
      
      // Apply length limits
      if (maxLength) {
        value = value.slice(0, maxLength);
      }
      
      // Update the event with sanitized value
      const sanitizedEvent = {
        ...e,
        target: {
          ...e.target,
          value: value
        }
      };
      
      onChange?.(sanitizedEvent as React.ChangeEvent<HTMLTextAreaElement>)
      onValueChange?.(value)
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={textareaId} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <textarea
            {...props}
            id={textareaId}
            ref={ref}
            value={value}
            maxLength={maxLength}
            onChange={handleChange}
            className={cn(
                'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-vertical min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed',
                hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ',
                showSuccess ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : `,
                className
              )}
            aria-invalid={hasError}
            aria-describedby={
              description ? `${textareaId}-description` : 
              hasError ? `${textareaId}-error` : 
              undefined
            }
          />
          
          {/* Status indicator */}
          <div className="absolute top-2 right-2 pointer-events-none">
            {hasError && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            {showSuccess && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>

        {/* Character count and description */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Description */}
            {description && !hasError && (
              <p id={`${textareaId}-description'} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}

            {/* Error message */}
            {hasError && (
              <p id={'${textareaId}-error'} className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </p>
            )}
          </div>

          {/* Character count */}
          {showCharCount && maxLength && (
            <p className={cn(
                'text-xs ml-2 ',
                
              charCount > maxLength * 0.9 ? 'text-amber-600' :
              charCount >= maxLength ? 'text-red-600' :
              'text-muted-foreground'
            )}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

ValidatedTextarea.displayName = 'ValidatedTextarea'