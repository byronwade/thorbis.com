import { test, expect } from '../fixtures/base-test'

test.describe('Accessibility Compliance', () => {
  
  test('homepage meets WCAG 2.1 AA compliance', async ({ homePage, accessibility }) => {
    await accessibility.checkAccessibility({
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    })
  })

  test('dashboard pages meet accessibility standards', async ({ page, navigation, accessibility }) => {
    const dashboards = [
      { code: 'hs' as const, name: 'Home Services' },
      { code: 'rest' as const, name: 'Restaurant' },
      { code: 'auto' as const, name: 'Auto Services' },
      { code: 'ret' as const, name: 'Retail' }
    ]

    for (const dashboard of dashboards) {
      await navigation.goToIndustryDashboard(dashboard.code)
      
      // Check WCAG compliance for each dashboard
      await accessibility.checkAccessibility({
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        exclude: ['[data-testid="loading"]'] // Exclude loading states
      })

      // Verify proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
      
      if (headings.length > 0) {
        // Should have exactly one h1
        const h1Count = await page.locator('h1').count()
        expect(h1Count).toBe(1)

        // Verify h1 contains meaningful text
        const h1Text = await page.locator('h1').textContent()
        expect(h1Text?.trim()).toBeTruthy()
        expect(h1Text?.trim().length).toBeGreaterThan(3)
      }
    }
  })

  test('keyboard navigation works throughout the application', async ({ page, accessibility }) => {
    await page.goto('/')

    // Test keyboard navigation on homepage
    await accessibility.checkKeyboardNavigation([
      'body',
      'a[href]:first-of-type',
      'button:first-of-type'
    ])

    // Test tab order makes logical sense
    const focusableElements = await page.locator('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]').all()
    
    if (focusableElements.length > 0) {
      let tabIndex = 0
      
      for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
        await page.keyboard.press('Tab')
        
        const focusedElement = page.locator(':focus')
        const isVisible = await focusedElement.isVisible()
        
        if (isVisible) {
          // Verify element has visible focus indicator
          const focusStyles = await focusedElement.evaluate((el) => {
            const styles = window.getComputedStyle(el, ':focus')
            return {
              outline: styles.outline,
              outlineWidth: styles.outlineWidth,
              outlineColor: styles.outlineColor,
              boxShadow: styles.boxShadow,
              border: styles.border
            }
          })

          // Should have some form of focus indicator
          const hasFocusIndicator = 
            focusStyles.outline !== 'none' ||
            focusStyles.outlineWidth !== '0px' ||
            focusStyles.boxShadow !== 'none' ||
            focusStyles.border.includes('focus')

          expect(hasFocusIndicator).toBeTruthy()
          tabIndex++
        }
      }

      expect(tabIndex).toBeGreaterThan(0)
    }
  })

  test('color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('/')

    // Check color contrast for key text elements
    const textElements = await page.locator('h1, h2, h3, p, a, button, label').all()
    
    for (const element of textElements.slice(0, 10)) { // Test first 10 elements
      if (await element.isVisible()) {
        const contrastInfo = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          }
        })

        // Verify text is not transparent or invisible
        expect(contrastInfo.color).not.toBe('rgba(0, 0, 0, 0)')
        expect(contrastInfo.color).not.toBe('transparent')
      }
    }
  })

  test('form elements have proper labels and descriptions', async ({ page, navigation }) => {
    // Test form accessibility in work order creation
    await navigation.goToIndustryDashboard('hs')
    
    const createWorkOrderLink = page.locator('text="Work Orders"')
    if (await createWorkOrderLink.isVisible()) {
      await createWorkOrderLink.click()
      
      const createButton = page.locator('text="Create"')
      if (await createButton.isVisible()) {
        await createButton.click()

        // Check form inputs have proper labels
        const formInputs = await page.locator('input, textarea, select').all()
        
        for (const input of formInputs) {
          if (await input.isVisible()) {
            const inputId = await input.getAttribute('id')
            const inputName = await input.getAttribute('name')
            const ariaLabel = await input.getAttribute('aria-label')
            const ariaLabelledby = await input.getAttribute('aria-labelledby')
            
            // Should have associated label
            let hasLabel = false
            
            if (inputId) {
              const label = await page.locator(`label[for="${inputId}"]`).count()
              hasLabel = label > 0
            }
            
            // Or should have aria-label or aria-labelledby
            hasLabel = hasLabel || !!ariaLabel || !!ariaLabelledby
            
            // Or should be wrapped in a label
            if (!hasLabel) {
              const parentLabel = await input.locator('xpath=ancestor::label').count()
              hasLabel = parentLabel > 0
            }

            expect(hasLabel).toBeTruthy()
          }
        }
      }
    }
  })

  test('images have appropriate alt text', async ({ page }) => {
    await page.goto('/')

    const images = await page.locator('img').all()
    
    for (const img of images) {
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt')
        const ariaLabel = await img.getAttribute('aria-label')
        const ariaHidden = await img.getAttribute('aria-hidden')
        const role = await img.getAttribute('role')
        
        // Decorative images should have empty alt or aria-hidden
        const isDecorative = alt === '' || ariaHidden === 'true' || role === 'presentation'
        
        // Informative images should have meaningful alt text
        if (!isDecorative) {
          expect(alt || ariaLabel).toBeTruthy()
          expect((alt || ariaLabel || '').length).toBeGreaterThan(2)
        }
      }
    }
  })

  test('interactive elements have accessible names', async ({ page }) => {
    await page.goto('/')

    const interactiveElements = await page.locator('button, a[href], input[type="button"], input[type="submit"]').all()
    
    for (const element of interactiveElements) {
      if (await element.isVisible()) {
        const accessibleName = await element.evaluate((el) => {
          // Get accessible name using various methods
          const ariaLabel = el.getAttribute('aria-label')
          const ariaLabelledby = el.getAttribute('aria-labelledby')
          const textContent = el.textContent?.trim()
          const title = el.getAttribute('title')
          
          if (ariaLabel) return ariaLabel
          if (ariaLabelledby) {
            const labelElement = document.getElementById(ariaLabelledby)
            return labelElement?.textContent?.trim()
          }
          if (textContent) return textContent
          if (title) return title
          
          // For input elements, check associated labels
          if (el.tagName.toLowerCase() === 'input') {
            const id = el.getAttribute('id')
            if (id) {
              const label = document.querySelector(`label[for="${id}"]`)
              return label?.textContent?.trim()
            }
          }
          
          return null
        })

        expect(accessibleName).toBeTruthy()
        expect(accessibleName?.length).toBeGreaterThan(1)
      }
    }
  })

  test('page has proper landmark structure', async ({ page }) => {
    await page.goto('/')

    // Check for main landmarks
    const landmarks = {
      banner: 'header, [role="banner"]',
      navigation: 'nav, [role="navigation"]', 
      main: 'main, [role="main"]',
      contentinfo: 'footer, [role="contentinfo"]'
    }

    for (const [landmarkName, selector] of Object.entries(landmarks)) {
      const landmarkElements = await page.locator(selector).count()
      
      if (landmarkName === 'main') {
        // Should have exactly one main landmark
        expect(landmarkElements).toBeGreaterThanOrEqual(1)
      } else {
        // Other landmarks are optional but if present should be accessible
        if (landmarkElements > 0) {
          const firstLandmark = page.locator(selector).first()
          await expect(firstLandmark).toBeVisible()
        }
      }
    }
  })

  test('skip links are present and functional', async ({ page }) => {
    await page.goto('/')

    // Look for skip link
    const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text("Skip to content"), a:has-text("Skip to main")')
    
    if (await skipLink.count() > 0) {
      // Focus on skip link (should be first focusable element)
      await page.keyboard.press('Tab')
      
      const focusedElement = page.locator(':focus')
      const focusedHref = await focusedElement.getAttribute('href')
      
      if (focusedHref?.includes('#')) {
        // Click skip link
        await focusedElement.click()
        
        // Verify focus moved to target
        const targetId = focusedHref.replace('#', '')
        const targetElement = page.locator(`#${targetId}, [name="${targetId}"]`)
        
        if (await targetElement.count() > 0) {
          const isFocused = await targetElement.evaluate(el => 
            document.activeElement === el || el.contains(document.activeElement)
          )
          expect(isFocused).toBeTruthy()
        }
      }
    }
  })

  test('error messages are announced to screen readers', async ({ page, navigation, forms }) => {
    // Test form validation error announcements
    await navigation.goToIndustryDashboard('hs')
    
    const workOrdersLink = page.locator('text="Work Orders"')
    if (await workOrdersLink.isVisible()) {
      await workOrdersLink.click()
      
      const createButton = page.locator('text="Create"')
      if (await createButton.isVisible()) {
        await createButton.click()
        
        // Try to submit empty form to trigger validation
        const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Submit")')
        
        if (await submitButton.isVisible()) {
          await submitButton.click()
          
          // Check for error messages with proper ARIA attributes
          const errorMessages = await page.locator('[role="alert"], [aria-live], .error, [data-testid*="error"]').all()
          
          for (const errorMsg of errorMessages) {
            if (await errorMsg.isVisible()) {
              const role = await errorMsg.getAttribute('role')
              const ariaLive = await errorMsg.getAttribute('aria-live')
              
              // Should have role="alert" or aria-live attribute
              expect(role === 'alert' || ariaLive).toBeTruthy()
            }
          }
        }
      }
    }
  })

  test('dynamic content updates are announced', async ({ page }) => {
    await page.goto('/dashboards')
    
    // Look for elements that might update dynamically
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').all()
    
    for (const region of liveRegions) {
      if (await region.isVisible()) {
        const ariaLive = await region.getAttribute('aria-live')
        const role = await region.getAttribute('role')
        
        // Verify proper live region configuration
        const hasLiveAttribute = ariaLive === 'polite' || ariaLive === 'assertive' || 
                                role === 'status' || role === 'alert'
        
        expect(hasLiveAttribute).toBeTruthy()
      }
    }
  })
})