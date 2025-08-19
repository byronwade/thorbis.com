/**
 * Utility modules index
 * Exports all utility functions for easy importing
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Core utilities
export { default as logger } from './logger.js';
export { CacheManager } from './cache-manager.js';

// URL helpers for canonical paths
export function toKebabCase(input) {
  if (!input) return '';
  return String(input)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function buildBusinessUrl({ country = 'us', state, city, name, shortId }) {
  const statePart = toKebabCase(state);
  const cityPart = toKebabCase(city);
  const namePart = toKebabCase(name);
  const suffix = shortId ? `-${shortId}` : '';
  
  // Build URL parts, filtering out empty segments
  const urlParts = [country, statePart, cityPart, namePart].filter(part => part && part.length > 0);
  
  return `/${urlParts.join('/')}${suffix}`;
}

// Helper function to build fallback URL safely
export function buildFallbackBusinessUrl(business) {
  if (!business) return '/';
  
  const country = (business.country || 'us').toLowerCase();
  const state = (business.state || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  const city = (business.city || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  const name = (business.name || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  const shortId = business.short_id || business.shortId || '';
  
  // Build URL parts, filtering out empty segments
  const urlParts = [country, state, city, name].filter(part => part && part.length > 0);
  const suffix = shortId ? `-${shortId}` : '';
  
  return `/${urlParts.join('/')}${suffix}`;
}

/**
 * Combines class names with tailwind-merge for proper CSS class merging
 * This is the standard cn utility used throughout the project
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Re-export individual utility functions for backward compatibility
export * from './cache-manager.js';

// Add any other utility exports here
export { default as speechRecognition } from './speech-recognition.js';

// Default exports for common utilities
// Temporarily disable problematic exports to get server running
export default {
  // logger: require('../../utils/logger.js').logger,
  // CacheManager: require('./cacheManager.js').CacheManager,
  cn,
};
