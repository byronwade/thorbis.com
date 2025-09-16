// Stripe Terminal integration for in-person payments
// Supports card present transactions, contactless payments, and EMV chip

import { paymentTokenizer } from '../payment-tokenization';
import { paymentSyncManager } from '../payment-sync-manager';

interface StripeTerminalConfig {
  connectionToken: string;
  locationId: string;
  deviceType: 'bbpos_wisepos_e' | 'verifone_p400' | 'simulated_wisepos_e';
  testMode: boolean;
}

interface PaymentIntentRequest {
  amount: number;
  currency: string;
  paymentMethodTypes: string[];
  captureMethod: 'automatic' | 'manual';
  metadata?: Record<string, string>;
}

interface TerminalReader {
  id: string;
  object: 'terminal.reader';
  deviceType: string;
  ipAddress: string;
  label: string;
  location: string;
  serialNumber: string;
  status: 'online' | 'offline';
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  charges: {
    data: Array<{
      id: string;
      amount: number;
      paymentMethod: {
        cardPresent: {
          brand: string;
          last4: string;
          expMonth: number;
          expYear: number;
          emvAuthData?: string;
          receipt?: {
            applicationPreferredName?: string;
            dedicatedFileName?: string;
          };
        };
      };
    }>;
  };
}

export class StripeTerminalProcessor {
  private config: StripeTerminalConfig;
  private reader: TerminalReader | null = null;
  private connectionSimulator: Worker | null = null;

  constructor(config: StripeTerminalConfig) {
    this.config = config;
    this.initializeConnectionSimulator();
  }

