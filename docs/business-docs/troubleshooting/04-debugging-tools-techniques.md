# Debugging Tools and Techniques

> **Last Updated**: 2025-01-31  
> **Version**: 1.0.0  
> **Status**: Production Ready

This guide provides comprehensive debugging strategies, tools, and techniques for effectively diagnosing issues in the Thorbis Business OS.

## Quick Navigation
- [Browser Developer Tools](#1-browser-developer-tools-usage)
- [Server-Side Debugging](#2-server-side-debugging-strategies)
- [Database Query Debugging](#3-database-query-debugging)
- [API Request/Response Debugging](#4-api-requestresponse-debugging)
- [Performance Profiling](#5-performance-profiling-tools)

---

## 1. Browser Developer Tools Usage

### Chrome DevTools Advanced Techniques

#### Network Tab Debugging
```typescript
// Enable advanced network monitoring
// packages/monitoring/src/network-monitor.ts
export class NetworkMonitor {
  private static instance: NetworkMonitor
  private observers: PerformanceObserver[] = []
  
  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor()
    }
    return NetworkMonitor.instance
  }
  
  startMonitoring() {
    // Monitor fetch requests
    const fetchObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
          this.logNetworkEntry(entry as PerformanceResourceTiming)
        }
      })
    })
    
    fetchObserver.observe({ entryTypes: ['navigation', 'resource'] })
    this.observers.push(fetchObserver)
    
    // Intercept fetch for custom logging
    this.interceptFetch()
  }
  
  private logNetworkEntry(entry: PerformanceResourceTiming) {
    const duration = entry.responseEnd - entry.requestStart
    const size = (entry as any).transferSize || 0
    
    console.log(`📡 ${entry.name}`, {
      duration: `${duration.toFixed(2)}ms`,
      size: this.formatBytes(size),
      status: (entry as any).responseStatus || 'unknown',
      type: entry.initiatorType
    })
    
    // Alert on slow requests
    if (duration > 2000) {
      console.warn(`⚠️ Slow request detected: ${entry.name} took ${duration.toFixed(2)}ms`)
    }
  }
  
  private interceptFetch() {
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      const [input, init] = args
      const url = typeof input === 'string' ? input : input.url
      const method = init?.method || 'GET'
      
      console.group(`🔄 ${method} ${url}`)
      
      try {
        const startTime = performance.now()
        const response = await originalFetch(...args)
        const endTime = performance.now()
        
        console.log(`Status: ${response.status}`)
        console.log(`Duration: ${(endTime - startTime).toFixed(2)}ms`)
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()))
        
        // Log response body for debugging (be careful with large responses)
        if (process.env.NODE_ENV === 'development') {
          const clonedResponse = response.clone()
          try {
            const body = await clonedResponse.text()
            if (body.length < 10000) { // Only log small responses
              console.log(`Response:`, body.substring(0, 500))
            }
          } catch (e) {
            console.log('Response body could not be logged')
          }
        }
        
        console.groupEnd()
        return response
      } catch (error) {
        console.error(`❌ Request failed:`, error)
        console.groupEnd()
        throw error
      }
    }
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Auto-start in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  NetworkMonitor.getInstance().startMonitoring()
}
```

#### React DevTools Integration
```typescript
// Custom React DevTools utilities
// packages/debugging/src/react-debug.ts
export class ReactDebugger {
  static inspectComponent(componentName: string) {
    // Find React DevTools instance
    const reactDevTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
    
    if (!reactDevTools) {
      console.warn('React DevTools not installed')
      return
    }
    
    // Get React Fiber tree
    const fiber = this.findComponentFiber(componentName)
    if (fiber) {
      console.log(`🔍 Component: ${componentName}`, {
        props: fiber.memoizedProps,
        state: fiber.memoizedState,
        hooks: this.getHooksInfo(fiber),
        renderCount: fiber.actualDuration
      })
    }
  }
  
  private static findComponentFiber(componentName: string): any {
    // Simplified implementation - in practice you'd traverse the fiber tree
    const rootElements = document.querySelectorAll('[data-reactroot]')
    for (const element of rootElements) {
      const fiber = (element as any)._reactInternalFiber || (element as any)._reactInternalInstance
      if (fiber) {
        return this.searchFiberTree(fiber, componentName)
      }
    }
    return null
  }
  
  private static searchFiberTree(fiber: any, componentName: string): any {
    if (fiber.type?.name === componentName || fiber.elementType?.name === componentName) {
      return fiber
    }
    
    if (fiber.child) {
      const result = this.searchFiberTree(fiber.child, componentName)
      if (result) return result
    }
    
    if (fiber.sibling) {
      return this.searchFiberTree(fiber.sibling, componentName)
    }
    
    return null
  }
  
  private static getHooksInfo(fiber: any): any[] {
    const hooks = []
    let hook = fiber.memoizedState
    
    while (hook) {
      hooks.push({
        value: hook.memoizedState,
        deps: hook.deps,
        next: !!hook.next
      })
      hook = hook.next
    }
    
    return hooks
  }
}

// Global access for debugging
if (typeof window !== 'undefined') {
  (window as any).ReactDebugger = ReactDebugger
}
```

### Console Debugging Techniques

#### Advanced Logging Utilities
```typescript
// Enhanced console debugging
// packages/debugging/src/console-debug.ts
export class ConsoleDebugger {
  private static groupStack: string[] = []
  
  static log(message: string, data?: any, style?: string) {
    if (process.env.NODE_ENV !== 'development') return
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const prefix = `[${timestamp}]`
    
    if (style) {
      console.log(`%c${prefix} ${message}`, style, data || '')
    } else {
      console.log(`${prefix} ${message}`, data || '')
    }
  }
  
  static error(message: string, error?: Error | any) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    console.error(
      `%c[${timestamp}] ❌ ${message}`,
      'color: #ef4444; font-weight: bold;',
      error || ''
    )
    
    if (error?.stack) {
      console.error('Stack trace:', error.stack)
    }
  }
  
  static warn(message: string, data?: any) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    console.warn(
      `%c[${timestamp}] ⚠️ ${message}`,
      'color: #f59e0b; font-weight: bold;',
      data || ''
    )
  }
  
  static success(message: string, data?: any) {
    this.log(
      `✅ ${message}`,
      data,
      'color: #10b981; font-weight: bold;'
    )
  }
  
  static info(message: string, data?: any) {
    this.log(
      `ℹ️ ${message}`,
      data,
      'color: #3b82f6; font-weight: bold;'
    )
  }
  
  static startGroup(name: string) {
    this.groupStack.push(name)
    console.group(`📁 ${name}`)
  }
  
  static endGroup() {
    const name = this.groupStack.pop()
    console.groupEnd()
    if (name) {
      this.log(`📁 End ${name}`)
    }
  }
  
  static table(data: any[], columns?: string[]) {
    if (process.env.NODE_ENV !== 'development') return
    
    console.table(data, columns)
  }
  
  static trace(message?: string) {
    if (process.env.NODE_ENV !== 'development') return
    
    if (message) {
      console.log(`🔍 ${message}`)
    }
    console.trace()
  }
  
  static time(label: string) {
    if (process.env.NODE_ENV !== 'development') return
    console.time(`⏱️ ${label}`)
  }
  
  static timeEnd(label: string) {
    if (process.env.NODE_ENV !== 'development') return
    console.timeEnd(`⏱️ ${label}`)
  }
  
  // Visual separator for cleaner logs
  static separator(title?: string) {
    if (process.env.NODE_ENV !== 'development') return
    
    const line = '═'.repeat(50)
    if (title) {
      console.log(`%c${line}\n${title.toUpperCase()}\n${line}`, 'color: #8b5cf6; font-weight: bold;')
    } else {
      console.log(`%c${line}`, 'color: #6b7280;')
    }
  }
}

// Global access
if (typeof window !== 'undefined') {
  (window as any).debug = ConsoleDebugger
}
```

#### Component State Inspector
```typescript
// React component debugging hook
// packages/debugging/src/use-debug.ts
import { useEffect, useRef } from 'react'

interface DebugOptions {
  logProps?: boolean
  logState?: boolean
  logRenders?: boolean
  logEffects?: boolean
}

export function useDebug(
  componentName: string,
  options: DebugOptions = {},
  dependencies?: any[]
) {
  const renderCount = useRef(0)
  const previousDeps = useRef(dependencies)
  
  const {
    logProps = true,
    logState = true,
    logRenders = true,
    logEffects = true
  } = options
  
  // Track renders
  if (logRenders) {
    renderCount.current++
    console.log(
      `%c🔄 ${componentName} render #${renderCount.current}`,
      'color: #06b6d4; font-weight: bold;'
    )
  }
  
  // Track dependency changes
  useEffect(() => {
    if (logEffects && dependencies) {
      const changes = dependencies.reduce((acc, dep, index) => {
        if (previousDeps.current && previousDeps.current[index] !== dep) {
          acc.push({
            index,
            from: previousDeps.current[index],
            to: dep
          })
        }
        return acc
      }, [] as any[])
      
      if (changes.length > 0) {
        console.log(`%c🔄 ${componentName} effect triggered`, 'color: #f59e0b;', changes)
      }
      
      previousDeps.current = dependencies
    }
  }, dependencies)
  
  // Component inspector function
  const inspect = (data?: any) => {
    console.group(`🔍 ${componentName} Inspector`)
    
    if (logRenders) {
      console.log(`Render count: ${renderCount.current}`)
    }
    
    if (data) {
      console.log('Custom data:', data)
    }
    
    console.log('Dependencies:', dependencies)
    console.groupEnd()
  }
  
  return { inspect, renderCount: renderCount.current }
}
```

---

## 2. Server-Side Debugging Strategies

### Next.js Server Debugging

#### API Route Debugging
```typescript
// Enhanced API route debugging middleware
// packages/debugging/src/api-debug-middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function withDebugMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const startTime = Date.now()
    const requestId = Math.random().toString(36).substr(2, 9)
    
    // Log request details
    console.log(`\n🔄 [${requestId}] ${req.method} ${req.url}`)
    console.log(`📍 Headers:`, Object.fromEntries(req.headers.entries()))
    
    // Log request body for debugging
    if (req.method !== 'GET') {
      try {
        const body = await req.text()
        const clonedReq = new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body: body
        })
        
        if (body) {
          console.log(`📝 Body:`, body.length > 1000 ? body.substring(0, 1000) + '...' : body)
        }
        
        // Create new request with body for handler
        req = clonedReq as NextRequest
      } catch (e) {
        console.warn('Could not log request body:', e)
      }
    }
    
    try {
      const response = await handler(req)
      const duration = Date.now() - startTime
      
      console.log(`✅ [${requestId}] Response: ${response.status} (${duration}ms)`)
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ [${requestId}] Error after ${duration}ms:`, error)
      
      return NextResponse.json(
        { error: 'Internal server error', requestId },
        { status: 500 }
      )
    }
  }
}

// Usage example
export const GET = withDebugMiddleware(async (req) => {
  // Your handler logic
  return NextResponse.json({ data: 'example' })
})
```

#### Server Component Debugging
```typescript
// Server component debugging utilities
// packages/debugging/src/server-debug.ts
export class ServerDebugger {
  static async logServerAction(actionName: string, data: any) {
    if (process.env.NODE_ENV !== 'development') return
    
    console.log(`\n🔄 Server Action: ${actionName}`)
    console.log(`📊 Data:`, JSON.stringify(data, null, 2))
  }
  
  static async measureServerAction<T>(
    actionName: string,
    action: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      console.log(`⏱️ Starting: ${actionName}`)
      const result = await action()
      const duration = Date.now() - startTime
      
      console.log(`✅ Completed: ${actionName} (${duration}ms)`)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ Failed: ${actionName} (${duration}ms)`, error)
      throw error
    }
  }
  
  static logDatabaseQuery(query: string, params?: any[]) {
    if (process.env.NODE_ENV !== 'development') return
    
    console.log('\n📊 Database Query:')
    console.log(query)
    if (params && params.length > 0) {
      console.log('📋 Parameters:', params)
    }
  }
}
```

### Node.js Debugging Setup

#### Advanced Debugging Configuration
```json
// .vscode/launch.json - VS Code debugging configuration
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev", "-p", "3001"],
      "cwd": "${workspaceFolder}/apps/hs",
      "env": {
        "NODE_OPTIONS": "--inspect"
      },
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    },
    {
      "name": "Debug API Route",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Server Action",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/scripts/debug-server-action.js",
      "env": {
        "NODE_ENV": "development"
      },
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Memory Debugging
```typescript
// Memory debugging utilities
// packages/debugging/src/memory-debug.ts
export class MemoryDebugger {
  private static snapshots: any[] = []
  
  static takeHeapSnapshot(label?: string) {
    if (typeof process === 'undefined') return
    
    const usage = process.memoryUsage()
    const snapshot = {
      label: label || `Snapshot ${this.snapshots.length + 1}`,
      timestamp: new Date().toISOString(),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024)
    }
    
    this.snapshots.push(snapshot)
    
    console.table([snapshot])
    
    return snapshot
  }
  
  static compareSnapshots(index1: number, index2: number) {
    if (!this.snapshots[index1] || !this.snapshots[index2]) {
      console.error('Invalid snapshot indices')
      return
    }
    
    const snap1 = this.snapshots[index1]
    const snap2 = this.snapshots[index2]
    
    const comparison = {
      label: `${snap1.label} → ${snap2.label}`,
      heapUsedDiff: snap2.heapUsed - snap1.heapUsed,
      heapTotalDiff: snap2.heapTotal - snap1.heapTotal,
      externalDiff: snap2.external - snap1.external,
      rssDiff: snap2.rss - snap1.rss
    }
    
    console.log('Memory Usage Comparison:')
    console.table([comparison])
    
    return comparison
  }
  
  static getAllSnapshots() {
    return [...this.snapshots]
  }
  
  static monitorMemoryLeaks(intervalMs = 30000) {
    setInterval(() => {
      const snapshot = this.takeHeapSnapshot(`Auto-${Date.now()}`)
      
      // Alert on significant memory increase
      if (this.snapshots.length > 1) {
        const previous = this.snapshots[this.snapshots.length - 2]
        const increase = snapshot.heapUsed - previous.heapUsed
        
        if (increase > 50) { // 50MB increase
          console.warn(`⚠️ Memory usage increased by ${increase}MB`)
        }
      }
    }, intervalMs)
  }
}
```

---

## 3. Database Query Debugging

### Supabase Query Debugging

#### Query Performance Analysis
```typescript
// Database query debugging utilities
// packages/debugging/src/database-debug.ts
export class DatabaseDebugger {
  private static queryLog: Array<{
    query: string
    duration: number
    timestamp: Date
    result: any
    error?: string
  }> = []
  
  static async debugQuery<T>(
    queryFn: () => Promise<T>,
    description: string
  ): Promise<T> {
    const startTime = performance.now()
    const timestamp = new Date()
    
    console.log(`🔍 Executing query: ${description}`)
    
    try {
      const result = await queryFn()
      const duration = performance.now() - startTime
      
      // Log query details
      this.queryLog.push({
        query: description,
        duration,
        timestamp,
        result
      })
      
      console.log(`✅ Query completed in ${duration.toFixed(2)}ms`)
      
      // Warn on slow queries
      if (duration > 1000) {
        console.warn(`⚠️ Slow query detected: ${description} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      this.queryLog.push({
        query: description,
        duration,
        timestamp,
        result: null,
        error: errorMessage
      })
      
      console.error(`❌ Query failed after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  }
  
  static getQueryLog() {
    return [...this.queryLog]
  }
  
  static getSlowQueries(thresholdMs = 1000) {
    return this.queryLog.filter(log => log.duration > thresholdMs)
  }
  
  static clearQueryLog() {
    this.queryLog.length = 0
  }
  
  static printQueryStats() {
    if (this.queryLog.length === 0) {
      console.log('No queries logged')
      return
    }
    
    const totalQueries = this.queryLog.length
    const avgDuration = this.queryLog.reduce((sum, log) => sum + log.duration, 0) / totalQueries
    const slowQueries = this.getSlowQueries().length
    const failedQueries = this.queryLog.filter(log => log.error).length
    
    const stats = {
      totalQueries,
      averageDuration: `${avgDuration.toFixed(2)}ms`,
      slowQueries: `${slowQueries} (${((slowQueries / totalQueries) * 100).toFixed(1)}%)`,
      failedQueries: `${failedQueries} (${((failedQueries / totalQueries) * 100).toFixed(1)}%)`,
      successRate: `${(((totalQueries - failedQueries) / totalQueries) * 100).toFixed(1)}%`
    }
    
    console.table([stats])
  }
}

// Supabase client wrapper with debugging
export function createDebugSupabaseClient(supabase: any) {
  return new Proxy(supabase, {
    get(target, prop) {
      if (prop === 'from') {
        return (tableName: string) => {
          const table = target.from(tableName)
          
          // Wrap query methods with debugging
          return new Proxy(table, {
            get(tableTarget, tableProp) {
              const originalMethod = tableTarget[tableProp]
              
              if (typeof originalMethod === 'function' && 
                  ['select', 'insert', 'update', 'delete', 'upsert'].includes(tableProp as string)) {
                return function(...args: any[]) {
                  const query = originalMethod.apply(tableTarget, args)
                  
                  // Wrap the execute methods
                  const originalThen = query.then
                  query.then = function(onFulfilled?: any, onRejected?: any) {
                    const description = `${tableProp.toUpperCase()} from ${tableName}`
                    return DatabaseDebugger.debugQuery(
                      () => originalThen.call(this, onFulfilled, onRejected),
                      description
                    )
                  }
                  
                  return query
                }
              }
              
              return originalMethod
            }
          })
        }
      }
      
      return target[prop]
    }
  })
}
```

#### Query Optimization Tools
```typescript
// Query optimization analyzer
// packages/debugging/src/query-optimizer.ts
export class QueryOptimizer {
  static analyzeQuery(query: string, params: any[] = []) {
    const issues: string[] = []
    const suggestions: string[] = []
    
    // Check for common anti-patterns
    if (query.includes('SELECT *')) {
      issues.push('Using SELECT * - specify only needed columns')
      suggestions.push('Replace * with specific column names')
    }
    
    if (query.includes('WHERE') && !query.includes('INDEX')) {
      const whereClause = query.substring(query.indexOf('WHERE'))
      if (!whereClause.includes('id =') && !whereClause.includes('uuid =')) {
        issues.push('WHERE clause may not use indexes')
        suggestions.push('Consider adding indexes on filtered columns')
      }
    }
    
    if (query.includes('LIKE \'%')) {
      issues.push('Leading wildcard in LIKE prevents index usage')
      suggestions.push('Consider full-text search or different approach')
    }
    
    if (query.includes('ORDER BY') && !query.includes('LIMIT')) {
      issues.push('ORDER BY without LIMIT can be expensive')
      suggestions.push('Add LIMIT clause to restrict result set')
    }
    
    return {
      query,
      params,
      issues,
      suggestions,
      score: Math.max(0, 100 - (issues.length * 20)) // Simple scoring
    }
  }
  
  static suggestIndexes(tableName: string, whereColumns: string[], orderByColumns: string[] = []) {
    const suggestions = []
    
    // Single column indexes
    whereColumns.forEach(column => {
      suggestions.push(`CREATE INDEX idx_${tableName}_${column} ON ${tableName}(${column});`)
    })
    
    // Composite indexes for WHERE + ORDER BY
    if (whereColumns.length > 0 && orderByColumns.length > 0) {
      const compositeColumns = [...whereColumns, ...orderByColumns]
      suggestions.push(
        `CREATE INDEX idx_${tableName}_${compositeColumns.join('_')} ON ${tableName}(${compositeColumns.join(', ')});`
      )
    }
    
    // Covering indexes (include frequently selected columns)
    if (whereColumns.length === 1) {
      suggestions.push(
        `-- Consider a covering index if you frequently select specific columns with this WHERE clause
CREATE INDEX idx_${tableName}_${whereColumns[0]}_covering ON ${tableName}(${whereColumns[0]}) INCLUDE (column1, column2);`
      )
    }
    
    return suggestions
  }
}
```

---

## 4. API Request/Response Debugging

### HTTP Request/Response Inspection

#### Advanced Fetch Debugging
```typescript
// Enhanced fetch debugging wrapper
// packages/debugging/src/fetch-debug.ts
interface RequestDebugOptions {
  logRequest?: boolean
  logResponse?: boolean
  logTiming?: boolean
  logErrors?: boolean
  timeout?: number
}

export class FetchDebugger {
  private static requestCount = 0
  private static activeRequests = new Map<string, { startTime: number; url: string }>()
  
  static async debugFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
    options: RequestDebugOptions = {}
  ) {
    const {
      logRequest = true,
      logResponse = true,
      logTiming = true,
      logErrors = true,
      timeout = 30000
    } = options
    
    const requestId = `req_${++this.requestCount}`
    const url = typeof input === 'string' ? input : input.toString()
    const method = init?.method || 'GET'
    const startTime = performance.now()
    
    // Store active request
    this.activeRequests.set(requestId, { startTime, url })
    
    if (logRequest) {
      console.group(`📡 [${requestId}] ${method} ${url}`)
      
      if (init?.headers) {
        console.log('📋 Headers:', init.headers)
      }
      
      if (init?.body) {
        try {
          const body = typeof init.body === 'string' ? init.body : JSON.stringify(init.body)
          console.log('📝 Body:', body.length > 500 ? body.substring(0, 500) + '...' : body)
        } catch (e) {
          console.log('📝 Body: [Binary or unparseable data]')
        }
      }
    }
    
    // Add timeout wrapper
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Remove from active requests
      this.activeRequests.delete(requestId)
      
      if (logTiming) {
        console.log(`⏱️ Duration: ${duration.toFixed(2)}ms`)
      }
      
      if (logResponse) {
        console.log(`📊 Status: ${response.status} ${response.statusText}`)
        console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()))
        
        // Log response body (clone to avoid consuming stream)
        try {
          const clonedResponse = response.clone()
          const contentType = response.headers.get('content-type') || ''
          
          if (contentType.includes('application/json')) {
            const data = await clonedResponse.json()
            console.log('📄 Response:', data)
          } else if (contentType.includes('text/')) {
            const text = await clonedResponse.text()
            console.log('📄 Response:', text.length > 500 ? text.substring(0, 500) + '...' : text)
          } else {
            console.log('📄 Response: [Binary data]')
          }
        } catch (e) {
          console.log('📄 Response: [Could not parse response body]')
        }
      }
      
      if (!response.ok && logErrors) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`)
      }
      
      if (logRequest) {
        console.groupEnd()
      }
      
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      this.activeRequests.delete(requestId)
      
      const duration = performance.now() - startTime
      
      if (logErrors) {
        console.error(`❌ [${requestId}] Request failed after ${duration.toFixed(2)}ms:`, error)
      }
      
      if (logRequest) {
        console.groupEnd()
      }
      
      throw error
    }
  }
  
  static getActiveRequests() {
    return Array.from(this.activeRequests.entries()).map(([id, info]) => ({
      id,
      url: info.url,
      duration: performance.now() - info.startTime
    }))
  }
  
  static getRequestStats() {
    return {
      totalRequests: this.requestCount,
      activeRequests: this.activeRequests.size,
      activeRequestDetails: this.getActiveRequests()
    }
  }
}

