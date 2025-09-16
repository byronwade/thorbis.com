# Thorbis Feature Flags

Comprehensive feature flag system for safe, controlled rollouts across all Thorbis Business OS domains.

## 🎯 Feature Flag Architecture

### Flag Types
- **Domain Flags**: Control entire domain functionality (e.g., `invoices.write`)
- **Feature Flags**: Control specific features within domains (e.g., `invoices.pdf_generation`)
- **Experiment Flags**: A/B testing and gradual rollouts (e.g., `ui.new_dashboard`)
- **Kill Switch Flags**: Emergency shutoffs for problematic features (e.g., `ai.vector_search`)

### Flag States
```typescript
enum FlagState {
  OFF = 'off',           // Feature completely disabled
  SHADOW = 'shadow',     // Read-only mode, no actual changes
  CANARY = 'canary',     // Enabled for subset of tenants
  ON = 'on',             // Fully enabled for all tenants
  KILL = 'kill'          // Emergency disabled (overrides all other settings)
}
```

## 📋 Domain Feature Flags

### 💰 Invoices Domain
```yaml
invoices.write:
  description: "Enable creation and modification of invoices"
  type: "domain"
  default: "off"
  affects:
    - "POST /api/invoices"
    - "PUT /api/invoices/{id}"
    - "DELETE /api/invoices/{id}"
  dependencies: ["billing.calculate", "templates.pdf"]
  rollback_time: "30 seconds"
  
invoices.pdf_generation:
  description: "Enable PDF generation for invoices"
  type: "feature"
  default: "off"
  affects:
    - "POST /api/invoices/{id}/pdf"
    - "Template rendering service"
  dependencies: ["templates.base"]
  rollback_time: "15 seconds"
  
invoices.auto_send:
  description: "Automatically send invoices via email"
  type: "feature"
  default: "off"
  affects:
    - "Email delivery service"
    - "Invoice webhook triggers"
  dependencies: ["invoices.write", "email.send"]
  rollback_time: "45 seconds"
  
invoices.payment_links:
  description: "Include Stripe payment links in invoices"
  type: "feature"
  default: "off"
  affects:
    - "Stripe integration"
    - "Payment processing"
  dependencies: ["billing.stripe", "invoices.write"]
  rollback_time: "60 seconds"
```

### 📝 Estimates Domain
```yaml
estimates.write:
  description: "Enable creation and modification of estimates"
  type: "domain"
  default: "off"
  affects:
    - "POST /api/estimates"
    - "PUT /api/estimates/{id}"
    - "DELETE /api/estimates/{id}"
  dependencies: ["pricing.calculate", "templates.base"]
  rollback_time: "30 seconds"
  
estimates.convert_to_invoice:
  description: "Enable converting estimates to invoices"
  type: "feature"
  default: "off"
  affects:
    - "POST /api/estimates/{id}/convert"
    - "Invoice creation workflow"
  dependencies: ["estimates.write", "invoices.write"]
  rollback_time: "45 seconds"
  
estimates.ai_pricing:
  description: "AI-powered pricing suggestions for estimates"
  type: "feature"
  default: "off"
  affects:
    - "AI pricing model"
    - "Historical data analysis"
  dependencies: ["ai.core", "estimates.write"]
  rollback_time: "15 seconds"
  
estimates.approval_workflow:
  description: "Multi-step approval process for estimates"
  type: "feature"
  default: "off"
  affects:
    - "Approval notification system"
    - "Status tracking"
  dependencies: ["estimates.write", "notifications.email"]
  rollback_time: "30 seconds"
```

### 📅 Scheduling Domain
```yaml
scheduling.write:
  description: "Enable job scheduling and calendar management"
  type: "domain"
  default: "off"
  affects:
    - "POST /api/jobs"
    - "PUT /api/jobs/{id}"
    - "Calendar integration"
  dependencies: ["calendar.base", "customers.read"]
  rollback_time: "45 seconds"
  
scheduling.auto_assignment:
  description: "Automatically assign jobs to available technicians"
  type: "feature"
  default: "off"
  affects:
    - "Job assignment algorithm"
    - "Technician availability tracking"
  dependencies: ["scheduling.write", "staff.read"]
  rollback_time: "30 seconds"
  
scheduling.route_optimization:
  description: "Optimize technician routes for efficiency"
  type: "feature"
  default: "off"
  affects:
    - "Route planning service"
    - "Google Maps integration"
  dependencies: ["scheduling.write", "maps.google"]
  rollback_time: "15 seconds"
  
scheduling.recurring_jobs:
  description: "Support for recurring job templates"
  type: "feature"
  default: "off"
  affects:
    - "Job template system"
    - "Recurring job scheduler"
  dependencies: ["scheduling.write", "templates.job"]
  rollback_time: "60 seconds"
```

