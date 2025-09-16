import { ImageOptimizer, initializePerformanceOptimizations } from '../performance/preloader'

// Mock DOM methods
const mockCreateElement = jest.fn()
const mockAppendChild = jest.fn()
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()

// Mock document and window
Object.defineProperty(global, 'document', {
  value: {
    createElement: mockCreateElement,
    head: {
      appendChild: mockAppendChild
    },
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    querySelectorAll: jest.fn().mockReturnValue([])
  },
  writable: true
})

Object.defineProperty(global, 'window', {
  value: {
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    location: {
      reload: jest.fn()
    }
  },
  writable: true
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}))

// Mock fetch
global.fetch = jest.fn()

describe('Performance Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateElement.mockReturnValue({
      rel: ',
      href: ',
      as: ',
      type: ',
      crossOrigin: '
    })
  })

  describe('ImageOptimizer', () => {
    it('should optimize image with default options', async () => {
      const src = '/test-image.jpg'
      const optimizedSrc = await ImageOptimizer.optimizeImage(src)

      expect(optimizedSrc).toContain('/_next/image')
      expect(optimizedSrc).toContain('q=80')
      expect(optimizedSrc).toContain('f=webp')
      expect(mockCreateElement).toHaveBeenCalledWith('link')
      expect(mockAppendChild).toHaveBeenCalled()
    })

    it('should optimize image with custom options', async () => {
      const src = '/test-image.jpg'
      const options = {
        width: 800,
        height: 600,
        quality: 90,
        format: 'avif' as const
      }
      
      const optimizedSrc = await ImageOptimizer.optimizeImage(src, options)

      expect(optimizedSrc).toContain('w=800')
      expect(optimizedSrc).toContain('h=600')
      expect(optimizedSrc).toContain('q=90')
      expect(optimizedSrc).toContain('f=avif')
    })

    it('should generate responsive image srcset', () => {
      const src = '/test-image.jpg'
      const sizes = [320, 640, 1024]
      
      const srcSet = ImageOptimizer.generateSrcSet(src, sizes)

      expect(srcSet).toContain('320w')
      expect(srcSet).toContain('640w')
      expect(srcSet).toContain('1024w')
      expect(srcSet.split(',').length).toBe(3)
    })

    it('should not duplicate image optimization for same src', async () => {
      const src = '/test-image.jpg'
      
      await ImageOptimizer.optimizeImage(src)
      await ImageOptimizer.optimizeImage(src)

      // Should only create preload link once
      expect(mockAppendChild).toHaveBeenCalledTimes(1)
    })
  })

  describe('Performance Initialization', () => {
    it('should initialize performance optimizations', () => {
      const preloader = initializePerformanceOptimizations()

      expect(preloader).toBeDefined()
      expect(mockCreateElement).toHaveBeenCalledWith('link')
      expect(mockCreateElement).toHaveBeenCalledWith('style')
      expect(mockAppendChild).toHaveBeenCalled()
    })

    it('should preload critical resources', () => {
      initializePerformanceOptimizations()

      // Check if critical CSS and JS are preloaded
      const createElementCalls = mockCreateElement.mock.calls
      const linkCalls = createElementCalls.filter(call => call[0] === 'link')
      
      expect(linkCalls.length).toBeGreaterThan(0)
    })

    it('should setup font optimization', () => {
      initializePerformanceOptimizations()

      // Check if style element is created for fonts
      const createElementCalls = mockCreateElement.mock.calls
      const styleCalls = createElementCalls.filter(call => call[0] === 'style')
      
      expect(styleCalls.length).toBeGreaterThan(0)
    })

    it('should handle service worker registration', () => {
      // Mock navigator.serviceWorker
      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          register: jest.fn().mockResolvedValue({
            waiting: null,
            addEventListener: jest.fn()
          })
        },
        configurable: true
      })

      initializePerformanceOptimizations()

      expect(mockAddEventListener).toHaveBeenCalledWith('load', expect.any(Function))
    })
  })

  describe('Prefetching Logic', () => {
    it('should handle mouseenter events for prefetching', () => {
      initializePerformanceOptimizations()

      expect(mockAddEventListener).toHaveBeenCalledWith('mouseenter', expect.any(Function), true)
    })

    it('should setup intersection observer for link prefetching', () => {
      initializePerformanceOptimizations()

      expect(IntersectionObserver).toHaveBeenCalled()
    })

    it('should cleanup event listeners on unload', () => {
      const preloader = initializePerformanceOptimizations()
      
      // Simulate beforeunload event
      const beforeUnloadHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'beforeunload')?.[1]
      
      if (beforeUnloadHandler) {
        beforeUnloadHandler()
      }

      // Cleanup should be called
      expect(mockRemoveEventListener).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      initializePerformanceOptimizations()
      
      // Should not throw errors
      expect(consoleSpy).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should handle service worker registration errors', () => {
      // Mock navigator.serviceWorker with error
      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          register: jest.fn().mockRejectedValue(new Error('SW registration failed'))
        },
        configurable: true
      })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      initializePerformanceOptimizations()
      
      // Should handle SW registration errors gracefully
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('error'))
      
      consoleSpy.mockRestore()
    })
  })
})