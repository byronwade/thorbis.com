# Thorbis Security Baseline

Comprehensive security implementation for Thorbis Business OS with enterprise-grade protection across all system components.

## 📋 Security Components

### 🔐 Secrets Rotation & Token Management
- **File**: `secrets-rotation.md`
- **Coverage**: Automated token lifecycle management with 15-minute access tokens, 30-day refresh tokens, 90-day API keys
- **Features**: RS256 JWT signing, signed action links, emergency revocation, automated key rotation
- **Compliance**: SOX, PCI-DSS, security best practices

### 🌐 Single Sign-On (SSO) Integration
- **File**: `sso.md`
- **Coverage**: OAuth 2.0/OpenID Connect, SAML 2.0, multi-provider support
- **Features**: Advanced role mapping, JIT provisioning, single logout, account linking
- **Providers**: Google, Microsoft Azure AD, Okta, Auth0, AWS Cognito, generic IdPs

### 🎭 PII Redaction System
- **File**: `pii-redaction.md`
- **Coverage**: AI prompts, application logs, webhooks, data exports
- **Features**: Context-aware redaction, compliance-driven rules, business term preservation
- **Compliance**: GDPR, CCPA, HIPAA, PCI-DSS with automated detection patterns

### 🛡️ Abuse Prevention System
- **File**: `abuse.md`
- **Coverage**: Multi-tier rate limiting, WAF protection, anomaly detection, automated response
- **Features**: Token bucket algorithms, behavioral profiling, impossible travel detection
- **Response**: Gradual throttling to emergency account lockout with clear 429 responses

### 📦 Data Retention Management
- **File**: `data-retention.md`
- **Coverage**: Per-table lifecycle policies, automated purging, legal hold management
- **Features**: Multi-tier archival (hot/warm/cold/glacier), compliance alignment, audit trails
- **Retention**: 90 days (temporary) to 10 years (legal documents) with automated enforcement

## 🎯 Key Features

### Enterprise Security Standards
```yaml
authentication:
  - Multi-factor authentication support
  - SSO integration (OAuth 2.0, SAML 2.0)
  - Advanced role mapping and provisioning
  - Session management with secure tokens

authorization:
  - Role-based access control (RBAC)
  - Tenant-isolated permissions
  - API key management with scoped access
  - Signed action links for temporary access

data_protection:
  - Comprehensive PII redaction
  - Context-aware data sanitization
  - Encrypted data at rest and in transit
  - Automated data lifecycle management

threat_protection:
  - Multi-tier rate limiting
  - Web Application Firewall (WAF)
  - Behavioral anomaly detection
  - Automated incident response

compliance:
  - GDPR, CCPA, HIPAA, PCI-DSS alignment
  - Audit trail for all security events
  - Legal hold and data retention policies
  - Automated compliance reporting
```

### Multi-Tier Rate Limiting
```yaml
global_protection:
  max_requests: 10000/minute
  burst_allowance: 2000
  
ip_based:
  standard_ip: 100/minute (burst: 20)
  suspicious_ip: 10/minute (burst: 2)
  
user_based:
  free_tier: 50/minute, 1000/hour, 5000/day
  pro_tier: 200/minute, 5000/hour, 25000/day
  enterprise: 1000/minute, 25000/hour, 100000/day
  
endpoint_specific:
  ai_tools: 30/minute (burst: 5)
  file_uploads: 10/minute
  auth_endpoints: 10/minute
  exports: 2/minute
```

### PII Redaction Coverage
```yaml
detection_patterns:
  - Social Security Numbers (SSN)
  - Email addresses and phone numbers
  - Credit card and bank account numbers
  - IP addresses and GPS coordinates
  - Personal names and addresses
  - API keys and authentication tokens

redaction_contexts:
  - AI prompts and responses
  - Application and error logs
  - Webhook payloads and headers
  - Data export files (CSV/JSON)
  - Third-party integrations

compliance_levels:
  basic: Common PII patterns
  standard: Extended PII + financial data
  strict: Maximum redaction with names/addresses
  paranoid: Aggressive redaction including business data
```

