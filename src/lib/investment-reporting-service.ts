/**
 * Investment Reporting Service
 * 
 * This service provides comprehensive reporting capabilities for investment
 * activities, including tax documentation, portfolio performance analysis,
 * and regulatory compliance reporting.
 * 
 * Features:
 * - Tax-loss harvesting reports
 * - Capital gains/losses calculations
 * - Portfolio performance analytics
 * - Risk-adjusted return metrics
 * - Regulatory compliance reports (1099, 1042-S)
 * - Custom date range reporting
 * - Multi-format exports (PDF, CSV, Excel)
 * - Automated report generation and scheduling
 * 
 * Tax Compliance:
 * - IRS Form 1099-B (Proceeds from Broker and Barter Exchange Transactions)
 * - IRS Form 1099-DIV (Dividends and Distributions)
 * - IRS Form 1099-INT (Interest Income)
 * - IRS Form 1042-S (Foreign Person's U.S. Source Income)'
 * - Schedule D (Capital Gains and Losses)
 * - Wash Sale Rule compliance
 * - Cost basis tracking (FIFO, LIFO, Average Cost, Specific ID)
 * 
 * Performance Metrics:
 * - Time-weighted returns
 * - Money-weighted returns (IRR)
 * - Sharpe ratio, Alpha, Beta
 * - Maximum drawdown
 * - Volatility and standard deviation
 * - Benchmark comparisons
 */

import { z } from 'zod';'

// Data Types
export interface TaxReport {
  id: string;
  userId: string;
  portfolioId: string;
  taxYear: number;
  generatedAt: string;'
  reportType: 'annual' | 'quarterly' | 'custom';'
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: TaxReportSummary;
  capitalGains: CapitalGainsReport;
  dividendIncome: DividendIncomeReport;
  interestIncome: InterestIncomeReport;
  washSales: WashSaleReport[];
  forms: TaxForm[];
  metadata: {
    costBasisMethod: 'fifo' | 'lifo' | 'average_cost' | 'specific_id';'
    includeRealized: boolean;
    includeUnrealized: boolean;
    includeReinvested: boolean;
  };
}

export interface TaxReportSummary {
  totalRealizedGains: number;
  totalRealizedLosses: number;
  netRealizedGainLoss: number;
  totalUnrealizedGains: number;
  totalUnrealizedLosses: number;
  netUnrealizedGainLoss: number;
  totalDividendIncome: number;
  totalInterestIncome: number;
  totalTaxLiability: number;
  estimatedTaxOwed: number;
  taxLossCarryforward: number;
}

export interface CapitalGainsReport {
  shortTermGains: CapitalGainTransaction[];
  longTermGains: CapitalGainTransaction[];
  shortTermTotal: number;
  longTermTotal: number;
  netCapitalGain: number;
  washSalesAdjustment: number;
}

export interface CapitalGainTransaction {
  transactionId: string;
  symbol: string;
  quantity: number;
  purchaseDate: string;
  saleDate: string;
  purchasePrice: number;
  salePrice: number;
  costBasis: number;
  proceeds: number;
  gainLoss: number;
  holdingPeriod: number;
  isWashSale: boolean;
  washSaleAdjustment?: number;
}

export interface DividendIncomeReport {
  ordinaryDividends: DividendTransaction[];
  qualifiedDividends: DividendTransaction[];
  totalOrdinaryDividends: number;
  totalQualifiedDividends: number;
  foreignDividends: number;
  foreignTaxPaid: number;
}

export interface DividendTransaction {
  transactionId: string;
  symbol: string;
  payDate: string;
  amount: number;
  dividendType: 'ordinary' | 'qualified' | 'capital_gains' | 'return_of_capital';'
  foreignTaxPaid?: number;
  reinvested: boolean;
}

export interface InterestIncomeReport {
  transactions: InterestTransaction[];
  totalInterestIncome: number;
  taxExemptInterest: number;
  foreignInterest: number;
}

