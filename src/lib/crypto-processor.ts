// Cryptocurrency payment processing
// Supports Bitcoin, Ethereum, stablecoins, and other digital currencies

import { paymentTokenizer } from '../payment-tokenization';
import { paymentSyncManager } from '../payment-sync-manager';

interface CryptoConfig {
  supportedCurrencies: string[];
  walletProvider: 'coinbase_commerce' | 'bitpay' | 'custom';
  confirmationRequirements: Record<string, number>;
  testMode: boolean;
  webhookSecret?: string;
}

interface CryptoPaymentRequest {
  amount: number;
  currency: string; // Fiat currency (USD, EUR, etc.)
  cryptocurrency: string; // BTC, ETH, USDC, etc.
  recipientAddress?: string;
  description: string;
  metadata?: Record<string, unknown>;
  expirationMinutes?: number;
}

interface CryptoPaymentResult {
  id: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed' | 'expired';
  amount: number;
  currency: string;
  cryptoAmount: number;
  cryptocurrency: string;
  exchangeRate: number;
  recipientAddress: string;
  paymentAddress: string;
  qrCode: string;
  confirmations: number;
  requiredConfirmations: number;
  transactionHash?: string;
  blockHeight?: number;
  expiresAt: Date;
  fees: {
    network: number;
    processing: number;
    total: number;
  };
}

interface ExchangeRate {
  currency: string;
  cryptocurrency: string;
  rate: number;
  timestamp: Date;
  source: string;
}

interface CryptoWallet {
  address: string;
  currency: string;
  balance: number;
  network: string;
  isTestnet: boolean;
}

export class CryptoProcessor {
  private config: CryptoConfig;
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private walletGenerator: WalletGenerator;

  constructor(config: CryptoConfig) {
    this.config = config;
    this.walletGenerator = new WalletGenerator(config.testMode);
    this.startExchangeRateUpdates();
  }

