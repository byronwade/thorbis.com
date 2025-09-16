# Thorbis Performance Budgets & Core Web Vitals

Comprehensive performance budget strategy with Core Web Vitals monitoring for optimal SEO and user experience across all Thorbis content and applications.

## Core Web Vitals Budget Targets

### Primary Performance Metrics

#### Largest Contentful Paint (LCP) - Loading Performance
```
🎯 Target: < 2.5 seconds
⚠️  Needs Improvement: 2.5s - 4.0s  
❌ Poor: > 4.0 seconds

Page Type Specific Targets:
- Homepage: < 2.0s
- Industry pages: < 2.2s  
- City pages: < 2.3s
- Blog posts: < 2.5s
- Guides: < 2.8s (complex content)
- Business profiles: < 2.1s
```

#### Cumulative Layout Shift (CLS) - Visual Stability
```
🎯 Target: < 0.1
⚠️  Needs Improvement: 0.1 - 0.25
❌ Poor: > 0.25

Page Type Specific Targets:
- All pages: < 0.1 (no exceptions)
- Form pages: < 0.05 (critical for conversions)
- Checkout/pricing: < 0.03 (revenue impact)
```

#### First Input Delay (FID) / Interaction to Next Paint (INP) - Interactivity
```
🎯 Target: < 100ms (FID) / < 200ms (INP)
⚠️  Needs Improvement: 100-300ms (FID) / 200-500ms (INP)
❌ Poor: > 300ms (FID) / > 500ms (INP)

Page Type Specific Targets:
- Marketing pages: < 100ms FID / < 200ms INP
- Application UI: < 50ms FID / < 150ms INP  
- Forms: < 75ms FID / < 100ms INP
```

### Secondary Performance Metrics

#### First Contentful Paint (FCP) - Perceived Loading
```
🎯 Target: < 1.8 seconds
⚠️  Needs Improvement: 1.8s - 3.0s
❌ Poor: > 3.0 seconds
```

#### Total Blocking Time (TBT) - Responsiveness
```
🎯 Target: < 200ms
⚠️  Needs Improvement: 200-600ms
❌ Poor: > 600ms
```

#### Speed Index - Visual Loading Progress  
```
🎯 Target: < 3.4 seconds
⚠️  Needs Improvement: 3.4s - 5.8s
❌ Poor: > 5.8 seconds
```

## Performance Budget Implementation

### Resource Budget Limits

#### JavaScript Budget
```
Page Type                | JS Budget  | Critical JS | Non-Critical JS
-------------------------|------------|-------------|----------------
Homepage                 | 150KB      | 50KB        | 100KB
Industry Pages           | 180KB      | 60KB        | 120KB  
City Pages              | 160KB      | 55KB        | 105KB
Blog Posts              | 120KB      | 40KB        | 80KB
Comprehensive Guides    | 200KB      | 70KB        | 130KB
Business Profiles       | 140KB      | 45KB        | 95KB
Application Pages       | 250KB      | 100KB       | 150KB
```

#### CSS Budget
```
Page Type                | CSS Budget | Critical CSS | Non-Critical CSS
-------------------------|------------|-------------|------------------
All Pages               | 75KB       | 20KB        | 55KB
Homepage                | 85KB       | 25KB        | 60KB
Complex Guides          | 90KB       | 30KB        | 60KB
Application UI          | 120KB      | 40KB        | 80KB
```

#### Image Budget
```
Page Type                | Total Images | Hero Image | Content Images | Icons/Graphics
-------------------------|-------------|------------|----------------|---------------
Homepage                 | 1.2MB       | 400KB      | 600KB          | 200KB
Industry Pages           | 1.0MB       | 350KB      | 500KB          | 150KB
City Pages              | 800KB       | 300KB      | 400KB          | 100KB
Blog Posts              | 600KB       | 200KB      | 350KB          | 50KB
Guides                  | 1.5MB       | 300KB      | 1000KB         | 200KB
Business Profiles       | 500KB       | 150KB      | 300KB          | 50KB
```

#### Font Budget
```
Font Category           | Budget     | Format      | Loading Strategy
------------------------|-----------|-------------|------------------
Primary (Inter)         | 60KB      | WOFF2       | Preload
Secondary (Headings)    | 40KB      | WOFF2       | Preload  
Icons                   | 25KB      | WOFF2       | Lazy load
Monospace (Code)        | 30KB      | WOFF2       | Lazy load
Total Font Budget       | 155KB     | -           | -
```