export interface InterestTransaction {
  transactionId: string;
  source: string;
  date: string;
  amount: number;
  interestType: 'taxable' | 'tax_exempt' | 'foreign';'
  reinvested: boolean;
}

export interface WashSaleReport {
  originalSaleId: string;
  symbol: string;
  saleDate: string;
  saleQuantity: number;
  purchaseDate: string;
  purchaseQuantity: number;
  disallowedLoss: number;
  adjustedCostBasis: number;
  reason: string;
}

export interface TaxForm {
  formType: '1099-B' | '1099-DIV' | '1099-INT' | '1042-S' | 'Schedule-D';'
  formData: Record<string, unknown>;
  generated: boolean;
  filePath?: string;
}

export interface PerformanceReport {
  id: string;
  userId: string;
  portfolioId: string;
  generatedAt: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  returns: PerformanceReturns;
  riskMetrics: RiskMetrics;
  benchmarkComparison: BenchmarkComparison;
  assetAllocation: AssetAllocationAnalysis;
  topPerformers: HoldingPerformance[];
  worstPerformers: HoldingPerformance[];
}

export interface PerformanceReturns {
  timeWeightedReturn: number;
  moneyWeightedReturn: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  ytdReturn: number;
  quarterlyReturns: number[];
  monthlyReturns: number[];
}

export interface RiskMetrics {
  sharpeRatio: number;
  alpha: number;
  beta: number;
  rSquared: number;
  standardDeviation: number;
  volatility: number;
  maxDrawdown: number;
  downsideDeviation: number;
  sortinoRatio: number;
  valueAtRisk: number;
}

export interface BenchmarkComparison {
  benchmarkSymbol: string;
  benchmarkName: string;
  benchmarkReturn: number;
  outperformance: number;
  correlationCoefficient: number;
  trackingError: number;
  informationRatio: number;
}

export interface AssetAllocationAnalysis {
  current: AssetAllocation[];
  target: AssetAllocation[];
  drift: AssetAllocationDrift[];
  diversificationScore: number;
}

export interface AssetAllocation {
  category: string;
  symbol?: string;
  weight: number;
  value: number;
}

export interface AssetAllocationDrift {
  category: string;
  targetWeight: number;
  currentWeight: number;
  drift: number;
  status: 'within_threshold' | 'needs_rebalancing' | 'critical';'
}

export interface HoldingPerformance {
  symbol: string;
  name: string;
  quantity: number;
  currentValue: number;
  costBasis: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  weight: number;
  contribution: number;
}

// Validation Schemas
export const reportRequestSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),'
  reportType: z.enum(['tax', 'performance', 'holdings', 'transactions', 'compliance']),'
  dateRange: z.object({
    startDate: z.string(),
    endDate: z.string()
  }),
  format: z.enum(['json', 'pdf', 'csv', 'xlsx']).optional().default('json'),'
  options: z.record(z.any()).optional()
});

export class InvestmentReportingService {
  private static instance: InvestmentReportingService;
  
  // Mock data storage (in production, use secure database)
  private reports = new Map<string, any>();
  private portfolioData = new Map<string, any>();
  private transactionHistory = new Map<string, any[]>();
  
  private constructor() {
    this.initializeMockData();
  }
  
  public static getInstance(): InvestmentReportingService {
    if (!InvestmentReportingService.instance) {
      InvestmentReportingService.instance = new InvestmentReportingService();
    }
    return InvestmentReportingService.instance;
  }
  
