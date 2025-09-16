'use client'

import { SidebarProvider, SidebarInset } from "@thorbis/ui/src/components/sidebar"
import { BusinessSidebar } from "@thorbis/ui/src/components/business-sidebar"

export function AppSidebar() {
  return (
    <SidebarProvider defaultOpen={true}>
      <BusinessSidebar industry={"lom"} />
      <SidebarInset />
    </SidebarProvider>
  )
}