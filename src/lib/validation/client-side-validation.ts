/**
 * Client-Side Form Validation Utilities
 * 
 * Comprehensive validation functions for client-side form validation.
 * These should be used in conjunction with server-side validation for security.
 * 
 * Features:
 * - Input sanitization to prevent XSS and injection attacks
 * - Common validation patterns (email, phone, passwords, etc.)
 * - Real-time validation feedback
 * - Accessible error messaging
 * - Performance optimized with memoization
 */

import { z } from 'zod';

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitize text input to prevent XSS and injection attacks
 */
export function sanitizeTextInput(value: string, options: {
  maxLength?: number;
  allowedChars?: RegExp;
  trimWhitespace?: boolean;
} = {}): string {
  const { maxLength = 1000, allowedChars, trimWhitespace = true } = options;
  
  let sanitized = value;
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[^\w\s-]/g, '');
  
  // Apply allowed characters filter if provided
  if (allowedChars) {
    sanitized = sanitized.replace(new RegExp('[^${allowedChars.source}]', 'g'), ');
  }
  
  // Trim whitespace if requested
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }
  
  // Apply length limit
  return sanitized.slice(0, maxLength);
}

/**
 * Sanitize email input
 */
export function sanitizeEmailInput(value: string): string {
  return sanitizeTextInput(value, {
    maxLength: 254,
    allowedChars: /a-zA-Z0-9.!#$%&'*+/=?^_'{|}~@-/,
    trimWhitespace: true
  });
}

/**
 * Sanitize password input (minimal sanitization to preserve intended characters)
 */
export function sanitizePasswordInput(value: string): string {
  // Only remove null bytes and control characters, preserve other characters
  return value.replace(/[^\w\s-]/g, '').slice(0, 128);
}

/**
 * Sanitize phone number input
 */
