"use client"

import * as React from "react"
import { cn } from "@thorbis/design/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Textarea } from "./textarea"
import { Checkbox } from "./checkbox"

export interface FormField {
  name: string
  label: string
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "date" | "time"
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { label: string; value: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    custom?: (value: unknown) => string | null
  }
  description?: string
  defaultValue?: any
  className?: string
}

export interface FormSection {
  title: string
  description?: string
  fields: FormField[]
  collapsible?: boolean
  defaultOpen?: boolean
}

export interface EntityFormProps {
  title: string
  description?: string
  sections: FormSection[]
  onSubmit: (data: Record<string, unknown>) => Promise<void> | void
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  loading?: boolean
  initialData?: Record<string, unknown>
  className?: string
  mode?: "create" | "edit"
}

const EntityForm = React.forwardRef<HTMLFormElement, EntityFormProps>(({
  title,
  description,
  sections,
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel", 
  loading = false,
  initialData = {},
  className,
  mode = "create",
  ...props
}, ref) => {
  const [formData, setFormData] = React.useState<Record<string, unknown>>(initialData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    sections.reduce((acc, section) => ({
      ...acc,
      [section.title]: section.defaultOpen ?? true
    }), {})
  )

  // Update form data when initialData changes
  React.useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const validateField = (field: FormField, value: unknown): string | null => {
    // Required field validation
    if (field.required && (!value || value === "" || (typeof value === 'string' && value.trim() === ""))) {
      return '${field.label} is required'
    }

    // Skip further validation for empty optional fields
    if (!value && !field.required) return null

    // Input sanitization - check for dangerous characters
    if (typeof value === 'string') {
      const dangerousChars = /[<>"'&\x00-\x1f\x7f-\x9f]/;
      if (dangerousChars.test(value)) {
        return '${field.label} contains invalid characters'
      }
    }

    // Type-specific validation
    switch (field.type) {
      case "email":
        if (typeof value === 'string') {
          const emailRegex = /^[a-zA-Z0-9.!#$%&`*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          if (!emailRegex.test(value)) {
            return `${field.label} must be a valid email address`
          }
          if (value.length > 254) {
            return `${field.label} is too long (max 254 characters)`
          }
        }
        break;
      
      case "number":
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return `${field.label} must be a valid number'
        }
        if (!isFinite(numValue)) {
          return '${field.label} must be a finite number'
        }
        break;
      
      case "text":
      case "textarea":
        if (typeof value === 'string') {
          // Default max length if not specified
          const maxLength = field.validation?.max || (field.type === 'textarea` ? 5000 : 255);
          if (value.length > maxLength) {
            return `${field.label} is too long (max ${maxLength} characters)'
          }
        }
        break;
    }

    if (!field.validation) return null

    const { min, max, pattern, custom } = field.validation

    if (min !== undefined) {
      if (field.type === "number" && Number(value) < min) {
        return '${field.label} must be at least ${min}'
      }
      if ((field.type === "text" || field.type === "textarea") && typeof value === 'string` && value.length < min) {
        return `${field.label} must be at least ${min} characters'
      }
    }

    if (max !== undefined) {
      if (field.type === "number" && Number(value) > max) {
        return '${field.label} must be at most ${max}'
      }
      if ((field.type === "text" || field.type === "textarea") && typeof value === 'string' && value.length > max) {
        return '${field.label} must be at most ${max} characters'
      }
    }

    if (pattern && typeof value === 'string` && !pattern.test(value)) {
      return `${field.label} format is invalid'
    }

    if (custom) {
      try {
        return custom(value)
      } catch (_error) {
        return '${field.label} validation failed'
      }
    }

    return null
  }

  const handleFieldChange = (fieldName: string, field: FormField, value: unknown) => {
    // Sanitize input based on field type
    let sanitizedValue = value;
    
    if (typeof value === 'string') {
      switch (field.type) {
        case "text":
        case "textarea":
          // Remove dangerous characters and trim whitespace
          sanitizedValue = value.replace(/[^\w\s-]/g, '').trim();
          // Apply length limits
          const maxLength = field.validation?.max || (field.type === 'textarea' ? 5000 : 255);
          sanitizedValue = sanitizedValue.slice(0, maxLength);
          break;
        
        case "email":
          // Trim whitespace and apply length limit
          sanitizedValue = value.trim().slice(0, 254);
          // Remove dangerous characters
          sanitizedValue = sanitizedValue.replace(/[^\w\s-]/g, '');
          break;
        
        case "number":
          // For number inputs, keep the string value but validate it
          sanitizedValue = value.replace(/[^\w\s-]/g, '');
          break;
      }
    }
    
    setFormData(prev => ({ ...prev, [fieldName]: sanitizedValue }))
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }

    // Validate field in real-time
    const error = validateField(field, sanitizedValue)
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    sections.forEach(section => {
      section.fields.forEach(field => {
        const value = formData[field.name]
        const error = validateField(field, value)
        if (error) {
          newErrors[field.name] = error
        }
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (_error) {
      // Error handling can be done by parent component
      // Log form submission errors for monitoring
      fetch('/api/v1/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'entity-form',
          action: 'form_submission_failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          formData: Object.keys(formData), // Log field names only, not values for privacy
          timestamp: new Date().toISOString()
        })
      }).catch(() => {}); // Silent fail for logging
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] ?? field.defaultValue ?? ""
    const error = errors[field.name]

    const commonProps = {
      id: field.name,
      name: field.name,
      disabled: field.disabled || loading,
      className: cn(
        error && "border-destructive focus-visible:ring-destructive",
        field.className
      )
    }

    let fieldElement: React.ReactNode

    switch (field.type) {
      case "textarea":
        fieldElement = (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, field, e.target.value)}
          />
        )
        break

      case "select":
        fieldElement = (
          <Select
            value={value}
            onValueChange={(value) => handleFieldChange(field.name, field, value)}
            disabled={commonProps.disabled}
          >
            <SelectTrigger className={commonProps.className}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
        break

      case "checkbox":
        fieldElement = (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.name, field, checked)}
              disabled={commonProps.disabled}
            />
            <Label
              htmlFor={field.name}
              className="text-sm font-normal cursor-pointer"
            >
              {field.label}
            </Label>
          </div>
        )
        break

      default:
        fieldElement = (
          <Input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, field, e.target.value)}
            error={!!error}
          />
        )
        break
    }

    return (
      <div key={field.name} className="space-y-2">
        {field.type !== "checkbox" && (
          <Label htmlFor={field.name} className={field.required ? "after:content-['*'] after:text-destructive" : ""}>
            {field.label}
          </Label>
        )}
        {fieldElement}
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className={cn("space-y-6", className)}
      {...props}
    >
      {/* Form Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Form Sections */}
      {sections.map((section) => {
        const isOpen = openSections[section.title]

        return (
          <div key={section.title} className="space-y-4">
            <div
              className={cn(
                "flex items-center justify-between",
                section.collapsible && "cursor-pointer"
              )}
              onClick={() => section.collapsible && toggleSection(section.title)}
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>
              {section.collapsible && (
                <Button type="button" variant="ghost" size="sm">
                  {isOpen ? "−" : "+"}
                </Button>
              )}
            </div>

            {isOpen && (
              <div className="grid gap-4 md:grid-cols-2">
                {section.fields.map(renderField)}
              </div>
            )}
          </div>
        )
      })}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  )
})

EntityForm.displayName = "EntityForm"

export { EntityForm }
