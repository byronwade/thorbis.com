'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Globe, Mail, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@thorbis/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { createOrganizationAction } from '@/lib/auth/actions';

// =============================================================================
// INDUSTRY CONFIGURATION
// =============================================================================

const INDUSTRIES = [
  {
    id: 'hs',
    name: 'Home Services',
    description: 'Plumbing, HVAC, electrical, and other home services',
    icon: '🏠',
    color: 'bg-blue-500',
  },
  {
    id: 'rest',
    name: 'Restaurant',
    description: 'Restaurants, cafes, food trucks, and catering',
    icon: '🍽️',
    color: 'bg-orange-500',
  },
  {
    id: 'auto',
    name: 'Auto Services',
    description: 'Auto repair, maintenance, and vehicle services',
    icon: '🔧',
    color: 'bg-red-500',
  },
  {
    id: 'ret',
    name: 'Retail',
    description: 'Retail stores, e-commerce, and product sales',
    icon: '🛍️',
    color: 'bg-green-500',
  },
  {
    id: 'edu',
    name: 'Education',
    description: 'Training, courses, and educational services',
    icon: '📚',
    color: 'bg-purple-500',
  },
  {
    id: 'payroll',
    name: 'Payroll',
    description: 'Payroll processing and HR services',
    icon: '💰',
    color: 'bg-yellow-500',
  },
] as const;

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
] as const;

// =============================================================================
// INTERFACES
// =============================================================================

interface FormData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  timezone: string;
  currency: string;
}

interface FormErrors {
  [key: string]: string;
}

// =============================================================================
// ORGANIZATION ONBOARDING COMPONENT
// =============================================================================

export function OrganizationOnboarding() {
  const router = useRouter();
  const { user, refreshOrganizations } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: ',
    slug: ',
    email: user?.email || ',
    phone: ',
    website: ',
    industry: ',
    timezone: 'America/New_York',
    currency: 'USD',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate slug from name
      ...(field === 'name' && {
        slug: value
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 50)
      })
    }));

    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleIndustrySelect = (industryId: string) => {
    setFormData(prev => ({
      ...prev,
      industry: industryId,
    }));
    
    if (errors.industry) {
      setErrors(prev => ({
        ...prev,
        industry: undefined,
      }));
    }
  };

  // =============================================================================
  // FORM VALIDATION
  // =============================================================================

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Organization slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    return newErrors;
  };

  // =============================================================================
  // FORM SUBMISSION
  // =============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        const result = await createOrganizationAction({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          website: formData.website.trim() || undefined,
          industry: formData.industry as any,
          timezone: formData.timezone,
          currency: formData.currency,
        });

        if (result.error) {
          setErrors({ general: result.error });
        } else if (result.success && result.organization) {
          setSuccess('Organization created successfully!');
          
          // Refresh user organizations
          await refreshOrganizations();
          
          // Redirect to the organization's dashboard
          setTimeout(() => {
            router.push('/${result.organization.industry}');
          }, 1500);
        }
      } catch (error) {
        console.error('Organization creation error:', error);
        setErrors({ 
          general: 'An unexpected error occurred. Please try again.' 
        });
      }
    });
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Create Your Organization
          </h1>
          <p className="text-neutral-400">
            Set up your organization to start using Thorbis for your business operations.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-300">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{errors.general}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-3">
              Organization Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                className={cn(
                  'w-full pl-11 pr-4 py-3 bg-neutral-800 border rounded-lg',
                  'text-white placeholder-neutral-500 focus:outline-none focus:ring-2',
                  errors.name 
                    ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                    : 'border-neutral-600 focus:border-blue-500 focus:ring-blue-500/20'
                )}
                placeholder="Acme Corp"
                disabled={isPending}
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Organization Slug */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-3">
              Organization Slug *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-neutral-500 text-sm">thorbis.com/</span>
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={handleInputChange('slug')}
                className={cn(
                  'w-full pl-24 pr-4 py-3 bg-neutral-800 border rounded-lg',
                  'text-white placeholder-neutral-500 focus:outline-none focus:ring-2',
                  errors.slug 
                    ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                    : 'border-neutral-600 focus:border-blue-500 focus:ring-blue-500/20'
                )}
                placeholder="acme-corp"
                disabled={isPending}
              />
            </div>
            {errors.slug && (
              <p className="mt-2 text-sm text-red-400">{errors.slug}</p>
            )}
            <p className="mt-2 text-xs text-neutral-500">
              This will be your organization's URL identifier. Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>

          {/* Industry Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-3">
              Industry *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INDUSTRIES.map((industry) => (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() => handleIndustrySelect(industry.id)}
                  className={cn(
                    'p-4 border rounded-lg text-left transition-all',
                    'hover:bg-neutral-800 focus:outline-none focus:ring-2',
                    formData.industry === industry.id
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                      : 'border-neutral-600 hover:border-neutral-500',
                    errors.industry && 'border-red-600'
                  )}
                  disabled={isPending}
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg text-sm',
                      industry.color
                    )}>
                      {industry.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white text-sm">
                        {industry.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        {industry.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.industry && (
              <p className="mt-2 text-sm text-red-400">{errors.industry}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={cn(
                    'w-full pl-11 pr-4 py-3 bg-neutral-800 border rounded-lg',
                    'text-white placeholder-neutral-500 focus:outline-none focus:ring-2',
                    errors.email 
                      ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
                      : 'border-neutral-600 focus:border-blue-500 focus:ring-blue-500/20'
                  )}
                  placeholder="hello@acme.com"
                  disabled={isPending}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  className="w-full pl-11 pr-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="+1 (555) 123-4567"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Website and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange('website')}
                  className="w-full pl-11 pr-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="https://acme.com"
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={handleInputChange('timezone')}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                disabled={isPending}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isPending ? 'Creating Organization...' : 'Create Organization'}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500">
            You can modify these settings later in your organization dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}