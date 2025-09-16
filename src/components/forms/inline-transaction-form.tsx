'use client'

/**
 * Inline Transaction Form Component - Overlay-Free Design
 * 
 * This component replaces the TransactionFormModal with an inline form panel
 * that slides in from the side. Follows Thorbis Design System principles:
 * - Dark-first implementation with Odixe color tokens
 * - No modal overlays - uses InlinePanel component  
 * - Electric blue (#1C8BFF) for focus states and primary actions
 * - Complex transaction form with journal entries and balance validation
 * - Real-time balance checking and journal entry validation
 * - File upload support for receipts and attachments
 * - Proper accessibility and keyboard navigation
 * 
 * Used for creating and editing transactions in the books app.
 */

import { useState, useEffect } from 'react'
import { InlinePanel } from '@/components/panels/inline-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Transaction, ChartOfAccount, TransactionEntry } from '@/types/accounting'
import { Save, Plus, Minus, Receipt } from 'lucide-react'
import { FileUpload } from '@/components/file-upload/file-upload'
import { UploadContext } from '@/lib/file-handling/file-types'
import { useFileUpload } from '@/hooks/use-file-upload'
import { ComponentErrorBoundary } from '@/components/error-handling/error-boundary'

interface InlineTransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Partial<Transaction>) => void
  transaction?: Transaction
  mode: 'create' | 'edit'
  accounts: ChartOfAccount[]
}

interface JournalEntry {
  account_id: string
  account_name: string
  debit_amount: number
  credit_amount: number
}

