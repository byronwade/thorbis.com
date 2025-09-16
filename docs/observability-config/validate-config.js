#!/usr/bin/env node

/**
 * Thorbis Observability Configuration Validator
 * 
 * Validates that all observability configuration files meet acceptance criteria:
 * - Dashboard widgets reference real metric names
 * - Alerts have clear runbooks with exact queries and rollback steps
 * - SLO targets are properly defined and measurable
 * - Audit export specification is complete and implementable
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Validating Thorbis Observability Configuration\n')

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateSLOs() {
  console.log('📊 Validating SLOs...')
  
  const sloContent = fs.readFileSync(path.join(__dirname, 'slos.md'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for required SLO targets
  const requiredSLOs = [
    { name: 'API Availability', target: '99.9%' },
    { name: 'Tool Latency p95', target: '<700ms' },
    { name: 'Template Generation p99', target: '<3s' },
    { name: 'MTTR', target: '<2h' }
  ]
  
  requiredSLOs.forEach(slo => {
    if (!sloContent.includes(slo.name) || !sloContent.includes(slo.target)) {
      results.issues.push(`Missing or incorrect SLO: ${slo.name} (${slo.target})`)
      results.pass = false
    }
  })
  
  // Check for measurement queries
  const requiredQueries = [
    'sum(rate(thorbis_http_requests_total',
    'histogram_quantile(0.95',
    'histogram_quantile(0.99',
    'thorbis_tool_execution_duration_seconds'
  ]
  
  requiredQueries.forEach(query => {
    if (!sloContent.includes(query)) {
      results.issues.push(`Missing measurement query: ${query}`)
      results.pass = false
    }
  })
  
  // Check for error budget definitions
  if (!sloContent.includes('Error Budget Policy') || 
      !sloContent.includes('43.2 minutes')) {
    results.issues.push('Missing error budget policy or calculations')
    results.pass = false
  }
  
  console.log(results.pass ? '✅ SLOs valid' : '❌ SLO validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateDashboards() {
  console.log('📈 Validating Dashboards...')
  
  const dashboardContent = fs.readFileSync(path.join(__dirname, 'dashboards.json'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  let dashboardConfig
  try {
    dashboardConfig = JSON.parse(dashboardContent)
  } catch (error) {
    results.issues.push('Invalid JSON format')
    results.pass = false
    console.log('❌ Dashboard validation failed - Invalid JSON')
    console.log()
    return false
  }
  
  // Check for required real metric names (not placeholders)
  const requiredMetrics = [
    'thorbis_http_requests_total',
    'thorbis_http_request_duration_seconds',
    'thorbis_tool_execution_duration_seconds',
    'thorbis_tool_execution_errors_total',
    'thorbis_ai_tokens_consumed_total',
    'thorbis_ai_cost_usd_total',
    'thorbis_cache_hits_total',
    'thorbis_cache_misses_total',
    'thorbis_db_connections_active'
  ]
  
  requiredMetrics.forEach(metric => {
    if (!dashboardContent.includes(metric)) {
      results.issues.push(`Missing required metric: ${metric}`)
      results.pass = false
    }
  })
  
  // Check dashboard structure
  if (!dashboardConfig.dashboards || dashboardConfig.dashboards.length === 0) {
    results.issues.push('No dashboards defined')
    results.pass = false
  }
  
  // Validate each dashboard has required fields
  dashboardConfig.dashboards?.forEach((dashboard, index) => {
    if (!dashboard.title || !dashboard.panels) {
      results.issues.push(`Dashboard ${index} missing title or panels`)
      results.pass = false
    }
    
    // Check for real PromQL expressions, not placeholders
    dashboard.panels?.forEach((panel, panelIndex) => {
      panel.targets?.forEach((target, targetIndex) => {
        if (target.expr && (
          target.expr.includes('{{metric_name}}') || 
          target.expr.includes('placeholder') ||
          target.expr.includes('example_metric')
        )) {
          results.issues.push(`Dashboard ${index}, panel ${panelIndex}, target ${targetIndex} contains placeholder metrics`)
          results.pass = false
        }
      })
    })
  })
  
  // Check metric definitions section
  if (!dashboardConfig.metric_definitions) {
    results.issues.push('Missing metric definitions section')
    results.pass = false
  }
  
  console.log(results.pass ? '✅ Dashboards valid' : '❌ Dashboard validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateAlerts() {
  console.log('🚨 Validating Alerts...')
  
  const alertContent = fs.readFileSync(path.join(__dirname, 'alerts.yaml'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for required alert categories
  const requiredAlerts = [
    'ThorbisSLOAPIAvailabilityBreach',
    'ThorbisTrafficSpikeHigh', 
    'ThorbisWebhookHighFailureRate',
    'ThorbisSchemaVersionMismatch',
    'ThorbisBudgetLimitExceeded'
  ]
  
  requiredAlerts.forEach(alert => {
    if (!alertContent.includes(alert)) {
      results.issues.push(`Missing required alert: ${alert}`)
      results.pass = false
    }
  })
  
  // Check for runbook content with exact queries
  const requiredRunbookElements = [
    'Investigation Steps',
    'kubectl',
    'promql',
    'Rollback Steps',
    'kubectl rollout undo',
    'Recovery Actions',
    '```bash',
    '```promql'
  ]
  
  requiredRunbookElements.forEach(element => {
    if (!alertContent.includes(element)) {
      results.issues.push(`Missing runbook element: ${element}`)
      results.pass = false
    }
  })
  
  // Check for specific alert thresholds
  const requiredThresholds = [
    '< 0.999',  // API availability
    '> 700',    // Tool latency
    '> 10',     // Webhook failure rate
    '> 3000'    // Template generation
  ]
  
  requiredThresholds.forEach(threshold => {
    if (!alertContent.includes(threshold)) {
      results.issues.push(`Missing specific threshold: ${threshold}`)
      results.pass = false
    }
  })
  
  // Check for escalation configuration
  if (!alertContent.includes('severity: critical') ||
      !alertContent.includes('pagerduty_configs') ||
      !alertContent.includes('slack_configs')) {
    results.issues.push('Missing proper alert escalation configuration')
    results.pass = false
  }
  
  console.log(results.pass ? '✅ Alerts valid' : '❌ Alert validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateAuditExport() {
  console.log('🔐 Validating Audit Export Specification...')
  
  const auditContent = fs.readFileSync(path.join(__dirname, 'audit-export-spec.md'), 'utf8')
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for signed export requirements
  const requiredFeatures = [
    'CSV/JSON export',
    'SHA-256',
    'event hashes',
    'digital signatures',
    'chain verification',
    'RSASSA-PSS',
    'HMAC-SHA256',
    'integrity verification'
  ]
  
  requiredFeatures.forEach(feature => {
    if (!auditContent.toLowerCase().includes(feature.toLowerCase())) {
      results.issues.push(`Missing audit export feature: ${feature}`)
      results.pass = false
    }
  })
  
  // Check for specific implementation details
  const requiredImplementations = [
    'calculateContentHash',
    'calculateChainHash',
    'signEvent',
    'verifyEventChain',
    'ExportSignature',
    'POST /api/audit/exports'
  ]
  
  requiredImplementations.forEach(impl => {
    if (!auditContent.includes(impl)) {
      results.issues.push(`Missing implementation detail: ${impl}`)
      results.pass = false
    }
  })
  
  // Check for file formats
  if (!auditContent.includes('thorbis-audit-{tenant_id}-{start_date}-{end_date}.csv') ||
      !auditContent.includes('thorbis-audit-{tenant_id}-{start_date}-{end_date}.json')) {
    results.issues.push('Missing proper file naming format specification')
    results.pass = false
  }
  
  // Check for verification procedures
  if (!auditContent.includes('verifyExportFile') ||
      !auditContent.includes('Command-line verification')) {
    results.issues.push('Missing verification procedures')
    results.pass = false
  }
  
  console.log(results.pass ? '✅ Audit export specification valid' : '❌ Audit export validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateFileCompleteness() {
  console.log('📋 Validating File Completeness...')
  
  const requiredFiles = [
    'slos.md',
    'dashboards.json', 
    'alerts.yaml',
    'audit-export-spec.md',
    'README.md'
  ]
  
  const results = {
    pass: true,
    issues: []
  }
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file)
    if (!fs.existsSync(filePath)) {
      results.issues.push(`Missing required file: ${file}`)
      results.pass = false
    } else {
      const stats = fs.statSync(filePath)
      if (stats.size === 0) {
        results.issues.push(`File is empty: ${file}`)
        results.pass = false
      }
    }
  })
  
  console.log(results.pass ? '✅ All required files present' : '❌ Missing required files')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  console.log()
  
  return results.pass
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

async function main() {
  const validationResults = []
  
  // Run all validations
  validationResults.push(validateFileCompleteness())
  validationResults.push(validateSLOs())
  validationResults.push(validateDashboards())
  validationResults.push(validateAlerts())
  validationResults.push(validateAuditExport())
  
  // Summary
  const allPassed = validationResults.every(result => result === true)
  const passedCount = validationResults.filter(result => result === true).length
  const totalCount = validationResults.length
  
  console.log('=' .repeat(60))
  console.log('📊 VALIDATION SUMMARY')
  console.log('=' .repeat(60))
  console.log(`Overall Result: ${allPassed ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Tests Passed: ${passedCount}/${totalCount}`)
  console.log()
  
  if (allPassed) {
    console.log('🎉 All observability configuration files are valid!')
    console.log('✅ Dashboard widgets reference real metric names')
    console.log('✅ Alerts have clear runbooks with exact queries') 
    console.log('✅ SLO targets meet acceptance criteria')
    console.log('✅ Audit export supports signed CSV/JSON with event hashes')
    console.log()
    console.log('Ready for production deployment! 🚀')
  } else {
    console.log('❌ Configuration validation failed.')
    console.log('Please review the issues above and fix them before deployment.')
    process.exit(1)
  }
}

// Run validation
main().catch(error => {
  console.error('❌ Validation script failed:', error)
  process.exit(1)
})

module.exports = {
  validateSLOs,
  validateDashboards, 
  validateAlerts,
  validateAuditExport,
  validateFileCompleteness
}
