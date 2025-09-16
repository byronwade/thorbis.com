# Environment Configuration Documentation

## Overview

This document covers the comprehensive environment configuration system for Thorbis Business OS, including central configuration management, app-specific settings, and security best practices.

## Configuration Files

### 1. Central Environment Configuration

**File**: `.env.local` (root level)  
**Purpose**: Shared configuration across entire monorepo  
**Scope**: All applications and packages  
**Version**: 1.0.0  

### 2. AI App Environment Configuration

**Files**: 
- `apps/ai/.env.example` - Template for AI app configuration
- `apps/ai/.env.local` - Development configuration for AI app

**Purpose**: AI chat application specific settings  
**Port**: 3017  
**URL**: thorbis.com/ai  

## Central Environment Configuration (.env.local)

### Core Application Settings

```env
# Environment & Debugging
NODE_ENV=development
ANALYZE=false
NEXT_DEBUG=false
SKIP_ENV_VALIDATION=false

# Application URLs (Production Routes)
APP_NAME="Thorbis Business OS"
APP_URL=http://localhost:3000
SUPPORT_EMAIL=support@thorbis.com

# Domain Configuration
NEXT_PUBLIC_DOMAIN=thorbis.com
PRODUCTION_URL=https://thorbis.com
```

### Database Configuration (Supabase)

```env
# Primary Supabase Instance
NEXT_PUBLIC_SUPABASE_URL=https://hdiuifrlulzpvasknzqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Storage & File Uploads
NEXT_PUBLIC_SUPABASE_BUCKET_NAME=uploads
SUPABASE_STORAGE_BUCKET=course-content
```

### Authentication & Security

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_change_in_production
JWT_SECRET=your_jwt_secret_change_in_production

# OAuth Provider Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### Payment & Billing (Stripe)

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Communication Services

```env
# Twilio SMS/Voice
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Services
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@thorbis.com
RESEND_API_KEY=your_resend_api_key
```

### AI & Machine Learning Services

```env
# Anthropic Claude
ANTHROPIC_API_KEY=***REMOVED***

# Voyage AI
VOYAGE_API_KEY=pa-zEUayrcTCUAASyJ7KWaqzoeAwHMqIWnP2aZjofAeURj

# OpenAI (if used)
OPENAI_API_KEY=your_openai_api_key
```

### Mapping & Location Services

```env
# Google Services
GOOGLE_PLACES_API_KEY=AIzaSyBdVl-cTICSwYKrZ95SuvNw7dbMuDt1KG0
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id

# Mapbox
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

## App-Specific Configuration Matrix

### Port Allocation Strategy

| App | Port | Production URL | Purpose |
|-----|------|----------------|---------|
| site | 3000 | thorbis.com | Marketing website (root) |
| hs | 3001 | thorbis.com/hs | Home Services admin panel |
| courses | 3007 | thorbis.com/courses | Learning platform |
| payroll | 3008 | thorbis.com/payroll | Payroll processing |
| rest | 3011 | thorbis.com/rest | Restaurant admin panel |
| auto | 3012 | thorbis.com/auto | Auto Services admin panel |
| ret | 3013 | thorbis.com/ret | Retail admin panel |
| investigations | 3015 | thorbis.com/investigations | Investigation management |
| ai | 3017 | thorbis.com/ai | AI Chat Interface |
| lom | 3006 | lom.thorbis.com | Documentation site (subdomain) |

### Configuration Inheritance Pattern

```
Root .env.local (shared)
├── Database connections
├── Authentication providers
├── Payment processing
├── Communication services
├── AI service credentials
└── Mapping services

App-specific .env.local (override/extend)
├── App-specific URLs
├── Port configurations
├── Feature flags
└── App-specific API keys
```

## AI App Configuration

### Environment Template (.env.example)

```env
# Required - Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-your_anthropic_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://thorbis.com/ai
NEXT_PUBLIC_API_BASE_URL=/api
NODE_ENV=production

# Optional - Database and Redis (for advanced features)
DATABASE_URL=postgresql://user:password@localhost:5432/thorbis_ai
REDIS_URL=redis://localhost:6379

# Rate Limiting Configuration
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_TOKENS=50000
DAILY_TOKEN_BUDGET=1000000

# AI Model Configuration
AI_MODEL=claude-3-5-sonnet-20241022
AI_MAX_TOKENS=4096
AI_TEMPERATURE=0.7
AI_STREAMING=true
```

### AI Development Configuration (.env.local)

```env
# AI Chat Specific Configuration
MAX_CONVERSATION_LENGTH=100
MAX_MESSAGE_LENGTH=4000
DEFAULT_AI_MODEL=claude-3-5-sonnet-20241022
ENABLE_MEMORY_EXTRACTION=true
ENABLE_TOOL_EXECUTION=true

# Tool Execution Settings
MAX_TOOLS_PER_MESSAGE=5
TOOL_EXECUTION_TIMEOUT=30000
ENABLE_BUSINESS_TOOLS=true

