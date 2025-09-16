# Local Development Setup Guide

This guide provides comprehensive instructions for setting up a local development environment for Thorbis Business OS, including all required tools, services, and configurations.

## Prerequisites

### System Requirements

#### Minimum Requirements
- **Operating System**: macOS 12+, Ubuntu 20.04+, or Windows 10+ with WSL2
- **CPU**: 4+ cores (Intel i5/AMD Ryzen 5 or better)
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 50GB free SSD space
- **Internet**: Stable broadband connection for package downloads

#### Recommended Development Machine
- **Operating System**: macOS 13+ or Ubuntu 22.04+
- **CPU**: 8+ cores (Apple M2/Intel i7/AMD Ryzen 7 or better)
- **RAM**: 32GB+ for optimal performance
- **Storage**: 100GB+ free NVMe SSD space
- **Internet**: High-speed connection (100+ Mbps)

### Required Software

#### Core Development Tools
```bash
# Node.js (using Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# npm (Node.js package manager)
npm --version  # Should be 8.0+

# Git (version control)
git --version  # Should be 2.30+

# Docker & Docker Compose (containerization)
# Install from docker.com or use package manager
docker --version
docker-compose --version
```

#### Development Environment Tools
```bash
# Supabase CLI (backend services)
npm install -g supabase

# TypeScript (global installation for tools)
npm install -g typescript

# Playwright (E2E testing)
npm install -g @playwright/test
```

#### Recommended Code Editor
**Visual Studio Code** with essential extensions:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss", 
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "supabase.supabase-vscode",
    "antfu.iconify",
    "ms-vscode.vscode-json",
    "GitHub.copilot"
  ]
}
```

## Repository Setup

### Clone and Initialize

#### 1. Clone Repository
```bash
# Clone the main repository
git clone https://github.com/thorbisinc/thorbis-business-os.git
cd thorbis-business-os

# Verify repository structure
ls -la
# Should see: src/, docs/, migrations/, supabase/, package.json
```

#### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Verify installation
npm --version
node --version
npm list -g --depth=0
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# The single application uses route-based separation
# All environment variables are configured in the root .env.local file
```

### Environment Variables Configuration

#### Global Environment (.env.local)
```bash
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# AI Services (for development/testing)
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
VOYAGE_AI_API_KEY=your_voyage_key_here

# Payment Processing (Stripe test keys)
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Services (development)
SENDGRID_API_KEY=your_sendgrid_key
RESEND_API_KEY=your_resend_key

# Security
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
NEXTAUTH_URL=http://localhost:3000

# Development Flags
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
```

#### Route-Based Configuration
The single application serves different industries through routes:

```bash
# Industry routing configuration (in .env.local)
NEXT_PUBLIC_HS_ENABLED=true         # Enable /hs routes
NEXT_PUBLIC_REST_ENABLED=true       # Enable /rest routes  
NEXT_PUBLIC_AUTO_ENABLED=true       # Enable /auto routes
NEXT_PUBLIC_RET_ENABLED=true        # Enable /ret routes
NEXT_PUBLIC_COURSES_ENABLED=true    # Enable /courses routes
NEXT_PUBLIC_PAYROLL_ENABLED=true    # Enable /payroll routes
```

## Database Setup

### Local Supabase Setup

#### 1. Initialize Supabase
```bash
# Initialize Supabase in the project
supabase init

# Start local Supabase services
supabase start

# This will start:
# - PostgreSQL database (port 54322)
# - Supabase Studio (port 54323) 
# - API Gateway (port 54321)
# - Auth service
# - Storage service
# - Edge Functions runtime
```

#### 2. Database Configuration
```bash
# Check services are running
supabase status

# Expected output:
# supabase local development setup is running.
# 
#          API URL: http://localhost:54321
#      GraphQL URL: http://localhost:54321/graphql/v1
#           DB URL: postgresql://postgres:postgres@localhost:54322/postgres
#       Studio URL: http://localhost:54323
#     Inbucket URL: http://localhost:54324
#       JWT secret: your-jwt-secret
#        anon key: your-anon-key
# service_role key: your-service-role-key
```

#### 3. Database Schema Setup
```bash
# Generate types from existing database
npm run db:generate

# Push current schema to local database
npm run db:push

# Or apply migrations manually
supabase db push

# Reset database (if needed)
supabase db reset
```

