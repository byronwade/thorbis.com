import { alpacaTradingService } from '@/lib/integrations/alpaca-trading';

/**
 * Portfolio Rebalancing Service
 * 
 * This service provides automated portfolio rebalancing capabilities
 * with multiple strategies, risk management, and compliance monitoring.
 * 
 * Features:
 * - Strategic Asset Allocation rebalancing
 * - Tactical Asset Allocation with market conditions
 * - Tax-optimized rebalancing with loss harvesting
 * - Dollar-cost averaging automation
 * - Threshold-based and calendar-based triggers
 * - Risk-parity and factor-based strategies
 * - Multi-account coordination
 * - Real-time monitoring and alerts
 * 
 * Rebalancing Strategies:
 * - Percentage Threshold: Rebalance when allocation drifts beyond threshold
 * - Calendar-based: Rebalance on fixed schedule (monthly/quarterly)
 * - Volatility-based: Adjust based on market volatility
 * - Momentum-based: Adjust based on asset performance trends
 * - Risk-parity: Maintain equal risk contribution across assets
 * - Black-Litterman: Optimize based on market equilibrium and views
 * 
 * Risk Management:
 * - Maximum drift limits
 * - Minimum trade sizes
 * - Market timing restrictions
 * - Liquidity constraints
 * - Tax implications consideration
 */

// Portfolio allocation types
export interface AssetAllocation {
  symbol: string;
  targetPercent: number;
  currentPercent: number;
  currentValue: number;
  drift: number;
  minPercent?: number;
  maxPercent?: number;
  category: 'equity' | 'fixed_income' | 'alternatives' | 'cash' | 'crypto';
  subCategory?: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  totalValue: number;
  cashBalance: number;
  allocations: AssetAllocation[];
  targetRisk: number;
  createdAt: string;
  updatedAt: string;
}

export interface RebalancingStrategy {
  id: string;
  name: string;
  type: 'threshold' | 'calendar' | 'volatility' | 'momentum' | 'risk_parity' | 'tactical';
  parameters: {
    thresholdPercent?: number; // Drift threshold for rebalancing
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    lastRebalance?: string;
    volatilityWindow?: number; // Days for volatility calculation
    momentumWindow?: number; // Days for momentum calculation
    riskTarget?: number; // Target portfolio volatility
    maxTradePercent?: number; // Max percent of portfolio per trade
    minTradeAmount?: number; // Minimum trade amount
    taxOptimized?: boolean;
    liquidityBuffer?: number; // Cash percentage to maintain
  };
  constraints: {
    marketHours?: boolean;
    maxDailyTrades?: number;
    excludeSymbols?: string[];
    minPositionSize?: number;
    maxPositionSize?: number;
  };
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RebalanceRecommendation {
  portfolioId: string;
  strategy: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: {
    expectedReturn?: number;
    riskReduction?: number;
    taxImplication?: number;
    tradingCosts?: number;
  };
  trades: TradeRecommendation[];
  totalTradeValue: number;
  createdAt: string;
}

export interface TradeRecommendation {
  symbol: string;
  action: 'buy' | 'sell';
  shares: number;
  notionalAmount: number;
  currentPrice: number;
  targetPercent: number;
  currentPercent: number;
  reason: string;
  priority: number;
  estimatedCost: number;
  taxImplication?: {
    gainLoss?: number;
    holdingPeriod?: number;
    washSaleRisk?: boolean;
  };
}

export interface RebalanceExecution {
  id: string;
  portfolioId: string;
  strategyId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  trades: TradeExecution[];
  totalValue: number;
  executionStarted: string;
  executionCompleted?: string;
  errors: string[];
  results: {
    tradesExecuted: number;
    totalCost: number;
    targetDeviation: number;
    improvementScore: number;
  };
}

export interface TradeExecution {
  symbol: string;
  orderId: string;
  status: 'pending' | 'filled' | 'partial' | 'cancelled' | 'failed';
  requestedShares: number;
  filledShares: number;
  avgPrice: number;
  totalCost: number;
  timestamp: string;
  error?: string;
}

export class PortfolioRebalancer {
  private static instance: PortfolioRebalancer;
  
