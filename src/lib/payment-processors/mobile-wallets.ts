// Mobile wallet integration for Apple Pay, Google Pay, and Samsung Pay
// Supports contactless payments, in-app payments, and web payments

interface ApplePayConfig {
  merchantId: string;
  merchantCapabilities: Array<'supports3DS' | 'supportsEMV' | 'supportsCredit' | 'supportsDebit'>;
  supportedNetworks: Array<'visa' | 'masterCard' | 'amex' | 'discover'>;
  countryCode: string;
  currencyCode: string;
}

interface GooglePayConfig {
  environment: 'TEST' | 'PRODUCTION';
  merchantId: string;
  gatewayMerchantId: string;
  allowedCardNetworks: Array<'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER'>;
  allowedCardAuthMethods: Array<'PAN_ONLY' | 'CRYPTOGRAM_3DS'>;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  merchantName: string;
  orderNumber?: string;
  metadata?: Record<string, unknown>;
}

interface PaymentResult {
  success: boolean;
  paymentData?: any;
  token?: string;
  error?: string;
  method: 'apple_pay' | 'google_pay' | 'samsung_pay';
}

export class MobileWalletProcessor {
  private applePayConfig: ApplePayConfig;
  private googlePayConfig: GooglePayConfig;
  private isApplePaySupported = false;
  private isGooglePaySupported = false;

  constructor(
    applePayConfig: ApplePayConfig,
    googlePayConfig: GooglePayConfig
  ) {
    this.applePayConfig = applePayConfig;
    this.googlePayConfig = googlePayConfig;
    this.checkWalletSupport();
  }

  // Check which mobile wallets are supported on this device
  private async checkWalletSupport() {
    // Check Apple Pay support
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      this.isApplePaySupported = ApplePaySession.canMakePayments();
    }

