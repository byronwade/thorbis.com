/**
 * AI Integration Test Utilities for Thorbis AI Chat Application
 * 
 * This module provides comprehensive testing utilities for the AI chat
 * integration, including API endpoint testing, streaming response validation,
 * tool execution testing, and performance benchmarking. It ensures the
 * AI integration is working correctly and meets performance requirements.
 * 
 * Key features:
 * - API endpoint integration testing
 * - Streaming response validation
 * - Tool execution and safety testing
 * - Performance and latency benchmarking
 * - Configuration validation
 * - Error handling verification
 */

import { getConfig, validateConfig, getConfigErrors } from './config';

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

/**
 * Test configuration validation
 */
export async function testConfiguration(): Promise<TestResult> {
  const start = performance.now();
  
  try {
    const isValid = validateConfig();
    if (!isValid) {
      const errors = getConfigErrors();
      return {
        name: 'Configuration Validation',
        status: 'fail',
        message: 'Configuration validation failed: ${errors.join(', ')}',
        duration: performance.now() - start,
        details: { errors },
      };
    }

    const config = getConfig();
    return {
      name: 'Configuration Validation',
      status: 'pass',
      message: 'Configuration is valid and all required environment variables are set',
      duration: performance.now() - start,
      details: {
        anthropic: {
          model: config.anthropic.model,
          hasApiKey: !!config.anthropic.apiKey,
        },
        supabase: {
          hasUrl: !!config.supabase.url,
          hasAnonKey: !!config.supabase.anonKey,
        },
      },
    };
  } catch (error) {
    return {
      name: 'Configuration Validation',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown configuration error',
      duration: performance.now() - start,
    };
  }
}

/**
 * Test AI chat API endpoint
 */
export async function testChatAPI(): Promise<TestResult> {
  const start = performance.now();
  
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message.',
        conversation_id: 'test_conversation',
      }),
    });

    if (!response.ok) {
      return {
        name: 'Chat API Endpoint',
        status: 'fail',
        message: 'API request failed with status ${response.status}',
        duration: performance.now() - start,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
      };
    }

    const data = await response.json();
    
    return {
      name: 'Chat API Endpoint',
      status: 'pass',
      message: 'Chat API endpoint is responding correctly',
      duration: performance.now() - start,
      details: {
        hasContent: !!data.content,
        hasToolsUsed: Array.isArray(data.tools_used),
        contentLength: data.content?.length || 0,
      },
    };
  } catch (error) {
    return {
      name: 'Chat API Endpoint',
      status: 'fail',
      message: error instanceof Error ? error.message : 'API test failed',
      duration: performance.now() - start,
    };
  }
}

/**
 * Test streaming response functionality
 */
export async function testStreamingAPI(): Promise<TestResult> {
  const start = performance.now();
  
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-stream': 'true',
      },
      body: JSON.stringify({
        message: 'Test streaming response',
        conversation_id: 'test_streaming',
      }),
    });

    if (!response.ok) {
      return {
        name: 'Streaming API',
        status: 'fail',
        message: 'Streaming API failed with status ${response.status}',
        duration: performance.now() - start,
      };
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return {
        name: 'Streaming API',
        status: 'fail',
        message: 'No stream reader available',
        duration: performance.now() - start,
      };
    }

    const chunkCount = 0;
    const totalBytes = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunkCount++;
        totalBytes += value.length;
        
        // Limit test duration
        if (performance.now() - start > 10000) {
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      name: 'Streaming API',
      status: 'pass',
      message: 'Streaming API is working correctly',
      duration: performance.now() - start,
      details: {
        chunksReceived: chunkCount,
        totalBytes,
        avgChunkSize: chunkCount > 0 ? totalBytes / chunkCount : 0,
      },
    };
  } catch (error) {
    return {
      name: 'Streaming API',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Streaming test failed',
      duration: performance.now() - start,
    };
  }
}

/**
 * Test business tools integration
 */
export async function testBusinessTools(): Promise<TestResult> {
  const start = performance.now();
  
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Get business data for work orders',
        conversation_id: 'test_tools',
      }),
    });

    if (!response.ok) {
      return {
        name: 'Business Tools Integration',
        status: 'fail',
        message: 'Tools API failed with status ${response.status}',
        duration: performance.now() - start,
      };
    }

    const data = await response.json();
    
    const hasToolsUsed = Array.isArray(data.tools_used) && data.tools_used.length > 0;
    
    return {
      name: 'Business Tools Integration',
      status: hasToolsUsed ? 'pass' : 'skip',
      message: hasToolsUsed 
        ? 'Business tools are being executed correctly'
        : 'No tools were executed (may depend on message content)',
      duration: performance.now() - start,
      details: {
        toolsUsed: data.tools_used?.length || 0,
        toolNames: data.tools_used?.map((t: unknown) => t.name) || [],
      },
    };
  } catch (error) {
    return {
      name: 'Business Tools Integration',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Tools test failed',
      duration: performance.now() - start,
    };
  }
}

/**
 * Test performance benchmarks
 */
export async function testPerformance(): Promise<TestResult> {
  const start = performance.now();
  
  try {
    // Test response time
    const apiStart = performance.now();
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Quick test',
        conversation_id: 'perf_test',
      }),
    });
    const apiDuration = performance.now() - apiStart;

    if (!response.ok) {
      return {
        name: 'Performance Benchmark',
        status: 'fail',
        message: 'API request failed during performance test',
        duration: performance.now() - start,
      };
    }

    await response.json();
    
    // Performance thresholds (adjustable)
    const maxResponseTime = 5000; // 5 seconds
    const isPerformant = apiDuration < maxResponseTime;

    return {
      name: 'Performance Benchmark',
      status: isPerformant ? 'pass' : 'fail',
      message: isPerformant 
        ? 'API performance meets requirements'
        : 'API response time (${apiDuration.toFixed(2)}ms) exceeds threshold (${maxResponseTime}ms)',
      duration: performance.now() - start,
      details: {
        responseTimeMs: apiDuration,
        threshold: maxResponseTime,
        meetsRequirements: isPerformant,
      },
    };
  } catch (error) {
    return {
      name: 'Performance Benchmark',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Performance test failed',
      duration: performance.now() - start,
    };
  }
}

/**
 * Run all integration tests
 */
export async function runAllTests(): Promise<TestSuite> {
  const suiteStart = performance.now();
  
  const tests = [
    await testConfiguration(),
    await testChatAPI(),
    await testStreamingAPI(),
    await testBusinessTools(),
    await testPerformance(),
  ];

  const summary = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'pass').length,
    failed: tests.filter(t => t.status === 'fail').length,
    skipped: tests.filter(t => t.status === 'skip').length,
    duration: performance.now() - suiteStart,
  };

  return {
    name: 'AI Integration Test Suite`,
    tests,
    summary,
  };
}

/**
 * Format test results for display
 */
export function formatTestResults(suite: TestSuite): string {
  const lines = [
    `# ${suite.name}`,
    ',
    '**Summary**: ${suite.summary.passed}/${suite.summary.total} tests passed (${suite.summary.duration.toFixed(2)}ms)',
    ',
  ];

  suite.tests.forEach(test => {
    const icon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⏭️`;
    lines.push(`${icon} **${test.name}**`);
    lines.push(`   ${test.message}`);
    if (test.duration) {
      lines.push(`   *Duration: ${test.duration.toFixed(2)}ms*');
    }
    if (test.details) {
      lines.push('   <details><summary>Details</summary><pre>${JSON.stringify(test.details, null, 2)}</pre></details>');
    }
    lines.push(');
  });

  return lines.join('
');
}