### Third-Party Script Budget
```
Service Type            | Budget     | Loading     | Critical Path
------------------------|-----------|-------------|---------------
Analytics (GA4)         | 45KB      | Async       | No
Tag Manager             | 35KB      | Async       | No  
Chat Widget             | 60KB      | Lazy        | No
Social Media            | 25KB      | Lazy        | No
Marketing Tools         | 40KB      | Lazy        | No
Total Third-Party       | 205KB     | -           | No
```

## Page-Specific Performance Requirements

### Homepage Performance Targets
```
Metric                  | Target    | Monitoring  | Alert Threshold
------------------------|-----------|-------------|----------------
LCP                     | < 2.0s    | Real-time   | > 2.2s
CLS                     | < 0.1     | Real-time   | > 0.12
FID/INP                 | < 100ms   | Real-time   | > 120ms
FCP                     | < 1.5s    | Real-time   | > 1.8s  
Speed Index             | < 2.8s    | Daily       | > 3.2s
Total Page Size         | < 2.5MB   | Build-time  | > 2.8MB
```

### Industry & City Pages
```
Metric                  | Target    | Monitoring  | Alert Threshold
------------------------|-----------|-------------|----------------
LCP                     | < 2.3s    | Real-time   | > 2.6s
CLS                     | < 0.1     | Real-time   | > 0.12
Page Load Time          | < 3.0s    | Real-time   | > 3.5s
Time to Interactive     | < 3.5s    | Daily       | > 4.0s
Total Page Size         | < 2.0MB   | Build-time  | > 2.3MB
```

### Content Hub Pages (Blog, Guides)
```
Metric                  | Target    | Monitoring  | Alert Threshold  
------------------------|-----------|-------------|----------------
LCP                     | < 2.5s    | Real-time   | > 2.8s
CLS                     | < 0.1     | Real-time   | > 0.12
Reading Experience      | Good      | Weekly      | Needs Improvement
Content Loading         | < 2.0s    | Daily       | > 2.5s
Image Optimization      | 90%       | Build-time  | < 85%
```

### Business Profile Pages
```
Metric                  | Target    | Monitoring  | Alert Threshold
------------------------|-----------|-------------|----------------
LCP                     | < 2.1s    | Real-time   | > 2.4s
CLS                     | < 0.1     | Real-time   | > 0.12  
Local Business Schema   | Valid     | Daily       | Invalid
Contact Info Load       | < 1.5s    | Real-time   | > 2.0s
Map Integration         | < 3.0s    | Daily       | > 4.0s
```

## Performance Monitoring Implementation

### Real User Monitoring (RUM)

#### Core Web Vitals Monitoring
```typescript
// performance-monitoring.ts
export class CoreWebVitalsMonitor {
  private metrics: PerformanceMetric[] = []
  
  initializeMonitoring(): void {
    // Largest Contentful Paint
    this.observeLCP()
    
    // Cumulative Layout Shift  
    this.observeCLS()
    
    // First Input Delay / Interaction to Next Paint
    this.observeInteractivity()
    
    // Send metrics to analytics
    this.setupMetricReporting()
  }
  
  private observeLCP(): void {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry
      
      const lcpValue = lastEntry.startTime
      
      this.recordMetric({
        name: 'LCP',
        value: lcpValue,
        rating: this.rateLCP(lcpValue),
        timestamp: Date.now(),
        url: window.location.href,
        pageType: this.getPageType()
      })
      
      // Alert if budget exceeded
      if (lcpValue > this.getLCPThreshold()) {
        this.triggerPerformanceAlert('LCP', lcpValue)
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  }
  
  private observeCLS(): void {
    let clsValue = 0
    let sessionValue = 0
    let sessionEntries: PerformanceEntry[] = []
    
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]
          
          if (sessionValue && 
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value
            sessionEntries.push(entry)
          } else {
            sessionValue = entry.value
            sessionEntries = [entry]
          }
          
          if (sessionValue > clsValue) {
            clsValue = sessionValue
            
            this.recordMetric({
              name: 'CLS',
              value: clsValue,
              rating: this.rateCLS(clsValue),
              timestamp: Date.now(),
              url: window.location.href,
              pageType: this.getPageType()
            })
            
            // Alert if budget exceeded  
            if (clsValue > 0.1) {
              this.triggerPerformanceAlert('CLS', clsValue)
            }
          }
        }
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }
  
  private rateLCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good'
    if (value <= 4000) return 'needs-improvement'
    return 'poor'
  }
  
  private rateCLS(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good'
    if (value <= 0.25) return 'needs-improvement'
    return 'poor'
  }
  
  private getPageType(): string {
    const path = window.location.pathname
    
    if (path === '/') return 'homepage'
    if (path.startsWith('/industries/')) return 'industry'
    if (path.startsWith('/cities/')) return 'city'
    if (path.startsWith('/learn/blog/')) return 'blog'
    if (path.startsWith('/learn/guides/')) return 'guide'
    if (path.startsWith('/businesses/')) return 'business-profile'
    if (path.startsWith('/features/')) return 'feature'
    
    return 'other'
  }
}

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
  pageType: string
}
```

