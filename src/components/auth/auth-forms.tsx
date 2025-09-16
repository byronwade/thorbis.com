'use client';

import React, { useState, useTransition } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2, CreditCard, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormErrorBoundary } from '@/components/error-boundary';
import { cn } from '@/lib/utils';
import { signInAction, signUpAction, resetPasswordAction } from '@/lib/auth/actions';

// =============================================================================
// COMPONENT INTERFACES
// =============================================================================

interface AuthFormsProps {
  mode: 'sign-in' | 'sign-up' | 'reset-password';
  onModeChange: (mode: 'sign-in' | 'sign-up' | 'reset-password') => void;
  onSuccess?: () => void;
  redirectTo?: string;
  showCreditCardOption?: boolean;
  showDemoButton?: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  general?: string;
}

// =============================================================================
// AUTH FORMS COMPONENT
// =============================================================================

function AuthFormsContent({ 
  mode, 
  onModeChange, 
  onSuccess,
  redirectTo,
  showCreditCardOption = false,
  showDemoButton = false
}: AuthFormsProps) {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [signupType, setSignupType] = useState<'trial' | 'paid' | 'demo'>('trial');

  // =============================================================================
  // FORM VALIDATION
  // =============================================================================

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Email validation with comprehensive checks
    const emailValue = formData.email.trim();
    if (!emailValue) {
      newErrors.email = 'Email is required';
    } else {
      // Basic email format validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_'{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(emailValue)) {
        newErrors.email = 'Please enter a valid email address';
      } else if (emailValue.length > 254) {
        newErrors.email = 'Email address is too long (max 254 characters)';
      } else {
        // Check for dangerous characters and potential injection
        const dangerousChars = /[<>"'&\x00-\x1f\x7f-\x9f]/;
        if (dangerousChars.test(emailValue)) {
          newErrors.email = 'Email contains invalid characters';
        }
      }
    }

    // Password validation (only for sign-in and sign-up)
    if (mode !== 'reset-password') {
      const passwordValue = formData.password;
      if (!passwordValue) {
        newErrors.password = 'Password is required';
      } else if (mode === 'sign-up') {
        // Comprehensive password validation for sign-up
        if (passwordValue.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (passwordValue.length > 128) {
          newErrors.password = 'Password is too long (max 128 characters)';
        } else {
          const passwordChecks = {
            hasLower: /[a-z]/.test(passwordValue),
            hasUpper: /[A-Z]/.test(passwordValue),
            hasNumber: /\d/.test(passwordValue),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue)
          };
          
          const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
          if (passedChecks < 3) {
            newErrors.password = 'Password must contain at least 3 of: lowercase, uppercase, numbers, special characters';
          }
          
          // Check for common weak passwords
          const commonPasswords = ['password', '12345678', 'qwerty123', 'password123', 'admin123'];
          if (commonPasswords.some(common => passwordValue.toLowerCase().includes(common))) {
            newErrors.password = 'Password is too common, please choose a stronger password';
          }
        }
      } else if (mode === 'sign-in' && passwordValue.length > 128) {
        newErrors.password = 'Password is too long';
      }
    }

    // Name validation for sign-up with enhanced checks
    if (mode === 'sign-up') {
      const firstNameValue = formData.firstName.trim();
      const lastNameValue = formData.lastName.trim();
      
      // First name validation
      if (!firstNameValue) {
        newErrors.firstName = 'First name is required';
      } else if (firstNameValue.length < 1) {
        newErrors.firstName = 'First name must not be empty';
      } else if (firstNameValue.length > 50) {
        newErrors.firstName = 'First name is too long (max 50 characters)';
      } else {
        // Check for valid name characters (letters, spaces, hyphens, apostrophes)
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!nameRegex.test(firstNameValue)) {
          newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }
        // Check for potential injection attempts
        const dangerousChars = /[<>"'&\x00-\x1f\x7f-\x9f]/;
        if (dangerousChars.test(firstNameValue)) {
          newErrors.firstName = 'First name contains invalid characters';
        }
      }
      
      // Last name validation
      if (!lastNameValue) {
        newErrors.lastName = 'Last name is required';
      } else if (lastNameValue.length < 1) {
        newErrors.lastName = 'Last name must not be empty';
      } else if (lastNameValue.length > 50) {
        newErrors.lastName = 'Last name is too long (max 50 characters)';
      } else {
        // Check for valid name characters
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!nameRegex.test(lastNameValue)) {
          newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }
        // Check for potential injection attempts
        const dangerousChars = /[<>"'&\x00-\x1f\x7f-\x9f]/;
        if (dangerousChars.test(lastNameValue)) {
          newErrors.lastName = 'Last name contains invalid characters';
        }
      }
    }

    return newErrors;
  };

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    
    // Input sanitization and length limits
    switch (field) {
      case 'email':
        // Trim whitespace and limit length
        value = value.trim().slice(0, 254);
        break;
      case 'password':
        // Limit password length but don't trim (spaces might be intentional)
        value = value.slice(0, 128);
        break;
      case 'firstName':
      case 'lastName':
        // Trim whitespace and limit length for names
        value = value.trim().slice(0, 50);
        // Remove potentially dangerous characters
        value = value.replace(/[^\w\s-]/g, '');
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleDemoSignup = () => {
    // Demo signup - redirect to demo environment
    onSuccess?.();
    window.location.href = '/demo';
  };

  const handlePaidSignup = () => {
    // For paid signup, we'll redirect to checkout after basic account creation
    setSignupType('paid');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous states
    setErrors({});
    setSuccess(null);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    startTransition(async () => {
      try {
        let result;

        switch (mode) {
          case 'sign-in':
            result = await signInAction({
              email: formData.email,
              password: formData.password,
            });
            break;
            
          case 'sign-up':
            result = await signUpAction({
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              redirectTo,
              signupType,
            });
            break;
            
          case 'reset-password':
            result = await resetPasswordAction({
              email: formData.email,
            });
            break;
        }

        // Log successful authentication attempts for security monitoring
        if (result.success) {
          fetch('/api/v1/logs/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'auth_${mode}_success',
              userId: result.user?.id || 'unknown',
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent
            })
          }).catch(() => {}); // Silent fail for logging
        }
        
        if (result.error) {
          setErrors({ general: result.error });
        } else if (result.success) {
          if (mode === 'sign-up' && result.needsConfirmation) {
            setSuccess('Please check your email to confirm your account before signing in.');
          } else if (mode === 'reset-password') {
            setSuccess(result.message || 'Check your email for password reset instructions.');
          } else if (mode === 'sign-up' && signupType === 'paid') {
            // Redirect to payment for paid signups
            setSuccess('Account created! Redirecting to payment...');
            setTimeout(() => {
              window.location.href = '/checkout';
            }, 1000);
          } else {
            // Handle both regular and demo success cases
            // Processing successful authentication
            if (result.demo) {
              setSuccess(result.message || 'Welcome to the Thorbis demo! Redirecting...');
            } else {
              setSuccess('Success! You are now signed in. Redirecting...');
            }
            // Redirect after a brief delay to show the success message
            setTimeout(() => {
              if (onSuccess) {
                onSuccess();
              } else {
                // Fallback redirect if no callback - validate redirect URL for security
                const urlParams = new URLSearchParams(window.location.search);
                const redirectTo = urlParams.get('redirectTo');
                
                // Validate redirect URL to prevent open redirect attacks
                let safeRedirectUrl = '/dashboards/hs';
                if (redirectTo) {
                  try {
                    const url = new URL(redirectTo, window.location.origin);
                    // Only allow redirects to same origin
                    if (url.origin === window.location.origin) {
                      safeRedirectUrl = url.pathname + url.search;
                    }
                  } catch {
                    // Invalid URL, use default
                  }
                }
                
                window.location.href = safeRedirectUrl;
              }
            }, 1500);
          }
        }
      } catch (_error) {
        // Log authentication errors for security monitoring
        fetch('/api/v1/logs/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'auth_${mode}_error',
            error: error instanceof Error ? error.message : 'Unknown error',
            email: formData.email, // For tracking failed attempts
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          })
        }).catch(() => {}); // Silent fail for logging
        
        setErrors({ 
          general: 'An unexpected error occurred. Please try again.' 
        });
      }
    });
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getTitle = () => {
    switch (mode) {
      case 'sign-in': return 'Welcome back';
      case 'sign-up': return 'Create your account';
      case 'reset-password': return 'Reset your password';
    }
  };

  const getSubmitButtonText = () => {
    if (isPending) {
      switch (mode) {
        case 'sign-in': return 'Signing in...';
        case 'sign-up': return signupType === 'paid' ? 'Creating account...' : 'Starting trial...';
        case 'reset-password': return 'Sending email...';
      }
    }
    switch (mode) {
      case 'sign-in': return 'Sign in';
      case 'sign-up': return signupType === 'paid' ? 'Continue to Payment' : 'Start Free Trial';
      case 'reset-password': return 'Send reset email';
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          {getTitle()}
        </h1>
        <p className="text-neutral-400 text-sm">
          {mode === 'sign-in' && 'Sign in to your account to continue'}
          {mode === 'sign-up' && 'Get started with your free account'}
          {mode === 'reset-password' && 'Enter your email to reset your password'}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-300">{success}</p>
          </div>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Signup Options */}
      {mode === 'sign-up' && (showCreditCardOption || showDemoButton) && (
        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-medium text-neutral-300 text-center">Choose how to get started</h3>
          
          <div className="grid gap-3">
            {/* Free Trial Option */}
            <button
              type="button"
              onClick={() => setSignupType('trial')}
              className={cn(
                'p-4 rounded-lg border text-left transition-all',
                signupType === 'trial' 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-neutral-600 bg-neutral-800/50 hover:border-neutral-500'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">30-Day Free Trial</h4>
                  <p className="text-sm text-neutral-400">No credit card required</p>
                </div>
                <div className="text-green-400 font-bold">FREE</div>
              </div>
            </button>

            {/* Paid Option */}
            {showCreditCardOption && (
              <button
                type="button"
                onClick={() => setSignupType('paid')}
                className={cn(
                  'p-4 rounded-lg border text-left transition-all',
                  signupType === 'paid' 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-neutral-600 bg-neutral-800/50 hover:border-neutral-500'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Start with Premium
                    </h4>
                    <p className="text-sm text-neutral-400">Full access from day one</p>
                  </div>
                  <div className="text-blue-400 font-bold">$49/mo</div>
                </div>
              </button>
            )}

            {/* Demo Option */}
            {showDemoButton && (
              <button
                type="button"
                onClick={handleDemoSignup}
                className="p-4 rounded-lg border border-neutral-600 bg-neutral-800/50 hover:border-neutral-500 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white flex items-center">
                      <Play className="w-4 h-4 mr-2" />
                      Try Demo First
                    </h4>
                    <p className="text-sm text-neutral-400">Explore without signing up</p>
                  </div>
                  <div className="text-neutral-400">→</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name fields for sign-up */}
        {mode === 'sign-up' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                First name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-neutral-500" />
                </div>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  className={cn(
                    'w-full pl-10 pr-3 py-3 bg-neutral-800 border rounded-lg',
                    'text-white placeholder-neutral-500 focus:outline-none focus:ring-2',
                    errors.firstName 
                      ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                      : 'border-neutral-600 focus:border-blue-500 focus:ring-blue-500/20'
                  )}
                  placeholder="John"
                  disabled={isPending}
                />
              </div>
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Last name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-neutral-500" />
                </div>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  className={cn(
                    'w-full pl-10 pr-3 py-3 bg-neutral-800 border rounded-lg',
                    'text-white placeholder-neutral-500 focus:outline-none focus:ring-2',
                    errors.lastName 
                      ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                      : 'border-neutral-600 focus:border-blue-500 focus:ring-blue-500/20'
                  )}
                  placeholder="Doe"
                  disabled={isPending}
                />
              </div>
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>
          </div>
        )}

        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              className={cn(
                'w-full pl-10 pr-3 py-3 bg-neutral-800 border rounded-lg',
                'text-white placeholder-neutral-500 focus:outline-none focus:ring-2',
                errors.email 
                  ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                  : 'border-neutral-600 focus:border-blue-500 focus:ring-blue-500/20'
              )}
              placeholder="john@example.com"
              autoComplete="email"
              disabled={isPending}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Password field (not for reset-password) */}
        {mode !== 'reset-password' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-neutral-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                className={cn(
                  'w-full pl-10 pr-12 py-3 bg-neutral-800 border rounded-lg',
                  'text-white placeholder-neutral-500 focus:outline-none focus:ring-2',
                  errors.password 
                    ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                    : 'border-neutral-600 focus:border-blue-500 focus:ring-blue-500/20'
                )}
                placeholder={mode === 'sign-up' ? 'Create a strong password' : 'Enter your password'}
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-neutral-500 hover:text-neutral-300" />
                ) : (
                  <Eye className="h-4 w-4 text-neutral-500 hover:text-neutral-300" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-400">{errors.password}</p>
            )}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {getSubmitButtonText()}
        </Button>

        {/* Demo Login Button (only for sign-in mode) */}
        {mode === 'sign-in' && (
          <Button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                email: 'demo@thorbis.com',
                password: 'demo123'
              });
            }}
            variant="outline"
            className="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Try Demo (demo@thorbis.com)
          </Button>
        )}
      </form>

      {/* Mode switching links */}
      <div className="mt-6 text-center space-y-2">
        {mode === 'sign-in' && (
          <>
            <p className="text-sm text-neutral-400">
              Don't have an account?{' '}
              <button
                onClick={() => onModeChange('sign-up')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign up
              </button>
            </p>
            <p className="text-sm">
              <button
                onClick={() => onModeChange('reset-password')}
                className="text-blue-400 hover:text-blue-300"
              >
                Forgot your password?
              </button>
            </p>
          </>
        )}
        
        {mode === 'sign-up' && (
          <p className="text-sm text-neutral-400">
            Already have an account?{' '}
            <button
              onClick={() => onModeChange('sign-in')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign in
            </button>
          </p>
        )}
        
        {mode === 'reset-password' && (
          <p className="text-sm text-neutral-400">
            Remember your password?{' '}
            <button
              onClick={() => onModeChange('sign-in')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export function AuthForms(props: AuthFormsProps) {
  return (
    <FormErrorBoundary>
      <AuthFormsContent {...props} />
    </FormErrorBoundary>
  );
}