// Global replacement for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalFetch = window.fetch
  
  window.fetch = (...args) => {
    return FetchDebugger.debugFetch(args[0], args[1])
  }
  
  // Global access
  (window as any).FetchDebugger = FetchDebugger
}
```

#### WebSocket Debugging
```typescript
// WebSocket connection debugging
// packages/debugging/src/websocket-debug.ts
export class WebSocketDebugger {
  private static connections = new Map<string, {
    ws: WebSocket
    url: string
    startTime: number
    messageCount: number
    errors: any[]
  }>()
  
  static createDebugWebSocket(url: string, protocols?: string | string[]): WebSocket {
    const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const ws = new WebSocket(url, protocols)
    const startTime = Date.now()
    
    const connectionInfo = {
      ws,
      url,
      startTime,
      messageCount: 0,
      errors: []
    }
    
    this.connections.set(connectionId, connectionInfo)
    
    // Debug event listeners
    ws.addEventListener('open', (event) => {
      const duration = Date.now() - startTime
      console.log(`🔌 [${connectionId}] WebSocket connected to ${url} (${duration}ms)`)
    })
    
    ws.addEventListener('message', (event) => {
      connectionInfo.messageCount++
      
      console.group(`📨 [${connectionId}] Message received`)
      console.log('Data type:', typeof event.data)
      console.log('Data size:', event.data.length || 0, 'bytes')
      
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data)
          console.log('Parsed data:', data)
        } else {
          console.log('Raw data:', event.data)
        }
      } catch (e) {
        console.log('Raw data:', event.data)
      }
      
