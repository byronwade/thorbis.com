"use client"

import { SidebarProvider, SidebarInset, BusinessSidebar, BusinessInterface } from '@/components/shared/unified-navigation'
import { ChatInterface } from './chat-interface'

interface ChatLayoutProps {
  user?: {
    email: string
    id: string
    type: string
    name?: string
    avatar?: string
  }
  currentIndustry?: "hs" | "rest" | "auto" | "ret" | "admin"
  onIndustryChange?: (industry: string) => void
  onLogout?: () => void
}

export function ChatLayout({ 
  user, 
  currentIndustry,
  onIndustryChange,
  onLogout 
}: ChatLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <BusinessSidebar industry={'ai'} />
      <SidebarInset>
        <BusinessInterface user={user} currentIndustry={'ai'}>
          <ChatInterface 
            user={user} 
            currentIndustry={currentIndustry}
            onIndustryChange={onIndustryChange}
            onLogout={onLogout}
          />
        </BusinessInterface>
      </SidebarInset>
    </SidebarProvider>
  )
}
