#!/usr/bin/env node

/**
 * Thorbis PWA Configuration Validation Script
 * 
 * Validates that all PWA deliverables meet acceptance criteria:
 * - offline demo script covering a POS order and later sync
 * - cache invalidation rules documented
 * - install prompts, offline caches (routes: invoices, schedule, POS)
 * - background sync for jobs & POS tickets
 * - push notifications topic model (jobs, payments, reviews)
 */

const fs = require('fs')
const path = require('path')

function validatePWAConfiguration() {
  console.log('\n🔧 Validating Thorbis PWA Configuration\n')
  
  const results = {
    pwaCore: validatePWACore(),
    backgroundSync: validateBackgroundSync(),
    pushNotifications: validatePushNotifications(),
    offlineDemo: validateOfflineDemo(),
    cacheInvalidation: validateCacheInvalidation()
  }
  
  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 PWA CONFIGURATION VALIDATION SUMMARY')
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
    console.log('\n❌ PWA configuration validation failed.')
    console.log('Please review the issues above and fix them before implementation.')
    process.exit(1)
  } else {
    console.log('\n🎉 PWA configuration validation successful!')
    console.log('✅ Comprehensive PWA implementation with offline-first capabilities')
    console.log('✅ Install prompts and offline caches for critical routes')
    console.log('✅ Background sync for jobs and POS tickets')
    console.log('✅ Topic-based push notification system')
    console.log('✅ Offline demo script with POS order and sync')
    console.log('✅ Cache invalidation rules documented')
    console.log('\n🚀 Ready for PWA implementation!')
  }
}

