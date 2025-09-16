'use client'

/**
 * Smart Dashboard Layout
 * 
 * A context-aware layout component that automatically detects the route and
 * configures the appropriate industry-specific sidebar, navigation, and metadata.
 * This replaces the need for multiple layout files throughout the dashboard routes.
 * 
 * Now includes navigation context to handle browser back/forward button changes
 * and ensure the sidebar and navigation stay in sync with the current route.
 */

import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SharedAppWrapper } from '@/components/shared/shared-app-wrapper'
import { NavigationProvider, useNavigation } from '@/components/navigation-context'
import { shouldShowInstallBanner } from '@/lib/route-detection'

interface SmartDashboardLayoutProps {
  children: React.ReactNode
}

function SmartDashboardLayoutInner({ children }: SmartDashboardLayoutProps) {
  const { routeContext, navigationState, isNavigating } = useNavigation()
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TooltipProvider>
        <SharedAppWrapper 
          routeContext={routeContext}
          navigationState={navigationState}
          isNavigating={isNavigating}
        >
          {children}
        </SharedAppWrapper>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export function SmartDashboardLayout({ children }: SmartDashboardLayoutProps) {
  return (
    <NavigationProvider>
      <SmartDashboardLayoutInner>
        {children}
      </SmartDashboardLayoutInner>
    </NavigationProvider>
  )
}