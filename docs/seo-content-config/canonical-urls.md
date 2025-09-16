# Thorbis Canonical URL Strategy & Duplicate Content Policy

Comprehensive canonical URL implementation and duplicate content management for Thorbis Business OS multi-industry platform.

## Core Canonicalization Principles

### Primary URL Hierarchy
1. **Industry-specific content** takes precedence over generic
2. **City pages** are canonical for local business targeting
3. **Feature pages** are canonical over product variations
4. **Original content** is canonical over syndicated content
5. **HTTPS** is canonical over HTTP
6. **Non-www** is canonical over www
7. **Clean URLs** are canonical over parameter-heavy URLs

### Canonical URL Format Standards
```
✅ Canonical Format:
https://thorbis.com/industries/restaurants/pos-system/
https://thorbis.com/cities/california/los-angeles/restaurants/
https://thorbis.com/features/scheduling/
https://thorbis.com/learn/guides/restaurant-management/

❌ Non-Canonical Variations:
http://thorbis.com/industries/restaurants/pos-system/
https://www.thorbis.com/industries/restaurants/pos-system/
https://thorbis.com/industries/restaurants/pos-system?utm_source=google
https://thorbis.com/products/restaurant-pos-system/ (redirect to canonical)
```

## Industry-Specific Canonicalization

### Industry Content Hierarchy
```html
<!-- Primary Industry Pages (Canonical) -->
<link rel="canonical" href="https://thorbis.com/industries/restaurants/" />
<link rel="canonical" href="https://thorbis.com/industries/home-services/" />
<link rel="canonical" href="https://thorbis.com/industries/auto-services/" />
<link rel="canonical" href="https://thorbis.com/industries/retail/" />

<!-- Generic pages redirect to most popular industry -->
/business-management-software/ → 301 → /industries/home-services/
/pos-system/ → 301 → /industries/restaurants/pos-system/
/scheduling-software/ → 301 → /industries/home-services/scheduling/
```

### Cross-Industry Similar Content Strategy

#### Problem: Similar feature content across industries
```
/industries/restaurants/scheduling/         (Canonical - highest volume)
/industries/home-services/scheduling/       (Canonical - distinct use case)  
/industries/auto-services/scheduling/       (Canonical - distinct use case)
/industries/retail/scheduling/              (Canonical - distinct use case)
```

#### Solution: Industry-specific canonical with unique differentiators
```html
<!-- Each industry page is canonical for its specific use case -->
<!-- Restaurant Scheduling (Canonical) -->
<title>Restaurant Staff Scheduling Software | Thorbis</title>
<meta name="description" content="Restaurant staff scheduling with shift management, labor cost optimization, and compliance tracking.">
<link rel="canonical" href="https://thorbis.com/industries/restaurants/scheduling/" />

<!-- Home Services Scheduling (Canonical) -->
<title>Field Service Scheduling Software | Thorbis</title>
<meta name="description" content="Field service scheduling with GPS routing, technician dispatch, and customer notifications.">
<link rel="canonical" href="https://thorbis.com/industries/home-services/scheduling/" />

<!-- Auto Services Scheduling (Canonical) -->
<title>Auto Shop Scheduling Software | Thorbis</title>
<meta name="description" content="Auto repair scheduling with bay management, service appointments, and customer communication.">
<link rel="canonical" href="https://thorbis.com/industries/auto-services/scheduling/" />
```

#### Content Differentiation Requirements
- **Unique H1/H2 headings** per industry
- **Industry-specific examples** and case studies
- **Different feature emphasis** based on industry needs
- **Unique screenshots** and visuals
- **Industry-specific FAQ sections**
- **Different customer testimonials**

## Geographic Canonicalization Strategy

### City Page Hierarchy
```html
<!-- Primary city pages (Canonical) -->
<link rel="canonical" href="https://thorbis.com/cities/california/los-angeles/" />
<link rel="canonical" href="https://thorbis.com/cities/texas/houston/" />
<link rel="canonical" href="https://thorbis.com/cities/florida/miami/" />

<!-- Industry + City combinations (Canonical) -->
<link rel="canonical" href="https://thorbis.com/cities/california/los-angeles/restaurants/" />
<link rel="canonical" href="https://thorbis.com/cities/california/los-angeles/home-services/" />
<link rel="canonical" href="https://thorbis.com/cities/texas/houston/auto-services/" />
```