### Data Retention Policies
```yaml
business_critical: # 7+ years
  - invoices, payments, contracts
  - compliance: SOX, Tax Law, GAAP
  
operational: # 3 years  
  - jobs, estimates, schedules
  - compliance: Business Operations
  
user_generated: # 5 years or deletion request
  - users, customers, preferences
  - compliance: GDPR, CCPA
  
system_logs: # 1 year (3 years for security)
  - application, audit, security events
  - compliance: Security, Incident Response
  
temporary: # 90 days
  - sessions, cache, temporary files
  - compliance: Performance optimization
  
analytics: # 2 years
  - usage metrics, feature analytics
  - compliance: Business Intelligence
```

## 🚀 Implementation Guide

### Prerequisites
```bash
# Install dependencies
npm install jsonwebtoken bcrypt redis aws-sdk

# Environment variables
export THORBIS_JWT_SECRET="your-jwt-secret"
export THORBIS_ENCRYPTION_KEY="your-encryption-key"
export REDIS_URL="redis://localhost:6379"
export AWS_S3_BUCKET="thorbis-archives"
```

### Database Setup
```sql
-- Create security-related tables
CREATE TABLE feature_flags (...);
CREATE TABLE legal_holds (...);
CREATE TABLE audit_logs (...);
CREATE TABLE rate_limit_entries (...);
CREATE TABLE security_events (...);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
```

### Service Integration
```typescript
// Initialize security services
const tokenManager = new TokenManager(privateKey, publicKey, encryptionKey, redis)
const rateLimiter = new MultiTierRateLimiter(rateLimitConfigs)
const piiRedactor = new PromptRedactionService(piiDetector, contextAnalyzer, auditLogger)
const purgeEngine = new DataPurgeEngine(database, archivalService, auditLogger)

// Middleware integration
app.use(rateLimiter.middleware())
app.use(piiRedactor.middleware())
app.use(tokenManager.authMiddleware())
```

### WAF Rule Examples
```javascript
// SQL Injection Protection
{
  pattern: /(\bunion\b.{0,100}\bselect\b|\bselect\b.{0,100}\bunion\b)/gi,
  action: 'block',
  severity: 'high'
}

// XSS Protection  
{
  pattern: /<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gis,
  action: 'block', 
  severity: 'high'
}

// Command Injection
{
  pattern: /\b(cat|ls|ps|whoami|wget|curl|nc)\b/gi,
  action: 'block',
  severity: 'high'
}
```

## 🧪 Testing & Validation

### Run Security Validation
```bash
# Validate all security components
node validate-security.js

# Expected output:
# 🔒 Validating Thorbis Security Baseline
# ✅ Secrets rotation system valid
# ✅ SSO integration valid  
# ✅ PII redaction system valid
# ✅ Abuse prevention system valid
# ✅ Data retention system valid
# ✅ Security Tests: 4/4 passed
# 🎉 Security baseline validation successful!
```

### Test Rate Limiting
```javascript
// Test rate limit enforcement
const responses = []
for (let i = 0; i < 150; i++) {
  const response = await fetch('/api/test', {
    headers: { 'Authorization': 'Bearer test-token' }
  })
  responses.push(response)
  if (response.status === 429) break
}

// Verify 429 response includes proper headers
expect(response.status).toBe(429)
expect(response.headers['retry-after']).toBeDefined()
expect(response.headers['x-ratelimit-limit']).toBeDefined()
```

### Test PII Redaction
```javascript
const testCases = [
  {
    input: 'Contact john.doe@example.com for payment',
    expected: 'Contact [EMAIL-REDACTED] for payment'
  },
  {
    input: 'Call us at (555) 123-4567',
    expected: 'Call us at [PHONE-REDACTED]'
  },
  {
    input: 'SSN: 123-45-6789',
    expected: 'SSN: [SSN-REDACTED]'
  }
]

for (const test of testCases) {
  const result = await piiRedactor.redactPrompt(test.input)
  expect(result.redacted_prompt).toBe(test.expected)
}
```

