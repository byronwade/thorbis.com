'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/modals/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Calendar,
  Filter,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react'
import {
  ExportFormat,
  ExportDataType,
  ExportOptions,
  EXPORT_CONFIGURATIONS
} from '@/lib/export/export-types'
import { ExportService } from '@/lib/export/export-service'
import { useExport } from '@/hooks/use-export'
import { formatFileSize } from '@/lib/file-handling/file-types'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  dataType: ExportDataType
  title?: string
  defaultFilters?: Record<string, unknown>
  defaultDateRange?: { startDate: Date; endDate: Date }
}

export function ExportModal({
  isOpen,
  onClose,
  dataType,
  title,
  defaultFilters = {},
  defaultDateRange
}: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: ExportFormat.EXCEL,
    dataType,
    filename: ',
    dateRange: defaultDateRange,
    filters: defaultFilters,
    includeDetails: true
  })
  
  const [previewData, setPreviewData] = useState<unknown>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])

  const {
    isExporting,
    exportProgress,
    exportResult,
    startExport,
    cancelExport,
    downloadExport,
    progressPercentage,
    statusMessage,
    hasResult,
    canCancel
  } = useExport({
    onExportComplete: (result) => {
      console.log('Export completed:', result)
    },
    autoDownload: true
  })

  const config = EXPORT_CONFIGURATIONS[dataType]
  const availableFormats = ExportService.getAvailableFormats(dataType)
  const availableColumns = ExportService.getAvailableColumns(dataType)

  // Initialize selected columns
  useEffect(() => {
    if (availableColumns.length > 0 && selectedColumns.length === 0) {
      setSelectedColumns(availableColumns.map(col => col.key))
    }
  }, [availableColumns, selectedColumns.length])

  // Update filename when format or data type changes
  useEffect(() => {
    if (!exportOptions.filename) {
      const timestamp = new Date().toISOString().slice(0, 10)
      setExportOptions(prev => ({
        ...prev,
        filename: '${config.defaultFilename}_${timestamp}'
      }))
    }
  }, [exportOptions.format, config.defaultFilename, exportOptions.filename])

  const handleFormatChange = (format: ExportFormat) => {
    setExportOptions(prev => ({ ...prev, format }))
  }

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    const date = value ? new Date(value) : undefined
    setExportOptions(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date
      } as { startDate: Date; endDate: Date }
    }))
  }

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    )
  }

  const loadPreview = async () => {
    setIsLoadingPreview(true)
    try {
      const preview = await ExportService.getExportPreview({
        ...exportOptions,
        columns: selectedColumns
      }, 50)
      setPreviewData(preview)
    } catch (error) {
      console.error('Failed to load preview:', error)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleExport = async () => {
    const finalOptions = {
      ...exportOptions,
      columns: selectedColumns
    }
    
    await startExport(finalOptions)
  }

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case ExportFormat.PDF:
        return <FileText className="h-4 w-4" />
      case ExportFormat.EXCEL:
        return <FileSpreadsheet className="h-4 w-4" />
      case ExportFormat.CSV:
        return <File className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case ExportFormat.PDF:
        return 'PDF Document'
      case ExportFormat.EXCEL:
        return 'Excel Spreadsheet'
      case ExportFormat.CSV:
        return 'CSV File'
      default:
        return format.toUpperCase()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Export ${dataType.replace('_', ' ').toUpperCase()}'}
      size="2xl"
    >
      <div className="space-y-6">
        {/* Export Progress */}
        {(isExporting || hasResult) && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {isExporting ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : hasResult ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isExporting ? 'Exporting...' : hasResult ? 'Export Complete' : 'Export Failed`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {statusMessage}
                  </p>
                  
                  {isExporting && (
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: '${progressPercentage}%' }}
                      />
                    </div>
                  )}
                </div>
                
                {canCancel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelExport}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {hasResult && exportResult && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadExport()}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {availableFormats.map(format => (
              <Card
                key={format}
                className={'cursor-pointer transition-colors ${
                  exportOptions.format === format
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
              }'}'
                onClick={() => handleFormatChange(format)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    {getFormatIcon(format)}
                    <span className="text-sm font-medium">
                      {getFormatLabel(format)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Basic Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="filename" className="block text-sm font-medium text-foreground mb-2">
              Filename
            </label>
            <Input
              id="filename"
              value={exportOptions.filename}
              onChange={(e) => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
              placeholder="Enter filename"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Include Details
            </label>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="includeDetails"
                checked={exportOptions.includeDetails}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  includeDetails: e.target.checked 
                }))}
                className="rounded border-border"
              />
              <label htmlFor="includeDetails" className="text-sm text-muted-foreground">
                Include detailed information
              </label>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <div className="flex items-center mb-3">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <label className="text-sm font-medium text-foreground">
              Date Range (Optional)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-xs text-muted-foreground mb-1">
                Start Date
              </label>
              <Input
                id="startDate"
                type="date"
                value={exportOptions.dateRange?.startDate?.toISOString().slice(0, 10) || ' '}'
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-xs text-muted-foreground mb-1">
                End Date
              </label>
              <Input
                id="endDate"
                type="date"
                value={exportOptions.dateRange?.endDate?.toISOString().slice(0, 10) || ' '}'
                onChange={(e) => handleDateRangeChange('endDate`, e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Column Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">
                Columns to Export
              </label>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedColumns(availableColumns.map(col => col.key))}
              >
                Select All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedColumns([])}
              >
                Clear All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {availableColumns.map(column => (
              <div key={column.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`col-${column.key}'}
                  checked={selectedColumns.includes(column.key)}
                  onChange={() => handleColumnToggle(column.key)}
                  className="rounded border-border"
                />
                <label
                  htmlFor={'col-${column.key}'}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground">
              Preview
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPreview}
              disabled={isLoadingPreview || selectedColumns.length === 0}
            >
              {isLoadingPreview ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Filter className="h-4 w-4 mr-1" />
              )}
              Load Preview
            </Button>
          </div>

          {isLoadingPreview && (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading preview...
            </div>
          )}

          {previewData && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {previewData.columns.map((column: string) => (
                          <th key={column} className="px-4 py-2 text-left font-medium">
                            {availableColumns.find(col => col.key === column)?.label || column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.slice(0, 5).map((row: unknown, index: number) => (
                        <tr key={index} className="border-b border-border">
                          {previewData.columns.map((column: string) => (
                            <td key={column} className="px-4 py-2">
                              {row[column] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 text-xs text-muted-foreground border-t border-border">
                  Showing 5 of {previewData.totalRecords} records
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedColumns.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {getFormatLabel(exportOptions.format)}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}