#### Performance Budget Monitoring
```typescript
// performance-budget-monitor.ts
export class PerformanceBudgetMonitor {
  private budgets: PerformanceBudget[]
  
  constructor() {
    this.budgets = [
      {
        pageType: 'homepage',
        metrics: {
          lcp: 2000,        // 2.0s
          cls: 0.1,
          totalSize: 2500,  // 2.5MB in KB
          jsSize: 150,      // 150KB
          cssSize: 85,      // 85KB
          imageSize: 1200   // 1.2MB in KB
        }
      },
      {
        pageType: 'industry',
        metrics: {
          lcp: 2300,        // 2.3s
          cls: 0.1,
          totalSize: 2000,  // 2.0MB in KB
          jsSize: 180,      // 180KB
          cssSize: 75,      // 75KB
          imageSize: 1000   // 1.0MB in KB
        }
      }
      // ... additional page types
    ]
  }
  
  checkBudgets(metrics: PerformanceMetric[], pageType: string): BudgetResult {
    const budget = this.budgets.find(b => b.pageType === pageType)
    if (!budget) return { passed: true, violations: [] }
    
    const violations: BudgetViolation[] = []
    
    // Check Core Web Vitals against budget
    const lcpMetric = metrics.find(m => m.name === 'LCP')
    if (lcpMetric && lcpMetric.value > budget.metrics.lcp) {
      violations.push({
        metric: 'LCP',
        actual: lcpMetric.value,
        budget: budget.metrics.lcp,
        severity: 'high'
      })
    }
    
    const clsMetric = metrics.find(m => m.name === 'CLS')
    if (clsMetric && clsMetric.value > budget.metrics.cls) {
      violations.push({
        metric: 'CLS',
        actual: clsMetric.value,
        budget: budget.metrics.cls,
        severity: 'high'
      })
    }
    
    return {
      passed: violations.length === 0,
      violations: violations
    }
  }
}

interface PerformanceBudget {
  pageType: string
  metrics: {
    lcp: number      // milliseconds
    cls: number      // ratio
    totalSize: number // KB
    jsSize: number   // KB
    cssSize: number  // KB
    imageSize: number // KB
  }
}

interface BudgetViolation {
  metric: string
  actual: number
  budget: number
  severity: 'low' | 'medium' | 'high'
}
```

### Synthetic Monitoring

#### Lighthouse CI Integration
```yaml
# .github/workflows/lighthouse-ci.yml
name: Lighthouse CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build project
        run: npm run build
        
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.11.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/industries/restaurants/',
        'http://localhost:3000/cities/california/los-angeles/',
        'http://localhost:3000/learn/blog/',
        'http://localhost:3000/features/pos-system/'
      ],
      startServerCommand: 'npm start',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Core Web Vitals budgets
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        
        // Resource budgets
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'speed-index': ['error', { maxNumericValue: 3400 }],
        'interactive': ['error', { maxNumericValue: 3500 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

#### WebPageTest Integration
```javascript
// webpagetest-monitor.js
const WebPageTest = require('webpagetest')

class WebPageTestMonitor {
  constructor(apiKey) {
    this.wpt = new WebPageTest('www.webpagetest.org', apiKey)
  }
  
  async runTests(urls) {
    const testResults = []
    
    for (const url of urls) {
      const testOptions = {
        location: 'Dulles:Chrome',
        connectivity: '3G',
        runs: 3,
        firstViewOnly: false,
        video: true,
        breakdown: true,
        domains: true,
        pageSpeed: true
      }
      
      try {
        const result = await this.runTest(url, testOptions)
        testResults.push(this.parseResults(result, url))
      } catch (error) {
        console.error(`Test failed for ${url}:`, error)
      }
    }
    
    return testResults
  }
  
