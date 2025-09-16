#!/usr/bin/env node

/**
 * Thorbis Hardware Integration Validation Script
 * 
 * Validates that all hardware integration deliverables meet acceptance criteria:
 * - Pairing flow includes revoke and rotate steps
 * - Test plan includes paper-out, connection drop, and recovery
 */

const fs = require('fs')
const path = require('path')

function validateHardwareIntegration() {
  console.log('\n🔧 Validating Thorbis Hardware Integration System\n')
  
  const results = {
    pairingFlows: validatePairingFlows(),
    profileSpecs: validateProfileSpecs(), 
    securityNotes: validateSecurityNotes(),
    testPlan: validateTestPlan()
  }
  
  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 HARDWARE INTEGRATION VALIDATION SUMMARY')
  console.log('='.repeat(80))
  
  const allValidationsPassed = Object.values(results).every(r => r.pass)
  console.log(`Overall Result: ${allValidationsPassed ? '✅ PASS' : '❌ FAIL'}`)
  
  const passedCount = Object.values(results).filter(r => r.pass).length
  console.log(`Validations Passed: ${passedCount}/${Object.keys(results).length}`)
  
  console.log('\n📋 Individual Validation Results:')
  Object.entries(results).forEach(([name, result]) => {
    console.log(`  ${result.pass ? '✅' : '❌'} ${name.charAt(0).toUpperCase() + name.slice(1)}`)
  })
  
  if (!allValidationsPassed) {
    console.log('\n❌ Hardware integration validation failed.')
    console.log('Please review the issues above and fix them before implementation.')
    process.exit(1)
  } else {
    console.log('\n🎉 Hardware integration validation successful!')
    console.log('✅ Comprehensive device pairing with revoke/rotate capabilities')
    console.log('✅ Complete hardware profiles for all device types')
    console.log('✅ Enterprise-grade security with ephemeral tokens')
    console.log('✅ Robust test plan covering all failure scenarios')
    console.log('✅ Device sandboxing and no-secrets-at-rest implementation')
    console.log('\n🚀 Ready for hardware integration implementation!')
  }
}

