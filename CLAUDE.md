# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Last Updated**: 2025-01-31  
> **Version**: 4.1.0  
> **Status**: Production Ready - Route Groups Organized

## Project Architecture

### Single Next.js Application Structure
This is a **single Next.js 15 application** using **App Router** with **TypeScript** and **Tailwind CSS**.

**Important**: This is NOT a monorepo. It's a unified application that serves different industry verticals and user types through organized route groups:

#### Public Routes (Marketing Site)
- `thorbis.com` - Main marketing website
- `thorbis.com/docs` - Public API documentation  
- `thorbis.com/blog` - Marketing blog
- `thorbis.com/[industry]-[service]` - SEO landing pages

#### Protected Routes (Authenticated Dashboard)
- `thorbis.com/dashboards` - Main dashboard hub
- `thorbis.com/dashboards/hs/*` - Home Services admin panel
- `thorbis.com/dashboards/rest/*` - Restaurant admin panel
- `thorbis.com/dashboards/auto/*` - Auto Services admin panel  
- `thorbis.com/dashboards/ret/*` - Retail admin panel
- `thorbis.com/dashboards/investigations/*` - Investigation services
- `thorbis.com/dashboards/analytics/*` - Cross-industry analytics
- `thorbis.com/dashboards/money/*` - Financial management (banking, books, payroll)
- `thorbis.com/dashboards/marketing/*` - Marketing automation
- `thorbis.com/dashboards/courses/*` - Learning management platform

```bash
# Install dependencies
npm install

# Development
npm run dev         # Start development server on port 3000

# Build and validation  
npm run build       # Build the application
npm run lint        # Lint the codebase
npm run type-check  # TypeScript validation

# Database operations (Supabase)
npm run db:generate # Generate types from schema
npm run db:push     # Push schema changes
npm run db:seed     # Seed with demo data
```

## High-Level Architecture

