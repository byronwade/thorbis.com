'use client'

import React, { forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { createSkipLinks } from '@/lib/accessibility'

// =============================================================================
// Semantic Layout Components with ARIA Landmarks
// =============================================================================

/**
 * Main page container with proper semantic structure
 */
export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Page title for accessibility
   */
  pageTitle?: string
  
  /**
   * Skip navigation targets
   */
  skipTargets?: Array<{ id: string; label: string }>
  
  /**
   * Whether to auto-generate skip links
   */
  autoSkipLinks?: boolean
}

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ 
    children, 
    className, 
    pageTitle, 
    skipTargets = [
      { id: 'main-content', label: 'Skip to main content' },
      { id: 'main-navigation', label: 'Skip to navigation' },
      { id: 'search', label: 'Skip to search' }
    ],
    autoSkipLinks = true,
    ...props 
  }, ref) => {
    const hasCreatedSkipLinks = useRef(false)
    
    useEffect(() => {
      if (autoSkipLinks && !hasCreatedSkipLinks.current) {
        createSkipLinks(skipTargets)
        hasCreatedSkipLinks.current = true
      }
    }, [autoSkipLinks, skipTargets])
    
    return (
      <div 
        ref={ref}
        className={cn('min-h-screen bg-background text-foreground', className)}
        {...props}
      >
        {/* Page title for screen readers */}
        {pageTitle && (
          <h1 className="sr-only">{pageTitle}</h1>
        )}
        {children}
      </div>
    )
  }
)

PageContainer.displayName = 'PageContainer'

/**
 * Site header with navigation landmarks
 */
export interface SiteHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Site name or logo
   */
  siteName?: string
  
  /**
   * Whether header contains main site navigation
   */
  hasMainNavigation?: boolean
}

export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(
  ({ 
    children, 
    className, 
    siteName = 'Thorbis Business OS',
    hasMainNavigation = true,
    ...props 
  }, ref) => {
    return (
      <header 
        ref={ref}
        role="banner"
        className={cn(
          'sticky top-0 z-50',
          'border-b border-border',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
        {...props}
      >
        {/* Site identity */}
        <div className="sr-only">
          <h1>{siteName}</h1>
        </div>
        
        {/* Main navigation landmark */}
        {hasMainNavigation && (
          <nav 
            id="main-navigation"
            role="navigation" 
            aria-label="Main navigation"
          >
            {children}
          </nav>
        )}
        
        {!hasMainNavigation && children}
      </header>
    )
  }
)

SiteHeader.displayName = 'SiteHeader'

/**
 * Main content area with proper semantic structure
 */
export interface MainContentProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Content title
   */
  title?: string
  
  /**
   * Content description
   */
  description?: string
  
  /**
   * Whether this is the primary content area
   */
  isPrimary?: boolean
}

export const MainContent = forwardRef<HTMLElement, MainContentProps>(
  ({ 
    children, 
    className, 
    title,
    description,
    isPrimary = true,
    ...props 
  }, ref) => {
    return (
      <main 
        ref={ref}
        id="main-content"
        role={isPrimary ? 'main' : 'region'}
        aria-label={isPrimary ? 'Main content' : title}
        aria-describedby={description ? 'main-content-description' : undefined}
        className={cn('flex-1', className)}
        tabIndex={-1} // Allow focus for skip links
        {...props}
      >
        {/* Content header */}
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p 
                id="main-content-description"
                className="text-muted-foreground"
              >
                {description}
              </p>
            )}
          </div>
        )}
        
        {children}
      </main>
    )
  }
)

MainContent.displayName = 'MainContent'

/**
 * Complementary sidebar content
 */
export interface ComplementaryProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Sidebar title
   */
  title: string
  
  /**
   * Sidebar position
   */
  position?: 'left' | 'right'
  
  /**
   * Whether sidebar is collapsible
   */
  collapsible?: boolean
  
  /**
   * Collapsed state (for controlled component)
   */
  isCollapsed?: boolean
}