### 🏪 Point of Sale Domain
```yaml
pos.lite:
  description: "Lightweight POS for simple transactions"
  type: "domain"
  default: "off"
  affects:
    - "POST /api/transactions"
    - "Payment processing"
    - "Receipt generation"
  dependencies: ["payments.stripe", "receipts.basic"]
  rollback_time: "45 seconds"
  
pos.inventory_tracking:
  description: "Real-time inventory updates with POS"
  type: "feature"
  default: "off"
  affects:
    - "Inventory deduction"
    - "Stock level tracking"
  dependencies: ["pos.lite", "inventory.write"]
  rollback_time: "30 seconds"
  
pos.loyalty_points:
  description: "Customer loyalty points integration"
  type: "feature"
  default: "off"
  affects:
    - "Points calculation"
    - "Customer account updates"
  dependencies: ["pos.lite", "customers.write"]
  rollback_time: "15 seconds"
  
pos.offline_mode:
  description: "Offline transaction capability with sync"
  type: "feature"
  default: "off"
  affects:
    - "Local storage system"
    - "Sync queue management"
  dependencies: ["pos.lite", "sync.queue"]
  rollback_time: "90 seconds"
```

### 🎨 V0 Templates Domain
```yaml
v0.templates:
  description: "Vercel V0 AI-powered template generation"
  type: "domain"
  default: "off"
  affects:
    - "POST /api/templates/generate"
    - "V0 API integration"
    - "Template customization"
  dependencies: ["ai.v0", "templates.base"]
  rollback_time: "30 seconds"
  
v0.invoice_themes:
  description: "AI-generated invoice themes and layouts"
  type: "feature"
  default: "off"
  affects:
    - "Invoice template generation"
    - "Brand customization"
  dependencies: ["v0.templates", "invoices.write"]
  rollback_time: "45 seconds"
  
v0.marketing_materials:
  description: "Generate marketing flyers and brochures"
  type: "feature"
  default: "off"
  affects:
    - "Marketing template service"
    - "Brand asset generation"
  dependencies: ["v0.templates", "branding.assets"]
  rollback_time: "15 seconds"
  
v0.custom_forms:
  description: "Generate custom forms for data collection"
  type: "feature"
  default: "off"
  affects:
    - "Form builder service"
    - "Data validation rules"
  dependencies: ["v0.templates", "forms.base"]
  rollback_time: "60 seconds"
```

## 🔧 System & Infrastructure Flags

### 🤖 AI & Machine Learning
```yaml
ai.vector_search:
  description: "AI-powered semantic search capabilities"
  type: "feature"
  default: "off"
  affects:
    - "Voyage embeddings service"
    - "Semantic search API"
  dependencies: ["ai.core", "search.base"]
  rollback_time: "15 seconds"
  kill_switch: true
  
ai.cost_optimization:
  description: "AI cost optimization and caching"
  type: "feature"
  default: "off"
  affects:
    - "Token usage optimization"
    - "Response caching"
  dependencies: ["ai.core", "cache.redis"]
  rollback_time: "30 seconds"
  
ai.batch_processing:
  description: "Batch AI requests for efficiency"
  type: "feature"
  default: "off"
  affects:
    - "Request batching service"
    - "Queue management"
  dependencies: ["ai.core", "queue.jobs"]
  rollback_time: "45 seconds"
```

### 📊 Analytics & Reporting
```yaml
analytics.real_time:
  description: "Real-time analytics dashboards"
  type: "feature"
  default: "off"
  affects:
    - "WebSocket connections"
    - "Live data streaming"
  dependencies: ["websockets.base", "metrics.collect"]
  rollback_time: "30 seconds"
  
analytics.ai_insights:
  description: "AI-powered business insights"
  type: "feature"
  default: "off"
  affects:
    - "Pattern recognition"
    - "Predictive analytics"
  dependencies: ["ai.core", "analytics.real_time"]
  rollback_time: "60 seconds"
```

### 🔄 Integration Features
```yaml
integrations.quickbooks:
  description: "QuickBooks accounting integration"
  type: "feature"
  default: "off"
  affects:
    - "QB API sync"
    - "Chart of accounts mapping"
  dependencies: ["accounting.base", "oauth.quickbooks"]
  rollback_time: "90 seconds"
  
integrations.google_calendar:
  description: "Google Calendar synchronization"
  type: "feature"
  default: "off"
  affects:
    - "Calendar sync service"
    - "Event creation/updates"
  dependencies: ["scheduling.write", "oauth.google"]
  rollback_time: "45 seconds"
```

## 🎛️ Flag Management

