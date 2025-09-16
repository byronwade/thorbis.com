'use client'

/**
 * Inline Invoice Form Component - Overlay-Free Design
 * 
 * This component replaces the InvoiceFormModal with an inline form panel
 * that slides in from the side. Follows Thorbis Design System principles:
 * - Dark-first implementation with Odixe color tokens  
 * - No modal overlays - uses InlinePanel component
 * - Electric blue (#1C8BFF) for focus states and primary actions
 * - Complex invoice form with line items, tax calculations, and totals
 * - Real-time validation and automatic calculations
 * - Proper accessibility and keyboard navigation
 * 
 * Used for creating and editing invoices in the books app.
 */

import { useState, useEffect } from 'react'
import { InlinePanel } from '@/components/panels/inline-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Invoice, Customer, InvoiceLineItem } from '@/types/accounting'
import { Save, Plus, Minus, Calculator } from 'lucide-react'

interface InlineInvoiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (invoice: Partial<Invoice>) => void
  invoice?: Invoice
  mode: 'create' | 'edit'
  customers: Customer[]
}

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  line_total: number
  tax_rate: number
  account_id?: string
}

export function InlineInvoiceForm({ 
  isOpen, 
  onClose, 
  onSave, 
  invoice, 
  mode,
  customers 
}: InlineInvoiceFormProps) {
  const [formData, setFormData] = useState({
    invoice_number: invoice?.invoice_number || 'INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}',
    customer_id: invoice?.customer_id || ','
    date: invoice?.date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: invoice?.status || 'draft' as Invoice['status']
  })

  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoice?.line_items?.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
      tax_rate: item.tax_rate || 0,
      account_id: item.account_id
    })) || [
      { description: ', quantity: 1, unit_price: 0, line_total: 0, tax_rate: 0 }
    ]
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate totals whenever line items change
  useEffect(() => {
    const updatedLineItems = lineItems.map(item => ({
      ...item,
      line_total: item.quantity * item.unit_price
    }))
    
    if (JSON.stringify(updatedLineItems) !== JSON.stringify(lineItems)) {
      setLineItems(updatedLineItems)
    }
  }, [lineItems])

  const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0)
  const taxAmount = lineItems.reduce((sum, item) => sum + (item.line_total * (item.tax_rate / 100)), 0)
  const totalAmount = subtotal + taxAmount

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.invoice_number.trim()) {
      newErrors.invoice_number = 'Invoice number is required'
    }

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required'
    }

    if (!formData.date) {
      newErrors.date = 'Invoice date is required'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
    } else if (new Date(formData.due_date) < new Date(formData.date)) {
      newErrors.due_date = 'Due date cannot be before invoice date'
    }

    // Validate line items
    const validItems = lineItems.filter(item => 
      item.description.trim() && item.quantity > 0 && item.unit_price >= 0
    )

    if (validItems.length === 0) {
      newErrors.line_items = 'At least one line item is required'
    }

    lineItems.forEach((item, index) => {
      if (item.description.trim() && (item.quantity <= 0 || item.unit_price < 0)) {
        newErrors['item_${index}'] = 'Quantity must be positive and unit price cannot be negative'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const selectedCustomer = customers.find(c => c.id === formData.customer_id)
    
    const validLineItems: InvoiceLineItem[] = lineItems
      .filter(item => item.description.trim() && item.quantity > 0)
      .map((item, index) => ({
        id: invoice?.line_items?.[index]?.id || 'line_${index + 1}',
        invoice_id: invoice?.id || ','
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        tax_rate: item.tax_rate,
        account_id: item.account_id
      }))

    const invoiceData: Partial<Invoice> = {
      ...formData,
      customer: selectedCustomer!,
      line_items: validLineItems,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      balance: totalAmount,
      id: invoice?.id,
      created_at: invoice?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    onSave(invoiceData)
    onClose()
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: ', quantity: 1, unit_price: 0, line_total: 0, tax_rate: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    
    // Recalculate line total when quantity or unit price changes
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].line_total = updated[index].quantity * updated[index].unit_price
    }
    
    setLineItems(updated)
  }

  return (
    <InlinePanel
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Invoice' : 'Edit Invoice'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-900 mb-2">
              Invoice Number <span className="text-red-600">*</span>
            </label>
            <Input
              id="invoice_number"
              value={formData.invoice_number}
              onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
              className={'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 ${errors.invoice_number ? 'border-red-500' : '
              }'}
              placeholder="INV-2024-0001"
            />
            {errors.invoice_number && (
              <p className="text-red-600 text-xs mt-1">{errors.invoice_number}</p>
            )}
          </div>

          <div>
            <label htmlFor="customer_id" className="block text-sm font-medium text-gray-900 mb-2">
              Customer <span className="text-red-600">*</span>
            </label>
            <select
              id="customer_id"
              value={formData.customer_id}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
              className={'w-full px-3 py-2 bg-gray-25 border border-gray-400 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 ${
                errors.customer_id ? 'border-red-500' : `
              }'}'
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customer_id && (
              <p className="text-red-600 text-xs mt-1">{errors.customer_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-2">
              Invoice Date <span className="text-red-600">*</span>
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
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-900 mb-2">
              Due Date <span className="text-red-600">*</span>
            </label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className={'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-gray-25 text-gray-900 ${errors.due_date ? 'border-red-500' : '
              }'}
            />
            {errors.due_date && (
              <p className="text-red-600 text-xs mt-1">{errors.due_date}</p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addLineItem}
              className="border-gray-400 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 border border-gray-400 rounded-lg bg-gray-25">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description`, e.target.value)}
                    placeholder="Item or service description"
                    className={'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-white text-gray-900 ${errors['item_${index}'] ? 'border-red-500' : '}'}'
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="1"
                    className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-white text-gray-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Unit Price
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-white text-gray-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Tax Rate (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.tax_rate}
                    onChange={(e) => updateLineItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 border-gray-400 bg-white text-gray-900"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Total
                  </label>
                  <div className="px-3 py-2 bg-gray-200 rounded-lg text-sm font-medium text-gray-900">
                    ${item.line_total.toFixed(2)}
                  </div>
                </div>

                <div className="col-span-1">
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      className="p-2 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                    >
                      <Minus className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.line_items && (
            <p className="text-red-600 text-xs mt-2">{errors.line_items}</p>
          )}
        </div>

        {/* Totals Summary */}
        <div className="bg-gray-200/50 p-4 rounded-lg border border-gray-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-700">Subtotal:</span>
            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-700">Tax:</span>
            <span className="font-medium text-gray-900">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold border-t border-gray-400 pt-2 text-gray-900">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
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
            {mode === 'create' ? 'Create Invoice' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </InlinePanel>
  )
}