/**
 * Data Table Hooks
 * Custom hooks for data table functionality
 */

import { useState, useMemo, useCallback, useEffect } from "react"
import { DataTableProps, DataTableState, DataTableFilter, DataTableSort, DataTableMetrics } from "./types"

export function useDataTableState<TData>(
  initialState?: Partial<DataTableState<TData>>
): [DataTableState<TData>, (updates: Partial<DataTableState<TData>>) => void] {
  const [state, setState] = useState<DataTableState<TData>>({
    viewMode: "table",
    searchQuery: "",
    appliedFilters: [],
    selectedRows: [],
    currentPage: 1,
    pageSize: 50,
    sorts: [],
    columnWidths: Record<string, unknown>,
    hiddenColumns: [],
    expandedRows: [],
    editingRows: Record<string, unknown>,
    density: "comfortable",
    isLoading: false,
    ...initialState
  })

  const updateState = useCallback((updates: Partial<DataTableState<TData>>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  return [state, updateState]
}

export function useDataTableFiltering<TData>(
  data: TData[],
  searchQuery: string,
  filters: DataTableFilter[],
  searchableColumns: string[]
) {
  return useMemo(() => {
    let filteredData = [...data]

    // Apply global search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredData = filteredData.filter(row => {
        return searchableColumns.some(column => {
          const value = (row as any)[column]
          return value?.toString().toLowerCase().includes(query)
        })
      })
    }

    // Apply column filters
    filters.forEach(filter => {
      filteredData = filteredData.filter(row => {
        const value = (row as any)[filter.column]
        
        switch (filter.operator) {
          case "equals":
            return value === filter.value
          case "contains":
            return value?.toString().toLowerCase().includes(filter.value.toLowerCase())
          case "startsWith":
            return value?.toString().toLowerCase().startsWith(filter.value.toLowerCase())
          case "endsWith":
            return value?.toString().toLowerCase().endsWith(filter.value.toLowerCase())
          case "gt":
            return Number(value) > Number(filter.value)
          case "lt":
            return Number(value) < Number(filter.value)
          case "gte":
            return Number(value) >= Number(filter.value)
          case "lte":
            return Number(value) <= Number(filter.value)
          case "in":
            return Array.isArray(filter.value) && filter.value.includes(value)
          case "notIn":
            return Array.isArray(filter.value) && !filter.value.includes(value)
          default:
            return true
        }
      })
    })

    return filteredData
  }, [data, searchQuery, filters, searchableColumns])
}

export function useDataTableSorting<TData>(
  data: TData[],
  sorts: DataTableSort[]
) {
  return useMemo(() => {
    if (sorts.length === 0) return data

    return [...data].sort((a, b) => {
      for (const sort of sorts) {
        const aValue = (a as any)[sort.column]
        const bValue = (b as any)[sort.column]

        let comparison = 0
        
        if (aValue === null || aValue === undefined) {
          comparison = bValue === null || bValue === undefined ? 0 : -1
        } else if (bValue === null || bValue === undefined) {
          comparison = 1
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue)
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime()
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }

        if (comparison !== 0) {
          return sort.direction === "asc" ? comparison : -comparison
        }
      }
      return 0
    })
  }, [data, sorts])
}

export function useDataTablePagination<TData>(
  data: TData[],
  currentPage: number,
  pageSize: number
) {
  return useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      paginatedData: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / pageSize),
      totalItems: data.length,
      hasNextPage: endIndex < data.length,
      hasPreviousPage: currentPage > 1,
      startIndex,
      endIndex: Math.min(endIndex, data.length)
    }
  }, [data, currentPage, pageSize])
}

export function useDataTableSelection<TData>(
  data: TData[],
  selectedRows: string[],
  getRowId: (row: TData) => string,
  onSelectionChange?: (selectedRows: string[]) => void
) {
  const toggleRowSelection = useCallback((rowId: string) => {
    const newSelection = selectedRows.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId]
    
    onSelectionChange?.(newSelection)
  }, [selectedRows, onSelectionChange])

  const toggleAllRows = useCallback(() => {
    const allRowIds = data.map(getRowId)
    const newSelection = selectedRows.length === allRowIds.length ? [] : allRowIds
    onSelectionChange?.(newSelection)
  }, [data, selectedRows, getRowId, onSelectionChange])

  const isRowSelected = useCallback((rowId: string) => {
    return selectedRows.includes(rowId)
  }, [selectedRows])

  const isAllSelected = useMemo(() => {
    if (data.length === 0) return false
    return data.every(row => selectedRows.includes(getRowId(row)))
  }, [data, selectedRows, getRowId])

  const isIndeterminate = useMemo(() => {
    return selectedRows.length > 0 && !isAllSelected
  }, [selectedRows, isAllSelected])

  return {
    toggleRowSelection,
    toggleAllRows,
    isRowSelected,
    isAllSelected,
    isIndeterminate,
    selectedCount: selectedRows.length
  }
}

export function useDataTableMetrics<TData>(
  totalItems: number,
  filteredData: TData[],
  selectedRows: string[],
  paginatedData: TData[],
  isLoading: boolean
): DataTableMetrics {
  return useMemo(() => ({
    totalItems,
    filteredItems: filteredData.length,
    selectedItems: selectedRows.length,
    visibleItems: paginatedData.length,
    loadingItems: isLoading ? undefined : 0
  }), [totalItems, filteredData.length, selectedRows.length, paginatedData.length, isLoading])
}

export function useDataTableSettings<TData>(
  settingsKey?: string,
  initialSettings?: Partial<DataTableState<TData>>
) {
  const [settings, setSettings] = useState<Partial<DataTableState<TData>>>(
    initialSettings || {}
  )

  // Load settings from localStorage on mount
  useEffect(() => {
    if (settingsKey && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`data-table-${settingsKey}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          setSettings(parsed)
        }
      } catch (error) {
        console.warn("Failed to load data table settings:", error)
      }
    }
  }, [settingsKey])

  // Save settings to localStorage when they change
  const updateSettings = useCallback((newSettings: Partial<DataTableState<TData>>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      
      if (settingsKey && typeof window !== "undefined") {
        try {
          localStorage.setItem(`data-table-${settingsKey}`, JSON.stringify(updated))
        } catch (error) {
          console.warn("Failed to save data table settings:", error)
        }
      }
      
      return updated
    })
  }, [settingsKey])

  return [settings, updateSettings] as const
}

export function useDataTableExport<TData>(
  data: TData[],
  columns: unknown[],
  selectedRows: string[],
  getRowId: (row: TData) => string
) {
  const exportData = useCallback((options: {
    format: "csv" | "xlsx" | "json" | "pdf"
    filename?: string
    includeHeaders?: boolean
    selectedOnly?: boolean
    visibleColumnsOnly?: boolean
  }) => {
    const dataToExport = options.selectedOnly 
      ? data.filter(row => selectedRows.includes(getRowId(row)))
      : data
    
    const columnsToExport = options.visibleColumnsOnly
      ? columns.filter(col => !col.hidden)
      : columns

    // Implementation would depend on chosen export library
    console.log("Exporting data:", { dataToExport, columnsToExport, options })
    
    // This is a placeholder - actual implementation would use libraries like
    // xlsx, papaparse, jsPDF, etc.
  }, [data, columns, selectedRows, getRowId])

  return { exportData }
}