'use client'

import React, { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Input } from './input'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  RefreshCw,
  GripVertical,
  AlertCircle
} from 'lucide-react'
import { 
  useOptimisticList, 
  useOptimisticReorder,
  OptimisticListAction 
} from '@/hooks/use-optimistic'

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface OptimisticListItem {
  id: string
  title: string
  description?: string
  completed?: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

interface OptimisticListProps<T extends OptimisticListItem> {
  items: T[]
  cacheKey: string
  onAdd: (item: Partial<T>) => Promise<T>
  onUpdate: (id: string, item: Partial<T>) => Promise<T>
  onDelete: (id: string) => Promise<void>
  onReorder?: (items: T[]) => Promise<T[]>
  allowAdd?: boolean
  allowEdit?: boolean
  allowDelete?: boolean
  allowReorder?: boolean
  showDescription?: boolean
  showCompleted?: boolean
  className?: string
  itemClassName?: string
  emptyMessage?: string
  addPlaceholder?: string
  renderItem?: (item: T, index: number) => React.ReactNode
}

// =============================================================================
// Optimistic List Component
// =============================================================================

export function OptimisticList<T extends OptimisticListItem>({
  items,
  cacheKey,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  allowAdd = true,
  allowEdit = true,
  allowDelete = true,
  allowReorder = false,
  showDescription = true,
  showCompleted = false,
  className,
  itemClassName,
  emptyMessage = 'No items yet',
  addPlaceholder = 'Add new item...',
  renderItem
}: OptimisticListProps<T>) {
  const [newItemTitle, setNewItemTitle] = useState(')
  const [newItemDescription, setNewItemDescription] = useState(')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState(')
  const [editDescription, setEditDescription] = useState(')
  const [isAddingItem, setIsAddingItem] = useState(false)
  const dragItemRef = useRef<string | null>(null)
  const dragOverItemRef = useRef<string | null>(null)

  // Optimistic actions
  const addAction: OptimisticListAction<T, Partial<T>> = {
    type: 'add',
    cacheKey,
    mutation: onAdd,
    optimisticUpdate: (currentData, params) => [
      ...currentData,
      {
        id: 'temp-${Date.now()}',
        title: params.title || ',
        description: params.description || ',
        completed: false,
        createdAt: new Date().toISOString(),
        ...params
      } as T
    ]
  }

  const updateAction: OptimisticListAction<T, { id: string; updates: Partial<T> }> = {
    type: 'update',
    cacheKey,
    mutation: async ({ id, updates }) => onUpdate(id, updates),
    optimisticUpdate: (currentData, { id, updates }) =>
      currentData.map(item => 
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
  }

  const deleteAction: OptimisticListAction<T, string> = {
    type: 'delete',
    cacheKey,
    mutation: onDelete,
    optimisticUpdate: (currentData, id) => currentData.filter(item => item.id !== id)
  }

  const { execute: executeAdd, isPending: isAdding } = useOptimisticList(addAction)
  const { execute: executeUpdate, isPending: isUpdating } = useOptimisticList(updateAction)
  const { execute: executeDelete, isPending: isDeleting } = useOptimisticList(deleteAction)
  
  // Reorder functionality
  const { reorder, isPending: isReordering } = useOptimisticReorder(
    cacheKey,
    onReorder || (async (items) => items)
  )

  // Add new item
  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return

    setIsAddingItem(true)
    try {
      await executeAdd({
        title: newItemTitle.trim(),
        description: newItemDescription.trim() || undefined,
        completed: false
      })
      
      setNewItemTitle(')
      setNewItemDescription(')
    } catch (error) {
      console.error('Failed to add item:', error)
    } finally {
      setIsAddingItem(false)
    }
  }

  // Start editing an item
  const startEdit = (item: T) => {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditDescription(item.description || ')
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle(')
    setEditDescription(')
  }

  // Save edit
  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return

    try {
      await executeUpdate({
        id: editingId,
        updates: {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined
        } as Partial<T>
      })
      
      setEditingId(null)
      setEditTitle(')
      setEditDescription(')
    } catch (error) {
      console.error('Failed to update item:', error)
    }
  }

  // Delete item
  const deleteItem = async (id: string) => {
    try {
      await executeDelete(id)
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  // Toggle completed status
  const toggleCompleted = async (item: T) => {
    try {
      await executeUpdate({
        id: item.id,
        updates: { completed: !item.completed } as Partial<T>
      })
    } catch (error) {
      console.error('Failed to toggle completed:', error)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragItemRef.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    dragOverItemRef.current = id
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    
    const draggedId = dragItemRef.current
    const draggedOverId = dragOverItemRef.current
    
    if (!draggedId || !draggedOverId || draggedId === draggedOverId) return

    const draggedIndex = items.findIndex(item => item.id === draggedId)
    const draggedOverIndex = items.findIndex(item => item.id === draggedOverId)

    if (draggedIndex === -1 || draggedOverIndex === -1) return

    try {
      await reorder(draggedIndex, draggedOverIndex)
    } catch (error) {
      console.error('Failed to reorder items:', error)
    }

    dragItemRef.current = null
    dragOverItemRef.current = null
  }

  const filteredItems = showCompleted ? items : items.filter(item => !item.completed)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Add new item form */}
      {allowAdd && (
        <div className="space-y-2 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
          <div className="flex gap-2">
            <Input
              placeholder={addPlaceholder}
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddItem()
                }
              }}
              disabled={isAddingItem}
              className="flex-1"
            />
            <Button
              onClick={handleAddItem}
              disabled={!newItemTitle.trim() || isAddingItem}
              size="sm"
            >
              {isAddingItem ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {showDescription && (
            <Input
              placeholder="Description (optional)"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              disabled={isAddingItem}
            />
          )}
        </div>
      )}

      {/* Items list */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'group flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-lg transition-all duration-200',
                'hover:bg-neutral-850 hover:border-neutral-700',
                item.completed && 'opacity-60',
                isReordering && 'transition-transform',
                itemClassName
              )}
              draggable={allowReorder}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={handleDrop}
            >
              {/* Drag handle */}
              {allowReorder && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-neutral-400" />
                </div>
              )}

              {/* Completed checkbox */}
              {showCompleted && (
                <button
                  onClick={() => toggleCompleted(item)}
                  disabled={isUpdating}
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                    item.completed
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-neutral-400 hover:border-green-500'
                  )}
                >
                  {item.completed && <Check className="w-3 h-3" />}
                </button>
              )}

              {/* Item content */}
              <div className="flex-1 min-w-0">
                {renderItem ? (
                  renderItem(item, index)
                ) : (
                  <>
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          autoFocus
                        />
                        {showDescription && (
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description (optional)"
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <h4 className={cn(
                          'font-medium text-white',
                          item.completed && 'line-through'
                        )}>
                          {item.title}
                        </h4>
                        {showDescription && item.description && (
                          <p className="text-sm text-neutral-400 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === item.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveEdit}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    {allowEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(item)}
                        disabled={isUpdating}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                    {allowDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        disabled={isDeleting}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950"
                      >
                        {isDeleting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status indicator */}
      {(isAdding || isUpdating || isDeleting || isReordering) && (
        <div className="flex items-center justify-center py-2 text-sm text-neutral-400">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Updating...
        </div>
      )}
    </div>
  )
}

export default OptimisticList