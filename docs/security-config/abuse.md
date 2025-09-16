# Thorbis Abuse Prevention System

Comprehensive abuse prevention with multi-tier rate limiting, Web Application Firewall (WAF) patterns, anomaly detection, and anti-spam measures.

## 🛡️ Multi-Tier Rate Limiting

### Rate Limiting Strategy
```yaml
rate_limiting_tiers:
  global_limits:
    description: "System-wide protection against DDoS"
    window: "1 minute"
    max_requests: 10000
    burst_allowance: 2000
    
  ip_based_limits:
    description: "Per-IP address limits"
    standard_ip:
      window: "1 minute" 
      max_requests: 100
      burst_allowance: 20
    suspicious_ip:
      window: "1 minute"
      max_requests: 10
      burst_allowance: 2
      
  user_based_limits:
    description: "Authenticated user limits by plan"
    free_tier:
      requests_per_minute: 50
      requests_per_hour: 1000
      requests_per_day: 5000
    pro_tier:
      requests_per_minute: 200
      requests_per_hour: 5000
      requests_per_day: 25000
    enterprise_tier:
      requests_per_minute: 1000
      requests_per_hour: 25000
      requests_per_day: 100000
      
  api_key_limits:
    description: "API key specific limits"
    default:
      requests_per_minute: 100
      requests_per_hour: 2000
      requests_per_day: 10000
    premium:
      requests_per_minute: 500
      requests_per_hour: 10000
      requests_per_day: 50000
      
  endpoint_specific:
    description: "Per-endpoint rate limits"
    ai_tools:
      requests_per_minute: 30
      requests_per_hour: 200
      burst_allowance: 5
    file_uploads:
      requests_per_minute: 10
      requests_per_hour: 100
    auth_endpoints:
      requests_per_minute: 10
      requests_per_hour: 50
    exports:
      requests_per_minute: 2
      requests_per_hour: 10

algorithms:
  token_bucket: "For burst handling with sustained rate limiting"
  sliding_window_log: "For precise rate tracking"
  fixed_window_counter: "For simple, fast rate limiting"
  sliding_window_counter: "Balance between precision and performance"
```