### Geographic Duplicate Content Prevention

#### URL Parameters → Canonical Clean URLs
```html
<!-- Parameter-based URLs redirect to clean URLs -->
/cities/?state=california&city=los-angeles → 301 → /cities/california/los-angeles/
/cities/california/los-angeles/?industry=restaurants → 301 → /cities/california/los-angeles/restaurants/
```

#### Similar Metro Areas Differentiation
```html
<!-- Los Angeles Metro Area -->
<link rel="canonical" href="https://thorbis.com/cities/california/los-angeles/" />
<title>Business Management Software Los Angeles | Thorbis</title>

<!-- Orange County (Separate Canonical) -->  
<link rel="canonical" href="https://thorbis.com/cities/california/orange-county/" />
<title>Business Management Software Orange County | Thorbis</title>

<!-- Santa Monica (Sub-page, not canonical) -->
/cities/california/santa-monica/ → 301 → /cities/california/los-angeles/
<!-- OR canonical if significantly different content -->
<link rel="canonical" href="https://thorbis.com/cities/california/santa-monica/" />
```

### Multi-Location Business Profiles

#### Business Profile Canonicalization
```html
<!-- Primary business location (Canonical) -->
<link rel="canonical" href="https://thorbis.com/businesses/joes-pizza-main/" />

<!-- Additional locations reference primary -->
<link rel="canonical" href="https://thorbis.com/businesses/joes-pizza-main/" />
<!-- OR separate canonicals if substantially different -->
<link rel="canonical" href="https://thorbis.com/businesses/joes-pizza-brooklyn/" />
<link rel="canonical" href="https://thorbis.com/businesses/joes-pizza-manhattan/" />
```

## Feature Page Canonicalization

### Primary Feature Pages (Always Canonical)
```html
<link rel="canonical" href="https://thorbis.com/features/pos-system/" />
<link rel="canonical" href="https://thorbis.com/features/scheduling/" />
<link rel="canonical" href="https://thorbis.com/features/inventory/" />
<link rel="canonical" href="https://thorbis.com/features/analytics/" />
<link rel="canonical" href="https://thorbis.com/features/payments/" />
```

### Alternative Feature URLs → Canonical Redirects
```
/point-of-sale-system/ → 301 → /features/pos-system/
/appointment-scheduling/ → 301 → /features/scheduling/
/inventory-management/ → 301 → /features/inventory/
/business-analytics/ → 301 → /features/analytics/
/payment-processing/ → 301 → /features/payments/

/products/pos-system/ → 301 → /features/pos-system/
/solutions/scheduling/ → 301 → /features/scheduling/
/tools/inventory/ → 301 → /features/inventory/
```

### Industry-Feature Combinations
```html
<!-- Industry-specific feature pages (Canonical when significantly different) -->
<link rel="canonical" href="https://thorbis.com/industries/restaurants/pos-system/" />
<link rel="canonical" href="https://thorbis.com/industries/home-services/scheduling/" />

<!-- Generic feature pages redirect to most relevant industry -->
/features/pos-system/ → 301 → /industries/restaurants/pos-system/
/features/field-service-management/ → 301 → /industries/home-services/
```

## Content Hub Canonicalization

### Blog & Learning Center
```html
<!-- Primary content hub (Canonical) -->
<link rel="canonical" href="https://thorbis.com/learn/" />

<!-- Blog posts (Always canonical at publication URL) -->
<link rel="canonical" href="https://thorbis.com/learn/blog/restaurant-pos-guide/" />
<link rel="canonical" href="https://thorbis.com/learn/guides/home-service-scheduling/" />

<!-- Alternative content URLs redirect to canonical -->
/blog/restaurant-pos-guide/ → 301 → /learn/blog/restaurant-pos-guide/
/resources/home-service-scheduling/ → 301 → /learn/guides/home-service-scheduling/
/articles/restaurant-pos-guide/ → 301 → /learn/blog/restaurant-pos-guide/
```

