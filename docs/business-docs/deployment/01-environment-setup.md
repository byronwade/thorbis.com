# Environment Setup Guide

This comprehensive guide covers the setup and configuration of deployment environments for Thorbis Business OS, including development, staging, and production environments with proper security, scalability, and operational considerations.

## Environment Overview

### Environment Strategy

Thorbis Business OS uses a three-tier environment strategy designed to ensure code quality, security, and reliability through progressive deployment stages.

```mermaid
graph LR
    Dev[Development Environment] --> Staging[Staging Environment]
    Staging --> Prod[Production Environment]
    
    subgraph "Development"
        DevLocal[Local Development]
        DevFeature[Feature Branches]
        DevIntegration[Integration Testing]
    end
    
    subgraph "Staging" 
        StageDeploy[Automated Deployment]
        StageTest[User Acceptance Testing]
        StageValidation[Performance Validation]
    end
    
    subgraph "Production"
        ProdDeploy[Blue-Green Deployment]
        ProdMonitor[Real-time Monitoring]
        ProdScale[Auto-scaling]
    end
```

### Environment Characteristics

#### Development Environment
```typescript
const developmentConfig = {
  purpose: 'Feature development and local testing',
  hosting: 'localhost',
  database: 'local-supabase',
  authentication: 'development-keys',
  monitoring: 'minimal',
  security: {
    ssl: false,
    cors: 'permissive',
    rateLimiting: 'disabled',
    logging: 'debug'
  },
  performance: {
    caching: 'disabled',
    optimization: 'development',
    bundleAnalysis: 'enabled'
  }
}
```

#### Staging Environment
```typescript
const stagingConfig = {
  purpose: 'Integration testing and pre-production validation',
  hosting: 'vercel-preview',
  database: 'supabase-staging',
  authentication: 'staging-keys',
  monitoring: 'comprehensive',
  security: {
    ssl: true,
    cors: 'restricted',
    rateLimiting: 'enabled',
    logging: 'info'
  },
  performance: {
    caching: 'production-like',
    optimization: 'production',
    bundleAnalysis: 'enabled'
  }
}
```

#### Production Environment
```typescript
const productionConfig = {
  purpose: 'Live customer-facing applications',
  hosting: 'vercel-production',
  database: 'supabase-production',
  authentication: 'production-keys',
  monitoring: 'real-time',
  security: {
    ssl: true,
    cors: 'strict',
    rateLimiting: 'strict',
    logging: 'warn'
  },
  performance: {
    caching: 'aggressive',
    optimization: 'maximum',
    bundleAnalysis: 'enabled'
  }
}
```

## Environment Configuration Management

### Configuration Architecture

#### Environment Variable Structure
```bash
# Core Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres

# Industry-Specific Database URLs (Optional)
DATABASE_URL_HS=postgresql://postgres:[PASSWORD]@db.hs.supabase.co:5432/postgres
DATABASE_URL_REST=postgresql://postgres:[PASSWORD]@db.rest.supabase.co:5432/postgres
DATABASE_URL_AUTO=postgresql://postgres:[PASSWORD]@db.auto.supabase.co:5432/postgres
DATABASE_URL_RET=postgresql://postgres:[PASSWORD]@db.ret.supabase.co:5432/postgres

# AI and ML Services
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
VOYAGE_AI_API_KEY=your-voyage-key
GOOGLE_AI_API_KEY=your-google-key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your-live-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email Services
SENDGRID_API_KEY=your-sendgrid-key
RESEND_API_KEY=your-resend-key
POSTMARK_SERVER_TOKEN=your-postmark-token

# SMS Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Authentication and Security
NEXTAUTH_SECRET=your-nextauth-secret-production
NEXTAUTH_URL=https://thorbis.com
JWT_SECRET=your-jwt-secret

# CDN and Storage
NEXT_PUBLIC_CDN_URL=https://cdn.thorbis.com
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=thorbis-production-files

# Monitoring and Analytics
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=thorbis
SENTRY_PROJECT=business-os
DATADOG_API_KEY=your-datadog-key
NEW_RELIC_LICENSE_KEY=your-newrelic-key
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Performance and Caching
REDIS_URL=redis://your-redis-cluster
REDIS_PASSWORD=your-redis-password
MEMCACHED_URL=your-memcached-cluster

# External APIs
MAPS_API_KEY=your-maps-key
WEATHER_API_KEY=your-weather-key
CALENDAR_API_KEY=your-calendar-key

# Feature Flags
FEATURE_FLAG_AI_ENABLED=true
FEATURE_FLAG_BLOCKCHAIN_ENABLED=true
FEATURE_FLAG_ADVANCED_ANALYTICS=true
FEATURE_FLAG_BETA_FEATURES=false

# Rate Limiting and Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://thorbis.com,https://www.thorbis.com
```

