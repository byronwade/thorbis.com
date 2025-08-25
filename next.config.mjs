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
  
  // Disable source maps to reduce memory usage
  productionBrowserSourceMaps: false,
  experimental: {
    serverSourceMaps: false,
    // Enable webpack memory optimizations
    webpackMemoryOptimizations: true,
    // Enable webpack build worker
    webpackBuildWorker: true,
  },
  
  // Reduce build complexity
  compress: false,
  
  // Optimized webpack config for memory usage
  webpack: (config, { dev, isServer }) => {
    // Disable caching to prevent memory issues
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory',
      });
    }
    
    // Disable source maps
    config.devtool = false;
    
    // Disable optimization to reduce memory usage
    config.optimization = {
      ...config.optimization,
      minimize: false,
      splitChunks: false,
      concatenateModules: false,
      removeAvailableModules: false,
      removeEmptyChunks: false,
    };
    
    // Reduce logging
    config.infrastructureLogging = {
      level: 'error',
    };
    
    config.stats = 'errors-only';

    return config;
  },
};

export default baseConfig;