### Core Philosophy: "Feature-Complete, API-Driven, Documentation-Synchronized"
- **Feature-API-Docs Triad**: Every feature has its API endpoint and documentation
- **Synchronized Development**: Creating features = creating APIs + docs, removing features = removing APIs + docs
- **Route-Based Industry Separation**: Different routes serve different verticals within same application
- **Dark-first UI**: VIP black/white with electric blue accents (#1C8BFF)
- **No overlays**: No dialogs, modals, or popovers - use inline panels, dedicated pages, and tooltips only
- **NextFaster performance**: Sub-300ms navigation, 170KB JS budget, aggressive caching
- **Customer-First Portal**: Comprehensive self-service portal for payments and subscriptions

### Application Structure
```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 🔒 Authentication & Protected Routes
│   │   ├── (forms)/              # Authentication forms and flows
│   │   │   ├── login/            # Login forms
│   │   │   ├── signup/           # Registration forms
│   │   │   ├── reset-password/   # Password reset
│   │   │   ├── business-setup/   # Business onboarding
│   │   │   └── support-ticket/   # Support forms
│   │   └── dashboards/           # Main dashboard system
│   │       ├── (admin)/          # 👑 Admin-only dashboards
│   │       │   └── api/          # Admin API endpoints
│   │       ├── (shared)/         # 🔄 Shared dashboard components
│   │       │   ├── (users)/      # Customer portal components
│   │       │   ├── analytics/    # Analytics dashboards
│   │       │   ├── money/        # Financial management
│   │       │   │   ├── banking/  # Banking & investments
│   │       │   │   ├── books/    # Accounting & bookkeeping
│   │       │   │   └── payroll/  # Payroll management
│   │       │   ├── marketing/    # Marketing automation
│   │       │   ├── courses/      # Learning management
│   │       │   ├── integrations/ # Third-party integrations
│   │       │   ├── devices/      # IoT & device management
│   │       │   └── settings/     # System configuration
│   │       └── (verticals)/      # 🏢 Industry-specific dashboards
│   │           ├── hs/           # Home Services
│   │           ├── rest/         # Restaurant
│   │           ├── auto/         # Auto Services  
│   │           ├── ret/          # Retail
│   │           └── investigations/ # Investigation services
│   ├── (site)/                   # 🌐 Public Marketing Site
│   │   ├── (company)/            # Company pages (about, legal)
│   │   ├── (landing-pages)/      # SEO-optimized landing pages
│   │   ├── (marketing)/          # Marketing content & blog
│   │   ├── (verticals)/          # Public industry pages
│   │   └── docs/                 # Public documentation
│   └── api/                      # 🔌 API Routes (/api/v1/*)
│       └── v1/                   # Versioned API endpoints
│           ├── auth/             # Authentication APIs
│           ├── hs/               # Home Services APIs
│           ├── rest/             # Restaurant APIs
│           ├── auto/             # Auto Services APIs
│           ├── ret/              # Retail APIs
│           ├── subscriptions/    # Subscription management
│           ├── payments/         # Payment processing
│           ├── analytics/        # Analytics & reporting
│           ├── integrations/     # Third-party integrations
│           └── system/           # System administration
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── shared/                  # Shared business components
│   └── [industry]/              # Industry-specific components
├── lib/                         # Utilities and configurations
├── hooks/                       # Custom React hooks
└── types/                       # TypeScript type definitions

docs/                            # API and feature documentation
migrations/                      # Database migrations
supabase/                       # Supabase configuration and seeds
```

### Route Groups Organization

The application uses **Next.js Route Groups** (folders in parentheses) for logical organization without affecting the URL structure:

#### **(auth)** - Authentication & Protected Routes
- **Purpose**: All authentication flows and protected dashboard content
- **Access Control**: Requires user authentication
- **Sub-groups**:
  - **(forms)** - Login, signup, and onboarding flows
  - **dashboards** - Main application dashboards with nested organization

#### **dashboards** - Comprehensive Dashboard System
- **(admin)** - Admin-only features with elevated permissions
- **(shared)** - Cross-industry shared functionality
  - **(users)** - Customer-facing portal components
  - **analytics**, **money**, **marketing**, etc. - Feature-based organization
- **(verticals)** - Industry-specific dashboards (hs, rest, auto, ret, investigations)

#### **(site)** - Public Marketing Site
- **Purpose**: Public-facing marketing and informational content
- **Access Control**: Public access, SEO-optimized
- **Sub-groups**:
  - **(company)** - Corporate pages
  - **(landing-pages)** - Industry-specific landing pages
  - **(marketing)** - Content marketing and blog
  - **(verticals)** - Public industry information

#### **api** - RESTful API Endpoints
- **Structure**: `/api/v1/[resource]/[id?]/[action?]`
- **Organization**: Grouped by feature area and industry vertical
- **Versioning**: All endpoints under `/v1/` for future compatibility

### Database Architecture (Supabase)
- **Multi-tenant by default**: All tables include tenant isolation
- **Row Level Security (RLS)** on everything - no exceptions
- **Industry-separated schemas**: Different artifact types per vertical
- **Subscription Management**: Complete billing and subscription system
- **Customer Portal**: Self-service payment and subscription management
- **Audit logging**: Every API call and data mutation logged
- **Soft deletes**: Trash/restore pattern for all destructive operations

## Development Guidelines

### Feature Development Workflow
**CRITICAL**: Always follow the Feature-API-Docs Triad:

1. **Creating New Features**:
   - ✅ Create the feature UI component
   - ✅ Create corresponding API endpoints (`/api/v1/...`)
   - ✅ Add comprehensive API documentation
   - ✅ Link everything together with proper error handling

2. **Updating Existing Features**:
   - ✅ Update the feature UI
   - ✅ Update corresponding API endpoints
   - ✅ Update API documentation
   - ✅ Maintain backward compatibility where possible

3. **Removing Features**:
   - ✅ Remove feature UI components
   - ✅ Deprecate and remove API endpoints
   - ✅ Remove or mark documentation as deprecated
   - ✅ Handle migration paths for existing data

### File Organization
- **Route Groups**: Use parentheses `()` for logical organization without URL impact
  - `(auth)` - Authentication and protected content
  - `(site)` - Public marketing site
  - `(admin)`, `(shared)`, `(verticals)` - Dashboard organization
  - `(users)` - Customer-facing components
- **Component Architecture**: 
  - `components/shared/` - Cross-industry reusable components
  - `components/[industry]/` - Industry-specific components
  - `components/ui/` - Base UI library (shadcn/ui)
- **Feature-based Organization**: Group related functionality (analytics, money, marketing)
- **Type Safety**: Strict TypeScript with industry-specific schemas
- **API Consistency**: RESTful conventions under `/api/v1/` with proper HTTP methods

### API Development Standards
- **Endpoint Structure**: `/api/v1/[resource]/[id?]/[action?]`
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Response Format**: Consistent JSON with `data`, `error`, `pagination`, `meta` fields
- **Authentication**: Supabase Auth integration with RLS
- **Rate Limiting**: Implemented on all endpoints
- **Input Validation**: Zod schemas for all request bodies
- **Error Handling**: Standardized error responses with helpful messages

### Performance Requirements  
- **Core Web Vitals**: LCP ≤ 1.8s, CLS ≤ 0.1, FID ≤ 100ms
- **Bundle analysis**: Monitor JS payload per route
- **Image optimization**: AVIF/WebP with exact sizing
- **Font optimization**: Max 2 font families, subset loading
- **API Response Times**: < 200ms for simple queries, < 500ms for complex operations

### Security Requirements
- **Supabase RLS everywhere**: No direct table access without policies
- **Input validation**: Zod schemas for all API boundaries  
- **PII protection**: Redaction in logs, short-lived signed URLs
- **CSRF protection**: Built-in with App Router server actions
- **Payment Security**: PCI DSS compliant payment handling

## Critical Patterns to Follow

### Customer Portal Development
- **Self-Service First**: Customers should be able to manage everything themselves
- **Real-Time Updates**: Subscription actions update immediately in UI
- **Payment Security**: All payment data handled securely with proper tokenization
- **Multi-Industry Support**: Portal works across all Thorbis verticals
- **Mobile-First**: Portal is fully responsive and mobile-optimized

### API Development Patterns
- **Consistent Endpoints**: Follow `/api/v1/[resource]` pattern
- **Proper HTTP Status Codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)
- **Pagination**: All list endpoints support pagination with `page`, `limit`, `total`, `has_next`, `has_previous`
- **Filtering**: Support common filters like `organization_id`, `status`, `search`
- **Sorting**: Support `sort_by` and `sort_order` parameters