### Environment-Specific Configurations

#### Development Environment Variables
```bash
# .env.development
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development

# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Development AI Services (Test Keys)
ANTHROPIC_API_KEY=your-anthropic-dev-key
OPENAI_API_KEY=your-openai-dev-key
VOYAGE_AI_API_KEY=your-voyage-dev-key

# Development Payment Processing (Test Mode)
STRIPE_SECRET_KEY=sk_test_your-test-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-test-key
STRIPE_WEBHOOK_SECRET=whsec_your-test-webhook

# Development Monitoring (Optional)
SENTRY_DSN=your-sentry-dev-dsn

# Development Security (Relaxed)
NEXTAUTH_SECRET=development-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Development Features
FEATURE_FLAG_DEBUG_MODE=true
FEATURE_FLAG_MOCK_APIS=true
```

#### Staging Environment Variables
```bash
# .env.staging
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging

# Staging Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.staging-project.supabase.co:5432/postgres

# Staging AI Services (Limited Budget)
ANTHROPIC_API_KEY=your-anthropic-staging-key
OPENAI_API_KEY=your-openai-staging-key
VOYAGE_AI_API_KEY=your-voyage-staging-key

# Staging Payment Processing (Test Mode)
STRIPE_SECRET_KEY=sk_test_your-test-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-test-key
STRIPE_WEBHOOK_SECRET=whsec_your-test-webhook

# Staging Monitoring
SENTRY_DSN=your-sentry-staging-dsn
DATADOG_API_KEY=your-datadog-staging-key

# Staging Security
NEXTAUTH_SECRET=staging-secret-min-32-chars
NEXTAUTH_URL=https://staging.thorbis.com
CORS_ORIGIN=https://staging.thorbis.com

# Staging Features
FEATURE_FLAG_BETA_FEATURES=true
FEATURE_FLAG_PERFORMANCE_TESTING=true
```

### Secrets Management

#### Vercel Environment Variables
```typescript
// scripts/setup-vercel-env.js
const environments = ['development', 'preview', 'production']

const environmentVariables = {
  // Database secrets
  'NEXT_PUBLIC_SUPABASE_URL': {
    development: process.env.DEV_SUPABASE_URL,
    preview: process.env.STAGING_SUPABASE_URL,
    production: process.env.PROD_SUPABASE_URL
  },
  
  'SUPABASE_SERVICE_ROLE_KEY': {
    development: process.env.DEV_SUPABASE_SERVICE_KEY,
    preview: process.env.STAGING_SUPABASE_SERVICE_KEY,
    production: process.env.PROD_SUPABASE_SERVICE_KEY
  },
  
  // AI API keys
  'ANTHROPIC_API_KEY': {
    development: process.env.DEV_ANTHROPIC_KEY,
    preview: process.env.STAGING_ANTHROPIC_KEY,
    production: process.env.PROD_ANTHROPIC_KEY
  },
  
  // Payment processing
  'STRIPE_SECRET_KEY': {
    development: process.env.DEV_STRIPE_SECRET,
    preview: process.env.STAGING_STRIPE_SECRET,
    production: process.env.PROD_STRIPE_SECRET
  }
}

async function setupVercelEnvironments() {
  for (const [key, values] of Object.entries(environmentVariables)) {
    for (const env of environments) {
      if (values[env]) {
        await exec(`vercel env add ${key} ${values[env]} ${env}`)
        console.log(`✅ Set ${key} for ${env}`)
      }
    }
  }
}

setupVercelEnvironments().catch(console.error)
```

#### GitHub Secrets Setup
```bash
#!/bin/bash
# scripts/setup-github-secrets.sh

# Repository secrets for CI/CD
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"

# Database secrets
gh secret set PROD_SUPABASE_URL --body "$PROD_SUPABASE_URL"
gh secret set PROD_SUPABASE_SERVICE_KEY --body "$PROD_SUPABASE_SERVICE_KEY"
gh secret set STAGING_SUPABASE_URL --body "$STAGING_SUPABASE_URL"
gh secret set STAGING_SUPABASE_SERVICE_KEY --body "$STAGING_SUPABASE_SERVICE_KEY"

# AI service secrets
gh secret set PROD_ANTHROPIC_KEY --body "$PROD_ANTHROPIC_KEY"
gh secret set PROD_OPENAI_KEY --body "$PROD_OPENAI_KEY"
gh secret set PROD_VOYAGE_KEY --body "$PROD_VOYAGE_KEY"

# Payment processing secrets
gh secret set PROD_STRIPE_SECRET --body "$PROD_STRIPE_SECRET"
gh secret set PROD_STRIPE_WEBHOOK_SECRET --body "$PROD_STRIPE_WEBHOOK_SECRET"

# Monitoring secrets
gh secret set SENTRY_DSN --body "$SENTRY_DSN"
gh secret set DATADOG_API_KEY --body "$DATADOG_API_KEY"
gh secret set SLACK_WEBHOOK --body "$SLACK_WEBHOOK"

echo "✅ GitHub secrets configured successfully"
```

