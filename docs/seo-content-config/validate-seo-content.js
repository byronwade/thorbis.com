#!/usr/bin/env node

/**
 * Thorbis SEO Content Plan Validation Script
 * 
 * Validates that all SEO/content deliverables meet acceptance criteria:
 * - Example pages with correct JSON-LD
 * - CLS/LCP budgets listed and monitored
 */

const fs = require('fs')
const path = require('path')

function validateSEOContentPlan() {
  console.log('\n🔍 Validating Thorbis SEO Content Plan\n')
  
  const results = {
    sitemapPlan: validateSitemapPlan(),
    schemaMarkup: validateSchemaMarkup(),
    canonicalUrls: validateCanonicalUrls(),
    contentOps: validateContentOps(),
    performanceBudgets: validatePerformanceBudgets()
  }
  
  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 SEO CONTENT PLAN VALIDATION SUMMARY')
  console.log('='.repeat(80))
  
  const allValidationsPassed = Object.values(results).every(r => r.pass)
  console.log(`Overall Result: ${allValidationsPassed ? '✅ PASS' : '❌ FAIL'}`)
  
  const passedCount = Object.values(results).filter(r => r.pass).length
  console.log(`Validations Passed: ${passedCount}/${Object.keys(results).length}`)
  
  console.log('\n📋 Individual Validation Results:')
  Object.entries(results).forEach(([name, result]) => {
    const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')
    console.log(`  ${result.pass ? '✅' : '❌'} ${displayName}`)
  })
  
  if (!allValidationsPassed) {
    console.log('\n❌ SEO content plan validation failed.')
    console.log('Please review the issues above and fix them before implementation.')
    process.exit(1)
  } else {
    console.log('\n🎉 SEO content plan validation successful!')
    console.log('✅ Comprehensive sitemap strategy with multi-industry and geo targeting')
    console.log('✅ Complete schema markup with LocalBusiness, Product, and FAQ examples')
    console.log('✅ Canonical URL strategy with duplicate content prevention')
    console.log('✅ Content operations framework with publishing cadence')
    console.log('✅ Performance budgets with CLS/LCP monitoring')
    console.log('\n🚀 Ready for SEO content implementation!')
  }
}

