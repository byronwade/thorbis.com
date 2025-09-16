# Thorbis Intent Bus Validator

Comprehensive validation rules and execution ordering for client-side UI intents with enterprise-grade safety and business logic enforcement.

## 🎯 Validation Philosophy

The Intent Bus validator ensures that all UI state changes are:
- **Safe**: Cannot compromise application security or data integrity
- **Consistent**: Maintain logical UI flow and business rule compliance
- **Accessible**: Respect user accessibility preferences and requirements
- **Tenant-Isolated**: Operate only within authorized tenant boundaries
- **Auditable**: All validation decisions are logged and traceable

## 📋 Validation Pipeline

### Stage 1: Schema Validation
```typescript
interface ValidationStage1Result {
  schema_valid: boolean
  field_errors: FieldError[]
  type_errors: TypeError[]
  format_errors: FormatError[]
}
```

**Validation Steps:**
1. **JSON Schema Compliance**: Intent must match exact schema from `intent-contract.json`
2. **Required Fields**: All required fields must be present and non-null
3. **Type Validation**: Field types must match schema definitions exactly
4. **Format Validation**: String patterns, date formats, and enums must be valid
5. **Range Validation**: Numeric fields must be within specified ranges

**Rejection Criteria:**
- Missing required fields → `INTENT_VALIDATION_FAILED`
- Invalid field types → `INTENT_VALIDATION_FAILED`
- Malformed timestamps → `INTENT_VALIDATION_FAILED`
- Invalid enum values → `INTENT_VALIDATION_FAILED`
- Pattern mismatches (e.g., invalid route patterns) → `INTENT_VALIDATION_FAILED`

### Stage 2: Business Logic Validation
```typescript
interface ValidationStage2Result {
  business_rules_valid: boolean
  permission_violations: PermissionError[]
  context_errors: ContextError[]
  safety_violations: SafetyError[]
}
```

**Validation Rules by Intent Type:**