### Error Handling
- **Graceful degradation**: Always show something, even when APIs fail
- **User-friendly messages**: Abstract technical errors for end users
- **Monitoring integration**: Structured logging for observability
- **API Error Responses**: Include helpful error messages and suggestions

### Data Loading
- **Optimistic UI**: Show immediate feedback for user actions  
- **Stale-while-revalidate**: Show cached data while fetching fresh
- **Progressive enhancement**: Server-first with client enhancements
- **Error boundaries**: Catch and handle React component failures

## Subscription Management System

### Key Features Implemented
- **Flexible Billing Cycles**: Weekly, bi-weekly, monthly, quarterly, semi-annual, annual
- **Trial Periods**: Configurable trial periods with automatic conversion
- **Usage-Based Billing**: Support for tiered and usage-based pricing models
- **Service Management**: Location-based services with scheduling
- **Customer Portal**: Full self-service subscription management
- **Payment Methods**: Multiple payment method support with secure tokenization
- **Contract Terms**: Flexible cancellation policies and auto-renewal settings

### API Endpoints
- `GET|POST /api/v1/subscriptions` - List and create subscriptions
- `GET|PUT|POST /api/v1/subscriptions/[id]` - Manage individual subscriptions
- `GET|POST /api/v1/subscription-plans` - Manage subscription plans
- `GET|PUT|DELETE /api/v1/subscription-plans/[id]` - Individual plan management

### Portal Routes
- `/portal` - Customer dashboard
- `/portal/payments` - Payment method management
- `/portal/subscriptions` - Subscription management

## Performance Optimization Memories
- Follow NextFaster server-first approach with no loading pages
- Use stateful loading states only when necessary
- Implement image prefetching on link hovers
- Optimize API response times and database queries

## Code Architecture Memories
- Maintain consistent component architecture across all routes
- Use shared components from `components/shared/` when possible
- Create new shared components when needed across multiple routes
- Follow TypeScript strict mode for all code

## Design Memories
- Use neutral colors, not grey colors for better contrast
- Maintain dark-first VIP aesthetic with electric blue accents
- Avoid overlays - use inline panels and dedicated pages instead

## Responsiveness Memories
- Ensure all components are fully responsive across all screen sizes
- Test on mobile, tablet, and desktop breakpoints
- Use Tailwind's responsive utilities consistently

## Development Restrictions
- **No demo content**: Never create demo pages, demo routes, test pages, or example features unless explicitly requested
- **Production-focused**: Only build actual production features that serve real business purposes
- **User-driven**: Wait for specific requirements rather than creating placeholder content
- **Feature-API-Docs Synchronization**: Never create features without corresponding APIs and documentation

## Documentation Requirements
- **API Documentation**: Every endpoint must have comprehensive documentation
- **Feature Documentation**: Document user-facing features and workflows
- **Integration Guides**: Provide clear integration examples and patterns
- **Change Logs**: Document all API changes and feature updates

## Dev Operations Memories
- Don't run builds or dev servers unless explicitly requested
- Use proper error handling and logging for all operations
- Maintain database migrations for schema changes
- Keep Supabase integration secure and efficient