### Database Schema
```sql
-- Feature flags configuration
CREATE TABLE feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text NOT NULL UNIQUE,
  flag_type text NOT NULL CHECK (flag_type IN ('domain', 'feature', 'experiment', 'kill_switch')),
  description text NOT NULL,
  default_state text NOT NULL CHECK (default_state IN ('off', 'shadow', 'canary', 'on', 'kill')),
  current_state text NOT NULL CHECK (current_state IN ('off', 'shadow', 'canary', 'on', 'kill')),
  
  -- Configuration
  affects jsonb DEFAULT '[]',
  dependencies jsonb DEFAULT '[]',
  rollback_time_seconds integer DEFAULT 30,
  is_kill_switch boolean DEFAULT false,
  
  -- Canary settings
  canary_percentage integer DEFAULT 0 CHECK (canary_percentage >= 0 AND canary_percentage <= 100),
  canary_tenant_ids jsonb DEFAULT '[]',
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Tenant-specific flag overrides
CREATE TABLE tenant_flag_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES businesses(id),
  flag_name text NOT NULL REFERENCES feature_flags(flag_name),
  override_state text NOT NULL CHECK (override_state IN ('off', 'shadow', 'canary', 'on')),
  override_reason text,
  expires_at timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  UNIQUE(tenant_id, flag_name)
);

-- Flag change audit log
CREATE TABLE flag_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text NOT NULL,
  tenant_id uuid REFERENCES businesses(id), -- null for global changes
  
  -- Change details
  previous_state text,
  new_state text NOT NULL,
  change_reason text,
  change_type text NOT NULL CHECK (change_type IN ('manual', 'automated', 'rollback', 'kill_switch')),
  
  -- Metadata
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now(),
  rollback_of uuid REFERENCES flag_change_log(id)
);

-- RLS Policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_flag_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE flag_change_log ENABLE ROW LEVEL SECURITY;

-- Global flags readable by all authenticated users
CREATE POLICY "feature_flags_read" ON feature_flags FOR SELECT TO authenticated USING (true);

-- Only admins can modify global flags
CREATE POLICY "feature_flags_admin_modify" ON feature_flags 
  FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Tenant overrides follow tenant isolation
CREATE POLICY "tenant_overrides_isolation" ON tenant_flag_overrides 
  FOR ALL TO authenticated 
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Audit log follows tenant isolation
CREATE POLICY "flag_audit_isolation" ON flag_change_log 
  FOR SELECT TO authenticated 
  USING (tenant_id IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

### TypeScript Interface
```typescript
interface FeatureFlag {
  flag_name: string
  flag_type: 'domain' | 'feature' | 'experiment' | 'kill_switch'
  description: string
  default_state: FlagState
  current_state: FlagState
  
  // Configuration
  affects: string[]
  dependencies: string[]
  rollback_time_seconds: number
  is_kill_switch: boolean
  
  // Canary settings
  canary_percentage: number
  canary_tenant_ids: string[]
  
  // Metadata
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

interface TenantFlagOverride {
  tenant_id: string
  flag_name: string
  override_state: FlagState
  override_reason?: string
  expires_at?: string
  created_at: string
  created_by: string
}
```

## 🚀 API & CLI Management

### REST API Endpoints
```typescript
// Get all flags for current tenant
GET /api/flags
Response: {
  flags: FeatureFlag[],
  overrides: TenantFlagOverride[],
  effective_states: Record<string, FlagState>
}

// Get specific flag state
GET /api/flags/{flag_name}
Response: {
  flag: FeatureFlag,
  effective_state: FlagState,
  override?: TenantFlagOverride
}

// Update global flag (admin only)
PUT /api/flags/{flag_name}
Body: {
  current_state: FlagState,
  canary_percentage?: number,
  canary_tenant_ids?: string[],
  change_reason: string
}

// Set tenant override
PUT /api/flags/{flag_name}/override
Body: {
  override_state: FlagState,
  override_reason?: string,
  expires_at?: string
}

// Remove tenant override
DELETE /api/flags/{flag_name}/override

// Kill switch activation (emergency)
POST /api/flags/{flag_name}/kill
Body: {
  kill_reason: string
}

// Rollback to previous state
POST /api/flags/{flag_name}/rollback
Body: {
  rollback_reason: string,
  target_change_id?: string // specific change to rollback to
}
```

### CLI Tool
```bash
# Install CLI globally
npm install -g @thorbis/feature-flags-cli

# Configure CLI with API key
thorbis-flags config set-api-key $THORBIS_API_KEY
thorbis-flags config set-tenant $TENANT_ID

# List all flags
thorbis-flags list
thorbis-flags list --domain=invoices
thorbis-flags list --state=canary

# Get specific flag
thorbis-flags get invoices.write
thorbis-flags get invoices.write --json

# Update flag state
thorbis-flags set invoices.write on "Enabling invoice creation for all tenants"
thorbis-flags set invoices.write off "Disabling invoice creation temporarily"
thorbis-flags set estimates.write canary --percentage 10 "Testing with 10% of tenants"

# Tenant-specific overrides
thorbis-flags override invoices.write off --reason "Tenant requested disable"
thorbis-flags override invoices.write off --expires "2024-03-01T00:00:00Z"

# Emergency kill switch
thorbis-flags kill ai.vector_search "Memory leak detected in search service"

# Rollback changes
thorbis-flags rollback invoices.write "Rolling back due to errors"
thorbis-flags rollback invoices.write --to-change-id abc123

# Bulk operations
thorbis-flags bulk-set --file flags-update.yaml
thorbis-flags bulk-rollback --domain invoices

# Monitoring and status
thorbis-flags status
thorbis-flags history invoices.write
thorbis-flags canary-status
```

## 🔍 Flag Evaluation

### Client-Side Evaluation
```typescript
// Feature flag service
class FeatureFlagService {
  private flags: Map<string, FlagState> = new Map()
  private tenantId: string
  
