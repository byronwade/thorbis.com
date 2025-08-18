# Advanced SEO Metadata Generation Examples

This document provides examples of how to use the enhanced SEO system following Next.js 15 best practices.

## Basic Static Page Example

```javascript
// src/app/about/page.js
import { generateStaticPageMetadata } from '@utils/server-seo';

export async function generateMetadata(params, parent) {
  return await generateStaticPageMetadata({
    title: "About Us - Thorbis",
    description: "Learn about Thorbis, the leading local business directory platform",
    path: "/about",
    keywords: ["about", "company", "local business", "directory"],
    robots: {
      index: true,
      follow: true
    }
  }, parent);
}

export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      {/* Page content */}
    </div>
  );
}
```

## Dynamic Page with Data Fetching

```javascript
// src/app/business/[slug]/page.js
import { generateAdvancedPageMetadata } from '@utils/server-seo';
import type { Metadata, ResolvingMetadata } from 'next';

interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch business data (automatically memoized by Next.js)
  const business = await fetch(`https://api.thorbis.com/businesses/${params.slug}`)
    .then((res) => res.json());

  // Get parent metadata for inheritance
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${business.name} - ${business.city}`,
    description: business.description,
    openGraph: {
      title: `${business.name} - Local Business`,
      description: business.description,
      images: [
        {
          url: business.primaryImage,
          width: 1200,
          height: 630,
          alt: `${business.name} - ${business.category}`,
        },
        ...previousImages,
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${business.name} - ${business.city}`,
      description: business.description,
      images: [business.primaryImage],
    },
    alternates: {
      canonical: `https://thorbis.com/business/${params.slug}`,
    },
  };
}

export default function BusinessPage({ params }: PageProps) {
  return (
    <div>
      {/* Business page content */}
    </div>
  );
}
```

## Blog Article with Rich Metadata

```javascript
// src/app/blog/[slug]/page.js
import { generateArticleMetadata } from '@utils/server-seo';
import type { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch article data
  const article = await fetch(`https://api.thorbis.com/articles/${params.slug}`)
    .then((res) => res.json());

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: article.title,
    description: article.excerpt,
    authors: [{ name: article.author.name, url: article.author.url }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images: [
        {
          url: article.featuredImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      creator: `@${article.author.twitter}`,
    },
    alternates: {
      canonical: `https://thorbis.com/blog/${params.slug}`,
    },
  };
}
```

## Category Page with Dynamic Content

```javascript
// src/app/categories/[category]/page.js
import { generateAdvancedPageMetadata } from '@utils/server-seo';

export async function generateMetadata({ params, searchParams }, parent) {
  // Fetch category data and business count
  const [categoryData, businessCount] = await Promise.all([
    fetch(`https://api.thorbis.com/categories/${params.category}`).then(res => res.json()),
    fetch(`https://api.thorbis.com/categories/${params.category}/count`).then(res => res.json())
  ]);

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${categoryData.name} Businesses - Thorbis`,
    description: `Find ${businessCount.total} ${categoryData.name.toLowerCase()} businesses in your area. Compare reviews, hours, and contact information.`,
    openGraph: {
      title: `${categoryData.name} Directory`,
      description: `Discover local ${categoryData.name.toLowerCase()} businesses`,
      images: [
        {
          url: `https://thorbis.com/api/og/category/${params.category}`,
          width: 1200,
          height: 630,
          alt: `${categoryData.name} businesses directory`,
        },
        ...previousImages,
      ],
    },
    alternates: {
      canonical: `https://thorbis.com/categories/${params.category}`,
    },
  };
}
```

## Layout with Inherited Metadata

```javascript
// src/app/business/layout.js
import type { Metadata } from 'next';

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: 'https://thorbis.com/images/business-directory-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Thorbis Business Directory',
      },
    ],
  },
};

export default function BusinessLayout({ children }) {
  return (
    <div className="business-layout">
      {children}
    </div>
  );
}
```

## Performance Monitoring Example

```javascript
// src/app/performance-test/page.js
import { generateStaticPageMetadata } from '@utils/server-seo';

export async function generateMetadata(params, parent) {
  const startTime = performance.now();
  
  const metadata = await generateStaticPageMetadata({
    title: "Performance Test Page",
    description: "Testing SEO generation performance",
    path: "/performance-test",
  }, parent);
  
  const duration = performance.now() - startTime;
  
  // Log performance in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Metadata generated in ${duration.toFixed(2)}ms`);
  }
  
  return metadata;
}
```

## Error Handling Example

```javascript
// src/app/error-prone/page.js
export async function generateMetadata({ params }, parent) {
  try {
    // Potentially failing data fetch
    const data = await fetch(`https://api.example.com/data/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      });

    return {
      title: data.title,
      description: data.description,
    };
  } catch (error) {
    console.error('Metadata generation failed:', error);
    
    // Return fallback metadata
    return {
      title: 'Thorbis - Local Business Directory',
      description: 'Discover local businesses and community resources',
      openGraph: {
        title: 'Thorbis',
        description: 'Local business directory',
        type: 'website',
      },
    };
  }
}
```

## Key Benefits of This Approach

### 1. **Automatic Memoization**
- Next.js automatically memoizes `fetch` requests across `generateMetadata`, layouts, and pages
- No need for manual caching of API calls

### 2. **Parent Metadata Inheritance**
- Child pages can extend parent metadata (like OpenGraph images)
- Consistent branding across page hierarchies

### 3. **Type Safety**
- Full TypeScript support with proper types
- Better development experience and error catching

### 4. **Performance Monitoring**
- Built-in performance tracking and alerts
- Development-time insights for optimization

### 5. **Error Resilience**
- Graceful fallbacks when data fetching fails
- Always returns valid metadata objects

### 6. **SEO Best Practices**
- Follows latest Next.js 15 recommendations
- Optimized for search engine crawling and indexing

## Migration from Static Metadata

### Before (Static):
```javascript
export const metadata = {
  title: "Static Title",
  description: "Static description",
};
```

### After (Dynamic):
```javascript
export async function generateMetadata(params, parent) {
  return await generateStaticPageMetadata({
    title: "Dynamic Title",
    description: "Dynamic description based on data",
    path: "/current-path",
  }, parent);
}
```

This approach provides maximum flexibility while maintaining performance and SEO best practices.
