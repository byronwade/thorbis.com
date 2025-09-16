"use client"

import {
  SidebarProvider,
  SidebarInset,
  BusinessSidebar
} from '@/components/ui';



export function Sidebar() {
  return (
    <SidebarProvider defaultOpen={true}>
      <BusinessSidebar industry={"investigations"} />
      <SidebarInset />
    </SidebarProvider>
  )
}