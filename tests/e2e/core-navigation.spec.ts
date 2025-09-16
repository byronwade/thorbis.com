import { test, expect } from '../fixtures/base-test'

test.describe('Core Navigation & Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('homepage loads correctly with all key elements', async ({ homePage, accessibility, performance }) => {
    // Check page loads within performance budget
    const loadTime = await performance.measurePageLoad()
    expect(loadTime).toBeLessThan(3000) // 3 second budget

    // Verify key homepage elements
    await expect(homePage.locator('h1')).toContainText('Thorbis Business OS')
    await expect(homePage.locator('[data-testid="hero-description"]').or(
      homePage.locator('p').first()
    )).toBeVisible()
    
    // Check industry navigation cards/links
    const industries = ['Home Services', 'Restaurant', 'Auto Services', 'Retail']
    for (const industry of industries) {
      await expect(homePage.locator(`text="${industry}"`).first()).toBeVisible()
    }

    // Verify accessibility compliance
    await accessibility.checkAccessibility()
  })

  test('main dashboard navigation works correctly', async ({ page, navigation, dashboardPage }) => {
    await navigation.goToIndustryDashboard('hs')
    
    // Verify dashboard loads
    await expect(page.locator('h1')).toContainText('Home Services')
    
    // Test navigation between dashboard sections
    const sections = ['Work Orders', 'Customers', 'Technicians', 'Schedule']
    
    for (const section of sections) {
      const sectionLink = page.locator(`nav a:has-text("${section}")`)
      if (await sectionLink.isVisible()) {
        await sectionLink.click()
        await navigation.waitForPageLoad()
        
        // Verify URL updated
        expect(page.url()).toContain(section.toLowerCase().replace(' ', '-'))
      }
    }
  })

  test('industry switching works correctly', async ({ page, navigation }) => {
    const industries = [
      { code: 'hs', name: 'Home Services', path: 'home-services' },
      { code: 'rest', name: 'Restaurant', path: 'restaurant' },
      { code: 'auto', name: 'Auto Services', path: 'auto-services' },
      { code: 'ret', name: 'Retail', path: 'retail' }
    ]

    for (const industry of industries) {
      await navigation.goToIndustryDashboard(industry.code as any)
      
      // Verify correct dashboard loaded
      await expect(page.locator('h1')).toContainText(industry.name)
      await expect(page).toHaveURL(new RegExp(`/dashboards/${industry.path}`))
      
      // Verify industry-specific navigation elements
      const navElements = page.locator('nav a')
      await expect(navElements.first()).toBeVisible()
    }
  })

  test('breadcrumb navigation functions correctly', async ({ page, navigation }) => {
    // Navigate to a deep page
    await navigation.goToIndustryDashboard('hs')
    await page.click('text="Work Orders"')
    await page.click('text="Create"')
    
    // Verify breadcrumbs are present
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]').or(
      page.locator('nav[aria-label="breadcrumb"]')
    )
    
    if (await breadcrumbs.isVisible()) {
      // Test breadcrumb navigation
      await breadcrumbs.locator('text="Home Services"').click()
      await expect(page).toHaveURL(new RegExp('/dashboards/home-services'))
    }
  })

  test('responsive navigation works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check if mobile menu exists and functions
    const mobileMenuTrigger = page.locator('[data-testid="mobile-menu-trigger"]').or(
      page.locator('button:has-text("Menu")')
    ).or(
      page.locator('[aria-label="Open menu"]')
    )

    if (await mobileMenuTrigger.isVisible()) {
      await mobileMenuTrigger.click()
      
      // Verify mobile menu opened
      const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(
        page.locator('[role="menu"]')
      )
      await expect(mobileMenu).toBeVisible()
      
      // Test mobile navigation
      await page.click('text="Home Services"')
      await expect(page).toHaveURL(new RegExp('/dashboards/home-services'))
    }
  })

  test('search functionality works correctly', async ({ page }) => {
    await page.goto('/dashboards')
    
    // Look for search functionality
    const searchInput = page.locator('[data-testid="search-input"]').or(
      page.locator('input[placeholder*="Search"]')
    ).or(
      page.locator('input[type="search"]')
    )

    if (await searchInput.isVisible()) {
      await searchInput.fill('work order')
      await searchInput.press('Enter')
      
      // Verify search results or navigation
      await page.waitForLoadState('networkidle')
      
      // Check if search results are displayed or if user was navigated
      const hasResults = await page.locator('[data-testid="search-results"]').isVisible()
      const hasNavigation = page.url().includes('work-order') || page.url().includes('search')
      
      expect(hasResults || hasNavigation).toBeTruthy()
    }
  })

  test('keyboard navigation works correctly', async ({ page, accessibility }) => {
    await page.goto('/')
    
    // Test tab navigation through key elements
    const focusableElements = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      '[tabindex="0"]'
    ]

    let previousElement: any = null
    
    for (let i = 0; i < 10; i++) { // Test first 10 tab stops
      await page.keyboard.press('Tab')
      const focusedElement = await page.locator(':focus').first()
      
      if (await focusedElement.isVisible()) {
        // Verify element is actually focusable
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase())
        const isInteractive = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName)
        
        if (isInteractive) {
          expect(await focusedElement.isVisible()).toBeTruthy()
          
          // Ensure we're making progress (not stuck)
          const currentElement = await focusedElement.evaluate(el => el.outerHTML)
          expect(currentElement).not.toBe(previousElement)
          previousElement = currentElement
        }
      }
    }
  })

  test('page loading states and error handling', async ({ page, performance }) => {
    // Test valid page loads
    const validRoutes = [
      '/',
      '/dashboards',
      '/dashboards/home-services',
      '/dashboards/restaurant',
      '/about',
      '/pricing'
    ]

    for (const route of validRoutes) {
      await page.goto(route)
      
      // Verify page loads successfully
      await expect(page.locator('body')).toBeVisible()
      
      // Check for error states
      const errorElements = page.locator('text="404"').or(
        page.locator('text="Error"')
      ).or(
        page.locator('[data-testid="error"]')
      )
      
      expect(await errorElements.count()).toBe(0)
    }

    // Test error page (404)
    await page.goto('/non-existent-route')
    
    // Should show 404 or redirect to valid page
    const is404 = page.url().includes('404') || 
                 await page.locator('text="404"').isVisible() ||
                 await page.locator('text="Not Found"').isVisible()
    
    const isRedirected = !page.url().includes('non-existent-route')
    
    expect(is404 || isRedirected).toBeTruthy()
  })

  test('core web vitals meet performance requirements', async ({ page, performance }) => {
    await page.goto('/')
    
    // Get Core Web Vitals
    const vitals = await performance.getCoreWebVitals()
    
    // Verify against performance requirements from CLAUDE.md
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500) // LCP ≤ 2.5s
    }
    
    if (vitals.cls) {
      expect(vitals.cls).toBeLessThan(0.1) // CLS ≤ 0.1
    }
    
    if (vitals.fid) {
      expect(vitals.fid).toBeLessThan(100) // FID ≤ 100ms
    }

    // Test JavaScript bundle size
    const bundleSize = await performance.checkBundleSize()
    console.log(`Total JS bundle size: ${bundleSize.totalSize}KB`)
    
    // Should meet 170KB budget from CLAUDE.md
    expect(bundleSize.totalSize).toBeLessThan(170)
  })
})