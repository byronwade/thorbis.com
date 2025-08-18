/**
 * TypeScript definitions for SEO system
 * Provides type safety for metadata generation following Next.js 15 best practices
 */

import type { Metadata } from 'next';

/**
 * Parameters passed to generateMetadata function
 */
export interface MetadataParams {
  params: Record<string, string | string[]>;
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Parent metadata that can be inherited
 */
export interface ResolvingMetadata extends Promise<Metadata> {}

/**
 * Configuration for static page metadata generation
 */
export interface StaticPageConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  robots?: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    noimageindex?: boolean;
    nocache?: boolean;
  };
}

/**
 * Configuration for dynamic page metadata generation
 */
export interface DynamicPageConfig {
  type: string;
  data: Record<string, any>;
  title?: string;
  description?: string;
  path: string;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  images?: string[];
  keywords?: string[];
}

/**
 * Business metadata configuration
 */
export interface BusinessMetadataConfig {
  name: string;
  description: string;
  address?: string;
  phone?: string;
  website?: string;
  images?: string[];
  categories?: string[];
  rating?: number;
  reviewCount?: number;
  hours?: Record<string, string>;
}

/**
 * Blog/Article metadata configuration
 */
export interface ArticleMetadataConfig {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  tags?: string[];
  category?: string;
  images?: string[];
  readingTime?: number;
}

/**
 * SEO performance metrics
 */
export interface SEOPerformanceMetrics {
  generationTime: number;
  cacheHit: boolean;
  dataFetchTime?: number;
  parentResolutionTime?: number;
}

/**
 * Enhanced metadata with performance tracking
 */
export interface EnhancedMetadata extends Metadata {
  performance?: SEOPerformanceMetrics;
  structuredData?: Record<string, any>[];
}

/**
 * SEO generation options
 */
export interface SEOGenerationOptions {
  enableCache?: boolean;
  enablePerformanceTracking?: boolean;
  enableStructuredData?: boolean;
  enableParentInheritance?: boolean;
  customFields?: Record<string, any>;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
  position?: number;
}

/**
 * Open Graph image configuration
 */
export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

/**
 * Twitter card configuration
 */
export interface TwitterCard {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title?: string;
  description?: string;
  images?: string[];
  creator?: string;
  site?: string;
}

/**
 * Structured data schema types
 */
export type StructuredDataType = 
  | 'Organization'
  | 'LocalBusiness'
  | 'Article'
  | 'BlogPosting'
  | 'Product'
  | 'Service'
  | 'Event'
  | 'Person'
  | 'WebSite'
  | 'WebPage'
  | 'BreadcrumbList';

/**
 * Function type for generateMetadata
 */
export type GenerateMetadataFunction = (
  params: MetadataParams,
  parent: ResolvingMetadata
) => Promise<Metadata>;

/**
 * Function type for static page metadata generation
 */
export type GenerateStaticMetadataFunction = (
  config: StaticPageConfig,
  parent?: ResolvingMetadata
) => Promise<Metadata>;

/**
 * Function type for dynamic page metadata generation
 */
export type GenerateDynamicMetadataFunction = (
  params: MetadataParams,
  parent: ResolvingMetadata
) => Promise<EnhancedMetadata>;

/**
 * SEO manager interface
 */
export interface SEOManager {
  generatePageMetadata(config: DynamicPageConfig): Promise<Metadata>;
  generateBusinessMetadata(config: BusinessMetadataConfig): Promise<Metadata>;
  generateArticleMetadata(config: ArticleMetadataConfig): Promise<Metadata>;
  generateStructuredData(type: StructuredDataType, data: Record<string, any>): Record<string, any>;
}

/**
 * Cache configuration for SEO system
 */
export interface SEOCacheConfig {
  ttl: number;
  maxSize: number;
  enableMemoryCache: boolean;
  enableRedisCache?: boolean;
  keyPrefix: string;
}

/**
 * SEO system configuration
 */
export interface SEOSystemConfig {
  siteName: string;
  baseUrl: string;
  organization: string;
  defaultImage: string;
  defaultDescription: string;
  cache: SEOCacheConfig;
  performance: {
    budgetMs: number;
    enableLogging: boolean;
    enableAlerts: boolean;
  };
}

export default {
  MetadataParams,
  ResolvingMetadata,
  StaticPageConfig,
  DynamicPageConfig,
  BusinessMetadataConfig,
  ArticleMetadataConfig,
  SEOPerformanceMetrics,
  EnhancedMetadata,
  SEOGenerationOptions,
  BreadcrumbItem,
  OpenGraphImage,
  TwitterCard,
  StructuredDataType,
  GenerateMetadataFunction,
  GenerateStaticMetadataFunction,
  GenerateDynamicMetadataFunction,
  SEOManager,
  SEOCacheConfig,
  SEOSystemConfig,
};
