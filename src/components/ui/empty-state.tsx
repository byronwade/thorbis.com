"use client"

import * as React from "react"
import { FileX, Plus, Search } from "lucide-react"
import { cn } from "@thorbis/design/utils"
import { Button } from "./button"

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }
  searchSuggestion?: {
    placeholder: string
    onSearch: (query: string) => void
  }
  className?: string
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    icon: Icon = FileX, 
    title, 
    description, 
    action, 
    searchSuggestion,
    className,
    ...props 
  }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState("")

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      if (searchSuggestion && searchQuery.trim()) {
        searchSuggestion.onSearch(searchQuery.trim())
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center py-12 px-4",
          className
        )}
        {...props}
      >
        <div className="mb-4">
          <Icon className="h-16 w-16 text-neutral-400 dark:text-neutral-500" />
        </div>
        
        <div className="mb-6 max-w-md">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="mb-6">
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="min-w-[120px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          </div>
        )}

        {searchSuggestion && (
          <div className="w-full max-w-sm">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder={searchSuggestion.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 rounded-md border border-neutral-300",
                  "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100",
                  "placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                )}
              />
            </form>
          </div>
        )}
      </div>
    )
  }
)

EmptyState.displayName = "EmptyState"

export { EmptyState }
