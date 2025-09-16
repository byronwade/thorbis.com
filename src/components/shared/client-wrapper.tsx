'use client'

import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SharedAppWrapper, SharedAppWrapperProps } from '@/components/shared/shared-app-wrapper'

export function ClientWrapper({ children, industry, appName }: SharedAppWrapperProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TooltipProvider>
        <SharedAppWrapper industry={industry} appName={appName}>
          {children}
        </SharedAppWrapper>
      </TooltipProvider>
    </ThemeProvider>
  )
}