## 📊 Monitoring & Alerting

### Security Metrics
- **Rate Limiting**: Request rates, blocked requests, 429 responses
- **Authentication**: Login success/failure rates, token validation failures
- **PII Redaction**: Redaction rates, pattern matches, compliance coverage
- **Data Retention**: Purge job success, retention violations, storage metrics
- **Anomaly Detection**: Behavioral deviations, geographic anomalies, usage patterns

### Alert Thresholds
```yaml
critical_alerts:
  - Multiple 429 responses (>1000/hour)
  - Authentication failures (>100/hour) 
  - PII detection in logs (any occurrence)
  - Data retention violations (any occurrence)
  - Security event severity: critical

warning_alerts:
  - Elevated rate limit usage (>80% of limit)
  - Anomalous user behavior detected
  - Purge job failures
  - Token validation errors (>50/hour)
  - WAF rule triggers (>10/hour)
```

### Dashboard Widgets
- Real-time request rate monitoring
- Authentication success/failure trends
- PII redaction coverage statistics
- Data retention compliance status
- Security event timeline and severity distribution

## 🔧 Configuration Management

### Environment Configuration
```yaml
production:
  rate_limits:
    global: { requests_per_minute: 10000, burst: 2000 }
    user_free: { requests_per_minute: 50, requests_per_day: 5000 }
    user_pro: { requests_per_minute: 200, requests_per_day: 25000 }
  
  pii_redaction:
    level: "strict"
    compliance_modes: ["GDPR", "CCPA", "PCI_DSS"]
  
  token_lifetimes:
    access_token: "15 minutes"
    refresh_token: "30 days"
    api_key: "90 days"
    action_link: "30 minutes"
  
  data_retention:
    default_policy: "standard"
    legal_hold_support: true
    automated_purging: true

development:
  rate_limits:
    global: { requests_per_minute: 1000, burst: 200 }
  
  pii_redaction:
    level: "basic"
    compliance_modes: ["GDPR"]
  
  data_retention:
    default_policy: "development"
    automated_purging: false
```

### Security Headers
```javascript
app.use((req, res, next) => {
  res.setHeader('X-RateLimit-Policy', 'thorbis-security-v1')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})
```

## 🛠️ Troubleshooting

### Common Issues

#### Rate Limiting Too Strict
```bash
# Check current rate limit status
curl -H "Authorization: Bearer $API_KEY" \
     -I https://api.thorbis.com/health

# Look for these headers:
# X-RateLimit-Remaining: 45
# X-RateLimit-Reset: 2024-01-15T10:30:00Z
# Retry-After: 30
```

#### PII Redaction False Positives
```javascript
// Adjust redaction sensitivity
const redactionConfig = {
  level: 'basic', // Instead of 'strict'
  businessTermsPreserved: true,
  falsePositiveThreshold: 0.1
}
```

#### Token Validation Failures
```javascript
// Check token format and expiration
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256'],
  clockTolerance: 30 // Allow 30 second clock skew
})
```

### Support Contacts
- **Security Issues**: security@thorbis.com
- **Rate Limiting**: api-support@thorbis.com  
- **Compliance**: compliance@thorbis.com
- **Emergency**: security-emergency@thorbis.com (24/7)

## 📚 Additional Resources

- [OWASP Security Guidelines](https://owasp.org/www-project-application-security-verification-standard/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)
- [GDPR Technical Guidelines](https://gdpr.eu/gdpr-technical-guidelines/)
- [PCI-DSS Security Standards](https://www.pcisecuritystandards.org/)

This comprehensive security baseline provides enterprise-grade protection with automated threat detection, compliance alignment, and comprehensive audit trails for the Thorbis Business OS platform.
