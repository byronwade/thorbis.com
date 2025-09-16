# Frontend Development Guide

This guide covers comprehensive frontend development for Thorbis Business OS, including Next.js 15 App Router patterns, the Odixe design system, performance optimization, and industry-specific UI development.

## Frontend Architecture Overview

### Next.js 15 App Router Foundation

Thorbis Business OS uses Next.js 15 with the App Router for optimal performance and developer experience.

```typescript
// Next.js 15 App Router structure
app/
├── layout.tsx              # Root layout
├── page.tsx               # Home page
├── globals.css            # Global styles with Odixe tokens
├── (dashboard)/           # Route groups for layouts
│   ├── layout.tsx         # Dashboard layout
│   ├── customers/         # Customer management
│   │   ├── page.tsx       # Customer list
│   │   └── [id]/          # Dynamic customer routes
│   │       ├── page.tsx   # Customer detail
│   │       └── edit/      # Customer edit
│   │           └── page.tsx
│   └── orders/            # Order management
├── api/                   # API routes
└── components/            # Shared components
```

### Technology Stack

#### Core Frontend Technologies
```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "18.2.0", 
    "react-dom": "18.2.0",
    "typescript": "5.0.0",
    "tailwindcss": "3.3.0",
    "@thorbis/ui": "workspace:*",
    "@thorbis/design": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "eslint": "8.0.0",
    "prettier": "3.0.0",
    "vitest": "1.0.0"
  }
}
```

#### Performance Stack
```typescript
// NextFaster performance configuration
const nextConfig = {
  // App Router optimizations
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true'
  }
}
```

## Odixe Design System Integration

### Design System Philosophy

The Odixe design system embodies our core principles:

```typescript
// Odixe design principles
const odixePhilosophy = {
  // Dark-first VIP aesthetic
  colorPalette: 'minimal-with-electric-accents',
  primaryColor: '#1C8BFF', // Odixe Electric Blue
  
  // No overlay policy
  overlays: 'forbidden',
  alternativePatterns: ['inline-panels', 'dedicated-pages', 'tooltips'],
  
  // Performance-first
  jsbudget: '170KB',
  navigationSpeed: '<300ms',
  
  // Professional minimalism
  density: 'comfortable',
  whitespace: 'generous',
  typography: 'inter-system-font'
} as const
```

### Color System Implementation