#### NAVIGATE Intent Validation
```typescript
function validateNavigateIntent(intent: NavigateIntent): ValidationResult {
  const errors: ValidationError[] = []
  
  // Route validation
  if (!intent.payload.route.match(/^/(hs|rest|auto|ret)/(app|auth)/[a-zA-Z0-9/_-]*$/)) {
    errors.push({
      field: 'payload.route',
      code: 'INVALID_ROUTE_PATTERN',
      message: 'Route must follow industry-namespaced pattern'
    })
  }
  
  // Cross-industry navigation check
  const currentIndustry = getCurrentIndustry()
  const targetIndustry = extractIndustryFromRoute(intent.payload.route)
  if (currentIndustry !== targetIndustry && !hasPermission('CROSS_INDUSTRY_NAV')) {
    errors.push({
      field: 'payload.route', 
      code: 'CROSS_INDUSTRY_DENIED',
      message: 'User lacks permission for cross-industry navigation'
    })
  }
  
  // External URL validation
  if (intent.payload.external && intent.origin === 'AI') {
    errors.push({
      field: 'payload.external',
      code: 'AI_EXTERNAL_NAV_DENIED',
      message: 'AI cannot initiate external navigation without user consent'
    })
  }
  
  // Tenant boundary check
  if (!isRouteInTenantBoundary(intent.payload.route, getCurrentTenant())) {
    errors.push({
      field: 'payload.route',
      code: 'TENANT_BOUNDARY_VIOLATION',
      message: 'Route outside tenant boundaries'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### SET_TABLE_STATE Intent Validation
```typescript
function validateTableStateIntent(intent: SetTableStateIntent): ValidationResult {
  const errors: ValidationError[] = []
  
  // Table existence check
  const tableElement = document.getElementById(intent.payload.table_id)
  if (!tableElement) {
    errors.push({
      field: 'payload.table_id',
      code: 'TABLE_NOT_FOUND',
      message: `Table with ID ${intent.payload.table_id} not found on current page`
    })
  }
  
  // Filter validation
  if (intent.payload.state_update.filters) {
    intent.payload.state_update.filters.forEach((filter, index) => {
      // Field existence check
      if (!isValidTableField(intent.payload.table_id, filter.field)) {
        errors.push({
          field: `payload.state_update.filters[${index}].field`,
          code: 'INVALID_FILTER_FIELD',
          message: `Field ${filter.field} does not exist in table schema`
        })
      }
      
      // Data type compatibility
      if (!isCompatibleDataType(filter.data_type, filter.value, filter.operator)) {
        errors.push({
          field: `payload.state_update.filters[${index}].value`,
          code: 'INCOMPATIBLE_FILTER_VALUE',
          message: `Value type incompatible with field data type ${filter.data_type}`
        })
      }
      
      // Operator validation
      if (!isSupportedOperator(filter.data_type, filter.operator)) {
        errors.push({
          field: `payload.state_update.filters[${index}].operator`,
          code: 'UNSUPPORTED_OPERATOR',
          message: `Operator ${filter.operator} not supported for ${filter.data_type}`
        })
      }
    })
  }
  
  // Sort validation
  if (intent.payload.state_update.sorting) {
    intent.payload.state_update.sorting.forEach((sort, index) => {
      if (!isValidTableField(intent.payload.table_id, sort.field)) {
        errors.push({
          field: `payload.state_update.sorting[${index}].field`,
          code: 'INVALID_SORT_FIELD', 
          message: `Sort field ${sort.field} does not exist in table schema`
        })
      }
      
      if (!isSortableField(intent.payload.table_id, sort.field)) {
        errors.push({
          field: `payload.state_update.sorting[${index}].field`,
          code: 'FIELD_NOT_SORTABLE',
          message: `Field ${sort.field} is not configured as sortable`
        })
      }
    })
  }
  
  // Selection validation
  if (intent.payload.state_update.selection?.selected_rows) {
    const currentData = getCurrentTableData(intent.payload.table_id)
    const invalidRows = intent.payload.state_update.selection.selected_rows.filter(
      rowId => !currentData.some(row => row.id === rowId)
    )
    
    if (invalidRows.length > 0) {
      errors.push({
        field: 'payload.state_update.selection.selected_rows',
        code: 'INVALID_ROW_SELECTION',
        message: `Selected rows do not exist in current dataset: ${invalidRows.join(', ')}`
      })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### OPEN_MODAL Intent Validation
```typescript
function validateOpenModalIntent(intent: OpenModalIntent): ValidationResult {
  const errors: ValidationError[] = []
  
  // Panel type validation (no overlay modals allowed)
  const allowedPanelTypes = ['sidebar', 'inline_form', 'section_expand', 'detail_panel', 'filter_panel', 'action_panel']
  if (!allowedPanelTypes.includes(intent.payload.panel_type)) {
    errors.push({
      field: 'payload.panel_type',
      code: 'OVERLAY_MODAL_FORBIDDEN',
      message: 'Overlay modals are not allowed per Thorbis design principles'
    })
  }
  
  // Panel ID uniqueness
  if (isPanelOpen(intent.payload.panel_id)) {
    errors.push({
      field: 'payload.panel_id',
      code: 'PANEL_ALREADY_OPEN',
      message: `Panel with ID ${intent.payload.panel_id} is already open`
    })
  }
  
  // Entity context validation
  if (intent.payload.context?.entity_id && intent.payload.context?.entity_type) {
    const entityExists = verifyEntityExists(
      intent.payload.context.entity_type,
      intent.payload.context.entity_id,
      getCurrentTenant()
    )
    
    if (!entityExists) {
      errors.push({
        field: 'payload.context.entity_id',
        code: 'ENTITY_NOT_FOUND',
        message: `Entity ${intent.payload.context.entity_type}:${intent.payload.context.entity_id} not found`
      })
    }
    
    // Permission check for entity access
    if (!hasEntityPermission(intent.payload.context.entity_type, intent.payload.context.action)) {
      errors.push({
        field: 'payload.context.action',
        code: 'ENTITY_ACTION_DENIED',
        message: `User lacks permission for ${intent.payload.context.action} on ${intent.payload.context.entity_type}`
      })
    }
  }
  
  // Industry context validation
  if (intent.payload.context?.entity_type) {
    const currentIndustry = getCurrentIndustry()
    if (!isEntityTypeValidForIndustry(intent.payload.context.entity_type, currentIndustry)) {
      errors.push({
        field: 'payload.context.entity_type',
        code: 'ENTITY_INDUSTRY_MISMATCH',
        message: `Entity type ${intent.payload.context.entity_type} not valid for ${currentIndustry} industry`
      })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### SET_THEME Intent Validation
```typescript
function validateSetThemeIntent(intent: SetThemeIntent): ValidationResult {
  const errors: ValidationError[] = []
  
  // AI cannot disable accessibility features
  if (intent.origin === 'AI' && intent.payload.theme_updates.high_contrast === false) {
    errors.push({
      field: 'payload.theme_updates.high_contrast',
      code: 'AI_ACCESSIBILITY_DENIED',
      message: 'AI cannot disable high contrast accessibility feature'
    })
  }
  
  // Industry branding cannot be disabled in business context
  if (intent.payload.theme_updates.industry_branding === false && isBusinessContext()) {
    errors.push({
      field: 'payload.theme_updates.industry_branding',
      code: 'INDUSTRY_BRANDING_REQUIRED',
      message: 'Industry branding cannot be disabled in business context'
    })
  }
  
  // Validate motion preference consistency
  if (intent.payload.theme_updates.motion && getUserAccessibilityPreferences().prefers_reduced_motion) {
    if (intent.payload.theme_updates.motion === 'full') {
      errors.push({
        field: 'payload.theme_updates.motion',
        code: 'MOTION_ACCESSIBILITY_CONFLICT',
        message: 'Cannot enable full motion when user prefers reduced motion'
      })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### RUN_CLIENT_ACTION Intent Validation
```typescript
function validateClientActionIntent(intent: RunClientActionIntent): ValidationResult {
  const errors: ValidationError[] = []
  
  // External link validation
  if (intent.payload.action === 'open_external_link') {
    if (intent.origin === 'AI' && !intent.payload.safety_checks.requires_user_consent) {
      errors.push({
        field: 'payload.safety_checks.requires_user_consent',
        code: 'AI_EXTERNAL_LINK_CONSENT_REQUIRED',
        message: 'AI-initiated external links require user consent'
      })
    }
    
    const url = intent.payload.parameters.options?.url
    if (url && !isUrlSafe(url)) {
      errors.push({
        field: 'payload.parameters.options.url',
        code: 'UNSAFE_URL',
        message: 'URL failed security validation'
      })
    }
  }
  
  // Data export validation
  if (intent.payload.action === 'export_data') {
    if (intent.payload.safety_checks.data_access_level === 'tenant_data' && 
        !hasPermission('EXPORT_TENANT_DATA')) {
      errors.push({
        field: 'payload.safety_checks.data_access_level',
        code: 'EXPORT_PERMISSION_DENIED',
        message: 'User lacks permission to export tenant data'
      })
    }
    
    const filename = intent.payload.parameters.options?.filename
    if (filename && !isSafeFilename(filename)) {
      errors.push({
        field: 'payload.parameters.options.filename',
        code: 'UNSAFE_FILENAME',
        message: 'Filename contains invalid or unsafe characters'
      })
    }
  }
  
  // Screenshot validation
  if (intent.payload.action === 'take_screenshot') {
    if (intent.origin === 'AI') {
      errors.push({
        field: 'payload.action',
        code: 'AI_SCREENSHOT_DENIED',
        message: 'AI cannot take screenshots without explicit user permission'
      })
    }
  }
  
  // Print validation
  if (intent.payload.action === 'print_document') {
    const target = intent.payload.parameters.target
    if (target && !isPrintableElement(target)) {
      errors.push({
        field: 'payload.parameters.target',
        code: 'ELEMENT_NOT_PRINTABLE',
        message: `Element ${target} is not configured for printing`
      })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

### Stage 3: Contextual Validation
```typescript
interface ValidationStage3Result {
  context_valid: boolean
  ui_state_conflicts: UIStateError[]
  sequence_violations: SequenceError[]
  resource_conflicts: ResourceError[]
}
```

**UI State Consistency Checks:**
1. **Component Lifecycle**: Ensure target components are mounted and ready
2. **Data Dependencies**: Verify required data is loaded and accessible
3. **UI Flow Logic**: Validate intent follows logical user workflow
4. **Resource Conflicts**: Check for conflicting operations on same resources
5. **Accessibility State**: Ensure intent respects current accessibility settings

### Stage 4: Security Validation
```typescript
interface ValidationStage4Result {
  security_valid: boolean
  permission_errors: PermissionError[]
  tenant_violations: TenantError[]
  origin_violations: OriginError[]
}
```

**Security Checks:**
1. **Permission Verification**: User has required permissions for all intent operations
2. **Tenant Boundary**: All referenced data is within tenant scope
3. **Origin Validation**: Intent origin has authority for requested operations
4. **Rate Limiting**: Intent does not exceed rate limits for origin type
5. **Data Access**: Referenced entities exist and are accessible

## 🔄 Execution Ordering Rules

### Intent Priority Levels
```typescript
enum IntentPriority {
  CRITICAL = 0,    // System-critical operations (SET_THEME accessibility)
  HIGH = 1,        // User-initiated navigation and actions
  MEDIUM = 2,      // Table state updates and panel operations  
  LOW = 3,         // Background operations and optimizations
  DEFERRED = 4     // Non-critical operations that can be delayed
}

const INTENT_PRIORITIES: Record<string, IntentPriority> = {
  'SET_THEME': IntentPriority.CRITICAL,
  'NAVIGATE': IntentPriority.HIGH,
  'RUN_CLIENT_ACTION': IntentPriority.HIGH,
  'OPEN_MODAL': IntentPriority.MEDIUM,
  'SET_TABLE_STATE': IntentPriority.MEDIUM
}
```

### Execution Queue Management
```typescript
class IntentExecutionQueue {
  private queues: Map<IntentPriority, Intent[]> = new Map()
  private executing: Set<string> = new Set()
  private conflicts: ConflictDetector = new ConflictDetector()
  
  async enqueue(intent: Intent): Promise<void> {
    const priority = this.getPriority(intent)
    const queue = this.queues.get(priority) || []
    
    // Check for conflicts with executing or queued intents
    const conflictingIntents = this.conflicts.detectConflicts(intent, [
      ...this.executing,
      ...this.getAllQueuedIntents()
    ])
    
    if (conflictingIntents.length > 0) {
      if (this.shouldPreempt(intent, conflictingIntents)) {
        await this.preemptConflictingIntents(conflictingIntents)
      } else {
        throw new ValidationError('INTENT_CONFLICT', 
          `Intent conflicts with: ${conflictingIntents.map(i => i.intent_id).join(', ')}`)
      }
    }
    
    queue.push(intent)
    this.queues.set(priority, queue)
    
    // Trigger execution if this is highest priority
    this.processQueues()
  }
  
  private async processQueues(): Promise<void> {
    for (let priority = IntentPriority.CRITICAL; priority <= IntentPriority.DEFERRED; priority++) {
      const queue = this.queues.get(priority)
      if (queue && queue.length > 0) {
        const intent = queue.shift()!
        await this.executeIntent(intent)
        break // Process one intent at a time to re-evaluate priorities
      }
    }
  }
}
```

### Conflict Detection Rules
```typescript
class ConflictDetector {
  detectConflicts(intent: Intent, existingIntents: Intent[]): Intent[] {
    const conflicts: Intent[] = []
    
    for (const existing of existingIntents) {
      // Resource-based conflicts
      if (this.hasResourceConflict(intent, existing)) {
        conflicts.push(existing)
      }
      
      // UI state conflicts
      if (this.hasUIStateConflict(intent, existing)) {
        conflicts.push(existing)
      }
      
      // Navigation conflicts
      if (this.hasNavigationConflict(intent, existing)) {
        conflicts.push(existing)
      }
    }
    
    return conflicts
  }
  
  private hasResourceConflict(intent1: Intent, intent2: Intent): boolean {
    // Table state conflicts
    if (intent1.type === 'SET_TABLE_STATE' && intent2.type === 'SET_TABLE_STATE') {
      return intent1.payload.table_id === intent2.payload.table_id
    }
    
    // Panel conflicts
    if (intent1.type === 'OPEN_MODAL' && intent2.type === 'OPEN_MODAL') {
      return intent1.payload.panel_id === intent2.payload.panel_id
    }
    
    // Navigation conflicts (only one navigation can be active)
    if (intent1.type === 'NAVIGATE' && intent2.type === 'NAVIGATE') {
      return true
    }
    
    return false
  }
  
  private hasUIStateConflict(intent1: Intent, intent2: Intent): boolean {
    // Theme changes during active operations
    if (intent1.type === 'SET_THEME' && this.isUIModifyingIntent(intent2)) {
      return true
    }
    
    // Navigation during panel operations
    if (intent1.type === 'NAVIGATE' && intent2.type === 'OPEN_MODAL') {
      return true
    }
    
    return false
  }
}
```

### Sequential Execution Rules
```typescript
interface ExecutionSequence {
  must_complete_before: string[]  // Intent types that must complete first
  cannot_run_with: string[]       // Intent types that cannot run concurrently
  requires_ui_state: string[]     // UI states that must be present
  blocks_ui_state: string[]       // UI states that are blocked during execution
}

const EXECUTION_SEQUENCES: Record<string, ExecutionSequence> = {
  'NAVIGATE': {
    must_complete_before: ['SET_TABLE_STATE', 'OPEN_MODAL'],
    cannot_run_with: ['NAVIGATE'],
    requires_ui_state: ['page_loaded', 'user_authenticated'],
    blocks_ui_state: ['table_operations', 'panel_operations']
  },
  'SET_TABLE_STATE': {
    must_complete_before: [],
    cannot_run_with: ['NAVIGATE', 'SET_TABLE_STATE'], // Same table
    requires_ui_state: ['table_loaded', 'data_accessible'],
    blocks_ui_state: []
  },
  'OPEN_MODAL': {
    must_complete_before: [],
    cannot_run_with: ['NAVIGATE', 'OPEN_MODAL'], // Same panel
    requires_ui_state: ['page_stable', 'no_blocking_operations'],
    blocks_ui_state: ['navigation']
  },
  'SET_THEME': {
    must_complete_before: ['RUN_CLIENT_ACTION', 'SET_TABLE_STATE'],
    cannot_run_with: [],
    requires_ui_state: [],
    blocks_ui_state: ['all_operations'] // Theme changes affect everything
  },
  'RUN_CLIENT_ACTION': {
    must_complete_before: [],
    cannot_run_with: ['SET_THEME'],
    requires_ui_state: ['action_target_available'],
    blocks_ui_state: []
  }
}
```

## ⚠️ Rejection Criteria

### Immediate Rejection (No Retry)
```typescript
const IMMEDIATE_REJECTION_CODES = [
  'INTENT_VALIDATION_FAILED',      // Schema violations
  'INTENT_PERMISSION_DENIED',      // Insufficient permissions
  'OVERLAY_MODAL_FORBIDDEN',       // Design principle violations
  'AI_EXTERNAL_LINK_CONSENT_REQUIRED', // Security policy violations
  'TENANT_BOUNDARY_VIOLATION',     // Multi-tenancy violations
  'UNSAFE_URL',                    // Security threats
  'UNSAFE_FILENAME'                // File system threats
]
```

### Conditional Rejection (Retry Possible)
```typescript
const CONDITIONAL_REJECTION_CODES = [
  'TABLE_NOT_FOUND',               // UI element not ready
  'ENTITY_NOT_FOUND',              // Data not loaded
  'INTENT_CONFLICT',               // Resource conflicts
  'PANEL_ALREADY_OPEN',            // UI state conflicts
  'INTENT_RATE_LIMITED'            // Temporary rate limiting
]
```

### Automatic Retry Logic
```typescript
class IntentRetryManager {
  private readonly RETRY_DELAYS = [100, 250, 500, 1000, 2000] // Exponential backoff
  private readonly MAX_RETRIES = 5
  
  async handleRejection(intent: Intent, error: ValidationError): Promise<void> {
    if (IMMEDIATE_REJECTION_CODES.includes(error.code)) {
      throw error // No retry for security/validation failures
    }
    
    if (CONDITIONAL_REJECTION_CODES.includes(error.code)) {
      const attempt = intent.metadata?.retry_attempt || 0
      
      if (attempt < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAYS[attempt]
        setTimeout(() => {
          this.retryIntent({
            ...intent,
            metadata: {
              ...intent.metadata,
              retry_attempt: attempt + 1,
              previous_error: error.code
            }
          })
        }, delay)
      } else {
        throw new ValidationError('MAX_RETRIES_EXCEEDED', 
          `Intent failed after ${this.MAX_RETRIES} retries`)
      }
    }
  }
}
```

## 🔍 Validation Error Handling

### Error Classification
```typescript
interface ValidationError {
  code: string
  message: string
  field?: string
  severity: 'error' | 'warning' | 'info'
  recoverable: boolean
  suggested_action?: string
  context: {
    intent_id: string
    intent_type: string
    validation_stage: number
    timestamp: string
  }
}
```

### Error Recovery Strategies
```typescript
class ValidationErrorRecovery {
  async handleValidationError(intent: Intent, error: ValidationError): Promise<void> {
    switch (error.code) {
      case 'TABLE_NOT_FOUND':
        // Wait for table to load and retry
        await this.waitForTableLoad(intent.payload.table_id)
        return this.retryIntent(intent)
        
      case 'ENTITY_NOT_FOUND':
        // Trigger data refresh and retry
        await this.refreshEntityData(intent.payload.context.entity_id)
        return this.retryIntent(intent)
        
      case 'INTENT_CONFLICT':
        // Wait for conflicting intents to complete
        await this.waitForConflictResolution(intent)
        return this.retryIntent(intent)
        
      case 'PANEL_ALREADY_OPEN':
        // Close existing panel and retry
        await this.closePanelSafely(intent.payload.panel_id)
        return this.retryIntent(intent)
        
      default:
        throw error // Unrecoverable error
    }
  }
}
```

### Validation Performance Optimization
```typescript
class ValidationOptimizer {
  private validationCache: Map<string, ValidationResult> = new Map()
  private readonly CACHE_TTL = 5000 // 5 seconds
  
  async validateIntent(intent: Intent): Promise<ValidationResult> {
    const cacheKey = this.getCacheKey(intent)
    const cached = this.validationCache.get(cacheKey)
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached
    }
    
    const result = await this.performValidation(intent)
    this.validationCache.set(cacheKey, {
      ...result,
      timestamp: Date.now()
    })
    
    return result
  }
  
  private getCacheKey(intent: Intent): string {
    // Create cache key based on intent type and critical validation fields
    const criticalFields = this.extractCriticalFields(intent)
    return `${intent.type}:${JSON.stringify(criticalFields)}`
  }
}
```

This comprehensive validation system ensures that all Intent Bus operations are safe, consistent, and compliant with Thorbis business rules and security requirements while providing robust error handling and recovery mechanisms.
