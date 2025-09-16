# NextFaster Optimizations Script Documentation

## Overview

**File**: `/scripts/apply-nextfaster-optimizations.js`  
**Purpose**: Automated NextFaster Performance Implementation  
**Target**: Sub-300ms Navigation, 170KB JS Budget  
**Last Updated**: 2025-01-31  

## Core Functionality

This script automatically applies NextFaster performance optimizations across all Thorbis Business OS applications. It generates Next.js configurations with advanced performance settings, implements aggressive caching strategies, and adds performance monitoring tools.

### Primary Functions

1. **Next.js Configuration Generation**
   - Creates NextFaster-compliant `next.config.ts` files
   - Implements advanced webpack optimizations
   - Configures code splitting for 170KB budget compliance
   - Sets up performance headers with stale-while-revalidate

2. **Package.json Enhancement**
   - Adds bundle analysis scripts
   - Installs performance monitoring dependencies
   - Creates performance testing commands
   - Integrates webpack bundle analyzer

3. **App-Specific Optimization**
   - Handles routing redirects for each app type
   - Configures MDX support where needed
   - Sets up industry-specific optimizations

## Usage

### Apply to All Apps
```bash
node scripts/apply-nextfaster-optimizations.js
```

### Manual Execution
```bash
cd scripts
node apply-nextfaster-optimizations.js
```

## Supported Applications

### Current App Support
- `rest` - Restaurant POS and management
- `auto` - Auto services and repair orders
- `ret` - Retail POS and inventory
- `books` - Bookkeeping and accounting
- `courses` - Learning management system
- `lom` - Documentation and spec site
- `payroll` - Payroll processing
- `investigations` - Investigation management
- `site` - Marketing website

### App-Specific Configurations

#### Restaurant App (`rest`)
```javascript
async redirects() {
  return [
    {
      source: '/',
      destination: '/pos',  // Primary restaurant workflow
      permanent: false,
    },
  ]
}
```

#### Courses App (`courses`)
```javascript
async redirects() {
  return [
    {
      source: "/",
      destination: "/dashboard",
      permanent: false,
    },
  ];
}
```

#### LOM Documentation (`lom`)
```javascript
pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
async rewrites() {
  return [
    {
      source: '/.well-known/lom.json',
      destination: '/api/well-known/lom.json'
    },
    // Additional well-known rewrites...
  ]
}
```

## NextFaster Configuration Features

### Performance Optimizations
```javascript
const nextConfig: NextConfig = {
  // Core performance settings
  poweredByHeader: false,
  compress: true,
  
  // Package optimization for better tree shaking
  transpilePackages: ['@thorbis/ui', '@thorbis/design', '@thorbis/schemas'],
  
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'clsx',
      'tailwind-merge',
      'swr',
      'recharts',
      '@supabase/supabase-js'
    ],
    serverComponentsExternalPackages: [
      'nodemailer', 
      'stripe', 
      '@supabase/supabase-js'
    ],
  }
}
```

### Image Optimization
```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  dangerouslyAllowSVG: false,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
```

### Webpack Optimizations

#### Bundle Analyzer Integration
```javascript
if (dev && process.env.ANALYZE === 'true') {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  config.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      openAnalyzer: true,
    })
  );
}
```

#### Advanced Code Splitting
```javascript
config.optimization.splitChunks = {
  chunks: 'all',
  minSize: 20000,
  maxSize: 50000,
  cacheGroups: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      priority: -10,
      chunks: 'all',
    },
    charts: {
      test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
      name: 'charts',
      priority: 15,
      chunks: 'all',
    },
    supabase: {
      test: /[\\/]node_modules[\\/]@supabase[\\/]/,
      name: 'supabase',
      priority: 10,
      chunks: 'all',
    },
  },
};
```

### Performance Headers

#### Stale-While-Revalidate Strategy
```javascript
async headers() {
  return [
    {
      // Static assets - aggressive caching
      source: '/static/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      }],
    },
    {
      // API routes - stale-while-revalidate for instant navigation
      source: '/api/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=60, stale-while-revalidate=300',
      }],
    }
  ];
}
```

#### Security Headers
```javascript
headers: [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  // Preload critical resources
  {
    key: 'Link',
    value: '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
  }
]
```

## Package.json Enhancements