### Content Syndication Policy
```html
<!-- Original content (Canonical) -->
<link rel="canonical" href="https://thorbis.com/learn/guides/restaurant-success-metrics/" />

<!-- Syndicated/guest posts point to original -->
<!-- On external sites: -->
<link rel="canonical" href="https://thorbis.com/learn/guides/restaurant-success-metrics/" />

<!-- OR if significantly modified/extended: -->
<link rel="canonical" href="https://external-site.com/extended-restaurant-metrics-guide/" />
```

## Pagination Canonicalization

### List Page Pagination
```html
<!-- First page (Canonical) -->
<link rel="canonical" href="https://thorbis.com/cities/california/los-angeles/businesses/" />

<!-- Pagination pages (Self-referential canonical) -->
<link rel="canonical" href="https://thorbis.com/cities/california/los-angeles/businesses/page/2/" />
<link rel="canonical" href="https://thorbis.com/cities/california/los-angeles/businesses/page/3/" />

<!-- With rel="prev" and rel="next" -->
<link rel="prev" href="https://thorbis.com/cities/california/los-angeles/businesses/" />
<link rel="next" href="https://thorbis.com/cities/california/los-angeles/businesses/page/3/" />
```

### Blog Archive Pagination
```html
<!-- Blog archive pages -->
<link rel="canonical" href="https://thorbis.com/learn/blog/" />                    <!-- Page 1 -->
<link rel="canonical" href="https://thorbis.com/learn/blog/page/2/" />             <!-- Page 2 -->
<link rel="canonical" href="https://thorbis.com/learn/blog/2024/" />               <!-- Year archive -->
<link rel="canonical" href="https://thorbis.com/learn/blog/2024/08/" />            <!-- Month archive -->
```

## Parameter Handling & URL Cleanup

### Tracking Parameter Cleanup
```html
<!-- URLs with tracking parameters → Clean canonical -->
https://thorbis.com/industries/restaurants/?utm_source=google&utm_medium=cpc
→ Canonical: https://thorbis.com/industries/restaurants/

https://thorbis.com/features/pos-system/?ref=homepage&campaign=summer2024  
→ Canonical: https://thorbis.com/features/pos-system/
```

### Search & Filter Parameters
```html
<!-- Search results pages (Non-indexable) -->
/search?q=restaurant+software → robots: noindex, nofollow
/businesses/search?location=los-angeles → robots: noindex, nofollow

<!-- Filtered category pages (Canonical to main category) -->
/industries/restaurants/?type=fine-dining
→ Canonical: https://thorbis.com/industries/restaurants/

<!-- OR separate canonical if filter creates substantial unique value -->
<link rel="canonical" href="https://thorbis.com/industries/restaurants/fine-dining/" />
```

### Session & User-Specific Parameters
```html
<!-- User-specific URLs → Clean canonical -->
/dashboard?user_id=123456 → robots: noindex, nofollow
/account/settings?tab=billing → robots: noindex, nofollow
/checkout?plan=restaurant&billing=monthly → robots: noindex, nofollow
```

## Duplicate Content Prevention Strategies

### Similar Industry Content Differentiation

#### Content Template Structure
```markdown
# [Industry] [Feature] Software | Thorbis

## Industry-Specific Opening (Unique 150+ words)
- Industry pain points
- Specific use cases  
- Industry terminology
- Compliance requirements

## Core Feature Benefits (Shared framework, industry examples)
- Feature 1: [Industry-specific example]
- Feature 2: [Industry-specific example]  
- Feature 3: [Industry-specific example]

## Industry-Specific Features (Unique 200+ words)
- Industry workflow integration
- Compliance features
- Specialized reporting
- Hardware requirements

## [Industry] Customer Success Stories (Unique)
- Customer testimonials
- Case studies
- ROI examples
- Implementation stories

## Industry-Specific FAQ (Unique)
- 5+ industry-specific questions
- Compliance and regulatory questions
- Integration questions
- Pricing questions for industry
```