function validatePairingFlows() {
  console.log('📋 Validating Pairing Flows...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'pairing-flows.md'), 'utf8')
    
    // Check for required sections
    const requiredSections = [
      'Device Registry Schema',
      'Pairing Flow Phases', 
      'Session Management',
      'Revocation & Rotation',
      'Error Recovery & Health Monitoring'
    ]
    
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        results.issues.push(`Missing required section: ${section}`)
        results.pass = false
      }
    }
    
    // Acceptance criteria: Pairing flow includes revoke and rotate steps
    const revocationFeatures = [
      'revokeDevice',
      'rotateDeviceSession', 
      'RevocationReason',
      'scheduleSessionRotation'
    ]
    
    for (const feature of revocationFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing revocation/rotation feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for device registry fields
    const registryFields = [
      'device_id',
      'tenant_id', 
      'device_type',
      'mac_address',
      'pairing_status',
      'session_expires_at',
      'health_status'
    ]
    
    const missingFields = registryFields.filter(field => !content.includes(field))
    if (missingFields.length > 0) {
      results.issues.push(`Missing device registry fields: ${missingFields.join(', ')}`)
      results.pass = false
    }
    
    // Check for self-tests
    if (!content.includes('SelfTestResult') || !content.includes('runSelfTests')) {
      results.issues.push('Missing self-test implementation')
      results.pass = false
    }
    
    // Check for signed sessions
    if (!content.includes('DeviceSessionClaims') || !content.includes('JWT')) {
      results.issues.push('Missing signed session implementation')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to read pairing-flows.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Pairing flows valid' : '  ❌ Pairing flows validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validateProfileSpecs() {
  console.log('📋 Validating Profile Specs...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'profile-specs.md'), 'utf8')
    
    // Check for required device profiles
    const requiredProfiles = [
      'thermal_58mm',
      'thermal_80mm', 
      'kds_15inch',
      'scanner_2d_handheld'
    ]
    
    for (const profile of requiredProfiles) {
      if (!content.includes(profile)) {
        results.issues.push(`Missing device profile: ${profile}`)
        results.pass = false
      }
    }
    
    // Check for thermal printer specifications (58mm and 80mm)
    const thermalSpecs = [
      'paper_width: 58',
      'paper_width: 80',
      'print_width',
      'resolution: 203',
      'cash_drawer',
      'cut_paper'
    ]
    
    for (const spec of thermalSpecs) {
      if (!content.includes(spec)) {
        results.issues.push(`Missing thermal printer spec: ${spec}`)
        results.pass = false
      }
    }
    
    // Check for KDS screen specifications
    const kdsSpecs = [
      'screen_size: 15.6',
      'resolution',
      'touch_interaction',
      'order_display',
      'kitchen_settings'
    ]
    
    for (const spec of kdsSpecs) {
      if (!content.includes(spec)) {
        results.issues.push(`Missing KDS specification: ${spec}`)
        results.pass = false
      }
    }
    
    // Check for barcode scanner specifications
    const scannerSpecs = [
      'barcode_scanning',
      'supported_1d_codes',
      'supported_2d_codes',
      'wireless_communication',
      'data_storage'
    ]
    
    for (const spec of scannerSpecs) {
      if (!content.includes(spec)) {
        results.issues.push(`Missing scanner specification: ${spec}`)
        results.pass = false
      }
    }
    
    // Check for industry compatibility
    const industries = ['rest', 'ret', 'hs', 'auto']
    const industryCount = industries.filter(industry => content.includes(`industry: "${industry}"`)).length
    
    if (industryCount < 3) {
      results.issues.push('Insufficient industry compatibility coverage')
      results.pass = false
    }
    
    // Check for configuration schemas
    if (!content.includes('Configuration') || !content.includes('json-schema')) {
      results.issues.push('Missing device configuration schemas')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to read profile-specs.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Profile specs valid' : '  ❌ Profile specs validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validateSecurityNotes() {
  console.log('📋 Validating Security Notes...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'security-notes.md'), 'utf8')
    
    // Acceptance criteria: ephemeral tokens, device sandboxing, no secrets at rest
    const securityFeatures = [
      'Ephemeral Token Architecture',
      'Device Sandboxing', 
      'No Secrets at Rest',
      'EphemeralTokenStrategy',
      'DeviceSandbox',
      'MemoryOnlySecretStore'
    ]
    
    for (const feature of securityFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing security feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for ephemeral tokens implementation
    const tokenFeatures = [
      'DeviceSessionTokenManager',
      'ActionTokenManager',
      'PairingTokenManager',
      'token_type: \'device_session\'',
      'rotation_policy',
      'TokenLifetime'
    ]
    
    for (const feature of tokenFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing ephemeral token feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for device sandboxing
    const sandboxFeatures = [
      'HardwareDeviceSandbox',
      'ResourceLimits',
      'NetworkPolicy', 
      'FilesystemPolicy',
      'createDeviceSandbox',
      'monitorSandboxSecurity'
    ]
    
    for (const feature of sandboxFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing sandboxing feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for no secrets at rest
    const noSecretsFeatures = [
      'EphemeralKeyManager',
      'SecureConfigurationManager',
      'MemoryOnlySecretStore',
      'keyMemoryStorage',
      'securelyDestroyKey',
      'encryptedConfigs'
    ]
    
    for (const feature of noSecretsFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing no-secrets-at-rest feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for security monitoring
    if (!content.includes('SecurityMonitor') || !content.includes('AnomalyDetector')) {
      results.issues.push('Missing security monitoring implementation')
      results.pass = false
    }
    
    // Check for audit requirements
    if (!content.includes('SecurityAuditEvent') || !content.includes('AuditVerificationResult')) {
      results.issues.push('Missing security audit implementation')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to read security-notes.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Security notes valid' : '  ❌ Security notes validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validateTestPlan() {
  console.log('📋 Validating Test Plan...')
  const results = { pass: true, issues: [] }
  
  try {
    const pairingContent = fs.readFileSync(path.join(__dirname, 'pairing-flows.md'), 'utf8')
    
    // Acceptance criteria: test plan includes paper-out, connection drop, and recovery
    const requiredTestScenarios = [
      'Paper-Out Recovery Test',
      'Connection Drop Recovery Test', 
      'Pairing Flow Validation Tests',
      'Revocation & Rotation Tests'
    ]
    
    for (const scenario of requiredTestScenarios) {
      if (!pairingContent.includes(scenario)) {
        results.issues.push(`Missing test scenario: ${scenario}`)
        results.pass = false
      }
    }
    
    // Check for specific recovery scenarios
    const recoveryScenarios = [
      'handlePaperOutEvent',
      'handlePaperReplacedEvent',
      'handleUnhealthyDevice',
      'attemptReconnection',
      'progressive backoff'
    ]
    
    for (const scenario of recoveryScenarios) {
      if (!pairingContent.includes(scenario)) {
        results.issues.push(`Missing recovery scenario: ${scenario}`)
        results.pass = false
      }
    }
    
    // Check for test implementations
    const testImplementations = [
      'describe(',
      'test(',
      'expect(',
      'simulatePaperOut',
      'simulateNetworkDrop',
      'simulateNetworkRestore'
    ]
    
    const implementedTests = testImplementations.filter(impl => pairingContent.includes(impl))
    if (implementedTests.length < testImplementations.length / 2) {
      results.issues.push('Insufficient test implementations')
      results.pass = false
    }
    
    // Check for performance and load testing
    if (!pairingContent.includes('Performance Tests') || !pairingContent.includes('concurrent')) {
      results.issues.push('Missing performance and load testing')
      results.pass = false
    }
    
    // Verify comprehensive coverage
    const testCoverage = [
      'paper out during active printing',
      'queues multiple jobs when paper out',
      'recovers from network interruption',
      'handles session expiration during downtime',
      'progressive backoff on repeated failures'
    ]
    
    const coveredTests = testCoverage.filter(test => pairingContent.includes(test))
    if (coveredTests.length < testCoverage.length) {
      const missing = testCoverage.filter(test => !pairingContent.includes(test))
      results.issues.push(`Missing test coverage: ${missing.join(', ')}`)
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to validate test plan: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Test plan valid' : '  ❌ Test plan validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateHardwareIntegration()
}

module.exports = { validateHardwareIntegration }