  // Initialize connection simulator for offline testing
  private initializeConnectionSimulator() {
    if (typeof Worker !== 'undefined') {
      const workerCode = '
        const isConnected = true;
        let paymentInProgress = false;

        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch (type) {
            case 'DISCOVER_READERS':
              setTimeout(() => {
                self.postMessage({
                  type: 'READERS_DISCOVERED',
                  data: [{
                    id: 'tmr_test_123',
                    object: 'terminal.reader',
                    deviceType: 'bbpos_wisepos_e',
                    ipAddress: '192.168.1.100',
                    label: 'Test Terminal 1',
                    location: 'tml_test_location',
                    serialNumber: 'WP12345',
                    status: 'online'
                  }]
                });
              }, 1000);
              break;

            case 'CONNECT_READER':
              setTimeout(() => {
                self.postMessage({
                  type: 'READER_CONNECTED',
                  data: data.reader
                });
              }, 1500);
              break;

            case 'COLLECT_PAYMENT':
              paymentInProgress = true;
              // Simulate card insertion/tap
              setTimeout(() => {
                self.postMessage({
                  type: 'CARD_DETECTED',
                  data: { method: 'insert' }
                });
              }, 2000);

              // Simulate processing
              setTimeout(() => {
                self.postMessage({
                  type: 'PROCESSING_PAYMENT'
                });
              }, 3000);

              // Simulate completion
              setTimeout(() => {
                paymentInProgress = false;
                self.postMessage({
                  type: 'PAYMENT_SUCCEEDED',
                  data: {
                    id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
                    amount: data.amount,
                    currency: data.currency,
                    status: 'succeeded',
                    charges: {
                      data: [{
                        id: 'ch_test_' + Math.random().toString(36).substr(2, 9),
                        amount: data.amount,
                        paymentMethod: {
                          cardPresent: {
                            brand: 'visa',
                            last4: '4242',
                            expMonth: 12,
                            expYear: 2025,
                            emvAuthData: 'EMV_AUTH_DATA_SAMPLE',
                            receipt: {
                              applicationPreferredName: 'VISA CREDIT',
                              dedicatedFileName: 'A0000000031010'
                            }
                          }
                        }
                      }]
                    }
                  }
                });
              }, 5000);
              break;

            case 'CANCEL_PAYMENT':
              paymentInProgress = false;
              self.postMessage({
                type: 'PAYMENT_CANCELED'
              });
              break;
          }
        };
      ';

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.connectionSimulator = new Worker(URL.createObjectURL(blob));
    }
  }

  // Discover available terminal readers
  async discoverReaders(): Promise<TerminalReader[]> {
    return new Promise((resolve, reject) => {
      if (this.config.testMode && this.connectionSimulator) {
        // Use simulated reader discovery
        this.connectionSimulator.postMessage({ type: 'DISCOVER_READERS' });
        
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'READERS_DISCOVERED') {
            this.connectionSimulator?.removeEventListener('message', handler);
            resolve(event.data.data);
          }
        };
        
        this.connectionSimulator.addEventListener('message', handler);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          this.connectionSimulator?.removeEventListener('message', handler);
          reject(new Error('Reader discovery timeout'));
        }, 10000);
      } else {
        // Real Stripe Terminal SDK would go here
        reject(new Error('Stripe Terminal SDK not available in this environment'));
      }
    });
  }

  // Connect to a specific terminal reader
  async connectReader(readerId: string): Promise<TerminalReader> {
    const readers = await this.discoverReaders();
    const targetReader = readers.find(r => r.id === readerId);
    
    if (!targetReader) {
      throw new Error('Reader ${readerId} not found');
    }

    return new Promise((resolve, reject) => {
      if (this.config.testMode && this.connectionSimulator) {
        this.connectionSimulator.postMessage({ 
          type: 'CONNECT_READER', 
          data: { reader: targetReader } 
        });
        
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'READER_CONNECTED') {
            this.connectionSimulator?.removeEventListener('message', handler);
            this.reader = event.data.data;
            resolve(this.reader);
          }
        };
        
        this.connectionSimulator.addEventListener('message', handler);
        
        setTimeout(() => {
          this.connectionSimulator?.removeEventListener('message', handler);
          reject(new Error('Reader connection timeout'));
        }, 10000);
      } else {
        reject(new Error('Stripe Terminal SDK not available'));
      }
    });
  }

  // Create payment intent for terminal processing
  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntent> {
    if (this.config.testMode) {
      // Simulate payment intent creation
      const paymentIntent: PaymentIntent = {
        id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
        amount: request.amount,
        currency: request.currency,
        status: 'requires_payment_method',
        charges: { data: [] }
      };

      // Store offline if needed
      await paymentSyncManager.queuePayment({
        amount: request.amount,
        currency: request.currency,
        paymentMethod: 'card_present',
        organizationId: request.metadata?.organizationId || ',
        metadata: {
          stripe_payment_intent_id: paymentIntent.id,
          terminal_reader_id: this.reader?.id,
          ...request.metadata
        },
        maxRetries: 3
      });

      return paymentIntent;
    } else {
      // Real Stripe API call would go here
      throw new Error('Live Stripe Terminal processing not implemented');
    }
  }

  // Collect payment using connected terminal
  async collectPayment(paymentIntentId: string): Promise<PaymentIntent> {
    if (!this.reader) {
      throw new Error('No terminal reader connected');
    }

    return new Promise((resolve, reject) => {
      if (this.config.testMode && this.connectionSimulator) {
        // Set up event listeners for payment flow
        const eventHandlers = {
          'CARD_DETECTED': (data: unknown) => {
            console.log('Card detected:', data.method);
            this.onCardDetected?.(data.method);
          },
          'PROCESSING_PAYMENT': () => {
            console.log('Processing payment...');
            this.onProcessingPayment?.();
          },
          'PAYMENT_SUCCEEDED': (data: PaymentIntent) => {
            this.cleanup();
            this.onPaymentSuccess?.(data);
            resolve(data);
          },
          'PAYMENT_CANCELED': () => {
            this.cleanup();
            this.onPaymentCanceled?.();
            reject(new Error('Payment canceled by user'));
          }
        };

        const handler = (event: MessageEvent) => {
          const eventHandler = eventHandlers[event.data.type as keyof typeof eventHandlers];
          if (eventHandler) {
            eventHandler(event.data.data);
          }
        };

        this.connectionSimulator.addEventListener('message', handler);

        // Start payment collection
        this.connectionSimulator.postMessage({
          type: 'COLLECT_PAYMENT',
          data: {
            paymentIntentId,
            amount: 1000, // This would come from the payment intent
            currency: 'usd'
          }
        });

        // Cleanup function
        const cleanup = () => {
          this.connectionSimulator?.removeEventListener('message', handler);
        };

        this.cleanup = cleanup;

        // Timeout after 2 minutes
        setTimeout(() => {
          cleanup();
          reject(new Error('Payment collection timeout'));
        }, 120000);
      } else {
        reject(new Error('Stripe Terminal SDK not available'));
      }
    });
  }

  // Cancel ongoing payment collection
  async cancelPayment(): Promise<void> {
    if (this.connectionSimulator) {
      this.connectionSimulator.postMessage({ type: 'CANCEL_PAYMENT' });
    }
  }

  // Disconnect from terminal reader
  async disconnectReader(): Promise<void> {
    if (this.reader) {
      this.reader = null;
      console.log('Terminal reader disconnected');
    }
  }

  // Process receipt data for printing or display
  generateReceipt(paymentIntent: PaymentIntent): string {
    const charge = paymentIntent.charges.data[0];
    if (!charge?.paymentMethod?.cardPresent) {
      throw new Error('No card present data available');
    }

    const card = charge.paymentMethod.cardPresent;
    const receipt = card.receipt;
    
    return ''
THORBIS BUSINESS OS
Terminal Payment Receipt
------------------------
Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}
Card: ${card.brand.toUpperCase()} **** ${card.last4}
Expires: ${card.expMonth.toString().padStart(2, '0')}/${card.expYear}
${receipt?.applicationPreferredName ? 'App: ${receipt.applicationPreferredName}' : '}
${receipt?.dedicatedFileName ? 'AID: ${receipt.dedicatedFileName}' : '}
Auth: ${charge.id}
------------------------
Thank you for your business!
    '.trim();
  }

  // Event callbacks (can be overridden)
  onCardDetected?: (method: string) => void;
  onProcessingPayment?: () => void;
  onPaymentSuccess?: (paymentIntent: PaymentIntent) => void;
  onPaymentCanceled?: () => void;
  private cleanup?: () => void;

  // Cleanup resources
  destroy() {
    if (this.connectionSimulator) {
      this.connectionSimulator.terminate();
      this.connectionSimulator = null;
    }
    this.reader = null;
  }
}

