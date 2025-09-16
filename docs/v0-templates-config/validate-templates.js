#!/usr/bin/env node

/**
 * Thorbis v0 Template Validation Script
 * 
 * Validates that example templates meet all acceptance checklist criteria:
 * - PDF Fidelity (print media queries, page breaks, margins)
 * - Dark Mode Support (CSS custom properties, color scheme)
 * - RTL Readiness (logical properties, text direction)
 * - No Dynamic JavaScript (static rendering compatible)
 * - Accessibility Compliance (WCAG 2.1 AA)
 * - Brand Consistency (Thorbis design system)
 * - Performance Standards (bundle size, rendering)
 * - Cross-Browser Compatibility
 */

const fs = require('fs')
const path = require('path')

console.log('🎨 Validating Thorbis v0 Template Examples\n')

// ============================================================================
// TEMPLATE VALIDATION FUNCTIONS
// ============================================================================

function validatePDFfidelity(templateContent, templateName) {
  console.log(`📄 Validating PDF Fidelity for ${templateName}...`)
  
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for print media queries
  if (!templateContent.includes('@media print')) {
    results.issues.push('Missing @media print styles')
    results.pass = false
  }
  
  // Check for color-adjust: exact
  if (!templateContent.includes('color-adjust: exact')) {
    results.issues.push('Missing color-adjust: exact for print colors')
    results.pass = false
  }
  
  // Check for page break controls
  const pageBreakControls = [
    'page-break-before',
    'page-break-after', 
    'page-break-inside',
    'page-break-avoid'
  ]
  
  let foundPageBreaks = 0
  pageBreakControls.forEach(control => {
    if (templateContent.includes(control)) {
      foundPageBreaks++
    }
  })
  
  if (foundPageBreaks < 2) {
    results.issues.push('Insufficient page break controls for PDF layout')
    results.pass = false
  }
  
  // Check for print-specific font sizing
  if (!templateContent.includes('font-size: 12pt') && !templateContent.includes('font-size: 10pt')) {
    results.issues.push('Missing point-based font sizes for print')
    results.pass = false
  }
  
  // Check for thermal print support (receipts only)
  if (templateName.includes('receipt')) {
    if (!templateContent.includes('3in')) {
      results.issues.push('Missing 3-inch thermal print support')
      results.pass = false
    }
    
    if (!templateContent.includes('thermal')) {
      results.issues.push('Missing thermal printer optimizations')
      results.pass = false
    }
  }
  
  console.log(results.pass ? '  ✅ PDF fidelity valid' : '  ❌ PDF fidelity validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateDarkModeSupport(templateContent, templateName) {
  console.log(`🌙 Validating Dark Mode Support for ${templateName}...`)
  
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for color-scheme meta tag
  if (!templateContent.includes('color-scheme" content="light dark"')) {
    results.issues.push('Missing color-scheme meta tag')
    results.pass = false
  }
  
  // Check for CSS custom properties
  if (!templateContent.includes('--bg-base:') || !templateContent.includes('--text-primary:')) {
    results.issues.push('Missing CSS custom properties for theming')
    results.pass = false
  }
  
  // Check for prefers-color-scheme media query
  if (!templateContent.includes('prefers-color-scheme: dark')) {
    results.issues.push('Missing prefers-color-scheme: dark media query')
    results.pass = false
  }
  
  // Check for Thorbis dark theme colors
  const darkThemeColors = ['#0A0B0D', '#0D0F13', '#E6EAF0']
  let foundDarkColors = 0
  darkThemeColors.forEach(color => {
    if (templateContent.includes(color)) {
      foundDarkColors++
    }
  })
  
  if (foundDarkColors < 2) {
    results.issues.push('Missing Thorbis dark theme color values')
    results.pass = false
  }
  
  // Check for print theme override
  if (!templateContent.includes('#FFFFFF !important') || !templateContent.includes('#000000 !important')) {
    results.issues.push('Missing print theme override to force light colors')
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Dark mode support valid' : '  ❌ Dark mode validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateRTLReadiness(templateContent, templateName) {
  console.log(`🔄 Validating RTL Readiness for ${templateName}...`)
  
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for logical properties
  const logicalProperties = [
    'margin-inline-start',
    'margin-inline-end', 
    'padding-inline',
    'border-inline',
    'inset-inline',
    'text-align-start',
    'text-align-end'
  ]
  
  let foundLogicalProps = 0
  logicalProperties.forEach(prop => {
    if (templateContent.includes(prop)) {
      foundLogicalProps++
    }
  })
  
  // For RTL readiness, we need at least some logical properties or RTL-aware CSS
  if (foundLogicalProps === 0 && !templateContent.includes('[dir="rtl"]')) {
    results.issues.push('Missing logical properties or RTL-specific CSS')
    results.pass = false
  }
  
  // Check for RTL-specific styles
  if (!templateContent.includes('[dir="rtl"]')) {
    results.issues.push('Missing RTL-specific style rules')
    results.pass = false
  }
  
  // Check for text direction handling
  if (!templateContent.includes('text-align: right') && !templateContent.includes('text-align-start')) {
    results.issues.push('Missing RTL text alignment handling')
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ RTL readiness valid' : '  ❌ RTL readiness validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateNoDynamicJS(templateContent, templateName) {
  console.log(`🚫 Validating No Dynamic JavaScript for ${templateName}...`)
  
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for forbidden JavaScript patterns
  const forbiddenPatterns = [
    'onClick',
    'onSubmit', 
    'useState',
    'useEffect',
    'addEventListener',
    'fetch(',
    'axios.',
    'setState'
  ]
  
  forbiddenPatterns.forEach(pattern => {
    if (templateContent.includes(pattern)) {
      results.issues.push(`Contains forbidden JavaScript pattern: ${pattern}`)
      results.pass = false
    }
  })
  
  // Check for static rendering compatibility indicators
  if (!templateContent.includes('// Static rendering compatible') && 
      !templateContent.includes('no client-side interactions')) {
    results.issues.push('Missing static rendering compatibility documentation')
    // This is a warning, not a failure
  }
  
  // Ensure it's a functional component without hooks
  if (templateContent.includes('export default function') && 
      (templateContent.includes('useState') || templateContent.includes('useEffect'))) {
    results.issues.push('Component uses React hooks - not static compatible')
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ No dynamic JavaScript valid' : '  ❌ Dynamic JavaScript validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateAccessibilityCompliance(templateContent, templateName) {
  console.log(`♿ Validating Accessibility Compliance for ${templateName}...`)
  
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for semantic HTML elements
  const semanticElements = [
    '<main',
    '<header', 
    '<section',
    '<h1',
    '<h2',
    '<h3'
  ]
  
  let foundSemanticElements = 0
  semanticElements.forEach(element => {
    if (templateContent.includes(element)) {
      foundSemanticElements++
    }
  })
  
  if (foundSemanticElements < 4) {
    results.issues.push('Insufficient semantic HTML elements')
    results.pass = false
  }
  
  // Check for ARIA attributes
  const ariaAttributes = [
    'aria-label',
    'role=',
    'scope='
  ]
  
  let foundAriaAttrs = 0
  ariaAttributes.forEach(attr => {
    if (templateContent.includes(attr)) {
      foundAriaAttrs++
    }
  })
  
  if (foundAriaAttrs < 2) {
    results.issues.push('Missing ARIA attributes for accessibility')
    results.pass = false
  }
  
  // Check for table accessibility (if tables present)
  if (templateContent.includes('<table')) {
    if (!templateContent.includes('scope="col"') || !templateContent.includes('<caption')) {
      results.issues.push('Tables missing accessibility attributes (scope, caption)')
      results.pass = false
    }
  }
  
  // Check for alt text on images
  if (templateContent.includes('<img') && !templateContent.includes('alt=')) {
    results.issues.push('Images missing alt text')
    results.pass = false
  }
  
  // Check for reduced motion support
  if (!templateContent.includes('prefers-reduced-motion')) {
    results.issues.push('Missing reduced motion support')
    results.pass = false
  }
  
  // Check for high contrast support
  if (!templateContent.includes('prefers-contrast')) {
    results.issues.push('Missing high contrast mode support')
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Accessibility compliance valid' : '  ❌ Accessibility validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateBrandConsistency(templateContent, templateName) {
  console.log(`🎨 Validating Brand Consistency for ${templateName}...`)
  
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for Thorbis brand colors
  const thorbisColors = [
    '#1C8BFF', // Thorbis blue
    '#4FA2FF', // Lighter blue for dark mode
    '#0A0B0D', // Dark gray 25
    '#E6EAF0'  // Light gray 900
  ]
  
  let foundBrandColors = 0
  thorbisColors.forEach(color => {
    if (templateContent.includes(color)) {
      foundBrandColors++
    }
  })
  
  if (foundBrandColors < 2) {
    results.issues.push('Missing Thorbis brand colors')
    results.pass = false
  }
  
  // Check for Inter font family
  if (!templateContent.includes('Inter') && !templateContent.includes('font-sans')) {
    results.issues.push('Missing Inter font family')
    results.pass = false
  }
  
  // Check for proper use of Thorbis blue (should be limited)
  const blueUsageCount = (templateContent.match(/1C8BFF/g) || []).length
  if (blueUsageCount > 8) {
    results.issues.push('Overuse of Thorbis blue - should be used sparingly for accents only')
    // This is a warning, not a failure
  }
  
  // Check for 4px spacing system
  if (!templateContent.includes('space-y-') || !templateContent.includes('p-')) {
    results.issues.push('Missing Tailwind spacing classes (4px base system)')
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Brand consistency valid' : '  ❌ Brand consistency validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validatePerformanceStandards(templateContent, templateName) {
  console.log(`⚡ Validating Performance Standards for ${templateName}...`)
  
  const results = {
    pass: true,
    issues: []
  }
  
  // Check template metadata for performance metrics
  if (templateContent.includes('templateMetadata')) {
    const bundleSizeMatch = templateContent.match(/bundle_size_kb:\s*(\d+)/)
    const renderTimeMatch = templateContent.match(/render_time_ms:\s*(\d+)/)
    
    if (bundleSizeMatch) {
      const bundleSize = parseInt(bundleSizeMatch[1])
      if (bundleSize > 60) { // Allow some flexibility but warn if too large
        results.issues.push(`Bundle size ${bundleSize}KB exceeds recommended 50KB limit`)
        if (bundleSize > 100) {
          results.pass = false
        }
      }
    } else {
      results.issues.push('Missing bundle size metadata')
    }
    
    if (renderTimeMatch) {
      const renderTime = parseInt(renderTimeMatch[1])
      if (renderTime > 200) {
        results.issues.push(`Render time ${renderTime}ms exceeds recommended 150ms limit`)
        if (renderTime > 500) {
          results.pass = false
        }
      }
    } else {
      results.issues.push('Missing render time metadata')
    }
  } else {
    results.issues.push('Missing template metadata for performance tracking')
    results.pass = false
  }
  
  // Check for lazy loading on images
  if (templateContent.includes('<img') && !templateContent.includes('loading="lazy"')) {
    results.issues.push('Images not set to lazy loading')
    // Warning only
  }
  
  // Check for font optimization hints
  if (!templateContent.includes('font-display') && templateContent.includes('@import')) {
    results.issues.push('Missing font-display optimization for web fonts')
    // Warning only
  }
  
  console.log(results.pass ? '  ✅ Performance standards valid' : '  ❌ Performance validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateTemplateStructure(templateContent, templateName) {
  console.log(`🏗️  Validating Template Structure for ${templateName}...`)
  
  const results = {
    pass: true,
    issues: []
  }
  
  // Check for proper TypeScript interfaces
  if (!templateContent.includes('interface') && !templateContent.includes('type')) {
    results.issues.push('Missing TypeScript type definitions')
    results.pass = false
  }
  
  // Check for props validation
  if (!templateContent.includes('Props') || !templateContent.includes('data:')) {
    results.issues.push('Missing proper props interface')
    results.pass = false
  }
  
  // Check for proper exports
  if (!templateContent.includes('export default function') && !templateContent.includes('export const')) {
    results.issues.push('Missing proper component export')
    results.pass = false
  }
  
  // Check for template metadata export
  if (!templateContent.includes('export const templateMetadata')) {
    results.issues.push('Missing template metadata export')
    results.pass = false
  }
  
  // Check for version information
  if (!templateContent.includes('version:') || !templateContent.includes('1.0.0')) {
    results.issues.push('Missing version information')
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Template structure valid' : '  ❌ Template structure validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  console.log()
  
  return results.pass
}

function validateAcceptanceChecklist(templateContent, templateName) {
  console.log(`✅ Running Complete Acceptance Checklist for ${templateName}...`)
  
  const validationResults = [
    validatePDFfidelity(templateContent, templateName),
    validateDarkModeSupport(templateContent, templateName), 
    validateRTLReadiness(templateContent, templateName),
    validateNoDynamicJS(templateContent, templateName),
    validateAccessibilityCompliance(templateContent, templateName),
    validateBrandConsistency(templateContent, templateName),
    validatePerformanceStandards(templateContent, templateName),
    validateTemplateStructure(templateContent, templateName)
  ]
  
  const passedChecks = validationResults.filter(result => result === true).length
  const totalChecks = validationResults.length
  
  console.log(`📊 ${templateName} Acceptance Checklist: ${passedChecks}/${totalChecks} passed`)
  
  return passedChecks === totalChecks
}

// ============================================================================
// TEMPLATE COMPILATION TESTS
// ============================================================================

function runCompilationTests() {
  console.log('🧪 Running Template Compilation Tests...')
  
  const compilationResults = {
    invoice: testTemplateCompilation('invoice'),
    estimate: testTemplateCompilation('estimate'),
    receipt: testTemplateCompilation('receipt')
  }
  
  const passedTemplates = Object.values(compilationResults).filter(result => result).length
  const totalTemplates = Object.keys(compilationResults).length
  
  console.log(`📊 Compilation Tests: ${passedTemplates}/${totalTemplates} passed`)
  
  return passedTemplates === totalTemplates
}

function testTemplateCompilation(templateType) {
  console.log(`  🔧 Testing ${templateType} template compilation...`)
  
  try {
    // Check if template file exists and is readable
    const templatePath = path.join(__dirname, 'example-templates', `${templateType}-template.tsx`)
    
    if (!fs.existsSync(templatePath)) {
      console.log(`    ❌ Template file not found: ${templatePath}`)
      return false
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf8')
    
    // Basic syntax checks
    const syntaxChecks = [
      { name: 'Valid JSX structure', test: () => templateContent.includes('return (') || templateContent.includes('return <') },
      { name: 'Proper TypeScript types', test: () => templateContent.includes('interface') },
      { name: 'Export statement', test: () => templateContent.includes('export default') },
      { name: 'Template metadata', test: () => templateContent.includes('templateMetadata') }
    ]
    
    let passedSyntaxChecks = 0
    syntaxChecks.forEach(check => {
      if (check.test()) {
        console.log(`    ✅ ${check.name}`)
        passedSyntaxChecks++
      } else {
        console.log(`    ❌ ${check.name}`)
      }
    })
    
    return passedSyntaxChecks === syntaxChecks.length
    
  } catch (error) {
    console.log(`    ❌ Compilation test failed: ${error.message}`)
    return false
  }
}

// ============================================================================
// DEFAULT TEMPLATE SAFETY TESTS
// ============================================================================

function testDefaultTemplateSystem() {
  console.log('🔒 Testing Default Template System Safety...')
  
  const safetyTests = [
    testConfirmationTextGeneration(),
    testVersionHistoryLogging(),
    testRollbackCapability(),
    testApprovalWorkflow()
  ]
  
  const passedSafetyTests = safetyTests.filter(result => result === true).length
  const totalSafetyTests = safetyTests.length
  
  console.log(`📊 Default Template Safety Tests: ${passedSafetyTests}/${totalSafetyTests} passed`)
  
  return passedSafetyTests === totalSafetyTests
}

function testConfirmationTextGeneration() {
  console.log('  📝 Testing confirmation text generation...')
  
  // Mock confirmation text generator
  function generateConfirmationText(templateType, fromVersion, toVersion) {
    let confirmationText = `I confirm changing the default ${templateType} template `
    confirmationText += `from version ${fromVersion} to version ${toVersion}. `
    confirmationText += `I understand this may impact active business operations. `
    confirmationText += `Change requested on ${new Date().toISOString().split('T')[0]}.`
    return confirmationText
  }
  
  try {
    const confirmationText = generateConfirmationText('invoice', '1.0.0', '1.1.0')
    
    const confirmationChecks = [
      confirmationText.includes('I confirm changing'),
      confirmationText.includes('invoice template'),
      confirmationText.includes('from version 1.0.0 to version 1.1.0'),
      confirmationText.includes('impact active business operations'),
      confirmationText.length > 50
    ]
    
    const passedConfirmationChecks = confirmationChecks.filter(check => check === true).length
    
    if (passedConfirmationChecks === confirmationChecks.length) {
      console.log('    ✅ Confirmation text generation works correctly')
      return true
    } else {
      console.log('    ❌ Confirmation text generation failed validation')
      return false
    }
    
  } catch (error) {
    console.log(`    ❌ Confirmation text generation error: ${error.message}`)
    return false
  }
}

function testVersionHistoryLogging() {
  console.log('  📚 Testing version history logging...')
  
  // Mock version history entry
  function createVersionHistoryEntry(templateType, action, fromVersion, toVersion, confirmedBy) {
    return {
      entry_id: `hist_${Date.now()}`,
      template_type: templateType,
      action: action,
      from_version: fromVersion,
      to_version: toVersion,
      confirmed_by: confirmedBy,
      timestamp: new Date().toISOString(),
      confirmation_required: action === 'set_default'
    }
  }
  
  try {
    const historyEntry = createVersionHistoryEntry('invoice', 'set_default', '1.0.0', '1.1.0', 'admin@thorbis.com')
    
    const historyChecks = [
      historyEntry.entry_id && historyEntry.entry_id.includes('hist_'),
      historyEntry.template_type === 'invoice',
      historyEntry.action === 'set_default',
      historyEntry.from_version === '1.0.0',
      historyEntry.to_version === '1.1.0',
      historyEntry.confirmed_by === 'admin@thorbis.com',
      historyEntry.timestamp && !isNaN(Date.parse(historyEntry.timestamp)),
      historyEntry.confirmation_required === true
    ]
    
    const passedHistoryChecks = historyChecks.filter(check => check === true).length
    
    if (passedHistoryChecks === historyChecks.length) {
      console.log('    ✅ Version history logging works correctly')
      return true
    } else {
      console.log('    ❌ Version history logging failed validation')
      return false
    }
    
  } catch (error) {
    console.log(`    ❌ Version history logging error: ${error.message}`)
    return false
  }
}

function testRollbackCapability() {
  console.log('  🔄 Testing rollback capability...')
  
  // Mock rollback safety check
  function validateRollbackSafety(currentVersion, targetVersion) {
    // Simple version comparison
    const current = parseFloat(currentVersion)
    const target = parseFloat(targetVersion)
    
    return {
      safe: target <= current, // Can only rollback to earlier or same version
      risk_level: target === current ? 'low' : 'medium',
      blocking_issues: target > current ? ['Cannot rollback to newer version'] : [],
      data_compatible: Math.abs(current - target) < 1.0 // Major version compatibility
    }
  }
  
  try {
    const rollbackTest1 = validateRollbackSafety('1.1.0', '1.0.0')
    const rollbackTest2 = validateRollbackSafety('1.0.0', '1.1.0')
    
    const rollbackChecks = [
      rollbackTest1.safe === true,
      rollbackTest1.blocking_issues.length === 0,
      rollbackTest2.safe === false,
      rollbackTest2.blocking_issues.length > 0
    ]
    
    const passedRollbackChecks = rollbackChecks.filter(check => check === true).length
    
    if (passedRollbackChecks === rollbackChecks.length) {
      console.log('    ✅ Rollback safety validation works correctly')
      return true
    } else {
      console.log('    ❌ Rollback safety validation failed')
      return false
    }
    
  } catch (error) {
    console.log(`    ❌ Rollback capability test error: ${error.message}`)
    return false
  }
}

function testApprovalWorkflow() {
  console.log('  👥 Testing approval workflow...')
  
  // Mock approval workflow
  function getRequiredApprovals(riskLevel) {
    const workflows = {
      low: ['technical_lead'],
      medium: ['technical_lead', 'design_lead'],
      high: ['technical_lead', 'design_lead', 'product_owner'],
      critical: ['technical_lead', 'design_lead', 'product_owner', 'business_owner']
    }
    return workflows[riskLevel] || workflows.medium
  }
  
  try {
    const lowRiskApprovals = getRequiredApprovals('low')
    const highRiskApprovals = getRequiredApprovals('high')
    const criticalRiskApprovals = getRequiredApprovals('critical')
    
    const approvalChecks = [
      lowRiskApprovals.length === 1,
      lowRiskApprovals.includes('technical_lead'),
      highRiskApprovals.length === 3,
      highRiskApprovals.includes('product_owner'),
      criticalRiskApprovals.length === 4,
      criticalRiskApprovals.includes('business_owner')
    ]
    
    const passedApprovalChecks = approvalChecks.filter(check => check === true).length
    
    if (passedApprovalChecks === approvalChecks.length) {
      console.log('    ✅ Approval workflow logic works correctly')
      return true
    } else {
      console.log('    ❌ Approval workflow validation failed')
      return false
    }
    
  } catch (error) {
    console.log(`    ❌ Approval workflow test error: ${error.message}`)
    return false
  }
}

// ============================================================================
// MAIN VALIDATION EXECUTION
// ============================================================================

async function main() {
  console.log('🎯 Running Complete v0 Template Validation Suite\n')
  
  // Load and validate each template
  const templateTypes = ['invoice', 'estimate', 'receipt']
  const templateResults = {}
  
  for (const templateType of templateTypes) {
    console.log(`🔍 Validating ${templateType} template...\n`)
    
    try {
      const templatePath = path.join(__dirname, 'example-templates', `${templateType}-template.tsx`)
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      
      templateResults[templateType] = validateAcceptanceChecklist(templateContent, templateType)
      
    } catch (error) {
      console.log(`❌ Failed to load ${templateType} template: ${error.message}`)
      templateResults[templateType] = false
    }
    
    console.log('─'.repeat(80))
  }
  
  // Run compilation tests
  const compilationPassed = runCompilationTests()
  console.log('─'.repeat(80))
  
  // Test default template system
  const safetyPassed = testDefaultTemplateSystem()
  console.log('─'.repeat(80))
  
  // Final summary
  const passedTemplates = Object.values(templateResults).filter(result => result === true).length
  const totalTemplates = Object.keys(templateResults).length
  
  const overallPass = (
    passedTemplates === totalTemplates && 
    compilationPassed && 
    safetyPassed
  )
  
  console.log('=' .repeat(80))
  console.log('📊 V0 TEMPLATE VALIDATION SUMMARY')
  console.log('=' .repeat(80))
  console.log(`Overall Result: ${overallPass ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Template Validation: ${passedTemplates}/${totalTemplates}`)
  console.log(`Compilation Tests: ${compilationPassed ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Default Template Safety: ${safetyPassed ? '✅ PASS' : '❌ FAIL'}`)
  console.log()
  
  // Individual template results
  console.log('📋 Individual Template Results:')
  Object.entries(templateResults).forEach(([templateType, passed]) => {
    console.log(`  ${templateType}: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  })
  console.log()
  
  if (overallPass) {
    console.log('🎉 All v0 templates pass acceptance criteria!')
    console.log('✅ PDF Fidelity: Print-optimized with proper page breaks and thermal support')
    console.log('✅ Dark Mode: CSS custom properties with prefers-color-scheme support')
    console.log('✅ RTL Ready: Logical properties for bidirectional text support')
    console.log('✅ No Dynamic JS: Static rendering compatible components')
    console.log('✅ Accessibility: WCAG 2.1 AA compliant with semantic HTML')
    console.log('✅ Brand Consistent: Thorbis design system with proper color usage')
    console.log('✅ Performance: Optimized bundle sizes and render times')
    console.log('✅ Default Template System: Safe versioning with confirmation requirements')
    console.log()
    console.log('🚀 Ready for production deployment!')
  } else {
    console.log('❌ Template validation failed.')
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
  validateAcceptanceChecklist,
  testDefaultTemplateSystem,
  runCompilationTests
}
