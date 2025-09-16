// Terminal management system for coordinating multiple payment terminals
// Handles reader discovery, connection pooling, and load balancing

import { createStripeTerminalProcessor } from './stripe-terminal';
import { paymentSyncManager } from '../payment-sync-manager';

interface TerminalConfig {
  id: string;
  type: 'stripe_terminal' | 'square_terminal' | 'custom';
  name: string;
  location: string;
  settings: Record<string, unknown>;
  enabled: boolean;
}

interface TerminalConnection {
  id: string;
  processor: any;
  reader: any;
  status: 'connected' | 'disconnected' | 'busy' | 'error';
  lastUsed: Date;
  transactionCount: number;
  errorCount: number;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, unknown>;
  preferredTerminal?: string;
  timeout?: number;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  terminalId?: string;
  error?: string;
  receipt?: string;
}

export class TerminalManager {
  private static instance: TerminalManager | null = null;
  private connections: Map<string, TerminalConnection> = new Map();
  private configs: Map<string, TerminalConfig> = new Map();
  private discoveryInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startDiscoveryProcess();
    this.startHealthChecks();
  }

  static getInstance(): TerminalManager {
    if (!TerminalManager.instance) {
      TerminalManager.instance = new TerminalManager();
    }
    return TerminalManager.instance;
  }

  // Register a terminal configuration
  async registerTerminal(config: TerminalConfig): Promise<void> {
    this.configs.set(config.id, config);
    
    if (config.enabled) {
      await this.connectTerminal(config.id);
    }
  }

  // Connect to a specific terminal
  async connectTerminal(terminalId: string): Promise<boolean> {
    const config = this.configs.get(terminalId);
    if (!config || !config.enabled) {
      return false;
    }

    try {
      let processor;
      
      switch (config.type) {
        case 'stripe_terminal':
          processor = createStripeTerminalProcessor(config.settings);
          break;
        case 'square_terminal':
          // Would implement Square Terminal processor
          throw new Error('Square Terminal not implemented yet');
        case 'custom':
          // Would implement custom terminal processor
          throw new Error('Custom terminal not implemented yet');
        default:
          throw new Error('Unknown terminal type: ${config.type}');
      }

      // Discover and connect to readers
      const readers = await processor.discoverReaders();
      if (readers.length === 0) {
        throw new Error('No readers found for terminal');
      }

      const reader = readers[0]; // Use first available reader
      await processor.connectReader(reader.id);

      const connection: TerminalConnection = {
        id: terminalId,
        processor,
        reader,
        status: 'connected`,
        lastUsed: new Date(),
        transactionCount: 0,
        errorCount: 0
      };

      this.connections.set(terminalId, connection);
      console.log(`Connected to terminal: ${config.name}');
      return true;
    } catch (error) {
      console.error('Failed to connect terminal ${terminalId}:', error);
      
      // Mark as error state
      const connection = this.connections.get(terminalId);
      if (connection) {
        connection.status = 'error';
        connection.errorCount++;
      }
      
      return false;
    }
  }

  // Disconnect from a specific terminal
  async disconnectTerminal(terminalId: string): Promise<void> {
    const connection = this.connections.get(terminalId);
    if (!connection) return;

    try {
      await connection.processor.disconnectReader();
      connection.processor.destroy();
      connection.status = 'disconnected';
    } catch (error) {
      console.error('Error disconnecting terminal ${terminalId}:', error);
    }

    this.connections.delete(terminalId);
  }

  // Process payment using best available terminal
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const terminal = this.selectBestTerminal(request.preferredTerminal);
    if (!terminal) {
      return {
        success: false,
        error: 'No available terminals'
      };
    }

    const connection = this.connections.get(terminal)!;
    connection.status = 'busy';

    try {
      // Create payment intent
      const paymentIntent = await connection.processor.createPaymentIntent({
        amount: Math.round(request.amount * 100),
        currency: request.currency.toLowerCase(),
        paymentMethodTypes: ['card_present'],
        captureMethod: 'automatic',
        metadata: {
          terminalId: terminal,
          ...request.metadata
        }
      });

      // Collect payment with timeout
      const timeoutMs = request.timeout || 120000; // 2 minutes default
      const paymentResult = await Promise.race([
        connection.processor.collectPayment(paymentIntent.id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment timeout')), timeoutMs)
        )
      ]);

      // Generate receipt
      let receipt;
      try {
        receipt = connection.processor.generateReceipt(paymentResult);
      } catch (error) {
        console.warn('Failed to generate receipt:', error);
      }

      // Update connection stats
      connection.transactionCount++;
      connection.lastUsed = new Date();
      connection.status = 'connected';

      // Queue for offline sync if needed
      await paymentSyncManager.queuePayment({
        amount: request.amount * 100,
        currency: request.currency,
        paymentMethod: 'card_present',
        organizationId: request.metadata?.organizationId || ',
        metadata: {
          terminal_id: terminal,
          payment_intent_id: paymentIntent.id,
          stripe_charge_id: paymentResult.charges?.data[0]?.id,
          ...request.metadata
        },
        maxRetries: 3
      });

      return {
        success: true,
        paymentId: paymentResult.id,
        terminalId: terminal,
        receipt
      };
    } catch (error) {
      connection.status = 'connected'; // Reset status
      connection.errorCount++;
      
      return {
        success: false,
        terminalId: terminal,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  // Cancel payment on specific terminal
  async cancelPayment(terminalId: string): Promise<boolean> {
    const connection = this.connections.get(terminalId);
    if (!connection || connection.status !== 'busy') {
      return false;
    }

    try {
      await connection.processor.cancelPayment();
      connection.status = 'connected';
      return true;
    } catch (error) {
      console.error('Failed to cancel payment on terminal ${terminalId}:', error);
      return false;
    }
  }

  // Get all terminal statuses
  getTerminalStatuses(): Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    lastUsed?: Date;
    transactionCount: number;
    errorCount: number;
    reader?: any;
  }> {
    const statuses: Array<unknown> = [];

    for (const [id, config] of this.configs) {
      const connection = this.connections.get(id);
      
      statuses.push({
        id,
        name: config.name,
        type: config.type,
        status: connection?.status || 'disconnected',
        lastUsed: connection?.lastUsed,
        transactionCount: connection?.transactionCount || 0,
        errorCount: connection?.errorCount || 0,
        reader: connection?.reader
      });
    }

    return statuses;
  }

  // Select best terminal for payment
  private selectBestTerminal(preferredTerminal?: string): string | null {
    // If preferred terminal is specified and available, use it
    if (preferredTerminal) {
      const connection = this.connections.get(preferredTerminal);
      if (connection && connection.status === 'connected') {
        return preferredTerminal;
      }
    }

    // Find best available terminal based on criteria
    let bestTerminal: string | null = null;
    let bestScore = -1;

    for (const [terminalId, connection] of this.connections) {
      if (connection.status !== 'connected') continue;

      // Calculate score based on:
      // - Recent usage (prefer recently used terminals)
      // - Error rate (prefer terminals with fewer errors)
      // - Transaction load (prefer less busy terminals)
      const timeSinceLastUse = Date.now() - connection.lastUsed.getTime();
      const recentUsageScore = Math.max(0, 1 - (timeSinceLastUse / (10 * 60 * 1000))); // 10 min window
      const errorRate = connection.transactionCount > 0 ? connection.errorCount / connection.transactionCount : 0;
      const errorScore = Math.max(0, 1 - errorRate);
      const loadScore = 1; // Could factor in current load if tracking concurrent transactions

      const totalScore = (recentUsageScore * 0.3) + (errorScore * 0.5) + (loadScore * 0.2);

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestTerminal = terminalId;
      }
    }

    return bestTerminal;
  }

  // Start automatic terminal discovery
  private startDiscoveryProcess(): void {
    this.discoveryInterval = setInterval(async () => {
      await this.discoverAndReconnectTerminals();
    }, 60000); // Check every minute
  }

  // Start health checks for connected terminals
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 30000); // Check every 30 seconds
  }

  // Discover new terminals and reconnect disconnected ones
  private async discoverAndReconnectTerminals(): Promise<void> {
    for (const [terminalId, config] of this.configs) {
      if (!config.enabled) continue;

      const connection = this.connections.get(terminalId);
      
      // Try to reconnect if disconnected or in error state
      if (!connection || connection.status === 'disconnected' || connection.status === 'error') {
        // Only retry if error count is reasonable
        if (!connection || connection.errorCount < 5) {
          await this.connectTerminal(terminalId);
        }
      }
    }
  }

  // Perform health checks on connected terminals
  private async performHealthChecks(): Promise<void> {
    for (const [terminalId, connection] of this.connections) {
      if (connection.status === 'connected') {
        try {
          // In a real implementation, this would ping the terminal
          // For now, just verify the processor is still functional
          if (connection.processor && typeof connection.processor.discoverReaders === 'function') {
            // Terminal is healthy
            continue;
          } else {
            throw new Error('Processor is not functional');
          }
        } catch (error) {
          console.warn('Health check failed for terminal ${terminalId}:', error);
          connection.status = 'error';
          connection.errorCount++;
          
          // Try to reconnect after a few errors
          if (connection.errorCount >= 3) {
            await this.disconnectTerminal(terminalId);
          }
        }
      }
    }
  }

  // Get metrics for monitoring
  getMetrics(): {
    totalTerminals: number;
    connectedTerminals: number;
    busyTerminals: number;
    errorTerminals: number;
    totalTransactions: number;
    totalErrors: number;
    averageResponseTime?: number;
  } {
    const connectedCount = 0;
    const busyCount = 0;
    const errorCount = 0;
    const totalTransactions = 0;
    const totalErrors = 0;

    for (const connection of this.connections.values()) {
      switch (connection.status) {
        case 'connected':
          connectedCount++;
          break;
        case 'busy':
          busyCount++;
          break;
        case 'error':
          errorCount++;
          break;
      }
      
      totalTransactions += connection.transactionCount;
      totalErrors += connection.errorCount;
    }

    return {
      totalTerminals: this.configs.size,
      connectedTerminals: connectedCount,
      busyTerminals: busyCount,
      errorTerminals: errorCount,
      totalTransactions,
      totalErrors
    };
  }

  // Cleanup resources
  destroy(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Disconnect all terminals
    for (const terminalId of this.connections.keys()) {
      this.disconnectTerminal(terminalId);
    }
  }
}

// Factory function for creating terminal manager
export function createTerminalManager(): TerminalManager {
  return TerminalManager.getInstance();
}

// Default terminal configurations
export const DEFAULT_TERMINAL_CONFIGS: TerminalConfig[] = [
  {
    id: 'stripe_pos_1',
    type: 'stripe_terminal',
    name: 'Front Counter POS',
    location: 'counter_front',
    settings: {
      connectionToken: process.env.STRIPE_TERMINAL_CONNECTION_TOKEN,
      locationId: process.env.STRIPE_TERMINAL_LOCATION_ID,
      deviceType: 'bbpos_wisepos_e',
      testMode: process.env.NODE_ENV !== 'production'
    },
    enabled: true
  },
  {
    id: 'stripe_mobile_1',
    type: 'stripe_terminal',
    name: 'Mobile Reader 1',
    location: 'mobile_field',
    settings: {
      connectionToken: process.env.STRIPE_TERMINAL_CONNECTION_TOKEN,
      locationId: process.env.STRIPE_TERMINAL_LOCATION_ID,
      deviceType: 'simulated_wisepos_e',
      testMode: process.env.NODE_ENV !== 'production'
    },
    enabled: true
  }
];

// Utility function to initialize default terminals
export async function initializeDefaultTerminals(): Promise<TerminalManager> {
  const manager = createTerminalManager();
  
  for (const config of DEFAULT_TERMINAL_CONFIGS) {
    await manager.registerTerminal(config);
  }
  
  return manager;
}