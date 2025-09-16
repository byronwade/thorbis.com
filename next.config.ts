import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // NextFaster Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Server external packages
  serverExternalPackages: [
    '@anthropic-ai/sdk', 
    'nodemailer', 
    'stripe', 
    '@supabase/supabase-js',
    'playwright'
  ],
  
  // Enable typed routes
  typedRoutes: true,

  experimental: {
    // Optimize package imports for better tree shaking
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'clsx',
      'tailwind-merge',
      'swr',
      'recharts',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tooltip'
    ],
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      // Optimize CSS processing for instant page transitions
      '*.css': ['css-loader', 'postcss-loader'],
      '*.module.css': ['css-loader?modules', 'postcss-loader'],
    },
  },

  // Set output file tracing root to silence workspace warning
  outputFileTracingRoot: '/Users/byronwade/thorbis-business-os',
  
  // Image optimization for performance
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack optimizations for 170KB budget compliance
  webpack: (config: any, { dev, isServer }) => {
    // Bundle analyzer for both development and production builds
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: dev ? 'server' : 'static',
          openAnalyzer: dev,
          analyzerPort: dev ? 8888 : undefined,
          reportFilename: dev ? undefined : './analyze/client.html',
          generateStatsFile: true,
          statsFilename: './analyze/client.json',
        })
      );
    }
    
    // Production optimizations
    if (!dev && !isServer) {
      // Advanced code splitting for NextFaster compliance
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 50000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Separate chunks for heavy libraries
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
          ai: {
            test: /[\\/]node_modules[\\/]@anthropic-ai[\\/]/,
            name: 'ai',
            priority: 10,
            chunks: 'all',
          },
        },
      };
      
      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    return config;
  },
  
  // NextFaster performance headers with stale-while-revalidate
  async headers() {
    return [
      {
        // Static assets - aggressive caching
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes - stale-while-revalidate for instant navigation
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        // Security and performance headers
        source: '/(.*)',
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
        ],
      },
    ];
  },
  
  // Rewrites for app routing
  async rewrites() {
    return [
      // API routes mapping
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },
}

export default nextConfig
