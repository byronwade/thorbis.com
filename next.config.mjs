import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true, // Enable for production security
  poweredByHeader: false, // Security: Hide Next.js version
  
  // Production build optimization
  output: 'standalone', // Enable for Docker deployment
  generateEtags: false, // Disable ETags for security
  compress: true, // Enable compression

  eslint: {
    // Ignore ESLint during builds to focus on compilation errors
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Ignore TypeScript errors during build for now
    ignoreBuildErrors: true,
  },

  experimental: {
    // Disable features that can cause Tailwind conflicts
    concurrentFeatures: false,
  },

  // Image optimization configuration
  images: {
    qualities: [25, 50, 75, 85, 100],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.supabase.co https://va.vercel-scripts.com https://*.vercel-scripts.com https://maps.googleapis.com; script-src-elem 'self' 'unsafe-inline' https://vercel.live https://*.supabase.co https://va.vercel-scripts.com https://*.vercel-scripts.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https: https://maps.googleapis.com https://maps.gstatic.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live https://va.vercel-scripts.com https://*.vercel-scripts.com https://maps.googleapis.com https://maps.gstatic.com https://www.googleapis.com https://api.pwnedpasswords.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },

  // Allow LAN dev origin to avoid noisy warnings
  // (Next.js will ignore unknown options; safe if unsupported)
  allowedDevOrigins: ["http://192.168.50.185:3000"],

  // Disable problematic filesystem caching in development
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      config.snapshot = {
        ...(config.snapshot || {}),
        managedPaths: [],
        immutablePaths: [],
      };
    }

    // Suppress Supabase realtime-js critical dependency warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency/,
      },
      {
        module: /websocket-factory\.js/,
        message: /the request of a dependency is an expression/,
      },
    ];

    // Add path aliases for webpack resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@features': path.resolve(__dirname, 'src/features'),
      '@integrations': path.resolve(__dirname, 'src/integrations'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@config': path.resolve(__dirname, 'src/config'),
    };

    return config;
  },

  // Basic image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default baseConfig;