  parseResults(result, url) {
    const firstView = result.data.runs[1].firstView
    const repeatView = result.data.runs[1].repeatView
    
    return {
      url: url,
      testId: result.data.testId,
      summary: result.data.summary,
      metrics: {
        lcp: firstView.chromeUserTiming?.LargestContentfulPaint || 0,
        cls: firstView.chromeUserTiming?.CumulativeLayoutShift || 0,
        fid: firstView.chromeUserTiming?.FirstInputDelay || 0,
        fcp: firstView.firstContentfulPaint || 0,
        speedIndex: firstView.SpeedIndex || 0,
        loadTime: firstView.loadTime || 0,
        totalSize: firstView.bytesIn || 0
      },
      budgetViolations: this.checkBudgetViolations(firstView)
    }
  }
}
```

## Performance Alerting & Response

### Alert Configuration

#### Critical Performance Alerts
```yaml
# performance-alerts.yml
alerts:
  - name: "Core Web Vitals Degradation"
    condition: |
      LCP > 2.5s OR CLS > 0.1 OR FID > 100ms
    severity: "critical"
    notification:
      - slack: "#performance-alerts"
      - email: ["dev-team@thorbis.com"]
    response_time: "< 30 minutes"
    
  - name: "Homepage Performance Budget Exceeded"
    condition: |
      homepage_lcp > 2.2s OR homepage_cls > 0.12
    severity: "high"
    notification:
      - slack: "#performance-alerts"
    response_time: "< 2 hours"
    
  - name: "Page Load Time Degradation"
    condition: |
      page_load_time > 3.5s for 5 consecutive minutes
    severity: "medium"
    notification:
      - slack: "#performance-monitoring"
    response_time: "< 24 hours"
```

#### Performance Response Playbook
```markdown
## Critical Performance Issue Response (< 30 minutes)

### Immediate Actions:
1. **Identify Impact Scope**
   - Check affected pages/regions
   - Measure user impact percentage
   - Verify alert accuracy with secondary monitoring

2. **Quick Mitigation**
   - Enable performance cache boost
   - Activate CDN performance mode
   - Consider feature flag rollback if recent deployment

3. **Root Cause Investigation**
   - Check recent deployments and changes
   - Review server performance metrics
   - Analyze third-party service status
   - Check CDN and infrastructure status

4. **Communication**
   - Update status page if user-facing impact
   - Notify stakeholders via Slack
   - Create incident record

### Performance Degradation Troubleshooting:

#### LCP Issues:
- Check server response times
- Verify image optimization
- Review render-blocking resources
- Analyze resource loading priorities

#### CLS Issues:
- Review recent layout changes
- Check for missing image dimensions
- Verify font loading strategies
- Analyze dynamic content insertion

#### FID/INP Issues:
- Review JavaScript execution time
- Check for long-running tasks
- Analyze third-party script performance
- Verify main thread blocking
```

## Performance Budget Governance

### Budget Review Process

#### Weekly Performance Review
```markdown
## Weekly Performance Budget Review

### Metrics to Review:
1. **Core Web Vitals Trends**
   - LCP trend analysis by page type
   - CLS violations and patterns
   - FID/INP performance distribution

2. **Budget Compliance**
   - Resource budget adherence
   - Performance budget violations
   - Third-party script impact analysis

3. **User Experience Impact**
   - Bounce rate correlation with performance
   - Conversion impact analysis
   - User satisfaction metrics

### Action Items:
- Identify performance regressions
- Plan optimization initiatives  
- Update performance budgets if needed
- Review third-party service performance
```

#### Monthly Budget Optimization
```markdown
## Monthly Performance Budget Optimization

### Budget Effectiveness Analysis:
1. **Are current budgets too strict/lenient?**
2. **Do budgets align with user experience goals?** 
3. **Are there new performance opportunities?**
4. **Should budgets be adjusted for seasonal traffic?**

### Optimization Initiatives:
- Image optimization improvements
- Code splitting enhancements
- Third-party script optimization
- CDN and caching improvements
- Resource loading strategy updates
```

### Performance Budget Enforcement

#### CI/CD Integration
```yaml
# performance-budget-check.yml
name: Performance Budget Check
on:
  pull_request:
    branches: [main]

jobs:
  performance-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Build application
        run: |
          npm install
          npm run build
          
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun --config=lighthouserc.js
          
      - name: Check Bundle Size
        run: |
          npm run analyze-bundle
          node scripts/check-bundle-budget.js
          
      - name: Performance Budget Gate
        run: |
          if [[ $LIGHTHOUSE_PERFORMANCE_SCORE < 90 ]]; then
            echo "❌ Performance budget failed: Score $LIGHTHOUSE_PERFORMANCE_SCORE < 90"
            exit 1
          fi
          
          if [[ $BUNDLE_SIZE > $BUNDLE_BUDGET ]]; then
            echo "❌ Bundle size budget exceeded: $BUNDLE_SIZE > $BUNDLE_BUDGET"
            exit 1
          fi
          
          echo "✅ Performance budget passed"
```

This comprehensive performance budget strategy ensures Thorbis maintains optimal Core Web Vitals scores across all content types while providing robust monitoring, alerting, and response procedures for performance issues that could impact SEO rankings and user experience.