function validatePWACore() {
  console.log('📋 Validating PWA Core Implementation...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'pwa.md'), 'utf8')
    
    // Check for required PWA components
    const requiredComponents = [
      'Service Worker Strategy',
      'App Shell Architecture',
      'Install Prompts',
      'Offline Caching Strategy',
      'Cache Invalidation Rules'
    ]
    
    for (const component of requiredComponents) {
      if (!content.includes(component)) {
        results.issues.push(`Missing PWA component: ${component}`)
        results.pass = false
      }
    }
    
    // Check for critical routes caching
    const criticalRoutes = [
      '/pos',
      '/invoices', 
      '/schedule',
      '/customers'
    ]
    
    for (const route of criticalRoutes) {
      if (!content.includes(route)) {
        results.issues.push(`Missing critical route caching: ${route}`)
        results.pass = false
      }
    }
    
    // Check for service worker implementation
    const serviceWorkerFeatures = [
      'addEventListener(\'install\'',
      'addEventListener(\'activate\'',
      'addEventListener(\'fetch\'',
      'caches.open',
      'skipWaiting'
    ]
    
    for (const feature of serviceWorkerFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing service worker feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for install prompt implementation
    if (!content.includes('beforeinstallprompt') || !content.includes('InstallPromptManager')) {
      results.issues.push('Missing install prompt implementation')
      results.pass = false
    }
    
    // Check for offline demo script
    if (!content.includes('OfflinePOSDemo') || !content.includes('demonstrateOfflineOrder')) {
      results.issues.push('Missing offline demo script implementation')
      results.pass = false
    }
    
    // Check for cache strategies
    const cacheStrategies = [
      'Cache First',
      'Network First',
      'Stale While Revalidate'
    ]
    
    let strategiesFound = 0
    for (const strategy of cacheStrategies) {
      if (content.includes(strategy)) {
        strategiesFound++
      }
    }
    
    if (strategiesFound < 2) {
      results.issues.push('Insufficient cache strategies implemented (need at least 2)')
      results.pass = false
    }
    
    // Check for offline functionality
    const offlineFeatures = [
      'offline_pos_',
      'storeOfflineOrder',
      'processOfflinePayment',
      'generateOfflineReceipt'
    ]
    
    for (const feature of offlineFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing offline feature: ${feature}`)
        results.pass = false
      }
    }
    
  } catch (error) {
    results.issues.push(`Failed to read pwa.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ PWA core valid' : '  ❌ PWA core validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validateBackgroundSync() {
  console.log('📋 Validating Background Sync...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'background-sync.md'), 'utf8')
    
    // Check for background sync setup
    const syncFeatures = [
      'Background Sync Architecture',
      'Service Worker Background Sync',
      'BackgroundSyncPlugin',
      'addEventListener(\'sync\'',
      'Queue'
    ]
    
    for (const feature of syncFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing background sync feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for job update sync
    const jobSyncFeatures = [
      'Job Update Background Sync',
      'JobUpdateSyncManager',
      'queueJobUpdate',
      'syncJobUpdate'
    ]
    
    for (const feature of jobSyncFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing job sync feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for POS ticket sync
    const posSyncFeatures = [
      'POS Ticket Background Sync',
      'POSBackgroundSync',
      'queuePOSOrder',
      'processPOSBatch'
    ]
    
    for (const feature of posSyncFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing POS sync feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for sync queues
    const syncQueues = [
      'pos-orders-sync',
      'job-updates-sync',
      'customer-data-sync'
    ]
    
    for (const queue of syncQueues) {
      if (!content.includes(queue)) {
        results.issues.push(`Missing sync queue: ${queue}`)
        results.pass = false
      }
    }
    
    // Check for conflict resolution
    if (!content.includes('Conflict Resolution') || !content.includes('ConflictResolutionManager')) {
      results.issues.push('Missing conflict resolution implementation')
      results.pass = false
    }
    
    // Check for retry logic
    if (!content.includes('Retry Logic') || !content.includes('exponential backoff')) {
      results.issues.push('Missing retry logic implementation')
      results.pass = false
    }
    
    // Check for industry-specific sync
    const industries = ['hs', 'rest', 'auto', 'ret']
    let industryCount = 0
    
    for (const industry of industries) {
      if (content.includes(`'${industry}'`) || content.includes(`"${industry}"`)) {
        industryCount++
      }
    }
    
    if (industryCount < 3) {
      results.issues.push('Insufficient industry-specific sync implementations')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to read background-sync.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Background sync valid' : '  ❌ Background sync validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validatePushNotifications() {
  console.log('📋 Validating Push Notifications...')
  const results = { pass: true, issues: [] }
  
  try {
    const content = fs.readFileSync(path.join(__dirname, 'push-notifications.md'), 'utf8')
    
    // Check for push notification architecture
    const pushFeatures = [
      'Push Notification Architecture',
      'addEventListener(\'push\'',
      'addEventListener(\'notificationclick\'',
      'PushSubscriptionManager',
      'TopicManager'
    ]
    
    for (const feature of pushFeatures) {
      if (!content.includes(feature)) {
        results.issues.push(`Missing push notification feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for topic model (jobs, payments, reviews)
    const requiredTopics = [
      'jobs',
      'payments', 
      'reviews'
    ]
    
    for (const topic of requiredTopics) {
      if (!content.includes(`category: '${topic}'`)) {
        results.issues.push(`Missing topic category: ${topic}`)
        results.pass = false
      }
    }
    
    // Check for specific notification topics
    const specificTopics = [
      'job_assigned',
      'payment_received',
      'review_received',
      'pos_order_ready'
    ]
    
    for (const topic of specificTopics) {
      if (!content.includes(topic)) {
        results.issues.push(`Missing notification topic: ${topic}`)
        results.pass = false
      }
    }
    
    // Check for industry-specific templates
    const industryTemplates = [
      'hs_job_assigned',
      'rest_pos_order_ready',
      'auto_job_status_changed',
      'ret_pos_low_stock'
    ]
    
    for (const template of industryTemplates) {
      if (!content.includes(template)) {
        results.issues.push(`Missing industry template: ${template}`)
        results.pass = false
      }
    }
    
    // Check for smart notification timing
    if (!content.includes('SmartNotificationScheduler') || !content.includes('quiet hours')) {
      results.issues.push('Missing smart notification timing implementation')
      results.pass = false
    }
    
    // Check for notification preferences
    if (!content.includes('NotificationPreferences') || !content.includes('updatePreferences')) {
      results.issues.push('Missing notification preferences system')
      results.pass = false
    }
    
    // Check for analytics
    if (!content.includes('NotificationAnalytics') || !content.includes('trackNotification')) {
      results.issues.push('Missing notification analytics implementation')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to read push-notifications.md: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Push notifications valid' : '  ❌ Push notifications validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validateOfflineDemo() {
  console.log('📋 Validating Offline Demo Script...')
  const results = { pass: true, issues: [] }
  
  try {
    const pwaContent = fs.readFileSync(path.join(__dirname, 'pwa.md'), 'utf8')
    
    // Check for offline demo components
    const demoComponents = [
      'OfflinePOSDemo',
      'demonstrateOfflineOrder',
      'simulateOfflineMode',
      'createOfflineOrder',
      'processOfflinePayment', 
      'generateOfflineReceipt',
      'simulateOnlineMode',
      'syncOfflineOrders'
    ]
    
    for (const component of demoComponents) {
      if (!pwaContent.includes(component)) {
        results.issues.push(`Missing demo component: ${component}`)
        results.pass = false
      }
    }
    
    // Check for complete POS order flow
    const orderFlowSteps = [
      'Step 1: Simulate going offline',
      'Step 2: Create offline order',
      'Step 3: Process offline payment',
      'Step 4: Generate offline receipt',
      'Step 5: Simulate coming back online',
      'Step 6: Sync offline data'
    ]
    
    for (const step of orderFlowSteps) {
      if (!pwaContent.includes(step)) {
        results.issues.push(`Missing order flow step: ${step}`)
        results.pass = false
      }
    }
    
    // Check for order data structure
    const orderFields = [
      'items',
      'subtotal',
      'tax',
      'total',
      'paymentMethod',
      'timestamp',
      'needsSync'
    ]
    
    for (const field of orderFields) {
      if (!pwaContent.includes(field)) {
        results.issues.push(`Missing order field: ${field}`)
        results.pass = false
      }
    }
    
    // Check for sync functionality
    const syncFeatures = [
      'storeOfflineOrder',
      'getOfflineOrders',
      'syncOfflineOrders',
      'markOrderSynced'
    ]
    
    for (const feature of syncFeatures) {
      if (!pwaContent.includes(feature)) {
        results.issues.push(`Missing sync feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for UI feedback
    const uiFeatures = [
      'displayOrderConfirmation',
      'updateOfflineStatus',
      'displaySyncResults'
    ]
    
    for (const feature of uiFeatures) {
      if (!pwaContent.includes(feature)) {
        results.issues.push(`Missing UI feature: ${feature}`)
        results.pass = false
      }
    }
    
  } catch (error) {
    results.issues.push(`Failed to validate offline demo: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Offline demo valid' : '  ❌ Offline demo validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

function validateCacheInvalidation() {
  console.log('📋 Validating Cache Invalidation Rules...')
  const results = { pass: true, issues: [] }
  
  try {
    const pwaContent = fs.readFileSync(path.join(__dirname, 'pwa.md'), 'utf8')
    
    // Check for cache invalidation implementation
    const invalidationFeatures = [
      'Cache Invalidation Rules',
      'CacheInvalidationManager',
      'invalidateCache',
      'checkCacheExpiry'
    ]
    
    for (const feature of invalidationFeatures) {
      if (!pwaContent.includes(feature)) {
        results.issues.push(`Missing cache invalidation feature: ${feature}`)
        results.pass = false
      }
    }
    
    // Check for time-based invalidation
    if (!pwaContent.includes('Time-Based Invalidation') || !pwaContent.includes('maxAge')) {
      results.issues.push('Missing time-based cache invalidation')
      results.pass = false
    }
    
    // Check for event-driven invalidation
    if (!pwaContent.includes('Event-driven invalidation') || !pwaContent.includes('invalidateOn')) {
      results.issues.push('Missing event-driven cache invalidation')
      results.pass = false
    }
    
    // Check for cache replacement strategy
    if (!pwaContent.includes('SmartCacheManager') || !pwaContent.includes('evictLeastImportantData')) {
      results.issues.push('Missing smart cache replacement strategy')
      results.pass = false
    }
    
    // Check for cache size management
    if (!pwaContent.includes('manageCacheSize') || !pwaContent.includes('MAX_CACHE_SIZE')) {
      results.issues.push('Missing cache size management')
      results.pass = false
    }
    
    // Check for cache priorities
    const cachePriorities = [
      'priority: \'high\'',
      'priority: \'medium\'',
      'priority: \'low\''
    ]
    
    let priorityCount = 0
    for (const priority of cachePriorities) {
      if (pwaContent.includes(priority)) {
        priorityCount++
      }
    }
    
    if (priorityCount < 3) {
      results.issues.push('Missing cache priority levels')
      results.pass = false
    }
    
    // Check for business event invalidation
    if (!pwaContent.includes('onBusinessDataChanged') || !pwaContent.includes('invalidationMap')) {
      results.issues.push('Missing business event-based cache invalidation')
      results.pass = false
    }
    
  } catch (error) {
    results.issues.push(`Failed to validate cache invalidation: ${error.message}`)
    results.pass = false
  }
  
  console.log(results.pass ? '  ✅ Cache invalidation valid' : '  ❌ Cache invalidation validation failed')
  if (results.issues.length > 0) {
    results.issues.forEach(issue => console.log(`     - ${issue}`))
  }
  
  return results
}

// Run validation if this script is executed directly
if (require.main === module) {
  validatePWAConfiguration()
}

module.exports = { validatePWAConfiguration }
