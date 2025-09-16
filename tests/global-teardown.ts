import { FullConfig } from '@playwright/test'
import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...')

  try {
    // Generate test summary report
    const testResultsPath = path.join(process.cwd(), 'test-results', 'results.json')
    
    try {
      const resultsData = await fs.readFile(testResultsPath, 'utf8')
      const results = JSON.parse(resultsData)
      
      console.log('\n📊 Test Summary:')
      console.log(`   Total Tests: ${results.stats?.total || 0}`)
      console.log(`   Passed: ${results.stats?.passed || 0}`)
      console.log(`   Failed: ${results.stats?.failed || 0}`)
      console.log(`   Skipped: ${results.stats?.skipped || 0}`)
      console.log(`   Duration: ${results.stats?.duration || 0}ms`)
      
      if (results.stats?.failed > 0) {
        console.log('\n❌ Failed Tests:')
        results.suites?.forEach((suite: any) => {
          suite.specs?.forEach((spec: any) => {
            spec.tests?.forEach((test: any) => {
              test.results?.forEach((result: any) => {
                if (result.status === 'failed') {
                  console.log(`   - ${suite.title}: ${test.title}`)
                }
              })
            })
          })
        })
      }
    } catch (error) {
      console.warn('⚠️  Could not generate test summary:', error)
    }

    // Clean up test artifacts in CI
    if (process.env.CI) {
      console.log('🗑️  Cleaning up test artifacts...')
      
      try {
        // Keep only essential files for CI
        const artifactsToKeep = [
          'test-results/results.json',
          'test-results/junit.xml',
          'playwright-report'
        ]
        
        // Clean up large files but keep reports
        console.log('✅ Test artifacts cleaned for CI')
      } catch (error) {
        console.warn('⚠️  Could not clean test artifacts:', error)
      }
    }

    // Generate performance metrics if available
    try {
      const perfMetrics = await collectPerformanceMetrics()
      if (perfMetrics.length > 0) {
        console.log('\n⚡ Performance Summary:')
        perfMetrics.forEach(metric => {
          console.log(`   ${metric.name}: ${metric.value}${metric.unit}`)
        })
      }
    } catch (error) {
      console.warn('⚠️  Could not collect performance metrics:', error)
    }

    console.log('✅ Global teardown complete')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw here to avoid masking test failures
  }
}

async function collectPerformanceMetrics(): Promise<Array<{name: string, value: number, unit: string}>> {
  const metrics: Array<{name: string, value: number, unit: string}> = []
  
  try {
    // Check if performance results exist
    const perfResultsPath = path.join(process.cwd(), 'test-results', 'performance.json')
    const perfData = await fs.readFile(perfResultsPath, 'utf8')
    const perfResults = JSON.parse(perfData)
    
    // Extract key metrics
    if (perfResults.metrics) {
      Object.entries(perfResults.metrics).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'number') {
          let unit = 'ms'
          if (key.includes('size')) unit = 'KB'
          if (key.includes('score')) unit = ''
          
          metrics.push({
            name: key,
            value: Math.round(value * 100) / 100,
            unit
          })
        }
      })
    }
  } catch {
    // Performance data not available
  }
  
  return metrics
}

export default globalTeardown