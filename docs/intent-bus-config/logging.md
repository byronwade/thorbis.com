# Thorbis Intent Bus Logging System

Comprehensive logging, origin tracking, and replay capabilities for client-side UI intents with full audit trail and debugging support.

## 🎯 Logging Philosophy

The Intent Bus logging system provides:
- **Complete Traceability**: Every intent is logged with full context and execution details
- **Origin Attribution**: Clear distinction between AI, user, and system-initiated intents
- **Replay Capability**: Ability to reproduce intent sequences for debugging and testing
- **Performance Monitoring**: Detailed timing and performance metrics
- **Security Auditing**: Full audit trail for compliance and security analysis
- **Error Diagnostics**: Comprehensive error logging with recovery suggestions

## 📊 Log Structure & Schema

### Core Intent Log Entry
```typescript
interface IntentLogEntry {
  // Basic identification
  log_id: string                    // Unique log entry ID
  intent_id: string                 // Intent identifier from original intent
  correlation_id: string            // Groups related intents together
  sequence_number: number           // Order within correlation group
  
  // Timing information
  timestamp: string                 // ISO 8601 timestamp when intent was received
  execution_start: string           // When intent execution began
  execution_end?: string            // When intent execution completed
  duration_ms?: number              // Total execution time
  
  // Intent details
  intent_type: string               // NAVIGATE, SET_TABLE_STATE, etc.
  origin: 'AI' | 'USER' | 'SYSTEM'  // Source of the intent
  origin_details: OriginDetails     // Detailed origin information
  
  // Execution status
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'rejected'
  validation_result: ValidationResult
  execution_result?: ExecutionResult
  
  // Context and payload
  context: ExecutionContext         // UI state and environment when intent was processed
  payload: any                      // Intent payload (potentially sanitized)
  sanitized_fields?: string[]       // Fields that were sanitized for logging
  
  // Performance metrics
  performance: PerformanceMetrics   // Detailed performance information
  
  // Error information (if applicable)
  error?: ErrorDetails              // Error information if intent failed
  
  // Replay information
  replay_info: ReplayInfo           // Information needed to replay this intent
  
  // Security and compliance
  tenant_id: string                 // Tenant context
  user_id: string                   // User context
  session_id: string                // Session context
  ip_address?: string               // Client IP (if available)
  user_agent?: string               // Client user agent
}
```

### Origin Details Schema
```typescript
interface OriginDetails {
  origin: 'AI' | 'USER' | 'SYSTEM'
  
  // AI-specific details
  ai_context?: {
    model_name: string              // AI model that generated the intent
    conversation_id: string         // AI conversation context
    prompt_hash: string            // Hash of the prompt that led to this intent
    confidence_score: number       // AI confidence in this intent
    reasoning?: string             // AI reasoning for this intent (if available)
    tool_invocation_id?: string    // MCP tool invocation that generated this intent
  }
  
  // User-specific details
  user_context?: {
    interaction_type: 'click' | 'keyboard' | 'touch' | 'voice' | 'gesture'
    ui_element_id?: string         // ID of UI element that triggered intent
    ui_element_type?: string       // Type of UI element (button, link, etc.)
    keyboard_shortcut?: string     // Keyboard shortcut used (if applicable)
    gesture_type?: string          // Touch/gesture type (if applicable)
    accessibility_mode?: boolean   // Whether user is using accessibility features
  }
  
  // System-specific details
  system_context?: {
    trigger_type: 'scheduled' | 'event_driven' | 'startup' | 'cleanup' | 'health_check'
    system_event?: string          // System event that triggered this intent
    automated_process?: string     // Name of automated process
    health_check_type?: string     // Type of health check (if applicable)
  }
  
  // Common fields
  component_stack: string[]        // Stack of React components active when intent was created
  page_route: string              // Current page route
  referrer?: string               // Previous page or referrer
  viewport_size: {                // Client viewport information
    width: number
    height: number
  }
}
```