export function InlineTransactionForm({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction, 
  mode,
  accounts 
}: InlineTransactionFormProps) {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as Transaction['type'],
    description: transaction?.description || ','
    date: transaction?.date || new Date().toISOString().split('T')[0],
    total_amount: transaction?.total_amount || 0,
    reference_number: transaction?.reference_number || ','
    category: transaction?.category || '
  })

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(
    transaction?.entries?.map(entry => ({
      account_id: entry.account_id,
      account_name: accounts.find(a => a.id === entry.account_id)?.name || entry.account?.name || ',
      debit_amount: entry.debit_amount,
      credit_amount: entry.credit_amount
    })) || [
      { account_id: ', account_name: ', debit_amount: 0, credit_amount: 0 },
      { account_id: ', account_name: ', debit_amount: 0, credit_amount: 0 }
    ]
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // File upload functionality for receipts
  const {
    files: receiptFiles,
    addFiles: addReceiptFiles,
    removeFile: removeReceiptFile,
    isUploading: isUploadingReceipts,
    loadFiles: loadReceiptFiles
  } = useFileUpload({
    context: UploadContext.TRANSACTION_RECEIPT,
    entityId: transaction?.id,
    entityType: 'transaction',
    multiple: true,
    maxFiles: 5,
    onUploadComplete: (files) => {
      console.log('Receipt files uploaded:', files)
    }
  })

  // Load existing receipt files when editing
  useEffect(() => {
    if (transaction?.id && mode === 'edit') {
      loadReceiptFiles()
    }
  }, [transaction?.id, mode, loadReceiptFiles])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (formData.total_amount <= 0) {
      newErrors.total_amount = 'Amount must be greater than 0'
    }

    // Validate journal entries
    const validEntries = journalEntries.filter(entry => 
      entry.account_id && (entry.debit_amount > 0 || entry.credit_amount > 0)
    )

    if (validEntries.length < 2) {
      newErrors.entries = 'At least two journal entries are required'
    }

    const totalDebits = journalEntries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0)
    const totalCredits = journalEntries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0)

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      newErrors.balance = 'Total debits must equal total credits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const validJournalEntries = journalEntries.filter(entry => 
      entry.account_id && (entry.debit_amount > 0 || entry.credit_amount > 0)
    ).map(entry => ({
      id: ',
      transaction_id: ',
      account_id: entry.account_id,
      account: accounts.find(a => a.id === entry.account_id)!,
      debit_amount: entry.debit_amount || 0,
      credit_amount: entry.credit_amount || 0,
      created_at: new Date().toISOString()
    }))

    const transactionData: Partial<Transaction> = {
      ...formData,
      entries: validJournalEntries,
      account_id: validJournalEntries[0]?.account_id || ','
      amount: formData.total_amount,
      status: 'draft',
      id: transaction?.id,
      created_at: transaction?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    onSave(transactionData)
    onClose()
  }

  const addJournalEntry = () => {
    setJournalEntries([...journalEntries, { account_id: ', account_name: ', debit_amount: 0, credit_amount: 0 }])
  }

  const removeJournalEntry = (index: number) => {
    if (journalEntries.length > 2) {
      setJournalEntries(journalEntries.filter((_, i) => i !== index))
    }
  }

  const updateJournalEntry = (index: number, field: keyof JournalEntry, value: string | number) => {
    const updated = [...journalEntries]
    
    if (field === 'account_id') {
      const account = accounts.find(a => a.id === value)
      updated[index] = {
        ...updated[index],
        account_id: value as string,
        account_name: account?.name || '
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      }
    }
    
    setJournalEntries(updated)
  }

  const totalDebits = journalEntries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0)
  const totalCredits = journalEntries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

  return (
    <InlinePanel
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Transaction' : 'Edit Transaction'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
              Transaction Type <span className="text-red-600">*</span>
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Transaction['type'] }))}
              className="w-full px-3 py-2 bg-gray-25 border border-gray-400 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-2">
              Date <span className="text-red-600">*</span>
            </label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 ${errors.date ? 'border-red-500' : '
              }'}
            />
            {errors.date && (
              <p className="text-red-600 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label htmlFor="reference_number" className="block text-sm font-medium text-gray-900 mb-2">
              Reference Number
            </label>
            <Input
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
              placeholder="e.g., CHK-001, WIRE-123"
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 placeholder-gray-600"
            />
          </div>

          <div>
            <label htmlFor="total_amount" className="block text-sm font-medium text-gray-900 mb-2">
              Amount <span className="text-red-600">*</span>
            </label>
            <Input
              id="total_amount"
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
              className={'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 ${errors.total_amount ? 'border-red-500' : '
              }'}
            />
            {errors.total_amount && (
              <p className="text-red-600 text-xs mt-1">{errors.total_amount}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
              Category
            </label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Office Supplies, Marketing"
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 placeholder-gray-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the transaction"
            className={'w-full px-3 py-2 bg-gray-25 border border-gray-400 rounded-lg text-sm resize-none text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 ${
              errors.description ? 'border-red-500' : '
              }'}'
          />
          {errors.description && (
            <p className="text-red-600 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* Journal Entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Journal Entries</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addJournalEntry}
              className="border-gray-400 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Entry
            </Button>
          </div>

          <div className="space-y-3">
            {journalEntries.map((entry, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 border border-gray-400 rounded-lg bg-gray-25">
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Account
                  </label>
                  <select
                    value={entry.account_id}
                    onChange={(e) => updateJournalEntry(index, 'account_id', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-400 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                  >
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Debit
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={entry.debit_amount || ' '}'
                    onChange={(e) => updateJournalEntry(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-white text-gray-900"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Credit
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={entry.credit_amount || ' '}'
                    onChange={(e) => updateJournalEntry(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-white text-gray-900"
                  />
                </div>

                <div className="col-span-1">
                  {journalEntries.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJournalEntry(index)}
                      className="p-2 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                    >
                      <Minus className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Balance Summary */}
          <div className={'mt-4 p-3 rounded-lg border ${isBalanced ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
              }'}>'
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Total Debits: <strong>${totalDebits.toFixed(2)}</strong></span>
              <span className="text-gray-700">Total Credits: <strong>${totalCredits.toFixed(2)}</strong></span>
              <span className={isBalanced ? 'text-green-700' : 'text-red-700'}>
                {isBalanced ? 'Balanced ✓' : 'Difference: $${Math.abs(totalDebits - totalCredits).toFixed(2)}'}
              </span>
            </div>
          </div>

          {errors.entries && (
            <p className="text-red-600 text-xs mt-1">{errors.entries}</p>
          )}
          {errors.balance && (
            <p className="text-red-600 text-xs mt-1">{errors.balance}</p>
          )}
        </div>

        {/* Receipt/Document Upload */}
        <div>
          <div className="flex items-center mb-4">
            <Receipt className="w-5 h-5 mr-2 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
          </div>
          <FileUpload
            context={UploadContext.TRANSACTION_RECEIPT}
            entityId={transaction?.id}
            entityType="transaction"
            multiple={true}
            maxFiles={5}
            existingFiles={receiptFiles}
            onUploadComplete={(files) => {
              console.log('Receipt files uploaded:', files)
              // Reload files to update the list
              loadReceiptFiles()
            }}
            onFileRemove={removeReceiptFile}
            disabled={isUploadingReceipts}
            className="mt-2"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-400">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="border-gray-400 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {mode === 'create' ? 'Create Transaction' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </InlinePanel>
  )
}