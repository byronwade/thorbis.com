/**
 * Data Table Module Index
 * Central export point for all data table components and utilities
 */

// Main component
export { DataTable } from './data-table'

// Sub-components
export { DataTableHeader } from './header'
export { DataTableBody } from './body'
export { DataTableToolbar } from './toolbar'
export { DataTableFooter } from './footer'

// Hooks
export {
  useDataTableState,
  useDataTableFiltering,
  useDataTableSorting,
  useDataTablePagination,
  useDataTableSelection,
  useDataTableMetrics,
  useDataTableSettings,
  useDataTableExport
} from './hooks'

// Types
export type {
  DataTableProps,
  DataTableColumn,
  DataTableFilter,
  DataTableSort,
  DataTableAction,
  DataTableMetrics,
  DataTableSettings,
  DataTableState,
  DataTableContext,
  DataTableExportOptions
} from './types'

// Re-export for backward compatibility
export type { DataTableProps as DataTableComponentProps } from './types'