function validateSitemapPlan() {
  console.log('📋 Validating Sitemap Plan...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'sitemap-plan.md'), 'utf8')
    
    // Check for required sections
    const requiredSections = [
      'Core Sitemap Architecture',
      'Industry Vertical Pages',
      'Geographic Local Pages',
      'Public Business Profile Pages',
      'Marketing & Educational Pages'
    ]
    
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        results.issues.push(`Missing required section: ${section}`)
        results.pass = false
      }
    }
    
    // Check for industry verticals
    const requiredIndustries = [
      'home-services',
      'restaurants', 
      'auto-services',
      'retail'
    ]
    
    for (const industry of requiredIndustries) {
      if (!content.includes(`/industries/${industry}/`)) {
        results.issues.push(`Missing industry vertical: ${industry}`)
        results.pass = false
      }
    }
    
    // Check for city-based pages
    const requiredCities = [
      'los-angeles',
      'houston',
      'miami',
      'new-york-city'
    ]
    
    let cityCount = 0
    for (const city of requiredCities) {
      if (content.includes(city)) {
        cityCount++
      }
    }
    
    if (cityCount < 3) {
      results.issues.push('Insufficient city page coverage (need 3+ major cities)')
      results.pass = false
    }
    
    // Check for business profile structure
    if (!content.includes('/businesses/{business-slug}/') || !content.includes('Business Profile Structure')) {
      results.issues.push('Missing business profile page structure')
      results.pass = false
    }
    
    // Check for SEO strategy elements
    const seoElements = [
      'SEO Strategy',
      'keyword',
      'Priority City Markets',
      'URL Naming Conventions'
    ]
    
    for (const element of seoElements) {
      if (!content.includes(element)) {
        results.issues.push(`Missing SEO element: ${element}`)
        results.pass = false
      }
    }
    
    // Check for XML sitemap strategy
    if (!content.includes('XML Sitemap Generation') || !content.includes('sitemapindex')) {
      results.issues.push('Missing XML sitemap generation strategy')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to read sitemap-plan.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Sitemap plan valid' : '  ❌ Sitemap plan validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validateSchemaMarkup() {
  console.log('📋 Validating Schema Markup...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'schema-markup.md'), 'utf8')
    
    // Acceptance criteria: LocalBusiness, Product, FAQ schema
    const requiredSchemaTypes = [
      'LocalBusiness',
      'Product', 
      'FAQPage',
      'Organization',
      'SoftwareApplication'
    ]
    
    for (const schemaType of requiredSchemaTypes) {
      if (!content.includes(`"@type": "${schemaType}"`)) {
        results.issues.push(`Missing schema type: ${schemaType}`)
        results.pass = false
      }
    }
    
    // Check for correct JSON-LD examples
    const jsonldBlocks = content.match(/```json\s*\n\{[\s\S]*?\n```/g)
    
    if (!jsonldBlocks || jsonldBlocks.length < 5) {
      results.issues.push('Insufficient JSON-LD examples (need 5+ complete examples)')
      results.pass = false
    }
    
    // Validate JSON-LD structure
    if (jsonldBlocks) {
      let validJsonCount = 0
      
      for (const block of jsonldBlocks) {
        try {
          const jsonContent = block.replace(/```json\s*\n/, '').replace(/\n```$/, '')
          const parsed = JSON.parse(jsonContent)
          
          if (parsed['@context'] === 'https://schema.org' && parsed['@type']) {
            validJsonCount++
          }
        } catch (e) {
          // JSON parse error - will be caught below
        }
      }
      
      if (validJsonCount < 3) {
        results.issues.push('Insufficient valid JSON-LD examples with proper @context and @type')
        results.pass = false
      }
    }
    
    // Check for industry-specific examples
    const industryExamples = [
      'home-services',
      'restaurant',
      'plumbing',
      'pizza'
    ]
    
    let industryExampleCount = 0
    for (const example of industryExamples) {
      if (content.toLowerCase().includes(example)) {
        industryExampleCount++
      }
    }
    
    if (industryExampleCount < 2) {
      results.issues.push('Missing industry-specific schema examples')
      results.pass = false
    }
    
    // Check for required schema properties
    const requiredProperties = [
      'address',
      'telephone', 
      'openingHours',
      'aggregateRating',
      'offers',
      'description'
    ]
    
    for (const property of requiredProperties) {
      if (!content.includes(`"${property}"`)) {
        results.issues.push(`Missing schema property: ${property}`)
        results.pass = false
      }
    }
    
    // Check for FAQ implementation
    if (!content.includes('acceptedAnswer') || !content.includes('mainEntity')) {
      results.issues.push('Missing proper FAQ schema implementation')
      results.pass = false
    }
    
    // Check for breadcrumb schema
    if (!content.includes('BreadcrumbList') || !content.includes('ListItem')) {
      results.issues.push('Missing breadcrumb schema implementation')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to read schema-markup.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Schema markup valid' : '  ❌ Schema markup validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validateCanonicalUrls() {
  console.log('📋 Validating Canonical URLs...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'canonical-urls.md'), 'utf8')
    
    // Check for core canonicalization principles
    const requiredPrinciples = [
      'Core Canonicalization Principles',
      'Industry-Specific Canonicalization',
      'Geographic Canonicalization Strategy',
      'Duplicate Content Prevention',
      'Redirect Strategy'
    ]
    
    for (const principle of requiredPrinciples) {
      if (!content.includes(principle)) {
        results.issues.push(`Missing canonicalization principle: ${principle}`)
        results.pass = false
      }
    }
    
    // Check for canonical URL examples
    if (!content.includes('rel="canonical"') || !content.includes('https://thorbis.com')) {
      results.issues.push('Missing canonical URL implementation examples')
      results.pass = false
    }
    
    // Check for duplicate content policy
    const duplicateContentElements = [
      'Content Differentiation Requirements',
      'Minimum 40% unique content',
      'Industry-specific H1/H2/H3 headings',
      'Different primary keywords'
    ]
    
    for (const element of duplicateContentElements) {
      if (!content.includes(element)) {
        results.issues.push(`Missing duplicate content policy element: ${element}`)
        results.pass = false
      }
    }
    
    // Check for redirect strategy
    if (!content.includes('301 Redirect Rules') || !content.includes('nginx')) {
      results.issues.push('Missing redirect implementation strategy')
      results.pass = false
    }
    
    // Check for parameter handling
    if (!content.includes('Parameter Handling') || !content.includes('utm_')) {
      results.issues.push('Missing URL parameter handling strategy')
      results.pass = false
    }
    
    // Check for technical implementation
    if (!content.includes('Next.js') || !content.includes('generateCanonicalUrl')) {
      results.issues.push('Missing technical implementation examples')
      results.pass = false
    }
    
    // Check for monitoring strategy
    if (!content.includes('Google Search Console') || !content.includes('Monitoring & Validation')) {
      results.issues.push('Missing canonical URL monitoring strategy')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to read canonical-urls.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Canonical URLs valid' : '  ❌ Canonical URLs validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validateContentOps() {
  console.log('📋 Validating Content Operations...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'content-ops.md'), 'utf8')
    
    // Check for learn hub structure
    const requiredHubSections = [
      'Learn Hub Architecture',
      '/blog/',
      '/guides/',
      '/case-studies/',
      '/webinars/',
      '/templates/'
    ]
    
    for (const section of requiredHubSections) {
      if (!content.includes(section)) {
        results.issues.push(`Missing learn hub section: ${section}`)
        results.pass = false
      }
    }
    
    // Check for publishing cadence
    const publishingElements = [
      'Monthly Publishing Schedule',
      'Daily Publishing Rhythm',
      'Editorial Calendar',
      'Publishing Cadence'
    ]
    
    for (const element of publishingElements) {
      if (!content.includes(element)) {
        results.issues.push(`Missing publishing element: ${element}`)
        results.pass = false
      }
    }
    
    // Check for content creation workflows
    const workflowElements = [
      'Content Creation Workflows',
      'Phase 1: Research & Planning',
      'Phase 2: Content Creation',
      'Phase 3: Optimization & Review',
      'Phase 4: Publishing & Promotion'
    ]
    
    for (const element of workflowElements) {
      if (!content.includes(element)) {
        results.issues.push(`Missing workflow element: ${element}`)
        results.pass = false
      }
    }
    
    // Check for quality standards
    if (!content.includes('Content Quality Standards') || !content.includes('SEO Quality Standards')) {
      results.issues.push('Missing content quality standards')
      results.pass = false
    }
    
    // Check for performance metrics
    const metricElements = [
      'Performance Monitoring & Analytics',
      'Traffic & Engagement Metrics',
      'Lead Generation Metrics',
      'SEO Performance Metrics'
    ]
    
    for (const element of metricElements) {
      if (!content.includes(element)) {
        results.issues.push(`Missing performance metric: ${element}`)
        results.pass = false
      }
    }
    
    // Check for team structure
    if (!content.includes('Team Roles & Responsibilities') || !content.includes('Content Marketing Manager')) {
      results.issues.push('Missing team structure definition')
      results.pass = false
    }
    
    // Check for specific publishing frequencies
    const frequencyChecks = [
      '8-10 posts/month',
      '4-6 guides/month',
      '2-3 case studies/month'
    ]
    
    let frequencyCount = 0
    for (const check of frequencyChecks) {
      if (content.includes(check)) {
        frequencyCount++
      }
    }
    
    if (frequencyCount < 2) {
      results.issues.push('Missing specific publishing frequency details')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to read content-ops.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Content operations valid' : '  ❌ Content operations validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validatePerformanceBudgets() {
  console.log('📋 Validating Performance Budgets...')
  const results = { pass: true, issues: [] }
  
  // Check if performance budget file exists
  const performanceBudgetPath = path.join(__dirname, 'performance-budgets.md')
  
  if (!fs.existsSync(performanceBudgetPath)) {
    results.issues.push('Missing performance-budgets.md file')
    results.pass = false
  } else {
    try {
      const content = fs.readFileSync(performanceBudgetPath, 'utf8')
      
      // Acceptance criteria: CLS/LCP budgets listed and monitored
      const requiredMetrics = [
        'CLS',
        'LCP', 
        'Cumulative Layout Shift',
        'Largest Contentful Paint'
      ]
      
      for (const metric of requiredMetrics) {
        if (!content.includes(metric)) {
          results.issues.push(`Missing performance metric: ${metric}`)
          results.pass = false
        }
      }
      
      // Check for specific budget values
      if (!content.includes('0.1') && !content.includes('< 0.1')) {
        results.issues.push('Missing CLS budget threshold (should be < 0.1)')
        results.pass = false
      }
      
      if (!content.includes('2.5s') && !content.includes('< 2.5')) {
        results.issues.push('Missing LCP budget threshold (should be < 2.5s)')
        results.pass = false
      }
      
      // Check for monitoring implementation
      const monitoringElements = [
        'Performance Monitoring',
        'Core Web Vitals',
        'Real User Monitoring',
        'Performance Budget'
      ]
      
      for (const element of monitoringElements) {
        if (!content.includes(element)) {
          results.issues.push(`Missing monitoring element: ${element}`)
          results.pass = false
        }
      }
      
    } catch (error) {
      results.issues.push(`Failed to read performance-budgets.md: ${error.message}`)
      results.pass = false
    }
  }
  
  console.log(results.pass ? '  ✅ Performance budgets valid' : '  ❌ Performance budgets validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateSEOContentPlan()
}

module.exports = { validateSEOContentPlan }