## Infrastructure Prerequisites

### Required Services and Accounts

#### Core Platform Services
```yaml
# Platform services configuration
services:
  hosting:
    provider: vercel
    plan: pro  # Required for team collaboration
    features:
      - custom-domains
      - edge-functions
      - analytics
      - deployment-protection
  
  database:
    provider: supabase
    plan: pro  # Required for production workloads
    features:
      - dedicated-compute
      - point-in-time-recovery
      - read-replicas
      - database-webhooks
  
  version_control:
    provider: github
    plan: team  # Required for private repositories
    features:
      - actions-minutes
      - advanced-security
      - code-scanning
      - secret-scanning

  monitoring:
    sentry:
      plan: team
      features: [performance-monitoring, release-tracking]
    datadog:
      plan: pro
      features: [apm, infrastructure-monitoring, log-management]
```

#### Domain and DNS Configuration
```typescript
// DNS configuration for all environments
const dnsConfiguration = {
  production: {
    domain: 'thorbis.com',
    subdomains: [
      'www.thorbis.com',
      'api.thorbis.com',
      'cdn.thorbis.com',
      'status.thorbis.com'
    ],
    records: [
      { type: 'A', name: '@', value: 'vercel-ip-address' },
      { type: 'CNAME', name: 'www', value: 'thorbis.com' },
      { type: 'CNAME', name: 'api', value: 'api-gateway.vercel.app' },
      { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.vercel.com ~all' }
    ]
  },
  
  staging: {
    domain: 'staging.thorbis.com',
    subdomains: [
      'api-staging.thorbis.com',
      'admin-staging.thorbis.com'
    ],
    records: [
      { type: 'CNAME', name: 'staging', value: 'staging-deployment.vercel.app' },
      { type: 'CNAME', name: 'api-staging', value: 'api-staging.vercel.app' }
    ]
  }
}
```

### Network and Security Configuration

#### Security Groups and Access Control
```typescript
// Security configuration by environment
export interface SecurityConfig {
  environment: string
  accessControl: AccessControlConfig
  networking: NetworkConfig
  encryption: EncryptionConfig
  compliance: ComplianceConfig
}

const productionSecurity: SecurityConfig = {
  environment: 'production',
  
  accessControl: {
    authentication: {
      providers: ['supabase-auth', 'oauth-providers'],
      mfa: 'required',
      sessionTimeout: 3600, // 1 hour
      passwordPolicy: {
        minLength: 12,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true
      }
    },
    
    authorization: {
      rbac: 'enabled',
      policies: ['row-level-security', 'api-access-control'],
      roleHierarchy: ['owner', 'manager', 'staff', 'viewer']
    }
  },
  
  networking: {
    https: 'enforced',
    hsts: 'enabled',
    cors: {
      origins: ['https://thorbis.com', 'https://www.thorbis.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    rateLimiting: {
      enabled: true,
      windowMs: 900000, // 15 minutes
      maxRequests: 1000
    }
  },
  
  encryption: {
    dataAtRest: 'AES-256',
    dataInTransit: 'TLS-1.3',
    keyManagement: 'vercel-kms',
    tokenEncryption: 'JWE'
  },
  
  compliance: {
    standards: ['SOC2-Type-II', 'GDPR', 'CCPA'],
    auditing: 'enabled',
    dataRetention: {
      logs: '90-days',
      userData: 'indefinite',
      analytics: '26-months'
    }
  }
}
```

#### Firewall and Network Rules
```bash
#!/bin/bash
# scripts/setup-security-rules.sh

# Configure Vercel security headers
cat > vercel-security-config.json << EOF
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
EOF

# Apply security configuration
vercel --prod --local-config vercel-security-config.json

echo "✅ Security rules configured"
```

## Environment Validation

### Environment Health Checks