  /**
   * Generate comprehensive tax report
   */
  async generateTaxReport(
    portfolioId: string, 
    taxYear: number, 
    options: {
      costBasisMethod?: 'fifo' | 'lifo' | 'average_cost' | 'specific_id';'
      includeRealized?: boolean;
      includeUnrealized?: boolean;
      includeReinvested?: boolean;
    } = {}
  ): Promise<TaxReport> {
    try {
      const {
        costBasisMethod = 'fifo','
        includeRealized = true,
        includeUnrealized = false,
        includeReinvested = true
      } = options;
      
      const dateRange = {
        startDate: `${taxYear}-01-01',
        endDate: '${taxYear}-12-31'
      };
      
      // Get transaction history for the tax year
      const transactions = this.getTransactionHistory(portfolioId, dateRange);
      
      // Calculate capital gains and losses
      const capitalGains = await this.calculateCapitalGains(
        transactions.filter(t => t.type === 'buy' || t.type === 'sell'),'
        costBasisMethod
      );
      
      // Calculate dividend income
      const dividendIncome = await this.calculateDividendIncome(
        transactions.filter(t => t.type === 'dividend')'
      );
      
      // Calculate interest income
      const interestIncome = await this.calculateInterestIncome(
        transactions.filter(t => t.type === 'interest')'
      );
      
      // Identify wash sales
      const washSales = await this.identifyWashSales(
        transactions.filter(t => t.type === 'sell'),'`'
        30 // 30-day wash sale period
      );
      
      // Generate tax summary
      const summary = this.calculateTaxSummary({
        capitalGains,
        dividendIncome,
        interestIncome,
        washSales
      });
      
      // Generate tax forms
      const forms = await this.generateTaxForms({
        capitalGains,
        dividendIncome,
        interestIncome,
        summary
      });
      
      const reportId = 'tax_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
      
      const taxReport: TaxReport = {
        id: reportId,
        userId: 'user_demo_12345', // In production, get from context'
        portfolioId,
        taxYear,
        generatedAt: new Date().toISOString(),
        reportType: 'annual','`'
        dateRange,
        summary,
        capitalGains,
        dividendIncome,
        interestIncome,
        washSales,
        forms,
        metadata: {
          costBasisMethod,
          includeRealized,
          includeUnrealized,
          includeReinvested
        }
      };
      
      this.reports.set(reportId, taxReport);
      
      console.log('Tax report generated for portfolio ${portfolioId}, tax year ${taxYear}');
      return taxReport;
      
    } catch (error) {
      console.error('Tax report generation error:', error);'
      throw new Error('Failed to generate tax report: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }
  
  /**
   * Generate portfolio performance report
   */
  async generatePerformanceReport(
    portfolioId: string,
    dateRange: { startDate: string; endDate: string },
    benchmarkSymbol: string = 'SPY'`
  ): Promise<PerformanceReport> {
    try {
      const transactions = this.getTransactionHistory(portfolioId, dateRange);
      const currentHoldings = this.getCurrentHoldings(portfolioId);
      
      // Calculate performance returns
      const returns = await this.calculateReturns(transactions, currentHoldings, dateRange);
      
      // Calculate risk metrics
      const riskMetrics = await this.calculateRiskMetrics(returns, dateRange);
      
      // Compare with benchmark
      const benchmarkComparison = await this.compareToBenchmark(
        returns,
        benchmarkSymbol,
        dateRange
      );
      
      // Analyze asset allocation
      const assetAllocation = await this.analyzeAssetAllocation(currentHoldings);
      
      // Identify top and worst performers
      const holdingsPerformance = await this.analyzeHoldingsPerformance(currentHoldings, dateRange);
      
      const reportId = 'perf_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
      
      const performanceReport: PerformanceReport = {
        id: reportId,
        userId: 'user_demo_12345','`'
        portfolioId,
        generatedAt: new Date().toISOString(),
        dateRange,
        returns,
        riskMetrics,
        benchmarkComparison,
        assetAllocation,
        topPerformers: holdingsPerformance.slice(0, 5),
        worstPerformers: holdingsPerformance.slice(-5).reverse()
      };
      
      this.reports.set(reportId, performanceReport);
      
      console.log('Performance report generated for portfolio ${portfolioId}');
      return performanceReport;
      
    } catch (error) {
      console.error('Performance report generation error:', error);'
      throw new Error('Failed to generate performance report: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }
  
  /**
   * Export report to specified format
   */
  async exportReport(
    reportId: string,
    format: 'pdf' | 'csv' | 'xlsx' | 'json'`
  ): Promise<{ data: string; mimeType: string; filename: string }> {
    try {
      const report = this.reports.get(reportId);
      
      if (!report) {
        throw new Error('Report not found: ${reportId}');
      }
      
      switch (format) {
        case 'json':'
          return {
            data: JSON.stringify(report, null, 2),
            mimeType: 'application/json','`'
            filename: '${reportId}.json'
          };
          
        case 'csv':'
          const csvData = await this.convertToCSV(report);
          return {
            data: csvData,
            mimeType: 'text/csv','`'
            filename: '${reportId}.csv'
          };
          
        case 'xlsx':'
          const xlsxData = await this.convertToExcel(report);
          return {
            data: xlsxData,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','`'
            filename: '${reportId}.xlsx'
          };
          
        case 'pdf':'
          const pdfData = await this.generatePDF(report);
          return {
            data: pdfData,
            mimeType: 'application/pdf','``
            filename: `${reportId}.pdf'
          };
          
        default:
          throw new Error('Unsupported export format: ${format}');
      }
      
    } catch (error) {
      console.error('Report export error:', error);'`'
      throw new Error('Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }
  
  /**
   * Schedule automated report generation
   */
  async scheduleReport(
    portfolioId: string,'
    reportType: 'tax' | 'performance' | 'holdings','
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';'``
      dayOfWeek?: number;
      dayOfMonth?: number;
      time?: string;
    },
    options: Record<string, unknown> = {}
  ): Promise<{ scheduleId: string; nextRun: string }> {
    try {
      const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate next run time
      const nextRun = this.calculateNextRunTime(schedule);
      
      // Store schedule configuration (in production, use database)
      const scheduleConfig = {
        id: scheduleId,
        portfolioId,
        reportType,
        schedule,
        options,
        nextRun,
        active: true,
        createdAt: new Date().toISOString()
      };
      
      console.log(`Report schedule created: ${scheduleId}');
      console.log('Next run: ${nextRun}');
      
      // In production, set up actual scheduled job (cron, etc.)
      
      return { scheduleId, nextRun };
      
    } catch (error) {
      console.error('Report scheduling error:', error);'
      throw new Error('Failed to schedule report: ${error instanceof Error ? error.message : 'Unknown error'}');'`
    }
  }
  
  // Private helper methods
  
  private getTransactionHistory(portfolioId: string, dateRange: { startDate: string; endDate: string }): unknown[] {
    // Mock transaction data
    const mockTransactions = [
      {
        id: 'tx_001','
        type: 'buy','
        symbol: 'AAPL','
        quantity: 10,
        price: 150.00,
        date: '2024-01-15','
        fees: 1.00
      },
      {
        id: 'tx_002','
        type: 'sell','
        symbol: 'AAPL','
        quantity: 5,
        price: 180.00,
        date: '2024-06-15','
        fees: 1.00
      },
      {
        id: 'tx_003','
        type: 'dividend','
        symbol: 'AAPL','
        amount: 25.00,
        date: '2024-08-15','
        dividendType: 'qualified'
      },
      {
        id: 'tx_004','
        type: 'buy','
        symbol: 'GOOGL','
        quantity: 5,
        price: 2500.00,
        date: '2024-02-01','
        fees: 1.00
      }
    ];
    
    // Filter by date range
    return mockTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return txDate >= startDate && txDate <= endDate;
    });
  }
  
  private getCurrentHoldings(portfolioId: string): unknown[] {
    // Mock current holdings
    return [
      {
        symbol: 'AAPL','
        quantity: 5,
        currentPrice: 185.00,
        costBasis: 750.00,
        marketValue: 925.00
      },
      {
        symbol: 'GOOGL','
        quantity: 5,
        currentPrice: 2600.00,
        costBasis: 12500.00,
        marketValue: 13000.00
      }
    ];
  }
  
  private async calculateCapitalGains(
    transactions: unknown[],
    costBasisMethod: string
  ): Promise<CapitalGainsReport> {
    // Mock capital gains calculation
    const shortTermGains: CapitalGainTransaction[] = [];
    const longTermGains: CapitalGainTransaction[] = [
      {
        transactionId: 'tx_002','
        symbol: 'AAPL','
        quantity: 5,
        purchaseDate: '2024-01-15','
        saleDate: '2024-06-15','
        purchasePrice: 150.00,
        salePrice: 180.00,
        costBasis: 750.00,
        proceeds: 899.00,
        gainLoss: 149.00,
        holdingPeriod: 151,
        isWashSale: false
      }
    ];
    
    return {
      shortTermGains,
      longTermGains,
      shortTermTotal: 0,
      longTermTotal: 149.00,
      netCapitalGain: 149.00,
      washSalesAdjustment: 0
    };
  }
  
  private async calculateDividendIncome(transactions: unknown[]): Promise<DividendIncomeReport> {
    const qualifiedDividends: DividendTransaction[] = [
      {
        transactionId: 'tx_003','
        symbol: 'AAPL','
        payDate: '2024-08-15','
        amount: 25.00,
        dividendType: 'qualified','
        reinvested: false
      }
    ];
    
    return {
      ordinaryDividends: [],
      qualifiedDividends,
      totalOrdinaryDividends: 0,
      totalQualifiedDividends: 25.00,
      foreignDividends: 0,
      foreignTaxPaid: 0
    };
  }
  
  private async calculateInterestIncome(transactions: unknown[]): Promise<InterestIncomeReport> {
    return {
      transactions: [],
      totalInterestIncome: 0,
      taxExemptInterest: 0,
      foreignInterest: 0
    };
  }
  
  private async identifyWashSales(sellTransactions: unknown[], washSalePeriod: number): Promise<WashSaleReport[]> {
    // Mock wash sale identification
    return [];
  }
  
  private calculateTaxSummary(data: {
    capitalGains: CapitalGainsReport;
    dividendIncome: DividendIncomeReport;
    interestIncome: InterestIncomeReport;
    washSales: WashSaleReport[];
  }): TaxReportSummary {
    const { capitalGains, dividendIncome, interestIncome } = data;
    
    const totalRealizedGains = Math.max(capitalGains.netCapitalGain, 0);
    const totalRealizedLosses = Math.min(capitalGains.netCapitalGain, 0);
    const netRealizedGainLoss = capitalGains.netCapitalGain;
    
    // Estimate tax liability (simplified calculation)
    const estimatedTaxOwed = 
      (totalRealizedGains * (capitalGains.longTermTotal > 0 ? 0.20 : 0.37)) + // Capital gains tax
      (dividendIncome.totalQualifiedDividends * 0.20) + // Qualified dividends
      (dividendIncome.totalOrdinaryDividends * 0.37) + // Ordinary dividends
      (interestIncome.totalInterestIncome * 0.37); // Interest income
    
    return {
      totalRealizedGains,
      totalRealizedLosses: Math.abs(totalRealizedLosses),
      netRealizedGainLoss,
      totalUnrealizedGains: 0, // Would be calculated from current holdings
      totalUnrealizedLosses: 0,
      netUnrealizedGainLoss: 0,
      totalDividendIncome: dividendIncome.totalOrdinaryDividends + dividendIncome.totalQualifiedDividends,
      totalInterestIncome: interestIncome.totalInterestIncome,
      totalTaxLiability: estimatedTaxOwed,
      estimatedTaxOwed: Math.max(estimatedTaxOwed, 0),
      taxLossCarryforward: Math.max(-netRealizedGainLoss - 3000, 0) // $3000 annual loss deduction limit
    };
  }
  
  private async generateTaxForms(data: unknown): Promise<TaxForm[]> {
    // Mock tax form generation
    return [
      {
        formType: '1099-B','
        formData: {
          totalProceeds: 899.00,
          totalCostBasis: 750.00,
          totalGainLoss: 149.00
        },
        generated: true
      },
      {
        formType: '1099-DIV','
        formData: {
          totalOrdinaryDividends: 0,
          totalQualifiedDividends: 25.00
        },
        generated: true
      }
    ];
  }
  
  private async calculateReturns(
    transactions: unknown[],
    holdings: unknown[],
    dateRange: { startDate: string; endDate: string }
  ): Promise<PerformanceReturns> {
    // Mock performance calculation
    return {
      timeWeightedReturn: 0.085, // 8.5%
      moneyWeightedReturn: 0.082, // 8.2%
      totalReturn: 1174.00,
      totalReturnPercent: 0.087, // 8.7%
      annualizedReturn: 0.085,
      ytdReturn: 0.061,
      quarterlyReturns: [0.025, 0.018, 0.021, 0.015],
      monthlyReturns: [0.008, 0.012, 0.005, 0.015, 0.003, 0.007, 0.011, 0.009, 0.001, 0.018, 0.005, 0.010]
    };
  }
  
  private async calculateRiskMetrics(returns: PerformanceReturns, dateRange: unknown): Promise<RiskMetrics> {
    // Mock risk metrics calculation
    return {
      sharpeRatio: 1.25,
      alpha: 0.015,
      beta: 0.92,
      rSquared: 0.85,
      standardDeviation: 0.068,
      volatility: 0.068,
      maxDrawdown: -0.045,
      downsideDeviation: 0.048,
      sortinoRatio: 1.77,
      valueAtRisk: -0.032
    };
  }
  
  private async compareToBenchmark(
    returns: PerformanceReturns,
    benchmarkSymbol: string, dateRange: unknown): Promise<BenchmarkComparison> {
    // Mock benchmark comparison
    return {
      benchmarkSymbol,
      benchmarkName: 'SPDR S&P 500 ETF Trust','
      benchmarkReturn: 0.078,
      outperformance: returns.annualizedReturn - 0.078,
      correlationCoefficient: 0.89,
      trackingError: 0.025,
      informationRatio: 0.28
    };
  }
  
  private async analyzeAssetAllocation(holdings: unknown[]): Promise<AssetAllocationAnalysis> {
    // Mock asset allocation analysis
    return {
      current: [
        { category: 'Equities', weight: 0.85, value: 13925.00 },'
        { category: 'Cash', weight: 0.15, value: 2462.00 }'
      ],
      target: [
        { category: 'Equities', weight: 0.80, value: 13108.00 },'
        { category: 'Fixed Income', weight: 0.15, value: 2466.00 },'
        { category: 'Cash', weight: 0.05, value: 819.00 }'
      ],
      drift: [
        { category: 'Equities', targetWeight: 0.80, currentWeight: 0.85, drift: 0.05, status: 'needs_rebalancing' },'
        { category: 'Fixed Income', targetWeight: 0.15, currentWeight: 0.0, drift: -0.15, status: 'critical' }'
      ],
      diversificationScore: 0.72
    };
  }
  
  private async analyzeHoldingsPerformance(holdings: unknown[], dateRange: unknown): Promise<HoldingPerformance[]> {
    // Mock holdings performance analysis
    return holdings.map(holding => ({
      symbol: holding.symbol,
      name: this.getSecurityName(holding.symbol),
      quantity: holding.quantity,
      currentValue: holding.marketValue,
      costBasis: holding.costBasis,
      unrealizedGainLoss: holding.marketValue - holding.costBasis,
      unrealizedGainLossPercent: (holding.marketValue - holding.costBasis) / holding.costBasis,
      weight: holding.marketValue / (holdings.reduce((sum, h) => sum + h.marketValue, 0)),
      contribution: (holding.marketValue - holding.costBasis) / holdings.reduce((sum, h) => sum + h.costBasis, 0)
    }));
  }
  
  private getSecurityName(symbol: string): string {
    const names: Record<string, string> = {
      'AAPL': 'Apple Inc.','
      'GOOGL': 'Alphabet Inc. Class A','
      'MSFT': 'Microsoft Corporation','
      'TSLA': 'Tesla, Inc.'
    };
    
    return names[symbol] || symbol;
  }
  
  private async convertToCSV(report: unknown): Promise<string> {
    // Mock CSV conversion
    if (report.capitalGains) {
      // Tax report CSV
      let csv = 'Transaction ID,Symbol,Purchase Date,Sale Date,Cost Basis,Proceeds,Gain/Loss
';'``
      report.capitalGains.longTermGains.forEach((gain: CapitalGainTransaction) => {
        csv += `${gain.transactionId},${gain.symbol},${gain.purchaseDate},${gain.saleDate},${gain.costBasis},${gain.proceeds},${gain.gainLoss}
';
      });
      return csv;
    } else {
      // Performance report CSV
      let csv = 'Metric,Value
';'``
      csv += `Time-Weighted Return,${report.returns.timeWeightedReturn}
`;
      csv += `Sharpe Ratio,${report.riskMetrics.sharpeRatio}
`;
      csv += `Alpha,${report.riskMetrics.alpha}
';
      csv += 'Beta,${report.riskMetrics.beta}
';
      return csv;
    }
  }
  
  private async convertToExcel(report: unknown): Promise<string> {
    // In production, use a library like xlsx to generate actual Excel files
    return 'Excel file data (base64 encoded)';'
  }
  
  private async generatePDF(report: unknown): Promise<string> {
    // In production, use a library like puppeteer or jsPDF to generate PDFs
    return 'PDF file data (base64 encoded)';'
  }
  
  private calculateNextRunTime(schedule: unknown): string {
    const now = new Date();
    let nextRun = new Date(now);
    
    switch (schedule.frequency) {
      case 'daily':'
        nextRun.setDate(now.getDate() + 1);
        break;
      case 'weekly':'
        nextRun.setDate(now.getDate() + 7);
        break;
      case 'monthly':'
        nextRun.setMonth(now.getMonth() + 1);
        if (schedule.dayOfMonth) {
          nextRun.setDate(schedule.dayOfMonth);
        }
        break;
      case 'quarterly':'
        nextRun.setMonth(now.getMonth() + 3);
        break;
      case 'annually':'
        nextRun.setFullYear(now.getFullYear() + 1);
        break;
    }
    
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':').map(Number);'
      nextRun.setHours(hours, minutes, 0, 0);
    }
    
    return nextRun.toISOString();
  }
  
  private initializeMockData(): void {
    // Initialize mock portfolio data
    this.portfolioData.set('portfolio_123456789', {'
      id: 'portfolio_123456789','
      userId: 'user_demo_12345','
      name: 'Main Investment Portfolio','
      totalValue: 16387.00,
      holdings: this.getCurrentHoldings('portfolio_123456789')'`'
    });
  }
  
  // Public getter methods
  getReport(reportId: string): unknown {
    return this.reports.get(reportId);
  }
  
  getAllReports(userId: string): unknown[] {
    return Array.from(this.reports.values()).filter(report => report.userId === userId);
  }
  
  getReportsByType(userId: string, reportType: string): unknown[] {
    return Array.from(this.reports.values())
      .filter(report => report.userId === userId && 
        (report.reportType === reportType || report.id.includes(reportType)));
  }
}

// Export singleton instance
export const investmentReportingService = InvestmentReportingService.getInstance();