### Execution Context
```typescript
interface ExecutionContext {
  // UI State
  ui_state: {
    active_panels: string[]         // Currently open panels/modals
    table_states: Record<string, TableState> // State of all tables on page
    theme_settings: ThemeState      // Current theme configuration
    loading_states: Record<string, boolean> // Loading states for components
    form_states: Record<string, FormState> // Form validation states
  }
  
  // Data Context
  data_context: {
    loaded_entities: string[]       // Entities currently loaded in memory
    cached_data: string[]          // Data available in client cache
    pending_requests: string[]     // Outstanding API requests
    stale_data: string[]           // Data that needs refresh
  }
  
  // Performance Context
  performance_context: {
    memory_usage: number           // Current JavaScript memory usage
    dom_node_count: number         // Number of DOM nodes
    event_listeners: number        // Number of active event listeners
    pending_timers: number         // Number of pending timers/intervals
  }
  
  // Environment Context
  environment: {
    browser: string                // Browser name and version
    os: string                     // Operating system
    screen_size: { width: number; height: number }
    color_scheme: 'light' | 'dark' | 'auto'
    reduced_motion: boolean        // User motion preference
    high_contrast: boolean         // High contrast mode
    zoom_level: number            // Browser zoom level
  }
}
```

### Performance Metrics
```typescript
interface PerformanceMetrics {
  // Validation timing
  validation_duration_ms: number   // Time spent validating intent
  validation_stages: {
    schema_validation_ms: number
    business_logic_ms: number
    contextual_validation_ms: number
    security_validation_ms: number
  }
  
  // Execution timing
  execution_phases: {
    queue_wait_ms: number          // Time waiting in execution queue
    preparation_ms: number         // Time preparing for execution
    dom_manipulation_ms: number    // Time spent manipulating DOM
    state_update_ms: number        // Time updating application state
    cleanup_ms: number            // Time spent cleaning up
  }
  
  // Resource usage
  resource_impact: {
    dom_mutations: number          // Number of DOM mutations performed
    state_updates: number          // Number of state updates
    api_calls: number             // API calls triggered by intent
    storage_operations: number     // LocalStorage/SessionStorage operations
    memory_allocated: number       // Memory allocated during execution
  }
  
  // Browser performance
  browser_metrics: {
    layout_thrashing: number       // Number of layout recalculations triggered
    paint_operations: number       // Number of paint operations
    composite_layers: number       // Composite layer changes
    javascript_execution_time: number // JS execution time
  }
}
```

### Error Details Schema
```typescript
interface ErrorDetails {
  error_code: string                // Standardized error code
  error_message: string            // Human-readable error message
  error_type: 'validation' | 'execution' | 'system' | 'network'
  
  // Stack trace and debugging
  stack_trace?: string             // JavaScript stack trace
  component_stack: string[]        // React component stack
  error_boundary?: string          // Error boundary that caught the error
  
  // Error context
  validation_errors?: ValidationError[] // Specific validation failures
  execution_phase?: string         // Phase where error occurred
  retry_attempts: number           // Number of retry attempts made
  
  // Recovery information
  recoverable: boolean            // Whether error is recoverable
  recovery_suggestion?: string    // Suggested recovery action
  auto_recovery_attempted: boolean // Whether auto-recovery was attempted
  
  // Related information
  related_intents?: string[]      // Other intents that might be affected
  system_state_snapshot: any     // System state at time of error
}
```

## 🏷️ Origin Tagging System

### AI Origin Detection & Tagging
```typescript
class AIOriginTagger {
  tagAIIntent(intent: Intent, aiContext: AIContext): IntentLogEntry {
    return {
      ...this.createBaseLogEntry(intent),
      origin: 'AI',
      origin_details: {
        origin: 'AI',
        ai_context: {
          model_name: aiContext.model || 'claude-3-sonnet',
          conversation_id: aiContext.conversationId,
          prompt_hash: this.hashPrompt(aiContext.prompt),
          confidence_score: aiContext.confidence || 0.8,
          reasoning: this.sanitizeReasoning(aiContext.reasoning),
          tool_invocation_id: aiContext.toolInvocationId
        },
        component_stack: this.getCurrentComponentStack(),
        page_route: this.getCurrentRoute(),
        viewport_size: this.getViewportSize()
      }
    }
  }
  
  private hashPrompt(prompt: string): string {
    // Create reproducible hash of prompt for correlation
    return crypto.subtle.digest('SHA-256', 
      new TextEncoder().encode(prompt)
    ).then(hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16) // First 16 chars for brevity
    )
  }
  
  private sanitizeReasoning(reasoning?: string): string | undefined {
    if (!reasoning) return undefined
    
    // Remove PII and sensitive information from AI reasoning
    return reasoning
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')      // SSN
      .replace(/\b\d{16}\b/g, '[CARD]')                  // Credit card
      .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')   // Email
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')      // Phone
      .substring(0, 500) // Limit length
  }
}
```