#### Automated Validation Script
```typescript
// scripts/validate-environment.ts
interface EnvironmentValidation {
  environment: string
  checks: ValidationCheck[]
  overall: 'pass' | 'fail' | 'warning'
  timestamp: string
}

class EnvironmentValidator {
  private environment: string
  
  constructor(environment: string) {
    this.environment = environment
  }
  
  async validateEnvironment(): Promise<EnvironmentValidation> {
    const checks: ValidationCheck[] = []
    
    // Database connectivity
    checks.push(await this.validateDatabase())
    
    // API endpoints
    checks.push(await this.validateAPIs())
    
    // External services
    checks.push(await this.validateExternalServices())
    
    // Security configuration
    checks.push(await this.validateSecurity())
    
    // Performance thresholds
    checks.push(await this.validatePerformance())
    
    const overall = this.determineOverallStatus(checks)
    
    return {
      environment: this.environment,
      checks,
      overall,
      timestamp: new Date().toISOString()
    }
  }
  
  private async validateDatabase(): Promise<ValidationCheck> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const startTime = Date.now()
      const { data, error } = await supabase.from('businesses').select('count').limit(1)
      const responseTime = Date.now() - startTime
      
      if (error) throw error
      
      return {
        name: 'Database Connectivity',
        status: 'pass',
        details: `Connection successful (${responseTime}ms)`,
        responseTime
      }
    } catch (error) {
      return {
        name: 'Database Connectivity',
        status: 'fail',
        details: `Connection failed: ${error.message}`,
        error: error.message
      }
    }
  }
  
  private async validateAPIs(): Promise<ValidationCheck> {
    const apiEndpoints = [
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/health`,
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/hs/health`,
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/rest/health`,
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/auto/health`,
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/ret/health`
    ]
    
    const results = await Promise.allSettled(
      apiEndpoints.map(async (endpoint) => {
        const startTime = Date.now()
        const response = await fetch(endpoint, { timeout: 10000 })
        const responseTime = Date.now() - startTime
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        return { endpoint, responseTime, status: response.status }
      })
    )
    
    const failures = results.filter(r => r.status === 'rejected')
    
    if (failures.length === 0) {
      return {
        name: 'API Endpoints',
        status: 'pass',
        details: `All ${apiEndpoints.length} endpoints responding`,
        metadata: { endpoints: apiEndpoints.length }
      }
    } else {
      return {
        name: 'API Endpoints',
        status: failures.length < apiEndpoints.length ? 'warning' : 'fail',
        details: `${failures.length}/${apiEndpoints.length} endpoints failed`,
        metadata: { failures: failures.length, total: apiEndpoints.length }
      }
    }
  }
  
  private async validateExternalServices(): Promise<ValidationCheck> {
    const services = [
      { name: 'Anthropic API', check: () => this.checkAnthropicAPI() },
      { name: 'Stripe API', check: () => this.checkStripeAPI() },
      { name: 'SendGrid API', check: () => this.checkSendGridAPI() }
    ]
    
    const results = await Promise.allSettled(
      services.map(service => service.check())
    )
    
    const failures = results.filter(r => r.status === 'rejected')
    
    return {
      name: 'External Services',
      status: failures.length === 0 ? 'pass' : 'warning',
      details: `${services.length - failures.length}/${services.length} services available`,
      metadata: { available: services.length - failures.length, total: services.length }
    }
  }
  
  private async validateSecurity(): Promise<ValidationCheck> {
    const securityChecks = []
    
    // Check SSL certificate
    try {
      const sslInfo = await this.checkSSLCertificate()
      securityChecks.push({ name: 'SSL Certificate', status: 'pass', ...sslInfo })
    } catch (error) {
      securityChecks.push({ 
        name: 'SSL Certificate', 
        status: 'fail', 
        error: error.message 
      })
    }
    
    // Check security headers
    try {
      const headersInfo = await this.checkSecurityHeaders()
      securityChecks.push({ name: 'Security Headers', status: 'pass', ...headersInfo })
    } catch (error) {
      securityChecks.push({ 
        name: 'Security Headers', 
        status: 'fail', 
        error: error.message 
      })
    }
    
    const failures = securityChecks.filter(check => check.status === 'fail')
    
    return {
      name: 'Security Configuration',
      status: failures.length === 0 ? 'pass' : 'fail',
      details: `${securityChecks.length - failures.length}/${securityChecks.length} security checks passed`,
      metadata: { checks: securityChecks }
    }
  }
}

// Usage
const validator = new EnvironmentValidator(process.env.NODE_ENV!)
validator.validateEnvironment()
  .then(results => {
    console.log('Environment validation results:', results)
    process.exit(results.overall === 'fail' ? 1 : 0)
  })
  .catch(error => {
    console.error('Environment validation failed:', error)
    process.exit(1)
  })