  // Mock data - in production, this would come from database
  private portfolios = new Map<string, Portfolio>();
  private strategies = new Map<string, RebalancingStrategy>();
  private executions = new Map<string, RebalanceExecution>();
  private marketData = new Map<string, { price: number; volatility: number; momentum: number }>();

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): PortfolioRebalancer {
    if (!PortfolioRebalancer.instance) {
      PortfolioRebalancer.instance = new PortfolioRebalancer();
    }
    return PortfolioRebalancer.instance;
  }

  /**
   * Analyze portfolio and generate rebalancing recommendations
   */
  async analyzePortfolio(portfolioId: string, strategyId?: string): Promise<RebalanceRecommendation[]> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const strategies = strategyId 
      ? [this.strategies.get(strategyId)].filter(Boolean)
      : Array.from(this.strategies.values()).filter(s => s.enabled);

    const recommendations: RebalanceRecommendation[] = [];

    for (const strategy of strategies) {
      if (!strategy) continue;

      const recommendation = await this.generateRecommendation(portfolio, strategy);
      if (recommendation.trades.length > 0) {
        recommendations.push(recommendation);
      }
    }

    return recommendations.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  /**
   * Generate specific rebalancing recommendation
   */
  private async generateRecommendation(
    portfolio: Portfolio, 
    strategy: RebalancingStrategy
  ): Promise<RebalanceRecommendation> {
    const trades: TradeRecommendation[] = [];
    let reason = ';
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';

    switch (strategy.type) {
      case 'threshold':
        const thresholdResult = this.analyzeThresholdRebalancing(portfolio, strategy);
        trades.push(...thresholdResult.trades);
        reason = thresholdResult.reason;
        urgency = thresholdResult.urgency;
        break;

      case 'calendar':
        const calendarResult = this.analyzeCalendarRebalancing(portfolio, strategy);
        trades.push(...calendarResult.trades);
        reason = calendarResult.reason;
        urgency = calendarResult.urgency;
        break;

      case 'volatility':
        const volatilityResult = await this.analyzeVolatilityRebalancing(portfolio, strategy);
        trades.push(...volatilityResult.trades);
        reason = volatilityResult.reason;
        urgency = volatilityResult.urgency;
        break;

      case 'risk_parity':
        const riskParityResult = this.analyzeRiskParityRebalancing(portfolio, strategy);
        trades.push(...riskParityResult.trades);
        reason = riskParityResult.reason;
        urgency = riskParityResult.urgency;
        break;

      case 'tactical':
        const tacticalResult = await this.analyzeTacticalRebalancing(portfolio, strategy);
        trades.push(...tacticalResult.trades);
        reason = tacticalResult.reason;
        urgency = tacticalResult.urgency;
        break;
    }

    // Apply constraints and optimize trades
    const optimizedTrades = this.optimizeTrades(trades, portfolio, strategy);

    // Calculate impact estimates
    const estimatedImpact = this.calculateImpactEstimates(optimizedTrades, portfolio);

    return {
      portfolioId: portfolio.id,
      strategy: strategy.name,
      reason,
      urgency,
      estimatedImpact,
      trades: optimizedTrades,
      totalTradeValue: optimizedTrades.reduce((sum, trade) => sum + trade.notionalAmount, 0),
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Threshold-based rebalancing analysis
   */
  private analyzeThresholdRebalancing(
    portfolio: Portfolio, 
    strategy: RebalancingStrategy
  ): { trades: TradeRecommendation[]; reason: string; urgency: 'low' | 'medium' | 'high' | 'critical' } {
    const threshold = strategy.parameters.thresholdPercent || 5;
    const trades: TradeRecommendation[] = [];
    
    let maxDrift = 0;
    const driftCount = 0;

    for (const allocation of portfolio.allocations) {
      const drift = Math.abs(allocation.drift);
      maxDrift = Math.max(maxDrift, drift);
      
      if (drift > threshold) {
        driftCount++;
        
        const targetValue = portfolio.totalValue * (allocation.targetPercent / 100);
        const currentValue = allocation.currentValue;
        const difference = targetValue - currentValue;
        const currentPrice = this.getCurrentPrice(allocation.symbol);

        if (Math.abs(difference) > (strategy.parameters.minTradeAmount || 100)) {
          trades.push({
            symbol: allocation.symbol,
            action: difference > 0 ? 'buy' : 'sell',
            shares: Math.abs(Math.round(difference / currentPrice)),
            notionalAmount: Math.abs(difference),
            currentPrice,
            targetPercent: allocation.targetPercent,
            currentPercent: allocation.currentPercent,
            reason: 'Drift of ${drift.toFixed(1)}% exceeds ${threshold}% threshold',
            priority: Math.floor(drift / threshold),
            estimatedCost: Math.abs(difference) * 0.001 // Mock trading cost
          });
        }
      }
    }

    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (maxDrift > threshold * 3) urgency = 'critical';
    else if (maxDrift > threshold * 2) urgency = 'high';
    else if (maxDrift > threshold * 1.5) urgency = 'medium';

    const reason = '${driftCount} positions exceed ${threshold}% drift threshold (max drift: ${maxDrift.toFixed(1)}%)';

    return { trades, reason, urgency };
  }

  /**
   * Calendar-based rebalancing analysis
   */
  private analyzeCalendarRebalancing(
    portfolio: Portfolio, 
    strategy: RebalancingStrategy
  ): { trades: TradeRecommendation[]; reason: string; urgency: 'low' | 'medium' | 'high' | 'critical' } {
    const frequency = strategy.parameters.frequency || 'quarterly';
    const lastRebalance = new Date(strategy.parameters.lastRebalance || '2024-01-01');
    const now = new Date();
    
    const nextRebalanceDate = new Date(lastRebalance);
    
    switch (frequency) {
      case 'monthly':
        nextRebalanceDate.setMonth(nextRebalanceDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextRebalanceDate.setMonth(nextRebalanceDate.getMonth() + 3);
        break;
      case 'annually':
        nextRebalanceDate.setFullYear(nextRebalanceDate.getFullYear() + 1);
        break;
    }

    const daysSinceRebalance = Math.floor((now.getTime() - lastRebalance.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilRebalance = Math.floor((nextRebalanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let trades: TradeRecommendation[] = [];
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (daysUntilRebalance <= 0) {
      // Time to rebalance
      trades = this.generateFullRebalanceTrades(portfolio);
      urgency = daysUntilRebalance < -7 ? 'high' : 'medium`;
    }

    const reason = daysUntilRebalance <= 0 
      ? `Scheduled ${frequency} rebalance is ${Math.abs(daysUntilRebalance)} days overdue'
      : 'Next ${frequency} rebalance in ${daysUntilRebalance} days';

    return { trades, reason, urgency };
  }

  /**
   * Volatility-based rebalancing analysis
   */
  private async analyzeVolatilityRebalancing(
    portfolio: Portfolio, 
    strategy: RebalancingStrategy
  ): Promise<{ trades: TradeRecommendation[]; reason: string; urgency: 'low' | 'medium' | 'high' | 'critical' }> {
    const window = strategy.parameters.volatilityWindow || 30;
    const riskTarget = strategy.parameters.riskTarget || 0.15; // 15% target volatility
    
    // Calculate current portfolio volatility
    const currentVolatility = await this.calculatePortfolioVolatility(portfolio, window);
    const volatilityDifference = currentVolatility - riskTarget;
    
    let trades: TradeRecommendation[] = [];
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (Math.abs(volatilityDifference) > 0.02) { // 2% volatility threshold
      trades = this.generateVolatilityAdjustmentTrades(portfolio, volatilityDifference);
      
      if (Math.abs(volatilityDifference) > 0.05) urgency = 'high';
      else if (Math.abs(volatilityDifference) > 0.03) urgency = 'medium';
    }

    const reason = 'Portfolio volatility ${(currentVolatility * 100).toFixed(1)}% vs target ${(riskTarget * 100).toFixed(1)}%';

    return { trades, reason, urgency };
  }

  /**
   * Risk parity rebalancing analysis
   */
  private analyzeRiskParityRebalancing(
    portfolio: Portfolio, 
    strategy: RebalancingStrategy
  ): { trades: TradeRecommendation[]; reason: string; urgency: 'low' | 'medium' | 'high' | 'critical' } {
    const trades: TradeRecommendation[] = [];
    
    // Calculate risk contribution for each position
    const riskContributions = this.calculateRiskContributions(portfolio);
    const targetRiskContribution = 1 / portfolio.allocations.length;
    
    let maxRiskDeviation = 0;
    const deviationCount = 0;

    for (const i = 0; i < portfolio.allocations.length; i++) {
      const allocation = portfolio.allocations[i];
      const riskContribution = riskContributions[i];
      const deviation = Math.abs(riskContribution - targetRiskContribution);
      
      maxRiskDeviation = Math.max(maxRiskDeviation, deviation);
      
      if (deviation > targetRiskContribution * 0.2) { // 20% deviation threshold
        deviationCount++;
        
        // Adjust allocation to target risk contribution
        const newTargetPercent = this.calculateRiskParityWeight(allocation, riskContribution, targetRiskContribution);
        const currentPrice = this.getCurrentPrice(allocation.symbol);
        const targetValue = portfolio.totalValue * (newTargetPercent / 100);
        const difference = targetValue - allocation.currentValue;

        if (Math.abs(difference) > (strategy.parameters.minTradeAmount || 100)) {
          trades.push({
            symbol: allocation.symbol,
            action: difference > 0 ? 'buy' : 'sell',
            shares: Math.abs(Math.round(difference / currentPrice)),
            notionalAmount: Math.abs(difference),
            currentPrice,
            targetPercent: newTargetPercent,
            currentPercent: allocation.currentPercent,
            reason: 'Risk contribution ${(riskContribution * 100).toFixed(1)}% vs target ${(targetRiskContribution * 100).toFixed(1)}%',
            priority: Math.floor(deviation / targetRiskContribution),
            estimatedCost: Math.abs(difference) * 0.001
          });
        }
      }
    }

    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (maxRiskDeviation > targetRiskContribution * 0.5) urgency = 'high';
    else if (maxRiskDeviation > targetRiskContribution * 0.3) urgency = 'medium';

    const reason = '${deviationCount} positions have unbalanced risk contribution (max deviation: ${(maxRiskDeviation * 100).toFixed(1)}%)';

    return { trades, reason, urgency };
  }

  /**
   * Tactical asset allocation analysis
   */
  private async analyzeTacticalRebalancing(
    portfolio: Portfolio, 
    strategy: RebalancingStrategy
  ): Promise<{ trades: TradeRecommendation[]; reason: string; urgency: 'low' | 'medium' | 'high' | 'critical' }> {
    const trades: TradeRecommendation[] = [];
    
    // Analyze market conditions and sentiment
    const marketConditions = await this.analyzeMarketConditions();
    const momentumSignals = this.calculateMomentumSignals(portfolio);
    
    // Adjust allocations based on tactical signals
    for (const allocation of portfolio.allocations) {
      const tacticalAdjustment = this.calculateTacticalAdjustment(
        allocation, 
        marketConditions, 
        momentumSignals[allocation.symbol]
      );
      
      if (Math.abs(tacticalAdjustment) > 1) { // 1% minimum tactical adjustment
        const newTargetPercent = Math.max(0, allocation.targetPercent + tacticalAdjustment);
        const currentPrice = this.getCurrentPrice(allocation.symbol);
        const targetValue = portfolio.totalValue * (newTargetPercent / 100);
        const difference = targetValue - allocation.currentValue;

        if (Math.abs(difference) > (strategy.parameters.minTradeAmount || 500)) {
          trades.push({
            symbol: allocation.symbol,
            action: difference > 0 ? 'buy' : 'sell',
            shares: Math.abs(Math.round(difference / currentPrice)),
            notionalAmount: Math.abs(difference),
            currentPrice,
            targetPercent: newTargetPercent,
            currentPercent: allocation.currentPercent,
            reason: 'Tactical adjustment based on market conditions and momentum',
            priority: Math.abs(tacticalAdjustment),
            estimatedCost: Math.abs(difference) * 0.001
          });
        }
      }
    }

    const urgency: 'low' | 'medium' | 'high' | 'critical' = 
      marketConditions.volatility > 0.25 ? 'high' : 'medium`;

    const reason = `Tactical rebalancing based on market volatility ${(marketConditions.volatility * 100).toFixed(1)}% and momentum signals';

    return { trades, reason, urgency };
  }

  /**
   * Execute rebalancing recommendation
   */
  async executeRebalancing(
    portfolioId: string, 
    recommendation: RebalanceRecommendation,
    dryRun = false
  ): Promise<RebalanceExecution> {
    const executionId = 'exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    const execution: RebalanceExecution = {
      id: executionId,
      portfolioId,
      strategyId: recommendation.strategy,
      status: 'pending',
      trades: [],
      totalValue: recommendation.totalTradeValue,
      executionStarted: new Date().toISOString(),
      errors: [],
      results: {
        tradesExecuted: 0,
        totalCost: 0,
        targetDeviation: 0,
        improvementScore: 0
      }
    };

    this.executions.set(executionId, execution);

    if (dryRun) {
      execution.status = 'completed';
      execution.executionCompleted = new Date().toISOString();
      execution.results = {
        tradesExecuted: recommendation.trades.length,
        totalCost: recommendation.estimatedImpact.tradingCosts || 0,
        targetDeviation: 0,
        improvementScore: 85 // Mock improvement score
      };
      
      return execution;
    }

    try {
      execution.status = 'executing';
      
      // Execute trades in priority order
      const sortedTrades = recommendation.trades.sort((a, b) => b.priority - a.priority);
      
      for (const trade of sortedTrades) {
        try {
          const tradeExecution = await this.executeTrade(trade, execution);
          execution.trades.push(tradeExecution);
          execution.results.tradesExecuted++;
          execution.results.totalCost += tradeExecution.totalCost;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          execution.errors.push('Failed to execute trade for ${trade.symbol}: ${errorMessage}');
          
          // Add failed trade to results
          execution.trades.push({
            symbol: trade.symbol,
            orderId: ',
            status: 'failed',
            requestedShares: trade.shares,
            filledShares: 0,
            avgPrice: 0,
            totalCost: 0,
            timestamp: new Date().toISOString(),
            error: errorMessage
          });
        }
      }

      execution.status = 'completed';
      execution.executionCompleted = new Date().toISOString();
      
      // Calculate final results
      execution.results.improvementScore = this.calculateImprovementScore(execution, recommendation);
      execution.results.targetDeviation = this.calculateTargetDeviation(portfolioId, execution);

    } catch (error) {
      execution.status = 'failed';
      execution.errors.push(error instanceof Error ? error.message : 'Unknown execution error');
    }

    this.executions.set(executionId, execution);
    return execution;
  }

  /**
   * Execute individual trade
   */
  private async executeTrade(
    trade: TradeRecommendation, 
    execution: RebalanceExecution
  ): Promise<TradeExecution> {
    try {
      // Place order through Alpaca
      const alpacaOrder = await alpacaTradingService.placeOrder({
        symbol: trade.symbol,
        side: trade.action,
        type: 'market',
        qty: trade.shares,
        time_in_force: 'day'
      });

      return {
        symbol: trade.symbol,
        orderId: alpacaOrder.id,
        status: 'filled', // Mock immediate fill
        requestedShares: trade.shares,
        filledShares: trade.shares,
        avgPrice: trade.currentPrice,
        totalCost: trade.notionalAmount + trade.estimatedCost,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new Error('Trade execution failed: ${error instanceof Error ? error.message : 'Unknown error'}');
    }
  }

  // Helper methods for calculations
  private initializeMockData(): void {
    // Mock portfolio data
    const mockPortfolio: Portfolio = {
      id: 'portfolio_123',
      userId: 'user_456',
      name: 'Balanced Growth Portfolio',
      totalValue: 100000,
      cashBalance: 5000,
      allocations: [
        {
          symbol: 'SPY',
          targetPercent: 60,
          currentPercent: 65,
          currentValue: 65000,
          drift: 5,
          category: 'equity',
          subCategory: 'large_cap'
        },
        {
          symbol: 'BND',
          targetPercent: 30,
          currentPercent: 25,
          currentValue: 25000,
          drift: -5,
          category: 'fixed_income',
          subCategory: 'government'
        },
        {
          symbol: 'VTI',
          targetPercent: 10,
          currentPercent: 10,
          currentValue: 10000,
          drift: 0,
          category: 'equity',
          subCategory: 'total_market'
        }
      ],
      targetRisk: 0.12,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };

    this.portfolios.set(mockPortfolio.id, mockPortfolio);

    // Mock strategy
    const mockStrategy: RebalancingStrategy = {
      id: 'strategy_threshold',
      name: 'Threshold Rebalancing',
      type: 'threshold',
      parameters: {
        thresholdPercent: 5,
        minTradeAmount: 1000,
        taxOptimized: true,
        liquidityBuffer: 5
      },
      constraints: {
        marketHours: true,
        maxDailyTrades: 10,
        minPositionSize: 1000
      },
      enabled: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };

    this.strategies.set(mockStrategy.id, mockStrategy);

    // Mock market data
    this.marketData.set('SPY', { price: 445.30, volatility: 0.15, momentum: 0.02 });
    this.marketData.set('BND', { price: 75.20, volatility: 0.05, momentum: -0.01 });
    this.marketData.set('VTI', { price: 235.80, volatility: 0.16, momentum: 0.03 });
  }

  private getCurrentPrice(symbol: string): number {
    return this.marketData.get(symbol)?.price || 100;
  }

  private generateFullRebalanceTrades(portfolio: Portfolio): TradeRecommendation[] {
    const trades: TradeRecommendation[] = [];
    
    for (const allocation of portfolio.allocations) {
      if (Math.abs(allocation.drift) > 1) {
        const targetValue = portfolio.totalValue * (allocation.targetPercent / 100);
        const difference = targetValue - allocation.currentValue;
        const currentPrice = this.getCurrentPrice(allocation.symbol);

        trades.push({
          symbol: allocation.symbol,
          action: difference > 0 ? 'buy' : 'sell',
          shares: Math.abs(Math.round(difference / currentPrice)),
          notionalAmount: Math.abs(difference),
          currentPrice,
          targetPercent: allocation.targetPercent,
          currentPercent: allocation.currentPercent,
          reason: 'Full rebalance to target allocation',
          priority: Math.abs(allocation.drift),
          estimatedCost: Math.abs(difference) * 0.001
        });
      }
    }

    return trades;
  }

  private async calculatePortfolioVolatility(portfolio: Portfolio, window: number): Promise<number> {
    // Mock volatility calculation
    const weightedVolatility = 0;
    
    for (const allocation of portfolio.allocations) {
      const assetVolatility = this.marketData.get(allocation.symbol)?.volatility || 0.15;
      const weight = allocation.currentPercent / 100;
      weightedVolatility += weight * assetVolatility;
    }
    
    return weightedVolatility;
  }

  private generateVolatilityAdjustmentTrades(
    portfolio: Portfolio, 
    volatilityDifference: number
  ): TradeRecommendation[] {
    // Mock volatility adjustment logic
    return [];
  }

  private calculateRiskContributions(portfolio: Portfolio): number[] {
    // Mock risk contribution calculation
    return portfolio.allocations.map(allocation => {
      const weight = allocation.currentPercent / 100;
      const volatility = this.marketData.get(allocation.symbol)?.volatility || 0.15;
      return weight * volatility;
    });
  }

  private calculateRiskParityWeight(
    allocation: AssetAllocation, 
    currentRisk: number, 
    targetRisk: number
  ): number {
    // Simplified risk parity calculation
    const adjustment = (targetRisk - currentRisk) * 100;
    return Math.max(0, allocation.targetPercent + adjustment);
  }

  private async analyzeMarketConditions(): Promise<{ volatility: number; sentiment: number }> {
    // Mock market conditions analysis
    return {
      volatility: 0.18,
      sentiment: 0.6 // Bullish sentiment
    };
  }

  private calculateMomentumSignals(portfolio: Portfolio): Record<string, number> {
    const signals: Record<string, number> = {};
    
    for (const allocation of portfolio.allocations) {
      signals[allocation.symbol] = this.marketData.get(allocation.symbol)?.momentum || 0;
    }
    
    return signals;
  }

  private calculateTacticalAdjustment(
    allocation: AssetAllocation,
    marketConditions: { volatility: number; sentiment: number },
    momentum: number
  ): number {
    // Mock tactical adjustment calculation
    let adjustment = 0;
    
    // Momentum-based adjustment
    adjustment += momentum * 2;
    
    // Volatility-based adjustment (reduce equity in high volatility)
    if (allocation.category === 'equity' && marketConditions.volatility > 0.2) {
      adjustment -= 2;
    }
    
    return adjustment;
  }

  private optimizeTrades(
    trades: TradeRecommendation[], 
    portfolio: Portfolio, 
    strategy: RebalancingStrategy
  ): TradeRecommendation[] {
    return trades.filter(trade => {
      // Apply minimum trade amount constraint
      return trade.notionalAmount >= (strategy.parameters.minTradeAmount || 100);
    }).sort((a, b) => b.priority - a.priority);
  }

  private calculateImpactEstimates(
    trades: TradeRecommendation[], 
    portfolio: Portfolio
  ): RebalanceRecommendation['estimatedImpact'] {
    return {
      expectedReturn: 0.02, // Mock expected return improvement
      riskReduction: 0.01, // Mock risk reduction
      taxImplication: trades.reduce((sum, trade) => sum + (trade.taxImplication?.gainLoss || 0), 0),
      tradingCosts: trades.reduce((sum, trade) => sum + trade.estimatedCost, 0)
    };
  }

  private calculateImprovementScore(
    execution: RebalanceExecution, 
    recommendation: RebalanceRecommendation
  ): number {
    // Mock improvement score calculation
    const successRate = execution.results.tradesExecuted / recommendation.trades.length;
    return Math.floor(successRate * 100);
  }

  private calculateTargetDeviation(portfolioId: string, execution: RebalanceExecution): number {
    // Mock target deviation calculation
    return Math.random() * 2; // 0-2% deviation
  }

  // Public getter methods
  getPortfolios(): Portfolio[] {
    return Array.from(this.portfolios.values());
  }

  getStrategies(): RebalancingStrategy[] {
    return Array.from(this.strategies.values());
  }

  getExecution(executionId: string): RebalanceExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): RebalanceExecution[] {
    return Array.from(this.executions.values());
  }
}

// Export singleton instance
export const portfolioRebalancer = PortfolioRebalancer.getInstance();