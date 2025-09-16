'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage?: boolean
}

interface BreadcrumbNavigationProps {
  currentIndustry?: string
  className?: string
  inline?: boolean
}

export function BreadcrumbNavigation({ currentIndustry, className, inline = false }: BreadcrumbNavigationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Industry mapping
  const industryLabels: Record<string, string> = {
    hs: 'Home Services',
    rest: 'Restaurant',
    auto: 'Auto Services', 
    ret: 'Retail',
    books: 'Accounting',
    courses: 'Learning',
    investigations: 'Investigations',
    payroll: 'Payroll',
    banking: 'Banking',
    lom: 'LOM',
    ai: 'AI Assistant',
    marketing: 'Marketing'
  }

  // Page title mapping
  const pageTitles: Record<string, string> = {
    // Shared pages
    'analytics': 'Analytics Dashboard',
    'money': 'Financial Management',
    'ai': 'AI Assistant',
    
    // Home Services
    'customers': 'Customers',
    'dispatch': 'Dispatch Board',
    'work-orders': 'Work Orders',
    'estimates': 'Estimates',
    'invoices': 'Invoices',
    'team': 'Team Management',
    'inventory': 'Inventory',
    'communications': 'Communications',
    'portal': 'Customer Portal',
    'timetracking': 'Time Tracking',
    
    // Restaurant
    'pos': 'Point of Sale',
    'floor': 'Floor Management',
    'menus': 'Menu Management',
    'reservations': 'Reservations',
    'checks': 'Order Checks',
    
    // Auto Services
    'service-bays': 'Service Bays',
    'vehicles': 'Vehicle Database',
    'parts': 'Parts Inventory',
    'repair-orders': 'Repair Orders',
    
    // Retail
    'products': 'Product Catalog',
    'orders': 'Order Management',
    'receipts': 'Receipt History',
    'reports': 'Sales Reports',
    
    // Courses
    'browse': 'Course Catalog',
    'progress': 'Learning Progress',
    'achievements': 'Achievements',
    'study-groups': 'Study Groups',
    'leaderboard': 'Leaderboard',
    'profile': 'Profile',
    'settings': 'Settings'
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = []
    const pathSegments = pathname.split('/').filter(Boolean)
    
    // For inline mode, don't include the root "Dashboards" as the business switcher serves as root'
    if (!inline) {
      breadcrumbs.push({
        label: 'Dashboards',
        href: '/dashboards'
      })
    }

    // Handle different path structures
    if (pathSegments[0] === 'dashboards') {
      // Handle /dashboards/... paths
      if (pathSegments.length === 1) {
        // Just /dashboards - in inline mode, show nothing extra
        if (inline) return breadcrumbs
        breadcrumbs[0].isCurrentPage = true
        return breadcrumbs
      }

      // Check if it's a shared page, route group, or industry page'
      const secondSegment = pathSegments[1]
      
      if (secondSegment === '(shared)') {
        // Shared pages like /dashboards/(shared)/analytics, /dashboards/(shared)/money/payroll
        const actualPage = pathSegments[2] // analytics, money, courses, etc.
        const fromParam = searchParams.get('from')
        
        // Add parent industry if coming from somewhere
        if (fromParam && industryLabels[fromParam]) {
          breadcrumbs.push({
            label: 'Dashboard',
            href: '/dashboards/(verticals)/${fromParam}/(dashboard)'
          })
        }
        
        // Handle deeper nested shared pages
        if (actualPage === 'money') {
          // Money section like /dashboards/(shared)/money/payroll or /dashboards/(shared)/money/banking
          if (pathSegments[3]) {
            breadcrumbs.push({
              label: 'Financial Management`,
              href: `/dashboards/(shared)/money'
            })
            
            const subSection = pathSegments[3] // payroll, banking, books
            if (pathSegments[4]) {
              // Further nested like /payroll/employees/directory
              breadcrumbs.push({
                label: subSection.charAt(0).toUpperCase() + subSection.slice(1),
                href: '/dashboards/(shared)/money/${subSection}'
              })
              
              // Add the final page
              const finalPage = pathSegments[pathSegments.length - 1]
              breadcrumbs.push({
                label: pageTitles[finalPage] || finalPage.charAt(0).toUpperCase() + finalPage.slice(1).replace('-', ' '),
                href: pathname,
                isCurrentPage: true
              })
            } else {
              // Just the sub-section like /payroll
              breadcrumbs.push({
                label: subSection.charAt(0).toUpperCase() + subSection.slice(1),
                href: pathname,
                isCurrentPage: true
              })
            }
          } else {
            // Just /money
            breadcrumbs.push({
              label: 'Financial Management',
              href: pathname,
              isCurrentPage: true
            })
          }
        } else if (actualPage === 'courses') {
          // Courses section
          breadcrumbs.push({
            label: 'Learning Platform',
            href: pathname,
            isCurrentPage: true
          })
        } else {
          // Other shared pages like analytics, ai
          breadcrumbs.push({
            label: pageTitles[actualPage] || actualPage.charAt(0).toUpperCase() + actualPage.slice(1),
            href: pathname,
            isCurrentPage: true
          })
        }
      } else if (secondSegment === '(verticals)') {
        // Industry pages like /dashboards/(verticals)/hs/(dashboard) or /dashboards/(verticals)/hs/(app)/customers
        const industry = pathSegments[2] // hs, rest, auto, ret
        const routeGroup = pathSegments[3] // (dashboard), (app), or direct page
        
        if (routeGroup === '(dashboard)' || !routeGroup) {
          // Main dashboard page
          breadcrumbs.push({
            label: 'Dashboard',
            href: pathname,
            isCurrentPage: true
          })
        } else if (routeGroup === '(app)' || !routeGroup.startsWith('(')) {
          // Sub-pages within the industry
          if (routeGroup === '(app)' && pathSegments[4]) {
            // Route group structure like /hs/(app)/customers
            breadcrumbs.push({
              label: 'Dashboard',
              href: '/dashboards/(verticals)/${industry}/(dashboard)'
            })
            
            const subPage = pathSegments[4]
            breadcrumbs.push({
              label: pageTitles[subPage] || subPage.charAt(0).toUpperCase() + subPage.slice(1).replace('-', ' '),
              href: pathname,
              isCurrentPage: true
            })
          } else if (!routeGroup.startsWith('(')) {
            // Direct structure like /hs/customers  
            breadcrumbs.push({
              label: 'Dashboard',
              href: '/dashboards/(verticals)/${industry}/(dashboard)'
            })
            
            breadcrumbs.push({
              label: pageTitles[routeGroup] || routeGroup.charAt(0).toUpperCase() + routeGroup.slice(1).replace('-', ' '),
              href: pathname,
              isCurrentPage: true
            })
          }
        }
      } else if (industryLabels[secondSegment]) {
        // Legacy direct industry routes like /dashboards/hs (if they still exist)
        if (pathSegments[2]) {
          breadcrumbs.push({
            label: 'Dashboard',
            href: '/dashboards/${secondSegment}'
          })
          
          const subPage = pathSegments[2]
          breadcrumbs.push({
            label: pageTitles[subPage] || subPage.charAt(0).toUpperCase() + subPage.slice(1).replace('-', ' '),
            href: pathname,
            isCurrentPage: true
          })
        } else {
          breadcrumbs.push({
            label: 'Dashboard',
            href: pathname,
            isCurrentPage: true
          })
        }
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs if we're just on the home page or if inline mode has no additional breadcrumbs
  if (breadcrumbs.length === 0 || (breadcrumbs.length <= 1 && breadcrumbs[0]?.isCurrentPage)) {
    return null
  }

  if (inline) {
    // Vercel-style inline breadcrumbs - cleaner, more integrated look
    return (
      <nav className={cn("flex items-center text-sm", className)} aria-label="Breadcrumb">
        {breadcrumbs.map((item, index) => (
          <div key={item.href} className="flex items-center">
            {/* Vercel-style separator - more subtle */}
            <div className="text-neutral-600 mx-1">/</div>
            
            {item.isCurrentPage ? (
              <span className="text-neutral-300 font-medium px-2 py-1 rounded-md bg-neutral-800/30">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-neutral-400 hover:text-neutral-200 transition-all duration-200 px-2 py-1 rounded-md hover:bg-neutral-800/50"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    )
  }

  // Original breadcrumb style for non-inline mode
  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)} aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-neutral-500 mx-2" />
          )}
          
          {item.isCurrentPage ? (
            <span className="text-neutral-300 font-medium">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-neutral-400 hover:text-neutral-200 transition-colors duration-200 hover:underline"
            >
              {index === 0 && !inline && (
                <Home className="h-4 w-4 inline mr-1" />
              )}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}