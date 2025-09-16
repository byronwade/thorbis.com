/**
 * Performance Benchmarking and Comparison Tools
 * 
 * Provides comprehensive benchmarking utilities for measuring
 * and comparing API performance across different scenarios
 */

import { performance, PerformanceObserver } from 'perf_hooks'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'

// Benchmarking interfaces
export interface BenchmarkConfig {
  name: string
  description: string
  iterations: number
  warmupIterations: number
  concurrency: number
  timeout: number
  tags: string[]
}

export interface BenchmarkResult {
  name: string
  config: BenchmarkConfig
  results: {
    iterations: number
    totalTime: number
    avgTime: number
    minTime: number
    maxTime: number
    medianTime: number
    p95Time: number
    p99Time: number
    throughput: number
    errorRate: number
    memoryUsage: {
      initial: NodeJS.MemoryUsage
      peak: NodeJS.MemoryUsage
      final: NodeJS.MemoryUsage
    }
    cpuUsage: NodeJS.CpuUsage
  }
  timestamp: Date
  environment: {
    nodeVersion: string
    platform: string
    arch: string
    memory: number
  }
}

export interface BenchmarkComparison {
  baseline: BenchmarkResult
  current: BenchmarkResult
  improvements: {
    avgTime: number
    p95Time: number
    throughput: number
    memoryUsage: number
  }
  regression: boolean
  summary: string
}

export interface LoadTestScenario {
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  expectedStatus: number
  timeout: number
}

/**
 * Performance Benchmark Suite
 */
export class BenchmarkSuite {
  private results: BenchmarkResult[] = []
  private observer: PerformanceObserver
  private measurements: number[] = []

  constructor() {
    this.setupPerformanceObserver()
  }