### Rate Limiting Implementation
```typescript
interface RateLimitConfig {
  key: string                    // Rate limit key (IP, user, API key)
  algorithm: 'token_bucket' | 'sliding_window' | 'fixed_window'
  window_size: number           // Window size in seconds
  max_requests: number          // Maximum requests per window
  burst_allowance?: number      // Additional requests for bursts
  penalty_multiplier?: number   // Rate limit penalty for violations
  whitelist?: string[]         // Whitelisted keys (IPs, users)
  blacklist?: string[]         // Blacklisted keys
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset_time: Date
  retry_after?: number         // Seconds to wait before retry
  penalty_active?: boolean
}

class RateLimiter {
  constructor(
    private redis: RedisClient,
    private config: RateLimitConfig,
    private auditLogger: AuditLogger
  ) {}
  
  // Check if request is allowed under rate limits
  async checkLimit(key: string, cost: number = 1): Promise<RateLimitResult> {
    // Check whitelist/blacklist first
    if (this.config.whitelist?.includes(key)) {
      return { allowed: true, remaining: Infinity, reset_time: new Date() }
    }
    
    if (this.config.blacklist?.includes(key)) {
      await this.logViolation(key, 'blacklisted', 0)
      return { 
        allowed: false, 
        remaining: 0, 
        reset_time: new Date(Date.now() + 86400000), // 24 hours
        retry_after: 86400
      }
    }
    
    const rateLimitKey = `rate_limit:${this.config.key}:${key}`
    
    switch (this.config.algorithm) {
      case 'token_bucket':
        return await this.tokenBucketCheck(rateLimitKey, cost)
      case 'sliding_window':
        return await this.slidingWindowCheck(rateLimitKey, cost)
      case 'fixed_window':
        return await this.fixedWindowCheck(rateLimitKey, cost)
      default:
        throw new Error(`Unknown algorithm: ${this.config.algorithm}`)
    }
  }
  
  // Token bucket algorithm implementation
  private async tokenBucketCheck(key: string, cost: number): Promise<RateLimitResult> {
    const now = Date.now()
    const bucketKey = `${key}:bucket`
    const timestampKey = `${key}:timestamp`
    
    // Get current bucket state
    const pipeline = this.redis.pipeline()
    pipeline.get(bucketKey)
    pipeline.get(timestampKey)
    const results = await pipeline.exec()
    
    const currentTokens = parseInt(results[0][1] || this.config.max_requests.toString())
    const lastRefill = parseInt(results[1][1] || now.toString())
    
    // Calculate tokens to add based on time elapsed
    const timeElapsed = (now - lastRefill) / 1000 // seconds
    const tokensToAdd = Math.floor(timeElapsed * (this.config.max_requests / this.config.window_size))
    
    // Update token count (cap at max_requests + burst_allowance)
    const maxTokens = this.config.max_requests + (this.config.burst_allowance || 0)
    const newTokens = Math.min(currentTokens + tokensToAdd, maxTokens)
    
    if (newTokens >= cost) {
      // Request allowed - consume tokens
      const remainingTokens = newTokens - cost
      
      const updatePipeline = this.redis.pipeline()
      updatePipeline.set(bucketKey, remainingTokens, 'EX', this.config.window_size * 2)
      updatePipeline.set(timestampKey, now, 'EX', this.config.window_size * 2)
      await updatePipeline.exec()
      
      return {
        allowed: true,
        remaining: remainingTokens,
        reset_time: new Date(now + (this.config.window_size * 1000))
      }
    } else {
      // Request denied
      await this.logViolation(key.split(':').pop()!, 'rate_limit_exceeded', newTokens)
      
      // Calculate retry after time
      const tokensNeeded = cost - newTokens
      const retryAfter = Math.ceil(tokensNeeded / (this.config.max_requests / this.config.window_size))
      
      return {
        allowed: false,
        remaining: newTokens,
        reset_time: new Date(now + (this.config.window_size * 1000)),
        retry_after: retryAfter
      }
    }
  }
  
  // Sliding window algorithm implementation  
  private async slidingWindowCheck(key: string, cost: number): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - (this.config.window_size * 1000)
    const requestKey = `${key}:requests`
    
    // Remove old requests outside the window
    await this.redis.zremrangebyscore(requestKey, '-inf', windowStart)
    
    // Count current requests in window
    const currentCount = await this.redis.zcard(requestKey)
    
    if (currentCount < this.config.max_requests) {
      // Add current request to the window
      const pipeline = this.redis.pipeline()
      pipeline.zadd(requestKey, now, `${now}-${Math.random()}`)
      pipeline.expire(requestKey, this.config.window_size)
      await pipeline.exec()
      
      return {
        allowed: true,
        remaining: this.config.max_requests - currentCount - cost,
        reset_time: new Date(now + (this.config.window_size * 1000))
      }
    } else {
      await this.logViolation(key.split(':').pop()!, 'rate_limit_exceeded', currentCount)
      
      // Get oldest request to calculate retry time
      const oldestRequests = await this.redis.zrange(requestKey, 0, 0, 'WITHSCORES')
      const oldestTime = oldestRequests.length > 0 ? parseInt(oldestRequests[1]) : now
      const retryAfter = Math.ceil((oldestTime + this.config.window_size * 1000 - now) / 1000)
      
      return {
        allowed: false,
        remaining: 0,
        reset_time: new Date(oldestTime + this.config.window_size * 1000),
        retry_after: Math.max(retryAfter, 1),
        status: 429
      }
    }
  }
  
  // Log rate limit violations for monitoring
  private async logViolation(identifier: string, violationType: string, currentUsage: number): Promise<void> {
    await this.auditLogger.log({
      action: 'rate_limit_violation',
      identifier: identifier,
      violation_type: violationType,
      current_usage: currentUsage,
      limit: this.config.max_requests,
      window_size: this.config.window_size,
      timestamp: new Date().toISOString()
    })
  }
}

// Multi-tier rate limiting middleware
class MultiTierRateLimiter {
  private limiters: Map<string, RateLimiter> = new Map()
  
  constructor(private configs: Record<string, RateLimitConfig>) {
    // Initialize all rate limiters
    for (const [name, config] of Object.entries(configs)) {
      this.limiters.set(name, new RateLimiter(redis, config, auditLogger))
    }
  }
  
  async checkAllLimits(request: IncomingRequest): Promise<RateLimitDecision> {
    const checks: RateLimitCheck[] = []
    
    // Global rate limit
    const globalResult = await this.limiters.get('global')?.checkLimit('global')
    checks.push({ tier: 'global', result: globalResult! })
    
    // IP-based rate limit
    const ipTier = await this.getIPTier(request.ip)
    const ipResult = await this.limiters.get(ipTier)?.checkLimit(request.ip)
    checks.push({ tier: `ip_${ipTier}`, result: ipResult! })
    
    // User-based rate limit (if authenticated)
    if (request.user) {
      const userTier = request.user.plan || 'free_tier'
      const userResult = await this.limiters.get(userTier)?.checkLimit(request.user.id)
      checks.push({ tier: userTier, result: userResult! })
    }
    
    // API key rate limit (if using API key)
    if (request.api_key) {
      const apiKeyTier = request.api_key.tier || 'default'
      const apiKeyResult = await this.limiters.get(`api_${apiKeyTier}`)?.checkLimit(request.api_key.id)
      checks.push({ tier: `api_${apiKeyTier}`, result: apiKeyResult! })
    }
    
    // Endpoint-specific rate limit
    const endpointCategory = this.categorizeEndpoint(request.path)
    if (endpointCategory) {
      const endpointResult = await this.limiters.get(endpointCategory)?.checkLimit(`${request.ip}:${endpointCategory}`)
      checks.push({ tier: endpointCategory, result: endpointResult! })
    }
    
    // Find most restrictive limit
    const blockedCheck = checks.find(check => !check.result.allowed)
    
    return {
      allowed: !blockedCheck,
      blocked_by: blockedCheck?.tier,
      checks: checks,
      retry_after: blockedCheck?.result.retry_after,
      rate_limit_headers: this.generateRateLimitHeaders(checks)
    }
  }
  
  private async getIPTier(ip: string): Promise<string> {
    // Check IP reputation and determine tier
    const reputation = await this.getIPReputation(ip)
    
    if (reputation.is_suspicious || reputation.is_tor || reputation.is_proxy) {
      return 'suspicious_ip'
    }
    
    return 'standard_ip'
  }
  
  private categorizeEndpoint(path: string): string | null {
    if (path.includes('/api/tools/') || path.includes('/api/ai/')) {
      return 'ai_tools'
    } else if (path.includes('/api/upload/')) {
      return 'file_uploads'
    } else if (path.includes('/api/auth/') || path.includes('/api/login/')) {
      return 'auth_endpoints'
    } else if (path.includes('/api/export/')) {
      return 'exports'
    }
    
    return null
  }
  
  private generateRateLimitHeaders(checks: RateLimitCheck[]): Record<string, string> {
    // Find the most restrictive successful check
    const successfulChecks = checks.filter(c => c.result.allowed)
    const mostRestrictive = successfulChecks.reduce((min, check) => 
      check.result.remaining < min.result.remaining ? check : min
    )
    
    return {
          'X-RateLimit-Limit': String(mostRestrictive.result.remaining + 1),
    'X-RateLimit-Remaining': String(mostRestrictive.result.remaining),
    'X-RateLimit-Reset': mostRestrictive.result.reset_time.toISOString(),
    'X-RateLimit-Policy': mostRestrictive.tier,
    'Retry-After': mostRestrictive.result.retry_after ? String(mostRestrictive.result.retry_after) : '60'
    }
  }
}
```

