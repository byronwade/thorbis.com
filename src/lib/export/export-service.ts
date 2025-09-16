import {
  ExportOptions,
  ExportResult,
  ExportProgress,
  ExportFormat,
  ExportDataType,
  PDFExportOptions,
  ExcelExportOptions,
  CSVExportOptions,
  EXPORT_CONFIGURATIONS
} from './export-types'
import { api } from '@/lib/error-handling/api-error-handler'
import { FileError } from '@/lib/error-handling/error-types'

export class ExportService {
  private static baseUrl = '/api/export'
  private static activeExports = new Map<string, AbortController>()

  // Start export process
  static async startExport(options: ExportOptions): Promise<{ exportId: string }> {
    try {
      // Validate options
      this.validateExportOptions(options)

      // Generate filename if not provided
      if (!options.filename) {
        const config = EXPORT_CONFIGURATIONS[options.dataType]
        const timestamp = new Date().toISOString().slice(0, 10)
        options.filename = `${config.defaultFilename}_${timestamp}'
      }

      const response = await api.post<{ exportId: string }>('${this.baseUrl}/start', options)
      return response
    } catch (_error) {
      throw new FileError('Failed to start export', 'export_start', undefined, {
        options,
        originalError: error
      })
    }
  }

  // Get export progress
  static async getExportProgress(exportId: string): Promise<ExportProgress> {
    try {
      return await api.get<ExportProgress>('${this.baseUrl}/${exportId}/progress')
    } catch (_error) {
      throw new FileError('Failed to get export progress', 'export_progress', undefined, {
        exportId,
        originalError: error
      })
    }
  }

  // Cancel export
  static async cancelExport(exportId: string): Promise<void> {
    try {
      // Cancel local abort controller if exists
      const controller = this.activeExports.get(exportId)
      if (controller) {
        controller.abort()
        this.activeExports.delete(exportId)
      }

      // Cancel server-side export
      await api.post('${this.baseUrl}/${exportId}/cancel')
    } catch (_error) {
      throw new FileError('Failed to cancel export', 'export_cancel`, undefined, {
        exportId,
        originalError: error
      })
    }
  }

  // Download export result
  static async downloadExport(exportId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${exportId}/download')
      
      if (!response.ok) {
        throw new Error('Download failed: ${response.statusText}')
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, ')
        : 'export_${exportId}'

      // Create download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (_error) {
      throw new FileError('Failed to download export', 'export_download', undefined, {
        exportId,
        originalError: error
      })
    }
  }

  // Export to PDF
  static async exportToPDF(options: Omit<PDFExportOptions, 'format'>): Promise<ExportResult> {
    return this.executeExport({ ...options, format: ExportFormat.PDF })
  }

  // Export to Excel
  static async exportToExcel(options: Omit<ExcelExportOptions, 'format'>): Promise<ExportResult> {
    return this.executeExport({ ...options, format: ExportFormat.EXCEL })
  }

  // Export to CSV
  static async exportToCSV(options: Omit<CSVExportOptions, 'format'>): Promise<ExportResult> {
    return this.executeExport({ ...options, format: ExportFormat.CSV })
  }

