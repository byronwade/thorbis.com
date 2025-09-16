import { useState, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { sanitizeTextInput, validateFormData, createDebouncedValidator } from '@/lib/validation/client-side-validation'

export interface FormErrors {
  [key: string]: string | undefined
}

export interface FormValues {
  [key: string]: any
}

export interface ValidationRules {
  [key: string]: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: unknown) => string | undefined
    sanitize?: boolean
    type?: 'text' | 'email' | 'password' | 'phone' | 'url' | 'number'
  }
}

export interface FormValidationOptions<T> {
  schema?: z.ZodSchema<T>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceMs?: number
  onSubmit?: (data: T) => Promise<void> | void
}

export interface FormFieldProps {
  value: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  error?: string
  touched?: boolean
  isValidating?: boolean
}

export function useFormValidation<T extends Record<string, unknown> = FormValues>(
  initialValues: FormValues,
  rules: ValidationRules,
  options: FormValidationOptions<T> = {}
) {
  const {
    schema,
    validateOnChange = false,
    validateOnBlur = true,
    debounceMs = 300,
    onSubmit
  } = options

  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState<{ [key: string]: boolean }>({})
  const [submitCount, setSubmitCount] = useState(0)

  const validateField = useCallback((field: string, value: unknown): string | undefined => {
    const fieldRules = rules[field]
    if (!fieldRules) return undefined

    // Check for dangerous characters in string inputs
    if (typeof value === 'string') {
      const dangerousChars = /[<>"'&\x00-\x1f\x7f-\x9f]/
      if (dangerousChars.test(value)) {
        return `${field} contains invalid characters`
      }
    }

    if (fieldRules.required && (!value || value.toString().trim() === ')) {
      return '${field} is required'
    }

    // Type-specific validation
    if (value && fieldRules.type) {
      switch (fieldRules.type) {
        case 'email':
          const emailRegex = /^[a-zA-Z0-9.!#$%&`*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
          if (!emailRegex.test(value.toString())) {
            return `${field} must be a valid email address'
          }
          if (value.toString().length > 254) {
            return '${field} is too long (max 254 characters)'
          }
          break
        case 'phone':
          const phoneDigits = value.toString().replace(/\D/g, `)
          if (phoneDigits.length < 10) {
            return `${field} must have at least 10 digits'
          }
          if (phoneDigits.length > 15) {
            return '${field} is too long'
          }
          break
        case 'url':
          try {
            new URL(value.toString())
          } catch {
            return '${field} must be a valid URL'
          }
          break
        case 'number`:
          if (isNaN(Number(value))) {
            return `${field} must be a valid number`
          }
          break
      }
    }

    if (value && fieldRules.minLength && value.toString().length < fieldRules.minLength) {
      return `${field} must be at least ${fieldRules.minLength} characters`
    }

    if (value && fieldRules.maxLength && value.toString().length > fieldRules.maxLength) {
      return `${field} must be no more than ${fieldRules.maxLength} characters`
    }

    if (value && fieldRules.pattern && !fieldRules.pattern.test(value.toString())) {
      return `${field} format is invalid'
    }

    if (fieldRules.custom) {
      try {
        return fieldRules.custom(value)
      } catch (_error) {
        return '${field} validation failed'
      }
    }

    return undefined
  }, [rules])

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}
    
    Object.keys(rules).forEach(field => {
      const error = validateField(field, values[field])
      if (error) {
        newErrors[field] = error
      }
    })

    return newErrors
  }, [rules, values, validateField])

  const setValue = useCallback((field: string, value: unknown) => {
    let sanitizedValue = value
    
    // Sanitize input based on field rules
    const fieldRules = rules[field]
    if (fieldRules?.sanitize && typeof value === 'string') {
      switch (fieldRules.type) {
        case 'text':
          sanitizedValue = sanitizeTextInput(value, {
            maxLength: fieldRules.maxLength || 255,
            trimWhitespace: true
          })
          break
        case 'email':
          sanitizedValue = sanitizeTextInput(value, {
            maxLength: 254,
            allowedChars: /a-zA-Z0-9.!#$%&'*+/=?^_'{|}~@-/,
            trimWhitespace: true
          })
          break
        case 'phone':
          sanitizedValue = sanitizeTextInput(value, {
            maxLength: 20,
            allowedChars: /0-9\s\-\(\)\+/,
            trimWhitespace: true
          })
          break
        case 'url':
          sanitizedValue = sanitizeTextInput(value, {
            maxLength: 2048,
            trimWhitespace: true
          })
          break
        default:
          sanitizedValue = sanitizeTextInput(value)
      }
    }
    
    setValues(prev => ({ ...prev, [field]: sanitizedValue }))
    
    // Validate field if it has been touched
    if (touched[field]) {
      const error = validateField(field, sanitizedValue)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }, [touched, validateField, rules])

  const setFieldTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate field when touched
    const error = validateField(field, values[field])
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [values, validateField])

  const isValid = useCallback((): boolean => {
    const formErrors = validateForm()
    return Object.keys(formErrors).length === 0
  }, [validateForm])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  // Create debounced validator for real-time validation
  const debouncedValidateField = useMemo(
    () => createDebouncedValidator(validateField, debounceMs),
    [validateField, debounceMs]
  )

  // Handle field changes with optional real-time validation
  const handleFieldChange = useCallback(
    (fieldName: string) => 
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.value
        setValue(fieldName, value)

        // Clear existing error
        if (errors[fieldName]) {
          setErrors(prev => ({ ...prev, [fieldName]: undefined }))
        }

        // Validate on change if enabled
        if (validateOnChange) {
          setIsValidating(prev => ({ ...prev, [fieldName]: true }))
          debouncedValidateField(fieldName, value, (error) => {
            setIsValidating(prev => ({ ...prev, [fieldName]: false }))
            if (error) {
              setErrors(prev => ({ ...prev, [fieldName]: error }))
            }
          })
        }
      },
    [setValue, errors, validateOnChange, debouncedValidateField]
  )

  // Handle field blur with validation
  const handleFieldBlur = useCallback(
    (fieldName: string) => 
      (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFieldTouched(fieldName)
        
        if (validateOnBlur) {
          const error = validateField(fieldName, e.target.value)
          setErrors(prev => ({ ...prev, [fieldName]: error }))
        }
      },
    [setFieldTouched, validateOnBlur, validateField]
  )

  // Get field props for easy form integration
  const getFieldProps = useCallback(
    (fieldName: string): FormFieldProps => ({
      value: values[fieldName] || ',
      onChange: handleFieldChange(fieldName),
      onBlur: handleFieldBlur(fieldName),
      error: errors[fieldName],
      touched: touched[fieldName],
      isValidating: isValidating[fieldName]
    }),
    [values, errors, touched, isValidating, handleFieldChange, handleFieldBlur]
  )

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitCount(prev => prev + 1)

    try {
      // Validate with schema if provided, otherwise use rules
      let validationErrors: FormErrors = {}
      
      if (schema) {
        const result = validateFormData(schema, values)
        if (!result.success) {
          validationErrors = result.errors || {}
        }
      } else {
        validationErrors = validateForm()
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        // Mark all fields as touched to show errors
        const allTouched = Object.keys(rules).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
        setTouched(allTouched)
        return false
      }

      // Clear errors and call onSubmit if provided
      setErrors({})
      if (onSubmit) {
        await onSubmit(values as T)
      }
      
      return true
    } catch (error) {
      // Handle submission error
      const errorMessage = error instanceof Error ? error.message : 'Submission failed'
      setErrors({ submit: errorMessage })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [schema, values, validateForm, rules, onSubmit])

  // Computed values
  const isDirty = useMemo(() => {
    return Object.keys(touched).some(key => touched[key])
  }, [touched])

  const hasErrors = useMemo(() => {
    return Object.keys(errors).some(key => errors[key])
  }, [errors])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    submitCount,
    isDirty,
    hasErrors,
    setValue,
    setTouched: setFieldTouched,
    validateForm,
    isValid,
    reset,
    handleSubmit,
    getFieldProps,
    setErrors,
    clearErrors: () => setErrors({})
  }
}