#### 4. Seed Development Data
```bash
# Seed with sample data for testing
npm run db:seed

# Verify data was loaded
npm run db:studio
# Opens Supabase Studio at http://localhost:54323
```

### Database Schema Overview
```sql
-- Core multi-tenant structure
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;

-- Essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- Row Level Security enabled on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
-- ... all business tables have RLS
```

## Development Services

### Start Local Services

#### 1. Database and Backend Services
```bash
# Start Supabase (if not already running)
supabase start

# Start Redis (for caching and sessions)
docker run -d --name redis-local -p 6379:6379 redis:alpine

# Verify services
curl http://localhost:54321/health
redis-cli ping  # Should return PONG
```

#### 2. Development Server
```bash
# Start the single application in development mode
npm run dev

# This starts the unified application on http://localhost:3000
# All industry routes are accessible:
# - Home Services: http://localhost:3000/hs
# - Restaurant: http://localhost:3000/rest  
# - Auto Services: http://localhost:3000/auto
# - Retail: http://localhost:3000/ret
# - Courses: http://localhost:3000/courses
# - Payroll: http://localhost:3000/payroll
# - Portal: http://localhost:3000/portal
```

#### 3. Route-Specific Development
```bash
# All routes are accessible through the single application
# Navigate to specific routes for focused development:
# http://localhost:3000/hs      # Home Services
# http://localhost:3000/rest    # Restaurant
# http://localhost:3000/auto    # Auto Services
# http://localhost:3000/ret     # Retail
# http://localhost:3000/courses # Learning platform
# http://localhost:3000/payroll # Payroll management

# Environment-specific development
NODE_ENV=development npm run dev

# With debug logging
DEBUG=true npm run dev
```

### Service Health Checks
```bash
# Check the application and all routes are responding
curl -f http://localhost:3000/health     # Main application
curl -f http://localhost:3000/api/health # API health endpoint
curl -f http://localhost:54321/health    # Supabase API

# Check specific route accessibility
curl -f http://localhost:3000/hs         # Home Services route
curl -f http://localhost:3000/rest       # Restaurant route
curl -f http://localhost:3000/auto       # Auto Services route
curl -f http://localhost:3000/ret        # Retail route

# Check database connectivity
psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "SELECT version();"
```

## Development Workflow

### Daily Development Routine

#### 1. Morning Startup
```bash
# Navigate to project directory
cd ~/thorbis-business-os

# Update codebase
git pull origin main

# Install any new dependencies
npm install

# Start services if not running
supabase start
npm run dev

# Check service status
npm run health-check  # Custom script to verify all services
```

#### 2. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-customer-portal

# Start development server
npm run dev

# Navigate to specific route for development
# http://localhost:3000/hs for Home Services features

# Run tests in watch mode
npm run test:watch

# Type checking in watch mode
npm run type-check:watch
```

#### 3. Code Quality Checks
```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Run all checks
npm run quality-check
```

### Testing Setup

#### 1. Unit Testing with Vitest
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test src/components/CustomerForm.test.tsx
```

#### 2. Integration Testing
```bash
# Run API integration tests
npm run test:integration

# Test database operations
npm run test:db

# Test authentication flows
npm run test:auth
```

#### 3. End-to-End Testing with Playwright
```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run specific test suite
npm run test:e2e --grep "customer management"
```

### Development Scripts

#### Available npm Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "db:generate": "supabase gen types typescript",
    "db:push": "supabase db push",
    "db:seed": "tsx migrations/seed.ts",
    "db:reset": "supabase db reset",
    "db:studio": "supabase studio"
  }
}
```

#### Custom Development Scripts
```bash
# Check application health
npm run health-check

# Reset entire development environment
npm run reset-dev

# Generate TypeScript types from database
npm run db:generate

# Backup local development data
npm run db:backup --name "feature-branch-backup"

# Restore development data
npm run db:restore --name "feature-branch-backup"
```

## Debugging and Development Tools

### Browser Developer Tools

#### Chrome DevTools Extensions
```bash
# Install useful Chrome extensions for development:
# - React Developer Tools
# - Supabase DevTools  
# - TailwindCSS DevTools
# - Redux DevTools (if using)
# - Apollo Client DevTools (if using GraphQL)
```

#### Network and Performance Debugging
```javascript
// Performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Web Vitals monitoring
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log)
    getFID(console.log)
    getFCP(console.log)
    getLCP(console.log)
    getTTFB(console.log)
  })
}
```

### Database Development Tools

#### Supabase Studio
```bash
# Access Supabase Studio (web-based database management)
open http://localhost:54323