export const Complementary = forwardRef<HTMLElement, ComplementaryProps>(
  ({ 
    children, 
    className, 
    title,
    position = 'right',
    collapsible = false,
    isCollapsed = false,
    ...props 
  }, ref) => {
    return (
      <aside 
        ref={ref}
        role="complementary"
        aria-label={title}
        aria-expanded={collapsible ? !isCollapsed : undefined}
        className={cn(
          'bg-card border-l border-border',
          position === 'left' && 'border-l-0 border-r',
          isCollapsed && 'w-12',
          !isCollapsed && 'w-64',
          className
        )}
        {...props}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-border">
          <h2 className={cn(
            'font-semibold text-foreground',
            isCollapsed && 'sr-only'
          )}>
            {title}
          </h2>
        </div>
        
        {/* Sidebar content */}
        <div className={cn(
          'p-4',
          isCollapsed && 'hidden'
        )}>
          {children}
        </div>
      </aside>
    )
  }
)

Complementary.displayName = 'Complementary'

/**
 * Site footer with contact and legal information
 */
export interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Copyright text
   */
  copyright?: string
  
  /**
   * Company name
   */
  companyName?: string
  
  /**
   * Whether footer contains site map navigation
   */
  hasSiteMapNavigation?: boolean
}

export const SiteFooter = forwardRef<HTMLElement, SiteFooterProps>(
  ({ 
    children, 
    className, 
    copyright,
    companyName = 'Thorbis',
    hasSiteMapNavigation = true,
    ...props 
  }, ref) => {
    const currentYear = new Date().getFullYear()
    const copyrightText = copyright || '© ${currentYear} ${companyName}. All rights reserved.'
    
    return (
      <footer 
        ref={ref}
        role="contentinfo"
        className={cn(
          'border-t border-border',
          'bg-muted/30',
          'mt-auto',
          className
        )}
        {...props}
      >
        {/* Footer navigation */}
        {hasSiteMapNavigation && (
          <nav 
            role="navigation" 
            aria-label="Footer navigation"
            className="container px-4 py-6"
          >
            {children}
          </nav>
        )}
        
        {/* Copyright and legal */}
        <div className={cn(
          'container px-4 py-4',
          'border-t border-border',
          'text-sm text-muted-foreground'
        )}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>{copyrightText}</p>
            
            {/* Legal links */}
            <nav 
              role="navigation" 
              aria-label="Legal navigation"
              className="flex gap-4"
            >
              <a 
                href="/privacy" 
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="/accessibility" 
                className="hover:text-foreground transition-colors"
              >
                Accessibility
              </a>
            </nav>
          </div>
        </div>
      </footer>
    )
  }
)

SiteFooter.displayName = 'SiteFooter'

/**
 * Navigation component with proper ARIA attributes
 */
export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Navigation type/label
   */
  ariaLabel: string
  
  /**
   * Current page identifier
   */
  currentPage?: string
  
  /**
   * Navigation items
   */
  items?: Array<{
    href: string
    label: string
    isCurrent?: boolean
    children?: Array<{ href: string; label: string }>
  }>
}