      console.groupEnd()
    })
    
    ws.addEventListener('error', (event) => {
      connectionInfo.errors.push({
        timestamp: new Date(),
        event
      })
      console.error(`❌ [${connectionId}] WebSocket error:`, event)
    })
    
    ws.addEventListener('close', (event) => {
      const duration = Date.now() - startTime
      console.log(`🔌 [${connectionId}] WebSocket closed (${duration}ms total)`, {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        messageCount: connectionInfo.messageCount
      })
      
      this.connections.delete(connectionId)
    })
    
    // Wrap send method
    const originalSend = ws.send.bind(ws)
    ws.send = (data) => {
      console.log(`📤 [${connectionId}] Sending message:`, data)
      return originalSend(data)
    }
    
    return ws
  }
  
  static getConnectionStats() {
    return Array.from(this.connections.entries()).map(([id, info]) => ({
      id,
      url: info.url,
      uptime: Date.now() - info.startTime,
      messageCount: info.messageCount,
      errorCount: info.errors.length,
      readyState: info.ws.readyState
    }))
  }
}
```

---

## 5. Performance Profiling Tools

### React Performance Profiling

#### Component Render Profiling
```typescript
// React performance profiler
// packages/debugging/src/react-profiler.ts
import { Profiler, ProfilerOnRenderCallback } from 'react'

