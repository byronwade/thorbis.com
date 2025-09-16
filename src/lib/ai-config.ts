/**
 * Configuration Management for Thorbis AI Chat Application
 * 
 * This module provides centralized configuration management for the AI chat
 * application, including environment variable validation, API configuration,
 * and runtime settings. It ensures proper configuration loading and provides
 * type-safe access to all configuration values.
 * 
 * Key features:
 * - Environment variable validation with runtime checks
 * - Type-safe configuration access
 * - Development vs production configuration handling
 * - API endpoint and authentication configuration
 * - Performance and rate limiting settings
 * - Error handling and fallback values
 */

import { z } from 'zod';

// Configuration schema for validation
const configSchema = z.object({
  // Anthropic API Configuration
  anthropic: z.object({
    apiKey: z.string().min(1, 'Anthropic API key is required'),
    model: z.string().default('claude-3-5-sonnet-20241022'),
    maxTokens: z.number().default(4000),
    temperature: z.number().min(0).max(2).default(0.7),
    baseURL: z.string().url().optional(),
  }),

  // Supabase Configuration
  supabase: z.object({
    url: z.string().url('Supabase URL must be a valid URL'),
    anonKey: z.string().min(1, 'Supabase anon key is required'),
    serviceKey: z.string().min(1, 'Supabase service key is required').optional(),
  }),

  // Application Configuration
  app: z.object({
    env: z.enum(['development', 'production', 'test']).default('development'),
    debug: z.boolean().default(false),
    port: z.number().default(3017),
    baseURL: z.string().url().default('http://localhost:3017'),
  }),

  // Performance Configuration
  performance: z.object({
    maxConcurrentRequests: z.number().default(10),
    requestTimeoutMs: z.number().default(30000),
    streamingTimeoutMs: z.number().default(60000),
    rateLimitPerMinute: z.number().default(60),
  }),

  // Feature Flags
  features: z.object({
    toolsEnabled: z.boolean().default(true),
    streamingEnabled: z.boolean().default(true),
    memoryEnabled: z.boolean().default(true),
    searchEnabled: z.boolean().default(true),
    auditLogging: z.boolean().default(true),
  }),
});

type Config = z.infer<typeof configSchema>;

// Load and validate configuration
function loadConfig(): Config {
  const rawConfig = {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || ',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
      baseURL: process.env.ANTHROPIC_BASE_URL,
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || ',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    app: {
      env: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      debug: process.env.DEBUG === 'true',
      port: parseInt(process.env.PORT || '3017'),
      baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3017',
    },
    performance: {
      maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10'),
      requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000'),
      streamingTimeoutMs: parseInt(process.env.STREAMING_TIMEOUT_MS || '60000'),
      rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60'),
    },
    features: {
      toolsEnabled: process.env.TOOLS_ENABLED !== 'false',
      streamingEnabled: process.env.STREAMING_ENABLED !== 'false',
      memoryEnabled: process.env.MEMORY_ENABLED !== 'false',
      searchEnabled: process.env.SEARCH_ENABLED !== 'false',
      auditLogging: process.env.AUDIT_LOGGING !== 'false',
    },
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach(err => {
        console.error('  - ${err.path.join('.')}: ${err.message}');
      });
      throw new Error('Invalid configuration. Please check your environment variables.');
    }
    throw error;
  }
}

// Lazy-loaded configuration
let _config: Config | null = null;

export function getConfig(): Config {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

// Convenience exports for commonly used config values
export function getAnthropicConfig() {
  return getConfig().anthropic;
}

export function getSupabaseConfig() {
  return getConfig().supabase;
}

export function getAppConfig() {
  return getConfig().app;
}

export function getPerformanceConfig() {
  return getConfig().performance;
}

export function getFeatureFlags() {
  return getConfig().features;
}

// Validation helpers
export function validateConfig(): boolean {
  try {
    getConfig();
    return true;
  } catch {
    return false;
  }
}

export function getConfigErrors(): string[] {
  try {
    getConfig();
    return [];
  } catch (error) {
    if (error instanceof Error) {
      return [error.message];
    }
    return ['Unknown configuration error'];
  }
}

// Development helpers
export function isProduction(): boolean {
  return getConfig().app.env === 'production';
}

export function isDevelopment(): boolean {
  return getConfig().app.env === 'development';
}

export function isDebugEnabled(): boolean {
  return getConfig().app.debug;
}

// Export type for external use
export type { Config };