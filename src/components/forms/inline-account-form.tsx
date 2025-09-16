'use client'

/**
 * Inline Account Form Component - Overlay-Free Design
 * 
 * This component replaces the AccountFormModal with an inline form panel
 * that slides in from the side. Follows Thorbis Design System principles:
 * - Dark-first implementation with Odixe color tokens
 * - No modal overlays - uses InlinePanel component
 * - Electric blue (#1C8BFF) for focus states and primary actions  
 * - Comprehensive form validation with real-time feedback
 * - Proper accessibility with keyboard navigation and screen reader support
 * - Error handling with user-friendly messaging
 * 
 * Used for creating and editing chart of accounts entries in the books app.
 */

import { useEffect } from 'react'
import { InlinePanel } from '@/components/panels/inline-panel'
import { Button } from '@/components/ui/button'
import { ChartOfAccount, AccountType, AccountSubtype } from '@/types/accounting'
import { Save } from 'lucide-react'
import { CreateAccountSchema, UpdateAccountSchema } from '@/lib/validation/schemas'
import { useFormValidation } from '@/hooks/use-form-validation'
import { ValidatedInput } from '@/components/forms/validated-input'
import { ValidatedSelect } from '@/components/forms/validated-select'
import { ValidatedTextarea } from '@/components/forms/validated-textarea'
import { useFormErrorHandling } from '@/hooks/use-error-handling'
import { ComponentErrorBoundary } from '@/components/error-handling/error-boundary'

interface InlineAccountFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (account: Partial<ChartOfAccount>) => void
  account?: ChartOfAccount
  mode: 'create' | 'edit'
}

const accountTypes: { value: AccountType; label: string }[] = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' }
]

const accountSubtypes: { [key in AccountType]: { value: AccountSubtype; label: string }[] } = {
  asset: [
    { value: 'current_asset', label: 'Current Asset' },
    { value: 'fixed_asset', label: 'Fixed Asset' }
  ],
  liability: [
    { value: 'current_liability', label: 'Current Liability' },
    { value: 'long_term_liability', label: 'Long Term Liability' }
  ],
  equity: [
    { value: 'equity', label: 'Equity' }
  ],
  revenue: [
    { value: 'operating_revenue', label: 'Operating Revenue' },
    { value: 'non_operating_revenue', label: 'Non-Operating Revenue' }
  ],
  expense: [
    { value: 'operating_expense', label: 'Operating Expense' },
    { value: 'non_operating_expense', label: 'Non-Operating Expense' }
  ]
}

export function InlineAccountForm({ isOpen, onClose, onSave, account, mode }: InlineAccountFormProps) {
  const schema = mode === 'create' ? CreateAccountSchema : UpdateAccountSchema
  const { handleSubmissionError, resetFormErrors } = useFormErrorHandling()
  
  const {
    values,
    errors,
    isValid,
    isSubmitting,
    getFieldProps,
    setValue,
    setValues,
    handleSubmit,
    reset
  } = useFormValidation({
    schema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (data) => {
      try {
        resetFormErrors() // Clear any previous errors
        
        const accountData: Partial<ChartOfAccount> = {
          ...data,
          id: account?.id,
          created_at: account?.created_at,
          updated_at: new Date().toISOString()
        }
        
        await onSave(accountData)
        onClose()
      } catch (_error) {
        // Handle form submission errors with proper user feedback
        await handleSubmissionError(error)
        throw error // Re-throw to keep form in error state
      }
    }
  })

  // Initialize form data when account changes
  useEffect(() => {
    if (account && mode === 'edit') {
      setValues({
        code: account.code,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        description: account.description || ',
        balance: account.balance,
        is_active: account.is_active
      })
    } else if (mode === 'create') {
      reset({
        code: ',
        name: ',
        type: 'asset' as AccountType,
        subtype: 'current_asset' as AccountSubtype,
        description: ',
        balance: 0,
        is_active: true
      })
    }
  }, [account, mode, setValues, reset])

  const handleTypeChange = (type: AccountType) => {
    setValue('type', type)
    setValue('subtype', accountSubtypes[type][0].value)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <ComponentErrorBoundary>
      <InlinePanel
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'create' ? 'Create New Account' : 'Edit Account'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <ValidatedInput
              label="Account Code"
              placeholder="e.g., 1000"
              maxLength={10}
              required
              {...getFieldProps('code')}
              description="Unique code to identify this account (numbers only)"
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 placeholder-gray-600"
            />

            <ValidatedInput
              label="Account Name"
              placeholder="e.g., Checking Account"
              maxLength={255}
              required
              {...getFieldProps('name')}
              description="Descriptive name for the account"
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 placeholder-gray-600"
            />

            <ValidatedSelect
              label="Account Type"
              options={accountTypes}
              value={values.type as string}
              onChange={handleTypeChange}
              required
              error={errors.type}
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900"
            />

            <ValidatedSelect
              label="Account Subtype"
              options={accountSubtypes[values.type as AccountType] || accountSubtypes.asset}
              value={values.subtype as string}
              onChange={(value) => setValue('subtype', value)}
              required
              error={errors.subtype}
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900"
            />

            <ValidatedInput
              label="Opening Balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...getFieldProps('balance')}
              onValueChange={(value) => setValue('balance', parseFloat(value) || 0)}
              description="Starting balance for this account"
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 placeholder-gray-600"
            />

            <div className="flex items-center space-x-2">
              <input
                id="is_active"
                type="checkbox"
                checked={values.is_active}
                onChange={(e) => setValue('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
                Active Account
              </label>
            </div>

            <ValidatedTextarea
              label="Description"
              placeholder="Optional description for this account"
              maxLength={1000}
              showCharCount
              rows={3}
              {...getFieldProps('description')}
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 placeholder-gray-600"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-400">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="border-gray-400 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting 
                ? (mode === 'create' ? 'Creating...' : 'Saving...')
                : (mode === 'create' ? 'Create Account' : 'Save Changes')
              }
            </Button>
          </div>
        </form>
      </InlinePanel>
    </ComponentErrorBoundary>
  )
}