### User Origin Detection & Tagging
```typescript
class UserOriginTagger {
  tagUserIntent(intent: Intent, userInteraction: UserInteraction): IntentLogEntry {
    return {
      ...this.createBaseLogEntry(intent),
      origin: 'USER',
      origin_details: {
        origin: 'USER',
        user_context: {
          interaction_type: userInteraction.type,
          ui_element_id: userInteraction.targetElement?.id,
          ui_element_type: userInteraction.targetElement?.tagName.toLowerCase(),
          keyboard_shortcut: userInteraction.keyboardShortcut,
          gesture_type: userInteraction.gestureType,
          accessibility_mode: this.detectAccessibilityMode()
        },
        component_stack: this.getCurrentComponentStack(),
        page_route: this.getCurrentRoute(),
        referrer: document.referrer,
        viewport_size: this.getViewportSize()
      }
    }
  }
  
  private detectAccessibilityMode(): boolean {
    // Detect if user is using accessibility features
    return !!(
      window.speechSynthesis?.speaking ||
      document.body.classList.contains('high-contrast') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      this.hasScreenReaderActive()
    )
  }
  
  private hasScreenReaderActive(): boolean {
    // Heuristics to detect screen reader usage
    return !!(
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      document.activeElement?.getAttribute('role') === 'region'
    )
  }
}
```

### System Origin Detection & Tagging
```typescript
class SystemOriginTagger {
  tagSystemIntent(intent: Intent, systemContext: SystemContext): IntentLogEntry {
    return {
      ...this.createBaseLogEntry(intent),
      origin: 'SYSTEM',
      origin_details: {
        origin: 'SYSTEM',
        system_context: {
          trigger_type: systemContext.triggerType,
          system_event: systemContext.event,
          automated_process: systemContext.processName,
          health_check_type: systemContext.healthCheckType
        },
        component_stack: this.getCurrentComponentStack(),
        page_route: this.getCurrentRoute(),
        viewport_size: this.getViewportSize()
      }
    }
  }
}
```

## 🔄 Replay System

### Intent Sequence Recording
```typescript
class IntentSequenceRecorder {
  private sequences: Map<string, IntentSequence> = new Map()
  
  recordIntent(logEntry: IntentLogEntry): void {
    const correlationId = logEntry.correlation_id
    let sequence = this.sequences.get(correlationId)
    
    if (!sequence) {
      sequence = {
        sequence_id: correlationId,
        started_at: logEntry.timestamp,
        intents: [],
        context_snapshots: [],
        completed: false
      }
      this.sequences.set(correlationId, sequence)
    }
    
    // Record intent with replay information
    sequence.intents.push({
      ...logEntry,
      replay_info: {
        sequence_position: sequence.intents.length,
        required_ui_state: this.captureRequiredUIState(logEntry),
        dependent_intents: this.findDependentIntents(logEntry),
        side_effects: this.captureSideEffects(logEntry)
      }
    })
    
    // Capture UI state snapshot before significant operations
    if (this.isSignificantOperation(logEntry)) {
      sequence.context_snapshots.push({
        timestamp: logEntry.timestamp,
        ui_state: this.captureUIStateSnapshot(),
        data_state: this.captureDataStateSnapshot(),
        position: sequence.intents.length - 1
      })
    }
  }
  
  private captureRequiredUIState(logEntry: IntentLogEntry): RequiredUIState {
    return {
      required_elements: this.extractRequiredElements(logEntry),
      required_data: this.extractRequiredData(logEntry),
      required_permissions: this.extractRequiredPermissions(logEntry),
      browser_requirements: this.extractBrowserRequirements(logEntry)
    }
  }
  
  private captureSideEffects(logEntry: IntentLogEntry): SideEffect[] {
    const sideEffects: SideEffect[] = []
    
    // DOM side effects
    if (logEntry.performance.resource_impact.dom_mutations > 0) {
      sideEffects.push({
        type: 'dom_mutation',
        description: `${logEntry.performance.resource_impact.dom_mutations} DOM mutations`,
        elements_affected: this.getAffectedElements(logEntry)
      })
    }
    
    // State side effects
    if (logEntry.performance.resource_impact.state_updates > 0) {
      sideEffects.push({
        type: 'state_update',
        description: `${logEntry.performance.resource_impact.state_updates} state updates`,
        state_keys: this.getAffectedStateKeys(logEntry)
      })
    }
    
    // API side effects
    if (logEntry.performance.resource_impact.api_calls > 0) {
      sideEffects.push({
        type: 'api_call',
        description: `${logEntry.performance.resource_impact.api_calls} API calls`,
        endpoints: this.getCalledEndpoints(logEntry)
      })
    }
    
    return sideEffects
  }
}
```