```css
/* globals.css - Odixe color tokens */
:root {
  /* Odixe Electric Blue Scale */
  --electric-blue-50: #eff6ff;
  --electric-blue-100: #dbeafe;
  --electric-blue-200: #bfdbfe;
  --electric-blue-300: #93c5fd;
  --electric-blue-400: #60a5fa;
  --electric-blue-500: #1C8BFF; /* Primary Odixe Blue */
  --electric-blue-600: #0B84FF;
  --electric-blue-700: #0A6BDB;
  --electric-blue-800: #1e40af;
  --electric-blue-900: #1e3a8a;
  
  /* Odixe Neutral Scale (Dark-First) */
  --neutral-25: #0A0B0D;    /* Odixe Base */
  --neutral-50: #0D0F13;    /* Odixe Surface */
  --neutral-100: #111319;   
  --neutral-200: #171A21;   /* Odixe Elevated */
  --neutral-300: #1F222A;   
  --neutral-400: #2A2F3A;   /* Odixe Border */
  --neutral-500: #3A404D;   
  --neutral-600: #4D5563;   
  --neutral-700: #7A8598;   /* Odixe Text Secondary */
  --neutral-800: #9CA3B3;   
  --neutral-900: #E6EAF0;   /* Odixe Text Primary */
  --neutral-950: #F8FAFC;   
  
  /* Semantic colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: var(--electric-blue-500);
}

/* Dark theme (default) */
.dark {
  --background: var(--neutral-25);
  --foreground: var(--neutral-900);
  --surface: var(--neutral-50);
  --surface-elevated: var(--neutral-200);
  --border: var(--neutral-400);
  --border-light: var(--neutral-300);
}

/* Light theme (optional) */
.light {
  --background: #ffffff;
  --foreground: var(--neutral-25);
  --surface: #f8fafc;
  --surface-elevated: #ffffff;
  --border: var(--neutral-300);
  --border-light: var(--neutral-200);
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js - Odixe integration
const { fontFamily } = require('tailwindcss/defaultTheme')
const odixeTokens = require('@thorbis/design/tokens/odixe')

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ],
  
  darkMode: 'class',
  
  theme: {
    extend: {
      colors: {
        // Odixe electric blue scale
        electric: {
          50: 'rgb(239 246 255)',
          100: 'rgb(219 234 254)',
          200: 'rgb(191 219 254)',
          300: 'rgb(147 197 253)',
          400: 'rgb(96 165 250)',
          500: 'rgb(28 139 255)', // Primary Odixe Blue
          600: 'rgb(11 132 255)',
          700: 'rgb(10 107 219)',
          800: 'rgb(30 64 175)',
          900: 'rgb(30 58 138)'
        },
        
        // Odixe neutral scale
        surface: {
          primary: 'rgb(10 11 13)',      // Odixe Base
          secondary: 'rgb(13 15 19)',     // Odixe Surface  
          elevated: 'rgb(23 26 33)',      // Odixe Elevated
          hover: 'rgb(31 34 42)'
        },
        
        border: {
          DEFAULT: 'rgb(42 47 58)',       // Odixe Border
          light: 'rgb(31 34 42)',
          focus: 'rgb(28 139 255)'        // Electric blue for focus
        },
        
        text: {
          primary: 'rgb(230 234 240)',    // Odixe Text Primary
          secondary: 'rgb(122 133 152)',  // Odixe Text Secondary
          tertiary: 'rgb(84 93 110)',     // Odixe Text Muted
          inverse: 'rgb(10 11 13)'
        }
      },
      
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['Geist Mono', ...fontFamily.mono]
      },
      
      fontSize: {
        // Odixe typography scale
        'display': ['2rem', { lineHeight: '2.375rem', fontWeight: '600' }],
        'h1': ['1.5rem', { lineHeight: '1.875rem', fontWeight: '600' }],
        'h2': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.625rem', fontWeight: '500' }],
        'body': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'small': ['0.75rem', { lineHeight: '1.125rem', fontWeight: '400' }]
      },
      
      spacing: {
        // Odixe spacing scale
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem'
      },
      
      boxShadow: {
        'odixe-sm': '0 1px 2px 0 rgb(0 0 0 / 0.15)',
        'odixe': '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -1px rgb(0 0 0 / 0.1)',
        'odixe-lg': '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -2px rgb(0 0 0 / 0.1)'
      }
    }
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ]
}
```

## Component Development

### Odixe UI Component Library

#### Base Button Component
```typescript
// packages/ui/src/components/button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  // Base styles - Odixe design system
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary - Odixe Electric Blue
        default: "bg-electric-500 text-white hover:bg-electric-600 active:bg-electric-700",
        
        // Secondary - Neutral with border
        secondary: "border border-border bg-surface-secondary text-text-primary hover:bg-surface-elevated",
        
        // Destructive - Error color
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
        
        // Outline - Border only
        outline: "border border-border bg-transparent text-text-primary hover:bg-surface-hover",
        
        // Ghost - No background
        ghost: "text-text-primary hover:bg-surface-hover",
        
        // Link - Text style
        link: "text-electric-500 underline-offset-4 hover:underline"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### Data Table Component
```typescript
// packages/ui/src/components/data-table.tsx
import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

