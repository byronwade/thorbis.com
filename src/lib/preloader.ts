// NextFaster Performance Optimizations
// Sub-300ms navigation with aggressive preloading and caching

interface PreloadConfig {
  prefetchPages: string[];
  prefetchResources: string[];
  maxConcurrentRequests: number;
  throttleDelay: number;
}

class PerformancePreloader {
  private prefetchedPages = new Set<string>();
  private prefetchedResources = new Set<string>();
  private observer: IntersectionObserver | null = null;
  private requestQueue: Array<() => Promise<void>> = [];
  private activeRequests = 0;

  constructor(private config: PreloadConfig = {
    prefetchPages: [],
    prefetchResources: [],
    maxConcurrentRequests: 3,
    throttleDelay: 50
  }) {
    this.initializeObserver();
  }

  // Initialize intersection observer for link hovering
  private initializeObserver() {
    if (typeof window === 'undefined') return;'

    // Preload on link hover
    document.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);'
    
    // Preload visible links
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLAnchorElement) {
            const href = entry.target.getAttribute('href');'
            if (href && href.startsWith('/')) {'
              this.prefetchPage(href);
            }
          }
        });
      },
      { 
        rootMargin: '100px','
        threshold: 0.1
      }
    );

    // Observe all internal links
    this.observeLinks();
  }

  // Handle mouse enter events for instant prefetching
  private handleMouseEnter(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A') {'
      const link = target as HTMLAnchorElement;
      const href = link.getAttribute('href');'
      if (href && href.startsWith('/')) {'
        this.prefetchPage(href);
      }
    }
  }

  // Observe all internal links on the page
  private observeLinks() {
    if (!this.observer) return;
    
    const links = document.querySelectorAll('a[href^="/"]');'
    links.forEach(link => this.observer!.observe(link));
  }

  // Prefetch a page with resource hints
  async prefetchPage(href: string) {
    if (this.prefetchedPages.has(href)) return;
    
    this.prefetchedPages.add(href);
    
    // Add to queue to respect concurrency limits
    this.addToQueue(async () => {
      try {
        // Prefetch the page
        const link = document.createElement('link');'
        link.rel = 'prefetch';'
        link.href = href;
        document.head.appendChild(link);

        // Fetch and cache the page data
        const response = await fetch(href, {
          method: 'GET','
          headers: {
            'X-Prefetch': 'true'
          }
        });

        if (response.ok) {
          // Parse and extract critical resources
          const html = await response.text();
          this.extractAndPrefetchResources(html, href);
        }
      } catch (error) {
        console.warn('Failed to prefetch page:', href, error);'
      }
    });
  }

  // Extract and prefetch critical resources from HTML
  private extractAndPrefetchResources(html: string, baseUrl: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');'
    
    // Prefetch critical CSS
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');'
    stylesheets.forEach(link => {
      const href = (link as HTMLLinkElement).href;
      this.prefetchResource(href, 'style');'
    });

    // Prefetch critical JavaScript
    const scripts = doc.querySelectorAll('script[src]');'
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (!src.includes('analytics') && !src.includes('tracking')) {'
        this.prefetchResource(src, 'script');'
      }
    });

    // Prefetch hero images
    const images = doc.querySelectorAll('img[src]');'
    Array.from(images).slice(0, 3).forEach(img => {
      const src = (img as HTMLImageElement).src;
      this.prefetchResource(src, 'image');'
    });
  }

  // Prefetch individual resources
  private prefetchResource(url: string, as: string) {
    if (this.prefetchedResources.has(url)) return;
    
    this.prefetchedResources.add(url);
    
    this.addToQueue(async () => {
      try {
        const link = document.createElement('link');'
        link.rel = 'prefetch';'
        link.href = url;
        link.as = as;
        document.head.appendChild(link);
      } catch (error) {
        console.warn('Failed to prefetch resource:', url, error);'
      }
    });
  }

  // Add request to queue with concurrency control
  private addToQueue(request: () => Promise<void>) {
    this.requestQueue.push(request);
    this.processQueue();
  }

  // Process the request queue
  private async processQueue() {
    if (this.activeRequests >= this.config.maxConcurrentRequests || this.requestQueue.length === 0) {
      return;
    }

    const request = this.requestQueue.shift();
    if (!request) return;

    this.activeRequests++;
    
    try {
      await request();
    } finally {
      this.activeRequests--;
      
      // Small delay to prevent overwhelming the browser
      setTimeout(() => {
        this.processQueue();
      }, this.config.throttleDelay);
    }
  }

  // Preload critical application resources
  preloadCriticalResources() {
    const criticalResources = [
      // Critical CSS
      '/_next/static/css/app.css','
      // Critical JavaScript chunks
      '/_next/static/chunks/main.js','
      '/_next/static/chunks/webpack.js','
      // UI component chunks
      '/_next/static/chunks/pages/_app.js','
      // Marketing-specific chunks
      '/_next/static/chunks/marketing-core.js'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');'
      link.rel = 'preload';'
      link.href = resource;
      
      if (resource.endsWith('.css')) {'
        link.as = 'style';'
      } else if (resource.endsWith('.js')) {'
        link.as = 'script';'
      }
      
      document.head.appendChild(link);
    });
  }

  // Warm up critical API endpoints
  warmupAPIEndpoints() {
    const criticalEndpoints = [
      '/api/campaigns','
      '/api/analytics/overview','
      '/api/email/campaigns','
      '/api/social/posts'
    ];

    criticalEndpoints.forEach(endpoint => {
      this.addToQueue(async () => {
        try {
          await fetch(endpoint, {
            method: 'HEAD', // Just check if endpoint is available'
            headers: {
              'X-Warmup': 'true'
            }
          });
        } catch (error) {
          console.warn('Failed to warm up endpoint:', endpoint, error);'
        }
      });
    });
  }

  // Clean up observers and event listeners
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    document.removeEventListener('mouseenter', this.handleMouseEnter);'
    this.prefetchedPages.clear();
    this.prefetchedResources.clear();
    this.requestQueue = [];
  }
}

