'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  Upload, 
  Eye, 
  Edit,
  Trash2,
  Bot,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react'
import { Transaction, ChartOfAccount } from '@/types/accounting'
import { formatConfidence, getConfidenceColor } from '@/lib/ai-categorization'
import { InlineTransactionForm } from '@/components/forms/inline-transaction-form'
import { ConfirmationBar } from '@/components/panels/inline-panel'
import { TransactionsService } from '@/lib/api/transactions'
import { AccountsService } from '@/lib/api/accounts'
import { ExportButton } from '@/components/export/export-button'
import { ExportDataType } from '@/lib/export/export-types'


interface TransactionRowProps {
  transaction: Transaction
  onView: (transaction: Transaction) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

function TransactionRow({ transaction, onView, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.entries.some(entry => entry.account.type === 'revenue')
  const primaryAccount = transaction.entries.find(entry => 
    entry.account.type === 'expense' || entry.account.type === 'revenue'
  )?.account || transaction.entries[0].account

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center">
          <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
          <div>
            <div className="font-medium">{transaction.description}</div>
            <div className="text-sm text-muted-foreground">{transaction.date}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          <span className="text-sm font-mono mr-2">{primaryAccount.code}</span>
          <span>{primaryAccount.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className={'font-medium ${isIncome ? 'text-green-600' : 'text-red-600'
              }'}>'
          {isIncome ? '+' : '-'}${transaction.total_amount.toLocaleString()}
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant={transaction.status === 'posted' ? 'default' : 'secondary'}>
          {transaction.status}
        </Badge>
      </td>
      <td className="py-3 px-4">
        {transaction.ai_categorization && (
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-primary" />
            <Badge 
              variant="outline" 
              className={'text-xs ${getConfidenceColor(transaction.ai_categorization.confidence)}'}
            >
              {formatConfidence(transaction.ai_categorization.confidence)}
            </Badge>
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => onView(transaction)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(transaction)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(transaction)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

// Loading and error states
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="text-red-600 mb-4">{message}</div>
    <Button onClick={onRetry} variant="outline">Try Again</Button>
  </div>
)

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [statusFilter, setStatusFilter] = useState<Transaction['status'] | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [availableAccounts, setAvailableAccounts] = useState<ChartOfAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>()
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [saving, setSaving] = useState(false)

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter

      let matchesType = true
      if (typeFilter === 'income') {
        matchesType = transaction.entries.some(entry => entry.account.type === 'revenue')
      } else if (typeFilter === 'expense') {
        matchesType = transaction.entries.some(entry => entry.account.type === 'expense')
      }

      return matchesSearch && matchesStatus && matchesType
    })
  }, [transactions, searchTerm, statusFilter, typeFilter])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [transactionsData, accountsData] = await Promise.all([
        TransactionsService.getTransactions(),
        AccountsService.getAccounts()
      ])
      setTransactions(transactionsData)
      setAvailableAccounts(accountsData)
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    loadData()
  }

  const summaryStats = useMemo(() => {
    const totalIncome = transactions
      .filter(txn => txn.entries.some(entry => entry.account.type === 'revenue'))
      .reduce((sum, txn) => sum + txn.total_amount, 0)

    const totalExpenses = transactions
      .filter(txn => txn.entries.some(entry => entry.account.type === 'expense'))
      .reduce((sum, txn) => sum + txn.total_amount, 0)

    const pendingCount = transactions.filter(txn => txn.status === 'draft').length

    const aiCategorized = transactions.filter(txn => txn.ai_categorization).length
    const aiAccuracy = transactions.reduce((sum, txn) => 
      sum + (txn.ai_categorization?.confidence || 0), 0
    ) / transactions.length

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      pendingCount,
      aiCategorized,
      aiAccuracy
    }
  }, [transactions])

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Receipt className="mr-3 h-8 w-8" />
            Transactions
          </h1>
          <p className="text-muted-foreground">Track and manage all your financial transactions</p>
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
            <Receipt className="mr-3 h-8 w-8" />
            Transactions
          </h1>
          <p className="text-muted-foreground">Track and manage all your financial transactions</p>
        </div>
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    )
  }

  const handleView = (transaction: Transaction) => {
    console.log('View transaction:', transaction)
    // TODO: Open transaction detail view
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setModalMode('edit')
    setIsFormModalOpen(true)
  }

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteDialogOpen(true)
  }

  const handleAddTransaction = () => {
    setSelectedTransaction(undefined)
    setModalMode('create')
    setIsFormModalOpen(true)
  }

  const handleSaveTransaction = async (transactionData: Partial<Transaction>) => {
    setSaving(true)
    try {
      if (modalMode === 'create' && transactionData.entries) {
        // Extract entries for creation
        const { entries, ...transactionFields } = transactionData
        const entriesForCreation = entries.map(entry => ({
          account_id: entry.account_id,
          debit_amount: entry.debit_amount,
          credit_amount: entry.credit_amount,
          description: entry.description
        }))
        
        const newTransaction = await TransactionsService.createTransaction(
          transactionFields as Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'entries'>,
          entriesForCreation
        )
        setTransactions([...transactions, newTransaction])
      } else if (selectedTransaction && transactionData.entries) {
        // Extract entries for update
        const { entries, ...transactionFields } = transactionData
        const entriesForUpdate = entries.map(entry => ({
          account_id: entry.account_id,
          debit_amount: entry.debit_amount,
          credit_amount: entry.credit_amount,
          description: entry.description
        }))
        
        const updatedTransaction = await TransactionsService.updateTransaction(
          selectedTransaction.id,
          transactionFields,
          entriesForUpdate
        )
        setTransactions(transactions.map(transaction => 
          transaction.id === selectedTransaction.id ? updatedTransaction : transaction
        ))
      }
      setIsFormModalOpen(false)
      setSelectedTransaction(undefined)
    } catch (error) {
      console.error('Error saving transaction:', error)
      setError(error instanceof Error ? error.message : 'Failed to save transaction')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return
    
    setSaving(true)
    try {
      await TransactionsService.deleteTransaction(selectedTransaction.id)
      setTransactions(transactions.filter(transaction => transaction.id !== selectedTransaction.id))
      setIsDeleteDialogOpen(false)
      setSelectedTransaction(undefined)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete transaction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Receipt className="mr-3 h-8 w-8" />
            Transactions
          </h1>
          <p className="text-muted-foreground">Track and manage all your financial transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <ExportButton
            dataType={ExportDataType.TRANSACTIONS}
            variant="dropdown"
            defaultFilters={{ 
              status: statusFilter !== 'all' ? statusFilter : undefined,
              type: typeFilter !== 'all' ? typeFilter : undefined
            }}
            defaultDateRange={undefined}
          />
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={handleAddTransaction}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summaryStats.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summaryStats.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <div className="h-4 w-4 rounded bg-primary"></div>
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold ${summaryStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }'}>'
              ${Math.abs(summaryStats.netIncome).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.netIncome >= 0 ? 'Profit' : 'Loss'} this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(summaryStats.aiAccuracy * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.aiCategorized} auto-categorized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground mb-1">AI-Powered Transaction Management</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our AI automatically categorizes transactions with 89% average accuracy and provides insights to optimize your financial processes.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{summaryStats.pendingCount} transactions need review</span>
                </div>
                <Button size="sm" variant="outline">
                  Review Pending
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Transaction['status'] | 'all')}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="voided">Voided</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Description</th>
                  <th className="py-3 px-4 text-left font-medium">Account</th>
                  <th className="py-3 px-4 text-right font-medium">Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">AI Category</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No transactions found matching your criteria.</p>
              <Button className="mt-4" onClick={() => setSearchTerm(')}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          if (!saving) {
            setIsFormModalOpen(false)
            setSelectedTransaction(undefined)
          }
        }}
        onSave={handleSaveTransaction}
        transaction={selectedTransaction}
        mode={modalMode}
        accounts={availableAccounts}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!saving) {
            setIsDeleteDialogOpen(false)
            setSelectedTransaction(undefined)
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={'Are you sure you want to delete the transaction "${selectedTransaction?.description}"? This action cannot be undone.'}
        confirmText={saving ? 'Deleting...' : 'Delete'}
        variant="destructive"
      />
    </div>
  )
}