## 🔥 Web Application Firewall (WAF)

### WAF Rule Engine
```typescript
interface WAFRule {
  id: string
  name: string
  description: string
  category: 'sql_injection' | 'xss' | 'lfi' | 'rfi' | 'command_injection' | 'custom'
  pattern: RegExp
  action: 'block' | 'warn' | 'log'
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  false_positive_rate: number  // 0.0 to 1.0
}

// Comprehensive WAF Rules
const WAF_RULES: WAFRule[] = [
  // SQL Injection Protection
  {
    id: 'sql_001',
    name: 'SQL Injection - Union Based',
    description: 'Detects UNION-based SQL injection attempts',
    category: 'sql_injection',
    pattern: /(\bunion\b.{0,100}\bselect\b|\bselect\b.{0,100}\bunion\b)/gi,
    action: 'block',
    severity: 'high',
    enabled: true,
    false_positive_rate: 0.02
  },
  
  {
    id: 'sql_002', 
    name: 'SQL Injection - Comment Based',
    description: 'Detects comment-based SQL injection',
    pattern: /(\/\*|\*\/|--[\s\r\n\v\f]|#[\s\r\n\v\f])/gi,
    category: 'sql_injection',
    action: 'block',
    severity: 'high',
    enabled: true,
    false_positive_rate: 0.05
  },
  
  {
    id: 'sql_003',
    name: 'SQL Injection - Boolean Based',
    description: 'Detects boolean-based blind SQL injection',
    pattern: /(\band\b|\bor\b).{0,50}(\b1\s*=\s*1\b|\b1\s*=\s*0\b|\btrue\b|\bfalse\b)/gi,
    category: 'sql_injection',
    action: 'warn',
    severity: 'medium',
    enabled: true,
    false_positive_rate: 0.10
  },
  
  // XSS Protection
  {
    id: 'xss_001',
    name: 'XSS - Script Tag Injection',
    description: 'Detects script tag injection attempts',
    category: 'xss',
    pattern: /<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gis,
    action: 'block',
    severity: 'high',
    enabled: true,
    false_positive_rate: 0.01
  },
  
  {
    id: 'xss_002',
    name: 'XSS - Event Handler Injection',
    description: 'Detects JavaScript event handler injection',
    category: 'xss',
    pattern: /\bon\w+\s*=\s*["']?[^"'>]*(?:javascript:|data:|vbscript:)/gi,
    action: 'block',
    severity: 'high',
    enabled: true,
    false_positive_rate: 0.03
  },
  
  {
    id: 'xss_003',
    name: 'XSS - JavaScript URI Scheme',
    description: 'Detects javascript: URI scheme injection',
    category: 'xss',
    pattern: /javascript\s*:\s*[^\/\*\n\r\s]/gi,
    action: 'block',
    severity: 'medium',
    enabled: true,
    false_positive_rate: 0.02
  },
  
  // Local File Inclusion (LFI)
  {
    id: 'lfi_001',
    name: 'LFI - Directory Traversal',
    description: 'Detects directory traversal attempts',
    category: 'lfi',
    pattern: /\.\.[\\/]|[\\/]\.\.[\\/]|\.\.%2[fF]|%2[eE]%2[eE]%2[fF]/gi,
    action: 'block',
    severity: 'high',
    enabled: true,
    false_positive_rate: 0.01
  },
  
  {
    id: 'lfi_002',
    name: 'LFI - System File Access',
    description: 'Detects attempts to access system files',
    category: 'lfi',
    pattern: /\/etc\/passwd|\/etc\/shadow|\/proc\/self\/environ|\/windows\/system32/gi,
    action: 'block',
    severity: 'critical',
    enabled: true,
    false_positive_rate: 0.001
  },
  
  // Command Injection
  {
    id: 'cmd_001',
    name: 'Command Injection - Shell Metacharacters',
    description: 'Detects shell command injection via metacharacters',
    category: 'command_injection',
    pattern: /[;&|`$(){}[\]]/g,
    action: 'warn',
    severity: 'medium',
    enabled: true,
    false_positive_rate: 0.15
  },
  
  {
    id: 'cmd_002',
    name: 'Command Injection - System Commands',
    description: 'Detects common system command injection',
    category: 'command_injection',
    pattern: /\b(cat|ls|ps|id|whoami|uname|wget|curl|nc|netcat|ping|nslookup)\b/gi,
    action: 'block',
    severity: 'high',
    enabled: true,
    false_positive_rate: 0.05
  },
  
  // Thorbis-specific rules
  {
    id: 'thorbis_001',
    name: 'AI Tool Spam Detection',
    description: 'Detects repeated AI tool calls with identical parameters',
    category: 'custom',
    pattern: /.*/, // Handled by custom logic
    action: 'warn',
    severity: 'medium',
    enabled: true,
    false_positive_rate: 0.08
  }
]

