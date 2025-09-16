'use client';

/**
 * Web Vitals Performance Reporter
 * 
 * This component monitors Core Web Vitals and enforces NextFaster performance
 * requirements. It tracks LCP, FID, CLS, TTFB, and TTI metrics to ensure
 * sub-300ms navigation and compliance with performance budgets.
 * 
 * Key Features:
 * - Real-time Core Web Vitals monitoring
 * - NextFaster TTI target enforcement (300ms)
 * - Bundle size tracking and violations
 * - Performance alerts and logging
 * - Development warnings for performance issues
 * 
 * Automatically included in all Thorbis apps for continuous performance monitoring.
 */

import { useEffect } from 'react';
import type { Metric } from 'web-vitals';

// NextFaster performance thresholds
const PERFORMANCE_THRESHOLDS = {
  FCP: 1800,    // First Contentful Paint
  LCP: 2500,    // Largest Contentful Paint
  FID: 100,     // First Input Delay
  CLS: 0.1,     // Cumulative Layout Shift
  TTFB: 800,    // Time to First Byte
  INP: 200,     // Interaction to Next Paint
  TTI: 300,     // Time to Interactive (NextFaster target)
} as const;

interface PerformanceViolation {
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'error';
  timestamp: number;
}

class PerformanceMonitor {
  private violations: PerformanceViolation[] = [];
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Report performance metric with threshold validation
   */
  reportMetric(metric: Metric) {
    const threshold = PERFORMANCE_THRESHOLDS[metric.name as keyof typeof PERFORMANCE_THRESHOLDS];
    
    if (!threshold) return;

    const isViolation = metric.value > threshold;
    
    // Log to console in development
    if (!this.isProduction) {
      const status = isViolation ? '❌ VIOLATION' : '✅ GOOD';
      const color = isViolation ? 'color: red' : 'color: green';
      console.log(
        '%c[NextFaster] ${metric.name}: ${Math.round(metric.value)}ms ${status}',
        color
      );
    }

    // Track violations
    if (isViolation) {
      const severity = metric.value > threshold * 1.5 ? 'error' : 'warning`;
      const violation: PerformanceViolation = {
        metric: metric.name,
        value: metric.value,
        threshold,
        severity,
        timestamp: Date.now(),
      };
      
      this.violations.push(violation);
      this.handleViolation(violation);
    }

    // Send to analytics in production
    if (this.isProduction) {
      this.sendToAnalytics(metric, isViolation);
    }
  }

  /**
   * Handle performance violations
   */
  private handleViolation(violation: PerformanceViolation) {
    // Development warnings
    if (!this.isProduction) {
      console.warn(
        `🐌 Performance violation: ${violation.metric} = ${Math.round(violation.value)}ms ' +
        '(threshold: ${violation.threshold}ms)'
      );

      // Specific guidance for TTI violations (NextFaster focus)
      if (violation.metric === 'TTI' || violation.metric === 'FCP') {
        console.warn('💡 NextFaster tips:');
        console.warn('  - Use Server Components over Client Components');
        console.warn('  - Implement dynamic imports for heavy components');
        console.warn('  - Enable aggressive prefetching');
        console.warn('  - Check bundle size with pnpm bundle:analyze');
      }
    }

    // Production error tracking
    if (this.isProduction && violation.severity === 'error') {
      // Send to error tracking service
      this.reportError(violation);
    }
  }

  /**
   * Send metrics to analytics
   */
  private sendToAnalytics(metric: Metric, isViolation: boolean) {
    // In a real implementation, this would send to your analytics service
    // For example: Google Analytics, DataDog, New Relic, etc.
    
    try {
      // Example analytics call
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'performance',
          event_label: metric.name,
          value: Math.round(metric.value),
          custom_map: {
            metric_id: metric.id,
            is_violation: isViolation,
          },
        });
      }
    } catch (error) {
      console.error('Analytics reporting failed:', error);
    }
  }

  /**
   * Report critical errors
   */
  private reportError(violation: PerformanceViolation) {
    // Send to error tracking service (Sentry, Bugsnag, etc.)
    console.error('Critical performance violation:', violation);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const criticalViolations = this.violations.filter(v => v.severity === 'error');
    const warnings = this.violations.filter(v => v.severity === 'warning');
    
    return {
      total: this.violations.length,
      critical: criticalViolations.length,
      warnings: warnings.length,
      violations: this.violations,
    };
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

/**
 * Web Vitals Reporter Component
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Dynamic import to avoid affecting bundle size
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      // Report all Core Web Vitals
      onCLS(performanceMonitor.reportMetric.bind(performanceMonitor));
      onFID(performanceMonitor.reportMetric.bind(performanceMonitor));
      onFCP(performanceMonitor.reportMetric.bind(performanceMonitor));
      onLCP(performanceMonitor.reportMetric.bind(performanceMonitor));
      onTTFB(performanceMonitor.reportMetric.bind(performanceMonitor));
      onINP(performanceMonitor.reportMetric.bind(performanceMonitor));
    });

    // Custom TTI measurement (NextFaster focus)
    const measureTTI = () => {
      if (typeof window === 'undefined') return;
      
      const tti = performance.timing?.domInteractive - performance.timing?.navigationStart;
      if (tti && tti > 0) {
        performanceMonitor.reportMetric({
          name: 'TTI' as any,
          value: tti,
          delta: 0,
          id: 'tti-custom',
          rating: 'good' as any,
          entries: [] as any,
          navigationType: 'navigate' as any,
        });
      }
    };

    // Measure TTI when DOM is interactive
    if (document.readyState === 'complete') {
      measureTTI();
    } else {
      window.addEventListener('load', measureTTI);
    }

    // Bundle size monitoring (development only)
    if (process.env.NODE_ENV === 'development') {
      const monitorBundleSize = () => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const totalSize = 0;
        
        scripts.forEach(script => {
          const scriptElement = script as HTMLScriptElement;
          const resource = performance.getEntriesByName(scriptElement.src)[0] as PerformanceResourceTiming;
          if (resource) {
            totalSize += resource.transferSize || 0;
          }
        });
        
        const totalSizeKB = Math.round(totalSize / 1024);
        if (totalSizeKB > 170) {
          console.warn(
            '⚠️ Bundle size exceeds NextFaster limit: ${totalSizeKB}KB (170KB limit)'
          );
        }
      };

      setTimeout(monitorBundleSize, 2000);
    }

    // Performance summary in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        const summary = performanceMonitor.getPerformanceSummary();
        if (summary.total > 0) {
          console.log('🎯 Performance Summary:', summary);
        }
      }, 5000);
    }
  }, []);

  return null; // This component only monitors, doesn't render'
}

// Export the monitor instance for external use
export { performanceMonitor };
export type { PerformanceViolation };