  // Get current exchange rate for cryptocurrency
  async getExchangeRate(cryptocurrency: string, fiatCurrency: string): Promise<ExchangeRate> {
    const cacheKey = '${cryptocurrency}_${fiatCurrency}';
    const cached = this.exchangeRates.get(cacheKey);

    // Return cached rate if less than 5 minutes old
    if (cached && Date.now() - cached.timestamp.getTime() < 5 * 60 * 1000) {
      return cached;
    }

    try {
      // Fetch from multiple sources for accuracy
      const rates = await Promise.allSettled([
        this.fetchRateFromCoinbase(cryptocurrency, fiatCurrency),
        this.fetchRateFromCoinGecko(cryptocurrency, fiatCurrency),
        this.fetchRateFromBinance(cryptocurrency, fiatCurrency)
      ]);

      const validRates = rates
        .filter(result => result.status === 'fulfilled`)
        .map(result => (result as any).value)
        .filter(rate => rate && rate.rate > 0);

      if (validRates.length === 0) {
        throw new Error(`No valid exchange rate found for ${cryptocurrency}/${fiatCurrency}');
      }

      // Use median rate for stability
      const sortedRates = validRates.sort((a, b) => a.rate - b.rate);
      const medianRate = sortedRates[Math.floor(sortedRates.length / 2)];

      this.exchangeRates.set(cacheKey, medianRate);
      return medianRate;
    } catch (error) {
      // Fallback to cached rate if available
      if (cached) {
        console.warn('Using stale exchange rate for ${cryptocurrency}/${fiatCurrency}:', error);
        return cached;
      }
      throw error;
    }
  }

  // Create cryptocurrency payment
  async createCryptoPayment(request: CryptoPaymentRequest): Promise<CryptoPaymentResult> {
    // Get current exchange rate
    const exchangeRate = await this.getExchangeRate(request.cryptocurrency, request.currency);
    
    // Calculate crypto amount including fees
    const networkFee = this.calculateNetworkFee(request.cryptocurrency);
    const processingFee = this.calculateProcessingFee(request.amount);
    const totalFees = networkFee + processingFee;
    
    // Convert fiat to crypto
    const cryptoAmount = (request.amount + totalFees) / exchangeRate.rate;
    
    // Generate payment address
    const paymentAddress = await this.generatePaymentAddress(request.cryptocurrency);
    
    // Generate QR code for payment
    const qrCode = await this.generateQRCode(request.cryptocurrency, paymentAddress, cryptoAmount);
    
    const expirationTime = request.expirationMinutes || 30;
    const expiresAt = new Date(Date.now() + expirationTime * 60 * 1000);
    
    const paymentId = this.generateCryptoPaymentId();
    
    const result: CryptoPaymentResult = {
      id: paymentId,
      status: 'pending',
      amount: request.amount,
      currency: request.currency,
      cryptoAmount,
      cryptocurrency: request.cryptocurrency,
      exchangeRate: exchangeRate.rate,
      recipientAddress: request.recipientAddress || await this.getMerchantAddress(request.cryptocurrency),
      paymentAddress,
      qrCode,
      confirmations: 0,
      requiredConfirmations: this.config.confirmationRequirements[request.cryptocurrency] || 6,
      expiresAt,
      fees: {
        network: networkFee,
        processing: processingFee,
        total: totalFees
      }
    };

    // Store payment for monitoring
    await this.storePaymentForMonitoring(result, request);
    
    // Queue for offline processing if needed
    await paymentSyncManager.queuePayment({
      amount: request.amount,
      currency: request.currency,
      paymentMethod: 'crypto',
      organizationId: request.metadata?.organizationId || ',
      metadata: {
        crypto_payment_id: paymentId,
        cryptocurrency: request.cryptocurrency,
        crypto_amount: cryptoAmount,
        payment_address: paymentAddress,
        exchange_rate: exchangeRate.rate,
        expires_at: expiresAt.toISOString(),
        ...request.metadata
      },
      maxRetries: 1 // Crypto payments don't retry well
    });

    return result;
  }

  // Monitor cryptocurrency payment status
  async checkPaymentStatus(paymentId: string): Promise<CryptoPaymentResult> {
    // In production, this would query the blockchain
    const payment = await this.getStoredPayment(paymentId);
    if (!payment) {
      throw new Error('Payment ${paymentId} not found');
    }

    if (this.config.testMode) {
      // Simulate payment confirmation process
      const now = new Date();
      const timeSinceCreation = now.getTime() - new Date(payment.createdAt).getTime();
      
      if (now > payment.expiresAt) {
        payment.status = 'expired';
      } else if (timeSinceCreation > 60000) { // 1 minute in test mode
        payment.status = 'confirmed';
        payment.confirmations = payment.requiredConfirmations;
        payment.transactionHash = this.generateMockTransactionHash(payment.cryptocurrency);
        payment.blockHeight = Math.floor(Math.random() * 1000000) + 800000;
      } else if (timeSinceCreation > 30000) { // 30 seconds
        payment.status = 'processing';
        payment.confirmations = Math.min(
          payment.requiredConfirmations - 1,
          Math.floor(timeSinceCreation / 10000)
        );
        payment.transactionHash = this.generateMockTransactionHash(payment.cryptocurrency);
      }
    } else {
      // Real blockchain monitoring would go here
      const blockchainStatus = await this.queryBlockchain(payment.paymentAddress, payment.cryptocurrency);
      payment.status = blockchainStatus.status;
      payment.confirmations = blockchainStatus.confirmations;
      payment.transactionHash = blockchainStatus.transactionHash;
      payment.blockHeight = blockchainStatus.blockHeight;
    }

    // Update stored payment
    await this.updateStoredPayment(payment);
    
    return payment;
  }

  // Get supported cryptocurrencies with current rates
  async getSupportedCurrencies(): Promise<Array<{
    symbol: string;
    name: string;
    network: string;
    minAmount: number;
    maxAmount: number;
    confirmations: number;
    currentRate?: number;
  }>> {
    const supportedCurrencies = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        network: 'bitcoin',
        minAmount: 0.0001,
        maxAmount: 100,
        confirmations: this.config.confirmationRequirements.BTC || 6
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        network: 'ethereum',
        minAmount: 0.001,
        maxAmount: 1000,
        confirmations: this.config.confirmationRequirements.ETH || 12
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        network: 'ethereum',
        minAmount: 1,
        maxAmount: 100000,
        confirmations: this.config.confirmationRequirements.USDC || 12
      },
      {
        symbol: 'LTC',
        name: 'Litecoin',
        network: 'litecoin',
        minAmount: 0.01,
        maxAmount: 1000,
        confirmations: this.config.confirmationRequirements.LTC || 6
      },
      {
        symbol: 'BCH',
        name: 'Bitcoin Cash',
        network: 'bitcoin_cash',
        minAmount: 0.001,
        maxAmount: 1000,
        confirmations: this.config.confirmationRequirements.BCH || 6
      }
    ].filter(currency => this.config.supportedCurrencies.includes(currency.symbol));

    // Add current rates
    for (const currency of supportedCurrencies) {
      try {
        const rate = await this.getExchangeRate(currency.symbol, 'USD`);
        (currency as any).currentRate = rate.rate;
      } catch (error) {
        console.warn(`Failed to get rate for ${currency.symbol}:', error);
      }
    }

    return supportedCurrencies;
  }

  // Generate cryptocurrency wallet address
  private async generatePaymentAddress(cryptocurrency: string): Promise<string> {
    return this.walletGenerator.generateAddress(cryptocurrency);
  }

  // Generate QR code for payment
  private async generateQRCode(cryptocurrency: string, address: string, amount: number): Promise<string> {
    // Create payment URI
    const uri = this.createPaymentURI(cryptocurrency, address, amount);
    
    // In production, this would generate an actual QR code image
    // For now, return the payment URI as base64 encoded SVG
    const qrSvg = this.generateQRCodeSVG(uri);
    return 'data:image/svg+xml;base64,${btoa(qrSvg)}';
  }

  // Create payment URI for QR code
  private createPaymentURI(cryptocurrency: string, address: string, amount: number): string {
    const schemes = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'LTC': 'litecoin',
      'BCH': 'bitcoincash',
      'USDC': 'ethereum' // USDC uses Ethereum addresses
    };

    const scheme = schemes[cryptocurrency as keyof typeof schemes] || cryptocurrency.toLowerCase();
    return '${scheme}:${address}?amount=${amount}';
  }

  // Generate mock QR code SVG (in production, use proper QR code library)
  private generateQRCodeSVG(data: string): string {
    return ''
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="20" height="20" fill="black"/>
        <rect x="50" y="50" width="100" height="100" fill="black"/>
        <text x="100" y="190" text-anchor="middle" font-size="8" fill="black">${data.substring(0, 30)}...</text>
      </svg>
    ';
  }

  // Fetch exchange rate from Coinbase
  private async fetchRateFromCoinbase(crypto: string, fiat: string): Promise<ExchangeRate> {
    // Simulate API call in test mode
    if (this.config.testMode) {
      const mockRates = {
        'BTC_USD': 45000,
        'ETH_USD': 3000,
        'USDC_USD': 1,
        'LTC_USD': 150,
        'BCH_USD': 300
      };

      const rate = mockRates['${crypto}_${fiat}' as keyof typeof mockRates] || 1;
      return {
        currency: fiat,
        cryptocurrency: crypto,
        rate,
        timestamp: new Date(),
        source: 'coinbase'
      };
    }

    // Real Coinbase API call would go here
    throw new Error('Live Coinbase API not implemented');
  }

  // Fetch exchange rate from CoinGecko
  private async fetchRateFromCoinGecko(crypto: string, fiat: string): Promise<ExchangeRate> {
    if (this.config.testMode) {
      const mockRates = {
        'BTC_USD': 45200,
        'ETH_USD': 3020,
        'USDC_USD': 0.999,
        'LTC_USD': 152,
        'BCH_USD': 298
      };

      const rate = mockRates['${crypto}_${fiat}' as keyof typeof mockRates] || 1;
      return {
        currency: fiat,
        cryptocurrency: crypto,
        rate,
        timestamp: new Date(),
        source: 'coingecko'
      };
    }

    throw new Error('Live CoinGecko API not implemented');
  }

  // Fetch exchange rate from Binance
  private async fetchRateFromBinance(crypto: string, fiat: string): Promise<ExchangeRate> {
    if (this.config.testMode) {
      const mockRates = {
        'BTC_USD': 44950,
        'ETH_USD': 2985,
        'USDC_USD': 1.001,
        'LTC_USD': 148,
        'BCH_USD': 302
      };

      const rate = mockRates['${crypto}_${fiat}' as keyof typeof mockRates] || 1;
      return {
        currency: fiat,
        cryptocurrency: crypto,
        rate,
        timestamp: new Date(),
        source: 'binance'
      };
    }

    throw new Error('Live Binance API not implemented');
  }

  // Calculate network fee for cryptocurrency transaction
  private calculateNetworkFee(cryptocurrency: string): number {
    const fees = {
      'BTC': 5, // $5 typical BTC fee
      'ETH': 15, // $15 typical ETH fee
      'USDC': 15, // Same as ETH since it's an ERC-20 token
      'LTC': 0.25, // $0.25 typical LTC fee
      'BCH': 0.10 // $0.10 typical BCH fee
    };

    return fees[cryptocurrency as keyof typeof fees] || 1;
  }

  // Calculate processing fee (percentage-based)
  private calculateProcessingFee(amount: number): number {
    // 1% processing fee, minimum $1, maximum $50
    const fee = amount * 0.01;
    return Math.max(1, Math.min(50, fee));
  }

  // Get merchant wallet address for cryptocurrency
  private async getMerchantAddress(cryptocurrency: string): Promise<string> {
    // In production, this would return actual merchant wallet addresses
    const testAddresses = {
      'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      'ETH': '0x742d35Cc6634C0532925a3b8D8Cc4d26e1Dcaed5',
      'USDC': '0x742d35Cc6634C0532925a3b8D8Cc4d26e1Dcaed5',
      'LTC': 'LQTpS3VaYHTQWFAhxPJ5JUaCvD1Ui8RsV8',
      'BCH': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    };

    return testAddresses[cryptocurrency as keyof typeof testAddresses] || 'unknown`;
  }

  // Store payment for monitoring (simplified)
  private async storePaymentForMonitoring(payment: CryptoPaymentResult, request: CryptoPaymentRequest): Promise<void> {
    // In production, this would store in database
    const paymentData = {
      ...payment,
      originalRequest: request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in localStorage for demo
    localStorage.setItem(`crypto_payment_${payment.id}`, JSON.stringify(paymentData));
  }

  // Get stored payment
  private async getStoredPayment(paymentId: string): Promise<CryptoPaymentResult | null> {
    const stored = localStorage.getItem(`crypto_payment_${paymentId}');
    return stored ? JSON.parse(stored) : null;
  }

  // Update stored payment
  private async updateStoredPayment(payment: CryptoPaymentResult): Promise<void> {
    const existing = await this.getStoredPayment(payment.id);
    if (existing) {
      const updated = {
        ...existing,
        ...payment,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('crypto_payment_${payment.id}', JSON.stringify(updated));
    }
  }

  // Query blockchain for transaction status (mock)
  private async queryBlockchain(address: string, cryptocurrency: string): Promise<{
    status: 'pending' | 'processing' | 'confirmed' | 'failed';
    confirmations: number;
    transactionHash?: string;
    blockHeight?: number;
  }> {
    // In production, this would query actual blockchain explorers or nodes
    return {
      status: 'pending',
      confirmations: 0
    };
  }

  // Generate mock transaction hash
  private generateMockTransactionHash(cryptocurrency: string): string {
    const prefixes = {
      'BTC': '00000000',
      'ETH': '0x',
      'LTC': '00000000',
      'BCH': '00000000',
      'USDC': '0x'
    };

    const prefix = prefixes[cryptocurrency as keyof typeof prefixes] || '0x';
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(');
    
    return prefix + hash;
  }

  // Generate crypto payment ID
  private generateCryptoPaymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return 'crypto_${timestamp}_${random}';
  }

  // Start periodic exchange rate updates
  private startExchangeRateUpdates(): void {
    // Update rates every 5 minutes
    setInterval(() => {
      this.updateAllExchangeRates();
    }, 5 * 60 * 1000);
  }

  // Update all cached exchange rates
  private async updateAllExchangeRates(): Promise<void> {
    const currencies = this.config.supportedCurrencies;
    const fiatCurrencies = ['USD', 'EUR', 'GBP'];

    for (const crypto of currencies) {
      for (const fiat of fiatCurrencies) {
        try {
          await this.getExchangeRate(crypto, fiat);
        } catch (error) {
          console.warn('Failed to update ${crypto}/${fiat} rate:', error);
        }
      }
    }
  }
}

// Wallet address generator
class WalletGenerator {
  private testMode: boolean;

  constructor(testMode: boolean) {
    this.testMode = testMode;
  }

  // Generate cryptocurrency address
  async generateAddress(cryptocurrency: string): Promise<string> {
    if (this.testMode) {
      // Generate test addresses
      const patterns = {
        'BTC': () => '1' + this.generateRandomString(33, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'),
        'ETH': () => '0x' + this.generateRandomString(40, '0123456789abcdef'),
        'USDC': () => '0x' + this.generateRandomString(40, '0123456789abcdef'),
        'LTC': () => 'L' + this.generateRandomString(33, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'),
        'BCH': () => 'q' + this.generateRandomString(41, '023456789acdefghjklmnpqrstuvwxyz')
      };

      const generator = patterns[cryptocurrency as keyof typeof patterns];
      return generator ? generator() : this.generateRandomString(34, '0123456789abcdefghijklmnopqrstuvwxyz');
    }

    // In production, this would generate real addresses using crypto libraries
    throw new Error('Live address generation not implemented');
  }

  private generateRandomString(length: number, charset: string): string {
    let result = ';
    for (const i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
}

// Factory function for creating crypto processor
export function createCryptoProcessor(config: Partial<CryptoConfig> = {}) {
  const defaultConfig: CryptoConfig = {
    supportedCurrencies: ['BTC', 'ETH', 'USDC', 'LTC'],
    walletProvider: 'coinbase_commerce',
    confirmationRequirements: {
      'BTC': 6,
      'ETH': 12,
      'USDC': 12,
      'LTC': 6,
      'BCH': 6
    },
    testMode: process.env.NODE_ENV !== 'production',
    webhookSecret: process.env.CRYPTO_WEBHOOK_SECRET
  };

  return new CryptoProcessor({ ...defaultConfig, ...config });
}

// Utility function to validate cryptocurrency address
export function validateCryptoAddress(address: string, cryptocurrency: string): boolean {
  const patterns = {
    'BTC': /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    'ETH': /^0x[a-fA-F0-9]{40}$/,
    'USDC': /^0x[a-fA-F0-9]{40}$/,
    'LTC': /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
    'BCH': /^[13qp][a-km-zA-HJ-NP-Z1-9ac-hj-np-z]{25,62}$/
  };

  const pattern = patterns[cryptocurrency as keyof typeof patterns];
  return pattern ? pattern.test(address) : false;
}