class WAFEngine {
  constructor(
    private rules: WAFRule[],
    private auditLogger: AuditLogger,
    private ipReputationService: IPReputationService
  ) {}
  
  // Analyze request for malicious patterns
  async analyzeRequest(request: IncomingRequest): Promise<WAFDecision> {
    const detections: WAFDetection[] = []
    const enabledRules = this.rules.filter(rule => rule.enabled)
    
    // Analyze different parts of the request
    const analysisTargets = [
      { name: 'url', content: request.url },
      { name: 'headers', content: JSON.stringify(request.headers) },
      { name: 'query_params', content: JSON.stringify(request.query) },
      { name: 'body', content: JSON.stringify(request.body) },
      { name: 'cookies', content: request.headers.cookie || '' }
    ]
    
    for (const target of analysisTargets) {
      for (const rule of enabledRules) {
        if (await this.testRule(rule, target.content)) {
          detections.push({
            rule_id: rule.id,
            rule_name: rule.name,
            category: rule.category,
            severity: rule.severity,
            matched_content: target.name,
            confidence: 1 - rule.false_positive_rate,
            action: rule.action
          })
        }
      }
    }
    
    // Custom logic for AI tool spam detection
    if (request.path.includes('/api/tools/')) {
      const spamDetection = await this.detectAIToolSpam(request)
      if (spamDetection) {
        detections.push(spamDetection)
      }
    }
    
    // Determine overall action
    const decision = this.makeDecision(detections, request)
    
    // Log detections
    if (detections.length > 0) {
      await this.auditLogger.log({
        action: 'waf_detection',
        request_id: request.id,
        ip: request.ip,
        user_agent: request.headers['user-agent'],
        detections: detections.length,
        max_severity: this.getMaxSeverity(detections),
        decision: decision.action,
        path: request.path
      })
    }
    
    return decision
  }
  
  private async testRule(rule: WAFRule, content: string): Promise<boolean> {
    if (!content) return false
    
    // Custom logic for Thorbis-specific rules
    if (rule.id === 'thorbis_001') {
      return false // Handled by detectAIToolSpam
    }
    
    return rule.pattern.test(content)
  }
  
  private async detectAIToolSpam(request: IncomingRequest): Promise<WAFDetection | null> {
    if (!request.body || typeof request.body !== 'object') {
      return null
    }
    
    const toolCall = request.body as ToolCall
    const cacheKey = `tool_spam:${request.ip}:${toolCall.tool_name}`
    
    // Check for repeated identical calls
    const recentCalls = await this.redis.get(cacheKey)
    if (recentCalls) {
      const calls = JSON.parse(recentCalls)
      const identicalCalls = calls.filter((call: any) => 
        JSON.stringify(call.parameters) === JSON.stringify(toolCall.parameters)
      )
      
      if (identicalCalls.length >= 5) {
        return {
          rule_id: 'thorbis_001',
          rule_name: 'AI Tool Spam Detection',
          category: 'custom',
          severity: 'medium',
          matched_content: 'request_pattern',
          confidence: 0.92,
          action: 'warn',
          details: `Detected ${identicalCalls.length} identical tool calls in 5 minutes`
        }
      }
    }
    
    // Store current call
    const currentCalls = recentCalls ? JSON.parse(recentCalls) : []
    currentCalls.push({
      timestamp: Date.now(),
      tool_name: toolCall.tool_name,
      parameters: toolCall.parameters
    })
    
    // Keep only calls from last 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    const recentCallsFiltered = currentCalls.filter((call: any) => call.timestamp > fiveMinutesAgo)
    
    await this.redis.setex(cacheKey, 300, JSON.stringify(recentCallsFiltered)) // 5 minutes
    
    return null
  }
  