  // Execute export and handle progress
  private static async executeExport(options: ExportOptions): Promise<ExportResult> {
    try {
      // Start export
      const { exportId } = await this.startExport(options)

      // Create abort controller for this export
      const abortController = new AbortController()
      this.activeExports.set(exportId, abortController)

      // Poll for progress
      return new Promise((resolve, reject) => {
        const pollProgress = async () => {
          try {
            if (abortController.signal.aborted) {
              reject(new Error('Export cancelled'))
              return
            }

            const progress = await this.getExportProgress(exportId)

            if (progress.status === 'completed' && progress.result) {
              this.activeExports.delete(exportId)
              resolve(progress.result)
            } else if (progress.status === 'failed') {
              this.activeExports.delete(exportId)
              reject(new Error(progress.error || 'Export failed'))
            } else {
              // Continue polling
              setTimeout(pollProgress, 1000)
            }
          } catch (_error) {
            this.activeExports.delete(exportId)
            reject(error)
          }
        }

        // Start polling
        pollProgress()
      })
    } catch (_error) {
      throw new FileError('Failed to execute export', 'export_execute`, undefined, {
        options,
        originalError: error
      })
    }
  }

  // Validate export options
  private static validateExportOptions(options: ExportOptions): void {
    const config = EXPORT_CONFIGURATIONS[options.dataType]
    
    if (!config) {
      throw new Error(`Unsupported data type: ${options.dataType}')
    }

    if (!config.supportedFormats.includes(options.format)) {
      throw new Error('Format ${options.format} not supported for data type ${options.dataType}')
    }

    if (options.dateRange) {
      const { startDate, endDate } = options.dateRange
      if (startDate > endDate) {
        throw new Error('Start date must be before end date')
      }
    }

    if (options.columns) {
      const validColumns = config.columns.map(col => col.key)
      const invalidColumns = options.columns.filter(col => !validColumns.includes(col))
      if (invalidColumns.length > 0) {
        throw new Error('Invalid columns: ${invalidColumns.join(', ')}')
      }
    }
  }

  // Get available export formats for data type
  static getAvailableFormats(dataType: ExportDataType): ExportFormat[] {
    const config = EXPORT_CONFIGURATIONS[dataType]
    return config?.supportedFormats || []
  }

  // Get available columns for data type
  static getAvailableColumns(dataType: ExportDataType) {
    const config = EXPORT_CONFIGURATIONS[dataType]
    return config?.columns || []
  }

  // Generate export preview
  static async getExportPreview(
    options: ExportOptions,
    limit: number = 100
  ): Promise<{
    columns: string[]
    data: unknown[]
    totalRecords: number
  }> {
    try {
      const previewOptions = {
        ...options,
        preview: true,
        limit
      }

      return await api.post('${this.baseUrl}/preview', previewOptions)
    } catch (_error) {
      throw new FileError('Failed to generate export preview', 'export_preview', undefined, {
        options,
        limit,
        originalError: error
      })
    }
  }

  // Batch export multiple data types
  static async batchExport(exports: ExportOptions[]): Promise<{
    batchId: string
    exports: Array<{ exportId: string; options: ExportOptions }>
  }> {
    try {
      // Validate all export options
      exports.forEach(options => this.validateExportOptions(options))

      return await api.post('${this.baseUrl}/batch', { exports })
    } catch (_error) {
      throw new FileError('Failed to start batch export', 'batch_export', undefined, {
        exportCount: exports.length,
        originalError: error
      })
    }
  }

  // Get batch export progress
  static async getBatchExportProgress(batchId: string): Promise<{
    batchId: string
    status: 'preparing' | 'processing' | 'completed' | 'failed'
    progress: number
    exports: ExportProgress[]
  }> {
    try {
      return await api.get('${this.baseUrl}/batch/${batchId}/progress')
    } catch (_error) {
      throw new FileError('Failed to get batch export progress', 'batch_export_progress`, undefined, {
        batchId,
        originalError: error
      })
    }
  }

  // Download batch export as zip
  static async downloadBatchExport(batchId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/batch/${batchId}/download')
      
      if (!response.ok) {
        throw new Error('Download failed: ${response.statusText}')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'export_batch_${batchId}.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (_error) {
      throw new FileError('Failed to download batch export', 'batch_export_download', undefined, {
        batchId,
        originalError: error
      })
    }
  }

  // Quick export functions for common use cases
  static async quickExportTransactions(
    dateRange?: { startDate: Date; endDate: Date },
    format: ExportFormat = ExportFormat.EXCEL
  ): Promise<ExportResult> {
    return this.executeExport({
      format,
      dataType: ExportDataType.TRANSACTIONS,
      dateRange,
      includeDetails: true
    })
  }

  static async quickExportInvoices(
    status?: string,
    format: ExportFormat = ExportFormat.PDF
  ): Promise<ExportResult> {
    return this.executeExport({
      format,
      dataType: ExportDataType.INVOICES,
      filters: status ? { status } : undefined,
      includeDetails: true
    })
  }

  static async quickExportFinancialReport(
    reportType: 'profit_loss' | 'balance_sheet' | 'trial_balance',
    dateRange: { startDate: Date; endDate: Date }
  ): Promise<ExportResult> {
    return this.executeExport({
      format: ExportFormat.PDF,
      dataType: ExportDataType.FINANCIAL_REPORT,
      dateRange,
      filters: { reportType }
    })
  }
}