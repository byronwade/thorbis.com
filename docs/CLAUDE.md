# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Last Updated**: 2025-01-31  
> **Version**: 3.0.0  
> **Status**: Production Ready

## Common Development Commands

### Single Next.js Application Architecture
This is a **single Next.js 15 application** using **App Router** with **TypeScript** and **Tailwind CSS**.

**Important**: This is NOT a monorepo. It's a unified application that serves different industry verticals through route-based separation:
- `thorbis.com/hs` - Home Services admin panel
- `thorbis.com/rest` - Restaurant admin panel  
- `thorbis.com/auto` - Auto Services admin panel
- `thorbis.com/ret` - Retail admin panel
- `thorbis.com/courses` - Learning platform admin panel
- `thorbis.com/payroll` - Payroll admin panel
- `thorbis.com/portal` - Customer portal for payments and subscriptions
- `thorbis.com` - Main marketing website and application home

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

### Core Philosophy: "Dark-First, Overlay-Free, Industry-Separated, AI-Governed, Blockchain-Verified"
- **Dark-first UI**: VIP black/white with electric blue accents (#1C8BFF)
- **No overlays**: No dialogs, modals, or popovers - use inline panels, dedicated pages, and tooltips only
- **Per-industry apps**: Separate applications for Home Services (`/hs/`), Restaurants (`/rest/`), Auto (`/auto/`), and Retail (`/ret/`)
- **NextFaster performance**: Sub-300ms navigation, 170KB JS budget, aggressive caching
- **Proof over opinions**: Artifact-anchored trust signals, not star ratings
- **AI-First Operations**: Every system operation monitored, governed, and optimized by AI agents
- **Blockchain Transparency**: All critical operations cryptographically verified and immutably recorded

### Application Structure
```
src/
├── app/                     # Next.js App Router
│   ├── (site)/             # Main marketing site routes
│   ├── api/                # API routes (/api/v1/*)
│   │   └── v1/            # Versioned API endpoints
│   │       ├── subscriptions/      # Subscription management APIs
│   │       ├── subscription-plans/ # Plan management APIs  
│   │       ├── payments/           # Payment processing APIs
│   │       └── customers/          # Customer management APIs
│   ├── portal/             # Customer self-service portal
│   │   ├── payments/       # Payment management for customers
│   │   └── subscriptions/  # Subscription management for customers
│   ├── hs/                 # Home Services admin routes
│   ├── rest/               # Restaurant admin routes
│   ├── auto/               # Auto Services admin routes
│   ├── ret/                # Retail admin routes
│   ├── courses/            # Learning platform routes
│   └── payroll/            # Payroll admin routes
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (shadcn/ui)
│   ├── shared/            # Shared business components
│   └── [industry]/        # Industry-specific components
├── lib/                   # Utilities and configurations
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions

docs/                      # API and feature documentation
migrations/               # Database migrations
supabase/                # Supabase configuration and seeds
```

### Database Architecture (Supabase)
- **Multi-tenant by default**: All tables include tenant isolation
- **Row Level Security (RLS)** on everything - no exceptions
- **Industry-separated schemas**: Different artifact types per vertical
- **Audit logging**: Every AI tool call and data mutation logged
- **Soft deletes**: Trash/restore pattern for all destructive operations
- **AI-Monitored Operations**: All database operations supervised by AI governance layer
- **Blockchain Audit Trail**: Every database transaction cryptographically signed and recorded

## Development Guidelines

### File Organization
- **Route-based separation**: Different routes for different verticals within same app
- **Component reuse**: Shared components in `components/shared/`
- **Industry-specific components**: In `components/[industry]/`
- **Type safety**: Strict TypeScript, industry-specific schemas
- **API consistency**: All endpoints follow RESTful conventions with proper HTTP methods

### Performance Requirements  
- **Core Web Vitals**: LCP ≤ 1.8s, CLS ≤ 0.1, FID ≤ 100ms
- **Bundle analysis**: Monitor JS payload per route
- **Image optimization**: AVIF/WebP with exact sizing
- **Font optimization**: Max 2 font families, subset loading

### Security Requirements
- **Supabase RLS everywhere**: No direct table access without policies
- **Input validation**: Zod schemas for all API boundaries  
- **PII protection**: Redaction in logs, short-lived signed URLs
- **CSRF protection**: Built-in with App Router server actions

## Critical Patterns to Follow

### Error Handling
- **Graceful degradation**: Always show something, even when APIs fail
- **User-friendly messages**: Abstract technical errors for end users
- **Monitoring integration**: Structured logging for observability
- **Offline support**: Service worker with background sync

### Data Loading
- **Optimistic UI**: Show immediate feedback for user actions  
- **Stale-while-revalidate**: Show cached data while fetching fresh
- **Progressive enhancement**: Server-first with client enhancements
- **Error boundaries**: Catch and handle React component failures

### Security Considerations
- **Principle of least privilege**: Minimum necessary permissions
- **Input sanitization**: Prevent injection attacks
- **Rate limiting**: Prevent abuse and DoS attacks  
- **Secrets management**: No hardcoded keys, use environment variables

## Performance Optimization Memories
- Make sure to always follow nextfaster server first approach no loading pages and only stateful loading, with image prefetching on link hovers

## Code Architecture Memories
- Make sure all apps use the same header
- Make sure we're using the shared components and if one doesn't exist for what we need then we create a new shared component that we can use in all apps

## Design Memories
- Make sure all pages use neutral colors not grey colors

## Responsiveness Memories
- Make sure everythign we make is always fully responsive on any screen

## Development Restrictions
- **No demo content**: Never create demo pages, demo routes, test pages, or example features unless explicitly requested by the user
- **Production-focused**: Only build actual production features that serve real business purposes
- **User-driven**: Wait for specific requirements rather than creating placeholder or demonstration content

## Dev Operations Memories
- Dont run builds or dev unless i tell you too