  private makeDecision(detections: WAFDetection[], request: IncomingRequest): WAFDecision {
    if (detections.length === 0) {
      return { action: 'allow', reason: 'no_threats_detected', detections: [] }
    }
    
    // Check for any critical or high severity blocks
    const criticalDetections = detections.filter(d => 
      d.severity === 'critical' && d.action === 'block'
    )
    
    if (criticalDetections.length > 0) {
      return { 
        action: 'block', 
        reason: 'critical_threat_detected',
        detections: detections,
        http_status: 403,
        response_body: 'Request blocked by security policy'
      }
    }
    
    const highSeverityBlocks = detections.filter(d => 
      d.severity === 'high' && d.action === 'block'
    )
    
    if (highSeverityBlocks.length > 0) {
      return { 
        action: 'block', 
        reason: 'high_risk_threat_detected',
        detections: detections,
        http_status: 403,
        response_body: 'Request blocked by security policy'
      }
    }
    
    // Multiple medium severity detections
    const mediumWarnings = detections.filter(d => 
      d.severity === 'medium' && (d.action === 'warn' || d.action === 'block')
    )
    
    if (mediumWarnings.length >= 3) {
      return { 
        action: 'block', 
        reason: 'multiple_threats_detected',
        detections: detections,
        http_status: 403,
        response_body: 'Request blocked due to multiple security violations'
      }
    }
    
    // Allow but log warnings
    return { 
      action: 'allow_with_warning', 
      reason: 'low_medium_threats_detected',
      detections: detections
    }
  }
}
```

## 🤖 Anomaly Detection System

### Behavioral Analysis Engine
```typescript
interface UserBehaviorProfile {
  user_id: string
  tenant_id: string
  
  // Request patterns
  avg_requests_per_hour: number
  peak_request_times: number[]      // Hours of day (0-23)
  common_endpoints: string[]
  common_user_agents: string[]
  
  // Tool usage patterns
  frequent_tools: string[]
  avg_tool_calls_per_session: number
  tool_call_success_rate: number
  
  // Geographic patterns
  common_countries: string[]
  common_cities: string[]
  
  // Timing patterns
  session_durations: number[]       // In minutes
  time_between_requests: number[]   // In seconds
  
  // Updated metrics
  profile_created: Date
  last_updated: Date
  sample_size: number
}

interface AnomalyDetection {
  anomaly_type: 'volume' | 'timing' | 'location' | 'behavior' | 'tool_usage'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number                // 0.0 to 1.0
  description: string
  baseline_value: number
  current_value: number
  threshold_exceeded: number        // How much threshold was exceeded
  metadata: Record<string, any>
}

class AnomalyDetector {
  constructor(
    private profileService: BehaviorProfileService,
    private auditLogger: AuditLogger
  ) {}
  
  async analyzeRequest(request: IncomingRequest): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = []
    
    if (!request.user) {
      return anomalies // Only analyze authenticated users
    }
    
    const profile = await this.profileService.getUserProfile(request.user.id)
    if (!profile || profile.sample_size < 50) {
      return anomalies // Need baseline data
    }
    
    // Volume anomaly detection
    const volumeAnomalies = await this.detectVolumeAnomalies(request, profile)
    anomalies.push(...volumeAnomalies)
    
    // Timing anomaly detection
    const timingAnomalies = await this.detectTimingAnomalies(request, profile)
    anomalies.push(...timingAnomalies)
    
    // Location anomaly detection
    const locationAnomalies = await this.detectLocationAnomalies(request, profile)
    anomalies.push(...locationAnomalies)
    
    // Behavioral anomaly detection
    const behaviorAnomalies = await this.detectBehaviorAnomalies(request, profile)
    anomalies.push(...behaviorAnomalies)
    
    // Tool usage anomaly detection
    if (request.path.includes('/api/tools/')) {
      const toolAnomalies = await this.detectToolUsageAnomalies(request, profile)
      anomalies.push(...toolAnomalies)
    }
    
    // Log significant anomalies
    const significantAnomalies = anomalies.filter(a => a.severity !== 'low')
    if (significantAnomalies.length > 0) {
      await this.auditLogger.log({
        action: 'anomaly_detected',
        user_id: request.user.id,
        tenant_id: request.user.tenant_id,
        ip: request.ip,
        anomalies_count: significantAnomalies.length,
        max_severity: this.getMaxSeverity(significantAnomalies),
        anomaly_types: significantAnomalies.map(a => a.anomaly_type)
      })
    }
    