### Replay Engine
```typescript
class IntentReplayEngine {
  async replaySequence(
    sequenceId: string,
    options: ReplayOptions = {}
  ): Promise<ReplayResult> {
    const sequence = await this.loadSequence(sequenceId)
    if (!sequence) {
      throw new Error(`Sequence ${sequenceId} not found`)
    }
    
    const replaySession = this.createReplaySession(sequenceId, options)
    
    try {
      // Prepare environment for replay
      await this.prepareReplayEnvironment(sequence, options)
      
      // Replay each intent in order
      for (let i = 0; i < sequence.intents.length; i++) {
        const intent = sequence.intents[i]
        
        // Skip filtered intents
        if (options.filter && !options.filter(intent)) {
          continue
        }
        
        // Restore required UI state if needed
        if (options.restore_state) {
          await this.restoreUIState(sequence, i)
        }
        
        // Execute intent
        const result = await this.replayIntent(intent, replaySession)
        replaySession.results.push(result)
        
        // Handle replay failures
        if (!result.success && options.stop_on_failure) {
          break
        }
        
        // Add delay between intents if specified
        if (options.delay_between_intents) {
          await this.delay(options.delay_between_intents)
        }
      }
      
      return {
        sequence_id: sequenceId,
        success: replaySession.results.every(r => r.success),
        results: replaySession.results,
        duration_ms: Date.now() - replaySession.started_at,
        intents_replayed: replaySession.results.length
      }
      
    } catch (error) {
      return {
        sequence_id: sequenceId,
        success: false,
        error: error.message,
        results: replaySession.results,
        duration_ms: Date.now() - replaySession.started_at,
        intents_replayed: replaySession.results.length
      }
    }
  }
  
  private async replayIntent(
    originalIntent: IntentLogEntry,
    replaySession: ReplaySession
  ): Promise<IntentReplayResult> {
    const startTime = Date.now()
    
    try {
      // Create replay intent from original
      const replayIntent = this.createReplayIntent(originalIntent, replaySession)
      
      // Validate replay conditions
      const conditionsValid = await this.validateReplayConditions(
        originalIntent.replay_info.required_ui_state
      )
      
      if (!conditionsValid && !replaySession.options.force_execution) {
        return {
          intent_id: originalIntent.intent_id,
          success: false,
          error: 'Required UI conditions not met for replay',
          duration_ms: Date.now() - startTime
        }
      }
      
      // Execute the intent
      await this.intentBus.executeIntent(replayIntent)
      
      // Verify side effects if requested
      if (replaySession.options.verify_side_effects) {
        const sideEffectsMatch = await this.verifySideEffects(
          originalIntent.replay_info.side_effects
        )
        
        if (!sideEffectsMatch) {
          console.warn(`Side effects don't match for intent ${originalIntent.intent_id}`)
        }
      }
      
      return {
        intent_id: originalIntent.intent_id,
        success: true,
        duration_ms: Date.now() - startTime,
        side_effects_verified: replaySession.options.verify_side_effects
      }
      
    } catch (error) {
      return {
        intent_id: originalIntent.intent_id,
        success: false,
        error: error.message,
        duration_ms: Date.now() - startTime
      }
    }
  }
}
```

### Replay Configuration
```typescript
interface ReplayOptions {
  // Execution options
  restore_state: boolean            // Whether to restore UI state between intents
  delay_between_intents?: number    // Delay in ms between intents
  stop_on_failure: boolean         // Whether to stop on first failure
  force_execution: boolean         // Execute even if conditions not met
  
