/**
 * Data Table Types
 * Type definitions for the data table component system
 */

import { ReactNode } from "react"

export interface DataTableColumn<TData = any> {
  id: string
  header: string
  accessor?: keyof TData | string
  sortable?: boolean
  searchable?: boolean
  filterable?: boolean
  width?: number | string
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  hidden?: boolean
  sticky?: "left" | "right"
  align?: "left" | "center" | "right"
  type?: "text" | "number" | "date" | "boolean" | "select" | "multiselect" | "badge" | "currency" | "percentage" | "custom"
  format?: (value: unknown) => string | ReactNode
  render?: (value: unknown, row: TData, column: DataTableColumn<TData>) => ReactNode
  editable?: boolean
  editType?: "text" | "number" | "select" | "textarea" | "date" | "checkbox"
  editOptions?: Array<{ label: string; value: any }>
  validation?: (value: unknown) => string | undefined
}

export interface DataTableFilter {
  id: string
  column: string
  operator: "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte" | "between" | "in" | "notIn"
  value: any
  label?: string
  type?: "text" | "number" | "date" | "select" | "multiselect" | "boolean"
  options?: Array<{ label: string; value: any }>
}

export interface DataTableSort {
  column: string
  direction: "asc" | "desc"
  priority?: number
}

export interface DataTableExportOptions {
  format: "csv" | "xlsx" | "json" | "pdf"
  filename?: string
  includeHeaders?: boolean
  selectedOnly?: boolean
  visibleColumnsOnly?: boolean
}

export interface DataTableSettings {
  density: "compact" | "comfortable" | "spacious"
  viewMode: "table" | "cards" | "kanban" | "calendar"
  columnWidths: Record<string, number>
  hiddenColumns: string[]
  sorts: DataTableSort[]
  filters: DataTableFilter[]
}

export interface DataTableAction<TData = any> {
  id: string
  label: string
  icon?: ReactNode
  handler: (rows: TData[]) => void
  disabled?: (rows: TData[]) => boolean
  variant?: "default" | "destructive" | "secondary"
  requiresConfirmation?: boolean
}

export interface DataTableMetrics {
  totalItems: number
  filteredItems: number
  selectedItems: number
  visibleItems: number
  loadingItems?: number
}

export interface DataTableProps<TData = any> {
  // Data & Columns
  data: TData[]
  columns: DataTableColumn<TData>[]
  
  // View Configuration
  viewModes?: Array<"table" | "cards" | "kanban" | "calendar">
  defaultView?: "table" | "cards" | "kanban" | "calendar"
  
  // Search & Filtering
  searchable?: boolean
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  globalSearch?: boolean
  advancedFilters?: boolean
  
  // Selection
  selectable?: boolean
  selectedRows?: string[]
  onSelectionChange?: (selectedRows: string[]) => void
  getRowId?: (row: TData) => string
  
  // Pagination
  paginated?: boolean
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  pageSizeOptions?: number[]
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  serverSide?: boolean
  
  // Sorting
  sortKey?: string
  sortDirection?: "asc" | "desc"
  sorts?: DataTableSort[]
  onSort?: (column: string, direction: "asc" | "desc") => void
  onSortsChange?: (sorts: DataTableSort[]) => void
  multiSort?: boolean
  
  // Actions
  bulkActions?: DataTableAction<TData>[]
  rowActions?: DataTableAction<TData>[]
  onRowClick?: (row: TData, index: number) => void
  onNewItem?: () => void
  
  // Editing
  editable?: boolean
  onRowEdit?: (row: TData, changes: Partial<TData>) => void
  editMode?: "inline" | "modal" | "drawer"
  
  // Export
  exportable?: boolean
  onExport?: (options: DataTableExportOptions) => void
  exportFormats?: Array<"csv" | "xlsx" | "json" | "pdf">
  
  // Column Management
  columnManagement?: boolean
  persistSettings?: boolean
  settingsKey?: string
  onSettingsChange?: (settings: Partial<DataTableSettings>) => void
  
  // Performance
  virtualScrolling?: boolean
  rowHeight?: number
  overscan?: number
  
  // UI & UX
  density?: "compact" | "comfortable" | "spacious"
  emptyState?: ReactNode
  loading?: boolean
  loadingText?: string
  errorState?: ReactNode
  
  // Styling
  className?: string
  rowClassName?: (row: TData, index: number) => string
  cellClassName?: (value: unknown, row: TData, column: DataTableColumn<TData>) => string
  
  // Metrics & Analytics
  showMetrics?: boolean
  onMetricsChange?: (metrics: DataTableMetrics) => void
  
  // Advanced Features
  groupBy?: string
  expandable?: boolean
  expandedRows?: string[]
  onExpandChange?: (expandedRows: string[]) => void
  renderExpandedRow?: (row: TData) => ReactNode
  
  // Drag & Drop
  draggable?: boolean
  onRowReorder?: (fromIndex: number, toIndex: number) => void
  
  // Custom Renderers
  customRenderers?: Record<string, (props: unknown) => ReactNode>
  
  // Event Handlers
  onCellClick?: (value: unknown, row: TData, column: DataTableColumn<TData>) => void
  onHeaderClick?: (column: DataTableColumn<TData>) => void
  onRowDoubleClick?: (row: TData, index: number) => void
  
  // Accessibility
  ariaLabel?: string
  ariaDescription?: string
}

export interface DataTableState<TData = any> {
  viewMode: "table" | "cards" | "kanban" | "calendar"
  searchQuery: string
  appliedFilters: DataTableFilter[]
  selectedRows: string[]
  currentPage: number
  pageSize: number
  sorts: DataTableSort[]
  columnWidths: Record<string, number>
  hiddenColumns: string[]
  expandedRows: string[]
  editingRows: Record<string, Partial<TData>>
  density: "compact" | "comfortable" | "spacious"
  isLoading: boolean
  error?: string
}

export interface DataTableContext<TData = any> {
  state: DataTableState<TData>
  dispatch: (action: DataTableAction) => void
  data: TData[]
  filteredData: TData[]
  paginatedData: TData[]
  columns: DataTableColumn<TData>[]
  metrics: DataTableMetrics
}

export type DataTableAction<TData = any> = 
  | { type: "SET_VIEW_MODE"; payload: "table" | "cards" | "kanban" | "calendar" }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_FILTERS"; payload: DataTableFilter[] }
  | { type: "ADD_FILTER"; payload: DataTableFilter }
  | { type: "REMOVE_FILTER"; payload: string }
  | { type: "SET_SELECTED_ROWS"; payload: string[] }
  | { type: "TOGGLE_ROW_SELECTION"; payload: string }
  | { type: "SELECT_ALL_ROWS"; payload: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "SET_SORTS"; payload: DataTableSort[] }
  | { type: "ADD_SORT"; payload: DataTableSort }
  | { type: "REMOVE_SORT"; payload: string }
  | { type: "SET_COLUMN_WIDTH"; payload: { columnId: string; width: number } }
  | { type: "HIDE_COLUMN"; payload: string }
  | { type: "SHOW_COLUMN"; payload: string }
  | { type: "TOGGLE_EXPANDED_ROW"; payload: string }
  | { type: "SET_EDITING_ROW"; payload: { rowId: string; data: Partial<TData> } }
  | { type: "CLEAR_EDITING_ROW"; payload: string }
  | { type: "SET_DENSITY"; payload: "compact" | "comfortable" | "spacious" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | undefined }