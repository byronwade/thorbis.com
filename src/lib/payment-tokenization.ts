// Secure payment method tokenization for offline storage
// Implements PCI DSS compliant tokenization with AES-GCM encryption

import { offlineManager } from './offline-utils';

interface PaymentMethodData {
  type: 'card' | 'bank_account' | 'mobile_wallet' | 'crypto_wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  // Bank account specific
  routingNumber?: string;
  accountType?: 'checking' | 'savings';
  // Mobile wallet specific
  walletType?: 'apple_pay' | 'google_pay' | 'samsung_pay';
  deviceId?: string;
  // Crypto specific
  walletAddress?: string;
  cryptocurrency?: string;
}

interface TokenizedPaymentMethod {
  token: string;
  type: PaymentMethodData['type'];
  maskedData: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    holderName?: string;
    accountType?: string;
    walletType?: string;
    cryptocurrency?: string;
  };
  metadata: {
    organizationId: string;
    customerId?: string;
    createdAt: Date;
    lastUsed?: Date;
    usageCount: number;
    isDefault: boolean;
    nickname?: string;
    tags?: string[];
  };
  expiresAt?: Date;
  isActive: boolean;
}

interface TokenizationConfig {
  encryptionKey?: string;
  tokenPrefix: string;
  tokenLength: number;
  expirationDays?: number;
  maxUsageCount?: number;
  requireBiometric?: boolean;
  autoCleanup: boolean;
}

interface PaymentToken {
  id: string;
  type: 'card' | 'bank_account' | 'check' | 'crypto_wallet';
  token: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  holderName?: string;
  createdAt: string;
  organizationId: string;
  customerId?: string;
  metadata?: Record<string, unknown>;
}

interface TokenizationRequest {
  type: 'card' | 'bank_account' | 'check' | 'crypto_wallet';
  sensitiveData: CardData | BankAccountData | CheckData | CryptoWalletData;
  organizationId: string;
  customerId?: string;
  metadata?: Record<string, unknown>;
}

interface CardData {
  number: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  holderName: string;
}

interface BankAccountData {
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  holderName: string;
}

interface CheckData {
  routingNumber: string;
  accountNumber: string;
  checkNumber: string;
  amount?: number;
  memo?: string;
  holderName?: string;
}

interface CryptoWalletData {
  address: string;
  currency: string;
  network?: string;
}

interface DetokenizationRequest {
  tokenId: string;
  organizationId: string;
  purpose: 'payment_processing' | 'verification' | 'audit';
}

export class PaymentTokenizationService {
  private static instance: PaymentTokenizationService | null = null;
  private config: TokenizationConfig;
  private encryptionKey: CryptoKey | null = null;
  private tokenStore: Map<string, TokenizedPaymentMethod> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private initialized = false;
  
  private readonly STORAGE_KEY = 'tokenized_payment_methods';
  private readonly KEY_STORAGE_KEY = 'tokenization_master_key';
  private readonly STATS_STORAGE_KEY = 'tokenization_stats';
  private readonly DEFAULT_TOKEN_LENGTH = 32;
  private readonly DEFAULT_EXPIRATION_DAYS = 365;

  private constructor(config?: Partial<TokenizationConfig>) {
    this.config = {
      tokenPrefix: 'pm_tok_',
      tokenLength: this.DEFAULT_TOKEN_LENGTH,
      expirationDays: this.DEFAULT_EXPIRATION_DAYS,
      maxUsageCount: 1000,
      requireBiometric: false,
      autoCleanup: true,
      ...config
    };

    this.initialize();
  }

  static getInstance(config?: Partial<TokenizationConfig>): PaymentTokenizationService {
    if (!PaymentTokenizationService.instance) {
      PaymentTokenizationService.instance = new PaymentTokenizationService(config);
    }
    return PaymentTokenizationService.instance;
  }

  // Initialize the tokenization service
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.initializeEncryption();
      await this.loadFromStorage();
      
      if (this.config.autoCleanup) {
        this.scheduleCleanup();
      }

