# Thorbis Feature Flags & Rollout System

Comprehensive feature flag and canary deployment system for safe, controlled rollouts of Thorbis Business OS features.

## 📁 Configuration Files

### Core Feature Flag System
- **`flags.md`** - Complete feature flag definitions by domain (invoices.write, estimates.write, scheduling.write, pos.lite, v0.templates) with clear on/off semantics
- **`shadow-mode.md`** - Read-only execution system with UI intents for safe testing without data changes
- **`canary-plan.md`** - Gradual rollout strategy (10% → 50% → 100%) with automated rollback criteria and time estimates

### Supporting Documentation
- **`README.md`** - This implementation guide and CLI reference

## 🎯 Feature Flag Overview

### Flag Categories by Domain
```yaml
# Invoice Management
invoices.write: "Enable creation and modification of invoices" 
invoices.pdf_generation: "Enable PDF generation for invoices"
invoices.auto_send: "Automatically send invoices via email"
invoices.payment_links: "Include Stripe payment links in invoices"

# Estimate Management
estimates.write: "Enable creation and modification of estimates"
estimates.convert_to_invoice: "Enable converting estimates to invoices" 
estimates.ai_pricing: "AI-powered pricing suggestions for estimates"
estimates.approval_workflow: "Multi-step approval process for estimates"

# Job Scheduling
scheduling.write: "Enable job scheduling and calendar management"
scheduling.auto_assignment: "Automatically assign jobs to available technicians"
scheduling.route_optimization: "Optimize technician routes for efficiency"
scheduling.recurring_jobs: "Support for recurring job templates"

# Point of Sale
pos.lite: "Lightweight POS for simple transactions"
pos.inventory_tracking: "Real-time inventory updates with POS"
pos.loyalty_points: "Customer loyalty points integration"
pos.offline_mode: "Offline transaction capability with sync"

# AI Template Generation
v0.templates: "Vercel V0 AI-powered template generation"
v0.invoice_themes: "AI-generated invoice themes and layouts"
v0.marketing_materials: "Generate marketing flyers and brochures" 
v0.custom_forms: "Generate custom forms for data collection"
```

### Flag States
```typescript
enum FlagState {
  OFF = 'off',           // Feature completely disabled
  SHADOW = 'shadow',     // Read-only mode, no actual changes
  CANARY = 'canary',     // Enabled for subset of tenants
  ON = 'on',             // Fully enabled for all tenants
  KILL = 'kill'          // Emergency disabled (overrides all)
}
```

## 🎛️ Management Interface

### CLI Commands
```bash
# Install CLI
npm install -g @thorbis/feature-flags-cli

# Configure
thorbis-flags config set-api-key $THORBIS_API_KEY
thorbis-flags config set-tenant $TENANT_ID

# Basic Operations
thorbis-flags list                                    # List all flags
thorbis-flags get invoices.write                      # Get specific flag
thorbis-flags set invoices.write on "Enable for all" # Update flag state

# Canary Management
thorbis-flags set estimates.write canary --percentage 10 "Testing with 10% of tenants"
thorbis-flags canary-status                          # Show canary progress

# Emergency Controls
thorbis-flags kill ai.vector_search "Memory leak detected"
thorbis-flags rollback invoices.write "Rolling back due to errors"

# Monitoring
thorbis-flags status                                 # Overall system status
thorbis-flags history invoices.write                # Flag change history
```

### REST API
```typescript
// Get flags for tenant
GET /api/flags
// Response: { flags: FeatureFlag[], effective_states: Record<string, FlagState> }

// Update flag (admin only)
PUT /api/flags/{flag_name}
// Body: { current_state: "on", change_reason: "Ready for production" }

// Tenant override
PUT /api/flags/{flag_name}/override
// Body: { override_state: "off", override_reason: "Tenant requested disable" }

// Emergency kill switch
POST /api/flags/{flag_name}/kill
// Body: { kill_reason: "Critical error detected" }

// Rollback to previous state
POST /api/flags/{flag_name}/rollback
// Body: { rollback_reason: "Performance issues detected" }
```

## 🌙 Shadow Mode Testing

Shadow Mode allows safe testing in production without making actual changes:

### Execution Types
- **VALIDATE_ONLY**: Run validation logic only
- **DRY_RUN**: Full execution simulation with mocked dependencies
- **UI_INTENTS**: UI changes only, no data modifications
- **LOG_ONLY**: Log what would happen without executing

### Shadow Mode Example
```typescript
// Test invoice creation in shadow mode
const result = await InvoicesShadowMode.createInvoice(invoiceData)

// Result includes:
// - Shadow execution metrics
// - Validation results  
// - UI intents that would be sent
// - Performance measurements
// - Error detection

console.log(result)
// {
//   execution_id: "shadow_123",
//   shadow_mode: true,
//   execution_type: "dry_run",
//   execution_time_ms: 250,
//   result: { /* simulated invoice */ },
//   ui_intents: [
//     { type: "show_toast", message: "Invoice created successfully" },
//     { type: "navigate", path: "/invoices/shadow_456" }
//   ],
//   validations: [{ valid: true, message: "All checks passed" }]
// }
```

