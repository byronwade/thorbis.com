import { test as base, expect, Page, BrowserContext } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

// =============================================================================
// Extended Test Fixtures for Thorbis Business OS
// =============================================================================

export interface TestFixtures {
  // Pages
  homePage: Page
  dashboardPage: Page
  
  // Utilities
  navigation: NavigationHelpers
  forms: FormHelpers
  accessibility: AccessibilityHelpers
  performance: PerformanceHelpers
  visual: VisualHelpers
  
  // Industry-specific helpers
  homeServices: HomeServicesHelpers
  restaurant: RestaurantHelpers
  autoServices: AutoServicesHelpers
  retail: RetailHelpers
}

// =============================================================================
// Navigation Helpers
// =============================================================================

class NavigationHelpers {
  constructor(private page: Page) {}

  async goToIndustryDashboard(industry: 'hs' | 'rest' | 'auto' | 'ret') {
    const industryPaths = {
      hs: 'home-services',
      rest: 'restaurant', 
      auto: 'auto-services',
      ret: 'retail'
    }
    
    await this.page.goto(`/dashboards/${industryPaths[industry]}`)
    await expect(this.page).toHaveURL(new RegExp(`/dashboards/${industryPaths[industry]}`))
  }

  async navigateWithBreadcrumbs(path: string[]) {
    for (const segment of path) {
      await this.page.click(`text="${segment}"`)
      await this.page.waitForLoadState('networkidle')
    }
  }

  async verifyNavigation(expectedUrl: string | RegExp) {
    await expect(this.page).toHaveURL(expectedUrl)
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForLoadState('domcontentloaded')
  }
}

// =============================================================================
// Form Helpers
// =============================================================================

