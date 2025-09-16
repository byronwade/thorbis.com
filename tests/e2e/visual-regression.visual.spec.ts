import { test, expect } from '../fixtures/base-test'

test.describe('Visual Regression Testing', () => {
  
  test('homepage visual consistency', async ({ page, visual }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Wait for any animations to complete
    await page.waitForTimeout(2000)
    
    // Take full page screenshot
    await visual.compareScreenshot('homepage-full', {
      threshold: 0.2,
      maxDiffPixels: 1000
    })
    
    // Test different viewport sizes
    const breakpoints = [
      { width: 1920, height: 1080, name: 'desktop-xl' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
      await page.waitForTimeout(1000) // Allow layout to settle
      
      await visual.compareScreenshot(`homepage-${breakpoint.name}`, {
        threshold: 0.2
      })
    }
  })

  test('dashboard layouts across industries', async ({ page, navigation, visual }) => {
    const industries = [
      { code: 'hs' as const, name: 'home-services' },
      { code: 'rest' as const, name: 'restaurant' },
      { code: 'auto' as const, name: 'auto-services' },
      { code: 'ret' as const, name: 'retail' }
    ]

    for (const industry of industries) {
      await navigation.goToIndustryDashboard(industry.code)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
      
      // Screenshot dashboard main view
      await visual.compareScreenshot(`dashboard-${industry.name}`, {
        threshold: 0.3, // Slightly higher threshold for dynamic content
        maxDiffPixels: 2000
      })
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)
      
      await visual.compareScreenshot(`dashboard-${industry.name}-mobile`, {
        threshold: 0.3
      })
      
      // Reset to desktop
      await page.setViewportSize({ width: 1280, height: 720 })
    }
  })

  test('form layouts and states', async ({ page, navigation, visual }) => {
    // Test work order creation form
    await navigation.goToIndustryDashboard('hs')
    
    const workOrdersLink = page.locator('text="Work Orders"')
    if (await workOrdersLink.isVisible()) {
      await workOrdersLink.click()
      await page.waitForLoadState('networkidle')
      
      const createButton = page.locator('text="Create"')
      if (await createButton.isVisible()) {
        await createButton.click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)
        
        // Screenshot empty form
        await visual.compareScreenshot('work-order-form-empty', {
          threshold: 0.2
        })
        
        // Fill some fields and screenshot
        const customerField = page.locator('[name="customerName"], [name="customer"], input').first()
        if (await customerField.isVisible()) {
          await customerField.fill('Test Customer')
          await page.waitForTimeout(500)
          
          await visual.compareScreenshot('work-order-form-partial', {
            threshold: 0.2
          })
        }
        
        // Test form validation state by trying to submit
        const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Submit")')
        if (await submitButton.isVisible()) {
          await submitButton.click()
          await page.waitForTimeout(1000)
          
          // Screenshot with validation errors
          await visual.compareScreenshot('work-order-form-errors', {
            threshold: 0.2
          })
        }
      }
    }
  })

  test('navigation component consistency', async ({ page, visual }) => {
    await page.goto('/')
    
    // Focus on navigation area
    const navigation = page.locator('nav, header, [data-testid="navigation"]')
    
    if (await navigation.isVisible()) {
      // Screenshot navigation in default state
      await visual.takeScreenshot('navigation-default', {
        clip: await navigation.boundingBox() || undefined
      })
      
      // Test hover states on navigation items
      const navItems = await page.locator('nav a, header a').all()
      
      if (navItems.length > 0 && navItems.length <= 5) {
        for (let i = 0; i < Math.min(navItems.length, 3); i++) {
          const item = navItems[i]
          if (await item.isVisible()) {
            await item.hover()
            await page.waitForTimeout(200)
            
            await visual.takeScreenshot(`navigation-hover-${i}`, {
              clip: await navigation.boundingBox() || undefined
            })
          }
        }
      }
      
      // Test mobile navigation
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)
      
      const mobileMenuTrigger = page.locator('[data-testid="mobile-menu-trigger"], button:has-text("Menu"), [aria-label*="menu"]')
      
      if (await mobileMenuTrigger.isVisible()) {
        await visual.takeScreenshot('navigation-mobile-closed')
        
        await mobileMenuTrigger.click()
        await page.waitForTimeout(500)
        
        await visual.takeScreenshot('navigation-mobile-open')
      }
    }
  })

  test('button and interactive element states', async ({ page, visual }) => {
    await page.goto('/')
    
    // Find primary buttons
    const buttons = await page.locator('button, .button, [role="button"]').all()
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i]
      
      if (await button.isVisible()) {
        const buttonBox = await button.boundingBox()
        if (buttonBox) {
          // Default state
          await visual.takeScreenshot(`button-${i}-default`, { clip: buttonBox })
          
          // Hover state
          await button.hover()
          await page.waitForTimeout(200)
          await visual.takeScreenshot(`button-${i}-hover`, { clip: buttonBox })
          
          // Focus state
          await button.focus()
          await page.waitForTimeout(200)
          await visual.takeScreenshot(`button-${i}-focus`, { clip: buttonBox })
          
          // Reset
          await page.mouse.move(0, 0)
          await page.keyboard.press('Escape')
        }
      }
    }
  })

  test('dark mode consistency', async ({ page, visual }) => {
    await page.goto('/')
    
    // Check if dark mode toggle exists
    const darkModeToggle = page.locator('[data-testid="dark-mode"], [aria-label*="dark"], button:has-text("Dark")')
    
    // Take light mode screenshot first
    await visual.compareScreenshot('homepage-light-mode')
    
    if (await darkModeToggle.isVisible()) {
      // Toggle to dark mode
      await darkModeToggle.click()
      await page.waitForTimeout(1000) // Allow theme transition
      
      // Take dark mode screenshot
      await visual.compareScreenshot('homepage-dark-mode')
    } else {
      // Check if page already has dark theme based on background
      const isDarkMode = await page.evaluate(() => {
        const body = document.body
        const styles = window.getComputedStyle(body)
        const backgroundColor = styles.backgroundColor
        
        // Simple heuristic: if background is very dark, assume dark mode
        const rgb = backgroundColor.match(/\d+/g)
        if (rgb) {
          const [r, g, b] = rgb.map(Number)
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
          return luminance < 0.5
        }
        
        return false
      })
      
      if (isDarkMode) {
        console.log('Dark mode detected by background color analysis')
      }
    }
  })

  test('loading states and animations', async ({ page, visual }) => {
    // Go to a potentially slow-loading page
    await page.goto('/dashboards')
    
    // Try to capture loading states
    const loadingElements = page.locator('[data-testid*="loading"], .loading, .spinner, [aria-label*="loading"]')
    
    if (await loadingElements.count() > 0) {
      await visual.takeScreenshot('loading-state')
    }
    
    // Wait for load to complete
    await page.waitForLoadState('networkidle')
    
    // Screenshot final loaded state
    await visual.compareScreenshot('dashboards-loaded')
    
    // Test skeleton loading patterns if they exist
    const skeletonElements = page.locator('.skeleton, [class*="skeleton"], [data-testid*="skeleton"]')
    
    if (await skeletonElements.count() > 0) {
      console.log('Skeleton loading elements detected')
    }
  })

  test('responsive breakpoint transitions', async ({ page, visual }) => {
    await page.goto('/')
    
    const breakpoints = [
      { width: 1920, height: 1080, name: '1920' },
      { width: 1440, height: 900, name: '1440' },
      { width: 1280, height: 720, name: '1280' },
      { width: 1024, height: 768, name: '1024' },
      { width: 768, height: 1024, name: '768' },
      { width: 480, height: 800, name: '480' },
      { width: 375, height: 667, name: '375' }
    ]
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
      await page.waitForTimeout(500) // Allow layout to settle
      
      await visual.compareScreenshot(`responsive-${breakpoint.name}px`, {
        threshold: 0.3 // Higher threshold for responsive changes
      })
    }
  })

  test('error state visualizations', async ({ page, visual }) => {
    // Try to trigger 404 page
    await page.goto('/non-existent-page')
    
    // Screenshot 404 or error page
    await visual.compareScreenshot('error-404-page')
    
    // Test form validation errors
    await page.goto('/dashboards')
    
    // Look for a form to test validation
    const forms = await page.locator('form').all()
    
    if (forms.length > 0) {
      const form = forms[0]
      
      // Try to submit empty form
      const submitButton = form.locator('button[type="submit"], button:has-text("Submit")')
      
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(1000)
        
        // Screenshot validation errors
        await visual.compareScreenshot('form-validation-errors')
      }
    }
  })

  test('print stylesheet compatibility', async ({ page, visual }) => {
    await page.goto('/')
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' })
    
    // Screenshot print layout
    await visual.compareScreenshot('homepage-print-layout')
    
    // Test dashboard print layout
    await page.goto('/dashboards')
    await page.waitForLoadState('networkidle')
    
    await visual.compareScreenshot('dashboard-print-layout')
    
    // Reset media emulation
    await page.emulateMedia({ media: null })
  })
})