## 🚦 Canary Rollout Process

### Phase-Based Rollout
1. **Shadow Mode (0%)** - 24+ hours of read-only testing
2. **Canary 10%** - 48+ hours with ~50 selected tenants
3. **Canary 50%** - 72+ hours with ~250 tenants  
4. **Full Rollout 100%** - Complete activation

### Tenant Selection Strategy
```typescript
// 10% Canary Selection Criteria
const canaryTenants = await selectCanaryTenants(10, {
  low_risk_tenants: true,           // Start with stable tenants
  beta_program_participants: true,  // Opted-in for testing
  high_engagement: true,            // Active users who provide feedback
  geographic_distribution: true,    // 24/7 monitoring coverage
  representative_mix: {
    size: { small: 40%, medium: 40%, large: 20% },
    industry: { field_services: 60%, restaurants: 40% }
  }
})
```

### Success Criteria Examples
```yaml
invoices.write:
  canary_10_percent:
    execution_success_rate: ">= 99%"      # Invoice creation success
    error_rate: "<= 0.5%"                 # Low error tolerance  
    latency_p95: "<= 800ms"               # Performance requirement
    customer_satisfaction: ">= 95%"        # CSAT for feature users
    support_ticket_increase: "<= 10%"      # Limited support impact
    
  rollback_criteria:
    execution_success_rate: "< 95%"       # Auto-rollback trigger
    error_rate: "> 2%"                    # Error rate too high
    critical_errors: ">= 2"               # Any critical errors
    customer_satisfaction: "< 85%"        # Poor user experience
```

## 🚨 Automated Rollback System

### Rollback Types & Time Estimates
```yaml
# Gradual Rollback (35 minutes)
gradual:
  - "Pause new canary assignments: 1 minute"
  - "Reduce canary percentage by 50%: 2 minutes" 
  - "Monitor for improvement: 30 minutes"
  - "Complete rollback if needed: 2 minutes"

# Immediate Rollback (9 minutes)  
immediate:
  - "Disable feature immediately: 1 minute"
  - "Verify rollback completion: 2 minutes"
  - "Clear cached feature state: 1 minute"
  - "Restart affected services: 5 minutes"

# Kill Switch (4.5 minutes)
kill_switch:
  - "Activate emergency kill switch: 30 seconds"
  - "Enable circuit breakers: 1 minute"
  - "Emergency monitoring: 1 minute"
  - "Isolate affected services: 2 minutes"
```

### Rollback Commands
```bash
# Gradual rollback
thorbis-flags set invoices.write canary --percentage 0 --reason "Gradual rollback"

# Immediate rollback
thorbis-flags set invoices.write off --reason "Emergency rollback"
kubectl rollout restart deployment/thorbis-api

# Kill switch activation
thorbis-flags kill invoices.write "Critical error - data integrity risk"

# Verify rollback
thorbis-flags get invoices.write
curl -s https://api.thorbis.com/health | jq '.feature_flags'
```

## 🏗️ Implementation Architecture

### Database Schema
```sql
-- Feature flags configuration
CREATE TABLE feature_flags (
  flag_name text PRIMARY KEY,
  flag_type text NOT NULL CHECK (flag_type IN ('domain', 'feature', 'experiment', 'kill_switch')),
  current_state text NOT NULL CHECK (current_state IN ('off', 'shadow', 'canary', 'on', 'kill')),
  canary_percentage integer DEFAULT 0,
  rollback_time_seconds integer DEFAULT 30,
  dependencies jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tenant-specific overrides  
CREATE TABLE tenant_flag_overrides (
  tenant_id uuid REFERENCES businesses(id),
  flag_name text REFERENCES feature_flags(flag_name),
  override_state text NOT NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (tenant_id, flag_name)
);

-- Change audit log
CREATE TABLE flag_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text NOT NULL,
  previous_state text,
  new_state text NOT NULL,
  change_reason text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);
```

### Service Integration
```typescript
// Express middleware for flag checking
export function requireFlag(flagName: string, shadowModeOk: boolean = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const flagState = await getFlagState(flagName, req.user.tenant_id)
    
    if (flagState === FlagState.ON || flagState === FlagState.CANARY) {
      req.flagMode = 'enabled'
      return next()
    }
    
    if (shadowModeOk && flagState === FlagState.SHADOW) {
      req.flagMode = 'shadow'
      return next()
    }
    
    return res.status(403).json({ 
      error: 'FEATURE_DISABLED',
      flag: flagName,
      state: flagState 
    })
  }
}

// Usage in routes
app.post('/api/invoices', 
  requireFlag('invoices.write'),
  async (req, res) => {
    if (req.flagMode === 'shadow') {
      // Execute in shadow mode (validation only)
      const validation = await validateInvoiceData(req.body)
      return res.json({ shadow: true, validation })
    }
    
    // Normal execution
    const invoice = await createInvoice(req.body)
    res.json(invoice)
  }
)
```