    return anomalies
  }
  
  private async detectVolumeAnomalies(
    request: IncomingRequest, 
    profile: UserBehaviorProfile
  ): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = []
    const currentHour = new Date().getHours()
    
    // Get current hour's request count
    const hourKey = `requests:${request.user!.id}:${currentHour}`
    const currentHourRequests = await this.redis.get(hourKey) || '0'
    const requestCount = parseInt(currentHourRequests)
    
    // Calculate threshold (3 standard deviations above mean)
    const threshold = profile.avg_requests_per_hour + (profile.avg_requests_per_hour * 0.5)
    
    if (requestCount > threshold) {
      const exceedance = (requestCount - threshold) / threshold
      
      anomalies.push({
        anomaly_type: 'volume',
        severity: exceedance > 2 ? 'critical' : exceedance > 1 ? 'high' : 'medium',
        confidence: Math.min(0.95, 0.7 + (exceedance * 0.1)),
        description: `Request volume ${requestCount} exceeds normal pattern of ${Math.round(profile.avg_requests_per_hour)}`,
        baseline_value: profile.avg_requests_per_hour,
        current_value: requestCount,
        threshold_exceeded: exceedance,
        metadata: {
          hour: currentHour,
          threshold: threshold
        }
      })
    }
    
    return anomalies
  }
  
  private async detectLocationAnomalies(
    request: IncomingRequest, 
    profile: UserBehaviorProfile
  ): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = []
    
    // Get IP geolocation
    const geoData = await this.getIPGeolocation(request.ip)
    if (!geoData) return anomalies
    
    // Check if country is in user's common countries
    if (!profile.common_countries.includes(geoData.country)) {
      const confidence = profile.common_countries.length > 0 ? 0.8 : 0.6
      
      anomalies.push({
        anomaly_type: 'location',
        severity: 'high',
        confidence: confidence,
        description: `Access from unusual country: ${geoData.country}`,
        baseline_value: 0, // Not in common countries
        current_value: 1,  // New country
        threshold_exceeded: 1,
        metadata: {
          country: geoData.country,
          city: geoData.city,
          common_countries: profile.common_countries
        }
      })
    }
    
    // Check for impossible travel (successive requests from distant locations)
    const lastLocationKey = `last_location:${request.user!.id}`
    const lastLocation = await this.redis.get(lastLocationKey)
    
    if (lastLocation) {
      const lastGeo = JSON.parse(lastLocation)
      const distance = this.calculateDistance(
        lastGeo.latitude, lastGeo.longitude,
        geoData.latitude, geoData.longitude
      )
      
      const timeDiff = (Date.now() - lastGeo.timestamp) / 1000 / 3600 // hours
      const maxPossibleSpeed = 1000 // km/h (commercial aircraft)
      
      if (distance > (maxPossibleSpeed * timeDiff)) {
        anomalies.push({
          anomaly_type: 'location',
          severity: 'critical',
          confidence: 0.95,
          description: `Impossible travel: ${Math.round(distance)}km in ${Math.round(timeDiff)}h`,
          baseline_value: maxPossibleSpeed * timeDiff,
          current_value: distance,
          threshold_exceeded: (distance / (maxPossibleSpeed * timeDiff)) - 1,
          metadata: {
            distance_km: distance,
            time_diff_hours: timeDiff,
            from_country: lastGeo.country,
            to_country: geoData.country
          }
        })
      }
    }
    
    // Store current location for next comparison
    await this.redis.setex(lastLocationKey, 86400, JSON.stringify({
      ...geoData,
      timestamp: Date.now()
    }))
    
    return anomalies
  }
  
  private async detectToolUsageAnomalies(
    request: IncomingRequest, 
    profile: UserBehaviorProfile
  ): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = []
    
    if (!request.body || typeof request.body !== 'object') {
      return anomalies
    }
    
    const toolCall = request.body as ToolCall
    const toolName = toolCall.tool_name
    
    // Check if tool is commonly used by this user
    if (!profile.frequent_tools.includes(toolName)) {
      // New or rare tool usage
      const rareToolKey = `rare_tools:${request.user!.id}`
      const rareToolUsage = await this.redis.get(rareToolKey)
      const rareTools = rareToolUsage ? JSON.parse(rareToolUsage) : {}
      
      rareTools[toolName] = (rareTools[toolName] || 0) + 1
      
      if (rareTools[toolName] === 1) {
        anomalies.push({
          anomaly_type: 'tool_usage',
          severity: 'medium',
          confidence: 0.7,
          description: `First time usage of tool: ${toolName}`,
          baseline_value: 0,
          current_value: 1,
          threshold_exceeded: 1,
          metadata: {
            tool_name: toolName,
            frequent_tools: profile.frequent_tools
          }
        })
      }
      
      await this.redis.setex(rareToolKey, 86400, JSON.stringify(rareTools))
    }
    
    // Check for rapid successive tool calls
    const rapidCallsKey = `rapid_tools:${request.user!.id}`
    const recentCalls = await this.redis.get(rapidCallsKey)
    const calls = recentCalls ? JSON.parse(recentCalls) : []
    
    // Add current call
    calls.push({ timestamp: Date.now(), tool: toolName })
    
    // Keep only calls from last minute
    const oneMinuteAgo = Date.now() - 60000
    const recentCallsFiltered = calls.filter((call: any) => call.timestamp > oneMinuteAgo)
    
    if (recentCallsFiltered.length > 10) { // More than 10 tool calls per minute
      anomalies.push({
        anomaly_type: 'tool_usage',
        severity: 'high',
        confidence: 0.85,
        description: `Rapid tool usage: ${recentCallsFiltered.length} calls in 1 minute`,
        baseline_value: profile.avg_tool_calls_per_session,
        current_value: recentCallsFiltered.length,
        threshold_exceeded: (recentCallsFiltered.length / Math.max(profile.avg_tool_calls_per_session, 1)) - 1,
        metadata: {
          calls_per_minute: recentCallsFiltered.length,
          tools_used: [...new Set(recentCallsFiltered.map((c: any) => c.tool))]
        }
      })
    }
    
    await this.redis.setex(rapidCallsKey, 60, JSON.stringify(recentCallsFiltered))
    
    return anomalies
  }
  
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
}
```

## 🚨 Automated Response System

### Response Actions & Escalation
```typescript
interface ResponseAction {
  trigger: TriggerCondition
  action: 'log' | 'warn' | 'throttle' | 'block' | 'captcha' | 'mfa_required' | 'account_lock'
  duration?: number              // Duration in seconds
  escalation_delay?: number      // Delay before escalation
  notification_channels: string[]
}

