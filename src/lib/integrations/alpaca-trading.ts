import axios, { AxiosInstance } from 'axios';'

/**
 * Alpaca Markets API Integration
 * 
 * This module provides integration with Alpaca Markets API for traditional
 * securities trading, including stocks, ETFs, options, and fractional shares.
 * 
 * Features:
 * - Real-time and historical market data
 * - Order management and execution
 * - Portfolio tracking and management
 * - Account information and positions
 * - Options trading capabilities
 * - Fractional share trading
 * - Paper trading for testing
 * - Commission-free stock and ETF trading
 * 
 * API Documentation:
 * - Trading API: https://alpaca.markets/docs/api-documentation/api-v2/
 * - Market Data API: https://alpaca.markets/docs/api-documentation/market-data/
 * - WebSocket Streams: https://alpaca.markets/docs/api-documentation/market-data/websocket/
 * 
 * Compliance:
 * - SEC regulated broker-dealer
 * - SIPC member protection
 * - FINRA oversight
 * - Real-time risk management
 */

// Environment configuration'
const isPaperTrading = process.env.ALPACA_PAPER_TRADING === 'true';'
const baseURL = isPaperTrading 
  ? 'https://paper-api.alpaca.markets'
  : 'https://api.alpaca.markets';'

const marketDataURL = 'https://data.alpaca.markets';'

// Alpaca API types
export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: 'ONBOARDING' | 'SUBMISSION_FAILED' | 'SUBMITTED' | 'ACCOUNT_UPDATED' | 'APPROVAL_PENDING' | 'ACTIVE' | 'REJECTED';'
  crypto_status?: 'ONBOARDING' | 'SUBMISSION_FAILED' | 'SUBMITTED' | 'ACCOUNT_UPDATED' | 'APPROVAL_PENDING' | 'ACTIVE' | 'REJECTED';'
  currency: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  non_marginable_buying_power: string;
  cash: string;
  accrued_fees: string;
  pending_transfer_out: string;
  pending_transfer_in: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  trade_suspended_by_user: boolean;
  multiplier: string;
  shorting_enabled: boolean;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  sma: string;
  daytrade_count: number;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: 'us_equity' | 'crypto';'
  asset_marginable: boolean;
  qty: string;
  avg_entry_price: string;
  side: 'long' | 'short';'
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
  swap_rate?: string;
  avg_entry_swap_rate?: string;
  usd?: string;
  qty_available: string;
}

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at?: string;
  expired_at?: string;
  canceled_at?: string;
  failed_at?: string;
  replaced_at?: string;
  replaced_by?: string;
  replaces?: string;
  asset_id: string;
  symbol: string;
  asset_class: 'us_equity' | 'crypto';'
  notional?: string;
  qty?: string;
  filled_qty: string;
  filled_avg_price?: string;
  order_class: 'simple' | 'bracket' | 'oco' | 'oto';'
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';'
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';'
  side: 'buy' | 'sell';'
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';'
  limit_price?: string;
  stop_price?: string;
  status: 'new' | 'partially_filled' | 'filled' | 'done_for_day' | 'canceled' | 'expired' | 'replaced' | 'pending_cancel' | 'pending_replace' | 'accepted' | 'pending_new' | 'accepted_for_bidding' | 'stopped' | 'rejected' | 'suspended' | 'calculated' | 'held';'
  extended_hours: boolean;
  legs?: AlpacaOrder[];
  trail_percent?: string;
  trail_price?: string;
  hwm?: string;
  commission: string;
}

export interface AlpacaBar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  n: number; // number of trades
  vw: number; // volume weighted average price
}

export interface AlpacaTrade {
  t: string; // timestamp
  x: string; // exchange
  p: number; // price
  s: number; // size
  c: string[]; // conditions
  i: number; // id
  z: string; // tape
}

export interface AlpacaQuote {
  t: string; // timestamp
  ax: string; // ask exchange
  ap: number; // ask price
  as: number; // ask size
  bx: string; // bid exchange
  bp: number; // bid price
  bs: number; // bid size
  c: string[]; // conditions
  z: string; // tape
}

