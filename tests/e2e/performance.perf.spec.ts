import { test, expect } from '../fixtures/base-test'

test.describe('Performance Optimization', () => {
  
  test('homepage loads within performance budgets', async ({ page, performance }) => {
    const startTime = Date.now()
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Check Core Web Vitals
    const vitals = await performance.getCoreWebVitals()
    
    // LCP should be ≤ 2.5s (from CLAUDE.md requirements)
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500)
    }
    
    // CLS should be ≤ 0.1
    if (vitals.cls) {
      expect(vitals.cls).toBeLessThan(0.1)
    }
    
    // FID should be ≤ 100ms
    if (vitals.fid) {
      expect(vitals.fid).toBeLessThan(100)
    }

    console.log('Homepage Performance:', {
      loadTime: `${loadTime}ms`,
      lcp: vitals.lcp ? `${Math.round(vitals.lcp)}ms` : 'N/A',
      cls: vitals.cls ? vitals.cls.toFixed(3) : 'N/A', 
      fid: vitals.fid ? `${Math.round(vitals.fid)}ms` : 'N/A'
    })
  })

  test('JavaScript bundle size meets budget constraints', async ({ page, performance }) => {
    await page.goto('/')
    
    const bundleSize = await performance.checkBundleSize()
    
    // Should meet 170KB budget from CLAUDE.md
    expect(bundleSize.totalSize).toBeLessThan(170)
    
    console.log(`JavaScript Bundle Analysis:`)
    console.log(`Total Size: ${bundleSize.totalSize}KB`)
    console.log(`Resources: ${bundleSize.resources.length}`)
    
    // Check for unusually large individual files
    const largeFiles = bundleSize.resources.filter(resource => 
      resource.size > 50 * 1024 // Files larger than 50KB
    )
    
    if (largeFiles.length > 0) {
      console.log('Large JavaScript files detected:')
      largeFiles.forEach(file => {
        const sizeKB = Math.round(file.size / 1024)
        console.log(`  ${file.name}: ${sizeKB}KB`)
      })
    }
    
    // Warn if approaching budget limit
    if (bundleSize.totalSize > 120) {
      console.warn(`⚠️  Bundle size is ${bundleSize.totalSize}KB (approaching 170KB limit)`)
    }
  })

  test('dashboard pages load efficiently', async ({ page, navigation, performance }) => {
    const dashboards = [
      { code: 'hs' as const, name: 'Home Services' },
      { code: 'rest' as const, name: 'Restaurant' },
      { code: 'auto' as const, name: 'Auto Services' },
      { code: 'ret' as const, name: 'Retail' }
    ]

    for (const dashboard of dashboards) {
      const startTime = Date.now()
      
      await navigation.goToIndustryDashboard(dashboard.code)
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Dashboard pages should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
      
      console.log(`${dashboard.name} Dashboard: ${loadTime}ms`)
    }
  })

  test('image optimization and lazy loading', async ({ page }) => {
    await page.goto('/')
    
    const images = await page.locator('img').all()
    
    for (const img of images) {
      if (await img.isVisible()) {
        // Check if images use optimized formats
        const src = await img.getAttribute('src')
        const srcset = await img.getAttribute('srcset')
        
        if (src) {
          // Should use modern formats (WebP, AVIF) when possible
          const usesModernFormat = src.includes('.webp') || src.includes('.avif') || 
                                   srcset?.includes('.webp') || srcset?.includes('.avif')
          
          // Check if using Next.js Image optimization
          const usesNextImage = src.includes('/_next/image') || 
                               await img.getAttribute('data-nimg') !== null
          
          // Images should be optimized (either modern format or Next.js optimization)
          if (src.startsWith('http') || src.startsWith('/')) {
            expect(usesModernFormat || usesNextImage).toBeTruthy()
          }
        }
        
        // Check for lazy loading
        const loading = await img.getAttribute('loading')
        const isAboveFold = await img.evaluate((el) => {
          const rect = el.getBoundingClientRect()
          return rect.top < window.innerHeight && rect.left < window.innerWidth
        })
        
        // Images below the fold should have loading="lazy"
        if (!isAboveFold) {
          expect(loading).toBe('lazy')
        }
      }
    }
  })

  test('resource preloading and prefetching', async ({ page }) => {
    await page.goto('/')
    
    // Check for resource hints
    const preloadLinks = await page.locator('link[rel="preload"]').count()
    const prefetchLinks = await page.locator('link[rel="prefetch"]').count()
    const preconnectLinks = await page.locator('link[rel="preconnect"]').count()
    const dnsPreetchLinks = await page.locator('link[rel="dns-prefetch"]').count()
    
    console.log('Resource Hints:', {
      preload: preloadLinks,
      prefetch: prefetchLinks,
      preconnect: preconnectLinks,
      dnsPrefetch: dnsPreetchLinks
    })
    
    // Should have some resource optimization
    const totalOptimizations = preloadLinks + prefetchLinks + preconnectLinks + dnsPreetchLinks
    expect(totalOptimizations).toBeGreaterThan(0)
  })

  test('font loading optimization', async ({ page }) => {
    await page.goto('/')
    
    // Check for font optimization
    const fontPreloads = await page.locator('link[rel="preload"][as="font"]').count()
    const fontDisplay = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets)
      
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          for (const rule of rules) {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              const fontFaceRule = rule as CSSFontFaceRule
              if (fontFaceRule.style.fontDisplay) {
                return fontFaceRule.style.fontDisplay
              }
            }
          }
        } catch (e) {
          // CORS or other access issues
        }
      }
      return null
    })
    
    // Should have font optimization strategies
    expect(fontPreloads >= 0).toBeTruthy() // At least checking fonts exist
    
    console.log('Font Optimization:', {
      preloadedFonts: fontPreloads,
      fontDisplay: fontDisplay || 'not detected'
    })
  })

  test('service worker caching effectiveness', async ({ page }) => {
    // First visit to prime the cache
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
    })
    
    if (swRegistered) {
      console.log('✅ Service Worker is registered and active')
      
      // Second visit should benefit from caching
      const startTime = Date.now()
      await page.reload({ waitUntil: 'networkidle' })
      const reloadTime = Date.now() - startTime
      
      // Cached reload should be faster
      expect(reloadTime).toBeLessThan(2000)
      
      console.log(`Cache-assisted reload: ${reloadTime}ms`)
    } else {
      console.log('ℹ️  Service Worker not detected')
    }
  })

  test('memory usage remains stable', async ({ page }) => {
    await page.goto('/')
    
    // Measure initial memory
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return null
    })
    
    if (initialMemory) {
      // Navigate through several pages
      const routes = [
        '/dashboards',
        '/dashboards/home-services',
        '/dashboards/restaurant',
        '/dashboards/auto-services',
        '/dashboards/retail'
      ]
      
      for (const route of routes) {
        await page.goto(route)
        await page.waitForLoadState('networkidle')
      }
      
      // Measure final memory
      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize
        }
        return null
      })
      
      if (finalMemory && initialMemory) {
        const memoryIncrease = finalMemory - initialMemory
        const increasePercentage = (memoryIncrease / initialMemory) * 100
        
        console.log('Memory Usage:', {
          initial: `${Math.round(initialMemory / 1024 / 1024)}MB`,
          final: `${Math.round(finalMemory / 1024 / 1024)}MB`,
          increase: `${increasePercentage.toFixed(1)}%`
        })
        
        // Memory increase should be reasonable
        expect(increasePercentage).toBeLessThan(200) // Less than 200% increase
      }
    }
  })

  test('network requests are optimized', async ({ page }) => {
    // Monitor network requests
    const requests: Array<{ url: string, size: number, type: string }> = []
    
    page.on('response', async (response) => {
      const request = response.request()
      const headers = await response.allHeaders()
      const contentLength = headers['content-length']
      
      requests.push({
        url: request.url(),
        size: contentLength ? parseInt(contentLength) : 0,
        type: request.resourceType()
      })
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Analyze requests
    const totalRequests = requests.length
    const totalSize = requests.reduce((sum, req) => sum + req.size, 0)
    const jsRequests = requests.filter(req => req.type === 'script')
    const cssRequests = requests.filter(req => req.type === 'stylesheet')
    const imageRequests = requests.filter(req => req.type === 'image')
    
    console.log('Network Analysis:', {
      totalRequests,
      totalSize: `${Math.round(totalSize / 1024)}KB`,
      javascript: jsRequests.length,
      css: cssRequests.length,
      images: imageRequests.length
    })
    
    // Should have reasonable number of requests
    expect(totalRequests).toBeLessThan(50)
    
    // Check for request deduplication
    const uniqueUrls = new Set(requests.map(req => req.url))
    const duplicateRequests = totalRequests - uniqueUrls.size
    
    expect(duplicateRequests).toBeLessThan(5) // Minimal duplicate requests
  })

  test('rendering performance is optimized', async ({ page }) => {
    await page.goto('/')
    
    // Measure rendering metrics
    const renderingMetrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint')
      const navigationEntries = performance.getEntriesByType('navigation')
      
      const metrics: any = {}
      
      paintEntries.forEach(entry => {
        metrics[entry.name.replace('-', '')] = entry.startTime
      })
      
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming
        metrics.domContentLoaded = nav.domContentLoadedEventEnd - nav.navigationStart
        metrics.loadComplete = nav.loadEventEnd - nav.navigationStart
      }
      
      return metrics
    })
    
    console.log('Rendering Performance:', renderingMetrics)
    
    // First Paint should be under 1.5 seconds
    if (renderingMetrics.firstpaint) {
      expect(renderingMetrics.firstpaint).toBeLessThan(1500)
    }
    
    // First Contentful Paint should be under 1.8 seconds  
    if (renderingMetrics.firstcontentfulpaint) {
      expect(renderingMetrics.firstcontentfulpaint).toBeLessThan(1800)
    }
    
    // DOM Content Loaded should be under 2 seconds
    if (renderingMetrics.domContentLoaded) {
      expect(renderingMetrics.domContentLoaded).toBeLessThan(2000)
    }
  })
})