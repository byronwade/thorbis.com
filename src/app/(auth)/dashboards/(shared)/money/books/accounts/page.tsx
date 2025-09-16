'use client'

/**
 * Chart of Accounts Page - Overlay-Free Design
 * 
 * This page manages the chart of accounts with a fully overlay-free interface:
 * - Dark-first implementation with Odixe color tokens
 * - Uses InlineAccountForm instead of AccountFormModal
 * - Uses ConfirmationBar instead of ConfirmDialog
 * - Electric blue (#1C8BFF) for focus states and primary actions
 * - Proper responsive design and accessibility
 * - Real-time search and filtering
 * 
 * Follows Thorbis Design System principles with no modal overlays.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { ACCOUNT_TYPE_LABELS, formatAccountCode } from '@/lib/chart-of-accounts'
import { ChartOfAccount, AccountType } from '@/types/accounting'
import { InlineAccountForm } from '@/components/forms/inline-account-form'
import { ConfirmationBar } from '@/components/panels/inline-panel'
import { AccountsService } from '@/lib/api/accounts'

// Loading and error states with Odixe design tokens
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="text-red-600 mb-4">{message}</div>
    <Button 
      onClick={onRetry} 
      variant="outline"
      className="border-gray-400 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Try Again
    </Button>
  </div>
)

interface AccountRowProps {
  account: ChartOfAccount
  onEdit: (account: ChartOfAccount) => void
  onDelete: (account: ChartOfAccount) => void
  onView: (account: ChartOfAccount) => void
}

function AccountRow({ account, onEdit, onDelete, onView }: AccountRowProps) {
  const balanceColor = account.balance > 0 ? 'text-green-600' : account.balance < 0 ? 'text-red-600' : 'text-gray-600'
  const balanceIcon = account.balance > 0 ? TrendingUp : account.balance < 0 ? TrendingDown : Minus

  return (
    <tr className="border-b border-gray-400 hover:bg-gray-100 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center">
          <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded text-gray-900">
            {formatAccountCode(account.code)}
          </code>
        </div>
      </td>
      <td className="py-3 px-4">
        <div>
          <div className="font-medium text-gray-900">{account.name}</div>
          {account.description && (
            <div className="text-sm text-gray-700">{account.description}</div>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant="outline" className="border-gray-400 text-gray-900">{account.type}</Badge>
      </td>
      <td className="py-3 px-4">
        <Badge variant="secondary" className="bg-gray-200 text-gray-900">{account.subtype.replace('_', ' ')}</Badge>
      </td>
      <td className="py-3 px-4 text-right">
        <div className={'flex items-center justify-end font-medium ${balanceColor}'}>
          {React.createElement(balanceIcon, { className: 'w-4 h-4 mr-1' })}
          ${Math.abs(account.balance).toLocaleString()}
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant={account.is_active ? 'default' : 'secondary'} 
               className={account.is_active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}>
          {account.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onView(account)}
            className="hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onEdit(account)}
            className="hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onDelete(account)}
            className="hover:bg-red-50 text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default function ChartOfAccountsPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [selectedType, setSelectedType] = useState<AccountType | 'all'>('all')
  const [showInactiveAccounts, setShowInactiveAccounts] = useState(false)
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Overlay-free UI states  
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | undefined>()
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [saving, setSaving] = useState(false)

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.code.includes(searchTerm) ||
                           (account.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      
      const matchesType = selectedType === 'all' || account.type === selectedType
      const matchesStatus = showInactiveAccounts || account.is_active
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [accounts, searchTerm, selectedType, showInactiveAccounts])

  const accountsByType = useMemo(() => {
    const types: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense']
    return types.reduce((acc, type) => {
      acc[type] = filteredAccounts.filter(account => account.type === type)
      return acc
    }, {} as Record<AccountType, ChartOfAccount[]>)
  }, [filteredAccounts])

  const totalsByType = useMemo(() => {
    const types: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense']
    return types.reduce((acc, type) => {
      const accounts = accountsByType[type] || []
      acc[type] = accounts.reduce((sum, account) => sum + account.balance, 0)
      return acc
    }, {} as Record<AccountType, number>)
  }, [accountsByType])

  const handleEdit = (account: ChartOfAccount) => {
    setSelectedAccount(account)
    setFormMode('edit')
    setIsFormPanelOpen(true)
  }

  const handleDelete = (account: ChartOfAccount) => {
    setSelectedAccount(account)
    setShowDeleteConfirmation(true)
  }

  const handleAddAccount = () => {
    setSelectedAccount(undefined)
    setFormMode('create')
    setIsFormPanelOpen(true)
  }

  const handleSaveAccount = async (accountData: Partial<ChartOfAccount>) => {
    setSaving(true)
    try {
      if (formMode === 'create') {
        const newAccount = await AccountsService.createAccount(accountData as Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at'>)
        setAccounts([...accounts, newAccount])
      } else if (selectedAccount) {
        const updatedAccount = await AccountsService.updateAccount(selectedAccount.id, accountData)
        setAccounts(accounts.map(account => 
          account.id === selectedAccount.id ? updatedAccount : account
        ))
      }
      setIsFormPanelOpen(false)
      setSelectedAccount(undefined)
    } catch (error) {
      console.error('Error saving account:', error)
      setError(error instanceof Error ? error.message : 'Failed to save account')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedAccount) return
    
    setSaving(true)
    try {
      await AccountsService.deleteAccount(selectedAccount.id)
      setAccounts(accounts.filter(account => account.id !== selectedAccount.id))
      setShowDeleteConfirmation(false)
      setSelectedAccount(undefined)
    } catch (error) {
      console.error('Error deleting account:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false)
    setSelectedAccount(undefined)
  }

  const handleView = (account: ChartOfAccount) => {
    console.log('View account:', account)
    // TODO: Open account detail view
  }

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await AccountsService.getAccounts()
      setAccounts(data)
    } catch (error) {
      console.error('Error loading accounts:', error)
      setError(error instanceof Error ? error.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    loadAccounts()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            Chart of Accounts
          </h1>
          <p className="text-muted-foreground">Manage your account structure and track balances</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            Chart of Accounts
          </h1>
          <p className="text-muted-foreground">Manage your account structure and track balances</p>
        </div>
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            Chart of Accounts
          </h1>
          <p className="text-gray-700">Manage your account structure and track balances</p>
        </div>
        <Button 
          onClick={handleAddAccount}
          className="bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(ACCOUNT_TYPE_LABELS).map(([type, label]) => {
          const total = totalsByType[type as AccountType] || 0
          const isPositive = total >= 0
          return (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={'text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'
              }'}>'
                  ${Math.abs(total).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {accountsByType[type as AccountType]?.length || 0} accounts
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as AccountType | 'all')}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([type, label]) => (
                  <option key={type} value={type}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showInactiveAccounts}
                  onChange={(e) => setShowInactiveAccounts(e.target.checked)}
                  className="rounded border-border"
                />
                <span>Show inactive</span>
              </label>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Accounts ({filteredAccounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Code</th>
                  <th className="py-3 px-4 text-left font-medium">Account Name</th>
                  <th className="py-3 px-4 text-left font-medium">Type</th>
                  <th className="py-3 px-4 text-left font-medium">Subtype</th>
                  <th className="py-3 px-4 text-right font-medium">Balance</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAccounts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No accounts found matching your criteria.</p>
              <Button className="mt-4" onClick={() => setSearchTerm(')}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overlay-Free Components */}
      
      {/* Delete Confirmation Bar */}
      <ConfirmationBar
        isVisible={showDeleteConfirmation}
        title="Delete Account"
        message={'Are you sure you want to delete the account "${selectedAccount?.name}"? This action cannot be undone.'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText={saving ? 'Deleting...' : 'Delete'}
        variant="destructive"
      />

      {/* Inline Account Form Panel */}
      <InlineAccountForm
        isOpen={isFormPanelOpen}
        onClose={() => {
          if (!saving) {
            setIsFormPanelOpen(false)
            setSelectedAccount(undefined)
          }
        }}
        onSave={handleSaveAccount}
        account={selectedAccount}
        mode={formMode}
      />
    </div>
  )
}