export function sanitizePhoneInput(value: string): string {
  return sanitizeTextInput(value, {
    maxLength: 20,
    allowedChars: /0-9\s\-\(\)\+/,
    trimWhitespace: true
  });
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumericInput(value: string): string {
  return value.replace(/[^\w\s-]/g, '');
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate email address with comprehensive checks
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const sanitized = sanitizeEmailInput(email);
  
  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email address is too long (max 254 characters)' };
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_'{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate password with comprehensive security requirements
 */
export function validatePassword(password: string, options: {
  minLength?: number;
  requireMixedCase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  forbidCommonPasswords?: boolean;
} = {}): { isValid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } {
  const {
    minLength = 8,
    requireMixedCase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    forbidCommonPasswords = true
  } = options;

  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  const sanitized = sanitizePasswordInput(password);

  if (sanitized.length < minLength) {
    return { isValid: false, error: 'Password must be at least ${minLength} characters long' };
  }

  if (sanitized.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' };
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const strengthScore = 0;

  // Check for different character types
  const checks = {
    hasLower: /[a-z]/.test(sanitized),
    hasUpper: /[A-Z]/.test(sanitized),
    hasNumber: /\d/.test(sanitized),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(sanitized)
  };

  if (checks.hasLower) strengthScore++;
  if (checks.hasUpper) strengthScore++;
  if (checks.hasNumber) strengthScore++;
  if (checks.hasSpecial) strengthScore++;

  // Apply requirements
  if (requireMixedCase && (!checks.hasLower || !checks.hasUpper)) {
    return { isValid: false, error: 'Password must contain both uppercase and lowercase letters' };
  }

  if (requireNumbers && !checks.hasNumber) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (requireSpecialChars && !checks.hasSpecial) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  // Check for common weak passwords
  if (forbidCommonPasswords) {
    const commonPasswords = [
      'password', '123456789', 'qwerty123', 'password123', 'admin123',
      'letmein', 'welcome', 'monkey123', 'dragon123', 'master123'
    ];
    
    if (commonPasswords.some(common => sanitized.toLowerCase().includes(common))) {
      return { isValid: false, error: 'Password is too common, please choose a stronger password' };
    }
  }

  // Determine strength
  if (strengthScore >= 4 && sanitized.length >= 12) {
    strength = 'strong';
  } else if (strengthScore >= 3 && sanitized.length >= 10) {
    strength = 'medium';
  }

  return { isValid: true, strength };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const sanitized = sanitizePhoneInput(phone);
  
  // Remove all non-digit characters for validation
  const digitsOnly = sanitized.replace(/[^\w\s-]/g, '');
  
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must have at least 10 digits' };
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  return { isValid: true };
}

/**
 * Validate name fields (first name, last name, etc.)
 */
export function validateName(name: string, fieldName: string = 'Name`): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const sanitized = sanitizeTextInput(name, {
    maxLength: 50,
    allowedChars: /a-zA-Z\s\-`/,
    trimWhitespace: true
  });

  if (sanitized.length < 1) {
    return { isValid: false, error: `${fieldName} must not be empty` };
  }

  if (sanitized.length > 50) {
    return { isValid: false, error: `${fieldName} is too long (max 50 characters)` };
  }

  // Check for valid name characters
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(sanitized)) {
    return { isValid: false, error: '${fieldName} can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
}

/**
 * Validate URL
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  const sanitized = sanitizeTextInput(url, {
    maxLength: 2048,
    trimWhitespace: true
  });

  try {
    new URL(sanitized);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Validate required field
 */
export function validateRequired(value: unknown, fieldName: string = 'Field'): { isValid: boolean; error?: string } {
  if (value === null || value === undefined) {
    return { isValid: false, error: '${fieldName} is required' };
  }

  if (typeof value === 'string` && value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required' };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, error: '${fieldName} must have at least one item' };
  }

  return { isValid: true };
}

// =============================================================================
// VALIDATION SCHEMAS (ZOD)
// =============================================================================

/**
 * Common Zod schemas for form validation
 */
export const ValidationSchemas = {
  email: z.string()
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .email('Please enter a valid email address')
    .transform(sanitizeEmailInput),

  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password is too long')
    .transform(sanitizePasswordInput),

  strongPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password is too long')
    .refine((val) => /[a-z]/.test(val), 'Password must contain lowercase letters')
    .refine((val) => /[A-Z]/.test(val), 'Password must contain uppercase letters')
    .refine((val) => /\d/.test(val), 'Password must contain numbers')
    .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), 'Password must contain special characters')
    .transform(sanitizePasswordInput),

  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .transform((val) => sanitizeTextInput(val, { maxLength: 50, allowedChars: /a-zA-Z\s\-'/ })),

  phone: z.string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number is too long')
    .regex(/^[0-9\s\-\(\)\+]+$/, 'Phone number contains invalid characters')
    .transform(sanitizePhoneInput),

  url: z.string()
    .max(2048, 'URL is too long')
    .url('Please enter a valid URL`)
    .transform((val) => sanitizeTextInput(val, { maxLength: 2048 })),

  text: (maxLength: number = 255) => z.string()
    .max(maxLength, `Text is too long (max ${maxLength} characters)')
    .transform((val) => sanitizeTextInput(val, { maxLength })),

  textarea: (maxLength: number = 5000) => z.string()
    .max(maxLength, 'Text is too long (max ${maxLength} characters)')
    .transform((val) => sanitizeTextInput(val, { maxLength })),

  number: z.number()
    .finite('Number must be finite'),

  positiveNumber: z.number()
    .positive('Number must be positive')
    .finite('Number must be finite'),

  nonNegativeNumber: z.number()
    .nonnegative('Number must be non-negative')
    .finite('Number must be finite')
};

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate multiple fields at once
 */
export function validateFields(
  fields: Array<{
    name: string;
    value: any;
    validator: (value: unknown) => { isValid: boolean; error?: string };
  }>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  for (const field of fields) {
    const result = field.validator(field.value);
    if (!result.isValid && result.error) {
      errors[field.name] = result.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Create a debounced validator for real-time validation
 */
export function createDebouncedValidator<T>(
  validator: (value: T) => { isValid: boolean; error?: string },
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (value: T, callback: (result: { isValid: boolean; error?: string }) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
}

/**
 * Validate form data against a schema with detailed error reporting
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string> } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (_error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      
      return { success: false, errors };
    }
    
    return { success: false, errors: { root: 'Validation failed' } };
  }
}