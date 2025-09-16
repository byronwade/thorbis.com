'use client'

/**
 * Export Button Component - Overlay-Free Design
 * 
 * This component replaces the ExportModal with an inline export panel.
 * Follows Thorbis Design System principles:
 * - Dark-first implementation with Odixe color tokens
 * - No modal overlays - uses InlineExportPanel component
 * - Electric blue (#1C8BFF) for focus states and primary actions
 * - Proper dropdown patterns without overlays
 * - Quick export functionality for common formats
 * 
 * Used throughout the books app for data export functionality.
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, FileSpreadsheet, File, ChevronDown } from 'lucide-react'
import { InlineExportPanel } from './inline-export-panel'
import { ExportFormat, ExportDataType } from '@/lib/export/export-types'
import { useQuickExport } from '@/hooks/use-export'

interface ExportButtonProps {
  dataType: ExportDataType
  variant?: 'button' | 'dropdown' | 'minimal'
  size?: 'sm' | 'default' | 'lg'
  defaultFilters?: Record<string, unknown>
  defaultDateRange?: { startDate: Date; endDate: Date }
  className?: string
  children?: React.ReactNode
}

export function ExportButton({
  dataType,
  variant = 'button',
  size = 'default',
  defaultFilters,
  defaultDateRange,
  className = ',
  children
}: ExportButtonProps) {
  const [showPanel, setShowPanel] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const { exportTransactions, exportInvoices, exportAccounts } = useQuickExport()

  const handleQuickExport = async (format: ExportFormat) => {
    switch (dataType) {
      case ExportDataType.TRANSACTIONS:
        await exportTransactions(defaultDateRange, format)
        break
      case ExportDataType.INVOICES:
        await exportInvoices(defaultFilters?.status, format)
        break
      case ExportDataType.ACCOUNTS:
        await exportAccounts(format)
        break
      default:
        // For other data types, open the panel
        setShowPanel(true)
    }
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size={size}
          onClick={() => setShowDropdown(!showDropdown)}
          className={'${className}'}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-20">
              <div className="py-1">
                <button
                  onClick={() => {
                    handleQuickExport(ExportFormat.EXCEL)
                    setShowDropdown(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as Excel
                </button>
                
                <button
                  onClick={() => {
                    handleQuickExport(ExportFormat.PDF)
                    setShowDropdown(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </button>
                
                <button
                  onClick={() => {
                    handleQuickExport(ExportFormat.CSV)
                    setShowDropdown(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <File className="h-4 w-4 mr-2" />
                  Export as CSV
                </button>
                
                <hr className="my-1 border-border" />
                
                <button
                  onClick={() => {
                    setShowPanel(true)
                    setShowDropdown(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Advanced Export...
                </button>
              </div>
            </div>
          </>
        )}

        <InlineExportPanel
          isOpen={showPanel}
          onClose={() => setShowPanel(false)}
          dataType={dataType}
          defaultFilters={defaultFilters}
          defaultDateRange={defaultDateRange}
        />
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <>
        <Button
          variant="ghost"
          size={size}
          onClick={() => setShowPanel(true)}
          className={className}
        >
          <Download className="h-4 w-4" />
        </Button>

        <InlineExportPanel
          isOpen={showPanel}
          onClose={() => setShowPanel(false)}
          dataType={dataType}
          defaultFilters={defaultFilters}
          defaultDateRange={defaultDateRange}
        />
      </>
    )
  }

  // Default button variant
  return (
    <>
      <Button
        variant="outline"
        size={size}
        onClick={() => setShowPanel(true)}
        className={className}
      >
        <Download className="h-4 w-4 mr-2" />
        {children || 'Export'}
      </Button>

      <InlineExportPanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        dataType={dataType}
        defaultFilters={defaultFilters}
        defaultDateRange={defaultDateRange}
      />
    </>
  )
}

// Quick export buttons for specific formats
export function ExportToPDFButton({ 
  dataType, 
  ...props 
}: Omit<ExportButtonProps, 'variant'>) {
  const { exportTransactions, exportInvoices, exportAccounts } = useQuickExport()

  const handleExport = async () => {
    switch (dataType) {
      case ExportDataType.TRANSACTIONS:
        await exportTransactions(props.defaultDateRange, ExportFormat.PDF)
        break
      case ExportDataType.INVOICES:
        await exportInvoices(props.defaultFilters?.status, ExportFormat.PDF)
        break
      case ExportDataType.ACCOUNTS:
        await exportAccounts(ExportFormat.PDF)
        break
    }
  }

  return (
    <Button
      variant="outline"
      size={props.size}
      onClick={handleExport}
      className={props.className}
    >
      <FileText className="h-4 w-4 mr-2" />
      Export PDF
    </Button>
  )
}

export function ExportToExcelButton({ 
  dataType, 
  ...props 
}: Omit<ExportButtonProps, 'variant'>) {
  const { exportTransactions, exportInvoices, exportAccounts } = useQuickExport()

  const handleExport = async () => {
    switch (dataType) {
      case ExportDataType.TRANSACTIONS:
        await exportTransactions(props.defaultDateRange, ExportFormat.EXCEL)
        break
      case ExportDataType.INVOICES:
        await exportInvoices(props.defaultFilters?.status, ExportFormat.EXCEL)
        break
      case ExportDataType.ACCOUNTS:
        await exportAccounts(ExportFormat.EXCEL)
        break
    }
  }

  return (
    <Button
      variant="outline"
      size={props.size}
      onClick={handleExport}
      className={props.className}
    >
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Export Excel
    </Button>
  )
}

export function ExportToCSVButton({ 
  dataType, 
  ...props 
}: Omit<ExportButtonProps, 'variant'>) {
  const { exportTransactions, exportInvoices, exportAccounts } = useQuickExport()

  const handleExport = async () => {
    switch (dataType) {
      case ExportDataType.TRANSACTIONS:
        await exportTransactions(props.defaultDateRange, ExportFormat.CSV)
        break
      case ExportDataType.INVOICES:
        await exportInvoices(props.defaultFilters?.status, ExportFormat.CSV)
        break
      case ExportDataType.ACCOUNTS:
        await exportAccounts(ExportFormat.CSV)
        break
    }
  }

  return (
    <Button
      variant="outline"
      size={props.size}
      onClick={handleExport}
      className={props.className}
    >
      <File className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}