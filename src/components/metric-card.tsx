"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@thorbis/design/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

export interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: {
    value: number
    period?: string
    positive?: boolean
  }
  icon?: React.ComponentType<{ className?: string }>
  loading?: boolean
  className?: string
  onClick?: () => void
}

const MetricCard = React.forwardRef<
  HTMLDivElement,
  MetricCardProps
>(({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon, 
  loading = false, 
  className,
  onClick,
  ...props 
}, ref) => {
  if (loading) {
    return (
      <Card 
        ref={ref}
        className={cn("animate-pulse", className)} 
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
          </CardTitle>
          {Icon && (
            <div className="h-4 w-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-24 mb-2"></div>
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-32"></div>
        </CardContent>
      </Card>
    )
  }

  const isClickable = onClick !== undefined

  return (
    <Card 
      ref={ref}
      className={cn(
        "transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-800",
        className
      )} 
      onClick={onClick}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-neutral-400" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          {subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
          
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              change.positive 
                ? "text-green-600 dark:text-green-400" 
                : change.value === 0
                  ? "text-neutral-500 dark:text-neutral-400"
                  : "text-red-600 dark:text-red-400"
            )}>
              {change.positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : change.value === 0 ? (
                <Minus className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(change.value)}%
              {change.period && <span className="text-neutral-400">vs {change.period}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

MetricCard.displayName = "MetricCard"

export { MetricCard }
