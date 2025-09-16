/**
 * TradingView Real-Time Market Data WebSocket Service
 * 
 * This service provides real-time market data streaming from TradingView
 * for comprehensive financial market coverage including stocks, forex,
 * crypto, indices, commodities, and more.
 * 
 * Features:
 * - Real-time price updates and quotes
 * - Level 2 market data (order book depth)
 * - Trade execution data with volume
 * - Technical indicators streaming
 * - Multi-symbol subscription management
 * - Automatic reconnection and error handling
 * - Rate limiting and connection management
 * - Data normalization and formatting
 * 
 * WebSocket Streams:
 * - Quote data (bid/ask/last price)
 * - Trade data (price/volume/time)
 * - Market depth (Level 2 order book)
 * - Technical indicators
 * - Market status updates
 * 
 * Data Sources:
 * - TradingView's real-time data feeds'
 * - Multiple exchanges and market centers
 * - Global financial markets coverage
 * - Institutional-grade market data
 */

import { EventEmitter } from 'events';'

// Real-time data types
export interface QuoteUpdate {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  timestamp: number;
}

export interface TradeUpdate {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;'
  side: 'buy' | 'sell' | 'unknown';'
  exchange: string;
}

export interface DepthUpdate {
  symbol: string;
  bids: Array<[number, number]>; // [price, size]
  asks: Array<[number, number]>; // [price, size]
  timestamp: number;
}

export interface IndicatorUpdate {
  symbol: string;
  indicator: string;
  value: number;
  timestamp: number;
}

export interface MarketStatus {
  symbol: string;
  status: 'open' | 'closed' | 'pre_market' | 'after_hours';'
  nextOpen?: number;
  nextClose?: number;
  timezone: string;
}

// WebSocket connection configuration
interface WebSocketConfig {
  url: string;
  apiKey: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  pingInterval: number;
  subscriptionLimit: number;
}

// Subscription management
interface Subscription {
  symbol: string;
  type: 'quote' | 'trade' | 'depth' | 'indicator';'
  params?: Record<string, unknown>;
  callback: (data: unknown) => void;
}

export class TradingViewWebSocketService extends EventEmitter {
  private config: WebSocketConfig;
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Subscription>();
  private reconnectAttempts = 0;
  private isConnected = false;
  private pingTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private sessionId: string | null = null;
  
  // Rate limiting
  private messageQueue: string[] = [];
  private rateLimitTimer: NodeJS.Timeout | null = null;
  private lastMessageTime = 0;
  private messageInterval = 100; // 100ms between messages

  constructor(config?: Partial<WebSocketConfig>) {
    super();
    
    this.config = {
      url: process.env.TRADINGVIEW_WEBSOCKET_URL || 'wss://data.tradingview.com/socket.io/',
      apiKey: process.env.TRADINGVIEW_API_KEY || ','
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      pingInterval: 30000,
      subscriptionLimit: 50,
      ...config
    };

    // Bind methods to maintain context
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  /**
   * Connect to TradingView WebSocket
   */
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('TradingView WebSocket already connected');'
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to TradingView WebSocket...');'
        
        // Create WebSocket connection
        this.ws = new WebSocket(this.config.url);
        
        // Set up event handlers
        this.ws.onopen = () => {
          this.handleOpen();
          resolve();
        };
        
        this.ws.onmessage = this.handleMessage;
        this.ws.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };
        
        this.ws.onclose = this.handleClose;

