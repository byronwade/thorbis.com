import { chromium, FullConfig } from '@playwright/test'
import { execSync } from 'child_process'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...')

  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Clear any existing test data
  console.log('🧹 Cleaning test environment...')
  
  try {
    // Clear browser storage if needed
    const browser = await chromium.launch()
    const context = await browser.newContext()
    await context.clearCookies()
    await browser.close()
    
    console.log('✅ Browser storage cleared')
  } catch (error) {
    console.warn('⚠️  Could not clear browser storage:', error)
  }

  // Verify application is responsive
  if (!process.env.CI) {
    console.log('🔍 Verifying local development server...')
    
    try {
      // Wait for dev server to be ready
      const maxAttempts = 30
      let attempts = 0
      
      while (attempts < maxAttempts) {
        try {
          const response = await fetch(process.env.NEXT_PUBLIC_APP_URL!)
          if (response.ok) {
            console.log('✅ Development server is ready')
            break
          }
        } catch {
          // Server not ready yet
        }
        
        attempts++
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        if (attempts === maxAttempts) {
          throw new Error('Development server failed to start')
        }
      }
    } catch (error) {
      console.error('❌ Development server check failed:', error)
      throw error
    }
  }

  console.log('✅ Global setup complete')
}

export default globalSetup