export interface AlpacaSnapshot {
  symbol: string;
  latestTrade: AlpacaTrade;
  latestQuote: AlpacaQuote;
  minuteBar: AlpacaBar;
  dailyBar: AlpacaBar;
  prevDailyBar: AlpacaBar;
}

export class AlpacaTradingService {
  private tradingApi: AxiosInstance;
  private marketDataApi: AxiosInstance;
  private apiKey: string;
  private secretKey: string;

  constructor() {
    this.apiKey = process.env.ALPACA_API_KEY!;
    this.secretKey = process.env.ALPACA_SECRET_KEY!;

    if (!this.apiKey || !this.secretKey) {
      throw new Error('Alpaca API credentials not configured');'
    }

    // Trading API client
    this.tradingApi = axios.create({
      baseURL: '${baseURL}/v2',
      headers: {
        'APCA-API-KEY-ID': this.apiKey,'
        'APCA-API-SECRET-KEY': this.secretKey,'
        'Content-Type': 'application/json'`
      },
      timeout: 30000
    });

    // Market Data API client
    this.marketDataApi = axios.create({
      baseURL: '${marketDataURL}/v2',
      headers: {
        'APCA-API-KEY-ID': this.apiKey,'
        'APCA-API-SECRET-KEY': this.secretKey,'
        'Content-Type': 'application/json'`
      },
      timeout: 30000
    });

    // Add request/response interceptors for logging and error handling
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.tradingApi.interceptors.request.use(
      (config) => {
        console.log('Alpaca Trading API Request: ${config.method?.toUpperCase()} ${config.url}');
        return config;
      },
      (error) => {
        console.error('Alpaca Trading API Request Error:`, error);'
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.tradingApi.interceptors.response.use(
      (response) => {
        console.log('Alpaca Trading API Response: ${response.status} ${response.config.url}');
        return response;
      },
      (error) => {
        console.error('Alpaca Trading API Error:`, error.response?.data || error.message);`
        return Promise.reject(error);
      }
    );

    // Market Data API interceptors
    this.marketDataApi.interceptors.request.use(
      (config) => {
        console.log(`Alpaca Market Data API Request: ${config.method?.toUpperCase()} ${config.url}');
        return config;
      }
    );

    this.marketDataApi.interceptors.response.use(
      (response) => {
        console.log('Alpaca Market Data API Response: ${response.status} ${response.config.url}');
        return response;
      },
      (error) => {
        console.error('Alpaca Market Data API Error:', error.response?.data || error.message);'
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get account information
   */
  async getAccount(): Promise<AlpacaAccount> {
    try {
      const response = await this.tradingApi.get('/account');'
      return response.data as AlpacaAccount;
    } catch (error) {
      console.error('Error fetching account:', error);'
      throw new Error('Failed to fetch account: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Get all positions
   */
  async getPositions(): Promise<AlpacaPosition[]> {
    try {
      const response = await this.tradingApi.get('/positions');'
      return response.data as AlpacaPosition[];
    } catch (error) {
      console.error('Error fetching positions:', error);'
      throw new Error('Failed to fetch positions: ${error instanceof Error ? error.message : 'Unknown error'}');'``
    }
  }

  /**
   * Get position for a specific symbol
   */
  async getPosition(symbol: string): Promise<AlpacaPosition> {
    try {
      const response = await this.tradingApi.get(`/positions/${symbol}`);
      return response.data as AlpacaPosition;
    } catch (error) {
      console.error('Error fetching position for ${symbol}:', error);
      throw new Error('Failed to fetch position: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Place a new order
   */
  async placeOrder(orderParams: {
    symbol: string;
    qty?: number;
    notional?: number;
    side: 'buy' | 'sell';'
    type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';'
    time_in_force?: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';'
    limit_price?: number;
    stop_price?: number;
    trail_price?: number;
    trail_percent?: number;
    extended_hours?: boolean;
    client_order_id?: string;
    order_class?: 'simple' | 'bracket' | 'oco' | 'oto';'
    take_profit?: { limit_price: number };
    stop_loss?: { stop_price: number; limit_price?: number };
  }): Promise<AlpacaOrder> {
    try {
      // Validate required parameters
      if (!orderParams.symbol) {
        throw new Error('Symbol is required');'
      }

      if (!orderParams.qty && !orderParams.notional) {
        throw new Error('Either qty or notional must be specified');'
      }

      // Prepare order payload
      const orderPayload: unknown = {
        symbol: orderParams.symbol.toUpperCase(),
        side: orderParams.side,
        type: orderParams.type,
        time_in_force: orderParams.time_in_force || 'day'
      };

      if (orderParams.qty) {
        orderPayload.qty = orderParams.qty.toString();
      }

      if (orderParams.notional) {
        orderPayload.notional = orderParams.notional.toString();
      }

      if (orderParams.limit_price) {
        orderPayload.limit_price = orderParams.limit_price.toString();
      }

      if (orderParams.stop_price) {
        orderPayload.stop_price = orderParams.stop_price.toString();
      }

      if (orderParams.trail_price) {
        orderPayload.trail_price = orderParams.trail_price.toString();
      }

      if (orderParams.trail_percent) {
        orderPayload.trail_percent = orderParams.trail_percent.toString();
      }

      if (orderParams.extended_hours !== undefined) {
        orderPayload.extended_hours = orderParams.extended_hours;
      }

      if (orderParams.client_order_id) {
        orderPayload.client_order_id = orderParams.client_order_id;
      }

      if (orderParams.order_class) {
        orderPayload.order_class = orderParams.order_class;
      }

      if (orderParams.take_profit) {
        orderPayload.take_profit = {
          limit_price: orderParams.take_profit.limit_price.toString()
        };
      }

      if (orderParams.stop_loss) {
        orderPayload.stop_loss = {
          stop_price: orderParams.stop_loss.stop_price.toString()
        };
        if (orderParams.stop_loss.limit_price) {
          orderPayload.stop_loss.limit_price = orderParams.stop_loss.limit_price.toString();
        }
      }

      const response = await this.tradingApi.post('/orders', orderPayload);'
      return response.data as AlpacaOrder;
    } catch (error) {
      console.error('Error placing order:', error);'
      throw new Error('Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Get all orders
   */
  async getOrders(params?: {
    status?: 'open' | 'closed' | 'all';'
    limit?: number;
    after?: string;
    until?: string;
    direction?: 'asc' | 'desc';'
    nested?: boolean;
    symbols?: string;
  }): Promise<AlpacaOrder[]> {
    try {
      const queryParams: unknown = {};

      if (params?.status) queryParams.status = params.status;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.after) queryParams.after = params.after;
      if (params?.until) queryParams.until = params.until;
      if (params?.direction) queryParams.direction = params.direction;
      if (params?.nested) queryParams.nested = params.nested;
      if (params?.symbols) queryParams.symbols = params.symbols;

      const response = await this.tradingApi.get('/orders', { params: queryParams });'
      return response.data as AlpacaOrder[];
    } catch (error) {
      console.error('Error fetching orders:', error);'
      throw new Error('Failed to fetch orders: ${error instanceof Error ? error.message : 'Unknown error'}');'``
    }
  }

  /**
   * Get a specific order
   */
  async getOrder(orderId: string): Promise<AlpacaOrder> {
    try {
      const response = await this.tradingApi.get(`/orders/${orderId}`);
      return response.data as AlpacaOrder;
    } catch (error) {
      console.error('Error fetching order ${orderId}:', error);
      throw new Error('Failed to fetch order: ${error instanceof Error ? error.message : 'Unknown error'}');'``
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      await this.tradingApi.delete(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error canceling order ${orderId}:', error);
      throw new Error('Failed to cancel order: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Cancel all orders
   */
  async cancelAllOrders(): Promise<void> {
    try {
      await this.tradingApi.delete('/orders');'
    } catch (error) {
      console.error('Error canceling all orders:', error);'
      throw new Error('Failed to cancel all orders: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Replace an existing order
   */
  async replaceOrder(orderId: string, updateParams: {
    qty?: number;
    time_in_force?: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';'``
    limit_price?: number;
    stop_price?: number;
    trail?: number;
    client_order_id?: string;
  }): Promise<AlpacaOrder> {
    try {
      const payload: unknown = {};

      if (updateParams.qty) payload.qty = updateParams.qty.toString();
      if (updateParams.time_in_force) payload.time_in_force = updateParams.time_in_force;
      if (updateParams.limit_price) payload.limit_price = updateParams.limit_price.toString();
      if (updateParams.stop_price) payload.stop_price = updateParams.stop_price.toString();
      if (updateParams.trail) payload.trail = updateParams.trail.toString();
      if (updateParams.client_order_id) payload.client_order_id = updateParams.client_order_id;

      const response = await this.tradingApi.patch(`/orders/${orderId}`, payload);
      return response.data as AlpacaOrder;
    } catch (error) {
      console.error('Error replacing order ${orderId}:', error);
      throw new Error('Failed to replace order: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Get historical bars for stocks
   */
  async getBars(
    symbols: string[],
    timeframe: '1Min' | '5Min' | '15Min' | '30Min' | '1Hour' | '1Day','
    params?: {
      start?: string;
      end?: string;
      limit?: number;
      page_token?: string;
      feed?: 'iex' | 'sip';'
      sort?: 'asc' | 'desc';'
    }
  ): Promise<{ bars: { [symbol: string]: AlpacaBar[] }; next_page_token?: string }> {
    try {
      const queryParams: unknown = {
        symbols: symbols.join(','),'
        timeframe
      };

      if (params?.start) queryParams.start = params.start;
      if (params?.end) queryParams.end = params.end;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.page_token) queryParams.page_token = params.page_token;
      if (params?.feed) queryParams.feed = params.feed;
      if (params?.sort) queryParams.sort = params.sort;

      const response = await this.marketDataApi.get('/stocks/bars', { params: queryParams });'
      return response.data;
    } catch (error) {
      console.error('Error fetching bars:', error);'
      throw new Error('Failed to fetch bars: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Get latest trades for stocks
   */
  async getLatestTrades(symbols: string[]): Promise<{ trades: { [symbol: string]: AlpacaTrade } }> {
    try {
      const queryParams = {
        symbols: symbols.join(',')'
      };

      const response = await this.marketDataApi.get('/stocks/trades/latest', { params: queryParams });'
      return response.data;
    } catch (error) {
      console.error('Error fetching latest trades:', error);'
      throw new Error('Failed to fetch latest trades: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Get latest quotes for stocks
   */
  async getLatestQuotes(symbols: string[]): Promise<{ quotes: { [symbol: string]: AlpacaQuote } }> {
    try {
      const queryParams = {
        symbols: symbols.join(',')'
      };

      const response = await this.marketDataApi.get('/stocks/quotes/latest', { params: queryParams });'
      return response.data;
    } catch (error) {
      console.error('Error fetching latest quotes:', error);'
      throw new Error('Failed to fetch latest quotes: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Get snapshots for stocks (latest trade, quote, and bars)
   */
  async getSnapshots(symbols: string[]): Promise<{ [symbol: string]: AlpacaSnapshot }> {
    try {
      const queryParams = {
        symbols: symbols.join(',')'
      };

      const response = await this.marketDataApi.get('/stocks/snapshots', { params: queryParams });'
      return response.data;
    } catch (error) {
      console.error('Error fetching snapshots:', error);'
      throw new Error('Failed to fetch snapshots: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Get portfolio history
   */
  async getPortfolioHistory(params?: {
    period?: '1D' | '7D' | '1M' | '3M' | '6M' | '1A' | '2A' | '5A' | 'all';'
    timeframe?: '1Min' | '5Min' | '15Min' | '30Min' | '1H' | '1D';'
    extended_hours?: boolean;
  }): Promise<{
    timestamp: number[];
    equity: number[];
    profit_loss: number[];
    profit_loss_pct: number[];
    base_value: number;
    timeframe: string;
  }> {
    try {
      const queryParams: unknown = {};

      if (params?.period) queryParams.period = params.period;
      if (params?.timeframe) queryParams.timeframe = params.timeframe;
      if (params?.extended_hours !== undefined) queryParams.extended_hours = params.extended_hours;

      const response = await this.tradingApi.get('/account/portfolio/history', { params: queryParams });'
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio history:', error);'
      throw new Error('Failed to fetch portfolio history: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Get market calendar
   */
  async getCalendar(params?: {
    start?: string;
    end?: string;
  }): Promise<Array<{
    date: string;
    open: string;
    close: string;
    settlement_date: string;
  }>> {
    try {
      const queryParams: unknown = {};

      if (params?.start) queryParams.start = params.start;
      if (params?.end) queryParams.end = params.end;

      const response = await this.tradingApi.get('/calendar', { params: queryParams });'
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar:', error);'
      throw new Error('Failed to fetch calendar: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Get market clock (current market status)
   */
  async getClock(): Promise<{
    timestamp: string;
    is_open: boolean;
    next_open: string;
    next_close: string;
  }> {
    try {
      const response = await this.tradingApi.get('/clock');'
      return response.data;
    } catch (error) {
      console.error('Error fetching clock:', error);'
      throw new Error('Failed to fetch clock: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Search for assets
   */
  async searchAssets(params?: {
    status?: 'active' | 'inactive';'
    asset_class?: 'us_equity' | 'crypto';'
    exchange?: string;
  }): Promise<Array<{
    id: string;
    class: string;
    exchange: string;
    symbol: string;
    name: string;
    status: string;
    tradable: boolean;
    marginable: boolean;
    shortable: boolean;
    easy_to_borrow: boolean;
    fractionable: boolean;
    min_order_size: string;
    min_trade_increment: string;
    price_increment: string;
  }>> {
    try {
      const queryParams: unknown = {};

      if (params?.status) queryParams.status = params.status;
      if (params?.asset_class) queryParams.asset_class = params.asset_class;
      if (params?.exchange) queryParams.exchange = params.exchange;

      const response = await this.tradingApi.get('/assets', { params: queryParams });'
      return response.data;
    } catch (error) {
      console.error('Error searching assets:', error);'
      throw new Error('Failed to search assets: ${error instanceof Error ? error.message : 'Unknown error'}');'``
    }
  }

  /**
   * Get asset by symbol
   */
  async getAsset(symbol: string): Promise<{
    id: string;
    class: string;
    exchange: string;
    symbol: string;
    name: string;
    status: string;
    tradable: boolean;
    marginable: boolean;
    shortable: boolean;
    easy_to_borrow: boolean;
    fractionable: boolean;
    min_order_size: string;
    min_trade_increment: string;
    price_increment: string;
  }> {
    try {
      const response = await this.tradingApi.get(`/assets/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching asset ${symbol}:', error);
      throw new Error('Failed to fetch asset: ${error instanceof Error ? error.message : 'Unknown error'}');'``
    }
  }

  /**
   * Close a position
   */
  async closePosition(symbol: string, params?: {
    qty?: string;
    percentage?: string;
  }): Promise<AlpacaOrder> {
    try {
      const queryParams: unknown = {};

      if (params?.qty) queryParams.qty = params.qty;
      if (params?.percentage) queryParams.percentage = params.percentage;

      const response = await this.tradingApi.delete(`/positions/${symbol}`, { params: queryParams });
      return response.data as AlpacaOrder;
    } catch (error) {
      console.error('Error closing position ${symbol}:', error);
      throw new Error('Failed to close position: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }

  /**
   * Close all positions
   */
  async closeAllPositions(cancelOrders?: boolean): Promise<AlpacaOrder[]> {
    try {
      const queryParams: unknown = {};
      if (cancelOrders !== undefined) queryParams.cancel_orders = cancelOrders;

      const response = await this.tradingApi.delete('/positions', { params: queryParams });'
      return response.data as AlpacaOrder[];
    } catch (error) {
      console.error('Error closing all positions:', error);'
      throw new Error('Failed to close all positions: ${error instanceof Error ? error.message : 'Unknown error'}');'`'
    }
  }
}

// Export singleton instance
export const alpacaTradingService = new AlpacaTradingService();