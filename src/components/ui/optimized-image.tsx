'use client'

import Image, { ImageProps } from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  /**
   * Alternative image sources for progressive enhancement
   * Order: [avif, webp, fallback]
   */
  srcSet?: {
    avif?: string
    webp?: string
    fallback: string
  }
  
  /**
   * Loading strategy for performance optimization
   */
  loadingStrategy?: 'eager' | 'lazy' | 'auto'
  
  /**
   * Image quality optimization
   */
  qualityConfig?: {
    default: number
    mobile?: number
    retina?: number
  }
  
  /**
   * Responsive breakpoints
   */
  breakpoints?: {
    mobile: number
    tablet: number
    desktop: number
  }
  
  /**
   * Blur data URL for better perceived performance
   */
  blurDataURL?: string
  
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode
  
  /**
   * Error fallback component
   */
  errorFallback?: React.ReactNode
  
  /**
   * Callback when image loads successfully
   */
  onLoadComplete?: () => void
  
  /**
   * Callback when image fails to load
   */
  onError?: () => void
  
  /**
   * Performance tracking
   */
  trackPerformance?: boolean
  
  className?: string
}

export default function OptimizedImage({
  src,
  alt,
  srcSet,
  loadingStrategy = 'auto',
  qualityConfig = { default: 85 },
  breakpoints = { mobile: 640, tablet: 1024, desktop: 1920 },
  blurDataURL,
  loadingComponent,
  errorFallback,
  onLoadComplete,
  onError,
  trackPerformance = false,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadTime, setLoadTime] = useState<number>(0)
  const imageRef = useRef<HTMLImageElement>(null)
  const startTimeRef = useRef<number>(0)

  // Performance tracking
  useEffect(() => {
    if (trackPerformance) {
      startTimeRef.current = performance.now()
    }
  }, [trackPerformance])

  // Determine optimal loading strategy
  const getLoadingPriority = (): 'high' | 'low' => {
    if (loadingStrategy === 'eager') return 'high'
    if (loadingStrategy === 'lazy') return 'low'
    
    // Auto: high priority for above-the-fold images
    if (typeof window !== 'undefined') {
      const viewportHeight = window.innerHeight
      const imageElement = imageRef.current
      if (imageElement) {
        const rect = imageElement.getBoundingClientRect()
        return rect.top < viewportHeight ? 'high' : 'low'
      }
    }
    return 'low'
  }

  // Generate responsive srcSet with multiple formats
  const generateSrcSet = () => {
    if (!srcSet) return undefined

    const formats: string[] = []
    
    // AVIF format (best compression)
    if (srcSet.avif) {
      formats.push(`${srcSet.avif} 1x`)
      if (qualityConfig.retina) {
        formats.push(`${srcSet.avif}?q=${qualityConfig.retina} 2x`)
      }
    }
    
    // WebP format (good fallback)
    if (srcSet.webp) {
      formats.push(`${srcSet.webp} 1x')
      if (qualityConfig.retina) {
        formats.push('${srcSet.webp}?q=${qualityConfig.retina} 2x')
      }
    }
    
    return formats.join(', ')
  }

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    
    if (trackPerformance && startTimeRef.current) {
      const loadTime = performance.now() - startTimeRef.current
      setLoadTime(loadTime)
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🖼️ Image loaded: ${alt || src} (${Math.round(loadTime)}ms)')
      }
    }
    
    onLoadComplete?.()
  }

  // Handle image loading error
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Loading state
  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>
  }

  // Error state
  if (hasError && errorFallback) {
    return <>{errorFallback}</>
  }

  // Default error fallback
  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-neutral-900/50 border border-neutral-800 rounded-lg',
        'text-neutral-400 text-sm',
        className
      )}>
        <span>Image not available</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        ref={imageRef}
        src={srcSet?.fallback || src}
        alt={alt}
        className={cn(
          // Smooth loading transition
          'transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100',
          className
        )}
        sizes={'(max-width: ${breakpoints.mobile}px) 100vw, (max-width: ${breakpoints.tablet}px) 50vw, 33vw'}
        priority={getLoadingPriority() === 'high'}
        quality={qualityConfig.default}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center',
          'bg-neutral-900/20 backdrop-blur-sm rounded-lg',
          'animate-pulse'
        )}>
          <div className="w-6 h-6 border-2 border-neutral-600 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Performance info (development only) */}
      {process.env.NODE_ENV === 'development' && trackPerformance && loadTime > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {Math.round(loadTime)}ms
        </div>
      )}
    </div>
  )
}

// Utility component for common logo usage
export function ThorbisoLogo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <OptimizedImage
      src="/logos/ThorbisLogo.webp"
      alt="Thorbis"
      width={size}
      height={size}
      className={className}
      loadingStrategy="eager"
      qualityConfig={{ default: 90 }}
      trackPerformance={true}
    />
  )
}

// Utility component for avatars with optimized loading
export function Avatar({ 
  src, 
  alt, 
  size = 40, 
  className 
}: { 
  src: string; 
  alt: string; 
  size?: number; 
  className?: string 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      loadingStrategy="lazy"
      qualityConfig={{ default: 80 }}
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  )
}