import { useState, useCallback, useRef } from 'react'
import {
  ExportOptions,
  ExportResult,
  ExportProgress,
  ExportFormat,
  ExportDataType
} from '@/lib/export/export-types'
import { ExportService } from '@/lib/export/export-service'
import { useErrorHandling } from '@/hooks/use-error-handling'
import { useToast } from '@/components/feedback/toast-notification'

interface UseExportOptions {
  onExportStart?: (exportId: string) => void
  onExportComplete?: (result: ExportResult) => void
  onExportError?: (error: unknown) => void
  autoDownload?: boolean
}

export function useExport({
  onExportStart,
  onExportComplete,
  onExportError,
  autoDownload = true
}: UseExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const [exportResult, setExportResult] = useState<ExportResult | null>(null)
  const { handleError } = useErrorHandling()
  const { showSuccess, showError, showInfo } = useToast()
  
  // Track active export for cleanup
  const activeExportId = useRef<string | null>(null)

  // Start export
  const startExport = useCallback(async (options: ExportOptions) => {
    try {
      setIsExporting(true)
      setExportProgress(null)
      setExportResult(null)

      showInfo('Starting ${options.format.toUpperCase()} export...')

      // Start export
      const { exportId } = await ExportService.startExport(options)
      activeExportId.current = exportId
      onExportStart?.(exportId)

      // Poll for progress
      const pollProgress = async () => {
        try {
          if (!activeExportId.current) return

          const progress = await ExportService.getExportProgress(exportId)
          setExportProgress(progress)

          if (progress.status === 'completed' && progress.result) {
            setExportResult(progress.result)
            showSuccess('Export completed: ${progress.result.filename}')
            onExportComplete?.(progress.result)
            
            if (autoDownload) {
              await ExportService.downloadExport(exportId)
            }
            
            activeExportId.current = null
          } else if (progress.status === 'failed') {
            const errorMsg = progress.error || 'Export failed'
            showError(errorMsg)
            onExportError?.(new Error(errorMsg))
            activeExportId.current = null
          } else {
            // Continue polling
            setTimeout(pollProgress, 1000)
          }
        } catch (_error) {
          await handleError(error)
          onExportError?.(error)
          activeExportId.current = null
        } finally {
          setIsExporting(false)
        }
      }

      // Start polling
      pollProgress()

    } catch (_error) {
      setIsExporting(false)
      await handleError(error)
      onExportError?.(error)
    }
  }, [handleError, showSuccess, showError, showInfo, onExportStart, onExportComplete, onExportError, autoDownload])

  // Cancel export
  const cancelExport = useCallback(async () => {
    if (!activeExportId.current) return

    try {
      await ExportService.cancelExport(activeExportId.current)
      activeExportId.current = null
      setIsExporting(false)
      setExportProgress(null)
      showInfo('Export cancelled')
    } catch (_error) {
      await handleError(error)
    }
  }, [handleError, showInfo])

  // Download export
  const downloadExport = useCallback(async (exportId?: string) => {
    try {
      const id = exportId || activeExportId.current
      if (!id) return

      await ExportService.downloadExport(id)
    } catch (_error) {
      await handleError(error)
    }
  }, [handleError])

  // Export to PDF
  const exportToPDF = useCallback(async (options: Omit<ExportOptions, 'format'>) => {
    return startExport({ ...options, format: ExportFormat.PDF })
  }, [startExport])

  // Export to Excel
  const exportToExcel = useCallback(async (options: Omit<ExportOptions, 'format'>) => {
    return startExport({ ...options, format: ExportFormat.EXCEL })
  }, [startExport])

  // Export to CSV
  const exportToCSV = useCallback(async (options: Omit<ExportOptions, 'format'>) => {
    return startExport({ ...options, format: ExportFormat.CSV })
  }, [startExport])

  // Get export preview
  const getPreview = useCallback(async (options: ExportOptions, limit: number = 100) => {
    try {
      return await ExportService.getExportPreview(options, limit)
    } catch (_error) {
      await handleError(error)
      return null
    }
  }, [handleError])

  // Clear export state
  const clearExport = useCallback(() => {
    setExportProgress(null)
    setExportResult(null)
    activeExportId.current = null
  }, [])

  return {
    // State
    isExporting,
    exportProgress,
    exportResult,
    
    // Actions
    startExport,
    cancelExport,
    downloadExport,
    exportToPDF,
    exportToExcel,
    exportToCSV,
    getPreview,
    clearExport,
    
    // Computed
    canCancel: isExporting && activeExportId.current !== null,
    progressPercentage: exportProgress?.progress || 0,
    statusMessage: exportProgress?.message || (isExporting ? 'Preparing export...' : '),
    hasResult: exportResult !== null
  }
}

// Hook for batch exports
export function useBatchExport() {
  const [isBatchExporting, setIsBatchExporting] = useState(false)
  const [batchProgress, setBatchProgress] = useState<unknown>(null)
  const { handleError } = useErrorHandling()
  const { showSuccess, showError, showInfo } = useToast()
  
  const activeBatchId = useRef<string | null>(null)

  const startBatchExport = useCallback(async (exports: ExportOptions[]) => {
    try {
      setIsBatchExporting(true)
      setBatchProgress(null)

      showInfo('Starting batch export of ${exports.length} items...')

      const { batchId } = await ExportService.batchExport(exports)
      activeBatchId.current = batchId

      // Poll for batch progress
      const pollBatchProgress = async () => {
        try {
          if (!activeBatchId.current) return

          const progress = await ExportService.getBatchExportProgress(batchId)
          setBatchProgress(progress)

          if (progress.status === 'completed') {
            showSuccess('Batch export completed')
            await ExportService.downloadBatchExport(batchId)
            activeBatchId.current = null
          } else if (progress.status === 'failed') {
            showError('Batch export failed')
            activeBatchId.current = null
          } else {
            setTimeout(pollBatchProgress, 2000)
          }
        } catch (_error) {
          await handleError(error)
          activeBatchId.current = null
        } finally {
          setIsBatchExporting(false)
        }
      }

      pollBatchProgress()

    } catch (_error) {
      setIsBatchExporting(false)
      await handleError(error)
    }
  }, [handleError, showSuccess, showError, showInfo])

  return {
    isBatchExporting,
    batchProgress,
    startBatchExport,
    canCancelBatch: isBatchExporting && activeBatchId.current !== null
  }
}

// Quick export hooks for common scenarios
export function useQuickExport() {
  const { startExport } = useExport()

  const exportTransactions = useCallback((
    dateRange?: { startDate: Date; endDate: Date },
    format: ExportFormat = ExportFormat.EXCEL
  ) => {
    return startExport({
      format,
      dataType: ExportDataType.TRANSACTIONS,
      dateRange,
      includeDetails: true
    })
  }, [startExport])

  const exportInvoices = useCallback((
    status?: string,
    format: ExportFormat = ExportFormat.PDF
  ) => {
    return startExport({
      format,
      dataType: ExportDataType.INVOICES,
      filters: status ? { status } : undefined,
      includeDetails: true
    })
  }, [startExport])

  const exportAccounts = useCallback((
    format: ExportFormat = ExportFormat.EXCEL
  ) => {
    return startExport({
      format,
      dataType: ExportDataType.ACCOUNTS,
      includeDetails: true
    })
  }, [startExport])

  const exportFinancialReport = useCallback((
    reportType: 'profit_loss' | 'balance_sheet' | 'trial_balance',
    dateRange: { startDate: Date; endDate: Date }
  ) => {
    return startExport({
      format: ExportFormat.PDF,
      dataType: ExportDataType.FINANCIAL_REPORT,
      dateRange,
      filters: { reportType }
    })
  }, [startExport])

  return {
    exportTransactions,
    exportInvoices,
    exportAccounts,
    exportFinancialReport
  }
}