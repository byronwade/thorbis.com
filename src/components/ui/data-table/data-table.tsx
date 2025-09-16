/**
 * Data Table Component
 * Main data table component with full feature set
 */

"use client"

import * as React from "react"
import { cn } from "@thorbis/design/utils"
import { DataTableProps } from "./types"
import { useDataTableState, useDataTableFiltering, useDataTableSorting, useDataTablePagination, useDataTableSelection, useDataTableMetrics } from "./hooks"
import { DataTableHeader } from "./header"
import { DataTableBody } from "./body"
import { DataTableFooter } from "./footer"
import { DataTableToolbar } from "./toolbar"

const defaultStatusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800"
}

const defaultPriorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800"
}

function DataTable<TData extends Record<string, unknown>>({
  data,
  columns: initialColumns,
  viewModes = ["table", "cards", "kanban", "calendar"],
  defaultView = "table",
  searchable = false,
  searchPlaceholder = "Search...",
  filters = [],
  globalSearch = true,
  advancedFilters = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row: unknown) => row.id,
  paginated = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 50,
  pageSizeOptions = [10, 25, 50, 100, 250, 500],
  onPageChange,
  onPageSizeChange,
  serverSide = false,
  sortKey,
  sortDirection,
  sorts: initialSorts = [],
  onSort,
  onSortsChange,
  multiSort = false,
  bulkActions = [],
  rowActions = [],
  onRowClick,
  onNewItem,
  editable = false,
  onRowEdit,
  editMode = "inline",
  exportable = false,
  onExport,
  exportFormats = ["csv", "xlsx", "pdf"],
  columnManagement = false,
  persistSettings = false,
  settingsKey,
  onSettingsChange,
  virtualScrolling = false,
  rowHeight = 48,
  overscan = 5,
  density = "comfortable",
  emptyState,
  loading = false,
  loadingText = "Loading...",
  errorState,
  className,
  rowClassName,
  cellClassName,
  showMetrics = false,
  onMetricsChange,
  groupBy,
  expandable = false,
  expandedRows = [],
  onExpandChange,
  renderExpandedRow,
  draggable = false,
  onRowReorder,
  customRenderers = {},
  onCellClick,
  onHeaderClick,
  onRowDoubleClick,
  ariaLabel = "Data table",
  ariaDescription
}: DataTableProps<TData>) {
  // Initialize state
  const [state, updateState] = useDataTableState<TData>({
    viewMode: defaultView,
    currentPage,
    pageSize,
    selectedRows,
    sorts: initialSorts,
    density,
    isLoading: loading
  })

  // Get searchable columns
  const searchableColumns = React.useMemo(() => {
    return initialColumns
      .filter(col => col.searchable !== false)
      .map(col => col.accessor as string)
      .filter(Boolean)
  }, [initialColumns])

  // Apply filtering
  const filteredData = useDataTableFiltering(
    data,
    state.searchQuery,
    state.appliedFilters,
    searchableColumns
  )

  // Apply sorting
  const sortedData = useDataTableSorting(filteredData, state.sorts)

  // Apply pagination
  const { paginatedData, totalPages: calculatedTotalPages, hasNextPage, hasPreviousPage } = useDataTablePagination(
    sortedData,
    state.currentPage,
    state.pageSize
  )

  // Selection management
  const selection = useDataTableSelection(
    paginatedData,
    state.selectedRows,
    getRowId,
    (newSelection) => {
      updateState({ selectedRows: newSelection })
      onSelectionChange?.(newSelection)
    }
  )

  // Calculate metrics
  const metrics = useDataTableMetrics(
    totalItems || data.length,
    filteredData,
    state.selectedRows,
    paginatedData,
    state.isLoading
  )

  // Update metrics callback
  React.useEffect(() => {
    onMetricsChange?.(metrics)
  }, [metrics, onMetricsChange])

  // Handle search
  const handleSearch = React.useCallback((query: string) => {
    updateState({ searchQuery: query, currentPage: 1 })
  }, [updateState])

  // Handle filter changes
  const handleFilterChange = React.useCallback((newFilters: unknown[]) => {
    updateState({ appliedFilters: newFilters, currentPage: 1 })
  }, [updateState])

  // Handle sort changes
  const handleSort = React.useCallback((column: string, direction: "asc" | "desc") => {
    if (multiSort) {
      const existingSortIndex = state.sorts.findIndex(s => s.column === column)
      let newSorts = [...state.sorts]
      
      if (existingSortIndex >= 0) {
        newSorts[existingSortIndex] = { column, direction }
      } else {
        newSorts.push({ column, direction })
      }
      
      updateState({ sorts: newSorts })
      onSortsChange?.(newSorts)
    } else {
      const newSorts = [{ column, direction }]
      updateState({ sorts: newSorts })
      onSort?.(column, direction)
    }
  }, [state.sorts, multiSort, updateState, onSort, onSortsChange])

  // Handle page changes
  const handlePageChange = React.useCallback((page: number) => {
    updateState({ currentPage: page })
    onPageChange?.(page)
  }, [updateState, onPageChange])

  const handlePageSizeChange = React.useCallback((newPageSize: number) => {
    updateState({ pageSize: newPageSize, currentPage: 1 })
    onPageSizeChange?.(newPageSize)
  }, [updateState, onPageSizeChange])

  // Handle view mode changes
  const handleViewModeChange = React.useCallback((viewMode: "table" | "cards" | "kanban" | "calendar") => {
    updateState({ viewMode })
    onSettingsChange?.({ viewMode })
  }, [updateState, onSettingsChange])

  // Render different views based on current view mode
  const renderContent = () => {
    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">{loadingText}</div>
        </div>
      )
    }

    if (errorState) {
      return errorState
    }

    if (filteredData.length === 0) {
      return emptyState || (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">No data available</div>
        </div>
      )
    }

    switch (state.viewMode) {
      case "table":
        return (
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <DataTableHeader
                columns={initialColumns}
                sorts={state.sorts}
                onSort={handleSort}
                selectable={selectable}
                isAllSelected={selection.isAllSelected}
                isIndeterminate={selection.isIndeterminate}
                onSelectAll={selection.toggleAllRows}
                onHeaderClick={onHeaderClick}
              />
              <DataTableBody
                data={paginatedData}
                columns={initialColumns}
                getRowId={getRowId}
                selectedRows={state.selectedRows}
                onRowSelect={selection.toggleRowSelection}
                onRowClick={onRowClick}
                onRowDoubleClick={onRowDoubleClick}
                onCellClick={onCellClick}
                rowClassName={rowClassName}
                cellClassName={cellClassName}
                selectable={selectable}
                expandable={expandable}
                expandedRows={state.expandedRows}
                onExpandChange={(rowId) => {
                  const newExpanded = state.expandedRows.includes(rowId)
                    ? state.expandedRows.filter(id => id !== rowId)
                    : [...state.expandedRows, rowId]
                  updateState({ expandedRows: newExpanded })
                  onExpandChange?.(newExpanded)
                }}
                renderExpandedRow={renderExpandedRow}
                rowActions={rowActions}
                editable={editable}
                onRowEdit={onRowEdit}
                customRenderers={customRenderers}
              />
            </table>
          </div>
        )
      
      case "cards":
        // Cards view implementation would go here
        return <div>Cards view not implemented yet</div>
      
      case "kanban":
        // Kanban view implementation would go here
        return <div>Kanban view not implemented yet</div>
      
      case "calendar":
        // Calendar view implementation would go here
        return <div>Calendar view not implemented yet</div>
      
      default:
        return null
    }
  }

  return (
    <div 
      className={cn("space-y-4", className)}
      role="region"
      aria-label={ariaLabel}
      aria-description={ariaDescription}
    >
      {/* Toolbar */}
      <DataTableToolbar
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        searchQuery={state.searchQuery}
        onSearch={handleSearch}
        filters={filters}
        appliedFilters={state.appliedFilters}
        onFilterChange={handleFilterChange}
        viewModes={viewModes}
        currentViewMode={state.viewMode}
        onViewModeChange={handleViewModeChange}
        bulkActions={bulkActions}
        selectedCount={selection.selectedCount}
        onNewItem={onNewItem}
        exportable={exportable}
        onExport={onExport}
        exportFormats={exportFormats}
        columnManagement={columnManagement}
        columns={initialColumns}
        hiddenColumns={state.hiddenColumns}
        onColumnVisibilityChange={(columnId, visible) => {
          const newHidden = visible
            ? state.hiddenColumns.filter(id => id !== columnId)
            : [...state.hiddenColumns, columnId]
          updateState({ hiddenColumns: newHidden })
        }}
        density={state.density}
        onDensityChange={(density) => updateState({ density })}
        showMetrics={showMetrics}
        metrics={metrics}
      />

      {/* Content */}
      {renderContent()}

      {/* Footer */}
      {paginated && (
        <DataTableFooter
          currentPage={state.currentPage}
          totalPages={serverSide ? totalPages : calculatedTotalPages}
          totalItems={serverSide ? totalItems : filteredData.length}
          pageSize={state.pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          showingFrom={(state.currentPage - 1) * state.pageSize + 1}
          showingTo={Math.min(state.currentPage * state.pageSize, filteredData.length)}
        />
      )}
    </div>
  )
}

export { DataTable }
export type { DataTableProps }
export { defaultStatusColors, defaultPriorityColors }