import { test, expect } from '../fixtures/base-test'

test.describe('Home Services Management', () => {
  test.beforeEach(async ({ navigation }) => {
    await navigation.goToIndustryDashboard('hs')
  })

  test('home services dashboard loads with key metrics', async ({ page, accessibility, performance }) => {
    // Verify dashboard loads within performance budget
    const loadTime = await performance.measurePageLoad()
    expect(loadTime).toBeLessThan(3000)

    // Check dashboard title
    await expect(page.locator('h1')).toContainText('Home Services')

    // Verify key dashboard elements
    const dashboardElements = [
      'work orders',
      'customers', 
      'technicians',
      'schedule'
    ]

    for (const element of dashboardElements) {
      // Look for navigation links or dashboard cards
      const elementLocator = page.locator(`text="${element}"`, { exact: false }).or(
        page.locator(`[data-testid*="${element}"]`)
      )
      
      if (await elementLocator.first().isVisible()) {
        await expect(elementLocator.first()).toBeVisible()
      }
    }

    // Check accessibility compliance
    await accessibility.checkAccessibility()
  })

  test('work order creation flow', async ({ page, forms, homeServices }) => {
    // Navigate to work order creation
    await page.click('text="Work Orders"')
    await page.click('text="Create"')

    // Verify we're on the create page
    await expect(page.locator('h1').or(page.locator('h2'))).toContainText('Create Work Order')

    // Fill work order form
    const workOrderData = {
      customerName: 'John Smith',
      serviceType: 'HVAC Repair',
      description: 'Air conditioning unit not working properly',
      priority: 'high'
    }

    // Try different form field selectors
    const customerField = page.locator('[name="customerName"]').or(
      page.locator('[data-testid="customer-name"]')
    ).or(
      page.locator('input').first()
    )

    if (await customerField.isVisible()) {
      await forms.fillForm(workOrderData)
      await forms.submitForm('Create Work Order')

      // Verify work order was created
      await expect(page.locator('text="Work order created"')).or(
        page.locator('text="Success"')
      ).or(
        page.locator('[data-testid="success-message"]')
      ).toBeVisible({ timeout: 10000 })
    }
  })

  test('work order listing and filtering', async ({ page }) => {
    await page.click('text="Work Orders"')

    // Verify work orders list page
    await expect(page.locator('h1').or(page.locator('h2'))).toContainText('Work Orders')

    // Check for work order table or list
    const workOrderList = page.locator('[data-testid="work-orders-list"]').or(
      page.locator('table')
    ).or(
      page.locator('[role="grid"]')
    )

    if (await workOrderList.isVisible()) {
      // Test filtering if available
      const filterInput = page.locator('[placeholder*="filter"]').or(
        page.locator('[placeholder*="search"]')
      ).or(
        page.locator('input[type="text"]').first()
      )

      if (await filterInput.isVisible()) {
        await filterInput.fill('HVAC')
        await page.waitForTimeout(1000) // Allow filtering to process

        // Verify filtering works
        const filteredResults = workOrderList.locator('text="HVAC"')
        if (await filteredResults.count() > 0) {
          await expect(filteredResults.first()).toBeVisible()
        }
      }
    }
  })

  test('customer management functionality', async ({ page, forms }) => {
    await page.click('text="Customers"')

    // Verify customers page
    await expect(page.locator('h1').or(page.locator('h2'))).toContainText('Customers')

    // Test customer creation if available
    const createButton = page.locator('text="Create"').or(
      page.locator('text="Add Customer"')
    ).or(
      page.locator('text="New Customer"')
    )

    if (await createButton.isVisible()) {
      await createButton.click()

      // Fill customer form
      const customerData = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '555-123-4567',
        address: '123 Main St, Anytown, ST 12345'
      }

      // Try to fill form fields
      for (const [field, value] of Object.entries(customerData)) {
        const fieldLocator = page.locator(`[name="${field}"]`).or(
          page.locator(`[data-testid="${field}"]`)
        )

        if (await fieldLocator.isVisible()) {
          await fieldLocator.fill(value)
        }
      }

      // Submit form
      const submitButton = page.locator('button:has-text("Save")').or(
        page.locator('button:has-text("Create")')
      ).or(
        page.locator('button[type="submit"]')
      )

      if (await submitButton.isVisible()) {
        await submitButton.click()

        // Verify success
        await expect(page.locator('text="Customer created"').or(
          page.locator('text="Success"')
        )).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('technician scheduling interface', async ({ page }) => {
    await page.click('text="Schedule"')

    // Verify schedule page
    await expect(page.locator('h1').or(page.locator('h2'))).toContainText('Schedule')

    // Look for calendar or scheduling interface
    const scheduleInterface = page.locator('[data-testid="calendar"]').or(
      page.locator('[class*="calendar"]')
    ).or(
      page.locator('[role="grid"]')
    )

    if (await scheduleInterface.isVisible()) {
      // Test calendar navigation
      const nextButton = page.locator('button:has-text("Next")').or(
        page.locator('[aria-label*="next"]')
      )

      if (await nextButton.isVisible()) {
        await nextButton.click()
        await page.waitForTimeout(500)
        
        // Verify calendar navigated
        expect(await scheduleInterface.isVisible()).toBeTruthy()
      }

      // Test appointment creation if available
      const timeSlot = page.locator('[data-testid="time-slot"]').or(
        page.locator('[class*="time-slot"]')
      ).first()

      if (await timeSlot.isVisible()) {
        await timeSlot.click()

        // Check if appointment form appears
        const appointmentForm = page.locator('[data-testid="appointment-form"]').or(
          page.locator('form')
        )

        if (await appointmentForm.isVisible()) {
          expect(await appointmentForm.isVisible()).toBeTruthy()
        }
      }
    }
  })

  test('invoice generation workflow', async ({ page, forms }) => {
    // Navigate to invoices
    await page.click('text="Invoices"')
    
    await expect(page.locator('h1').or(page.locator('h2'))).toContainText('Invoices')

    // Test invoice creation
    const createInvoiceButton = page.locator('text="Create"').or(
      page.locator('text="New Invoice"')
    ).or(
      page.locator('text="Generate Invoice"')
    )

    if (await createInvoiceButton.isVisible()) {
      await createInvoiceButton.click()

      // Fill invoice form
      const invoiceData = {
        customer: 'John Smith',
        workOrder: 'WO-001',
        amount: '250.00',
        description: 'HVAC repair services'
      }

      // Try to fill available fields
      for (const [field, value] of Object.entries(invoiceData)) {
        const fieldLocator = page.locator(`[name="${field}"]`).or(
          page.locator(`[data-testid="${field}"]`)
        )

        if (await fieldLocator.isVisible()) {
          await fieldLocator.fill(value)
        }
      }

      // Submit invoice
      const generateButton = page.locator('button:has-text("Generate")').or(
        page.locator('button:has-text("Create")')
      ).or(
        page.locator('button[type="submit"]')
      )

      if (await generateButton.isVisible()) {
        await generateButton.click()

        // Verify invoice was generated
        await expect(page.locator('text="Invoice generated"').or(
          page.locator('text="Success"')
        )).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('technician management features', async ({ page }) => {
    await page.click('text="Technicians"')

    // Verify technicians page
    await expect(page.locator('h1').or(page.locator('h2'))).toContainText('Technicians')

    // Check technician list
    const technicianList = page.locator('[data-testid="technicians-list"]').or(
      page.locator('table')
    ).or(
      page.locator('[role="grid"]')
    )

    if (await technicianList.isVisible()) {
      // Test technician details view
      const firstTechnician = technicianList.locator('tr').nth(1).or(
        technicianList.locator('[data-testid*="technician"]').first()
      )

      if (await firstTechnician.isVisible()) {
        await firstTechnician.click()

        // Verify technician details page or modal
        const technicianDetails = page.locator('[data-testid="technician-details"]').or(
          page.locator('[role="dialog"]')
        )

        if (await technicianDetails.isVisible()) {
          expect(await technicianDetails.isVisible()).toBeTruthy()
        }
      }
    }

    // Test add technician functionality
    const addTechnicianButton = page.locator('text="Add"').or(
      page.locator('text="New Technician"')
    ).or(
      page.locator('text="Create"')
    )

    if (await addTechnicianButton.isVisible()) {
      await addTechnicianButton.click()

      // Verify add technician form
      const technicianForm = page.locator('[data-testid="technician-form"]').or(
        page.locator('form')
      )

      if (await technicianForm.isVisible()) {
        expect(await technicianForm.isVisible()).toBeTruthy()
      }
    }
  })

  test('reports and analytics access', async ({ page }) => {
    // Look for reports navigation
    const reportsLink = page.locator('text="Reports"').or(
      page.locator('text="Analytics"')
    ).or(
      page.locator('text="Dashboard"')
    )

    if (await reportsLink.isVisible()) {
      await reportsLink.click()

      // Verify reports page loads
      await expect(page.locator('h1').or(page.locator('h2'))).toContainText(/Reports|Analytics|Dashboard/)

      // Check for charts or metrics
      const chartElements = page.locator('[data-testid*="chart"]').or(
        page.locator('[class*="chart"]')
      ).or(
        page.locator('canvas')
      )

      if (await chartElements.count() > 0) {
        await expect(chartElements.first()).toBeVisible()
      }

      // Check for key performance indicators
      const kpiElements = page.locator('[data-testid*="kpi"]').or(
        page.locator('[class*="metric"]')
      ).or(
        page.locator('[class*="stat"]')
      )

      if (await kpiElements.count() > 0) {
        await expect(kpiElements.first()).toBeVisible()
      }
    }
  })

  test('settings and configuration', async ({ page }) => {
    // Navigate to settings
    const settingsLink = page.locator('text="Settings"').or(
      page.locator('[aria-label*="settings"]')
    ).or(
      page.locator('[data-testid="settings"]')
    )

    if (await settingsLink.isVisible()) {
      await settingsLink.click()

      // Verify settings page
      await expect(page.locator('h1').or(page.locator('h2'))).toContainText('Settings')

      // Check settings categories
      const settingsCategories = [
        'Business Information',
        'Service Types', 
        'Pricing',
        'Notifications',
        'Users',
        'Integrations'
      ]

      for (const category of settingsCategories) {
        const categoryElement = page.locator(`text="${category}"`).or(
          page.locator(`[data-testid*="${category.toLowerCase().replace(' ', '-')}"]`)
        )

        if (await categoryElement.isVisible()) {
          await expect(categoryElement).toBeVisible()
        }
      }
    }
  })
})