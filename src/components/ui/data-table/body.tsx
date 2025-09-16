/**
 * Data Table Body Component
 * Table body with rows, cells, and interactive features
 */

import * as React from "react"
import { ChevronRight, ChevronDown, MoreHorizontal } from "lucide-react"
import { cn } from "@thorbis/design/utils"
import { Checkbox } from "../checkbox"
import { Button } from "../button"
import { DataTableColumn, DataTableAction } from "./types"

interface DataTableBodyProps<TData = any> {
  data: TData[]
  columns: DataTableColumn<TData>[]
  getRowId: (row: TData) => string
  selectedRows: string[]
  onRowSelect: (rowId: string) => void
  onRowClick?: (row: TData, index: number) => void
  onRowDoubleClick?: (row: TData, index: number) => void
  onCellClick?: (value: unknown, row: TData, column: DataTableColumn<TData>) => void
  rowClassName?: (row: TData, index: number) => string
  cellClassName?: (value: unknown, row: TData, column: DataTableColumn<TData>) => string
  selectable?: boolean
  expandable?: boolean
  expandedRows: string[]
  onExpandChange: (rowId: string) => void
  renderExpandedRow?: (row: TData) => React.ReactNode
  rowActions?: DataTableAction<TData>[]
  editable?: boolean
  onRowEdit?: (row: TData, changes: Partial<TData>) => void
  customRenderers?: Record<string, (props: unknown) => React.ReactNode>
}

export function DataTableBody<TData>({
  data,
  columns,
  getRowId,
  selectedRows,
  onRowSelect,
  onRowClick,
  onRowDoubleClick,
  onCellClick,
  rowClassName,
  cellClassName,
  selectable,
  expandable,
  expandedRows,
  onExpandChange,
  renderExpandedRow,
  rowActions,
  editable,
  onRowEdit,
  customRenderers = {}
}: DataTableBodyProps<TData>) {
  const isRowSelected = (rowId: string) => selectedRows.includes(rowId)
  const isRowExpanded = (rowId: string) => expandedRows.includes(rowId)

  const renderCell = (row: TData, column: DataTableColumn<TData>, rowIndex: number) => {
    const value = column.accessor ? (row as any)[column.accessor] : undefined

    // Custom renderer
    if (column.render) {
      return column.render(value, row, column)
    }

    // Type-specific rendering
    switch (column.type) {
      case "boolean":
        return (
          <Checkbox
            checked={Boolean(value)}
            disabled={!column.editable}
            onChange={(checked) => {
              if (column.editable && onRowEdit) {
                onRowEdit(row, { [column.accessor as string]: checked })
              }
            }}
          />
        )
      
      case "badge":
        return (
          <span className={cn(
            "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full",
            "bg-gray-100 text-gray-800" // Default styling
          )}>
            {value}
          </span>
        )
      
      case "currency":
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(Number(value) || 0)
      
      case "percentage":
        return `${Number(value) || 0}%`
      
      case "date":
        if (value instanceof Date) {
          return value.toLocaleDateString()
        }
        return new Date(value).toLocaleDateString()
      
      case "custom":
        const CustomRenderer = customRenderers[column.id]
        return CustomRenderer ? <CustomRenderer value={value} row={row} column={column} /> : value
      
      default:
        return column.format ? column.format(value) : value?.toString() || ""
    }
  }

  return (
    <tbody>
      {data.map((row, rowIndex) => {
        const rowId = getRowId(row)
        const isSelected = isRowSelected(rowId)
        const isExpanded = isRowExpanded(rowId)

        return (
          <React.Fragment key={rowId}>
            <tr
              className={cn(
                "border-b hover:bg-muted/50 transition-colors",
                isSelected && "bg-muted",
                onRowClick && "cursor-pointer",
                rowClassName?.(row, rowIndex)
              )}
              onClick={() => onRowClick?.(row, rowIndex)}
              onDoubleClick={() => onRowDoubleClick?.(row, rowIndex)}
            >
              {selectable && (
                <td className="w-12 px-2">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onRowSelect(rowId)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={'Select row ${rowIndex + 1}'}
                  />
                </td>
              )}
              
              {expandable && (
                <td className="w-12 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onExpandChange(rowId)
                    }}
                    aria-label={'${isExpanded ? 'Collapse' : 'Expand'} row ${rowIndex + 1}'}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </td>
              )}

              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    "px-4 py-3 text-sm",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.hidden && "hidden",
                    cellClassName?.((row as any)[column.accessor || ""], row, column)
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onCellClick?.((row as any)[column.accessor || ""], row, column)
                  }}
                >
                  {renderCell(row, column, rowIndex)}
                </td>
              ))}

              {rowActions && rowActions.length > 0 && (
                <td className="w-12 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Open actions menu - implementation depends on UI library
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              )}
            </tr>

            {/* Expanded row content */}
            {expandable && isExpanded && renderExpandedRow && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="p-4 bg-muted/25">
                  {renderExpandedRow(row)}
                </td>
              </tr>
            )}
          </React.Fragment>
        )
      })}
    </tbody>
  )
}