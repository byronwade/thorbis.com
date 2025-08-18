/**
 * Utility modules index
 * Exports all utility functions for easy importing
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Core utilities
export { logger } from './logger.js';
export { CacheManager } from './cacheManager.js';

/**
 * Combines class names with tailwind-merge for proper CSS class merging
 * This is the standard cn utility used throughout the project
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Re-export individual utility functions for backward compatibility
export * from './logger.js';
export * from './cacheManager.js';

// Add any other utility exports here
export { default as speechRecognition } from './speechRecognition.js';

// Default exports for common utilities
// Temporarily disable problematic exports to get server running
export default {
  // logger: require('../../utils/logger.js').logger,
  // CacheManager: require('./cacheManager.js').CacheManager,
  cn,
};