// Service Worker registration for aggressive caching
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {'
    return;
  }

  window.addEventListener('load', async () => {'
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');'
      console.log('SW registered: ', registration);'
      
      // Update on reload
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });'
      }
      
      registration.addEventListener('updatefound', () => {'
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {'
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {'
              // New content is available, refresh the page
              window.location.reload();
            }
          });
        }
      });
    } catch (error) {
      console.log('SW registration failed: ', error);'
    }
  });
}

// Image optimization utilities
export class ImageOptimizer {
  private static loadedImages = new Set<string>();
  
  static async optimizeImage(
    src: string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'png' | 'jpg';'
    } = {}
  ): Promise<string> {
    if (this.loadedImages.has(src)) {
      return src;
    }

    const { width, height, quality = 80, format = 'webp' } = options;'
    
    // Use Next.js Image Optimization API
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());'
    if (height) params.append('h', height.toString());'
    params.append('q', quality.toString());'
    params.append('f', format);'
    
    const optimizedSrc = '/_next/image?url=${encodeURIComponent(src)}&${params.toString()}';
    
    // Preload the optimized image
    const link = document.createElement('link');'
    link.rel = 'preload';'
    link.href = optimizedSrc;
    link.as = 'image';'`'
    document.head.appendChild(link);
    
    this.loadedImages.add(src);
    return optimizedSrc;
  }

  // Generate responsive image srcset
  static generateSrcSet(src: string, sizes: number[] = [320, 640, 768, 1024, 1280, 1920]): string {
    return sizes
      .map(size => '${this.optimizeImage(src, { width: size })} ${size}w')
      .join(', ');'
  }
}

// Font optimization
export function optimizeFonts() {
  // Preload critical fonts
  const criticalFonts = [
    '/fonts/inter-var.woff2','
    '/fonts/inter-var-italic.woff2'
  ];

  criticalFonts.forEach(font => {
    const link = document.createElement('link');'
    link.rel = 'preload';'
    link.href = font;
    link.as = 'font';'
    link.type = 'font/woff2';'
    link.crossOrigin = 'anonymous';'
    document.head.appendChild(link);
  });

  // Enable font-display: swap for all fonts
  const style = document.createElement('style');'`'
  style.textContent = '
    @font-face {
      font-family: 'Inter';'
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('/fonts/inter-var.woff2') format('woff2');'`'
    }
  ';
  document.head.appendChild(style);
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return;'

  const preloader = new PerformancePreloader({
    prefetchPages: [
      '/campaigns','
      '/email','
      '/social','
      '/analytics','
      '/automation'
    ],
    prefetchResources: [],
    maxConcurrentRequests: 2,
    throttleDelay: 100
  });

  // Preload critical resources immediately
  preloader.preloadCriticalResources();
  
  // Warm up API endpoints after initial load
  setTimeout(() => {
    preloader.warmupAPIEndpoints();
  }, 1000);

  // Optimize fonts
  optimizeFonts();

  // Register service worker
  registerServiceWorker();

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {'`'
    preloader.cleanup();
  });

  return preloader;
}

export default PerformancePreloader;