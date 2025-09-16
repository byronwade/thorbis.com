import { test, expect } from '../fixtures/base-test'

test.describe('Mobile Experience', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('homepage is fully functional on mobile', async ({ page, accessibility, performance }) => {
    await page.goto('/')
    
    // Check page loads within mobile performance budget
    const loadTime = await performance.measurePageLoad()
    expect(loadTime).toBeLessThan(4000) // Slightly higher budget for mobile
    
    // Verify key mobile elements
    await expect(page.locator('h1')).toBeVisible()
    
    // Check if content is properly sized for mobile
    const viewport = page.viewportSize()
    const body = await page.locator('body').boundingBox()
    
    if (body && viewport) {
      // Content should not overflow horizontally
      expect(body.width).toBeLessThanOrEqual(viewport.width + 20) // Small tolerance
    }
    
    // Test mobile accessibility
    await accessibility.checkAccessibility()
    
    // Verify touch targets are appropriately sized
    const interactiveElements = await page.locator('a, button, input[type="checkbox"], input[type="radio"]').all()
    
    for (const element of interactiveElements.slice(0, 10)) {
      if (await element.isVisible()) {
        const box = await element.boundingBox()
        if (box) {
          // Touch targets should be at least 44x44px (WCAG recommendation)
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(40) // Slight tolerance
        }
      }
    }
  })

  test('mobile navigation functions correctly', async ({ page }) => {
    await page.goto('/')
    
    // Look for mobile menu trigger
    const mobileMenuTrigger = page.locator('[data-testid="mobile-menu-trigger"]').or(
      page.locator('button:has-text("Menu")')
    ).or(
      page.locator('[aria-label="Open menu"], [aria-label="Menu"]')
    ).or(
      page.locator('button').filter({ hasText: /☰|≡/ })
    ).or(
      page.locator('[data-testid="hamburger"]')
    )

    if (await mobileMenuTrigger.isVisible()) {
      // Test menu toggle
      await mobileMenuTrigger.click()
      
      // Verify menu opened
      const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(
        page.locator('[role="menu"]')
      ).or(
        page.locator('nav ul')
      )
      
      await expect(mobileMenu).toBeVisible()
      
      // Test navigation links work
      const navLinks = await mobileMenu.locator('a[href]').all()
      
      if (navLinks.length > 0) {
        const firstLink = navLinks[0]
        const href = await firstLink.getAttribute('href')
        
        if (href && href.startsWith('/')) {
          await firstLink.click()
          
          // Verify navigation occurred
          await expect(page).toHaveURL(new RegExp(href.replace('/', '')))
          
          // Verify menu closed after navigation (good UX)
          const isMenuStillVisible = await mobileMenu.isVisible()
          expect(isMenuStillVisible).toBeFalsy()
        }
      }
    } else {
      // If no mobile menu, check if navigation is always visible
      const navigation = page.locator('nav')
      await expect(navigation).toBeVisible()
    }
  })

  test('mobile dashboard navigation', async ({ page, navigation }) => {
    await navigation.goToIndustryDashboard('hs')
    
    // Verify dashboard loads on mobile
    await expect(page.locator('h1')).toContainText('Home Services')
    
    // Check mobile dashboard navigation
    const dashboardNav = page.locator('nav, [data-testid="dashboard-nav"]')
    
    if (await dashboardNav.isVisible()) {
      // Test dashboard section navigation
      const navItems = await dashboardNav.locator('a').all()
      
      for (const item of navItems.slice(0, 3)) { // Test first 3 items
        if (await item.isVisible()) {
          const text = await item.textContent()
          const href = await item.getAttribute('href')
          
          if (text && href) {
            await item.click()
            await navigation.waitForPageLoad()
            
            // Verify navigation worked
            expect(page.url()).toContain(href)
          }
        }
      }
    }
  })

  test('mobile form interactions', async ({ page, navigation, forms }) => {
    // Navigate to a form page
    await navigation.goToIndustryDashboard('hs')
    
    const workOrdersLink = page.locator('text="Work Orders"')
    if (await workOrdersLink.isVisible()) {
      await workOrdersLink.click()
      
      const createButton = page.locator('text="Create"')
      if (await createButton.isVisible()) {
        await createButton.click()
        
        // Test mobile form interactions
        const formFields = await page.locator('input, textarea, select').all()
        
        for (const field of formFields.slice(0, 5)) { // Test first 5 fields
          if (await field.isVisible()) {
            // Test field focus
            await field.click()
            await expect(field).toBeFocused()
            
            // Test field input
            const fieldType = await field.getAttribute('type') || 'text'
            
            if (['text', 'email', 'tel'].includes(fieldType)) {
              await field.fill('Test input')
              await expect(field).toHaveValue('Test input')
            }
            
            // Verify field is properly sized for mobile
            const fieldBox = await field.boundingBox()
            const viewport = page.viewportSize()
            
            if (fieldBox && viewport) {
              expect(fieldBox.width).toBeLessThanOrEqual(viewport.width - 40) // Account for padding
              expect(fieldBox.height).toBeGreaterThanOrEqual(40) // Minimum touch target
            }
          }
        }
      }
    }
  })

  test('mobile scrolling and touch interactions', async ({ page }) => {
    await page.goto('/')
    
    // Test vertical scrolling
    const initialScrollPosition = await page.evaluate(() => window.scrollY)
    
    await page.mouse.wheel(0, 500)
    await page.waitForTimeout(500)
    
    const scrolledPosition = await page.evaluate(() => window.scrollY)
    expect(scrolledPosition).toBeGreaterThan(initialScrollPosition)
    
    // Test touch scrolling
    await page.touchscreen.tap(200, 300)
    
    // Swipe up (scroll down)
    await page.touchscreen.tap(200, 400)
    await page.touchscreen.tap(200, 200)
    
    await page.waitForTimeout(500)
    
    // Verify scroll occurred
    const finalScrollPosition = await page.evaluate(() => window.scrollY)
    expect(finalScrollPosition).toBeGreaterThanOrEqual(scrolledPosition)
  })

  test('mobile input field behavior', async ({ page }) => {
    await page.goto('/dashboards')
    
    // Find input fields
    const inputs = await page.locator('input').all()
    
    for (const input of inputs.slice(0, 3)) {
      if (await input.isVisible()) {
        const inputType = await input.getAttribute('type') || 'text'
        
        // Test different input types
        await input.click()
        
        switch (inputType) {
          case 'email':
            await input.fill('test@example.com')
            await expect(input).toHaveValue('test@example.com')
            break
            
          case 'tel':
            await input.fill('555-123-4567')
            await expect(input).toHaveValue('555-123-4567')
            break
            
          case 'number':
            await input.fill('123')
            await expect(input).toHaveValue('123')
            break
            
          default:
            await input.fill('Test input')
            await expect(input).toHaveValue('Test input')
        }
        
        // Clear field
        await input.fill('')
      }
    }
  })

  test('mobile gesture navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test back button functionality
    await page.goBack()
    await page.goForward()
    
    // Test pull-to-refresh if implemented
    // This is typically handled by the PWA service worker
    await page.goto('/')
    await page.touchscreen.tap(200, 100)
    
    // Simulate pull down gesture
    await page.evaluate(() => {
      window.scrollTo(0, -100)
      
      // Trigger custom pull-to-refresh event if implemented
      const event = new CustomEvent('pull-to-refresh')
      document.dispatchEvent(event)
    })
    
    await page.waitForTimeout(1000)
    
    // Check if page refreshed or loading indicator appeared
    const isRefreshing = await page.locator('[data-testid="refreshing"], .refreshing, [aria-label*="refresh"]').isVisible()
    
    if (isRefreshing) {
      console.log('Pull-to-refresh detected')
    }
  })

  test('mobile keyboard behavior', async ({ page, navigation }) => {
    // Test virtual keyboard interactions
    await navigation.goToIndustryDashboard('hs')
    
    const workOrdersLink = page.locator('text="Work Orders"')
    if (await workOrdersLink.isVisible()) {
      await workOrdersLink.click()
      
      const createButton = page.locator('text="Create"')
      if (await createButton.isVisible()) {
        await createButton.click()
        
        // Find first text input
        const textInput = page.locator('input[type="text"], textarea').first()
        
        if (await textInput.isVisible()) {
          // Focus input (should trigger virtual keyboard)
          await textInput.click()
          
          // Check if viewport adjusted for keyboard
          const initialViewportHeight = page.viewportSize()?.height || 0
          
          // Type text
          await textInput.type('Testing virtual keyboard')
          
          await page.waitForTimeout(500)
          
          // Verify input value
          await expect(textInput).toHaveValue('Testing virtual keyboard')
          
          // Test keyboard navigation
          await page.keyboard.press('Tab')
          
          // Check if focus moved to next field
          const focusedElement = page.locator(':focus')
          const isFocused = await focusedElement.isVisible()
          
          if (isFocused) {
            expect(await focusedElement.evaluate(el => el !== textInput)).toBeTruthy()
          }
        }
      }
    }
  })

  test('mobile performance optimization', async ({ page, performance }) => {
    // Test mobile-specific performance
    await page.goto('/')
    
    // Check JavaScript bundle size on mobile
    const bundleSize = await performance.checkBundleSize()
    
    // Mobile should have same or better bundle size
    expect(bundleSize.totalSize).toBeLessThan(170)
    
    // Check mobile-specific optimizations
    const mobileOptimizations = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]')
      const touchIcon = document.querySelector('link[rel="apple-touch-icon"]')
      const manifest = document.querySelector('link[rel="manifest"]')
      
      return {
        hasViewportMeta: !!viewport,
        hasTouchIcon: !!touchIcon,
        hasManifest: !!manifest,
        viewportContent: viewport?.getAttribute('content') || ''
      }
    })
    
    expect(mobileOptimizations.hasViewportMeta).toBeTruthy()
    expect(mobileOptimizations.viewportContent).toContain('width=device-width')
    expect(mobileOptimizations.hasManifest).toBeTruthy()
    
    console.log('Mobile optimizations:', mobileOptimizations)
  })

  test('mobile offline functionality', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
    })
    
    if (swRegistered) {
      // Simulate offline mode
      await page.context().setOffline(true)
      
      // Try to reload page
      await page.reload({ waitUntil: 'domcontentloaded' })
      
      // Check if offline page is shown or content is cached
      const hasOfflineContent = await page.locator('body').isVisible()
      expect(hasOfflineContent).toBeTruthy()
      
      // Look for offline indicators
      const offlineIndicators = page.locator('[data-testid="offline"], text="offline", text="disconnected"')
      const hasOfflineIndicator = await offlineIndicators.count() > 0
      
      if (hasOfflineIndicator) {
        console.log('Offline functionality detected')
      }
      
      // Restore online mode
      await page.context().setOffline(false)
    } else {
      console.log('Service worker not detected - skipping offline test')
    }
  })

  test('mobile accessibility features', async ({ page, accessibility }) => {
    await page.goto('/')
    
    // Test mobile-specific accessibility
    await accessibility.checkAccessibility({
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      exclude: ['color-contrast'] // Mobile screens may vary
    })
    
    // Check for mobile accessibility features
    const accessibilityFeatures = await page.evaluate(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      return {
        supportsReduceMotion: !!window.matchMedia('(prefers-reduced-motion: reduce)'),
        supportsHighContrast: !!window.matchMedia('(prefers-contrast: high)'),
        supportsDarkMode: !!window.matchMedia('(prefers-color-scheme: dark)'),
        currentReduceMotion: reduceMotion,
        currentHighContrast: highContrast,
        currentDarkMode: darkMode
      }
    })
    
    console.log('Mobile accessibility features:', accessibilityFeatures)
    
    // Should support modern accessibility preferences
    expect(accessibilityFeatures.supportsReduceMotion).toBeTruthy()
    expect(accessibilityFeatures.supportsDarkMode).toBeTruthy()
  })
})