class FormHelpers {
  constructor(private page: Page) {}

  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[name="${field}"]`, value)
    }
  }

  async submitForm(submitButtonText: string = 'Submit') {
    await this.page.click(`button:has-text("${submitButtonText}")`)
  }

  async verifyFormValidation(field: string, expectedError: string) {
    const errorElement = this.page.locator(`[data-testid="${field}-error"]`)
    await expect(errorElement).toContainText(expectedError)
  }

  async selectFromDropdown(dropdownName: string, optionText: string) {
    await this.page.click(`[name="${dropdownName}"]`)
    await this.page.click(`text="${optionText}"`)
  }

  async uploadFile(inputName: string, filePath: string) {
    await this.page.setInputFiles(`[name="${inputName}"]`, filePath)
  }
}

// =============================================================================
// Accessibility Helpers
// =============================================================================

class AccessibilityHelpers {
  constructor(private page: Page) {}

  async checkAccessibility(options?: {
    include?: string[]
    exclude?: string[]
    tags?: string[]
  }) {
    const axeBuilder = new AxeBuilder({ page: this.page })
    
    if (options?.include) {
      axeBuilder.include(options.include)
    }
    
    if (options?.exclude) {
      axeBuilder.exclude(options.exclude)
    }
    
    if (options?.tags) {
      axeBuilder.withTags(options.tags)
    } else {
      // Default to WCAG 2.1 AA compliance
      axeBuilder.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    }

    const accessibilityScanResults = await axeBuilder.analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
    
    return accessibilityScanResults
  }

  async checkKeyboardNavigation(elements: string[]) {
    for (const element of elements) {
      await this.page.press(element, 'Tab')
      await expect(this.page.locator(element)).toBeFocused()
    }
  }

  async checkScreenReaderContent(expectedAnnouncements: string[]) {
    // Check ARIA labels and live regions
    for (const announcement of expectedAnnouncements) {
      await expect(this.page.locator(`[aria-label*="${announcement}"]`).or(
        this.page.locator(`[aria-describedby*="${announcement}"]`)
      )).toBeVisible()
    }
  }
}

// =============================================================================
// Performance Helpers
// =============================================================================

class PerformanceHelpers {
  constructor(private page: Page) {}

  async measurePageLoad() {
    const startTime = Date.now()
    await this.page.waitForLoadState('networkidle')
    const endTime = Date.now()
    
    return endTime - startTime
  }

  async getCoreWebVitals() {
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: Record<string, number> = {}
        
        // LCP - Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          vitals.lcp = lastEntry.startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // CLS - Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
          let cls = 0
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value
            }
          }
          vitals.cls = cls
        }).observe({ entryTypes: ['layout-shift'] })

        // FID - First Input Delay (or INP in newer browsers)
        new PerformanceObserver((entryList) => {
          const firstEntry = entryList.getEntries()[0]
          vitals.fid = (firstEntry as any).processingStart - firstEntry.startTime
        }).observe({ entryTypes: ['first-input'] })

        // Give metrics time to collect
        setTimeout(() => resolve(vitals), 3000)
      })
    })
  }

  async checkBundleSize() {
    const resources = await this.page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter((resource: any) => resource.name.includes('.js'))
        .map((resource: any) => ({
          name: resource.name,
          size: resource.transferSize || 0
        }))
    })
    
    const totalSize = resources.reduce((sum, resource) => sum + resource.size, 0)
    const sizeInKB = Math.round(totalSize / 1024)
    
    // Verify against 170KB budget from CLAUDE.md
    expect(sizeInKB).toBeLessThan(170)
    
    return { resources, totalSize: sizeInKB }
  }
}

// =============================================================================
// Visual Helpers
// =============================================================================

class VisualHelpers {
  constructor(private page: Page) {}

  async takeScreenshot(name: string, options?: {
    fullPage?: boolean
    mask?: string[]
    clip?: { x: number, y: number, width: number, height: number }
  }) {
    const screenshotOptions: any = {
      path: `test-results/screenshots/${name}.png`,
      fullPage: options?.fullPage || false
    }
    
    if (options?.mask) {
      screenshotOptions.mask = options.mask.map(selector => this.page.locator(selector))
    }
    
    if (options?.clip) {
      screenshotOptions.clip = options.clip
    }

    return await this.page.screenshot(screenshotOptions)
  }

  async compareScreenshot(name: string, options?: {
    threshold?: number
    maxDiffPixels?: number
  }) {
    await expect(this.page).toHaveScreenshot(`${name}.png`, {
      threshold: options?.threshold || 0.2,
      maxDiffPixels: options?.maxDiffPixels || 1000,
      animations: 'disabled'
    })
  }

  async checkResponsiveDesign(breakpoints: Array<{ width: number, height: number, name: string }>) {
    const results = []
    
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
      await this.page.waitForTimeout(1000) // Allow layout to settle
      
      const screenshot = await this.takeScreenshot(`${breakpoint.name}-${breakpoint.width}x${breakpoint.height}`)
      results.push({ breakpoint, screenshot })
    }
    
    return results
  }
}

// =============================================================================
// Industry-Specific Helpers
// =============================================================================

class HomeServicesHelpers {
  constructor(private page: Page) {}

  async createWorkOrder(data: {
    customerName: string
    serviceType: string
    description: string
    priority: 'low' | 'medium' | 'high'
  }) {
    await this.page.goto('/dashboards/home-services/work-orders/create')
    await this.page.fill('[name="customerName"]', data.customerName)
    await this.page.selectOption('[name="serviceType"]', data.serviceType)
    await this.page.fill('[name="description"]', data.description)
    await this.page.selectOption('[name="priority"]', data.priority)
    await this.page.click('button:has-text("Create Work Order")')
  }

  async scheduleAppointment(workOrderId: string, datetime: string) {
    await this.page.goto(`/dashboards/home-services/work-orders/${workOrderId}/schedule`)
    await this.page.fill('[name="scheduledDate"]', datetime)
    await this.page.click('button:has-text("Schedule")')
  }
}

class RestaurantHelpers {
  constructor(private page: Page) {}

  async createOrder(items: Array<{ name: string, quantity: number }>) {
    await this.page.goto('/dashboards/restaurant/pos')
    
    for (const item of items) {
      await this.page.click(`[data-item="${item.name}"]`)
      if (item.quantity > 1) {
        await this.page.fill('[name="quantity"]', item.quantity.toString())
      }
    }
    
    await this.page.click('button:has-text("Place Order")')
  }

  async updateMenuPrice(itemName: string, newPrice: string) {
    await this.page.goto('/dashboards/restaurant/menu')
    await this.page.click(`[data-item="${itemName}"] .edit-button`)
    await this.page.fill('[name="price"]', newPrice)
    await this.page.click('button:has-text("Save")')
  }
}

class AutoServicesHelpers {
  constructor(private page: Page) {}

  async createRepairOrder(data: {
    customerName: string
    vehicleInfo: string
    serviceType: string
    description: string
  }) {
    await this.page.goto('/dashboards/auto-services/repair-orders/create')
    await this.page.fill('[name="customerName"]', data.customerName)
    await this.page.fill('[name="vehicleInfo"]', data.vehicleInfo)
    await this.page.selectOption('[name="serviceType"]', data.serviceType)
    await this.page.fill('[name="description"]', data.description)
    await this.page.click('button:has-text("Create Repair Order")')
  }
}

class RetailHelpers {
  constructor(private page: Page) {}

  async processTransaction(items: Array<{ sku: string, quantity: number }>) {
    await this.page.goto('/dashboards/retail/pos')
    
    for (const item of items) {
      await this.page.fill('[name="sku"]', item.sku)
      await this.page.press('[name="sku"]', 'Enter')
      if (item.quantity > 1) {
        await this.page.fill('[name="quantity"]', item.quantity.toString())
      }
    }
    
    await this.page.click('button:has-text("Complete Sale")')
  }
}

// =============================================================================
// Test Fixture Definition
// =============================================================================

export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    await page.goto('/')
    await use(page)
  },

  dashboardPage: async ({ page }, use) => {
    await page.goto('/dashboards')
    await use(page)
  },

  navigation: async ({ page }, use) => {
    const navigation = new NavigationHelpers(page)
    await use(navigation)
  },

  forms: async ({ page }, use) => {
    const forms = new FormHelpers(page)
    await use(forms)
  },

  accessibility: async ({ page }, use) => {
    const accessibility = new AccessibilityHelpers(page)
    await use(accessibility)
  },

  performance: async ({ page }, use) => {
    const performance = new PerformanceHelpers(page)
    await use(performance)
  },

  visual: async ({ page }, use) => {
    const visual = new VisualHelpers(page)
    await use(visual)
  },

  homeServices: async ({ page }, use) => {
    const homeServices = new HomeServicesHelpers(page)
    await use(homeServices)
  },

  restaurant: async ({ page }, use) => {
    const restaurant = new RestaurantHelpers(page)
    await use(restaurant)
  },

  autoServices: async ({ page }, use) => {
    const autoServices = new AutoServicesHelpers(page)
    await use(autoServices)
  },

  retail: async ({ page }, use) => {
    const retail = new RetailHelpers(page)
    await use(retail)
  }
})

export { expect } from '@playwright/test'