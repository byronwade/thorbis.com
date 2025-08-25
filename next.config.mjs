import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Optimize package imports
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'react-icons',
      '@heroicons/react',
      'framer-motion',
      'date-fns',
      'lodash',
      'clsx',
      'tailwind-merge',
    ],
  },
  
  // Suppress hydration warnings for browser extension attributes
  suppressHydrationWarning: true,
  
  // Image configuration for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hdiuifrlulzpvasknzqm.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Disable problematic features
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimized webpack config for development
  webpack: (config, { dev, isServer }) => {
    // Enable caching for development (was disabled before)
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(__dirname, '.next/cache'),
      };
    }
    
    // Disable source maps in development for faster builds
    if (dev) {
      config.devtool = false;
    }
    
    // Optimize module resolution
    config.resolve.modules = [path.resolve(__dirname, 'src'), 'node_modules'];
    
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve(__dirname, 'src/components'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@features': path.resolve(__dirname, 'src/features'),
    };

    // Optimize for development
    if (dev) {
      // Reduce bundle analysis overhead
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    // Note: Hydration warnings are handled at the component level

    return config;
  },

  // Optimize on-demand entries for development
  onDemandEntries: {
    // Keep pages in memory longer to reduce recompilation
    maxInactiveAge: 25 * 1000, // 25 seconds
    pagesBufferLength: 5, // Keep 5 pages in memory
  },
};

export default baseConfig;