    // Check Google Pay support
    if (typeof window !== 'undefined' && window.google?.payments?.api) {
      try {
        const paymentsClient = new google.payments.api.PaymentsClient({
          environment: this.googlePayConfig.environment
        });

        const request = this.createGooglePayRequest(0); // Amount 0 for capability check
        this.isGooglePaySupported = await paymentsClient.isReadyToPay(request);
      } catch (error) {
        console.warn('Google Pay support check failed:', error);
        this.isGooglePaySupported = false;
      }
    }
  }

  // Get supported payment methods for the current device
  getSupportedMethods(): Array<'apple_pay' | 'google_pay' | 'samsung_pay'> {
    const supported: Array<'apple_pay' | 'google_pay' | 'samsung_pay'> = [];
    
    if (this.isApplePaySupported) supported.push('apple_pay');
    if (this.isGooglePaySupported) supported.push('google_pay');
    
    // Samsung Pay detection is more complex and typically requires Samsung Pay SDK
    if (this.isSamsungDevice() && this.isSamsungPaySupported()) {
      supported.push('samsung_pay');
    }

    return supported;
  }

  // Process Apple Pay payment
  async processApplePayPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.isApplePaySupported) {
      return {
        success: false,
        error: 'Apple Pay is not supported on this device',
        method: 'apple_pay'
      };
    }

    try {
      const applePayRequest = {
        countryCode: this.applePayConfig.countryCode,
        currencyCode: this.applePayConfig.currencyCode,
        merchantCapabilities: this.applePayConfig.merchantCapabilities,
        supportedNetworks: this.applePayConfig.supportedNetworks,
        total: {
          label: request.merchantName,
          amount: (request.amount / 100).toFixed(2), // Convert cents to dollars
          type: 'final' as const
        },
        requiredBillingContactFields: ['postalAddress'],
        requiredShippingContactFields: []
      };

      return new Promise((resolve) => {
        const session = new ApplePaySession(3, applePayRequest);

        session.onvalidatemerchant = async (event) => {
          try {
            // In production, this would validate with your server
            const merchantValidation = await this.validateApplePayMerchant(event.validationURL);
            session.completeMerchantValidation(merchantValidation);
          } catch (error) {
            console.error('Apple Pay merchant validation failed:', error);
            session.abort();
            resolve({
              success: false,
              error: 'Merchant validation failed',
              method: 'apple_pay'
            });
          }
        };

        session.onpaymentauthorized = async (event) => {
          try {
            // Process payment with your payment processor
            const result = await this.processApplePayToken(event.payment, request);
            
            if (result.success) {
              session.completePayment(ApplePaySession.STATUS_SUCCESS);
              resolve({
                success: true,
                paymentData: event.payment,
                token: result.token,
                method: 'apple_pay'
              });
            } else {
              session.completePayment(ApplePaySession.STATUS_FAILURE);
              resolve({
                success: false,
                error: result.error || 'Payment processing failed',
                method: 'apple_pay'
              });
            }
          } catch (_error) {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            resolve({
              success: false,
              error: 'Payment processing error',
              method: 'apple_pay'
            });
          }
        };

        session.oncancel = () => {
          resolve({
            success: false,
            error: 'Payment cancelled by user',
            method: 'apple_pay'
          });
        };

        session.begin();
      });
    } catch (_error) {
      return {
        success: false,
        error: 'Apple Pay error: ${error}',
        method: 'apple_pay'
      };
    }
  }

  // Process Google Pay payment
  async processGooglePayPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.isGooglePaySupported) {
      return {
        success: false,
        error: 'Google Pay is not supported on this device',
        method: 'google_pay'
      };
    }

    try {
      const paymentsClient = new google.payments.api.PaymentsClient({
        environment: this.googlePayConfig.environment
      });

      const paymentDataRequest = this.createGooglePayRequest(request.amount);
      paymentDataRequest.transactionInfo = {
        totalPriceStatus: 'FINAL',
        totalPrice: (request.amount / 100).toFixed(2),
        currencyCode: request.currency
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      
      // Process the payment token
      const result = await this.processGooglePayToken(paymentData, request);
      
      return {
        success: result.success,
        paymentData,
        token: result.token,
        error: result.error,
        method: 'google_pay'
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Google Pay error: ${error}',
        method: 'google_pay'
      };
    }
  }

  // Create Google Pay payment request object
  private createGooglePayRequest(amount: number) {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: this.googlePayConfig.allowedCardAuthMethods,
          allowedCardNetworks: this.googlePayConfig.allowedCardNetworks
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'stripe',
            'stripe:version': '2020-08-27',
            'stripe:publishableKey': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '
          }
        }
      }],
      merchantInfo: {
        merchantId: this.googlePayConfig.merchantId,
        merchantName: 'Thorbis Business OS'
      },
      transactionInfo: {
        totalPriceStatus: amount > 0 ? 'FINAL' : 'NOT_CURRENTLY_KNOWN',
        totalPrice: amount > 0 ? (amount / 100).toFixed(2) : '0',
        currencyCode: 'USD'
      }
    };
  }

  // Validate Apple Pay merchant (simplified for demo)
  private async validateApplePayMerchant(validationURL: string): Promise<unknown> {
    // In production, this would be handled by your server
    if (process.env.NODE_ENV === 'development') {
      return {
        merchantSession: 'mock_merchant_session',
        domainName: window.location.hostname,
        displayName: 'Thorbis Business OS'
      };
    }
    
    // Real implementation would post to your server endpoint
    const response = await fetch('/api/payments/apple-pay/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validationURL })
    });
    
    if (!response.ok) {
      throw new Error('Merchant validation failed');
    }
    
    return response.json();
  }

  // Process Apple Pay payment token
  private async processApplePayToken(payment: unknown, request: PaymentRequest): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // In production, send the payment token to your server
      const response = await fetch('/api/payments/apple-pay/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment,
          amount: request.amount,
          currency: request.currency,
          orderNumber: request.orderNumber,
          metadata: request.metadata
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          token: result.token || result.id
        };
      } else {
        return {
          success: false,
          error: 'Payment processing failed'
        };
      }
    } catch (_error) {
      return {
        success: false,
        error: 'Network error during payment processing'
      };
    }
  }

  // Process Google Pay payment token
  private async processGooglePayToken(paymentData: unknown, request: PaymentRequest): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // Extract the payment token from Google Pay response
      const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
      
      // In production, send to your server for processing
      const response = await fetch('/api/payments/google-pay/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: paymentToken,
          amount: request.amount,
          currency: request.currency,
          orderNumber: request.orderNumber,
          metadata: request.metadata
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          token: result.token || result.id
        };
      } else {
        return {
          success: false,
          error: 'Payment processing failed'
        };
      }
    } catch (_error) {
      return {
        success: false,
        error: 'Error processing Google Pay token'
      };
    }
  }

  // Check if device is Samsung
  private isSamsungDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('samsung') || userAgent.includes('sm-');
  }

  // Check Samsung Pay support (simplified)
  private isSamsungPaySupported(): boolean {
    // In a real implementation, this would check for Samsung Pay SDK
    return typeof window !== 'undefined' && 'samsungPay' in window;
  }

  // Show available payment methods to user
  async showPaymentSheet(request: PaymentRequest): Promise<PaymentResult> {
    const supportedMethods = this.getSupportedMethods();
    
    if (supportedMethods.length === 0) {
      return {
        success: false,
        error: 'No mobile payment methods are supported on this device',
        method: 'apple_pay' // Default
      };
    }

    // For demo purposes, prefer Apple Pay if available, then Google Pay
    if (supportedMethods.includes('apple_pay')) {
      return this.processApplePayPayment(request);
    } else if (supportedMethods.includes('google_pay')) {
      return this.processGooglePayPayment(request);
    } else {
      return {
        success: false,
        error: 'No compatible payment method found',
        method: 'apple_pay'
      };
    }
  }

  // Generate payment button HTML for each supported method
  generatePaymentButtons(): string {
    const supportedMethods = this.getSupportedMethods();
    const buttonsHTML = ';

    supportedMethods.forEach(method => {
      switch (method) {
        case 'apple_pay':
          buttonsHTML += '
            <button class="apple-pay-button apple-pay-button-black" 
                    onclick="processApplePayPayment()" 
                    style="width: 100%; height: 48px; margin: 4px 0;">
            </button>
          ';
          break;
        case 'google_pay':
          buttonsHTML += '
            <div id="google-pay-button" 
                 style="width: 100%; height: 48px; margin: 4px 0;">
            </div>
          ';
          break;
        case 'samsung_pay':
          buttonsHTML += '
            <button class="samsung-pay-button" 
                    onclick="processSamsungPayPayment()"
                    style="width: 100%; height: 48px; margin: 4px 0; background: #1428A0; color: white; border: none; border-radius: 4px;">
              Samsung Pay
            </button>
          ';
          break;
      }
    });

    return buttonsHTML;
  }
}