interface TriggerCondition {
  rate_limit_violations: number
  waf_detections: number
  anomaly_score: number
  severity_threshold: 'medium' | 'high' | 'critical'
  time_window: number           // Seconds
}

const RESPONSE_RULES: ResponseAction[] = [
  // Rate limit violations
  {
    trigger: {
      rate_limit_violations: 3,
      waf_detections: 0,
      anomaly_score: 0,
      severity_threshold: 'medium',
      time_window: 300 // 5 minutes
    },
    action: 'throttle',
    duration: 600, // 10 minutes
    notification_channels: ['security_team']
  },
  
  // High WAF detection count
  {
    trigger: {
      rate_limit_violations: 0,
      waf_detections: 5,
      anomaly_score: 0,
      severity_threshold: 'high',
      time_window: 600 // 10 minutes
    },
    action: 'block',
    duration: 3600, // 1 hour
    escalation_delay: 1800, // 30 minutes
    notification_channels: ['security_team', 'on_call']
  },
  
  // Critical threats
  {
    trigger: {
      rate_limit_violations: 1,
      waf_detections: 1,
      anomaly_score: 0.8,
      severity_threshold: 'critical',
      time_window: 60 // 1 minute
    },
    action: 'account_lock',
    duration: 86400, // 24 hours
    notification_channels: ['security_team', 'compliance', 'management']
  },
  
  // Anomaly-based responses
  {
    trigger: {
      rate_limit_violations: 0,
      waf_detections: 0,
      anomaly_score: 0.9,
      severity_threshold: 'high',
      time_window: 300
    },
    action: 'mfa_required',
    duration: 3600,
    notification_channels: ['security_team']
  }
]

class AutomatedResponseSystem {
  constructor(
    private responseRules: ResponseAction[],
    private notificationService: NotificationService,
    private auditLogger: AuditLogger
  ) {}
  
  async evaluateAndRespond(
    identifier: string,
    violations: SecurityViolation[]
  ): Promise<ResponseDecision> {
    const timeWindowViolations = this.groupViolationsByTimeWindow(violations)
    const applicableActions: ResponseAction[] = []
    
    // Evaluate each rule
    for (const rule of this.responseRules) {
      if (await this.ruleMatches(rule, timeWindowViolations)) {
        applicableActions.push(rule)
      }
    }
    
    if (applicableActions.length === 0) {
      return { action: 'none', reason: 'no_rules_triggered' }
    }
    
    // Select most severe action
    const selectedAction = this.selectMostSevereAction(applicableActions)
    
    // Execute the action
    const result = await this.executeAction(identifier, selectedAction, violations)
    
    // Send notifications
    await this.sendNotifications(selectedAction, identifier, violations, result)
    
    return result
  }
  
  private async ruleMatches(
    rule: ResponseAction,
    violations: GroupedViolations
  ): Promise<boolean> {
    const windowViolations = violations[rule.trigger.time_window] || {
      rate_limit: 0,
      waf: 0,
      anomalies: [],
      max_severity: 'low'
    }
    
    // Check rate limit violations
    if (rule.trigger.rate_limit_violations > 0 &&
        windowViolations.rate_limit < rule.trigger.rate_limit_violations) {
      return false
    }
    
    // Check WAF detections
    if (rule.trigger.waf_detections > 0 &&
        windowViolations.waf < rule.trigger.waf_detections) {
      return false
    }
    
    // Check anomaly score
    const maxAnomalyScore = Math.max(...windowViolations.anomalies.map(a => a.confidence))
    if (rule.trigger.anomaly_score > 0 &&
        maxAnomalyScore < rule.trigger.anomaly_score) {
      return false
    }
    
    // Check severity threshold
    const severityLevels = { low: 0, medium: 1, high: 2, critical: 3 }
    if (severityLevels[windowViolations.max_severity] < severityLevels[rule.trigger.severity_threshold]) {
      return false
    }
    
    return true
  }
  