      this.initialized = true;
      this.emit('service_initialized');
    } catch (error) {
      console.error('Failed to initialize tokenization service:', error);
      throw new Error('Tokenization service initialization failed');
    }
  }

  // Initialize encryption system
  private async initializeEncryption(): Promise<void> {
    try {
      // Try to load existing key
      const storedKey = localStorage.getItem(this.KEY_STORAGE_KEY);
      
      if (storedKey) {
        // Import existing key
        const keyData = JSON.parse(storedKey);
        this.encryptionKey = await crypto.subtle.importKey(
          'jwk',
          keyData,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      } else {
        // Generate new key
        this.encryptionKey = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );

        // Export and store key
        const exportedKey = await crypto.subtle.exportKey('jwk', this.encryptionKey);
        localStorage.setItem(this.KEY_STORAGE_KEY, JSON.stringify(exportedKey));
      }
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  async tokenize(request: TokenizationRequest): Promise<PaymentToken> {
    await this.initialize();

    const tokenId = this.generateTokenId();
    const token = await this.generateSecureToken();
    
    // Extract non-sensitive data for token
    const { last4, expiryMonth, expiryYear, brand, holderName } = this.extractPublicData(request);

    // Encrypt sensitive data
    const encryptedData = await this.encryptSensitiveData(request.sensitiveData);

    // Store encrypted data in secure offline storage
    await this.storeEncryptedData(tokenId, encryptedData, request.organizationId);

    const paymentToken: PaymentToken = {
      id: tokenId,
      type: request.type,
      token,
      last4,
      expiryMonth,
      expiryYear,
      brand,
      holderName,
      createdAt: new Date().toISOString(),
      organizationId: request.organizationId,
      customerId: request.customerId,
      metadata: request.metadata
    };

    // Store token metadata (non-sensitive)
    await offlineManager.storeOfflineData('payment_tokens', paymentToken);

    return paymentToken;
  }

  async detokenize(request: DetokenizationRequest): Promise<unknown> {
    await this.initialize();

    // Audit the detokenization request
    await this.auditDetokenization(request);

    // Retrieve encrypted data
    const encryptedData = await this.getEncryptedData(request.tokenId, request.organizationId);
    
    if (!encryptedData) {
      throw new Error('Token not found or access denied');
    }

    // Decrypt sensitive data
    const sensitiveData = await this.decryptSensitiveData(encryptedData);

    return sensitiveData;
  }

  async getToken(tokenId: string, organizationId: string): Promise<PaymentToken | null> {
    const tokens = await offlineManager.getOfflineData('payment_tokens', {
      id: tokenId,
      organizationId
    });

    return tokens.length > 0 ? tokens[0] as PaymentToken : null;
  }

  async listTokens(organizationId: string, customerId?: string): Promise<PaymentToken[]> {
    const filters: unknown = { organizationId };
    if (customerId) {
      filters.customerId = customerId;
    }

    const tokens = await offlineManager.getOfflineData('payment_tokens', filters);
    return tokens as PaymentToken[];
  }

  async revokeToken(tokenId: string, organizationId: string): Promise<void> {
    // Mark token as revoked
    const token = await this.getToken(tokenId, organizationId);
    if (token) {
      token.metadata = {
        ...token.metadata,
        revoked: true,
        revokedAt: new Date().toISOString()
      };

      await offlineManager.storeOfflineData('payment_tokens', token);
    }

    // Remove encrypted data
    await this.removeEncryptedData(tokenId, organizationId);

    // Audit the revocation
    await this.auditTokenRevocation(tokenId, organizationId);
  }

  private async getOrCreateEncryptionKey(): Promise<CryptoKey> {
    // In a real implementation, this would use a secure key management service
    // For offline operation, we'll use IndexedDB with additional security measures
    
    const keyData = localStorage.getItem('thorbis_token_key');
    
    if (keyData) {
      try {
        const keyBuffer = this.base64ToArrayBuffer(keyData);
        return await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      } catch (error) {
        console.warn('Failed to import existing key, generating new one');
      }
    }

    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Export and store key (in production, use secure key storage)
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    localStorage.setItem('thorbis_token_key', this.arrayBufferToBase64(exportedKey));

    return key;
  }

  private generateTokenId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return 'tok_${timestamp}_${random}';
  }

  private async generateSecureToken(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array.buffer);
  }

  private extractPublicData(request: TokenizationRequest): {
    last4: string;
    expiryMonth?: number;
    expiryYear?: number;
    brand?: string;
    holderName?: string;
  } {
    switch (request.type) {
      case 'card':
        const cardData = request.sensitiveData as CardData;
        return {
          last4: cardData.number.slice(-4),
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          brand: this.detectCardBrand(cardData.number),
          holderName: cardData.holderName
        };
      
      case 'bank_account':
      case 'check':
        const bankData = request.sensitiveData as BankAccountData | CheckData;
        return {
          last4: bankData.accountNumber.slice(-4),
          holderName: bankData.holderName
        };
      
      case 'crypto_wallet':
        const cryptoData = request.sensitiveData as CryptoWalletData;
        return {
          last4: cryptoData.address.slice(-4)
        };
      
      default:
        return { last4: '****' };
    }
  }

  private detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/[^\w\s-]/g, '');
    
    if (number.match(/^4/)) return 'visa';
    if (number.match(/^5[1-5]/)) return 'mastercard';
    if (number.match(/^3[47]/)) return 'amex';
    if (number.match(/^6/)) return 'discover';
    
    return 'unknown';
  }

  private async encryptSensitiveData(data: unknown): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const jsonData = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonData);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  private async decryptSensitiveData(encryptedData: string): Promise<unknown> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const combined = this.base64ToArrayBuffer(encryptedData);
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encrypted
    );

    const decoder = new TextDecoder();
    const jsonData = decoder.decode(decrypted);
    
    return JSON.parse(jsonData);
  }

  private async storeEncryptedData(tokenId: string, encryptedData: string, organizationId: string): Promise<void> {
    const storageKey = 'encrypted_${tokenId}';
    await offlineManager.storeOfflineData('encrypted_payment_data', {
      id: storageKey,
      tokenId,
      organizationId,
      encryptedData,
      createdAt: new Date().toISOString()
    });
  }

  private async getEncryptedData(tokenId: string, organizationId: string): Promise<string | null> {
    const storageKey = 'encrypted_${tokenId}';
    const results = await offlineManager.getOfflineData('encrypted_payment_data', {
      id: storageKey,
      organizationId
    });

    return results.length > 0 ? results[0].encryptedData : null;
  }

  private async removeEncryptedData(tokenId: string, organizationId: string): Promise<void> {
    // Mark as deleted rather than actually removing for audit purposes
    const storageKey = 'encrypted_${tokenId}';
    await offlineManager.storeOfflineData('encrypted_payment_data', {
      id: storageKey,
      tokenId,
      organizationId,
      deleted: true,
      deletedAt: new Date().toISOString()
    });
  }

  private async auditDetokenization(request: DetokenizationRequest): Promise<void> {
    await offlineManager.storeOfflineData('tokenization_audit', {
      id: 'audit_${Date.now()}_${Math.random().toString(36)}',
      action: 'detokenize',
      tokenId: request.tokenId,
      organizationId: request.organizationId,
      purpose: request.purpose,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'offline' // In online mode, would capture real IP
    });
  }

  private async auditTokenRevocation(tokenId: string, organizationId: string): Promise<void> {
    await offlineManager.storeOfflineData('tokenization_audit', {
      id: 'audit_${Date.now()}_${Math.random().toString(36)}',
      action: 'revoke',
      tokenId,
      organizationId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'offline'
    });
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    
    return buffer;
  }

  // Enhanced tokenization methods with full TokenizedPaymentMethod support

  // Create a new tokenized payment method
  async tokenizePaymentMethod(data: PaymentMethodData, organizationId: string, customerId?: string): Promise<TokenizedPaymentMethod> {
    await this.initialize();

    const token = this.generateToken();
    const maskedData = this.createMaskedData(data);
    
    // Encrypt sensitive data
    const encryptedData = await this.encryptPaymentData(data);
    
    const tokenizedMethod: TokenizedPaymentMethod = {
      token,
      type: data.type,
      maskedData,
      metadata: {
        organizationId,
        customerId,
        createdAt: new Date(),
        usageCount: 0,
        isDefault: false
      },
      expiresAt: this.config.expirationDays ? 
        new Date(Date.now() + this.config.expirationDays * 24 * 60 * 60 * 1000) : 
        undefined,
      isActive: true
    };

    // Store encrypted data separately
    await this.storeEncryptedPaymentData(token, encryptedData);
    
    // Store tokenized method metadata
    this.tokenStore.set(token, tokenizedMethod);
    await this.persistTokenStore();
    
    this.emit('payment_method_tokenized', { token, type: data.type, organizationId });
    await this.updateStatistics('tokenized');
    
    return tokenizedMethod;
  }

  // Retrieve and decrypt payment method data
  async detokenizePaymentMethod(token: string, organizationId: string, purpose: string = 'payment_processing'): Promise<PaymentMethodData> {
    await this.initialize();

    const tokenizedMethod = this.tokenStore.get(token);
    if (!tokenizedMethod) {
      throw new Error('Token not found');
    }

    if (tokenizedMethod.metadata.organizationId !== organizationId) {
      throw new Error('Access denied: organization mismatch');
    }

    if (!tokenizedMethod.isActive) {
      throw new Error('Token is inactive');
    }

    if (tokenizedMethod.expiresAt && tokenizedMethod.expiresAt < new Date()) {
      throw new Error('Token has expired');
    }

    if (this.config.maxUsageCount && tokenizedMethod.metadata.usageCount >= this.config.maxUsageCount) {
      throw new Error('Token usage limit exceeded');
    }

    // Decrypt sensitive data
    const paymentData = await this.getDecryptedPaymentData(token);
    
    // Update usage tracking
    tokenizedMethod.metadata.usageCount++;
    tokenizedMethod.metadata.lastUsed = new Date();
    await this.persistTokenStore();
    
    // Audit the detokenization
    await this.auditTokenUsage(token, organizationId, purpose);
    await this.updateStatistics('detokenized');
    
    this.emit('payment_method_detokenized', { token, purpose, organizationId });
    
    return paymentData;
  }

  // List all tokenized payment methods for an organization
  async listTokenizedPaymentMethods(organizationId: string, customerId?: string): Promise<TokenizedPaymentMethod[]> {
    await this.initialize();

    return Array.from(this.tokenStore.values())
      .filter(method => {
        if (method.metadata.organizationId !== organizationId) return false;
        if (customerId && method.metadata.customerId !== customerId) return false;
        return method.isActive;
      })
      .sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());
  }

  // Update payment method metadata
  async updateTokenMetadata(token: string, organizationId: string, updates: Partial<TokenizedPaymentMethod['metadata']>): Promise<void> {
    await this.initialize();

    const tokenizedMethod = this.tokenStore.get(token);
    if (!tokenizedMethod || tokenizedMethod.metadata.organizationId !== organizationId) {
      throw new Error('Token not found or access denied');
    }

    // Merge updates with existing metadata
    tokenizedMethod.metadata = {
      ...tokenizedMethod.metadata,
      ...updates
    };

    await this.persistTokenStore();
    this.emit('token_metadata_updated', { token, updates, organizationId });
  }

  // Deactivate a token (soft delete)
  async deactivateToken(token: string, organizationId: string): Promise<void> {
    await this.initialize();

    const tokenizedMethod = this.tokenStore.get(token);
    if (!tokenizedMethod || tokenizedMethod.metadata.organizationId !== organizationId) {
      throw new Error('Token not found or access denied');
    }

    tokenizedMethod.isActive = false;
    await this.persistTokenStore();
    
    this.emit('token_deactivated', { token, organizationId });
    await this.updateStatistics('deactivated');
  }

  // Get tokenization statistics
  async getStatistics(organizationId?: string): Promise<{
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
    usageStats: Record<string, number>;
    typeDistribution: Record<string, number>;
  }> {
    await this.initialize();

    const methods = organizationId 
      ? Array.from(this.tokenStore.values()).filter(m => m.metadata.organizationId === organizationId)
      : Array.from(this.tokenStore.values());

    const now = new Date();
    const activeTokens = methods.filter(m => m.isActive).length;
    const expiredTokens = methods.filter(m => m.expiresAt && m.expiresAt < now).length;
    
    const typeDistribution = methods.reduce((dist, method) => {
      dist[method.type] = (dist[method.type] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    // Load usage statistics
    const storedStats = localStorage.getItem(this.STATS_STORAGE_KEY);
    const usageStats = storedStats ? JSON.parse(storedStats) : Record<string, unknown>;

    return {
      totalTokens: methods.length,
      activeTokens,
      expiredTokens,
      usageStats,
      typeDistribution
    };
  }

  // Cleanup expired and inactive tokens
  async cleanupExpiredTokens(): Promise<number> {
    await this.initialize();

    const now = new Date();
    const removedCount = 0;

    for (const [token, method] of this.tokenStore) {
      const shouldRemove = 
        (!method.isActive) ||
        (method.expiresAt && method.expiresAt < now) ||
        (this.config.maxUsageCount && method.metadata.usageCount >= this.config.maxUsageCount);

      if (shouldRemove) {
        this.tokenStore.delete(token);
        await this.removeEncryptedPaymentData(token);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      await this.persistTokenStore();
      this.emit('tokens_cleaned_up', { removedCount });
    }

    return removedCount;
  }

  // Private helper methods

  private generateToken(): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomString = Array.from(randomBytes)
      .map(byte => byte.toString(36))
      .join(');
    
    return '${this.config.tokenPrefix}${timestamp}_${randomString}';
  }

  private createMaskedData(data: PaymentMethodData): TokenizedPaymentMethod['maskedData'] {
    const masked: TokenizedPaymentMethod['maskedData'] = {};

    if (data.last4) masked.last4 = data.last4;
    if (data.brand) masked.brand = data.brand;
    if (data.expiryMonth) masked.expiryMonth = data.expiryMonth;
    if (data.expiryYear) masked.expiryYear = data.expiryYear;
    if (data.holderName) masked.holderName = data.holderName;
    if (data.accountType) masked.accountType = data.accountType;
    if (data.walletType) masked.walletType = data.walletType;
    if (data.cryptocurrency) masked.cryptocurrency = data.cryptocurrency;

    return masked;
  }

  private async encryptPaymentData(data: PaymentMethodData): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const jsonData = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonData);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  private async decryptPaymentData(encryptedData: string): Promise<PaymentMethodData> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const combined = this.base64ToArrayBuffer(encryptedData);
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM`, iv },
      this.encryptionKey,
      encrypted
    );

    const decoder = new TextDecoder();
    const jsonData = decoder.decode(decrypted);
    
    return JSON.parse(jsonData);
  }

  private async storeEncryptedPaymentData(token: string, encryptedData: string): Promise<void> {
    const storageKey = `encrypted_payment_${token}';
    localStorage.setItem(storageKey, encryptedData);
  }

  private async getDecryptedPaymentData(token: string): Promise<PaymentMethodData> {
    const storageKey = 'encrypted_payment_${token}';
    const encryptedData = localStorage.getItem(storageKey);
    
    if (!encryptedData) {
      throw new Error('Encrypted payment data not found');
    }

    return await this.decryptPaymentData(encryptedData);
  }

  private async removeEncryptedPaymentData(token: string): Promise<void> {
    const storageKey = 'encrypted_payment_${token}';
    localStorage.removeItem(storageKey);
  }

  private async persistTokenStore(): Promise<void> {
    try {
      const serialized = Array.from(this.tokenStore.entries()).map(([token, method]) => [
        token,
        {
          ...method,
          metadata: {
            ...method.metadata,
            createdAt: method.metadata.createdAt.toISOString(),
            lastUsed: method.metadata.lastUsed?.toISOString()
          },
          expiresAt: method.expiresAt?.toISOString()
        }
      ]);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist token store:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const serialized = JSON.parse(stored);
      this.tokenStore = new Map(
        serialized.map(([token, method]: [string, any]) => [
          token,
          {
            ...method,
            metadata: {
              ...method.metadata,
              createdAt: new Date(method.metadata.createdAt),
              lastUsed: method.metadata.lastUsed ? new Date(method.metadata.lastUsed) : undefined
            },
            expiresAt: method.expiresAt ? new Date(method.expiresAt) : undefined
          }
        ])
      );
    } catch (error) {
      console.error('Failed to load from storage:', error);
      this.tokenStore = new Map();
    }
  }

  private scheduleCleanup(): void {
    // Clean up expired tokens every hour
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);
  }

  private async auditTokenUsage(token: string, organizationId: string, purpose: string): Promise<void> {
    // In a real implementation, this would send to an audit service
    const auditEntry = {
      id: 'audit_${Date.now()}_${Math.random().toString(36)}',
      action: 'detokenize',
      token: token.slice(-8), // Only store last 8 characters for security
      organizationId,
      purpose,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    console.log('Token usage audit:', auditEntry);
  }

  private async updateStatistics(action: 'tokenized' | 'detokenized' | 'deactivated'): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STATS_STORAGE_KEY);
      const stats = stored ? JSON.parse(stored) : Record<string, unknown>;
      
      stats[action] = (stats[action] || 0) + 1;
      stats.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(this.STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to update statistics:', error);
    }
  }

  // Event system
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener for ${event}:', error);
        }
      });
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Cleanup resources
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.eventListeners.clear();
    this.tokenStore.clear();
    this.initialized = false;
  }
}

// Utility functions for payment validation
export class PaymentValidator {
  static validateCardNumber(cardNumber: string): boolean {
    const number = cardNumber.replace(/[^\w\s-]/g, '');
    
    // Basic length and digit validation
    if (!/^\d{13,19}$/.test(number)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      const digit = parseInt(number.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  static validateRoutingNumber(routingNumber: string): boolean {
    const number = routingNumber.replace(/[^\w\s-]/g, '');
    
    // Must be 9 digits
    if (!/^\d{9}$/.test(number)) {
      return false;
    }

    // ABA routing number checksum
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += parseInt(number.charAt(i)) * weights[i];
    }
    
    return sum % 10 === 0;
  }

  static validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (month < 1 || month > 12) {
      return false;
    }
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    
    return true;
  }

  static validateCVV(cvv: string, cardType?: string): boolean {
    if (cardType === 'amex') {
      return /^\d{4}$/.test(cvv);
    }
    
    return /^\d{3}$/.test(cvv);
  }
}

// Export singleton instance
export const paymentTokenizer = PaymentTokenizationService.getInstance();