interface RenderProfile {
  id: string
  phase: 'mount' | 'update'
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
  interactions: Set<any>
}

export class ReactProfiler {
  private static profiles: RenderProfile[] = []
  private static isEnabled = process.env.NODE_ENV === 'development'
  
  static onRenderCallback: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  ) => {
    if (!this.isEnabled) return
    
    const profile: RenderProfile = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions
    }
    
    this.profiles.push(profile)
    
    // Log slow renders
    if (actualDuration > 16) { // Slower than 16ms (60fps threshold)
      console.warn(
        `⚠️ Slow render detected: ${id} took ${actualDuration.toFixed(2)}ms (${phase})`,
        profile
      )
    }
    
    // Keep only recent profiles (memory management)
    if (this.profiles.length > 1000) {
      this.profiles.shift()
    }
  }
  
  static getProfileSummary() {
    if (this.profiles.length === 0) {
      return { message: 'No profiles recorded' }
    }
    
    const components = new Map<string, {
      renderCount: number
      totalDuration: number
      avgDuration: number
      maxDuration: number
      slowRenders: number
    }>()
    
    this.profiles.forEach(profile => {
      const current = components.get(profile.id) || {
        renderCount: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0,
        slowRenders: 0
      }
      
      current.renderCount++
      current.totalDuration += profile.actualDuration
      current.maxDuration = Math.max(current.maxDuration, profile.actualDuration)
      current.avgDuration = current.totalDuration / current.renderCount
      
      if (profile.actualDuration > 16) {
        current.slowRenders++
      }
      
      components.set(profile.id, current)
    })
    
    return Array.from(components.entries())
      .map(([id, stats]) => ({ component: id, ...stats }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
  }
  
  static clearProfiles() {
    this.profiles.length = 0
  }
  
  static enable() {
    this.isEnabled = true
  }
  
  static disable() {
    this.isEnabled = false
  }
}

// HOC for easy profiling
export function withProfiler<P extends object>(
  Component: React.ComponentType<P>,
  id?: string
) {
  return function ProfiledComponent(props: P) {
    const componentId = id || Component.displayName || Component.name || 'Anonymous'
    
    return (
      <Profiler id={componentId} onRender={ReactProfiler.onRenderCallback}>
        <Component {...props} />
      </Profiler>
    )
  }
}

// Hook for component-level profiling
export function useRenderProfiler(componentName: string) {
  const renderCount = React.useRef(0)
  const lastRenderTime = React.useRef(Date.now())
  
  React.useEffect(() => {
    const currentTime = Date.now()
    const timeSinceLastRender = currentTime - lastRenderTime.current
    
    renderCount.current++
    lastRenderTime.current = currentTime
    
    if (renderCount.current > 1) {
      console.log(
        `🔄 ${componentName} render #${renderCount.current} (${timeSinceLastRender}ms since last render)`
      )
    }
  })
  
  return renderCount.current
}
```

### Browser Performance Monitoring

#### Core Web Vitals Monitoring
```typescript
// Web vitals performance monitoring
// packages/debugging/src/web-vitals-monitor.ts
export class WebVitalsMonitor {
  private static metrics: Array<{
    name: string
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    timestamp: number
    id: string
  }> = []
  
  static init() {
    if (typeof window === 'undefined') return
    
    // Import web-vitals dynamically
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.onMetric)
      getFID(this.onMetric)
      getFCP(this.onMetric)
      getLCP(this.onMetric)
      getTTFB(this.onMetric)
    })
    
    // Custom paint timing
    this.measurePaintTiming()
    
    // Navigation timing
    this.measureNavigationTiming()
  }
  
  private static onMetric = (metric: any) => {
    const { name, value, rating, id } = metric
    
    this.metrics.push({
      name,
      value,
      rating,
      timestamp: Date.now(),
      id
    })
    
    // Log poor metrics
    if (rating === 'poor') {
      console.warn(`⚠️ Poor ${name}: ${value.toFixed(2)}`, metric)
    } else if (rating === 'needs-improvement') {
      console.log(`⚡ ${name} needs improvement: ${value.toFixed(2)}`, metric)
    } else {
      console.log(`✅ Good ${name}: ${value.toFixed(2)}`, metric)
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('web_vital', { name, value, rating })
    }
  }
  
  private static measurePaintTiming() {
    if (!window.performance || !window.performance.getEntriesByType) return
    
    const paintEntries = window.performance.getEntriesByType('paint')
    paintEntries.forEach(entry => {
      console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`)
    })
  }
  
  private static measureNavigationTiming() {
    if (!window.performance || !window.performance.getEntriesByType) return
    
    window.addEventListener('load', () => {
      const [navigationEntry] = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      
      if (!navigationEntry) return
      
      const timings = {
        'DNS Lookup': navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
        'TCP Connection': navigationEntry.connectEnd - navigationEntry.connectStart,
        'Request': navigationEntry.responseStart - navigationEntry.requestStart,
        'Response': navigationEntry.responseEnd - navigationEntry.responseStart,
        'DOM Processing': navigationEntry.domComplete - navigationEntry.responseEnd,
        'Load Complete': navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
        'Total': navigationEntry.loadEventEnd - navigationEntry.fetchStart
      }
      
      console.table(timings)
    })
  }
  
  static getMetrics() {
    return [...this.metrics]
  }
  
  static getMetricsSummary() {
    const summary = new Map<string, {
      good: number
      needsImprovement: number
      poor: number
      averageValue: number
    }>()
    
    this.metrics.forEach(metric => {
      const current = summary.get(metric.name) || {
        good: 0,
        needsImprovement: 0,
        poor: 0,
        averageValue: 0
      }
      
      if (metric.rating === 'good') current.good++
      else if (metric.rating === 'needs-improvement') current.needsImprovement++
      else current.poor++
      
      summary.set(metric.name, current)
    })
    
    return Object.fromEntries(summary.entries())
  }
}

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  WebVitalsMonitor.init()
}
```

---

## 6. Debugging Environment Setup

### Development Environment Configuration

```typescript
// Global debugging configuration
// packages/debugging/src/debug-config.ts
export const DebugConfig = {
  // Feature flags for different debugging tools
  enableNetworkMonitoring: process.env.NEXT_PUBLIC_DEBUG_NETWORK === 'true',
  enableDatabaseDebugging: process.env.NEXT_PUBLIC_DEBUG_DATABASE === 'true',
  enableReactProfiling: process.env.NEXT_PUBLIC_DEBUG_REACT === 'true',
  enableMemoryMonitoring: process.env.NEXT_PUBLIC_DEBUG_MEMORY === 'true',
  
  // Logging levels
  logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
  
  // Performance thresholds
  slowQueryThreshold: parseInt(process.env.NEXT_PUBLIC_SLOW_QUERY_THRESHOLD || '1000'),
  slowRenderThreshold: parseInt(process.env.NEXT_PUBLIC_SLOW_RENDER_THRESHOLD || '16'),
  memoryAlertThreshold: parseInt(process.env.NEXT_PUBLIC_MEMORY_ALERT_THRESHOLD || '80'),
  
  // Debug URLs and endpoints
  debugApiUrl: process.env.NEXT_PUBLIC_DEBUG_API_URL || '/api/debug',
  
  // Initialize all debugging tools
  init() {
    if (process.env.NODE_ENV !== 'development') return
    
    console.log('🚀 Initializing debug environment...')
    
    if (this.enableNetworkMonitoring) {
      import('./network-monitor').then(({ NetworkMonitor }) => {
        NetworkMonitor.getInstance().startMonitoring()
      })
    }
    
    if (this.enableMemoryMonitoring) {
      import('./memory-debug').then(({ MemoryDebugger }) => {
        MemoryDebugger.monitorMemoryLeaks()
      })
    }
    
    if (typeof window !== 'undefined') {
      if (this.enableReactProfiling) {
        import('./react-profiler').then(({ ReactProfiler }) => {
          ReactProfiler.enable()
        })
      }
      
      // Global debug utilities
      (window as any).debugConfig = this
      (window as any).clearDebugLogs = () => {
        console.clear()
        localStorage.clear()
      }
    }
    
    console.log('✅ Debug environment initialized')
  }
}

// Auto-initialize
DebugConfig.init()
```

### Debug Dashboard Component
```typescript
// Debug dashboard for development
// packages/debugging/src/debug-dashboard.tsx
import React, { useState, useEffect } from 'react'

export function DebugDashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('network')
  const [metrics, setMetrics] = useState<any>({})
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    
    // Collect metrics from various debugging tools
    const interval = setInterval(() => {
      const newMetrics = {
        network: (window as any).FetchDebugger?.getRequestStats() || {},
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : {},
        react: (window as any).ReactProfiler?.getProfileSummary() || [],
        webVitals: (window as any).WebVitalsMonitor?.getMetrics() || []
      }
      
      setMetrics(newMetrics)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow-lg"
        title="Toggle Debug Dashboard"
      >
        🐛 Debug
      </button>
      
      {/* Dashboard modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-4/5 h-4/5 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Debug Dashboard</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b">
              {['network', 'memory', 'react', 'webVitals'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Content */}
            <div className="p-4 h-full overflow-auto">
              {activeTab === 'network' && (
                <div>
                  <h3 className="text-lg font-bold mb-2">Network Requests</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(metrics.network, null, 2)}
                  </pre>
                </div>
              )}
              
              {activeTab === 'memory' && (
                <div>
                  <h3 className="text-lg font-bold mb-2">Memory Usage</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-100 p-4 rounded">
                      <div className="text-2xl font-bold">{metrics.memory.used || 0}MB</div>
                      <div className="text-sm text-gray-600">Used</div>
                    </div>
                    <div className="bg-green-100 p-4 rounded">
                      <div className="text-2xl font-bold">{metrics.memory.total || 0}MB</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded">
                      <div className="text-2xl font-bold">{metrics.memory.limit || 0}MB</div>
                      <div className="text-sm text-gray-600">Limit</div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'react' && (
                <div>
                  <h3 className="text-lg font-bold mb-2">React Performance</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(metrics.react, null, 2)}
                  </pre>
                </div>
              )}
              
              {activeTab === 'webVitals' && (
                <div>
                  <h3 className="text-lg font-bold mb-2">Web Vitals</h3>
                  <div className="space-y-2">
                    {metrics.webVitals.map((vital: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded ${
                          vital.rating === 'good'
                            ? 'bg-green-100'
                            : vital.rating === 'needs-improvement'
                            ? 'bg-yellow-100'
                            : 'bg-red-100'
                        }`}
                      >
                        <div className="font-bold">{vital.name}</div>
                        <div>{vital.value.toFixed(2)}ms - {vital.rating}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Environment and Deployment Issues](./03-environment-deployment-issues.md)*  
*Next: [Monitoring and Alerting](./05-monitoring-alerting.md)*