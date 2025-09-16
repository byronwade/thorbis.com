"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: "default" | "outline" | "secondary" | "destructive"
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: PageHeaderAction[]
  children?: React.ReactNode
  className?: string
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ 
    title, 
    description, 
    breadcrumbs = [], 
    actions = [], 
    children,
    className,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700",
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                {breadcrumbs.map((item, index) => (
                  <li key={item.href || item.label} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight 
                        className="h-4 w-4 mx-2 text-neutral-400" 
                        aria-hidden="true"
                      />
                    )}
                    {item.href ? (
                      <a 
                        href={item.href}
                        className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span 
                        className={cn(
                          "text-neutral-900 dark:text-neutral-100 font-medium",
                          index === breadcrumbs.length - 1 && "text-neutral-900 dark:text-neutral-100"
                        )}
                        aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Header Content */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                  {description}
                </p>
              )}
              {children && (
                <div className="mt-4">
                  {children}
                </div>
              )}
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex items-center gap-3">
                {actions.map((action, index) => {
                  const ActionButton = (
                    <Button
                      key={index}
                      variant={action.variant || "default"}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className="whitespace-nowrap"
                    >
                      {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                      {action.label}
                    </Button>
                  )

                  if (action.href) {
                    return (
                      <a key={index} href={action.href}>
                        {ActionButton}
                      </a>
                    )
                  }

                  return ActionButton
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

PageHeader.displayName = "PageHeader"

// Breadcrumb component for standalone use
export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ items, className, ...props }, ref) => {
    if (items.length === 0) return null

    return (
      <nav 
        ref={ref}
        aria-label="Breadcrumb" 
        className={cn("mb-4", className)}
        {...props}
      >
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <li key={item.href || item.label} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="h-4 w-4 mx-2 text-neutral-400 dark:text-neutral-500" 
                  aria-hidden="true"
                />
              )}
              {item.href && index < items.length - 1 ? (
                <a 
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span 
                  className={cn(
                    index === items.length - 1 
                      ? "text-neutral-900 dark:text-neutral-100 font-medium" 
                      : "text-neutral-600 dark:text-neutral-400"
                  )}
                  aria-current={index === items.length - 1 ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)

Breadcrumbs.displayName = "Breadcrumbs"

export { PageHeader, Breadcrumbs }