import { Button } from './button'
import { Input } from './input'
import { cn } from '../lib/utils'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  onRowClick?: (row: TData) => void
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  onRowClick,
  className
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 20
      }
    }
  })

  return (
    <div className={cn("w-full", className)}>
      {/* Search and Filters */}
      <div className="flex items-center py-4">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      {/* Table */}
      <div className="rounded-lg border border-border bg-surface-primary">
        <table className="w-full">
          <thead className="border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-sm font-medium text-text-secondary"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center space-x-2",
                          header.column.getCanSort() && "cursor-pointer hover:text-text-primary"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="ml-2">
                            {header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border transition-colors",
                    onRowClick && "cursor-pointer hover:bg-surface-hover"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-text-secondary">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-text-secondary">
          {table.getFilteredRowModel().rows.length} of{" "}
          {table.getCoreRowModel().rows.length} row(s)
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Layout Components

#### App Layout with Odixe Design
```typescript
// packages/ui/src/components/app-layout.tsx
import * as React from 'react'
import { cn } from '../lib/utils'
import { Navigation } from './navigation'
import { Header } from './header'

interface AppLayoutProps {
  children: React.ReactNode
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  user: {
    name: string
    email: string
    role: string
    avatar?: string
  }
  className?: string
}

export function AppLayout({ children, industry, user, className }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  
  return (
    <div className={cn("min-h-screen bg-surface-primary", className)}>
      {/* Navigation Sidebar */}
      <Navigation
        industry={industry}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      
      {/* Main Content */}
      <div className={cn(
        "transition-all duration-200",
        sidebarOpen ? "pl-64" : "pl-16"
      )}>
        {/* Header */}
        <Header
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Page Content */}
        <main className="px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### Navigation Component
```typescript
// packages/ui/src/components/navigation.tsx
import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  FileText, 
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '../lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

interface NavigationProps {
  industry: 'hs' | 'rest' | 'auto' | 'ret'
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Industry-specific navigation items
const navigationItems: Record<string, NavigationItem[]> = {
  hs: [
    { name: 'Dashboard', href: '/hs', icon: Home },
    { name: 'Customers', href: '/hs/customers', icon: Users },
    { name: 'Work Orders', href: '/hs/work-orders', icon: FileText },
    { name: 'Scheduling', href: '/hs/scheduling', icon: Calendar },
    { name: 'Settings', href: '/hs/settings', icon: Settings }
  ],
  rest: [
    { name: 'Dashboard', href: '/rest', icon: Home },
    { name: 'Orders', href: '/rest/orders', icon: FileText },
    { name: 'Menu', href: '/rest/menu', icon: FileText },
    { name: 'Reservations', href: '/rest/reservations', icon: Calendar },
    { name: 'Settings', href: '/rest/settings', icon: Settings }
  ]
  // ... other industries
}

export function Navigation({ industry, open, onOpenChange }: NavigationProps) {
  const pathname = usePathname()
  const items = navigationItems[industry] || []
  
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-secondary border-r border-border transition-all duration-200",
      open ? "w-64" : "w-16"
    )}>
      {/* Logo and Toggle */}
      <div className="flex h-16 items-center justify-between px-4">
        <div className={cn(
          "flex items-center space-x-3",
          !open && "hidden"
        )}>
          <div className="h-8 w-8 rounded bg-electric-500" />
          <span className="text-lg font-semibold text-text-primary">
            Thorbis
          </span>
        </div>
        
        <button
          onClick={() => onOpenChange(!open)}
          className="rounded-lg p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        >
          {open ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-electric-500 text-white" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn("ml-3", !open && "hidden")}>
                {item.name}
              </span>
              {item.badge && open && (
                <span className="ml-auto rounded-full bg-electric-500 px-2 py-1 text-xs text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
```

## Industry-Specific UI Development

### Home Services UI Components

#### Work Order Card Component
```typescript
// apps/hs/src/components/work-order-card.tsx
import * as React from 'react'
import { Calendar, MapPin, User, Clock, DollarSign } from 'lucide-react'
import { Button } from '@thorbis/ui/components/button'
import { Badge } from '@thorbis/ui/components/badge'
import { cn } from '@thorbis/ui/lib/utils'

interface WorkOrder {
  id: string
  customer: {
    name: string
    address: string
  }
  serviceType: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  scheduledAt: string
  technician: {
    name: string
    avatar?: string
  }
  estimatedDuration: number
  estimatedCost: number
  priority: 'low' | 'normal' | 'high' | 'emergency'
}

interface WorkOrderCardProps {
  workOrder: WorkOrder
  onStatusChange: (id: string, status: string) => void
  onViewDetails: (id: string) => void
  className?: string
}

const statusColors = {
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'in-progress': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
}

const priorityColors = {
  low: 'border-l-gray-500',
  normal: 'border-l-blue-500',
  high: 'border-l-orange-500',
  emergency: 'border-l-red-500'
}

export function WorkOrderCard({ 
  workOrder, 
  onStatusChange, 
  onViewDetails,
  className 
}: WorkOrderCardProps) {
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(workOrder.id, newStatus)
  }
  
  return (
    <div className={cn(
      "rounded-lg border border-border bg-surface-secondary p-6 transition-colors hover:bg-surface-elevated border-l-4",
      priorityColors[workOrder.priority],
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {workOrder.serviceType}
          </h3>
          <p className="text-sm text-text-secondary">
            Order #{workOrder.id}
          </p>
        </div>
        
        <Badge className={cn("border", statusColors[workOrder.status])}>
          {workOrder.status.replace('-', ' ')}
        </Badge>
      </div>
      
      {/* Customer Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4 text-text-secondary" />
          <span className="text-text-primary">{workOrder.customer.name}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-text-secondary" />
          <span className="text-text-secondary">{workOrder.customer.address}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-text-secondary" />
          <span className="text-text-secondary">
            {new Date(workOrder.scheduledAt).toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Work Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-text-secondary" />
          <span className="text-text-secondary">
            {workOrder.estimatedDuration}h estimated
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="h-4 w-4 text-text-secondary" />
          <span className="text-text-secondary">
            ${workOrder.estimatedCost.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Technician */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-8 w-8 rounded-full bg-electric-500 flex items-center justify-center text-white text-sm font-medium">
          {workOrder.technician.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">
            {workOrder.technician.name}
          </p>
          <p className="text-xs text-text-secondary">Assigned Technician</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(workOrder.id)}
          className="flex-1"
        >
          View Details
        </Button>
        
        {workOrder.status === 'scheduled' && (
          <Button
            size="sm"
            onClick={() => handleStatusChange('in-progress')}
          >
            Start Work
          </Button>
        )}
        
        {workOrder.status === 'in-progress' && (
          <Button
            size="sm"
            onClick={() => handleStatusChange('completed')}
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  )
}
```

### Restaurant UI Components

#### Order Display System
```typescript
// apps/rest/src/components/order-display.tsx
import * as React from 'react'
import { Clock, ChefHat, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@thorbis/ui/components/button'
import { Badge } from '@thorbis/ui/components/badge'
import { cn } from '@thorbis/ui/lib/utils'

interface OrderItem {
  name: string
  quantity: number
  modifications?: string[]
  station: 'grill' | 'fryer' | 'salad' | 'dessert'
}

interface Order {
  id: string
  orderNumber: string
  orderType: 'dine-in' | 'takeout' | 'delivery'
  items: OrderItem[]
  status: 'pending' | 'preparing' | 'ready' | 'served'
  orderTime: string
  tableNumber?: number
  customerName?: string
  estimatedReadyTime: string
  priority: 'normal' | 'urgent'
}

interface OrderDisplayProps {
  order: Order
  onStatusChange: (id: string, status: string) => void
  showTimer?: boolean
  className?: string
}

const statusColors = {
  pending: 'border-l-yellow-500 bg-yellow-500/5',
  preparing: 'border-l-blue-500 bg-blue-500/5',
  ready: 'border-l-green-500 bg-green-500/5',
  served: 'border-l-gray-500 bg-gray-500/5'
}

const stationColors = {
  grill: 'bg-red-500/10 text-red-400',
  fryer: 'bg-orange-500/10 text-orange-400',
  salad: 'bg-green-500/10 text-green-400',
  dessert: 'bg-purple-500/10 text-purple-400'
}

export function OrderDisplay({ order, onStatusChange, showTimer = true, className }: OrderDisplayProps) {
  const [elapsedTime, setElapsedTime] = React.useState(0)
  
  React.useEffect(() => {
    if (showTimer && order.status !== 'served') {
      const startTime = new Date(order.orderTime).getTime()
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000 / 60))
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [order.orderTime, order.status, showTimer])
  
  const isOverdue = elapsedTime > 30 // 30 minutes
  
  return (
    <div className={cn(
      "rounded-lg border border-border bg-surface-secondary p-4 border-l-4",
      statusColors[order.status],
      order.priority === 'urgent' && "ring-2 ring-red-500/30",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-text-primary">
              #{order.orderNumber}
            </h3>
            {order.priority === 'urgent' && (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <span>{order.orderType.replace('-', ' ')}</span>
            {order.tableNumber && <span>• Table {order.tableNumber}</span>}
            {order.customerName && <span>• {order.customerName}</span>}
          </div>
        </div>
        
        {showTimer && (
          <div className={cn(
            "text-right",
            isOverdue ? "text-red-400" : "text-text-secondary"
          )}>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{elapsedTime}m</span>
            </div>
            <div className="text-xs">
              ETA: {new Date(order.estimatedReadyTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Order Items by Station */}
      <div className="space-y-3 mb-4">
        {Object.entries(
          order.items.reduce((acc, item) => {
            if (!acc[item.station]) acc[item.station] = []
            acc[item.station].push(item)
            return acc
          }, {} as Record<string, OrderItem[]>)
        ).map(([station, items]) => (
          <div key={station} className="space-y-1">
            <Badge className={cn("text-xs", stationColors[station])}>
              <ChefHat className="h-3 w-3 mr-1" />
              {station.charAt(0).toUpperCase() + station.slice(1)}
            </Badge>
            
            <div className="ml-4 space-y-1">
              {items.map((item, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-text-primary">
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                  {item.modifications && (
                    <div className="text-text-secondary text-xs ml-4">
                      {item.modifications.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2">
        {order.status === 'pending' && (
          <Button
            size="sm"
            onClick={() => onStatusChange(order.id, 'preparing')}
            className="flex-1"
          >
            Start Preparing
          </Button>
        )}
        
        {order.status === 'preparing' && (
          <Button
            size="sm"
            onClick={() => onStatusChange(order.id, 'ready')}
            className="flex-1"
          >
            Mark Ready
          </Button>
        )}
        
        {order.status === 'ready' && (
          <Button
            size="sm"
            onClick={() => onStatusChange(order.id, 'served')}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Served
          </Button>
        )}
      </div>
    </div>
  )
}
```

## State Management and Data Fetching

### Server Components and Client Components

#### Server Component Pattern
```typescript
// app/hs/customers/page.tsx - Server Component
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CustomersTable } from './customers-table'
import { CustomerFilters } from './customer-filters'

interface SearchParams {
  page?: string
  search?: string
  type?: string
}

export default async function CustomersPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const supabase = createServerComponentClient({ cookies })
  
  // Server-side data fetching
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const type = searchParams.type || ''
  
  const { data: customers, count } = await supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .ilike('name', `%${search}%`)
    .eq(type ? 'customer_type' : '', type)
    .range((page - 1) * 20, page * 20 - 1)
    .order('created_at', { ascending: false })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Customers</h1>
      </div>
      
      <CustomerFilters />
      
      <CustomersTable 
        customers={customers || []} 
        totalCount={count || 0}
        currentPage={page}
      />
    </div>
  )
}
```

#### Client Component with State Management
```typescript
// app/hs/customers/customers-table.tsx - Client Component
'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '@thorbis/ui/components/data-table'
import { Button } from '@thorbis/ui/components/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from '@thorbis/ui/hooks/use-toast'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  customer_type: 'residential' | 'commercial'
  created_at: string
}

interface CustomersTableProps {
  customers: Customer[]
  totalCount: number
  currentPage: number
}

export function CustomersTable({ customers, totalCount, currentPage }: CustomersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = React.useState(false)
  
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-text-primary">{row.getValue("name")}</div>
          <div className="text-sm text-text-secondary">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-text-primary">{row.getValue("phone") || 'N/A'}</span>
      ),
    },
    {
      accessorKey: "customer_type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize text-text-primary">
          {row.getValue("customer_type")}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-text-secondary">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]
  
  const handleEdit = (customerId: string) => {
    router.push(`/hs/customers/${customerId}/edit`)
  }
  
  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/hs/customers/${customerId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast({
          title: "Customer deleted",
          description: "The customer has been successfully deleted.",
        })
        router.refresh()
      } else {
        throw new Error('Failed to delete customer')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleRowClick = (customer: Customer) => {
    router.push(`/hs/customers/${customer.id}`)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-text-secondary">
          {totalCount} total customers
        </div>
        
        <Button onClick={() => router.push('/hs/customers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={customers}
        onRowClick={handleRowClick}
        searchPlaceholder="Search customers..."
      />
      
      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', (currentPage - 1).toString())
            router.push(`?${params.toString()}`)
          }}
        >
          Previous
        </Button>
        
        <span className="text-sm text-text-secondary">
          Page {currentPage} of {Math.ceil(totalCount / 20)}
        </span>
        
        <Button
          variant="outline"
          disabled={currentPage >= Math.ceil(totalCount / 20)}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', (currentPage + 1).toString())
            router.push(`?${params.toString()}`)
          }}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

### Custom Hooks for Data Management

#### useCustomers Hook
```typescript
// hooks/use-customers.ts
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  customer_type: string
  created_at: string
}

interface UseCustomersOptions {
  page?: number
  pageSize?: number
  search?: string
  type?: string
}

export function useCustomers(options: UseCustomersOptions = {}) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  
  const supabase = createClientComponentClient()
  
  const { page = 1, pageSize = 20, search = '', type = '' } = options
  
  useEffect(() => {
    fetchCustomers()
  }, [page, pageSize, search, type])
  
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false })
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      }
      
      if (type) {
        query = query.eq('customer_type', type)
      }
      
      const { data, count, error } = await query
      
      if (error) throw error
      
      setCustomers(data || [])
      setTotal(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }
  
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()
      
      if (error) throw error
      
      setCustomers(prev => [data, ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create customer')
    }
  }
  
  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? { ...customer, ...data } : customer
        )
      )
      
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update customer')
    }
  }
  
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setCustomers(prev => prev.filter(customer => customer.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete customer')
    }
  }
  
  return {
    customers,
    loading,
    error,
    total,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
}
```

## Performance Optimization

### NextFaster Implementation

#### Code Splitting and Bundle Optimization
```typescript
// next.config.js - Performance optimizations
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@supabase/supabase-js'
    ],
    serverComponentsExternalPackages: [
      '@supabase/auth-helpers-nextjs',
      '@supabase/supabase-js'
    ]
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle size
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 170000, // 170KB limit
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    
    return config
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
  
  // Performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // Compression
  compress: true,
}

module.exports = withBundleAnalyzer(nextConfig)
```

#### Dynamic Imports for Performance
```typescript
// Dynamic component loading for better performance
import dynamic from 'next/dynamic'

// Lazy load heavy components
const DataVisualization = dynamic(
  () => import('./data-visualization'),
  { 
    loading: () => <div className="h-64 bg-surface-secondary animate-pulse rounded-lg" />,
    ssr: false // Client-side only for heavy interactive components
  }
)

const CustomerMap = dynamic(
  () => import('./customer-map').then(mod => mod.CustomerMap),
  {
    loading: () => <div className="h-96 bg-surface-secondary animate-pulse rounded-lg" />,
    ssr: false
  }
)

// Code splitting for industry-specific components
const HomeServicesWidgets = dynamic(
  () => import('./industries/home-services/widgets'),
  { ssr: true } // Keep server-side rendering for SEO
)

export function Dashboard({ industry }: { industry: string }) {
  return (
    <div className="space-y-6">
      {/* Critical above-the-fold content loads immediately */}
      <DashboardHeader />
      <KeyMetrics />
      
      {/* Heavy components load dynamically */}
      {industry === 'hs' && <HomeServicesWidgets />}
      
      {/* Interactive components load on client */}
      <DataVisualization />
      <CustomerMap />
    </div>
  )
}
```

### Caching and Optimization Strategies

#### React Server Components Caching
```typescript
// app/hs/customers/[id]/page.tsx
import { cache } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Cache customer data fetching
const getCustomer = cache(async (customerId: string) => {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: customer, error } = await supabase
    .from('customers')
    .select(`
      *,
      work_orders (
        id,
        service_type,
        status,
        scheduled_at,
        total_amount
      )
    `)
    .eq('id', customerId)
    .single()
  
  if (error) throw error
  return customer
})

// Cache work order analytics
const getCustomerAnalytics = cache(async (customerId: string) => {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .rpc('get_customer_analytics', { customer_id: customerId })
  
  if (error) throw error
  return data
})

export default async function CustomerDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Parallel data fetching with caching
  const [customer, analytics] = await Promise.all([
    getCustomer(params.id),
    getCustomerAnalytics(params.id)
  ])
  
  return (
    <div className="space-y-6">
      <CustomerHeader customer={customer} />
      <CustomerAnalytics data={analytics} />
      <CustomerWorkOrders workOrders={customer.work_orders} />
    </div>
  )
}
```

## Testing Frontend Components

### Component Testing with Vitest
```typescript
// components/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
  
  it('applies variant classes correctly', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-border', 'bg-surface-secondary')
  })
  
  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
  
  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('inline-flex', 'items-center') // Button styles
  })
})
```

### Page Component Testing
```typescript
// app/hs/customers/__tests__/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CustomersPage from '../page'
import { createMockSupabaseClient } from '@/lib/test-utils'

// Mock Supabase
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerComponentClient: () => createMockSupabaseClient()
}))

// Mock Next.js hooks
vi.mock('next/headers', () => ({
  cookies: vi.fn()
}))

describe('CustomersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('renders customers page with title', async () => {
    const mockCustomers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        customer_type: 'residential',
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
    
    // Mock Supabase response
    const mockSupabase = createMockSupabaseClient()
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        ilike: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            range: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockCustomers,
                count: 1
              })
            })
          })
        })
      })
    })
    
    render(await CustomersPage({ searchParams: {} }))
    
    expect(screen.getByText('Customers')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
  
  it('handles search parameters correctly', async () => {
    const searchParams = { search: 'john', page: '2', type: 'residential' }
    
    render(await CustomersPage({ searchParams }))
    
    // Verify that search parameters are applied to the query
    await waitFor(() => {
      expect(screen.getByDisplayValue('john')).toBeInTheDocument()
    })
  })
})
```

## Next Steps

After mastering frontend development:

1. **[Database Development](./05-database-development.md)**: Learn PostgreSQL with RLS and multi-tenancy
2. **[Testing Strategy](./06-testing-strategy.md)**: Implement comprehensive testing approaches
3. **[Performance Optimization](./07-performance-optimization.md)**: Master NextFaster performance techniques
4. **[Deployment Guide](./08-deployment-guide.md)**: Deploy applications to production

## Frontend Development Resources

### Design System Resources
- **Odixe Design Tokens**: Complete token system with dark-first approach
- **Component Library**: Comprehensive UI component documentation
- **Design Guidelines**: Visual design principles and patterns
- **Accessibility Standards**: WCAG compliance and inclusive design

### Performance Tools
- **Bundle Analyzer**: Analyze and optimize JavaScript bundles
- **Lighthouse**: Performance auditing and optimization
- **Web Vitals**: Core performance metrics monitoring
- **NextFaster Compliance**: Performance benchmark testing

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [API Development](./03-api-development.md) | Next: [Database Development](./05-database-development.md)*