  constructor(tenantId: string) {
    this.tenantId = tenantId
  }
  
  // Check if flag is enabled
  isEnabled(flagName: string): boolean {
    const state = this.flags.get(flagName)
    return state === FlagState.ON || state === FlagState.CANARY
  }
  
  // Check if flag is in shadow mode
  isShadowMode(flagName: string): boolean {
    return this.flags.get(flagName) === FlagState.SHADOW
  }
  
  // Check if flag is completely off
  isDisabled(flagName: string): boolean {
    const state = this.flags.get(flagName)
    return state === FlagState.OFF || state === FlagState.KILL
  }
  
  // Get flag state with fallback
  getFlagState(flagName: string, fallback: FlagState = FlagState.OFF): FlagState {
    return this.flags.get(flagName) || fallback
  }
  
  // Refresh flags from server
  async refreshFlags(): Promise<void> {
    const response = await fetch(`/api/flags?tenant_id=${this.tenantId}`)
    const data = await response.json()
    
    // Update local cache
    this.flags.clear()
    for (const [flagName, state] of Object.entries(data.effective_states)) {
      this.flags.set(flagName, state as FlagState)
    }
  }
  
  // Wrap function execution with flag check
  withFlag<T>(flagName: string, fn: () => T, fallback?: () => T): T | undefined {
    if (this.isEnabled(flagName)) {
      return fn()
    } else if (fallback) {
      return fallback()
    }
    return undefined
  }
  
  // Execute in shadow mode (read-only)
  withShadowMode<T>(flagName: string, fn: () => T): T | undefined {
    if (this.isShadowMode(flagName)) {
      console.log(`[SHADOW MODE] Executing ${flagName}`)
      return fn()
    }
    return undefined
  }
}

// Usage examples
const flags = new FeatureFlagService(tenantId)
await flags.refreshFlags()

// Simple check
if (flags.isEnabled('invoices.write')) {
  await createInvoice(invoiceData)
}

// Check if flag is disabled
if (flags.getFlagState('invoices.write') === 'off') {
  console.log('Invoice creation is disabled')
}

// With fallback
const result = flags.withFlag(
  'invoices.ai_pricing', 
  () => getAIPricingSuggestion(estimate),
  () => getBasicPricing(estimate)
)

// Shadow mode execution
flags.withShadowMode('estimates.convert_to_invoice', () => {
  // This runs but doesn't actually create the invoice
  validateConversionData(estimate)
  logConversionAttempt(estimate)
})
```

### Server-Side Middleware
```typescript
// Express middleware for flag checking
export function requireFlag(flagName: string, shadowModeOk: boolean = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.tenant_id
    if (!tenantId) {
      return res.status(401).json({ error: 'TENANT_REQUIRED' })
    }
    
    const flagState = await getFlagState(flagName, tenantId)
    
    // Check if flag allows execution
    if (flagState === FlagState.ON || flagState === FlagState.CANARY) {
      req.flagMode = 'enabled'
      return next()
    }
    
    if (shadowModeOk && flagState === FlagState.SHADOW) {
      req.flagMode = 'shadow'
      return next()
    }
    
    // Flag is off or killed
    return res.status(403).json({ 
      error: 'FEATURE_DISABLED',
      flag: flagName,
      state: flagState,
      message: `Feature ${flagName} is not enabled for this tenant`
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
      await logShadowExecution('invoices.write', 'create', validation)
      return res.json({ shadow: true, validation })
    }
    
    // Normal execution
    const invoice = await createInvoice(req.body)
    res.json(invoice)
  }
)
```

This comprehensive feature flag system provides safe, controlled rollouts with clear on/off semantics, CLI/API management, and detailed rollback procedures with time estimates.
