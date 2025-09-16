'use client'

import { ChevronDown, ChevronRight } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "./sidebar"

interface CollapsibleSidebarGroupProps {
  title: string
  sectionKey: string
  isCollapsed: boolean
  onToggle: (sectionKey: string) => void
  children: React.ReactNode
}

export function CollapsibleSidebarGroup({
  title,
  sectionKey,
  isCollapsed,
  onToggle,
  children
}: CollapsibleSidebarGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group/collapsible">
        <button
          onClick={() => onToggle(sectionKey)}
          className="flex items-center justify-between w-full text-left hover:text-neutral-100 transition-colors"
        >
          <span>{title}</span>
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-neutral-500 group-hover/collapsible:text-neutral-300" />
          ) : (
            <ChevronDown className="h-3 w-3 text-neutral-500 group-hover/collapsible:text-neutral-300" />
          )}
        </button>
      </SidebarGroupLabel>
      {!isCollapsed && (
        <SidebarGroupContent>
          {children}
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  )
}