  private setupPerformanceObserver() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      for (const entry of entries) {
        if (entry.entryType === 'measure' && entry.name.startsWith('benchmark-')) {
          this.measurements.push(entry.duration)
        }
      }
    })

    this.observer.observe({ entryTypes: ['measure'] })
  }

  /**
   * Run a benchmark with specified configuration
   */
  async runBenchmark(
    name: string,
    testFunction: () => Promise<unknown>,
    config: Partial<BenchmarkConfig> = {}
  ): Promise<BenchmarkResult> {
    const fullConfig: BenchmarkConfig = {
      name,
      description: config.description || ',
      iterations: config.iterations || 100,
      warmupIterations: config.warmupIterations || 10,
      concurrency: config.concurrency || 1,
      timeout: config.timeout || 30000,
      tags: config.tags || []
    }

    console.log(`Running benchmark: ${name}')
    console.log('Config: ${JSON.stringify(fullConfig, null, 2)}')

    const initialMemory = process.memoryUsage()
    const startCpuUsage = process.cpuUsage()
    let peakMemory = initialMemory
    const errors = 0

    // Warmup phase
    console.log('Warming up...')
    for (let i = 0; i < fullConfig.warmupIterations; i++) {
      try {
        await testFunction()
      } catch (error) {
        console.warn('Warmup iteration ${i} failed:', error)
      }
    }

    this.measurements = []
    const executionTimes: number[] = []

    // Main benchmark phase
    console.log('Running benchmark iterations...`)
    const startTime = performance.now()

    if (fullConfig.concurrency === 1) {
      // Sequential execution
      for (let i = 0; i < fullConfig.iterations; i++) {
        const iterationStart = performance.now()
        performance.mark(`benchmark-${name}-start-${i}`)

        try {
          await Promise.race([
            testFunction(),
            this.createTimeoutPromise(fullConfig.timeout)
          ])
        } catch (error) {
          errors++
          console.warn(`Iteration ${i} failed:`, error)
        }

        performance.mark(`benchmark-${name}-end-${i}`)
        performance.measure(`benchmark-${name}-${i}`, `benchmark-${name}-start-${i}`, `benchmark-${name}-end-${i}`)

        const iterationTime = performance.now() - iterationStart
        executionTimes.push(iterationTime)

        // Track peak memory usage
        const currentMemory = process.memoryUsage()
        if (currentMemory.heapUsed > peakMemory.heapUsed) {
          peakMemory = currentMemory
        }

        // Progress indicator
        if ((i + 1) % Math.ceil(fullConfig.iterations / 10) === 0) {
          console.log(`Progress: ${((i + 1) / fullConfig.iterations * 100).toFixed(1)}%`)
        }
      }
    } else {
      // Concurrent execution
      const batches = Math.ceil(fullConfig.iterations / fullConfig.concurrency)
      
      for (let batch = 0; batch < batches; batch++) {
        const batchPromises: Promise<unknown>[] = []
        const batchSize = Math.min(fullConfig.concurrency, fullConfig.iterations - batch * fullConfig.concurrency)

        for (let i = 0; i < batchSize; i++) {
          const iterationIndex = batch * fullConfig.concurrency + i
          const iterationStart = performance.now()
          performance.mark(`benchmark-${name}-start-${iterationIndex}`)

          const promise = Promise.race([
            testFunction(),
            this.createTimeoutPromise(fullConfig.timeout)
          ]).then(() => {
            performance.mark(`benchmark-${name}-end-${iterationIndex}`)
            performance.measure(`benchmark-${name}-${iterationIndex}`, `benchmark-${name}-start-${iterationIndex}`, `benchmark-${name}-end-${iterationIndex}`)
            
            const iterationTime = performance.now() - iterationStart
            executionTimes.push(iterationTime)

            const currentMemory = process.memoryUsage()
            if (currentMemory.heapUsed > peakMemory.heapUsed) {
              peakMemory = currentMemory
            }
          }).catch((error) => {
            errors++
            console.warn(`Concurrent iteration ${iterationIndex} failed:`, error)
          })

          batchPromises.push(promise)
        }

        await Promise.all(batchPromises)
        console.log(`Batch ${batch + 1}/${batches} completed')
      }
    }

    const totalTime = performance.now() - startTime
    const finalMemory = process.memoryUsage()
    const endCpuUsage = process.cpuUsage(startCpuUsage)

    // Calculate statistics
    const sortedTimes = executionTimes.sort((a, b) => a - b)
    const successfulIterations = fullConfig.iterations - errors

    const result: BenchmarkResult = {
      name,
      config: fullConfig,
      results: {
        iterations: successfulIterations,
        totalTime,
        avgTime: executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length || 0,
        minTime: Math.min(...executionTimes) || 0,
        maxTime: Math.max(...executionTimes) || 0,
        medianTime: this.percentile(sortedTimes, 0.5),
        p95Time: this.percentile(sortedTimes, 0.95),
        p99Time: this.percentile(sortedTimes, 0.99),
        throughput: (successfulIterations / totalTime) * 1000, // operations per second
        errorRate: errors / fullConfig.iterations,
        memoryUsage: {
          initial: initialMemory,
          peak: peakMemory,
          final: finalMemory
        },
        cpuUsage: endCpuUsage
      },
      timestamp: new Date(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: Math.round(peakMemory.heapUsed / 1024 / 1024)
      }
    }

    this.results.push(result)
    console.log('Benchmark completed: ${name}')
    console.log(this.formatResult(result))

    return result
  }

  /**
   * Run multiple benchmarks and compare results
   */
  async runComparativeBenchmark(
    tests: Array<{
      name: string
      testFunction: () => Promise<unknown>
      config?: Partial<BenchmarkConfig>
    }>
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = []

    for (const test of tests) {
      const result = await this.runBenchmark(test.name, test.testFunction, test.config)
      results.push(result)
    }

    // Print comparison
    console.log('
=== Benchmark Comparison ===`)
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}`)
      console.log(`   Avg Time: ${result.results.avgTime.toFixed(2)}ms`)
      console.log(`   Throughput: ${result.results.throughput.toFixed(2)} ops/sec`)
      console.log(`   Memory: ${result.environment.memory}MB`)
      console.log(`   Error Rate: ${(result.results.errorRate * 100).toFixed(2)}%`)
    })

    return results
  }

  /**
   * Compare current results with baseline
   */
  compareWithBaseline(current: BenchmarkResult, baseline: BenchmarkResult): BenchmarkComparison {
    const avgTimeImprovement = ((baseline.results.avgTime - current.results.avgTime) / baseline.results.avgTime) * 100
    const p95TimeImprovement = ((baseline.results.p95Time - current.results.p95Time) / baseline.results.p95Time) * 100
    const throughputImprovement = ((current.results.throughput - baseline.results.throughput) / baseline.results.throughput) * 100
    const memoryImprovement = ((baseline.environment.memory - current.environment.memory) / baseline.environment.memory) * 100

    const regression = avgTimeImprovement < -10 || throughputImprovement < -20 || memoryImprovement < -50

    const summary = `
    if (avgTimeImprovement > 10) {
      summary += `✅ Response time improved by ${avgTimeImprovement.toFixed(1)}%. `
    } else if (avgTimeImprovement < -10) {
      summary += `❌ Response time degraded by ${Math.abs(avgTimeImprovement).toFixed(1)}%. `
    }

    if (throughputImprovement > 20) {
      summary += `✅ Throughput improved by ${throughputImprovement.toFixed(1)}%. `
    } else if (throughputImprovement < -20) {
      summary += '❌ Throughput degraded by ${Math.abs(throughputImprovement).toFixed(1)}%. '
    }

    return {
      baseline,
      current,
      improvements: {
        avgTime: avgTimeImprovement,
        p95Time: p95TimeImprovement,
        throughput: throughputImprovement,
        memoryUsage: memoryImprovement
      },
      regression,
      summary: summary || 'Performance is similar to baseline.'
    }
  }

  /**
   * Save benchmark results to file
   */
  async saveResults(filename: string): Promise<void> {
    const data = {
      results: this.results,
      metadata: {
        generatedAt: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }

    const filepath = join(process.cwd(), 'benchmarks', filename)
    await writeFile(filepath, JSON.stringify(data, null, 2))
    console.log('Benchmark results saved to: ${filepath}')
  }

  /**
   * Load baseline results for comparison
   */
  async loadBaseline(filename: string): Promise<BenchmarkResult[]> {
    try {
      const filepath = join(process.cwd(), 'benchmarks', filename)
      const data = await readFile(filepath, 'utf8')
      const parsed = JSON.parse(data)
      return parsed.results || []
    } catch (error) {
      console.warn('Could not load baseline from ${filename}:', error)
      return []
    }
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Benchmark iteration timeout')), timeout)
    })
  }

  private percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0
    const index = Math.ceil(sortedArray.length * p) - 1
    return sortedArray[Math.max(0, index)]
  }

  private formatResult(result: BenchmarkResult): string {
    return ''
Results for ${result.name}:
  Iterations: ${result.results.iterations}
  Average Time: ${result.results.avgTime.toFixed(2)}ms
  Median Time: ${result.results.medianTime.toFixed(2)}ms
  P95 Time: ${result.results.p95Time.toFixed(2)}ms
  P99 Time: ${result.results.p99Time.toFixed(2)}ms
  Throughput: ${result.results.throughput.toFixed(2)} ops/sec
  Error Rate: ${(result.results.errorRate * 100).toFixed(2)}%
  Memory Peak: ${result.environment.memory}MB
`
  }

  /**
   * Cleanup performance observers
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    this.measurements = []
  }
}

/**
 * HTTP Load Testing Utilities
 */
export class HTTPLoadTester {
  async testEndpoint(
    scenario: LoadTestScenario,
    iterations: number = 100,
    concurrency: number = 10
  ): Promise<{
    scenario: LoadTestScenario
    results: {
      totalRequests: number
      successfulRequests: number
      failedRequests: number
      avgResponseTime: number
      minResponseTime: number
      maxResponseTime: number
      p95ResponseTime: number
      throughput: number
      errorRate: number
      statusCodes: Record<number, number>
      errors: string[]
    }
  }> {
    console.log(`Testing ${scenario.method} ${scenario.url}`)
    
    const startTime = performance.now()
    const responseTimes: number[] = []
    const statusCodes: Record<number, number> = {}
    const errors: string[] = []
    const successCount = 0
    const failCount = 0

    // Create test function
    const testFunction = async () => {
      const requestStart = performance.now()
      
      try {
        const response = await fetch(scenario.url, {
          method: scenario.method,
          headers: scenario.headers,
          body: scenario.body ? JSON.stringify(scenario.body) : undefined,
          signal: AbortSignal.timeout(scenario.timeout)
        })

        const responseTime = performance.now() - requestStart
        responseTimes.push(responseTime)

        statusCodes[response.status] = (statusCodes[response.status] || 0) + 1

        if (response.status === scenario.expectedStatus) {
          successCount++
        } else {
          failCount++
          errors.push(`Unexpected status: ${response.status} (expected ${scenario.expectedStatus})')
        }

        return response
      } catch (error) {
        failCount++
        const responseTime = performance.now() - requestStart
        responseTimes.push(responseTime)
        errors.push(error instanceof Error ? error.message : String(error))
        throw error
      }
    }

    // Run concurrent requests
    const batches = Math.ceil(iterations / concurrency)
    
    for (let batch = 0; batch < batches; batch++) {
      const batchPromises: Promise<unknown>[] = []
      const batchSize = Math.min(concurrency, iterations - batch * concurrency)

      for (let i = 0; i < batchSize; i++) {
        batchPromises.push(
          testFunction().catch(error => {
            // Error already recorded in testFunction
          })
        )
      }

      await Promise.all(batchPromises)
      console.log('Batch ${batch + 1}/${batches} completed')
    }

    const totalTime = performance.now() - startTime
    const sortedTimes = responseTimes.sort((a, b) => a - b)

    return {
      scenario,
      results: {
        totalRequests: iterations,
        successfulRequests: successCount,
        failedRequests: failCount,
        avgResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length || 0,
        minResponseTime: Math.min(...responseTimes) || 0,
        maxResponseTime: Math.max(...responseTimes) || 0,
        p95ResponseTime: this.percentile(sortedTimes, 0.95),
        throughput: (successCount / totalTime) * 1000, // requests per second
        errorRate: failCount / iterations,
        statusCodes,
        errors: [...new Set(errors)].slice(0, 10) // Deduplicate and limit errors
      }
    }
  }

  private percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0
    const index = Math.ceil(sortedArray.length * p) - 1
    return sortedArray[Math.max(0, index)]
  }
}

// Export instances for easy use
export const benchmarkSuite = new BenchmarkSuite()
export const httpLoadTester = new HTTPLoadTester()

// Cleanup on process exit
process.on('exit', () => {
  benchmarkSuite.destroy()
})

export default {
  BenchmarkSuite,
  HTTPLoadTester,
  benchmarkSuite,
  httpLoadTester
}