#### Content Uniqueness Requirements
- **Minimum 40% unique content** per industry page
- **Industry-specific H1/H2/H3 headings**
- **Different primary keywords** per industry
- **Unique meta descriptions** (completely different)
- **Different images/screenshots** for each industry
- **Industry-specific internal linking** patterns

### City Page Content Differentiation

#### City Content Template
```markdown
# Business Management Software [City], [State] | Thorbis

## City Business Landscape (Unique 200+ words)
- Local business statistics
- Economic trends
- Industry concentration
- Business challenges specific to city

## Local Success Stories (Unique)
- 3+ local customer examples
- City-specific ROI metrics
- Local business testimonials

## [City] Industry Focus (Unique based on city)
- Dominant industries in city
- Local business regulations
- City-specific compliance requirements

## Local Partnership & Support (Unique)
- Local implementation partners
- Regional support availability
- Local training options
```

#### Geographic Content Rules
- **No generic city page templates**
- **Minimum 300 unique words** per city page
- **Local business statistics** and economic data
- **City-specific customer examples**
- **Local industry focus** based on research
- **Different primary and secondary keywords**

## Redirect Strategy

### 301 Redirect Rules
```nginx
# Old domain to new domain
server {
    server_name old-domain.com www.old-domain.com;
    return 301 https://thorbis.com$request_uri;
}

# www to non-www
server {
    server_name www.thorbis.com;
    return 301 https://thorbis.com$request_uri;
}

# HTTP to HTTPS
server {
    listen 80;
    server_name thorbis.com;
    return 301 https://thorbis.com$request_uri;
}

# Product pages to feature pages
location /products/pos-system/ {
    return 301 /features/pos-system/;
}

location /products/scheduling/ {
    return 301 /features/scheduling/;
}

# Generic pages to industry-specific
location /business-software/ {
    return 301 /industries/home-services/;
}

location /pos-system/ {
    return 301 /industries/restaurants/pos-system/;
}

# Old blog structure to new
location /blog/ {
    return 301 /learn/blog/;
}

location /resources/ {
    return 301 /learn/;
}

# Parameter cleanup
location /industries/restaurants/ {
    if ($args ~ "(.*)utm_source=(.*)") {
        return 301 /industries/restaurants/;
    }
}
```

### Redirect Chain Prevention
```
❌ Bad - Redirect Chain:
/old-pos-system/ → 301 → /products/pos-system/ → 301 → /features/pos-system/

✅ Good - Direct Redirect:
/old-pos-system/ → 301 → /features/pos-system/
/products/pos-system/ → 301 → /features/pos-system/
```

## International Canonicalization (Future)

### Multi-Language/Region Canonical Strategy
```html
<!-- US English (Primary) -->
<link rel="canonical" href="https://thorbis.com/industries/restaurants/" />
<link rel="alternate" hreflang="en-us" href="https://thorbis.com/industries/restaurants/" />
<link rel="alternate" hreflang="en-ca" href="https://thorbis.ca/industries/restaurants/" />
<link rel="alternate" hreflang="es-us" href="https://thorbis.com/es/industrias/restaurantes/" />
<link rel="alternate" hreflang="x-default" href="https://thorbis.com/industries/restaurants/" />

<!-- Canadian English -->
<link rel="canonical" href="https://thorbis.ca/industries/restaurants/" />
<link rel="alternate" hreflang="en-ca" href="https://thorbis.ca/industries/restaurants/" />
<link rel="alternate" hreflang="en-us" href="https://thorbis.com/industries/restaurants/" />

<!-- Spanish US -->
<link rel="canonical" href="https://thorbis.com/es/industrias/restaurantes/" />
<link rel="alternate" hreflang="es-us" href="https://thorbis.com/es/industrias/restaurantes/" />
<link rel="alternate" hreflang="en-us" href="https://thorbis.com/industries/restaurants/" />
```

## Technical Implementation

