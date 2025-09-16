# Blog Structure

This directory follows Vercel's recommended blog structure for Next.js applications.

## Directory Structure

```
src/app/blog/
├── page.js          # Blog listing page (/blog)
├── [slug]/
│   └── page.js      # Individual blog post pages (/blog/[slug])
└── README.md        # This documentation
```

## File Organization

### `/blog` (Main Listing)
- **File**: `src/app/blog/page.js`
- **Route**: `/blog`
- **Purpose**: Displays all blog articles with search, filtering, and pagination
- **Features**:
  - Grid layout with featured images
  - Search functionality
  - Category filtering
  - Pagination with "Load More"
  - SEO optimized with structured data

### `/blog/[slug]` (Individual Posts)
- **File**: `src/app/blog/[slug]/page.js`
- **Route**: `/blog/[slug]` (e.g., `/blog/digital-marketing-strategies-local-businesses`)
- **Purpose**: Displays individual blog posts with full content
- **Features**:
  - Full article content with HTML rendering
  - Author information and avatars
  - Related articles section
  - Social sharing
  - Newsletter signup
  - SEO optimized with article schema

## Data Structure

Blog posts are currently using mock data from `src/lib/data/blog-posts.js` with the following structure:

```javascript
{
  id: "unique-id",
  title: "Article Title",
  slug: "url-friendly-slug",
  excerpt: "Brief description...",
  content: "Full HTML content...",
  featured_image: "image-url",
  published_at: "2024-12-15T10:00:00Z",
  reading_time: 8,
  view_count: 1247,
  tags: ["tag1", "tag2"],
  featured: true,
  author: {
    name: "Author Name",
    avatar_url: "avatar-url",
    bio: "Author bio"
  },
  category: {
    name: "Category Name",
    slug: "category-slug"
  }
}
```

## Vercel Best Practices Followed

1. **File-based Routing**: Uses Next.js App Router with file-based routing
2. **Dynamic Routes**: `[slug]` for individual blog posts
3. **Static Generation**: Optimized for performance with ISR
4. **SEO Optimization**: Proper metadata and structured data
5. **Performance**: Lazy loading, image optimization, and caching

## Development vs Production

- **Development**: Uses mock data from `src/lib/data/blog-posts.js`
- **Production**: Can be easily switched to use Supabase or other data sources
- **Data Source**: Update imports in `page.js` files to switch between mock and real data

## Adding New Posts

1. Add new post data to `src/lib/data/blog-posts.js`
2. Ensure unique slug and proper metadata
3. Add featured image (use Unsplash or similar)
4. Test the post appears on `/blog` and individual page loads

## SEO Features

- Structured data (JSON-LD) for blog and articles
- Proper meta titles and descriptions
- Open Graph and Twitter Card support
- Canonical URLs
- Breadcrumb navigation
- Schema markup for authors and categories
