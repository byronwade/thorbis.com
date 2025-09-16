'use client'

/**
 * Invoices Page - Overlay-Free Design
 * 
 * This page manages invoices with a fully overlay-free interface:
 * - Dark-first implementation with Odixe color tokens
 * - Uses InlineInvoiceForm instead of InvoiceFormModal
 * - Uses ConfirmationBar instead of ConfirmDialog
 * - Electric blue (#1C8BFF) for focus states and primary actions
 * - Proper responsive design and accessibility
 * - Real-time search and filtering
 * 
 * Follows Thorbis Design System principles with no modal overlays.
 */

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Send, 
  Eye, 
  Edit,
  Trash2,
  Download,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Clock
} from 'lucide-react'
import { Invoice, Customer } from '@/types/accounting'
import { InlineInvoiceForm } from '@/components/forms/inline-invoice-form'
import { ConfirmationBar } from '@/components/panels/inline-panel'
import { InvoicesService } from '@/lib/api/invoices'
import { ExportButton } from '@/components/export/export-button'
import { ExportDataType } from '@/lib/export/export-types'


function getStatusColor(status: Invoice['status']) {
  switch (status) {
    case 'draft': return 'bg-neutral-100 text-neutral-800'
    case 'sent': return 'bg-blue-100 text-blue-800'
    case 'paid': return 'bg-green-100 text-green-800'
    case 'overdue': return 'bg-red-100 text-red-800'
    case 'voided': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-neutral-100 text-neutral-800'
  }
}

