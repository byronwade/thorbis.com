"use client"

import * as React from "react"
import { MoreVertical } from "lucide-react"
import { cn } from "@thorbis/design/utils"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

export interface ActionMenuItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
  separator?: boolean
}

export interface ActionMenuProps {
  actions: ActionMenuItem[]
  trigger?: React.ReactNode
  align?: "start" | "center" | "end"
  disabled?: boolean
  className?: string
}

const ActionMenu = React.forwardRef<
  HTMLDivElement,
  ActionMenuProps
>(({ 
  actions, 
  trigger, 
  align = "end", 
  disabled = false, 
  className,
  ...props 
}, ref) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="sm"
            disabled={disabled}
            className={cn("h-8 w-8 p-0", className)}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} {...props} ref={ref}>
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "cursor-pointer flex items-center gap-2",
                action.variant === "destructive" && 
                "text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              )}
            >
              {action.icon && (
                <action.icon className="h-4 w-4" />
              )}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

ActionMenu.displayName = "ActionMenu"

export { ActionMenu }