### Next.js Canonical Implementation
```typescript
// pages/industries/[industry]/index.tsx
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function IndustryPage({ industry, canonicalUrl }) {
  const router = useRouter()
  
  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
      </Head>
      {/* Page content */}
    </>
  )
}

export async function getStaticProps({ params }) {
  const { industry } = params
  const canonicalUrl = `https://thorbis.com/industries/${industry}/`
  
  return {
    props: {
      industry,
      canonicalUrl
    }
  }
}
```

### Dynamic Canonical Generation
```typescript
// utils/canonical.ts
export function generateCanonicalUrl(path: string, params?: object): string {
  const baseUrl = 'https://thorbis.com'
  
  // Remove tracking parameters
  const cleanPath = path.split('?')[0]
  
  // Remove trailing slashes and add single trailing slash
  const normalizedPath = cleanPath.replace(/\/+$/, '') + '/'
  
  return `${baseUrl}${normalizedPath}`
}

// Remove common tracking parameters
export function cleanTrackingParams(url: string): string {
  const urlObj = new URL(url)
  const paramsToRemove = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'fbclid', 'ref', 'campaign', 'source', 'medium'
  ]
  
  paramsToRemove.forEach(param => {
    urlObj.searchParams.delete(param)
  })
  
  return urlObj.toString()
}
```

### XML Sitemap Canonical References
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Only canonical URLs in sitemap -->
  <url>
    <loc>https://thorbis.com/industries/restaurants/</loc>
    <lastmod>2024-08-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- No non-canonical variations -->
  <!-- Don't include: -->
  <!-- https://thorbis.com/products/restaurant-pos/ -->
  <!-- https://thorbis.com/industries/restaurants/?utm_source=google -->
</urlset>
```

## Monitoring & Validation

### Google Search Console Monitoring
- **Coverage Issues**: Monitor canonical errors
- **Duplicate Title Tags**: Track across industry variations  
- **Duplicate Meta Descriptions**: Monitor city page variations
- **Crawl Anomalies**: Track redirect chains and errors
- **Index Coverage**: Ensure canonical pages are indexed

### Regular Canonical Audits
```bash
# Crawl site and check canonical implementations
screaming-frog-seo-spider --crawl https://thorbis.com --export-canonicals

# Check for duplicate content issues  
siteliner.com analysis of thorbis.com

# Monitor canonical in search results
site:thorbis.com "restaurant pos system" 
# Should show canonical URLs, not variations
```

### Canonical Testing Checklist
- [ ] All pages have canonical tags
- [ ] Self-referential canonicals are correct
- [ ] Cross-domain canonicals work (if applicable)
- [ ] Parameter URLs redirect to clean URLs
- [ ] Industry variations have unique canonical URLs
- [ ] City variations have unique canonical URLs
- [ ] No redirect chains longer than 1 hop
- [ ] XML sitemaps only include canonical URLs
- [ ] hreflang and canonical work together (when applicable)

## Content Creation Guidelines

### Avoiding Duplicate Content During Creation

#### Industry Page Creation Process
1. **Research industry-specific terminology** and pain points
2. **Interview customers** in target industry for unique insights  
3. **Create industry-specific user personas** and use cases
4. **Write unique H1/H2/H3 headings** with industry keywords
5. **Include industry-specific examples** throughout content
6. **Add industry compliance** and regulation information
7. **Feature different customer testimonials** per industry
8. **Create industry-specific FAQ sections**
9. **Use industry-appropriate images** and screenshots
10. **Implement industry-specific internal linking** strategy

#### City Page Creation Process  
1. **Research local business landscape** and statistics
2. **Identify city-specific business challenges** and opportunities
3. **Find local customer success stories** and case studies
4. **Research local competition** and market dynamics
5. **Include city-specific regulations** and business requirements
6. **Add local partnership** and support information
7. **Use city-specific keywords** and search patterns
8. **Create location-specific meta descriptions**
9. **Include local business statistics** and economic data
10. **Link to relevant local resources** and directories

This comprehensive canonical URL strategy ensures Thorbis maintains clean URL structure, avoids duplicate content penalties, and maximizes search visibility across all industries and geographic markets while providing clear canonicalization signals to search engines.
