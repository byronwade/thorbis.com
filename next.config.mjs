import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Disable problematic features
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Minimal webpack config
  webpack: (config, { dev, isServer }) => {
    // Disable caching completely
    config.cache = false;
    
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

    return config;
  },
};

export default baseConfig;