### Performance Scripts
```json
{
  "scripts": {
    "bundle:analyze": "ANALYZE=true next build",
    "bundle:check": "node ../../scripts/bundle-analysis.js --app=appname",
    "perf:test": "npm run bundle:check && npm run build"
  }
}
```

### Dependencies Added
```json
{
  "dependencies": {
    "web-vitals": "^4.0.0"
  },
  "devDependencies": {
    "webpack-bundle-analyzer": "^4.10.0"
  }
}
```

## Integration Points

### Monorepo Architecture
- Operates across entire `/apps` directory structure
- Handles diverse application types (POS, documentation, admin panels)
- Maintains consistent performance standards across all verticals

### Build System Integration
- Compatible with Turbo monorepo orchestration
- Works with pnpm package manager
- Integrates with existing CI/CD pipeline

### Development Workflow
- Automatically configures performance monitoring
- Sets up bundle analysis tools
- Enables development-time performance insights

## Performance Impact

### Bundle Size Optimization
- **Code Splitting**: Reduces initial bundle sizes
- **Tree Shaking**: Eliminates unused code
- **Dynamic Imports**: Lazy loads heavy components
- **Chunk Optimization**: Optimal caching strategies

### Loading Performance
- **Static Asset Caching**: 1-year cache for immutable assets
- **API Response Caching**: 60-second cache with 5-minute stale
- **Font Preloading**: Critical font resources preloaded
- **Image Optimization**: Modern formats (AVIF, WebP)

### Runtime Performance
- **Server Components**: Reduces client-side JavaScript
- **External Package Optimization**: Tree-shaking for major libraries
- **Compiler Optimizations**: Production console removal and minification

## Security Considerations

### Content Security Policy
- Restricts SVG loading to prevent XSS
- Sandboxed SVG execution
- Safe image optimization settings

### Header Security
- X-Frame-Options prevents clickjacking
- X-Content-Type-Options prevents MIME sniffing
- Referrer-Policy controls referrer information

### External Dependencies
- Server-side external packages isolated
- Client-side bundle size minimized
- Dependency optimization without security compromise

## Error Handling

### Configuration Generation
```javascript
try {
  updateNextConfig(appPath, appName);
  updatePackageJson(appPath, appName);
  console.log(`✅ ${appName} optimization complete\n`);
} catch (error) {
  console.error(`❌ Failed to optimize ${appName}:`, error.message);
}
```

### File System Operations
- Graceful handling of missing directories
- Preserves existing configurations where appropriate
- Clear error reporting for troubleshooting

## Maintenance Requirements

### Regular Updates
- Monitor Next.js version compatibility
- Update optimization strategies for new webpack versions
- Adjust bundle budgets based on performance metrics

### App Addition Process
- Add new apps to `APPS` array
- Configure app-specific redirects or settings
- Test optimization effectiveness

### Performance Monitoring
- Track optimization impact on build times
- Monitor bundle size improvements
- Validate NextFaster compliance after changes

## Output and Reporting

### Success Output
```
🚀 Applying NextFaster optimizations to all Thorbis apps...

📦 Processing rest...
✅ Updated rest Next.js config with NextFaster optimizations
✅ Updated rest package.json with performance scripts
✅ rest optimization complete

🎉 NextFaster optimizations applied to all apps!
```

### Next Steps Guidance
```
📊 Next steps:
1. Run: pnpm bundle:analyze - to check current bundle sizes
2. Run: pnpm perf:audit - to test all apps  
3. Check builds comply with 170KB JavaScript budget
```

## Related Systems

### Bundle Analysis Integration
- Works with `/scripts/bundle-analysis.js`
- Provides tools needed for bundle size monitoring
- Enables CI/CD performance enforcement

### Configuration Management
- Coordinates with `/scripts/fix-nextjs15-configs.js`
- Maintains Next.js 15 compatibility
- Preserves app-specific configurations

### Performance Pipeline
- Integrates with GitHub Actions workflows
- Supports automated performance testing
- Enables continuous performance monitoring

## Future Enhancements

### Planned Features
- Dynamic optimization based on app complexity
- Integration with performance monitoring services
- Automated optimization recommendations
- Advanced caching strategies

### Extensibility
- Plugin system for custom optimizations
- Template system for new app types
- Integration with external performance tools

This script is fundamental to maintaining NextFaster compliance across the entire Thorbis Business OS and ensuring consistent sub-300ms navigation performance for all industry-specific applications.