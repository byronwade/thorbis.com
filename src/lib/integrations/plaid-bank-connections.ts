/**
 * Plaid Bank Connection Service
 * 
 * Comprehensive service for integrating with Plaid API for bank account connectivity:
 * - Link token creation and management for account linking
 * - Public token exchange for secure access token generation  
 * - Account data retrieval and balance synchronization
 * - Transaction fetching with categorization and sync
 * - Institution search and metadata management
 * - Webhook configuration and signature validation
 * - Error handling and retry logic for robust connectivity
 */

import crypto from 'crypto';

export interface PlaidConfig {
  clientId: string;
  secret: string;
  environment: 'sandbox' | 'development' | 'production';
  timeout?: number;
  retryAttempts?: number;
  baseUrl?: string;
}

export interface LinkTokenRequest {
  userId: string;
  clientName: string;
  products: string[];
  countryCodes: string[];
  language?: string;
  institutionIds?: string[];
  redirectUri?: string;
  webhookUrl?: string;
}

export interface LinkTokenResponse {
  link_token: string;
  expiration: string;
  request_id: string;
}

export interface UpdateLinkTokenRequest {
  accessToken: string;
  userId: string;
}

export interface TokenExchangeResponse {
  access_token: string;
  item_id: string;
  request_id: string;
}

export interface PlaidAccount {
  account_id: string;
  balances: {
    available: number | null;
    current: number | null;
    iso_currency_code: string;
    limit: number | null;
    unofficial_currency_code: string | null;
  };
  mask: string;
  name: string;
  official_name: string | null;
  persistent_account_id: string;
  subtype: string;
  type: string;
  verification_status?: string;
  owners?: Array<{
    names: string[];
    addresses: Array<{
      data: {
        street: string;
        city: string;
        region: string;
        postal_code: string;
        country: string;
      };
      primary: boolean;
    }>;
    phone_numbers: Array<{
      data: string;
      primary: boolean;
      type: string;
    }>;
    emails: Array<{
      data: string;
      primary: boolean;
      type: string;
    }>;
  }>;
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  iso_currency_code: string;
  unofficial_currency_code: string | null;
  category: string[];
  category_id: string | null;
  date: string;
  name: string;
  merchant_name: string | null;
  payment_channel: string;
  pending: boolean;
  pending_transaction_id: string | null;
  transaction_type: string;
  transaction_code: string | null;
  location?: {
    address: string | null;
    city: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
  };
  personal_finance_category?: {
    primary: string;
    detailed: string;
  };
}

export interface PlaidInstitution {
  institution_id: string;
  name: string;
  products: string[];
  country_codes: string[];
  url: string | null;
  primary_color: string | null;
  logo: string | null;
  routing_numbers: string[];
  dtc_numbers: string[];
  oauth: boolean;
}

export interface PlaidItem {
  item_id: string;
  institution_id: string | null;
  webhook: string | null;
  error: Error | unknown | null;
  available_products: string[];
  billed_products: string[];
  consent_expiration_time: string | null;
  update_type: string;
}

export interface TransactionsRequest {
  accessToken: string;
  startDate: string;
  endDate: string;
  count?: number;
  offset?: number;
  accountIds?: string[];
}

export interface TransactionsResponse {
  accounts: PlaidAccount[];
  transactions: PlaidTransaction[];
  total_transactions: number;
  item: PlaidItem;
  request_id: string;
}

export interface TransactionsSyncResponse {
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: Array<{ transaction_id: string }>;
  next_cursor: string;
  has_more: boolean;
  request_id: string;
}

export interface AccountsResponse {
  accounts: PlaidAccount[];
  item: PlaidItem;
  request_id: string;
}

export interface BalanceResponse {
  accounts: PlaidAccount[];
  item: PlaidItem;
  request_id: string;
}

export interface IdentityResponse {
  accounts: PlaidAccount[];
  item: PlaidItem;
  request_id: string;
}