# Performance Settings
STREAMING_RESPONSE=true
ENABLE_CACHING=true
CACHE_TTL=300
```

## Security Architecture

### Environment Variable Security Model

```env
# =============================================================================
# SECURITY NOTES
# =============================================================================
#
# IMPORTANT: This file contains sensitive information including API keys,
# database credentials, and service tokens. Follow these security practices:
#
# 1. NEVER commit this file to version control in production
# 2. Use strong, unique values for all secrets in production
# 3. Rotate keys regularly (quarterly recommended)
# 4. Use environment-specific values (dev/staging/prod)
# 5. Restrict file permissions: chmod 600 .env.local
# 6. Use a secrets management service for production deployments
# 7. Audit access to this file regularly
```

### Production Deployment Checklist

```env
# =============================================================================
# PRODUCTION DEPLOYMENT CHECKLIST
# =============================================================================
#
# Before deploying to production, ensure:
# □ All placeholder values replaced with actual credentials
# □ JWT_SECRET and NEXTAUTH_SECRET are strong random values
# □ Database URLs point to production instances
# □ API keys are production-ready and properly scoped
# □ All OAuth redirects configured for production domains
# □ Rate limits appropriate for expected production load
# □ Monitoring and logging configured for production environment
# □ Backup and disaster recovery procedures tested
```

### File System Security

```bash
# Recommended file permissions
chmod 600 .env.local
chmod 600 apps/*/env.local

# Directory permissions
chmod 755 apps/
chmod 755 packages/
```

## Configuration Management Strategy

### Environment Inheritance

1. **Root Level**: Shared configurations in `.env.local`
2. **App Level**: App-specific overrides in `apps/[app]/.env.local`
3. **Runtime**: Environment variable precedence follows Node.js standards

### Variable Naming Convention

```env
# Naming patterns
NEXT_PUBLIC_*        # Client-side accessible variables
*_API_KEY           # Service API keys
*_SECRET            # Authentication secrets
*_URL               # Service endpoints
*_CONFIG_*          # Configuration objects
```

### Configuration Validation

```typescript
// Environment validation pattern
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  ANTHROPIC_API_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  // ... other validations
});

export const env = envSchema.parse(process.env);
```

## Performance Optimizations

### Environment Loading Strategy

- **Build-time**: Static environment variables bundled
- **Runtime**: Server-side environment variables loaded
- **Client-side**: Only NEXT_PUBLIC_* variables exposed

### Caching Strategy

```env
# Performance Monitoring
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_SERVICE_URL=your_log_service_url

# Caching Configuration
CACHE_TTL=300
ENABLE_CACHING=true
```

### Rate Limiting Configuration

```env
# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# AI-Specific Rate Limits
AI_RATE_LIMIT_MAX=50
AI_RATE_LIMIT_WINDOW_MS=300000
MAX_CONCURRENT_CONVERSATIONS=10
```

## Integration Points

### Supabase Integration

```env
# Database Connection
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key]

# Row Level Security
# - Automatic tenant isolation
# - User-based access control
# - Industry-specific data separation
```

### Authentication Integration

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[random_secret]

# OAuth Providers
GOOGLE_CLIENT_ID=[google_oauth_id]
GITHUB_CLIENT_ID=[github_oauth_id]
LINKEDIN_CLIENT_ID=[linkedin_oauth_id]
```

### Payment Processing

```env
# Stripe Integration
STRIPE_SECRET_KEY=sk_test_[test_key]
STRIPE_PUBLISHABLE_KEY=pk_test_[test_key]
STRIPE_WEBHOOK_SECRET=whsec_[webhook_secret]

# Billing Configuration
DEFAULT_TAX_RATE=0.0825
```

## Development Workflow

### Local Development Setup

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Update with development values
# Edit .env.local with appropriate development keys

# 3. Start development server
pnpm dev:hs  # or any specific app

# 4. Validate environment
pnpm build   # Will fail if required variables missing
```

### Environment Validation

```bash
# Environment validation during build
SKIP_ENV_VALIDATION=false pnpm build

# Skip validation for quick builds (not recommended)
SKIP_ENV_VALIDATION=true pnpm build
```

## Troubleshooting

### Common Issues

#### Missing Environment Variables
```
Error: Environment variable ANTHROPIC_API_KEY is required
```
**Solution**: Add missing variable to appropriate .env.local file

#### OAuth Redirect Mismatches
```
Error: OAuth redirect URI mismatch
```
**Solution**: Update OAuth provider settings to match NEXTAUTH_URL

#### Database Connection Issues
```
Error: Database connection failed
```
**Solution**: Verify SUPABASE_URL and keys are correct and active

### Debug Configuration

```env
# Development debugging
NODE_ENV=development
NEXT_DEBUG=true
LOG_LEVEL=debug

# AI App debugging
ENABLE_DEBUG_TOOLS=true
SHOW_AI_REASONING=true
LOG_TOOL_EXECUTION=true
```

## Monitoring & Observability

### Logging Configuration

```env
# Logging levels: error, warn, info, debug
LOG_LEVEL=info
ENABLE_AUDIT_LOG=true
ENABLE_PERFORMANCE_LOGGING=true
```

### Performance Monitoring

```env
# AI Performance Tracking
ENABLE_AI_MONITORING=true
MAX_CONCURRENT_CONVERSATIONS=10

# Rate Limiting Monitoring
ENABLE_RATE_LIMITING=true
```

## Related Documentation

- [NextFaster Optimizations](./NEXTFASTER-OPTIMIZATIONS-SCRIPT.md)
- [GitHub Workflows](./GITHUB-WORKFLOWS.md)
- [Bundle Analysis](./BUNDLE-ANALYSIS-SCRIPT.md)
- Supabase configuration documentation
- NextAuth.js configuration guide

## Future Enhancements

### Planned Features
- **Centralized secrets management**: Integration with services like HashiCorp Vault
- **Environment-specific configs**: Automated environment switching
- **Configuration validation**: Enhanced schema validation
- **Dynamic configuration**: Runtime configuration updates

### Security Improvements
- **Key rotation automation**: Automated credential rotation
- **Audit logging**: Comprehensive access logging
- **Encryption at rest**: Environment variable encryption
- **Zero-trust configuration**: Enhanced security model

This environment configuration system provides comprehensive, secure, and scalable configuration management for the entire Thorbis Business OS monorepo while maintaining security best practices and development workflow efficiency.