// Factory function for creating Stripe Terminal processor
export function createStripeTerminalProcessor(config: Partial<StripeTerminalConfig> = {}) {
  const defaultConfig: StripeTerminalConfig = {
    connectionToken: process.env.STRIPE_TERMINAL_CONNECTION_TOKEN || 'test_token',
    locationId: process.env.STRIPE_TERMINAL_LOCATION_ID || 'tml_test_location',
    deviceType: 'simulated_wisepos_e',
    testMode: process.env.NODE_ENV !== 'production'
  };

  return new StripeTerminalProcessor({ ...defaultConfig, ...config });
}

// Helper function to validate EMV chip data
export function validateEMVData(emvData: string): boolean {
  // Basic EMV data validation
  if (!emvData || emvData.length < 10) {
    return false;
  }

  // Check for required EMV tags (simplified)
  const requiredTags = ['9F26', '9F27', '9F10', '9F37'];
  return requiredTags.some(tag => emvData.includes(tag));
}

// Utility function to format card brand
export function formatCardBrand(brand: string): string {
  const brandMap: Record<string, string> = {
    'visa': 'VISA',
    'mastercard': 'MASTERCARD',
    'amex': 'AMERICAN EXPRESS',
    'discover': 'DISCOVER',
    'diners': 'DINERS CLUB',
    'jcb': 'JCB',
    'unionpay': 'UNION PAY'
  };

  return brandMap[brand.toLowerCase()] || brand.toUpperCase();
}