  // Verification options
  verify_side_effects: boolean     // Verify side effects match original
  compare_performance: boolean     // Compare performance metrics
  
  // Filtering options
  filter?: (intent: IntentLogEntry) => boolean // Filter which intents to replay
  intent_types?: string[]          // Only replay specific intent types
  origin_types?: ('AI' | 'USER' | 'SYSTEM')[] // Only replay from specific origins
  
  // Environment options
  mock_api_calls: boolean          // Mock API calls instead of making real ones
  mock_external_services: boolean  // Mock external service interactions
  simulate_network_conditions?: NetworkCondition // Simulate network conditions
  
  // Debugging options
  verbose_logging: boolean         // Enable detailed logging during replay
  step_by_step: boolean           // Pause between each intent for inspection
  capture_screenshots: boolean    // Capture screenshots during replay
}
```

## 📋 Log Storage & Retrieval

### Log Persistence Strategy
```typescript
class IntentLogStorage {
  private indexedDB: IDBDatabase
  private compressionWorker: Worker
  
  async storeLogEntry(entry: IntentLogEntry): Promise<void> {
    // Compress large payloads
    const compressed = await this.compressLogEntry(entry)
    
    // Store in IndexedDB for client-side access
    await this.storeInIndexedDB(compressed)
    
    // Send to server for persistent storage (async)
    this.sendToServer(compressed).catch(error => {
      console.warn('Failed to send log to server:', error)
      // Store in pending queue for retry
      this.queueForRetry(compressed)
    })
  }
  
  async queryLogs(query: LogQuery): Promise<IntentLogEntry[]> {
    // First check IndexedDB for recent logs
    const localResults = await this.queryIndexedDB(query)
    
    // If query needs older data, fetch from server
    if (query.include_historical) {
      const serverResults = await this.queryServer(query)
      return this.mergeLogs(localResults, serverResults)
    }
    
    return localResults
  }
  
  private async compressLogEntry(entry: IntentLogEntry): Promise<CompressedLogEntry> {
    return new Promise((resolve) => {
      this.compressionWorker.postMessage({
        action: 'compress',
        data: entry
      })
      
      this.compressionWorker.onmessage = (event) => {
        if (event.data.action === 'compressed') {
          resolve(event.data.result)
        }
      }
    })
  }
}
```

### Log Query Interface
```typescript
interface LogQuery {
  // Time range
  start_time?: string              // ISO 8601 start time
  end_time?: string                // ISO 8601 end time
  last_n_hours?: number           // Alternative to explicit time range
  
  // Filtering
  intent_types?: string[]         // Filter by intent type
  origins?: ('AI' | 'USER' | 'SYSTEM')[] // Filter by origin
  correlation_ids?: string[]      // Filter by correlation ID
  user_ids?: string[]            // Filter by user
  tenant_ids?: string[]          // Filter by tenant
  
  // Status filtering
  statuses?: ('pending' | 'executing' | 'completed' | 'failed' | 'rejected')[]
  errors_only?: boolean          // Only failed intents
  
  // Performance filtering
  min_duration_ms?: number       // Minimum execution time
  max_duration_ms?: number       // Maximum execution time
  
  // Content filtering
  contains_text?: string         // Search in error messages or payloads
  regex_pattern?: string         // Regex search in logs
  