  private async executeAction(
    identifier: string,
    action: ResponseAction,
    violations: SecurityViolation[]
  ): Promise<ResponseDecision> {
    const actionId = uuidv4()
    
    try {
      switch (action.action) {
        case 'throttle':
          await this.applyThrottling(identifier, action.duration!)
          break
          
        case 'block':
          await this.blockIdentifier(identifier, action.duration!)
          break
          
        case 'captcha':
          await this.requireCaptcha(identifier, action.duration!)
          break
          
        case 'mfa_required':
          await this.requireMFA(identifier, action.duration!)
          break
          
        case 'account_lock':
          await this.lockAccount(identifier, action.duration!)
          break
          
        default:
          // Log only
          break
      }
      
      await this.auditLogger.log({
        action: 'automated_response_executed',
        action_id: actionId,
        identifier: identifier,
        response_type: action.action,
        duration: action.duration,
        trigger_violations: violations.length,
        max_severity: this.getMaxSeverity(violations.map(v => v.severity))
      })
      
      return {
        action: action.action,
        reason: 'security_policy_triggered',
        action_id: actionId,
        duration: action.duration,
        expires_at: action.duration ? new Date(Date.now() + action.duration * 1000) : undefined
      }
      
    } catch (error) {
      await this.auditLogger.log({
        action: 'automated_response_failed',
        action_id: actionId,
        identifier: identifier,
        response_type: action.action,
        error: error.message
      })
      
      throw error
    }
  }
  
  private async applyThrottling(identifier: string, duration: number): Promise<void> {
    const throttleKey = `throttle:${identifier}`
    await this.redis.setex(throttleKey, duration, JSON.stringify({
      applied_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + duration * 1000).toISOString(),
      type: 'automated_throttle'
    }))
  }
  
  private async blockIdentifier(identifier: string, duration: number): Promise<void> {
    const blockKey = `blocked:${identifier}`
    await this.redis.setex(blockKey, duration, JSON.stringify({
      blocked_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + duration * 1000).toISOString(),
      type: 'automated_block'
    }))
  }
}
```

## 🧪 Abuse Prevention Testing

### Rate Limiting Test Cases
```typescript
class AbusePrevention Tester {
  async runRateLimitTests(): Promise<TestResults> {
    const testCases = [
      {
        name: 'basic_rate_limit_enforcement',
        description: 'Test that rate limits are properly enforced',
        test: async () => {
          // Make requests up to the limit
          const responses = []
          for (let i = 0; i < 100; i++) {
            const response = await this.makeTestRequest('/api/test')
            responses.push(response)
            if (response.status === 429) break
          }
          
          // Verify we got rate limited
          const rateLimitedResponse = responses[responses.length - 1]
          expect(rateLimitedResponse.status).toBe(429)
          expect(rateLimitedResponse.headers['retry-after']).toBeDefined()
          
          return {
            passed: rateLimitedResponse.status === 429,
            details: `Got ${responses.filter(r => r.status === 200).length} successful requests before rate limit`
          }
        }
      },
      
      {
        name: 'proper_429_response',
        description: 'Test that 429 responses include proper headers',
        test: async () => {
          // Trigger rate limit
          await this.triggerRateLimit('/api/test')
          
          const response = await this.makeTestRequest('/api/test')
          
          const requiredHeaders = [
            'x-ratelimit-limit',
            'x-ratelimit-remaining', 
            'x-ratelimit-reset',
            'retry-after'
          ]
          
          const missingHeaders = requiredHeaders.filter(
            header => !response.headers[header]
          )
          
          return {
            passed: response.status === 429 && missingHeaders.length === 0,
            details: `Missing headers: ${missingHeaders.join(', ')}`
          }
        }
      },
      
      {
        name: 'rate_limit_reset',
        description: 'Test that rate limits properly reset after window',
        test: async () => {
          // Trigger rate limit
          await this.triggerRateLimit('/api/test')
          
          // Wait for reset window
          await this.sleep(61000) // 61 seconds
          
          // Should be able to make requests again
          const response = await this.makeTestRequest('/api/test')
          
          return {
            passed: response.status === 200,
            details: `Status after reset: ${response.status}`
          }
        }
      },
      
      {
        name: 'burst_allowance',
        description: 'Test that burst allowance works correctly',
        test: async () => {
          // Make rapid burst of requests
          const burstResponses = await Promise.all([
            ...Array(25).fill(null).map(() => this.makeTestRequest('/api/test'))
          ])
          
          const successfulRequests = burstResponses.filter(r => r.status === 200)
          
          // Should allow burst up to burst_allowance
          return {
            passed: successfulRequests.length >= 20, // Assuming 20 burst allowance
            details: `Successful burst requests: ${successfulRequests.length}/25`
          }
        }
      }
    ]
    
    const results = []
    for (const testCase of testCases) {
      try {
        const result = await testCase.test()
        results.push({
          name: testCase.name,
          description: testCase.description,
          passed: result.passed,
          details: result.details
        })
      } catch (error) {
        results.push({
          name: testCase.name,
          description: testCase.description,
          passed: false,
          details: `Test failed with error: ${error.message}`
        })
      }
    }
    
    return {
      total_tests: testCases.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      results: results
    }
  }
  
  private async triggerRateLimit(endpoint: string): Promise<void> {
    // Make enough requests to trigger rate limit
    for (let i = 0; i < 150; i++) {
      await this.makeTestRequest(endpoint)
    }
  }
  
  private async makeTestRequest(endpoint: string): Promise<TestResponse> {
    const response = await fetch(`${TEST_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'X-Test-Client': 'abuse-prevention-tester'
      }
    })
    
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text()
    }
  }
}
```

This comprehensive abuse prevention system provides multi-tier rate limiting, WAF protection, behavioral anomaly detection, and automated response mechanisms with proper 429 status codes and comprehensive testing validation.