# Features available:
# - Table editor with RLS policy management
# - SQL editor with query execution
# - API documentation and testing
# - Authentication user management
# - Storage file management
# - Real-time subscription testing
```

#### Database CLI Tools
```bash
# Connect to local database
psql "postgresql://postgres:postgres@localhost:54322/postgres"

# Useful database commands
\dt          # List tables
\d customers # Describe customers table
\du          # List users
\l           # List databases

# Export database schema
pg_dump --schema-only "postgresql://postgres:postgres@localhost:54322/postgres" > schema.sql

# Export sample data
pg_dump --data-only "postgresql://postgres:postgres@localhost:54322/postgres" > data.sql
```

### API Development Tools

#### API Testing
```bash
# Using curl for API testing
curl -X GET "http://localhost:3000/api/v1/hs/customers" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"

# Using httpie (if installed)
http GET localhost:3000/api/v1/hs/customers Authorization:"Bearer $SUPABASE_ANON_KEY"
```

#### API Documentation
```bash
# Generate OpenAPI specs
npm run api:docs

# Start API documentation server
npm run api:docs:serve
# Available at http://localhost:8080
```

## Troubleshooting Common Issues

### Port Conflicts
```bash
# Check what's using specific ports
lsof -i :3000  # Check application port
lsof -i :54321 # Check Supabase API port

# Kill process using port
kill -9 $(lsof -t -i:3000)

# Use alternative ports
PORT=3001 npm run dev
```

### Database Connection Issues
```bash
# Check Supabase status
supabase status

# Restart Supabase services
supabase stop
supabase start

# Check PostgreSQL is accessible
pg_isready -h localhost -p 54322

# Reset database if corrupted
supabase db reset --linked=false
```

### Node.js and Package Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Check Node.js version
node --version  # Should be 20.0.0+

# Switch Node.js versions
nvm use 20
```

### Build and Compilation Issues
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild everything
npm run build

# Check TypeScript errors
npm run type-check
```

### Environment Variable Issues
```bash
# Verify environment variables are loaded
npm run dev 2>&1 | grep "Environment"

# Check specific variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $ANTHROPIC_API_KEY

# Reload environment in new terminal
source ~/.bashrc  # or ~/.zshrc
```

## Performance Optimization for Development

### Development Build Optimization
```javascript
// next.config.js - Development optimizations
const nextConfig = {
  // Faster builds in development
  swcMinify: true,
  
  // Optimize bundle analyzer in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Faster development builds
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            chunks: 'all',
            test: /node_modules/,
            name: 'vendors',
          },
        },
      }
    }
    return config
  },
}
```

### Database Performance in Development
```sql
-- Optimize PostgreSQL for development
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
SELECT pg_reload_conf();

-- Monitor slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Development vs Production Differences
```bash
# Development features enabled:
# - Hot module replacement (HMR)
# - Detailed error messages
# - Source maps
# - Debugging tools
# - Relaxed security policies
# - Sample data and test accounts

# Disabled in development:
# - Minification
# - Bundle optimization  
# - Service worker caching
# - Analytics tracking
# - Error reporting to external services
```

## Next Steps

After completing local development setup:

1. **[Architecture Overview](./02-architecture-overview.md)**: Understanding system design patterns
2. **[API Development](./03-api-development.md)**: Building RESTful APIs with industry namespaces
3. **[Frontend Development](./04-frontend-development.md)**: Creating UIs with Next.js and Odixe design system
4. **[Database Development](./05-database-development.md)**: Working with PostgreSQL and RLS policies

## Development Support

### Getting Help
- **Internal Slack**: #dev-help channel for immediate assistance
- **GitHub Issues**: Report bugs and request features
- **Development Wiki**: Internal knowledge base and troubleshooting
- **Code Review**: Get guidance through pull request reviews

### Additional Resources
- **Development Best Practices**: Internal coding standards document
- **Architecture Decision Records**: Historical design decisions
- **Performance Monitoring**: Internal dashboards and metrics
- **Security Guidelines**: Secure coding practices and reviews

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Development README](./README.md) | Next: [Architecture Overview](./02-architecture-overview.md)*