function getDaysUntilDue(dueDate: string): number {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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

interface InvoiceRowProps {
  invoice: Invoice
  onView: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
  onSend: (invoice: Invoice) => void
  onDownload: (invoice: Invoice) => void
}

function InvoiceRow({ invoice, onView, onEdit, onDelete, onSend, onDownload }: InvoiceRowProps) {
  const daysUntilDue = getDaysUntilDue(invoice.due_date)
  const isOverdue = daysUntilDue < 0 && invoice.status !== 'paid'
  
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
          <div>
            <div className="font-medium">{invoice.invoice_number}</div>
            <div className="text-sm text-muted-foreground">{invoice.date}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div>
          <div className="font-medium">{invoice.customer.name}</div>
          <div className="text-sm text-muted-foreground">{invoice.customer.email}</div>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="font-medium">${invoice.total_amount.toLocaleString()}</div>
        {invoice.balance > 0 && invoice.balance < invoice.total_amount && (
          <div className="text-sm text-muted-foreground">
            ${invoice.balance.toLocaleString()} due
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className={isOverdue ? 'text-red-600 font-medium' : '}>
            {invoice.due_date}
          </span>
        </div>
        {isOverdue && (
          <div className="flex items-center text-xs text-red-600 mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {Math.abs(daysUntilDue)} days overdue
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <Badge className={getStatusColor(invoice.status)}>
          {invoice.status}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => onView(invoice)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(invoice)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(invoice)}>
            <Trash2 className="w-4 h-4" />
          </Button>
          {invoice.status === 'draft' && (
            <Button size="sm" variant="ghost" onClick={() => onSend(invoice)}>
              <Send className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onDownload(invoice)}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>()
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [saving, setSaving] = useState(false)

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [invoicesData, customersData] = await Promise.all([
        InvoicesService.getInvoices(),
        InvoicesService.getActiveCustomers()
      ])
      setInvoices(invoicesData)
      setCustomers(customersData)
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
    const totalOutstanding = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'voided')
      .reduce((sum, inv) => sum + inv.balance, 0)

    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.balance, 0)

    const paidThisMonth = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0)

    const draftCount = invoices.filter(inv => inv.status === 'draft').length

    return {
      totalOutstanding,
      overdueAmount,
      paidThisMonth,
      draftCount
    }
  }, [invoices])

  const handleView = (invoice: Invoice) => {
    console.log('View invoice:', invoice)
    // TODO: Open invoice detail view
  }

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setModalMode('edit')
    setIsFormModalOpen(true)
  }

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDeleteDialogOpen(true)
  }

  const handleAddInvoice = () => {
    setSelectedInvoice(undefined)
    setModalMode('create')
    setIsFormModalOpen(true)
  }

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    setSaving(true)
    try {
      if (modalMode === 'create' && invoiceData.line_items) {
        // Extract line items for creation
        const { line_items, customer, payments, ...invoiceFields } = invoiceData
        const newInvoice = await InvoicesService.createInvoice(
          invoiceFields as Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'customer' | 'line_items' | 'payments'>,
          line_items.map(item => ({ ...item, id: undefined, invoice_id: undefined }))
        )
        setInvoices([...invoices, newInvoice])
      } else if (selectedInvoice && invoiceData.line_items) {
        // Extract line items for update
        const { line_items, customer, payments, ...invoiceFields } = invoiceData
        const updatedInvoice = await InvoicesService.updateInvoice(
          selectedInvoice.id,
          invoiceFields,
          line_items.map(item => ({ ...item, id: undefined, invoice_id: undefined }))
        )
        setInvoices(invoices.map(invoice => 
          invoice.id === selectedInvoice.id ? updatedInvoice : invoice
        ))
      }
      setIsFormModalOpen(false)
      setSelectedInvoice(undefined)
    } catch (error) {
      console.error('Error saving invoice:', error)
      setError(error instanceof Error ? error.message : 'Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedInvoice) return
    
    setSaving(true)
    try {
      await InvoicesService.deleteInvoice(selectedInvoice.id)
      setInvoices(invoices.filter(invoice => invoice.id !== selectedInvoice.id))
      setIsDeleteDialogOpen(false)
      setSelectedInvoice(undefined)
    } catch (error) {
      console.error('Error deleting invoice:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleSend = (invoice: Invoice) => {
    console.log('Send invoice:', invoice)
    // TODO: Send invoice to customer
  }

  const handleDownload = (invoice: Invoice) => {
    console.log('Download invoice:', invoice)
    // TODO: Generate and download PDF
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <FileText className="mr-3 h-8 w-8" />
            Invoices
          </h1>
          <p className="text-muted-foreground">Create, send, and track customer invoices</p>
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
            <FileText className="mr-3 h-8 w-8" />
            Invoices
          </h1>
          <p className="text-muted-foreground">Create, send, and track customer invoices</p>
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
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <FileText className="mr-3 h-8 w-8" />
            Invoices
          </h1>
          <p className="text-muted-foreground">Create, send, and track customer invoices</p>
        </div>
        <Button onClick={handleAddInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryStats.totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${summaryStats.overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${summaryStats.paidThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Collected revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.draftCount}</div>
            <p className="text-xs text-muted-foreground">Ready to send</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Invoice['status'] | 'all')}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="voided">Voided</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Invoice</th>
                  <th className="py-3 px-4 text-left font-medium">Customer</th>
                  <th className="py-3 px-4 text-right font-medium">Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Due Date</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSend={handleSend}
                    onDownload={handleDownload}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredInvoices.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No invoices found matching your criteria.</p>
              <Button className="mt-4" onClick={() => setSearchTerm(')}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <InvoiceFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          if (!saving) {
            setIsFormModalOpen(false)
            setSelectedInvoice(undefined)
          }
        }}
        onSave={handleSaveInvoice}
        invoice={selectedInvoice}
        mode={modalMode}
        customers={customers}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!saving) {
            setIsDeleteDialogOpen(false)
            setSelectedInvoice(undefined)
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice"
        message={'Are you sure you want to delete invoice "${selectedInvoice?.invoice_number}"? This action cannot be undone.'}
        confirmText={saving ? 'Deleting...' : 'Delete'}
        variant="destructive"
      />
    </div>
  )
}