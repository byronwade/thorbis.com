# Installation Guide

This guide walks through setting up Thorbis Business OS for development, testing, or production deployment.

## System Requirements

### Minimum Requirements
- **Operating System**: Linux, macOS, or Windows 10+
- **Node.js**: Version 18.17.0 or higher
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for development environment
- **Internet**: Broadband connection for package downloads and API access

### Recommended Development Environment
- **Operating System**: macOS or Linux (Ubuntu 22.04+)
- **Node.js**: Version 20.x LTS
- **RAM**: 32GB for optimal performance
- **Storage**: SSD with 50GB+ free space
- **Editor**: VS Code with recommended extensions

### Production Requirements
- **Server**: Linux-based VPS or cloud instance
- **CPU**: 4+ cores for production workloads
- **RAM**: 16GB minimum, 32GB+ recommended
- **Storage**: SSD with 100GB+ available space
- **Database**: PostgreSQL 15+ (managed service recommended)
- **CDN**: Content delivery network for static assets

## Installation Methods

### Method 1: Docker Compose (Recommended)

The fastest way to get started with a complete development environment.

#### Prerequisites
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
docker-compose --version
```

#### Quick Start
```bash
# Clone the repository
git clone https://github.com/thorbisinc/thorbis-business-os.git
cd thorbis-business-os

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# View application logs
docker-compose logs -f app
```

#### Services Included
- **Application server**: Next.js development server on port 3000
- **Database**: PostgreSQL 15 with sample data on port 54321
- **Redis**: Session storage and caching on port 6379
- **Supabase**: Backend services on port 8000
- **AI Services**: Local AI model server on port 8001

### Method 2: Manual Installation

For developers who prefer full control over the installation process.

#### Step 1: Install Dependencies
```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install pnpm (package manager)
npm install -g pnpm

# Install global dependencies
pnpm add -g turbo
```

#### Step 2: Clone and Setup
```bash
# Clone repository
git clone https://github.com/thorbisinc/thorbis-business-os.git
cd thorbis-business-os

# Install dependencies
pnpm install

# Generate environment files
cp .env.example .env.local
cp apps/hs/.env.example apps/hs/.env.local
```

#### Step 3: Database Setup
```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb thorbis_dev

# Install Supabase CLI
npm install -g supabase
supabase start

# Apply migrations
pnpm db:push
pnpm db:seed
```

#### Step 4: Configure Environment
```bash
# Edit .env.local with your configurations
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Configure AI services
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here

# Configure integrations
STRIPE_SECRET_KEY=your_stripe_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
```

#### Step 5: Start Development Server
```bash
# Start all services
pnpm dev

# Or start individual apps
pnpm dev:hs      # Home Services (port 3001)
pnpm dev:rest    # Restaurant (port 3011)
pnpm dev:auto    # Automotive (port 3012)
pnpm dev:ret     # Retail (port 3013)
```

### Method 3: Cloud Deployment

Deploy directly to production-ready cloud platforms.

#### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - ANTHROPIC_API_KEY
# - STRIPE_SECRET_KEY
```

#### Supabase Cloud (Backend)
```bash
# Create new project at supabase.com
# Note your project URL and keys

# Apply database schema
supabase db push --project-ref your-project-ref

# Configure authentication providers
supabase functions deploy --project-ref your-project-ref
```

#### Railway/Render Deployment
```bash
# Connect your GitHub repository
# Configure environment variables
# Deploy with automatic scaling
```

## Configuration

### Environment Variables

#### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
VOYAGE_AI_API_KEY=your_voyage_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

#### Optional Variables
```bash
# Analytics and Monitoring
SENTRY_DSN=your_sentry_dsn
POSTHOG_KEY=your_posthog_key
MIXPANEL_TOKEN=your_mixpanel_token

# Email Services
SENDGRID_API_KEY=your_sendgrid_key
RESEND_API_KEY=your_resend_key

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-west-2
S3_BUCKET_NAME=your_bucket_name
```

### Database Configuration

#### Local Development
```sql
-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create application database
CREATE DATABASE thorbis_dev;

-- Connect to database and create schema
\c thorbis_dev;
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
```

#### Production Setup
```bash
# Use managed database service (recommended)
# - AWS RDS PostgreSQL
# - Google Cloud SQL
# - Azure Database for PostgreSQL
# - Supabase managed database

# Configure connection pooling
# Enable automated backups
# Set up read replicas for scaling
# Configure monitoring and alerts
```

## Verification

### Development Environment
```bash
# Check all services are running
curl http://localhost:3000/health
curl http://localhost:3001/health  # Home Services
curl http://localhost:3011/health  # Restaurant
curl http://localhost:3012/health  # Automotive
curl http://localhost:3013/health  # Retail

# Verify database connection
pnpm db:studio

# Run test suite
pnpm test
pnpm test:e2e

# Check build process
pnpm build
```

### Production Deployment
```bash
# Health checks
curl https://your-domain.com/api/health
curl https://your-domain.com/api/hs/health

# Database connectivity
curl https://your-domain.com/api/db/status

# AI services
curl https://your-domain.com/api/ai/status

# Performance testing
lighthouse https://your-domain.com
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

#### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Restart PostgreSQL
brew services restart postgresql@15

# Check connection string
psql "postgresql://localhost:5432/thorbis_dev"
```

#### Package Installation Issues
```bash
# Clear package cache
pnpm store prune

# Delete node_modules and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### Build Errors
```bash
# Check TypeScript errors
pnpm type-check

# Clear Next.js cache
rm -rf .next

# Rebuild with verbose output
pnpm build --debug
```

### Performance Issues

#### Slow Development Server
```bash
# Enable turbo mode
echo "experimental.turbo = true" >> next.config.js

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=8192" pnpm dev

# Use faster package manager
npm install -g pnpm
```

#### Database Slow Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

## Next Steps

After successful installation:

1. **[First Steps](./03-first-steps.md)**: Set up your first organization
2. **[Industry Selection](./04-industry-selection.md)**: Choose your business vertical
3. **[Configuration Basics](./05-configuration-basics.md)**: Configure system settings
4. **[Sample Data Setup](./06-sample-data-setup.md)**: Load demonstration data

## Additional Resources

### Development Tools
- **VS Code Extensions**: ESLint, Prettier, TypeScript, Tailwind CSS
- **Browser Extensions**: React Developer Tools, Supabase DevTools
- **Database Tools**: pgAdmin, DBeaver, Supabase Studio
- **API Testing**: Insomnia, Postman, Bruno

### Documentation
- **[Development Guide](../development/)**: Detailed development documentation
- **[API Reference](../api/)**: Complete API documentation
- **[Database Schema](../database/)**: Database structure and relationships
- **[Deployment Guide](../deployment/)**: Production deployment strategies

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Platform Overview](./01-platform-overview.md) | Next: [First Steps](./03-first-steps.md)*