## 📊 Monitoring & Analytics

### Real-Time Monitoring
```typescript
interface CanaryMetrics {
  success_rate: number              // Feature operation success rate
  error_rate: number               // Error rate for feature operations
  latency_p95: number              // 95th percentile response time
  customer_satisfaction: number    // CSAT score for feature users
  support_tickets: number          // Feature-related support requests
  conversion_rate: number          // Feature usage to outcome rate
}

// Monitor canary rollout
const monitor = new CanaryMonitor()
const result = await monitor.monitorCanaryPhase(
  'invoices.write',
  CANARY_PHASES.canary_10_percent,
  selectedCanaryTenants
)

if (result.status === 'rolled_back') {
  console.log(`Rollback executed: ${result.rollback_reason}`)
  console.log(`Time to restore: ${result.rollback_result.restoration_time_minutes} minutes`)
}
```

### Feature Analytics
```sql
-- Feature usage analytics
SELECT 
  flag_name,
  COUNT(DISTINCT tenant_id) as active_tenants,
  COUNT(*) as total_operations,
  AVG(execution_time_ms) as avg_latency,
  (COUNT(*) FILTER (WHERE success = true) / COUNT(*)::float) as success_rate
FROM feature_usage_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY flag_name
ORDER BY active_tenants DESC;

-- Canary performance comparison
SELECT 
  'canary' as group_type,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE error = true) / COUNT(*)::float as error_rate
FROM api_requests 
WHERE tenant_id = ANY(SELECT tenant_id FROM tenant_flag_overrides WHERE flag_name = 'invoices.write')
  AND created_at >= NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
  'control' as group_type,
  AVG(response_time_ms) as avg_response_time, 
  COUNT(*) FILTER (WHERE error = true) / COUNT(*)::float as error_rate
FROM api_requests
WHERE tenant_id != ANY(SELECT tenant_id FROM tenant_flag_overrides WHERE flag_name = 'invoices.write')
  AND created_at >= NOW() - INTERVAL '1 hour';
```

## 🛠️ Development Workflow

### Feature Development Process
1. **Create Flag**: Define feature flag in database and configuration
2. **Shadow Implementation**: Build feature with shadow mode support
3. **Shadow Testing**: Test extensively in shadow mode (24+ hours)
4. **Canary 10%**: Deploy to small user group (48+ hours)
5. **Canary 50%**: Expand to larger group (72+ hours)  
6. **Full Rollout**: Enable for all users
7. **Cleanup**: Remove canary infrastructure after stable period

### Code Structure
```typescript
// Feature implementation with flag checks
export class InvoiceService {
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const flags = await getFeatureFlags(data.tenant_id)
    
    // Check if feature is enabled
    if (!flags.isEnabled('invoices.write')) {
      throw new Error('Invoice creation is not enabled')
    }
    
    // Shadow mode execution
    if (flags.isShadowMode('invoices.write')) {
      return await this.createInvoiceShadow(data)
    }
    
    // Normal execution
    return await this.createInvoiceNormal(data)
  }
  
  private async createInvoiceShadow(data: CreateInvoiceRequest): Promise<Invoice> {
    // Validation-only execution
    const validation = await this.validateInvoiceData(data)
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Record shadow execution
    await this.auditLogger.logShadowExecution({
      operation: 'create_invoice',
      data: data,
      validation: validation
    })
    
    // Return simulated result
    return {
      id: `shadow_${uuidv4()}`,
      number: await this.getNextInvoiceNumber(),
      ...data,
      created_at: new Date().toISOString(),
      shadow_mode: true
    }
  }
}
```

## 🚀 Production Deployment

### Deployment Checklist
- [ ] Feature flags defined in database
- [ ] Shadow mode implementation complete
- [ ] Monitoring and alerting configured
- [ ] Rollback procedures tested
- [ ] Canary tenant selection criteria defined
- [ ] Success/failure criteria established
- [ ] Emergency contacts and escalation paths defined

### Post-Deployment
- [ ] Monitor shadow mode execution for 24+ hours
- [ ] Validate canary selection algorithm
- [ ] Test rollback procedures with non-critical flags
- [ ] Establish regular flag cleanup process
- [ ] Document lessons learned and process improvements

This comprehensive feature flag system provides safe, controlled rollouts with clear on/off semantics, CLI/API management, and detailed rollback procedures with precise time estimates.