// Factory function for creating mobile wallet processor
export function createMobileWalletProcessor(config: {
  applePay?: Partial<ApplePayConfig>;
  googlePay?: Partial<GooglePayConfig>;
} = {}) {
  const defaultApplePayConfig: ApplePayConfig = {
    merchantId: process.env.APPLE_PAY_MERCHANT_ID || 'merchant.com.thorbis.app',
    merchantCapabilities: ['supports3DS', 'supportsEMV', 'supportsCredit', 'supportsDebit'],
    supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
    countryCode: 'US',
    currencyCode: 'USD'
  };

  const defaultGooglePayConfig: GooglePayConfig = {
    environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
    merchantId: process.env.GOOGLE_PAY_MERCHANT_ID || '1234567890',
    gatewayMerchantId: process.env.STRIPE_PUBLISHABLE_KEY || ',
    allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'],
    allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
  };

  return new MobileWalletProcessor(
    { ...defaultApplePayConfig, ...config.applePay },
    { ...defaultGooglePayConfig, ...config.googlePay }
  );
}

// Utility function to check if mobile payments are available
export function isMobilePaymentAvailable(): boolean {
  // Check for Apple Pay
  if (typeof window !== 'undefined' && window.ApplePaySession) {
    return ApplePaySession.canMakePayments();
  }
  
  // Check for Google Pay
  if (typeof window !== 'undefined' && window.google?.payments?.api) {
    return true;
  }
  
  return false;
}

// Add TypeScript declarations for global objects
declare global {
  interface Window {
    ApplePaySession?: any;
    google?: {
      payments?: {
        api?: any;
      };
    };
    samsungPay?: any;
  }
}