        // Connection timeout
        setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'));'
          }
        }, 10000);

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);'
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.rateLimitTimer) {
      clearInterval(this.rateLimitTimer);
      this.rateLimitTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.subscriptions.clear();
    this.messageQueue = [];
    
    console.log('TradingView WebSocket disconnected');'
  }

  /**
   * Subscribe to real-time quote updates
   */
  subscribeToQuotes(
    symbols: string[],
    callback: (quote: QuoteUpdate) => void
  ): string[] {
    const subscriptionIds: string[] = [];

    symbols.forEach(symbol => {
      const subscriptionId = this.generateSubscriptionId(symbol, 'quote');'
      
      const subscription: Subscription = {
        symbol: symbol.toUpperCase(),
        type: 'quote','
        callback
      };

      this.subscriptions.set(subscriptionId, subscription);
      subscriptionIds.push(subscriptionId);

      // Send subscription message
      this.sendMessage({
        m: 'quote_add_symbols','
        p: [this.sessionId, symbol.toUpperCase()]
      });
    });

    console.log('Subscribed to quotes for: ${symbols.join(', ')}');'`
    return subscriptionIds;
  }

  /**
   * Subscribe to real-time trade updates
   */
  subscribeToTrades(
    symbols: string[],
    callback: (trade: TradeUpdate) => void
  ): string[] {
    const subscriptionIds: string[] = [];

    symbols.forEach(symbol => {
      const subscriptionId = this.generateSubscriptionId(symbol, 'trade');'
      
      const subscription: Subscription = {
        symbol: symbol.toUpperCase(),
        type: 'trade','
        callback
      };

      this.subscriptions.set(subscriptionId, subscription);
      subscriptionIds.push(subscriptionId);

      // Send subscription message
      this.sendMessage({
        m: 'quote_add_symbols','`'
        p: [this.sessionId, symbol.toUpperCase()]
      });
    });

    console.log('Subscribed to trades for: ${symbols.join(', ')}');'`
    return subscriptionIds;
  }

  /**
   * Subscribe to market depth (Level 2 data)
   */
  subscribeToDepth(
    symbols: string[],
    callback: (depth: DepthUpdate) => void,
    levels: number = 10
  ): string[] {
    const subscriptionIds: string[] = [];

    symbols.forEach(symbol => {
      const subscriptionId = this.generateSubscriptionId(symbol, 'depth');'
      
      const subscription: Subscription = {
        symbol: symbol.toUpperCase(),
        type: 'depth','
        params: { levels },
        callback
      };

      this.subscriptions.set(subscriptionId, subscription);
      subscriptionIds.push(subscriptionId);

      // Send subscription message for depth
      this.sendMessage({
        m: 'depth_add_symbols','`'
        p: [this.sessionId, symbol.toUpperCase(), levels]
      });
    });

    console.log('Subscribed to market depth for: ${symbols.join(', ')}');'`'
    return subscriptionIds;
  }

  /**
   * Subscribe to technical indicators
   */
  subscribeToIndicators(
    symbols: string[],
    indicators: string[],
    callback: (indicator: IndicatorUpdate) => void,
    params?: Record<string, unknown>):  string[] {
    const subscriptionIds: string[] = [];

    symbols.forEach(symbol => {
      indicators.forEach(indicator => {
        const subscriptionId = this.generateSubscriptionId('${symbol}_${indicator}', 'indicator');'`
        
        const subscription: Subscription = {
          symbol: symbol.toUpperCase(),
          type: 'indicator','
          params: { indicator, ...params },
          callback
        };

        this.subscriptions.set(subscriptionId, subscription);
        subscriptionIds.push(subscriptionId);

        // Send subscription message for indicators
        this.sendMessage({
          m: 'create_study','`'
          p: [this.sessionId, '${symbol.toUpperCase()}_${indicator}', 'st1', symbol.toUpperCase(), indicator, params || {}]'`'
        });
      });
    });

    console.log('Subscribed to indicators for: ${symbols.join(', ')}');'`
    return subscriptionIds;
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionIds: string[]): void {
    subscriptionIds.forEach(id => {
      const subscription = this.subscriptions.get(id);
      if (subscription) {
        // Send unsubscribe message based on type
        switch (subscription.type) {
          case 'quote':'
          case 'trade':'
            this.sendMessage({
              m: 'quote_remove_symbols','
              p: [this.sessionId, subscription.symbol]
            });
            break;
          case 'depth':'
            this.sendMessage({
              m: 'depth_remove_symbols','
              p: [this.sessionId, subscription.symbol]
            });
            break;
          case 'indicator':'
            this.sendMessage({
              m: 'remove_study','``
              p: [this.sessionId, `${subscription.symbol}_${subscription.params?.indicator}']
            });
            break;
        }

        this.subscriptions.delete(id);
      }
    });

    console.log('Unsubscribed from ${subscriptionIds.length} subscriptions');
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    subscriptions: number;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('TradingView WebSocket connected`);`'
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Generate session ID
    this.sessionId = 'session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';

    // Initialize connection
    this.sendMessage({
      m: 'set_auth_token','
      p: [this.config.apiKey]
    });

    this.sendMessage({
      m: 'chart_create_session','
      p: [this.sessionId, ']'
    });

    // Start ping timer
    this.startPingTimer();

    // Start rate limit timer
    this.startRateLimitTimer();

    // Re-establish subscriptions if any
    this.reestablishSubscriptions();

    this.emit('connected');'
  }

  /**
   * Handle WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = event.data;
      
      // TradingView uses a specific protocol format
      if (typeof data === 'string') {'
        // Parse TradingView protocol messages
        const messages = this.parseTradingViewMessage(data);
        
        messages.forEach(message => {
          this.processMessage(message);
        });
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);'
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    console.error('TradingView WebSocket error:', error);'
    this.emit('error', error);'`'
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(event: CloseEvent): void {
    console.log('TradingView WebSocket closed: ${event.code} - ${event.reason}');
    this.isConnected = false;

    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }

    // Attempt reconnection if not intentionally closed
    if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }

    this.emit('disconnected', event);'
  }

  /**
   * Parse TradingView protocol messages
   */
  private parseTradingViewMessage(data: string): unknown[] {
    const messages: unknown[] = [];
    
    try {
      // TradingView protocol parsing logic
      const lines = data.split('
').filter(line => line.trim());'
      
      lines.forEach(line => {
        if (line.startsWith('~m~')) {'
          // Extract message length and content
          const parts = line.split('~m~');'
          if (parts.length >= 3) {
            const messageData = parts[2];
            if (messageData.startsWith('{')) {'
              messages.push(JSON.parse(messageData));
            }
          }
        }
      });
    } catch (error) {
      console.error('Error parsing TradingView message:', error);'
    }

    return messages;
  }

  /**
   * Process parsed message
   */
  private processMessage(message: unknown): void {
    try {
      switch (message.m) {
        case 'qsd':'
          this.processQuoteUpdate(message);
          break;
        case 'timescale_update':'
          this.processTradeUpdate(message);
          break;
        case 'depth_update':'
          this.processDepthUpdate(message);
          break;
        case 'study_data':'
          this.processIndicatorUpdate(message);
          break;
        case 'symbol_resolved':'
          this.processSymbolResolution(message);
          break;
        default:
          console.log('Unhandled message type: ', message.m);'
      }
    } catch (error) {
      console.error('Error processing message:', error);'
    }
  }

  /**
   * Process quote updates
   */
  private processQuoteUpdate(message: unknown): void {
    try {
      const params = message.p;
      if (params && params.length >= 2) {
        const symbol = params[1];
        const data = params[2];

        if (data && typeof data === 'object') {'
          const quote: QuoteUpdate = {
            symbol,
            bid: data.bid || 0,
            ask: data.ask || 0,
            last: data.lp || 0,
            volume: data.volume || 0,
            change: data.ch || 0,
            changePercent: data.chp || 0,
            high: data.high || 0,
            low: data.low || 0,
            timestamp: Date.now()
          };

          // Find and call relevant callbacks
          this.subscriptions.forEach(subscription => {
            if (subscription.symbol === symbol && subscription.type === 'quote') {'
              subscription.callback(quote);
            }
          });

          this.emit('quote', quote);'
        }
      }
    } catch (error) {
      console.error('Error processing quote update:', error);'
    }
  }

  /**
   * Process trade updates
   */
  private processTradeUpdate(message: unknown): void {
    try {
      const params = message.p;
      if (params && params.length >= 3) {
        const symbol = params[1];
        const trades = params[2];

        if (Array.isArray(trades)) {
          trades.forEach(tradeData => {
            const trade: TradeUpdate = {
              symbol,
              price: tradeData.price || 0,
              volume: tradeData.volume || 0,
              timestamp: tradeData.time || Date.now(),
              side: tradeData.side || 'unknown',
              exchange: tradeData.exchange || '
            };

            // Find and call relevant callbacks
            this.subscriptions.forEach(subscription => {
              if (subscription.symbol === symbol && subscription.type === 'trade') {'
                subscription.callback(trade);
              }
            });

            this.emit('trade', trade);'
          });
        }
      }
    } catch (error) {
      console.error('Error processing trade update:', error);'
    }
  }

  /**
   * Process market depth updates
   */
  private processDepthUpdate(message: unknown): void {
    try {
      const params = message.p;
      if (params && params.length >= 3) {
        const symbol = params[1];
        const depthData = params[2];

        const depth: DepthUpdate = {
          symbol,
          bids: depthData.bids || [],
          asks: depthData.asks || [],
          timestamp: Date.now()
        };

        // Find and call relevant callbacks
        this.subscriptions.forEach(subscription => {
          if (subscription.symbol === symbol && subscription.type === 'depth') {'
            subscription.callback(depth);
          }
        });

        this.emit('depth', depth);'
      }
    } catch (error) {
      console.error('Error processing depth update:', error);'
    }
  }

  /**
   * Process indicator updates
   */
  private processIndicatorUpdate(message: unknown): void {
    try {
      const params = message.p;
      if (params && params.length >= 4) {
        const studyId = params[1];
        const data = params[3];

        // Extract symbol and indicator from study ID
        const parts = studyId.split('_');'
        if (parts.length >= 2) {
          const symbol = parts[0];
          const indicator = parts[1];

          const indicatorUpdate: IndicatorUpdate = {
            symbol,
            indicator,
            value: data.value || 0,
            timestamp: Date.now()
          };

          // Find and call relevant callbacks
          this.subscriptions.forEach(subscription => {
            if (subscription.symbol === symbol && 
                subscription.type === 'indicator' && '
                subscription.params?.indicator === indicator) {
              subscription.callback(indicatorUpdate);
            }
          });

          this.emit('indicator', indicatorUpdate);'
        }
      }
    } catch (error) {
      console.error('Error processing indicator update:', error);'
    }
  }

  /**
   * Process symbol resolution
   */
  private processSymbolResolution(message: unknown): void {
    console.log('Symbol resolved: ', message);'
  }

  /**
   * Send message with rate limiting
   */
  private sendMessage(message: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, queuing message`);`'
      return;
    }

    const messageString = JSON.stringify(message);
    const formattedMessage = '~m~${messageString.length}~m~${messageString}';
    
    this.messageQueue.push(formattedMessage);
    this.processMessageQueue();
  }

  /**
   * Process message queue with rate limiting
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    const now = Date.now();
    if (now - this.lastMessageTime >= this.messageInterval) {
      const message = this.messageQueue.shift();
      if (message && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(message);
        this.lastMessageTime = now;
      }
    }
  }

  /**
   * Start ping timer
   */
  private startPingTimer(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('~h~');'`'
      }
    }, this.config.pingInterval);
  }

  /**
   * Start rate limiting timer
   */
  private startRateLimitTimer(): void {
    this.rateLimitTimer = setInterval(() => {
      this.processMessageQueue();
    }, this.messageInterval);
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(this.config.reconnectInterval * this.reconnectAttempts, 30000);

    console.log('Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms');

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:`, error);'
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      });
    }, delay);
  }

  /**
   * Re-establish subscriptions after reconnection
   */
  private reestablishSubscriptions(): void {
    if (this.subscriptions.size === 0) return;

    console.log('Re-establishing ${this.subscriptions.size} subscriptions');
    
    // Group subscriptions by type for efficiency
    const symbolsByType: { [key: string]: string[] } = {};
    
    this.subscriptions.forEach(subscription => {
      if (!symbolsByType[subscription.type]) {
        symbolsByType[subscription.type] = [];
      }
      symbolsByType[subscription.type].push(subscription.symbol);
    });

    // Re-subscribe by type
    Object.entries(symbolsByType).forEach(([type, symbols]) => {
      switch (type) {
        case 'quote':'
          symbols.forEach(symbol => {
            this.sendMessage({
              m: 'quote_add_symbols','
              p: [this.sessionId, symbol]
            });
          });
          break;
        case 'depth':'
          symbols.forEach(symbol => {
            const subscription = Array.from(this.subscriptions.values())
              .find(sub => sub.symbol === symbol && sub.type === 'depth');'
            
            this.sendMessage({
              m: 'depth_add_symbols','
              p: [this.sessionId, symbol, subscription?.params?.levels || 10]
            });
          });
          break;
        case 'indicator':'
          this.subscriptions.forEach(subscription => {
            if (subscription.type === 'indicator') {'
              this.sendMessage({
                m: 'create_study','`'
                p: [
                  this.sessionId, 
                  '${subscription.symbol}_${subscription.params?.indicator}',
                  'st1','`'
                  subscription.symbol,
                  subscription.params?.indicator,
                  subscription.params || {}
                ]
              });
            }
          });
          break;
      }
    });
  }

  /**
   * Generate subscription ID
   */
  private generateSubscriptionId(symbol: string, type: string): string {
    return '${symbol}_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  }
}

// Export singleton instance
export const tradingViewWebSocket = new TradingViewWebSocketService();