export const Navigation = forwardRef<HTMLElement, NavigationProps>(
  ({ 
    children, 
    className, 
    ariaLabel,
    currentPage,
    items = [],
    ...props 
  }, ref) => {
    return (
      <nav 
        ref={ref}
        role="navigation"
        aria-label={ariaLabel}
        className={className}
        {...props}
      >
        {items.length > 0 ? (
          <ul role="list" className="flex space-x-4">
            {items.map((item, index) => (
              <li key={index} role="listitem">
                <a
                  href={item.href}
                  aria-current={item.isCurrent ? 'page' : undefined}
                  className={cn(
                    'text-foreground hover:text-primary transition-colors',
                    item.isCurrent && 'font-semibold text-primary'
                  )}
                >
                  {item.label}
                </a>
                
                {/* Sub-navigation */}
                {item.children && (
                  <ul role="list" className="ml-4 mt-2 space-y-1">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex} role="listitem">
                        <a
                          href={child.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          children
        )}
      </nav>
    )
  }
)

Navigation.displayName = 'Navigation'

/**
 * Article component for blog posts and content
 */
export interface ArticleProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Article title
   */
  title: string
  
  /**
   * Article author
   */
  author?: string
  
  /**
   * Publication date
   */
  publishedDate?: Date
  
  /**
   * Last modified date
   */
  modifiedDate?: Date
  
  /**
   * Article tags/categories
   */
  tags?: string[]
}

export const Article = forwardRef<HTMLElement, ArticleProps>(
  ({ 
    children, 
    className, 
    title,
    author,
    publishedDate,
    modifiedDate,
    tags = [],
    ...props 
  }, ref) => {
    return (
      <article 
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {/* Article header */}
        <header className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            {title}
          </h1>
          
          {/* Article metadata */}
          {(author || publishedDate || modifiedDate) && (
            <div className="text-sm text-muted-foreground space-y-1">
              {author && (
                <p>
                  By <span className="font-medium">{author}</span>
                </p>
              )}
              
              {publishedDate && (
                <p>
                  Published{' '}
                  <time dateTime={publishedDate.toISOString()}>
                    {publishedDate.toLocaleDateString()}
                  </time>
                </p>
              )}
              
              {modifiedDate && (
                <p>
                  Updated{' '}
                  <time dateTime={modifiedDate.toISOString()}>
                    {modifiedDate.toLocaleDateString()}
                  </time>
                </p>
              )}
            </div>
          )}
          
          {/* Article tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        {/* Article content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {children}
        </div>
      </article>
    )
  }
)

Article.displayName = 'Article'

/**
 * Search component with proper accessibility
 */
export interface SearchProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Search placeholder text
   */
  placeholder?: string
  
  /**
   * Search value
   */
  value?: string
  
  /**
   * Search change handler
   */
  onSearch?: (query: string) => void
  
  /**
   * Search results count
   */
  resultsCount?: number
}

export const Search = forwardRef<HTMLDivElement, SearchProps>(
  ({ 
    className, 
    placeholder = 'Search...',
    value = ',
    onSearch,
    resultsCount,
    ...props 
  }, ref) => {
    return (
      <div 
        ref={ref}
        role="search"
        id="search"
        className={cn('relative', className)}
        {...props}
      >
        <label htmlFor="search-input" className="sr-only">
          Search
        </label>
        
        <input
          id="search-input"
          type="search"
          value={value}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-2 pl-10 pr-4',
            'border border-border rounded-md',
            'bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
          )}
          aria-describedby={resultsCount !== undefined ? 'search-results-count' : undefined}
        />
        
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        {/* Results count announcement */}
        {resultsCount !== undefined && (
          <div
            id="search-results-count"
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {resultsCount === 0
              ? 'No search results found'
              : '${resultsCount} search result${resultsCount === 1 ? ' : 's'} found'
            }
          </div>
        )}
      </div>
    )
  }
)

Search.displayName = 'Search'

/**
 * Breadcrumb navigation component
 */
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Breadcrumb items
   */
  items: Array<{
    href?: string
    label: string
    isCurrent?: boolean
  }>
  
  /**
   * Custom separator
   */
  separator?: React.ReactNode
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ 
    items, 
    separator = '/', 
    className, 
    ...props 
  }, ref) => {
    return (
      <nav 
        ref={ref}
        aria-label="Breadcrumb navigation"
        className={className}
        {...props}
      >
        <ol role="list" className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <li key={index} role="listitem" className="flex items-center">
              {index > 0 && (
                <span 
                  className="mx-2 text-muted-foreground"
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
              
              {item.isCurrent ? (
                <span 
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'

// Export all components
export {
  PageContainer,
  SiteHeader,
  MainContent,
  Complementary,
  SiteFooter,
  Navigation,
  Article,
  Search,
  Breadcrumb,
}