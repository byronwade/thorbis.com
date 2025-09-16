/**
 * Investment Platform API Examples Library
 * 
 * This library provides comprehensive code examples for integrating with
 * the Investment Platform API across different programming languages and
 * use cases.
 * 
 * Features:
 * - Multi-language code examples (JavaScript, Python, Go, Java, cURL)
 * - Complete workflow examples (authentication, trading, portfolio management)
 * - Error handling and best practices
 * - Real-world use case scenarios
 * - SDK integration examples
 * - WebSocket streaming examples
 * - Webhook implementation guides
 * 
 * Use Cases Covered:
 * - Portfolio creation and management
 * - Stock and crypto trading
 * - Real-time market data streaming
 * - Automated portfolio rebalancing
 * - Risk assessment and analytics
 * - Transaction history and reporting
 */

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  languages: Record<string, {
    code: string;
    dependencies?: string[];
    notes?: string;
  }>;
  apiEndpoints: string[];
  tags: string[];
}

/**
 * Complete collection of API examples
 */
export const apiExamples: CodeExample[] = [
  // Authentication Examples
  {
    id: 'auth-jwt-token',
    title: 'JWT Authentication',
    description: 'How to authenticate with the API using JWT tokens',
    category: 'Authentication',
    difficulty: 'beginner',
    languages: {
      javascript: {
        code: '// JWT Authentication Example
const API_BASE = 'https://api.thorbis.com/v1';
const JWT_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || 'YOUR_JWT_TOKEN_HERE';

// Set up authentication headers
const headers = {
  'Authorization': \'Bearer \${JWT_TOKEN}\',
  'Content-Type': 'application/json',
  'X-API-Version': '1.0.0'
};

// Make authenticated request
async function getPortfolio(portfolioId) {
  try {
    const response = await fetch(\'\${API_BASE}/investments/portfolio?portfolioId=\${portfolioId}\', {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(\'HTTP error! status: \${response.status}\');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// Usage
getPortfolio('portfolio_123456789')
  .then(portfolio => console.log('Portfolio:', portfolio))'
  .catch(error => console.error('Error:', error));','
        dependencies: ['fetch API (built-in)'],
        notes: 'Replace JWT_TOKEN with your actual token from the authentication endpoint'
      },
      python: {
        code: 'import requests
import json
import os
from typing import Dict, Any

# JWT Authentication Example
API_BASE = 'https://api.thorbis.com/v1'
JWT_TOKEN = os.getenv('THORBIS_JWT_TOKEN', 'YOUR_JWT_TOKEN_HERE')

class InvestmentAPIClient:
    def __init__(self, token: str):
        self.base_url = API_BASE
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'X-API-Version': '1.0.0'
        }
    
    def get_portfolio(self, portfolio_id: str) -> Dict[Any, Any]:
        """Get portfolio information"""
        try:
            response = requests.get(
                f'{self.base_url}/investments/portfolio',
                headers=self.headers,
                params={'portfolioId': portfolio_id},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f'Authentication error: {e}')
            raise

# Usage
client = InvestmentAPIClient(JWT_TOKEN)
portfolio = client.get_portfolio('portfolio_123456789')
print(f'Portfolio: {json.dumps(portfolio, indent=2)}')',
        dependencies: ['requests'],
        notes: 'Install requests: pip install requests'
      },
      curl: {
        code: '#!/bin/bash
# JWT Authentication with cURL

API_BASE="https://api.thorbis.com/v1"
JWT_TOKEN="${THORBIS_JWT_TOKEN}"
PORTFOLIO_ID="portfolio_123456789"

# Get portfolio information
curl -X GET \\
  "\${API_BASE}/investments/portfolio?portfolioId=\${PORTFOLIO_ID}" \\
  -H "Authorization: Bearer \${JWT_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Version: 1.0.0" \\
  -w "\
HTTP Status: %{http_code}\
" \\
  --fail \\
  --silent \\
  --show-error

# Handle different response codes
case $? in
  0) echo "Success!" ;;
  22) echo "HTTP error (4xx/5xx)" ;;
  *) echo "Network error" ;;
esac',
        notes: 'Replace JWT_TOKEN and PORTFOLIO_ID with actual values'
      }
    },
    apiEndpoints: ['/investments/portfolio'],
    tags: ['authentication', 'jwt', 'basic']
  },

  // Portfolio Management Examples
  {
    id: 'portfolio-create',
    title: 'Create Investment Portfolio',
    description: 'Create a new investment portfolio with asset allocations',
    category: 'Portfolio Management',
    difficulty: 'intermediate',
    languages: {
      javascript: {
        code: '// Create Investment Portfolio
async function createPortfolio(portfolioData) {
  const response = await fetch('\${API_BASE}/investments/portfolio', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: portfolioData.name,
      allocations: portfolioData.allocations,
      initialDeposit: portfolioData.initialDeposit,
      riskProfile: portfolioData.riskProfile,
      investmentGoals: portfolioData.investmentGoals
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(\'Portfolio creation failed: \${errorData.error}\');
  }
  
  return response.json();
}

// Example: Create balanced portfolio
const portfolioConfig = {
  name: 'Balanced Growth Portfolio',
  allocations: [
    { symbol: 'VTI', targetPercent: 40, category: 'equity' },  // Total Stock Market
    { symbol: 'VTIAX', targetPercent: 20, category: 'equity' }, // International Stocks
    { symbol: 'BND', targetPercent: 30, category: 'fixed_income' }, // Total Bond Market
    { symbol: 'VTEB', targetPercent: 10, category: 'fixed_income' }  // Tax-Exempt Bonds
  ],
  initialDeposit: 10000.00,
  riskProfile: 'moderate',
  investmentGoals: ['long_term_growth', 'retirement']
};

createPortfolio(portfolioConfig)
  .then(result => {
    console.log('Portfolio created:', result.data);
    console.log('Portfolio ID:', result.data.id);
  })
  .catch(error => console.error('Error:', error));','
        dependencies: ['fetch API'],
        notes: 'Ensure allocations sum to 100% and symbols are valid'
      },
      python: {
        code: 'from dataclasses import dataclass
from typing import List, Optional
import requests

@dataclass
class AssetAllocation:
    symbol: str
    target_percent: float
    category: str

@dataclass
class PortfolioConfig:
    name: str
    allocations: List[AssetAllocation]
    initial_deposit: float
    risk_profile: str
    investment_goals: List[str]

class PortfolioManager:
    def __init__(self, client):
        self.client = client
    
    def create_portfolio(self, config: PortfolioConfig) -> dict:
        """Create a new investment portfolio"""
        # Validate allocations
        total_allocation = sum(alloc.target_percent for alloc in config.allocations)
        if abs(total_allocation - 100.0) > 0.01:
            raise ValueError(f"Allocations must sum to 100%, got {total_allocation}%")
        
        payload = {
            'name': config.name,
            'allocations': [
                {
                    'symbol': alloc.symbol,
                    'targetPercent': alloc.target_percent,
                    'category': alloc.category
                }
                for alloc in config.allocations
            ],
            'initialDeposit': config.initial_deposit,
            'riskProfile': config.risk_profile,
            'investmentGoals': config.investment_goals
        }
        
        response = requests.post(
            f'{self.client.base_url}/investments/portfolio',
            headers=self.client.headers,
            json=payload,
            timeout=30
        )
        
        if not response.ok:
            error_data = response.json()
            raise Exception(f"Portfolio creation failed: {error_data.get('error', 'Unknown error')}")
        
        return response.json()

# Usage example
portfolio_config = PortfolioConfig(
    name='Balanced Growth Portfolio',
    allocations=[
        AssetAllocation('VTI', 40.0, 'equity'),
        AssetAllocation('VTIAX', 20.0, 'equity'),
        AssetAllocation('BND', 30.0, 'fixed_income'),
        AssetAllocation('VTEB', 10.0, 'fixed_income')
    ],
    initial_deposit=10000.00,
    risk_profile='moderate',
    investment_goals=['long_term_growth', 'retirement']
)

manager = PortfolioManager(client)
result = manager.create_portfolio(portfolio_config)
print(f"Portfolio created: {result['data']['id']}")',
        dependencies: ['requests', 'dataclasses'],
        notes: 'Use dataclasses for type safety and validation'
      }
    },
    apiEndpoints: ['/investments/portfolio'],
    tags: ['portfolio', 'creation', 'allocation']
  },

  // Trading Examples
  {
    id: 'stock-trading',
    title: 'Execute Stock Trades',
    description: 'Place buy and sell orders for stocks and ETFs',
    category: 'Trading',
    difficulty: 'intermediate',
    languages: {
      javascript: {
        code: '// Stock Trading Example
class StockTrader {
  constructor(apiClient) {
    this.client = apiClient;
  }
  
  async placeOrder(orderData) {
    // Validate order data
    this.validateOrder(orderData);
    
    const response = await fetch('\${API_BASE}/investments/trading/stocks', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        symbol: orderData.symbol.toUpperCase(),
        side: orderData.side,
        orderType: orderData.orderType,
        qty: orderData.qty,
        limitPrice: orderData.limitPrice,
        stopPrice: orderData.stopPrice,
        timeInForce: orderData.timeInForce || 'day`,
        extendedHours: orderData.extendedHours || false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(\`Trade failed: \${errorData.error}\');
    }
    
    const result = await response.json();
    console.log(\'Order placed: \${result.data.orderId}\');
    return result;
  }
  
  validateOrder(order) {
    const required = ['symbol', 'side', 'orderType'];
    for (const field of required) {
      if (!order[field]) {
        throw new Error(\'Missing required field: \${field}\');
      }
    }
    
    if (!['buy', 'sell'].includes(order.side)) {
      throw new Error('Side must be "buy" or "sell"');
    }
    
    if (['limit', 'stop_limit'].includes(order.orderType) && !order.limitPrice) {
      throw new Error('Limit price required for limit orders');
    }
    
    if (['stop', 'stop_limit'].includes(order.orderType) && !order.stopPrice) {
      throw new Error('Stop price required for stop orders');
    }
  }
  
  async getQuote(symbol) {
    const response = await fetch(
      \'\${API_BASE}/investments/trading/stocks?symbols=\${symbol}&type=quotes\',
      { headers }
    );
    
    if (!response.ok) {
      throw new Error('Failed to get quote');
    }
    
    const data = await response.json();
    return data.data.quotes[0];
  }
}

// Usage examples
const trader = new StockTrader();

// Example 1: Market buy order
const marketBuy = {
  symbol: 'AAPL',
  side: 'buy',
  orderType: 'market',
  qty: 10
};

// Example 2: Limit sell order
const limitSell = {
  symbol: 'AAPL',
  side: 'sell',
  orderType: 'limit',
  qty: 10,
  limitPrice: 155.00,
  timeInForce: 'gtc'
};

// Example 3: Stop-loss order
const stopLoss = {
  symbol: 'AAPL',
  side: 'sell',
  orderType: 'stop',
  qty: 10,
  stopPrice: 145.00
};

// Execute trades
try {
  const quote = await trader.getQuote('AAPL');
  console.log('Current AAPL price:', quote.last);
  
  const order = await trader.placeOrder(marketBuy);
  console.log('Order result:', order);
} catch (error) {
  console.error('Trading error:', error);
}',
        dependencies: ['fetch API'],
        notes: 'Always validate orders and handle errors appropriately'
      },
      python: {
        code: 'from enum import Enum
from typing import Optional, Dict, Any
import requests

class OrderSide(Enum):
    BUY = 'buy'
    SELL = 'sell'

class OrderType(Enum):
    MARKET = 'market'
    LIMIT = 'limit'
    STOP = 'stop'
    STOP_LIMIT = 'stop_limit'

class TimeInForce(Enum):
    DAY = 'day'
    GTC = 'gtc'
    IOC = 'ioc'
    FOK = 'fok'

@dataclass
class StockOrder:
    symbol: str
    side: OrderSide
    order_type: OrderType
    qty: float
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    time_in_force: TimeInForce = TimeInForce.DAY
    extended_hours: bool = False

class StockTrader:
    def __init__(self, client):
        self.client = client
    
    def place_order(self, order: StockOrder) -> Dict[str, Any]:
        """Place a stock order"""
        # Validate order
        self._validate_order(order)
        
        payload = {
            'symbol': order.symbol.upper(),
            'side': order.side.value,
            'orderType': order.order_type.value,
            'qty': order.qty,
            'timeInForce': order.time_in_force.value,
            'extendedHours': order.extended_hours
        }
        
        # Add conditional fields
        if order.limit_price is not None:
            payload['limitPrice'] = order.limit_price
        if order.stop_price is not None:
            payload['stopPrice'] = order.stop_price
        
        response = requests.post(
            f'{self.client.base_url}/investments/trading/stocks',
            headers=self.client.headers,
            json=payload,
            timeout=30
        )
        
        if not response.ok:
            error_data = response.json()
            raise Exception(f"Trade failed: {error_data.get('error', 'Unknown error')}")
        
        result = response.json()
        print(f"Order placed: {result['data']['orderId']}")
        return result
    
    def _validate_order(self, order: StockOrder):
        """Validate order parameters"""
        if order.order_type in [OrderType.LIMIT, OrderType.STOP_LIMIT] and order.limit_price is None:
            raise ValueError("Limit price required for limit orders")
        
        if order.order_type in [OrderType.STOP, OrderType.STOP_LIMIT] and order.stop_price is None:
            raise ValueError("Stop price required for stop orders")
        
        if order.qty <= 0:
            raise ValueError("Quantity must be positive")
    
    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get real-time quote for symbol"""
        response = requests.get(
            f'{self.client.base_url}/investments/trading/stocks',
            headers=self.client.headers,
            params={'symbols': symbol, 'type': 'quotes'},
            timeout=30
        )
        
        if not response.ok:
            raise Exception("Failed to get quote")
        
        data = response.json()
        return data['data']['quotes'][0]

# Usage examples
trader = StockTrader(client)

# Market buy order
market_order = StockOrder(
    symbol='AAPL',
    side=OrderSide.BUY,
    order_type=OrderType.MARKET,
    qty=10
)

# Limit sell order
limit_order = StockOrder(
    symbol='AAPL',
    side=OrderSide.SELL,
    order_type=OrderType.LIMIT,
    qty=10,
    limit_price=155.00,
    time_in_force=TimeInForce.GTC
)

# Execute trades
try:
    quote = trader.get_quote('AAPL')
    print(f"Current AAPL price: ${quote['last']}")
    
    order_result = trader.place_order(market_order)
    print(f"Order ID: {order_result['data']['orderId']}")
except Exception as e:
    print(f"Trading error: {e}")',
        dependencies: ['requests', 'dataclasses', 'enum'],
        notes: 'Use enums for type safety and validation'
      }
    },
    apiEndpoints: ['/investments/trading/stocks'],
    tags: ['trading', 'stocks', 'orders']
  },

  // Real-time Data Examples
  {
    id: 'realtime-market-data',
    title: 'Real-time Market Data Streaming',
    description: 'Subscribe to real-time market data feeds and handle updates',
    category: 'Market Data',
    difficulty: 'advanced',
    languages: {
      javascript: {
        code: '// Real-time Market Data Streaming
class MarketDataStream {
  constructor(apiClient) {
    this.client = apiClient;
    this.subscriptions = new Map();
    this.eventHandlers = new Map();
  }
  
  async subscribeToQuotes(symbols, callback) {
    try {
      const response = await fetch('\${API_BASE}/investments/realtime-data', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'quote',
          symbols: symbols,
          clientId: this.generateClientId()
        })
      });
      
      if (!response.ok) {
        throw new Error('Subscription failed');
      }
      
      const result = await response.json();
      const subscriptionId = result.data.subscriptionId;
      
      this.subscriptions.set(subscriptionId, {
        type: 'quote',
        symbols,
        callback,
        active: true
      });
      
      // Start polling for updates (in production, use WebSocket)
      this.startPolling(subscriptionId);
      
      return subscriptionId;
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  }
  
  async subscribeToTrades(symbols, callback) {
    // Similar implementation for trade data
    const response = await fetch('\${API_BASE}/investments/realtime-data', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'trade',
        symbols: symbols,
        clientId: this.generateClientId()
      })
    });
    
    const result = await response.json();
    const subscriptionId = result.data.subscriptionId;
    
    this.subscriptions.set(subscriptionId, {
      type: 'trade',
      symbols,
      callback,
      active: true
    });
    
    this.startPolling(subscriptionId);
    return subscriptionId;
  }
  
  startPolling(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || !subscription.active) return;
    
    // Simulate real-time updates (in production, use WebSocket)
    const interval = setInterval(async () => {
      if (!this.subscriptions.get(subscriptionId)?.active) {
        clearInterval(interval);
        return;
      }
      
      try {
        // Get latest data
        const response = await fetch(
          \'\${API_BASE}/investments/trading/stocks?symbols=\${subscription.symbols.join(',')}&type=quotes\',
          { headers }
        );
        
        if (response.ok) {
          const data = await response.json();
          subscription.callback(data.data.quotes);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000); // Poll every second
  }
  
  async unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;
    
    subscription.active = false;
    this.subscriptions.delete(subscriptionId);
    
    try {
      await fetch('\${API_BASE}/investments/realtime-data', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          subscriptionIds: [subscriptionId],
          reason: 'User unsubscribe'
        })
      });
    } catch (error) {
      console.error('Unsubscribe error:', error);
    }
  }
  
  generateClientId() {
    return \'client_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\';
  }
  
  // Event handler methods
  onQuoteUpdate(callback) {
    this.eventHandlers.set('quote', callback);
  }
  
  onTradeUpdate(callback) {
    this.eventHandlers.set('trade', callback);
  }
  
  onError(callback) {
    this.eventHandlers.set('error', callback);
  }
}

// Usage example
const marketData = new MarketDataStream();

// Subscribe to real-time quotes
const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];

const quoteSubscription = await marketData.subscribeToQuotes(symbols, (quotes) => {
  quotes.forEach(quote => {
    console.log(\'\${quote.symbol}: $\${quote.last} (\${quote.changePercent > 0 ? '+' : '}\${quote.changePercent.toFixed(2)}%)\');
    
    // Update UI or trigger alerts
    updatePriceDisplay(quote);
    
    // Check for price alerts
    checkPriceAlerts(quote);
  });
});

// Subscribe to trade executions
const tradeSubscription = await marketData.subscribeToTrades(symbols, (trades) => {
  trades.forEach(trade => {
    console.log(\'Trade: \${trade.symbol} - \${trade.volume} shares @ $\${trade.price}\');
  });
});

// Clean up on page unload
window.addEventListener('beforeunload`, () => {
  marketData.unsubscribe(quoteSubscription);
  marketData.unsubscribe(tradeSubscription);
});

function updatePriceDisplay(quote) {
  const element = document.getElementById(\`price-\${quote.symbol}\');
  if (element) {
    element.textContent = \'$\${quote.last}\';
    element.className = quote.change > 0 ? 'price-up' : 'price-down';
  }
}

function checkPriceAlerts(quote) {
  // Implement custom price alert logic
  const userAlerts = getUserPriceAlerts(quote.symbol);
  userAlerts.forEach(alert => {
    if ((alert.type === 'above' && quote.last > alert.price) ||
        (alert.type === 'below' && quote.last < alert.price)) {
      sendPriceAlert(alert, quote);
    }
  });
}',
        dependencies: ['fetch API', 'WebSocket (for production)'],
        notes: 'This example uses polling; production should use WebSocket for real-time data'
      }
    },
    apiEndpoints: ['/investments/realtime-data', '/investments/trading/stocks'],
    tags: ['realtime', 'market-data', 'streaming', 'websocket']
  },

  // Portfolio Rebalancing Examples
  {
    id: 'portfolio-rebalancing',
    title: 'Automated Portfolio Rebalancing',
    description: 'Analyze portfolio drift and execute rebalancing trades automatically',
    category: 'Portfolio Management',
    difficulty: 'advanced`,
    languages: {
      javascript: {
        code: `// Automated Portfolio Rebalancing
class PortfolioRebalancer {
  constructor(apiClient) {
    this.client = apiClient;
    this.rebalancingStrategies = new Map();
  }
  
  async analyzePortfolio(portfolioId, strategyId = null) {
    const response = await fetch(
      \`\${API_BASE}/investments/portfolio-rebalance?action=analyze&portfolioId=\${portfolioId}\' +
      (strategyId ? \'&strategyId=\${strategyId}\' : ') +
      '&includeMetrics=true',
      { headers }
    );
    
    if (!response.ok) {
      throw new Error('Portfolio analysis failed');
    }
    
    const analysis = await response.json();
    return analysis.data;
  }
  
  async executeRebalancing(portfolioId, options = {}) {
    const {
      dryRun = false,
      maxTradeValue = null,
      strategyId = null,
      confirmRisks = false
    } = options;
    
    // Get rebalancing recommendations
    const analysis = await this.analyzePortfolio(portfolioId, strategyId);
    
    if (analysis.recommendations.length === 0) {
      console.log('Portfolio is already well balanced');
      return { message: 'No rebalancing needed' };
    }
    
    // Filter high-priority recommendations
    const highPriorityRecs = analysis.recommendations.filter(
      rec => rec.urgency === 'high' || rec.urgency === 'critical'
    );
    
    if (highPriorityRecs.length === 0 && !confirmRisks) {
      console.log('No high-priority rebalancing needed');
      return { message: 'No urgent rebalancing required' };
    }
    
    // Execute rebalancing
    const response = await fetch('\${API_BASE}/investments/portfolio-rebalance', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: dryRun ? 'simulate' : 'execute',
        portfolioId: portfolioId,
        strategyId: strategyId,
        dryRun: dryRun,
        maxTradeValue: maxTradeValue,
        confirmRisks: confirmRisks,
        executeAll: false // Only execute highest priority recommendation
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(\'Rebalancing failed: \${errorData.error}\');
    }
    
    const result = await response.json();
    
    // Log execution details
    console.log('Rebalancing Result:', {`
      executionsStarted: result.data.executionsStarted,
      totalValue: result.data.totalValue,
      isDryRun: dryRun
    });
    
    // Monitor execution status
    if (!dryRun && result.data.executions.length > 0) {
      for (const execution of result.data.executions) {
        await this.monitorExecution(execution.id);
      }
    }
    
    return result.data;
  }
  
  async monitorExecution(executionId) {
    console.log(\`Monitoring execution: \${executionId}\`);
    
    const checkStatus = async () => {
      const response = await fetch(
        \`\${API_BASE}/investments/portfolio-rebalance?action=executions&portfolioId=\${portfolioId}\',
        { headers }
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const execution = data.data.executions.find(exec => exec.id === executionId);
      
      if (!execution) return null;
      
      console.log(\'Execution \${executionId} status: \${execution.status}\');
      
      if (execution.status === 'completed') {
        console.log('Rebalancing completed successfully:', {'
          tradesExecuted: execution.results.tradesExecuted,
          totalCost: execution.results.totalCost,
          improvementScore: execution.results.improvementScore
        });
        return execution;
      }
      
      if (execution.status === 'failed') {
        console.error('Rebalancing failed:', execution.errors);
        return execution;
      }
      
      // Continue monitoring
      setTimeout(checkStatus, 5000); // Check every 5 seconds
    };
    
    return checkStatus();
  }
  
  async scheduleRebalancing(portfolioId, schedule) {
    // Schedule automatic rebalancing
    const response = await fetch('\${API_BASE}/investments/portfolio-rebalance', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'schedule',
        portfolioId: portfolioId,
        scheduleTime: schedule.nextRun,
        strategyId: schedule.strategyId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to schedule rebalancing');
    }
    
    return response.json();
  }
  
  // Helper methods
  formatRebalancingReport(analysis) {
    return {
      portfolioId: analysis.analysis.portfolioId,
      totalRecommendations: analysis.analysis.totalRecommendations,
      urgentActions: analysis.analysis.highUrgencyCount,
      estimatedCosts: analysis.summary.estimatedImpact.totalTradingCosts,
      expectedImprovement: analysis.summary.estimatedImpact.expectedReturnImprovement,
      maxDrift: analysis.portfolioMetrics?.maxDrift || 0,
      recommendations: analysis.recommendations.map(rec => ({
        strategy: rec.strategy,
        urgency: rec.urgency,
        reason: rec.reason,
        tradeCount: rec.trades?.length || 0,
        totalValue: rec.totalTradeValue
      }))
    };
  }
}

// Usage Examples
const rebalancer = new PortfolioRebalancer();

// Example 1: Analyze and rebalance portfolio
async function rebalanceMyPortfolio() {
  const portfolioId = 'portfolio_123456789';
  
  try {
    // 1. Analyze current portfolio
    console.log('Analyzing portfolio...');
    const analysis = await rebalancer.analyzePortfolio(portfolioId);
    
    // 2. Generate report
    const report = rebalancer.formatRebalancingReport(analysis);
    console.log('Rebalancing Report:', report);
    
    // 3. Execute rebalancing if needed
    if (report.urgentActions > 0) {
      console.log('Executing urgent rebalancing...');
      
      // First, do a dry run
      const dryRunResult = await rebalancer.executeRebalancing(portfolioId, {
        dryRun: true,
        maxTradeValue: 10000 // Limit to $10k in trades
      });
      
      console.log('Dry run result:', dryRunResult);
      
      // If dry run looks good, execute for real
      const confirmation = confirm('Execute rebalancing trades?');
      if (confirmation) {
        const result = await rebalancer.executeRebalancing(portfolioId, {
          dryRun: false,
          maxTradeValue: 10000,
          confirmRisks: true
        });
        
        console.log('Rebalancing executed:', result);
      }
    } else {
      console.log('No urgent rebalancing needed');
    }
  } catch (error) {
    console.error('Rebalancing error:', error);
  }
}

// Example 2: Schedule automatic rebalancing
async function scheduleAutoRebalancing() {
  const schedule = {
    nextRun: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    strategyId: 'strategy_threshold' // Use threshold-based strategy
  };
  
  const result = await rebalancer.scheduleRebalancing('portfolio_123456789', schedule);
  console.log('Scheduled rebalancing:', result);
}

// Run examples
rebalanceMyPortfolio();
scheduleAutoRebalancing();',
        dependencies: ['fetch API'],
        notes: 'Always test with dry runs before executing real trades'
      }
    },
    apiEndpoints: ['/investments/portfolio-rebalance'],
    tags: ['rebalancing', 'automation', 'portfolio', 'advanced']
  }
];

/**
 * Get examples by category
 */
export function getExamplesByCategory(category: string): CodeExample[] {
  return apiExamples.filter(example => example.category === category);
}

/**
 * Get examples by difficulty level
 */
export function getExamplesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): CodeExample[] {
  return apiExamples.filter(example => example.difficulty === difficulty);
}

/**
 * Get examples by programming language
 */
export function getExamplesByLanguage(language: string): CodeExample[] {
  return apiExamples.filter(example => example.languages[language]);
}

/**
 * Search examples by tags or keywords
 */
export function searchExamples(query: string): CodeExample[] {
  const lowercaseQuery = query.toLowerCase();
  return apiExamples.filter(example => {
    return (
      example.title.toLowerCase().includes(lowercaseQuery) ||
      example.description.toLowerCase().includes(lowercaseQuery) ||
      example.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      example.category.toLowerCase().includes(lowercaseQuery)
    );
  });
}

/**
 * Get all available categories
 */
export function getAllCategories(): string[] {
  return [...new Set(apiExamples.map(example => example.category))];
}

/**
 * Get all available programming languages
 */
export function getAllLanguages(): string[] {
  const languages = new Set<string>();
  apiExamples.forEach(example => {
    Object.keys(example.languages).forEach(lang => languages.add(lang));
  });
  return Array.from(languages);
}

/**
 * Get all available tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  apiExamples.forEach(example => {
    example.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
}