```

### Environment Synchronization

#### Configuration Sync Script
```bash
#!/bin/bash
# scripts/sync-environments.sh

set -e

echo "🔄 Synchronizing environment configurations..."

# Validate source environment
if [ -z "$SOURCE_ENV" ] || [ -z "$TARGET_ENV" ]; then
  echo "❌ SOURCE_ENV and TARGET_ENV must be specified"
  echo "Usage: SOURCE_ENV=production TARGET_ENV=staging ./sync-environments.sh"
  exit 1
fi

# Exclude sensitive variables that shouldn't be copied
EXCLUDED_VARS=(
  "STRIPE_SECRET_KEY"
  "ANTHROPIC_API_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "JWT_SECRET"
)

# Get variables from source environment
echo "📥 Fetching variables from $SOURCE_ENV..."
SOURCE_VARS=$(vercel env ls $SOURCE_ENV --json)

# Filter out excluded variables
echo "🔍 Filtering sensitive variables..."
SAFE_VARS=$(echo $SOURCE_VARS | jq --argjson excluded "$(printf '%s\n' "${EXCLUDED_VARS[@]}" | jq -R . | jq -s .)" '
  map(select(.name as $name | $excluded | index($name) | not))
')

# Update target environment
echo "📤 Updating $TARGET_ENV environment..."
echo $SAFE_VARS | jq -r '.[] | "\(.name)=\(.value)"' | while IFS='=' read -r name value; do
  vercel env add "$name" "$value" "$TARGET_ENV" --force
  echo "✅ Updated $name"
done

echo "🎉 Environment synchronization completed!"

# Validate target environment
echo "🔍 Validating target environment..."
npm run validate:environment -- --env=$TARGET_ENV

echo "✅ Environment sync and validation completed successfully"
```

## Troubleshooting

### Common Environment Issues

#### Issue: Missing Environment Variables
```bash
# Diagnostic script for missing environment variables
#!/bin/bash
# scripts/diagnose-env-vars.sh

REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY" 
  "ANTHROPIC_API_KEY"
  "STRIPE_SECRET_KEY"
  "NEXTAUTH_SECRET"
)

echo "🔍 Checking required environment variables..."

missing_vars=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
    echo "❌ Missing: $var"
  else
    echo "✅ Found: $var"
  fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
  echo "🎉 All required environment variables are set!"
else
  echo ""
  echo "❌ Missing environment variables:"
  printf ' - %s\n' "${missing_vars[@]}"
  echo ""
  echo "To fix this issue:"
  echo "1. Add missing variables to your .env file"
  echo "2. Set variables in Vercel dashboard"
  echo "3. Update GitHub repository secrets"
  exit 1
fi
```

#### Issue: Database Connection Problems
```typescript
// Database connection diagnostics
async function diagnoseDatabaseConnection() {
  console.log('🔍 Diagnosing database connection...')
  
  const checks = [
    {
      name: 'Environment Variables',
      check: () => {
        const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
        return required.every(key => process.env[key])
      }
    },
    {
      name: 'URL Accessibility',
      check: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/health`)
        return response.ok
      }
    },
    {
      name: 'Authentication',
      check: async () => {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const { error } = await supabase.from('businesses').select('count').limit(1)
        return !error
      }
    }
  ]
  
  for (const check of checks) {
    try {
      const result = await check.check()
      console.log(`${result ? '✅' : '❌'} ${check.name}`)
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`)
    }
  }
}
```

## Next Steps

After completing environment setup:

1. **[CI/CD Pipeline Configuration](./02-cicd-pipeline.md)**: Set up automated deployment pipelines
2. **[Infrastructure Provisioning](./03-infrastructure-provisioning.md)**: Deploy supporting infrastructure
3. **[Application Deployment](./04-application-deployment.md)**: Deploy applications to configured environments
4. **[Monitoring Setup](./07-monitoring-observability.md)**: Configure comprehensive monitoring

## Environment Resources

### Configuration Templates
- **Environment Templates**: Pre-configured environment variable templates
- **Security Policies**: Environment-specific security configurations
- **Performance Configs**: Environment-appropriate performance settings
- **Monitoring Rules**: Environment-specific monitoring and alerting

### Validation Tools
- **Environment Validator**: Automated environment validation scripts
- **Configuration Checker**: Verify environment configurations
- **Health Monitor**: Continuous environment health monitoring
- **Sync Tools**: Environment synchronization utilities

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Deployment README](./README.md) | Next: [CI/CD Pipeline Configuration](./02-cicd-pipeline.md)*