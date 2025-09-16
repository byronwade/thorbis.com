/**
 * Data Table Toolbar Component
 * Search, filters, actions, and view controls
 */

import * as React from "react"
import { Search, Filter, Plus, Download, Settings, Grid, Table, Calendar, BarChart3 } from "lucide-react"
import { cn } from "@thorbis/design/utils"
import { Button } from "../button"
import { Input } from "../input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select"
import { Badge } from "../badge"
import { DataTableFilter, DataTableAction, DataTableColumn, DataTableMetrics } from "./types"

interface DataTableToolbarProps<TData = any> {
  searchable?: boolean
  searchPlaceholder?: string
  searchQuery: string
  onSearch: (query: string) => void
  filters?: DataTableFilter[]
  appliedFilters: DataTableFilter[]
  onFilterChange: (filters: DataTableFilter[]) => void
  viewModes: Array<"table" | "cards" | "kanban" | "calendar">
  currentViewMode: "table" | "cards" | "kanban" | "calendar"
  onViewModeChange: (mode: "table" | "cards" | "kanban" | "calendar") => void
  bulkActions?: DataTableAction<TData>[]
  selectedCount: number
  onNewItem?: () => void
  exportable?: boolean
  onExport?: (options: unknown) => void
  exportFormats?: Array<"csv" | "xlsx" | "json" | "pdf">
  columnManagement?: boolean
  columns: DataTableColumn<TData>[]
  hiddenColumns: string[]
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void
  density: "compact" | "comfortable" | "spacious"
  onDensityChange: (density: "compact" | "comfortable" | "spacious") => void
  showMetrics?: boolean
  metrics?: DataTableMetrics
}

export function DataTableToolbar<TData>({
  searchable,
  searchPlaceholder,
  searchQuery,
  onSearch,
  filters = [],
  appliedFilters,
  onFilterChange,
  viewModes,
  currentViewMode,
  onViewModeChange,
  bulkActions = [],
  selectedCount,
  onNewItem,
  exportable,
  onExport,
  exportFormats = ["csv", "xlsx", "pdf"],
  columnManagement,
  columns,
  hiddenColumns,
  onColumnVisibilityChange,
  density,
  onDensityChange,
  showMetrics,
  metrics
}: DataTableToolbarProps<TData>) {
  const [searchValue, setSearchValue] = React.useState(searchQuery)
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>()

  // Debounced search
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(searchValue)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchValue, onSearch])

  const viewModeIcons = {
    table: <Table className="h-4 w-4" />,
    cards: <Grid className="h-4 w-4" />,
    kanban: <BarChart3 className="h-4 w-4" />,
    calendar: <Calendar className="h-4 w-4" />
  }

  const getEnabledBulkActions = () => {
    return bulkActions.filter(action => 
      !action.disabled || !action.disabled([])
    )
  }

  return (
    <div className="space-y-4">
      {/* Main toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Search */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          )}

          {/* Filters */}
          {filters.length > 0 && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {appliedFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {appliedFilters.length}
                </Badge>
              )}
            </Button>
          )}

          {/* Applied filters */}
          {appliedFilters.length > 0 && (
            <div className="flex items-center gap-2">
              {appliedFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    const newFilters = appliedFilters.filter((_, i) => i !== index)
                    onFilterChange(newFilters)
                  }}
                >
                  {filter.label || `${filter.column}: ${filter.value}`}
                  ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          {viewModes.length > 1 && (
            <div className="flex border rounded-md">
              {viewModes.map((mode) => (
                <Button
                  key={mode}
                  variant={currentViewMode === mode ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                  onClick={() => onViewModeChange(mode)}
                >
                  {viewModeIcons[mode]}
                </Button>
              ))}
            </div>
          )}

          {/* Export */}
          {exportable && (
            <Button variant="outline" size="sm" onClick={() => onExport?.({ format: "csv" })}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {/* Column management */}
          {columnManagement && (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Columns
            </Button>
          )}

          {/* New item */}
          {onNewItem && (
            <Button onClick={onNewItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedCount > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {selectedCount} item{selectedCount !== 1 ? 's' : '} selected
            </span>
            <div className="flex items-center gap-2">
              {getEnabledBulkActions().map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={() => action.handler([])}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm">
            Clear selection
          </Button>
        </div>
      )}

      {/* Metrics */}
      {showMetrics && metrics && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>Total: {metrics.totalItems.toLocaleString()}</span>
          <span>Filtered: {metrics.filteredItems.toLocaleString()}</span>
          <span>Selected: {metrics.selectedItems.toLocaleString()}</span>
          <span>Visible: {metrics.visibleItems.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}