  // Result options
  limit?: number                 // Maximum results to return
  offset?: number                // Pagination offset
  sort_by?: 'timestamp' | 'duration' | 'intent_type'
  sort_order?: 'asc' | 'desc'
  include_payloads?: boolean     // Include full intent payloads
  include_performance?: boolean   // Include performance metrics
  include_historical?: boolean    // Include server-stored logs
}
```

## 🔍 Debug & Troubleshooting Tools

### Intent Flow Visualizer
```typescript
class IntentFlowVisualizer {
  generateFlowDiagram(correlationId: string): FlowDiagram {
    const sequence = this.getIntentSequence(correlationId)
    const nodes = sequence.intents.map(intent => ({
      id: intent.intent_id,
      type: intent.intent_type,
      status: intent.status,
      origin: intent.origin,
      duration: intent.duration_ms,
      errors: intent.error ? [intent.error] : []
    }))
    
    const edges = this.calculateIntentDependencies(sequence)
    
    return {
      nodes,
      edges,
      timeline: this.generateTimeline(sequence),
      performance_summary: this.summarizePerformance(sequence),
      error_summary: this.summarizeErrors(sequence)
    }
  }
  
  generatePerformanceReport(query: LogQuery): PerformanceReport {
    const logs = this.queryLogs(query)
    
    return {
      total_intents: logs.length,
      average_duration: this.calculateAverageDuration(logs),
      percentiles: this.calculatePercentiles(logs),
      slowest_intents: this.findSlowestIntents(logs, 10),
      error_rate: this.calculateErrorRate(logs),
      origin_breakdown: this.breakdownByOrigin(logs),
      intent_type_breakdown: this.breakdownByType(logs)
    }
  }
}
```

### Real-time Monitoring Dashboard
```typescript
class IntentMonitoringDashboard {
  private eventSource: EventSource
  private metrics: Map<string, MetricValue> = new Map()
  
  startMonitoring(): void {
    // Real-time intent stream
    this.eventSource = new EventSource('/api/intent-stream')
    this.eventSource.onmessage = (event) => {
      const logEntry: IntentLogEntry = JSON.parse(event.data)
      this.updateDashboard(logEntry)
    }
    
    // Performance metrics collection
    setInterval(() => {
      this.collectPerformanceMetrics()
    }, 1000)
  }
  
  private updateDashboard(logEntry: IntentLogEntry): void {
    // Update real-time counters
    this.incrementCounter(`intents.${logEntry.intent_type}`)
    this.incrementCounter(`origins.${logEntry.origin}`)
    
    // Update error rates
    if (logEntry.status === 'failed') {
      this.incrementCounter('errors.total')
      this.incrementCounter(`errors.${logEntry.error?.error_code}`)
    }
    
    // Update performance metrics
    if (logEntry.duration_ms) {
      this.updateHistogram('intent.duration', logEntry.duration_ms)
    }
    
    // Update UI
    this.renderDashboard()
  }
}
```

### Automated Issue Detection
```typescript
class IntentIssueDetector {
  private detectionRules: IssueDetectionRule[] = [
    {
      name: 'High Error Rate',
      condition: (logs) => this.calculateErrorRate(logs) > 0.1,
      severity: 'high',
      description: 'Error rate exceeds 10% over last 5 minutes'
    },
    {
      name: 'Slow Intent Execution',
      condition: (logs) => this.getAverageDuration(logs) > 1000,
      severity: 'medium',
      description: 'Average intent execution time exceeds 1 second'
    },
    {
      name: 'AI Intent Failures',
      condition: (logs) => this.getAIErrorRate(logs) > 0.05,
      severity: 'medium',
      description: 'AI-generated intents failing at higher than normal rate'
    },
    {
      name: 'Stuck Intent Queue',
      condition: (logs) => this.hasStuckIntents(logs),
      severity: 'critical',
      description: 'Intents stuck in pending state for extended period'
    }
  ]
  
  async runDetection(): Promise<DetectedIssue[]> {
    const recentLogs = await this.getRecentLogs(5 * 60 * 1000) // Last 5 minutes
    const issues: DetectedIssue[] = []
    
    for (const rule of this.detectionRules) {
      if (rule.condition(recentLogs)) {
        issues.push({
          rule_name: rule.name,
          severity: rule.severity,
          description: rule.description,
          detected_at: new Date().toISOString(),
          affected_intents: this.getAffectedIntents(rule, recentLogs),
          suggested_actions: this.getSuggestedActions(rule, recentLogs)
        })
      }
    }
    
    return issues
  }
}
```

This comprehensive logging system provides complete traceability, origin attribution, and replay capabilities for the Thorbis Intent Bus, enabling robust debugging, performance monitoring, and compliance auditing.
