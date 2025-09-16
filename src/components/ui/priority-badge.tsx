"use client"

import { AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { cn } from "@thorbis/design/utils"
import { Badge } from "./badge"

export interface PriorityBadgeProps {
  priority: string
  variant?: "default" | "outline" | "secondary"
  showIcon?: boolean
  className?: string
}

// Priority configurations
const priorityConfigs = {
  low: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: ArrowDown
  },
  normal: {
    color: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
    icon: Minus
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: Minus
  },
  high: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: ArrowUp
  },
  urgent: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: AlertTriangle
  },
  critical: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: AlertTriangle
  }
}

function PriorityBadge({ priority, variant = "default", showIcon = true, className, ...props }: PriorityBadgeProps) {
  const config = priorityConfigs[priority as keyof typeof priorityConfigs] || priorityConfigs.normal
  const IconComponent = config.icon

  return (
    <Badge
      variant={variant}
      className={cn(
        config.color,
        "inline-flex items-center gap-1.5 font-medium",
        className
      )}
      {...props}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  )
}

export { PriorityBadge }
