/**
 * Data Table Header Component
 * Table header with sorting, selection, and column management
 */

import * as React from "react"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@thorbis/design/utils"
import { Checkbox } from "../checkbox"
import { DataTableColumn, DataTableSort } from "./types"

interface DataTableHeaderProps<TData = any> {
  columns: DataTableColumn<TData>[]
  sorts: DataTableSort[]
  onSort: (column: string, direction: "asc" | "desc") => void
  selectable?: boolean
  isAllSelected?: boolean
  isIndeterminate?: boolean
  onSelectAll?: () => void
  onHeaderClick?: (column: DataTableColumn<TData>) => void
}

export function DataTableHeader<TData>({
  columns,
  sorts,
  onSort,
  selectable,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onHeaderClick
}: DataTableHeaderProps<TData>) {
  const getSortDirection = (columnId: string) => {
    const sort = sorts.find(s => s.column === columnId)
    return sort?.direction
  }

  const handleSort = (column: DataTableColumn<TData>) => {
    if (!column.sortable) return

    const currentDirection = getSortDirection(column.id)
    const newDirection = currentDirection === "asc" ? "desc" : "asc"
    onSort(column.id, newDirection)
  }

  const renderSortIcon = (column: DataTableColumn<TData>) => {
    if (!column.sortable) return null

    const direction = getSortDirection(column.id)
    
    if (direction === "asc") {
      return <ArrowUp className="h-4 w-4" />
    } else if (direction === "desc") {
      return <ArrowDown className="h-4 w-4" />
    } else {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
  }

  return (
    <thead>
      <tr className="border-b">
        {selectable && (
          <th className="w-12 px-2">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isIndeterminate || false
              }}
              onChange={onSelectAll}
              aria-label="Select all rows"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.id}
            className={cn(
              "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
              column.sortable && "cursor-pointer hover:text-foreground",
              column.align === "center" && "text-center",
              column.align === "right" && "text-right",
              column.hidden && "hidden"
            )}
            style={{ 
              width: column.width,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth
            }}
            onClick={() => {
              onHeaderClick?.(column)
              if (column.sortable) {
                handleSort(column)
              }
            }}
          >
            <div className="flex items-center gap-2">
              <span>{column.header}</span>
              {renderSortIcon(column)}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}