// Netflix-style analytics for tracking user engagement and performance
import { throttle } from 'lodash';

class NetflixAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.pageStartTime = Date.now();
    this.currentSection = 'hero';
    this.scrollEngagementData = [];
    this.hoverEvents = [];
    this.performanceMetrics = new Map();
    
    // Initialize tracking
    this.initializeTracking();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeTracking() {
    if (typeof window === 'undefined') return;

    // Track scroll engagement (Netflix-style)
    this.trackScrollEngagement();
    
    // Track card hover events
    this.trackCardHovers();
    
    // Track performance metrics
    this.trackPerformanceMetrics();
    
    // Track visibility changes
    this.trackVisibilityChanges();
  }

  // Netflix-style scroll engagement tracking
  trackScrollEngagement() {
    const handleScroll = throttle(() => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPercentage = (scrollY / (documentHeight - windowHeight)) * 100;
      
      // Determine current section
      const sections = ['hero', 'food-dining', 'home-services', 'health-wellness', 'shopping', 'automotive', 'trending', 'continue-browsing'];
      let newCurrentSection = this.currentSection;
      
      sections.forEach((section, index) => {
        const sectionElement = document.querySelector(`[data-section="${section}"]`);
        if (sectionElement) {
          const rect = sectionElement.getBoundingClientRect();
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            newCurrentSection = section;
          }
        }
      });

      if (newCurrentSection !== this.currentSection) {
        this.trackSectionChange(this.currentSection, newCurrentSection);
        this.currentSection = newCurrentSection;
      }

      // Track engagement milestones
      const milestone = Math.floor(scrollPercentage / 10) * 10;
      if (milestone > 0 && !this.scrollEngagementData.includes(milestone)) {
        this.scrollEngagementData.push(milestone);
        this.trackEvent('scroll_milestone', {
          milestone: `${milestone}%`,
          section: this.currentSection,
          timeOnPage: Date.now() - this.pageStartTime,
          sessionId: this.sessionId
        });
      }
    }, 1000);

    window.addEventListener('scroll', handleScroll);
  }

  // Track Netflix-style card hover interactions
  trackCardHovers() {
    document.addEventListener('mouseenter', (e) => {
      // Ensure we have an Element before calling closest()
      if (!e.target || typeof e.target.closest !== 'function') {
        return;
      }
      
      const card = e.target.closest('[data-business-card]');
      if (card) {
        const businessId = card.dataset.businessId;
        const businessName = card.dataset.businessName;
        const category = card.dataset.businessCategory;
        const hoverStartTime = Date.now();
        
        card.dataset.hoverStartTime = hoverStartTime;
        
        this.trackEvent('card_hover_start', {
          businessId,
          businessName,
          category,
          section: this.currentSection,
          timestamp: hoverStartTime,
          sessionId: this.sessionId
        });
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      // Ensure we have an Element before calling closest()
      if (!e.target || typeof e.target.closest !== 'function') {
        return;
      }
      
      const card = e.target.closest('[data-business-card]');
      if (card && card.dataset.hoverStartTime) {
        const businessId = card.dataset.businessId;
        const businessName = card.dataset.businessName;
        const category = card.dataset.businessCategory;
        const hoverStartTime = parseInt(card.dataset.hoverStartTime);
        const hoverDuration = Date.now() - hoverStartTime;
        
        delete card.dataset.hoverStartTime;
        
        this.trackEvent('card_hover_end', {
          businessId,
          businessName,
          category,
          section: this.currentSection,
          hoverDuration,
          sessionId: this.sessionId
        });

        // Track long hover engagement (3+ seconds = high interest)
        if (hoverDuration > 3000) {
          this.trackEvent('high_engagement_hover', {
            businessId,
            businessName,
            category,
            hoverDuration,
            section: this.currentSection,
            sessionId: this.sessionId
          });
        }
      }
    }, true);
  }

  // Track performance metrics like Netflix does - optimized to prevent long tasks
  trackPerformanceMetrics() {
    // Defer performance observers setup to prevent blocking
    this.deferPerformanceObservers();
  }

  // Deferred performance observers setup
  deferPerformanceObservers() {
    const setupObservers = () => {
      // Track Core Web Vitals
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint (LCP)
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.trackEvent('core_web_vital_lcp', {
              value: lastEntry.startTime,
              rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor',
              sessionId: this.sessionId
            });
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay (FID)
          new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            if (firstInput) {
              this.trackEvent('core_web_vital_fid', {
                value: firstInput.processingStart - firstInput.startTime,
                rating: firstInput.processingStart - firstInput.startTime < 100 ? 'good' : 
                       firstInput.processingStart - firstInput.startTime < 300 ? 'needs-improvement' : 'poor',
                sessionId: this.sessionId
              });
            }
          }).observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift (CLS)
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            this.trackEvent('core_web_vital_cls', {
              value: clsValue,
              rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
              sessionId: this.sessionId
            });
          }).observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.debug('Performance observers setup failed:', error);
        }
      }

      // Track Netflix-style loading performance
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.fetchStart;
        
        this.trackEvent('page_load_performance', {
          loadTime,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
          firstByte: perfData.responseStart - perfData.fetchStart,
          rating: loadTime < 3000 ? 'excellent' : loadTime < 5000 ? 'good' : 'needs-improvement',
          sessionId: this.sessionId
        });
      });
    };

    // Use requestIdleCallback to defer setup
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(setupObservers, { timeout: 5000 });
    } else {
      setTimeout(setupObservers, 100);
    }
  }

  // Track visibility changes (tab switching, etc.)
  trackVisibilityChanges() {
    let visibilityStart = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const visibilityDuration = Date.now() - visibilityStart;
        this.trackEvent('page_visibility_hidden', {
          visibilityDuration,
          section: this.currentSection,
          sessionId: this.sessionId
        });
      } else {
        visibilityStart = Date.now();
        this.trackEvent('page_visibility_visible', {
          section: this.currentSection,
          sessionId: this.sessionId
        });
      }
    });
  }

  // Track section changes (like Netflix's row tracking)
  trackSectionChange(fromSection, toSection) {
    this.trackEvent('section_change', {
      fromSection,
      toSection,
      timeInSection: Date.now() - this.pageStartTime,
      sessionId: this.sessionId
    });
  }

  // Track business card clicks
  trackBusinessCardClick(businessId, businessName, category, section, position) {
    this.trackEvent('business_card_click', {
      businessId,
      businessName,
      category,
      section,
      position,
      timeOnPage: Date.now() - this.pageStartTime,
      sessionId: this.sessionId
    });
  }

  // Track feature usage
  trackFeatureUsage(featureName, action, metadata = {}) {
    this.trackEvent('feature_usage', {
      feature: featureName,
      action,
      metadata,
      section: this.currentSection,
      sessionId: this.sessionId
    });
  }

  // Central event tracking method
  trackEvent(eventName, properties) {
    const eventData = {
      event: eventName,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      sessionId: this.sessionId,
      ...properties
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventData);
    }

    // Send to analytics service (implement based on your analytics provider)
    this.sendToAnalyticsService(eventData);
  }

  // Send to your analytics service
  sendToAnalyticsService(eventData) {
    // Implement based on your analytics provider (Google Analytics, Mixpanel, etc.)
    // Example:
    if (typeof gtag !== 'undefined') {
      gtag('event', eventData.event, {
        custom_map: eventData
      });
    }
    
    // Or send to your own API
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      }).catch(error => {
        console.warn('Analytics tracking failed:', error);
      });
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  }

  // Get engagement summary (like Netflix's engagement metrics)
  getEngagementSummary() {
    return {
      sessionId: this.sessionId,
      timeOnPage: Date.now() - this.pageStartTime,
      sectionsViewed: [...new Set(this.scrollEngagementData)].length,
      scrollDepth: Math.max(...this.scrollEngagementData, 0),
      hoverEvents: this.hoverEvents.length,
      currentSection: this.currentSection
    };
  }
}

// Singleton instance
let analyticsInstance;

export function getAnalytics() {
  if (typeof window !== 'undefined' && !analyticsInstance) {
    analyticsInstance = new NetflixAnalytics();
  }
  return analyticsInstance;
}

// Helper functions for easy usage
export function trackBusinessCardClick(businessId, businessName, category, section, position) {
  const analytics = getAnalytics();
  if (analytics) {
    analytics.trackBusinessCardClick(businessId, businessName, category, section, position);
  }
}

export function trackFeatureUsage(featureName, action, metadata = {}) {
  const analytics = getAnalytics();
  if (analytics) {
    analytics.trackFeatureUsage(featureName, action, metadata);
  }
}

export default NetflixAnalytics;