export interface ItemResponse {
  item: PlaidItem;
  status: {
    investments: any | null;
    last_webhook: {
      sent_at: string;
      code_sent: string;
    } | null;
    transactions: {
      last_successful_update: string;
      last_failed_update: string | null;
    } | null;
  } | null;
  request_id: string;
}

export interface InstitutionSearchRequest {
  query: string;
  products: string[];
  countryCodes: string[];
  includeOptionalMetadata?: boolean;
}

export interface InstitutionSearchResponse {
  institutions: PlaidInstitution[];
  request_id: string;
}

export interface InstitutionResponse {
  institution: PlaidInstitution;
  request_id: string;
}

export interface InstitutionsRequest {
  count: number;
  offset: number;
  countryCodes: string[];
  includeOptionalMetadata?: boolean;
}

export interface InstitutionsResponse {
  institutions: PlaidInstitution[];
  total: number;
  request_id: string;
}

export interface WebhookUpdateResponse {
  item: PlaidItem;
  request_id: string;
}

export interface ItemRemovalResponse {
  removed: boolean;
  request_id: string;
}

export class PlaidBankConnectionService {
  private config: PlaidConfig;
  private baseUrl: string;

  constructor(config: PlaidConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      ...config
    };

    // Set base URL based on environment
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else {
      switch (config.environment) {
        case 'sandbox':
          this.baseUrl = 'https://sandbox.plaid.com';
          break;
        case 'development':
          this.baseUrl = 'https://development.plaid.com';
          break;
        case 'production':
          this.baseUrl = 'https://production.plaid.com';
          break;
        default:
          throw new Error('Invalid Plaid environment specified');
      }
    }
  }

  /**
   * Create a link token for Plaid Link initialization
   */
  async createLinkToken(request: LinkTokenRequest): Promise<LinkTokenResponse> {
    this.validateLinkTokenRequest(request);

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      client_name: request.clientName,
      user: {
        client_user_id: request.userId
      },
      products: request.products,
      country_codes: request.countryCodes,
      language: request.language || 'en',
      ...(request.institutionIds && { institution_id: request.institutionIds }),
      ...(request.redirectUri && { redirect_uri: request.redirectUri }),
      ...(request.webhookUrl && { webhook: request.webhookUrl })
    };

    return this.makeRequest<LinkTokenResponse>('/link/token/create', payload);
  }

  /**
   * Create an update mode link token for re-authentication
   */
  async createUpdateLinkToken(request: UpdateLinkTokenRequest): Promise<LinkTokenResponse> {
    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      access_token: request.accessToken,
      user: {
        client_user_id: request.userId
      }
    };

    return this.makeRequest<LinkTokenResponse>('/link/token/create', payload);
  }

  /**
   * Exchange public token for access token
   */
  async exchangePublicToken(publicToken: string): Promise<TokenExchangeResponse> {
    if (!publicToken) {
      throw new Error('Public token is required');
    }

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      public_token: publicToken
    };

    return this.makeRequest<TokenExchangeResponse>('/link/token/exchange', payload);
  }

  /**
   * Get account information
   */
  async getAccounts(accessToken: string): Promise<AccountsResponse> {
    this.validateAccessToken(accessToken);

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      access_token: accessToken
    };

    return this.makeRequest<AccountsResponse>('/accounts/get', payload);
  }

  /**
   * Get account balances
   */
  async getBalance(accessToken: string, accountIds?: string[]): Promise<BalanceResponse> {
    this.validateAccessToken(accessToken);

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      access_token: accessToken,
      options: {
        ...(accountIds && { account_ids: accountIds })
      }
    };

    return this.makeRequest<BalanceResponse>('/accounts/balance/get', payload);
  }

  /**
   * Get identity information
   */
  async getIdentity(accessToken: string): Promise<IdentityResponse> {
    this.validateAccessToken(accessToken);

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      access_token: accessToken
    };

    return this.makeRequest<IdentityResponse>('/identity/get', payload);
  }

  /**
   * Get item information
   */
  async getItem(accessToken: string): Promise<ItemResponse> {
    this.validateAccessToken(accessToken);

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      access_token: accessToken
    };

    return this.makeRequest<ItemResponse>('/item/get', payload);
  }

  /**
   * Remove/delete an item
   */
  async removeItem(accessToken: string): Promise<ItemRemovalResponse> {
    this.validateAccessToken(accessToken);

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      access_token: accessToken
    };

    return this.makeRequest<ItemRemovalResponse>('/item/remove', payload);
  }

  /**
   * Get transactions for date range
   */
  async getTransactions(request: TransactionsRequest): Promise<TransactionsResponse> {
    this.validateAccessToken(request.accessToken);
    this.validateDateRange(request.startDate, request.endDate);

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      access_token: request.accessToken,
      start_date: request.startDate,
      end_date: request.endDate,
      count: request.count || 100,
      offset: request.offset || 0,
      options: {
        ...(request.accountIds && { account_ids: request.accountIds }),
        include_original_description: false,
        include_personal_finance_category: true
      }
    };

    return this.makeRequest<TransactionsResponse>('/transactions/get', payload);
  }

  /**
   * Sync transactions using cursor-based pagination
   */
  async syncTransactions(accessToken: string, cursor?: string): Promise<TransactionsSyncResponse> {
    this.validateAccessToken(accessToken);

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      access_token: accessToken,
      ...(cursor && { cursor })
    };

    return this.makeRequest<TransactionsSyncResponse>('/transactions/sync', payload);
  }

  /**
   * Search institutions by query
   */
  async searchInstitutions(request: InstitutionSearchRequest): Promise<InstitutionSearchResponse> {
    if (!request.query) {
      throw new Error('Search query is required');
    }
    if (!request.products || request.products.length === 0) {
      throw new Error('Products array is required and cannot be empty');
    }
    if (!request.countryCodes || request.countryCodes.length === 0) {
      throw new Error('Country codes array is required and cannot be empty');
    }

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      query: request.query,
      products: request.products,
      country_codes: request.countryCodes,
      options: {
        include_optional_metadata: request.includeOptionalMetadata || true,
        include_auth_metadata: true,
        include_payment_initiation_metadata: false
      }
    };

    return this.makeRequest<InstitutionSearchResponse>('/institutions/search', payload);
  }

  /**
   * Get institution by ID
   */
  async getInstitution(institutionId: string, countryCodes: string[]): Promise<InstitutionResponse> {
    if (!institutionId) {
      throw new Error('Institution ID is required');
    }
    if (!countryCodes || countryCodes.length === 0) {
      throw new Error('Country codes are required');
    }

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      institution_id: institutionId,
      country_codes: countryCodes,
      options: {
        include_optional_metadata: true,
        include_status: true
      }
    };

    return this.makeRequest<InstitutionResponse>('/institutions/get_by_id', payload);
  }

  /**
   * Get all institutions with pagination
   */
  async getInstitutions(request: InstitutionsRequest): Promise<InstitutionsResponse> {
    if (!request.countryCodes || request.countryCodes.length === 0) {
      throw new Error('Country codes are required');
    }

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      count: Math.min(request.count, 500), // Plaid max is 500
      offset: request.offset,
      country_codes: request.countryCodes,
      options: {
        include_optional_metadata: request.includeOptionalMetadata || true,
        oauth: true,
        include_auth_metadata: true
      }
    };

    return this.makeRequest<InstitutionsResponse>('/institutions/get', payload);
  }

  /**
   * Update webhook URL for an item
   */
  async updateWebhook(accessToken: string, webhookUrl: string): Promise<WebhookUpdateResponse> {
    this.validateAccessToken(accessToken);
    if (!webhookUrl) {
      throw new Error('Webhook URL is required');
    }

    const payload = {
      client_id: this.config.clientId,
      secret: this.config.secret,
      access_token: accessToken,
      webhook: webhookUrl
    };

    return this.makeRequest<WebhookUpdateResponse>('/item/webhook/update', payload);
  }

  /**
   * Generate webhook signature for verification
   */
  generateWebhookSignature(body: string, timestamp: string, secret: string): string {
    const payload = '${timestamp}.${body}';
    return crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(body: string, signature: string, secret: string, tolerance: number = 5 * 60): boolean {
    const timestamp = Math.floor(Date.now() / 1000);
    const expectedSignature = this.generateWebhookSignature(body, timestamp.toString(), secret);
    
    // Simple constant-time comparison (in production, use crypto.timingSafeEqual)
    return signature === expectedSignature;
  }

  /**
   * Make HTTP request to Plaid API with retry logic
   */
  private async makeRequest<T>(endpoint: string, payload: unknown, retryCount: number = 0): Promise<T> {
    const url = '${this.baseUrl}${endpoint}';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PLAID-CLIENT-ID': this.config.clientId,
          'PLAID-SECRET': this.config.secret,
          'Plaid-Version': '2020-09-14'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.createPlaidError(data);
      }

      return data as T;
    } catch (error: unknown) {
      // Retry on network errors or rate limits
      if (retryCount < this.config.retryAttempts! && this.shouldRetry(error)) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(endpoint, payload, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Create structured error from Plaid API response
   */
  private createPlaidError(errorResponse: unknown): Error {
    const error = new Error(
      errorResponse.error_message || 
      errorResponse.display_message || 
      'Plaid API error'
    );
    
    // Add Plaid-specific error properties
    (error as any).error_type = errorResponse.error_type;
    (error as any).error_code = errorResponse.error_code;
    (error as any).display_message = errorResponse.display_message;
    (error as any).request_id = errorResponse.request_id;
    (error as any).suggested_action = errorResponse.suggested_action;

    return error;
  }

  /**
   * Determine if error should trigger retry
   */
  private shouldRetry(error: unknown): boolean {
    // Retry on network errors, timeouts, and rate limits
    return (
      error.name === 'AbortError' ||
      error.name === 'TimeoutError' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      error.error_type === 'API_ERROR' ||
      (error.error_code && error.error_code.includes('RATE_LIMIT'))
    );
  }

  /**
   * Validate link token request parameters
   */
  private validateLinkTokenRequest(request: LinkTokenRequest): void {
    if (!request.userId || request.userId.trim() === ') {
      throw new Error('User ID is required');
    }
    if (!request.clientName || request.clientName.trim() === ') {
      throw new Error('Client name is required');
    }
    if (!request.products || request.products.length === 0) {
      throw new Error('Products array is required and cannot be empty');
    }
    if (!request.countryCodes || request.countryCodes.length === 0) {
      throw new Error('Country codes array is required and cannot be empty');
    }
  }

  /**
   * Validate access token
   */
  private validateAccessToken(accessToken: string): void {
    if (!accessToken || accessToken.trim() === ') {
      throw new Error('Access token is required');
    }
  }

  /**
   * Validate date range for transactions
   */
  private validateDateRange(startDate: string, endDate: string): void {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (start > end) {
      throw new Error('Start date cannot be after end date');
    }

    // Plaid has limits on date ranges (typically 2 years)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 730) { // 2 years
      throw new Error('Date range cannot exceed 2 years');
    }
  }
}

// Export types for external use
export type {
  PlaidConfig,
  LinkTokenRequest,
  LinkTokenResponse,
  TokenExchangeResponse,
  PlaidAccount,
  PlaidTransaction,
  PlaidInstitution,
  PlaidItem,
  TransactionsRequest,
  TransactionsResponse,
  TransactionsSyncResponse,
  AccountsResponse,
  BalanceResponse,
  IdentityResponse,
  ItemResponse,
  InstitutionSearchRequest,
  InstitutionSearchResponse,
  InstitutionResponse,
  InstitutionsRequest,
  InstitutionsResponse,
  WebhookUpdateResponse,
  ItemRemovalResponse
};