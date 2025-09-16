"use client"

import * as React from "react"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { cn } from "@thorbis/design/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Badge } from "./badge"

export interface FilterOption {
  key: string
  label: string
  type: "select" | "search" | "date" | "text"
  options?: { label: string; value: string }[]
  placeholder?: string
  value?: string
  multiple?: boolean
}

export interface ActiveFilter {
  key: string
  label: string
  value: string
  displayValue?: string
}

export interface FilterToolbarProps {
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  filters?: FilterOption[]
  activeFilters?: ActiveFilter[]
  onFilterChange?: (key: string, value: string) => void
  onFilterRemove?: (key: string) => void
  onFiltersClear?: () => void
  showFilterCount?: boolean
  className?: string
}

const FilterToolbar = React.forwardRef<
  HTMLDivElement,
  FilterToolbarProps
>(({ 
  searchValue = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  filters = [],
  activeFilters = [],
  onFilterChange,
  onFilterRemove,
  onFiltersClear,
  showFilterCount = true,
  className,
  ...props 
}, ref) => {
  const [filtersExpanded, setFiltersExpanded] = React.useState(false)
  const hasActiveFilters = activeFilters.length > 0

  return (
    <div 
      ref={ref}
      className={cn("space-y-4", className)} 
      {...props}
    >
      {/* Search and Filter Toggle Row */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Filter Toggle */}
        {filters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className={cn(
              "flex items-center gap-2",
              hasActiveFilters && "border-blue-500 bg-blue-50 dark:bg-blue-950"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {showFilterCount && hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && onFiltersClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFiltersClear}
            className="text-neutral-500 hover:text-neutral-700"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filters Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={`${filter.key}-${filter.value}`}
              variant="outline"
              className="flex items-center gap-2 pr-1"
            >
              <span className="text-xs">
                {filter.label}: {filter.displayValue || filter.value}
              </span>
              {onFilterRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFilterRemove(filter.key)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Expanded Filters */}
      {filtersExpanded && filters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {filter.label}
              </label>
              
              {filter.type === 'select' && filter.options && (
                <Select
                  value={filter.value || ""}
                  onValueChange={(value) => onFilterChange?.(filter.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={filter.placeholder || "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {(filter.type === 'search' || filter.type === 'text') && (
                <Input
                  type="text"
                  placeholder={filter.placeholder || "Enter value..."}
                  value={filter.value || ""}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                />
              )}

              {filter.type === 'date' && (
                <Input
                  type="date"
                  value={filter.value || ""}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

FilterToolbar.displayName = "FilterToolbar"

export { FilterToolbar }
