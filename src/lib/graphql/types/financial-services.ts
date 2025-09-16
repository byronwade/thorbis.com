/**
 * GraphQL Types for Financial Services
 * Comprehensive financial management system with accounts, transactions, banking integration,
 * compliance, reporting, payment processing, and multi-currency support
 */

export const financialServicesTypeDefs = `
  # Financial Account Management
  type FinancialAccount implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Account Identity
    accountNumber: String!
    accountName: String!
    displayName: String!
    description: String!
    
    # Account Classification
    accountType: AccountType!
    category: AccountCategory!
    subCategory: String
    classification: AccountClassification!
    
    # Account Status and Configuration
    status: AccountStatus!
    isActive: Boolean!
    isDefault: Boolean!
    isClosed: Boolean!
    closedDate: DateTime
    closedReason: String
    
    # Financial Information
    currentBalance: Float!
    availableBalance: Float
    pendingBalance: Float
    creditLimit: Float
    interestRate: Float
    minimumBalance: Float
    overdraftLimit: Float
    
    # Currency and Localization
    currency: Currency!
    currencyCode: String!
    exchangeRate: Float
    baseCurrency: Currency!
    
    # Banking Integration
    bankConnection: BankConnection
    externalAccountId: String
    routingNumber: String
    accountMask: String # Last 4 digits for display
    institutionName: String
    institutionId: String
    
    # Account Hierarchy
    parentAccount: FinancialAccount
    subAccounts: [FinancialAccount!]!
    accountCode: String! # Chart of accounts code
    accountPath: String! # Hierarchical path
    
    # Transactions
    transactions: [FinancialTransaction!]!
    recentTransactions(limit: Int): [FinancialTransaction!]!
    
    # Reconciliation
    lastReconciled: DateTime
    reconciledBalance: Float
    unreconciledTransactions: [FinancialTransaction!]!
    
    # Reporting and Analytics
    monthlyBalances: [MonthlyBalance!]!
    performanceMetrics: AccountPerformanceMetrics!
    cashFlow: CashFlowAnalysis!
    
    # Compliance and Audit
    complianceStatus: ComplianceStatus!
    auditTrail: [AuditEntry!]!
    riskRating: RiskRating!
    
    # Tax and Legal
    taxCategory: String
    taxId: String
    legalEntity: String
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    notes: String
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AccountConnection {
    edges: [AccountEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AccountEdge {
    cursor: String!
    node: FinancialAccount!
  }

  enum AccountType {
    CHECKING
    SAVINGS
    CREDIT_CARD
    LOAN
    INVESTMENT
    ASSET
    LIABILITY
    EQUITY
    REVENUE
    EXPENSE
    ACCOUNTS_RECEIVABLE
    ACCOUNTS_PAYABLE
    INVENTORY
    CASH
    PETTY_CASH
    MERCHANT_ACCOUNT
    ESCROW
    TRUST
  }

  enum AccountCategory {
    CURRENT_ASSETS
    NON_CURRENT_ASSETS
    CURRENT_LIABILITIES
    NON_CURRENT_LIABILITIES
    EQUITY
    OPERATING_REVENUE
    NON_OPERATING_REVENUE
    COST_OF_GOODS_SOLD
    OPERATING_EXPENSES
    NON_OPERATING_EXPENSES
    OTHER_INCOME
    TAXES
  }

  enum AccountClassification {
    DEBIT
    CREDIT
  }

  enum AccountStatus {
    ACTIVE
    INACTIVE
    PENDING
    SUSPENDED
    CLOSED
    FROZEN
    UNDER_REVIEW
  }

  # Financial Transactions
  type FinancialTransaction implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Transaction Identity
    transactionId: String! # Unique transaction identifier
    referenceNumber: String
    externalId: String # External system reference
    
    # Transaction Classification
    transactionType: TransactionType!
    category: TransactionCategory!
    subCategory: String
    method: PaymentMethod!
    
    # Transaction Details
    description: String!
    memo: String
    notes: String
    
    # Financial Amounts
    amount: Float!
    baseAmount: Float! # In base currency
    currency: Currency!
    currencyCode: String!
    exchangeRate: Float!
    
    # Account Information
    fromAccount: FinancialAccount
    toAccount: FinancialAccount
    fromAccountId: ID
    toAccountId: ID
    
    # Date and Timing
    transactionDate: DateTime!
    effectiveDate: DateTime!
    postingDate: DateTime
    valueDate: DateTime
    
    # Transaction Status and Lifecycle
    status: TransactionStatus!
    processingStatus: ProcessingStatus!
    clearingStatus: ClearingStatus!
    
    # Payment Processing
    paymentProcessor: String
    processorTransactionId: String
    processorFee: Float
    processorReference: String
    
    # Banking Information
    bankReference: String
    checkNumber: String
    wireTransferInfo: WireTransferInfo
    achInfo: ACHInfo
    
    # Business Context
    invoiceId: ID
    orderId: ID
    customerId: ID
    vendorId: ID
    projectId: ID
    
    # Reconciliation
    reconciled: Boolean!
    reconciledDate: DateTime
    reconciledBy: String
    reconciliationBatch: String
    
    # Tax and Compliance
    taxable: Boolean!
    taxAmount: Float
    taxRate: Float
    taxCategory: String
    complianceFlags: [ComplianceFlag!]!
    
    # Fraud Detection
    fraudScore: Float
    fraudFlags: [FraudFlag!]!
    riskLevel: RiskLevel!
    
    # Attachments and Documentation
    attachments: [TransactionAttachment!]!
    receiptUrl: String
    documentIds: [ID!]!
    
    # Workflow and Approval
    approvalRequired: Boolean!
    approvedBy: String
    approvedDate: DateTime
    approvalWorkflow: ApprovalWorkflow
    
    # Related Transactions
    parentTransaction: FinancialTransaction
    splitTransactions: [FinancialTransaction!]!
    reversalTransaction: FinancialTransaction
    originalTransaction: FinancialTransaction
    
    # Analytics and Reporting
    reportingTags: [String!]!
    analyticsData: JSON
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type TransactionConnection {
    edges: [TransactionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
    totalAmount: Float!
    averageAmount: Float!
  }

  type TransactionEdge {
    cursor: String!
    node: FinancialTransaction!
  }

  enum TransactionType {
    DEPOSIT
    WITHDRAWAL
    TRANSFER
    PAYMENT
    REFUND
    FEE
    INTEREST
    DIVIDEND
    ADJUSTMENT
    REVERSAL
    CHARGEBACK
    ACH_CREDIT
    ACH_DEBIT
    WIRE_TRANSFER
    CHECK_DEPOSIT
    CARD_PAYMENT
    CASH_PAYMENT
    LOAN_PAYMENT
    INVESTMENT
    EXPENSE
    REVENUE
  }

  enum TransactionCategory {
    OPERATING_INCOME
    OPERATING_EXPENSE
    INVESTMENT_INCOME
    INVESTMENT_EXPENSE
    FINANCING_ACTIVITY
    TAX_PAYMENT
    LOAN_PRINCIPAL
    LOAN_INTEREST
    EQUIPMENT_PURCHASE
    INVENTORY_PURCHASE
    PAYROLL
    BENEFITS
    RENT
    UTILITIES
    INSURANCE
    MARKETING
    PROFESSIONAL_SERVICES
    TRAVEL
    OFFICE_SUPPLIES
    MISC_EXPENSE
    MISC_INCOME
  }

  enum PaymentMethod {
    CASH
    CHECK
    ACH
    WIRE_TRANSFER
    CREDIT_CARD
    DEBIT_CARD
    BANK_TRANSFER
    DIGITAL_WALLET
    CRYPTOCURRENCY
    MONEY_ORDER
    CASHIERS_CHECK
    ELECTRONIC_CHECK
    MOBILE_PAYMENT
    CONTACTLESS
    DIRECT_DEPOSIT
    AUTOMATIC_PAYMENT
  }

  enum TransactionStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
    CANCELLED
    REVERSED
    ON_HOLD
    DISPUTED
    REFUNDED
    SETTLED
  }

  enum ProcessingStatus {
    INITIATED
    VALIDATING
    ROUTING
    CLEARING
    SETTLING
    COMPLETED
    FAILED
    TIMEOUT
  }

  enum ClearingStatus {
    NOT_CLEARED
    CLEARING
    CLEARED
    RETURNED
    REJECTED
  }

  # Banking Integration
  type BankConnection implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Connection Identity
    connectionName: String!
    provider: BankingProvider!
    providerName: String!
    
    # Institution Information
    institutionId: String!
    institutionName: String!
    institutionLogo: String
    institutionUrl: String
    
    # Connection Status
    status: ConnectionStatus!
    lastSyncDate: DateTime
    nextSyncDate: DateTime
    syncFrequency: SyncFrequency!
    autoSync: Boolean!
    
    # Authentication
    authenticationType: AuthenticationType!
    credentials: BankCredentials # Encrypted
    accessToken: String # Encrypted
    refreshToken: String # Encrypted
    tokenExpiresAt: DateTime
    
    # Connected Accounts
    connectedAccounts: [ConnectedAccount!]!
    accountCount: Int!
    
    # Data Synchronization
    syncSettings: SyncSettings!
    lastSyncStatus: SyncStatus!
    syncErrors: [SyncError!]!
    
    # Compliance and Security
    encryptionLevel: EncryptionLevel!
    complianceLevel: ComplianceLevel!
    dataRetentionDays: Int!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum BankingProvider {
    PLAID
    YODLEE
    FINICITY
    OPEN_BANKING
    DIRECT_INTEGRATION
    CUSTOM
  }

  enum ConnectionStatus {
    CONNECTED
    DISCONNECTED
    ERROR
    EXPIRED
    REAUTH_REQUIRED
    MAINTENANCE
    SUSPENDED
  }

  enum AuthenticationType {
    OAUTH
    CREDENTIALS
    TOKEN
    API_KEY
    CERTIFICATE
  }

  enum SyncFrequency {
    REAL_TIME
    HOURLY
    DAILY
    WEEKLY
    MANUAL
  }

  # Payment Processing
  type PaymentProcessor implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Processor Identity
    name: String!
    provider: PaymentProvider!
    displayName: String!
    
    # Configuration
    configuration: ProcessorConfiguration!
    apiCredentials: ProcessorCredentials # Encrypted
    webhookUrl: String
    
    # Capabilities
    supportedMethods: [PaymentMethod!]!
    supportedCurrencies: [Currency!]!
    supportedCountries: [String!]!
    
    # Fees and Pricing
    feeStructure: FeeStructure!
    processingFees: [ProcessingFee!]!
    
    # Status and Performance
    status: ProcessorStatus!
    isDefault: Boolean!
    priority: Int!
    
    # Performance Metrics
    successRate: Float!
    averageProcessingTime: Int! # milliseconds
    uptimePercentage: Float!
    
    # Compliance
    pciCompliant: Boolean!
    certifications: [String!]!
    complianceLevel: ComplianceLevel!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PaymentProvider {
    STRIPE
    PAYPAL
    SQUARE
    AUTHORIZE_NET
    BRAINTREE
    ADYEN
    WORLDPAY
    FIRST_DATA
    CHASE_PAYMENTECH
    CYBERSOURCE
    BLUESNAP
    CUSTOM
  }

  enum ProcessorStatus {
    ACTIVE
    INACTIVE
    TESTING
    SUSPENDED
    MAINTENANCE
    ERROR
  }

  # Financial Reporting
  type FinancialReport implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Report Identity
    reportName: String!
    reportType: FinancialReportType!
    title: String!
    description: String!
    
    # Report Configuration
    reportPeriod: ReportPeriod!
    startDate: DateTime!
    endDate: DateTime!
    baseCurrency: Currency!
    
    # Report Content
    summary: ReportSummary!
    sections: [ReportSection!]!
    data: JSON!
    
    # Financial Statements
    balanceSheet: BalanceSheet
    incomeStatement: IncomeStatement
    cashFlowStatement: CashFlowStatement
    equityStatement: EquityStatement
    
    # Status and Generation
    status: ReportStatus!
    generatedAt: DateTime
    generatedBy: String
    generationTime: Int # milliseconds
    
    # Format and Export
    formats: [ReportFormat!]!
    fileUrl: String
    fileSize: Int
    
    # Comparison and Analysis
    comparisonPeriods: [ComparisonPeriod!]!
    variance: VarianceAnalysis
    trends: TrendAnalysis
    
    # Compliance and Audit
    auditTrail: [ReportAuditEntry!]!
    complianceCheck: ComplianceCheckResult!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum FinancialReportType {
    BALANCE_SHEET
    INCOME_STATEMENT
    CASH_FLOW_STATEMENT
    STATEMENT_OF_EQUITY
    TRIAL_BALANCE
    GENERAL_LEDGER
    ACCOUNTS_RECEIVABLE_AGING
    ACCOUNTS_PAYABLE_AGING
    BUDGET_VS_ACTUAL
    PROFIT_AND_LOSS
    TAX_REPORT
    MANAGEMENT_REPORT
    REGULATORY_REPORT
    CUSTOM_REPORT
  }

  enum ReportPeriod {
    DAILY
    WEEKLY
    MONTHLY
    QUARTERLY
    YEARLY
    CUSTOM
  }

  enum ReportStatus {
    SCHEDULED
    GENERATING
    COMPLETED
    FAILED
    CANCELLED
  }

  enum ReportFormat {
    PDF
    EXCEL
    CSV
    JSON
    XML
    HTML
  }

  # Currency and Exchange
  type Currency {
    code: String! # ISO 4217 code (USD, EUR, etc.)
    name: String!
    symbol: String!
    decimals: Int!
    isActive: Boolean!
    exchangeRate: Float
    lastUpdated: DateTime
  }

  type ExchangeRate implements Node & Timestamped {
    id: ID!
    
    # Currency Pair
    fromCurrency: Currency!
    toCurrency: Currency!
    
    # Rate Information
    rate: Float!
    inverseRate: Float!
    
    # Rate Source
    source: ExchangeRateSource!
    provider: String!
    
    # Metadata
    effectiveDate: DateTime!
    lastUpdated: DateTime!
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ExchangeRateSource {
    CENTRAL_BANK
    COMMERCIAL_BANK
    FINANCIAL_DATA_PROVIDER
    CRYPTOCURRENCY_EXCHANGE
    MANUAL_ENTRY
  }

  # Compliance and Risk Management
  type ComplianceRule implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Rule Identity
    ruleName: String!
    ruleType: ComplianceRuleType!
    description: String!
    
    # Rule Configuration
    conditions: [RuleCondition!]!
    actions: [RuleAction!]!
    severity: RuleSeverity!
    
    # Status and Lifecycle
    status: RuleStatus!
    isActive: Boolean!
    effectiveDate: DateTime!
    expirationDate: DateTime
    
    # Performance Metrics
    triggerCount: Int!
    lastTriggered: DateTime
    falsePositiveRate: Float
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ComplianceRuleType {
    AML # Anti-Money Laundering
    KYC # Know Your Customer
    BSA # Bank Secrecy Act
    OFAC # Office of Foreign Assets Control
    PCI_DSS # Payment Card Industry Data Security Standard
    SOX # Sarbanes-Oxley Act
    GDPR # General Data Protection Regulation
    CCPA # California Consumer Privacy Act
    CUSTOM
  }

  enum RuleSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum RuleStatus {
    DRAFT
    ACTIVE
    SUSPENDED
    ARCHIVED
  }

  # Budget and Forecasting
  type Budget implements Node & Timestamped & BusinessOwned {
    id: ID!
    businessId: ID!
    
    # Budget Identity
    budgetName: String!
    budgetType: BudgetType!
    description: String!
    
    # Budget Period
    budgetPeriod: BudgetPeriod!
    startDate: DateTime!
    endDate: DateTime!
    fiscalYear: String!
    
    # Budget Structure
    budgetItems: [BudgetItem!]!
    totalBudgeted: Float!
    totalActual: Float!
    variance: Float!
    variancePercentage: Float!
    
    # Status and Approval
    status: BudgetStatus!
    approvedBy: String
    approvedDate: DateTime
    
    # Version Control
    version: String!
    parentBudget: Budget
    revisions: [BudgetRevision!]!
    
    # Forecasting
    forecast: BudgetForecast
    scenarios: [BudgetScenario!]!
    
    # Metadata
    tags: [String!]!
    customFields: JSON
    
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum BudgetType {
    OPERATING
    CAPITAL
    CASH_FLOW
    PROJECT
    DEPARTMENT
    MASTER
  }

  enum BudgetPeriod {
    MONTHLY
    QUARTERLY
    ANNUALLY
    CUSTOM
  }

  enum BudgetStatus {
    DRAFT
    PENDING_APPROVAL
    APPROVED
    ACTIVE
    CLOSED
    REVISED
  }

  # Supporting Types
  type MonthlyBalance {
    month: String!
    year: Int!
    openingBalance: Float!
    closingBalance: Float!
    netChange: Float!
    transactionCount: Int!
  }

  type AccountPerformanceMetrics {
    averageBalance: Float!
    minimumBalance: Float!
    maximumBalance: Float!
    totalDebits: Float!
    totalCredits: Float!
    transactionCount: Int!
    averageTransactionAmount: Float!
    dormancyDays: Int!
    utilizationRate: Float
  }

  type CashFlowAnalysis {
    operatingCashFlow: Float!
    investingCashFlow: Float!
    financingCashFlow: Float!
    netCashFlow: Float!
    cashFlowTrend: CashFlowTrend!
    projectedCashFlow: [CashFlowProjection!]!
  }

  enum CashFlowTrend {
    POSITIVE
    NEGATIVE
    STABLE
    VOLATILE
    IMPROVING
    DECLINING
  }

  type CashFlowProjection {
    date: DateTime!
    projectedBalance: Float!
    confidence: Float!
  }

  type WireTransferInfo {
    senderName: String!
    senderAccount: String!
    senderBank: String!
    receiverName: String!
    receiverAccount: String!
    receiverBank: String!
    swiftCode: String
    fedwireId: String
    purpose: String
  }

  type ACHInfo {
    companyName: String!
    companyId: String!
    batchNumber: String
    traceNumber: String
    effectiveDate: DateTime!
    standardEntryClass: String!
    returnCode: String
    returnReason: String
  }

  type TransactionAttachment {
    id: ID!
    filename: String!
    originalFilename: String!
    fileSize: Int!
    mimeType: String!
    fileUrl: String!
    description: String
    uploadedBy: String!
    uploadedAt: DateTime!
  }

  enum ComplianceStatus {
    COMPLIANT
    NON_COMPLIANT
    UNDER_REVIEW
    PENDING_REVIEW
    EXEMPTED
  }

  enum RiskRating {
    VERY_LOW
    LOW
    MEDIUM
    HIGH
    VERY_HIGH
    UNRATED
  }

  enum RiskLevel {
    MINIMAL
    LOW
    MODERATE
    HIGH
    SEVERE
    CRITICAL
  }

  type ComplianceFlag {
    flagType: String!
    severity: RuleSeverity!
    description: String!
    ruleId: ID!
    flaggedAt: DateTime!
  }

  type FraudFlag {
    flagType: String!
    riskScore: Float!
    description: String!
    flaggedAt: DateTime!
  }

  type ApprovalWorkflow {
    workflowId: ID!
    workflowName: String!
    currentStep: String!
    approvers: [String!]!
    approvalHistory: [ApprovalStep!]!
  }

  type ApprovalStep {
    stepName: String!
    approver: String!
    approvedAt: DateTime!
    comments: String
    action: ApprovalAction!
  }

  enum ApprovalAction {
    APPROVED
    REJECTED
    PENDING
    DELEGATED
    CANCELLED
  }

  # Financial Statements
  type BalanceSheet {
    asOfDate: DateTime!
    currency: Currency!
    
    # Assets
    currentAssets: AssetSection!
    nonCurrentAssets: AssetSection!
    totalAssets: Float!
    
    # Liabilities
    currentLiabilities: LiabilitySection!
    nonCurrentLiabilities: LiabilitySection!
    totalLiabilities: Float!
    
    # Equity
    equity: EquitySection!
    totalEquity: Float!
    
    # Balance Check
    totalLiabilitiesAndEquity: Float!
    isBalanced: Boolean!
  }

  type IncomeStatement {
    periodStart: DateTime!
    periodEnd: DateTime!
    currency: Currency!
    
    # Revenue
    revenue: RevenueSection!
    totalRevenue: Float!
    
    # Cost of Goods Sold
    costOfGoodsSold: ExpenseSection!
    grossProfit: Float!
    
    # Operating Expenses
    operatingExpenses: ExpenseSection!
    operatingIncome: Float!
    
    # Non-Operating Items
    nonOperatingIncome: Float!
    nonOperatingExpense: Float!
    
    # Final Results
    incomeBeforeTaxes: Float!
    incomeTaxExpense: Float!
    netIncome: Float!
    
    # Per Share Data
    earningsPerShare: Float
    dilutedEarningsPerShare: Float
  }

  type CashFlowStatement {
    periodStart: DateTime!
    periodEnd: DateTime!
    currency: Currency!
    
    # Operating Activities
    operatingActivities: CashFlowSection!
    netCashFromOperating: Float!
    
    # Investing Activities
    investingActivities: CashFlowSection!
    netCashFromInvesting: Float!
    
    # Financing Activities
    financingActivities: CashFlowSection!
    netCashFromFinancing: Float!
    
    # Net Change
    netChangeInCash: Float!
    cashAtBeginningOfPeriod: Float!
    cashAtEndOfPeriod: Float!
  }

  # Input Types
  input FinancialAccountInput {
    accountName: String!
    displayName: String
    description: String
    accountType: AccountType!
    category: AccountCategory!
    subCategory: String
    classification: AccountClassification!
    parentAccountId: ID
    accountCode: String!
    currency: String!
    initialBalance: Float
    creditLimit: Float
    interestRate: Float
    minimumBalance: Float
    overdraftLimit: Float
    bankConnectionId: ID
    externalAccountId: String
    routingNumber: String
    institutionName: String
    taxCategory: String
    taxId: String
    isActive: Boolean
    isDefault: Boolean
    tags: [String!]
    customFields: JSON
    notes: String
  }

  input FinancialTransactionInput {
    referenceNumber: String
    externalId: String
    transactionType: TransactionType!
    category: TransactionCategory!
    subCategory: String
    method: PaymentMethod!
    description: String!
    memo: String
    notes: String
    amount: Float!
    currency: String!
    fromAccountId: ID
    toAccountId: ID
    transactionDate: DateTime!
    effectiveDate: DateTime
    invoiceId: ID
    orderId: ID
    customerId: ID
    vendorId: ID
    projectId: ID
    taxable: Boolean
    taxAmount: Float
    taxRate: Float
    taxCategory: String
    checkNumber: String
    wireTransferInfo: WireTransferInfoInput
    achInfo: ACHInfoInput
    attachments: [TransactionAttachmentInput!]
    reportingTags: [String!]
    tags: [String!]
    customFields: JSON
  }

  input WireTransferInfoInput {
    senderName: String!
    senderAccount: String!
    senderBank: String!
    receiverName: String!
    receiverAccount: String!
    receiverBank: String!
    swiftCode: String
    fedwireId: String
    purpose: String
  }

  input ACHInfoInput {
    companyName: String!
    companyId: String!
    batchNumber: String
    traceNumber: String
    effectiveDate: DateTime!
    standardEntryClass: String!
  }

  input TransactionAttachmentInput {
    filename: String!
    fileSize: Int!
    mimeType: String!
    fileUrl: String!
    description: String
  }

  input BankConnectionInput {
    connectionName: String!
    provider: BankingProvider!
    institutionId: String!
    institutionName: String!
    authenticationType: AuthenticationType!
    syncFrequency: SyncFrequency!
    autoSync: Boolean
    encryptionLevel: EncryptionLevel!
    complianceLevel: ComplianceLevel!
    dataRetentionDays: Int
    tags: [String!]
    customFields: JSON
  }

  input PaymentProcessorInput {
    name: String!
    provider: PaymentProvider!
    displayName: String!
    supportedMethods: [PaymentMethod!]!
    supportedCurrencies: [String!]!
    supportedCountries: [String!]!
    webhookUrl: String
    isDefault: Boolean
    priority: Int
    pciCompliant: Boolean!
    certifications: [String!]
    tags: [String!]
    customFields: JSON
  }

  input BudgetInput {
    budgetName: String!
    budgetType: BudgetType!
    description: String!
    budgetPeriod: BudgetPeriod!
    startDate: DateTime!
    endDate: DateTime!
    fiscalYear: String!
    budgetItems: [BudgetItemInput!]!
    tags: [String!]
    customFields: JSON
  }

  input BudgetItemInput {
    accountId: ID!
    category: String!
    budgetedAmount: Float!
    description: String
    notes: String
  }

  input ComplianceRuleInput {
    ruleName: String!
    ruleType: ComplianceRuleType!
    description: String!
    conditions: [RuleConditionInput!]!
    actions: [RuleActionInput!]!
    severity: RuleSeverity!
    effectiveDate: DateTime!
    expirationDate: DateTime
    tags: [String!]
    customFields: JSON
  }

  input RuleConditionInput {
    field: String!
    operator: ConditionOperator!
    value: String!
    logicalOperator: LogicalOperator
  }

  input RuleActionInput {
    actionType: RuleActionType!
    parameters: JSON
  }

  enum ConditionOperator {
    EQUALS
    NOT_EQUALS
    GREATER_THAN
    LESS_THAN
    GREATER_THAN_OR_EQUAL
    LESS_THAN_OR_EQUAL
    CONTAINS
    NOT_CONTAINS
    STARTS_WITH
    ENDS_WITH
    IN
    NOT_IN
    BETWEEN
    REGEX_MATCH
  }

  enum LogicalOperator {
    AND
    OR
    NOT
  }

  enum RuleActionType {
    FLAG_TRANSACTION
    BLOCK_TRANSACTION
    REQUIRE_APPROVAL
    SEND_ALERT
    CREATE_CASE
    ESCALATE
    LOG_EVENT
    CUSTOM_ACTION
  }

  # Query Extensions for Financial Services
  extend type Query {
    # Financial Accounts
    financialAccount(id: ID!): FinancialAccount
    financialAccounts(
      accountType: AccountType
      category: AccountCategory
      status: AccountStatus
      isActive: Boolean
      parentAccountId: ID
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): AccountConnection!

    # Chart of Accounts
    chartOfAccounts(
      includeInactive: Boolean
      hierarchical: Boolean
    ): [FinancialAccount!]!

    # Financial Transactions
    financialTransaction(id: ID!): FinancialTransaction
    financialTransactions(
      accountId: ID
      transactionType: TransactionType
      category: TransactionCategory
      method: PaymentMethod
      status: TransactionStatus
      startDate: DateTime
      endDate: DateTime
      minAmount: Float
      maxAmount: Float
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): TransactionConnection!

    # Account Transactions
    accountTransactions(
      accountId: ID!
      startDate: DateTime
      endDate: DateTime
      transactionType: TransactionType
      pagination: PaginationInput
      sorts: [SortInput!]
    ): TransactionConnection!

    # Banking Integration
    bankConnection(id: ID!): BankConnection
    bankConnections(
      provider: BankingProvider
      status: ConnectionStatus
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [BankConnection!]!

    # Payment Processors
    paymentProcessor(id: ID!): PaymentProcessor
    paymentProcessors(
      provider: PaymentProvider
      status: ProcessorStatus
      supportedMethod: PaymentMethod
      isActive: Boolean
      pagination: PaginationInput
      sorts: [SortInput!]
    ): [PaymentProcessor!]!

    # Financial Reports
    financialReport(id: ID!): FinancialReport
    financialReports(
      reportType: FinancialReportType
      status: ReportStatus
      startDate: DateTime
      endDate: DateTime
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [FinancialReport!]!

    # Currencies and Exchange Rates
    currencies: [Currency!]!
    exchangeRates(
      fromCurrency: String
      toCurrency: String
      source: ExchangeRateSource
      effectiveDate: DateTime
    ): [ExchangeRate!]!

    # Budgets
    budget(id: ID!): Budget
    budgets(
      budgetType: BudgetType
      status: BudgetStatus
      fiscalYear: String
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [Budget!]!

    # Compliance
    complianceRule(id: ID!): ComplianceRule
    complianceRules(
      ruleType: ComplianceRuleType
      status: RuleStatus
      severity: RuleSeverity
      pagination: PaginationInput
      filters: [FilterInput!]
      sorts: [SortInput!]
    ): [ComplianceRule!]!

    # Financial Analytics
    accountBalances(
      asOfDate: DateTime
      accountType: AccountType
      category: AccountCategory
    ): [AccountBalance!]!

    trialBalance(
      asOfDate: DateTime!
      includeSubAccounts: Boolean
    ): TrialBalance!

    cashFlowForecast(
      startDate: DateTime!
      endDate: DateTime!
      scenario: String
    ): CashFlowForecast!

    financialRatios(
      asOfDate: DateTime!
      comparisonPeriod: ComparisonPeriodInput
    ): FinancialRatios!

    budgetVarianceAnalysis(
      budgetId: ID!
      asOfDate: DateTime!
    ): BudgetVarianceAnalysis!
  }

  # Mutation Extensions for Financial Services
  extend type Mutation {
    # Account Management
    createFinancialAccount(input: FinancialAccountInput!): FinancialAccount!
    updateFinancialAccount(id: ID!, input: FinancialAccountInput!): FinancialAccount!
    deleteFinancialAccount(id: ID!): Boolean!
    activateAccount(id: ID!): FinancialAccount!
    deactivateAccount(id: ID!, reason: String): FinancialAccount!
    closeAccount(id: ID!, reason: String!): FinancialAccount!
    reopenAccount(id: ID!): FinancialAccount!

    # Transaction Management
    createFinancialTransaction(input: FinancialTransactionInput!): FinancialTransaction!
    updateFinancialTransaction(id: ID!, input: FinancialTransactionInput!): FinancialTransaction!
    deleteFinancialTransaction(id: ID!): Boolean!
    approveTransaction(id: ID!, comments: String): FinancialTransaction!
    rejectTransaction(id: ID!, reason: String!): FinancialTransaction!
    reverseTransaction(id: ID!, reason: String!): FinancialTransaction!
    splitTransaction(id: ID!, splits: [TransactionSplitInput!]!): [FinancialTransaction!]!

    # Transaction Processing
    processTransaction(id: ID!): TransactionProcessingResult!
    batchProcessTransactions(transactionIds: [ID!]!): BatchProcessingResult!
    scheduleTransaction(input: ScheduledTransactionInput!): ScheduledTransaction!
    cancelScheduledTransaction(id: ID!): Boolean!

    # Reconciliation
    reconcileAccount(
      accountId: ID!
      statementDate: DateTime!
      statementBalance: Float!
      transactions: [ID!]!
    ): ReconciliationResult!
    
    markTransactionReconciled(id: ID!, reconciledDate: DateTime!): FinancialTransaction!
    undoReconciliation(accountId: ID!, reconciliationId: ID!): Boolean!

    # Banking Integration
    createBankConnection(input: BankConnectionInput!): BankConnection!
    updateBankConnection(id: ID!, input: BankConnectionInput!): BankConnection!
    deleteBankConnection(id: ID!): Boolean!
    testBankConnection(id: ID!): ConnectionTestResult!
    syncBankAccount(connectionId: ID!, accountId: ID): SyncResult!
    refreshBankConnection(id: ID!): BankConnection!

    # Payment Processing
    createPaymentProcessor(input: PaymentProcessorInput!): PaymentProcessor!
    updatePaymentProcessor(id: ID!, input: PaymentProcessorInput!): PaymentProcessor!
    deletePaymentProcessor(id: ID!): Boolean!
    testPaymentProcessor(id: ID!): ProcessorTestResult!
    processPayment(input: PaymentProcessingInput!): PaymentResult!

    # Budget Management
    createBudget(input: BudgetInput!): Budget!
    updateBudget(id: ID!, input: BudgetInput!): Budget!
    deleteBudget(id: ID!): Boolean!
    approveBudget(id: ID!, comments: String): Budget!
    rejectBudget(id: ID!, reason: String!): Budget!
    copyBudget(id: ID!, newName: String!, newPeriod: BudgetPeriod!): Budget!

    # Compliance Management
    createComplianceRule(input: ComplianceRuleInput!): ComplianceRule!
    updateComplianceRule(id: ID!, input: ComplianceRuleInput!): ComplianceRule!
    deleteComplianceRule(id: ID!): Boolean!
    activateComplianceRule(id: ID!): ComplianceRule!
    deactivateComplianceRule(id: ID!): ComplianceRule!
    testComplianceRule(id: ID!, testData: JSON!): ComplianceTestResult!

    # Report Generation
    generateFinancialReport(input: ReportGenerationInput!): FinancialReport!
    scheduleRecurringReport(input: RecurringReportInput!): RecurringReport!
    cancelRecurringReport(id: ID!): Boolean!
    exportReport(reportId: ID!, format: ReportFormat!): ExportResult!

    # Exchange Rates
    updateExchangeRates(provider: ExchangeRateSource!): [ExchangeRate!]!
    setManualExchangeRate(
      fromCurrency: String!
      toCurrency: String!
      rate: Float!
      effectiveDate: DateTime!
    ): ExchangeRate!

    # Bulk Operations
    bulkUpdateTransactionCategory(
      transactionIds: [ID!]!
      category: TransactionCategory!
      subCategory: String
    ): Boolean!
    
    bulkApproveTransactions(transactionIds: [ID!]!): [FinancialTransaction!]!
    bulkReconcileTransactions(transactionIds: [ID!]!, reconciledDate: DateTime!): Boolean!

    # Data Management
    importTransactions(input: TransactionImportInput!): TransactionImportResult!
    exportTransactions(input: TransactionExportInput!): TransactionExportResult!
    archiveOldTransactions(beforeDate: DateTime!, accountIds: [ID!]): ArchiveResult!
  }

  # Subscription Extensions for Financial Services
  extend type Subscription {
    # Real-time Transaction Updates
    transactionUpdates(accountId: ID): FinancialTransaction!
    accountBalanceUpdates(accountId: ID!): AccountBalanceUpdate!
    
    # Payment Processing Updates
    paymentProcessingUpdates(processorId: ID): PaymentProcessingUpdate!
    
    # Banking Sync Updates
    bankSyncUpdates(connectionId: ID!): BankSyncUpdate!
    
    # Compliance Alerts
    complianceAlerts(businessId: ID!): ComplianceAlert!
    fraudAlerts(businessId: ID!): FraudAlert!
    
    # Report Generation Updates
    reportGenerationUpdates(reportId: ID!): ReportGenerationUpdate!
    
    # Exchange Rate Updates
    exchangeRateUpdates(currencyPair: String): ExchangeRateUpdate!
  }

  # Additional Supporting Types
  type AccountBalance {
    account: FinancialAccount!
    balance: Float!
    asOfDate: DateTime!
  }

  type TrialBalance {
    asOfDate: DateTime!
    accounts: [TrialBalanceAccount!]!
    totalDebits: Float!
    totalCredits: Float!
    isBalanced: Boolean!
  }

  type TrialBalanceAccount {
    account: FinancialAccount!
    debitBalance: Float!
    creditBalance: Float!
  }

  type CashFlowForecast {
    startDate: DateTime!
    endDate: DateTime!
    projections: [CashFlowProjection!]!
    assumptions: [ForecastAssumption!]!
    confidence: Float!
  }

  type ForecastAssumption {
    category: String!
    assumption: String!
    impact: Float!
  }

  type FinancialRatios {
    asOfDate: DateTime!
    liquidityRatios: LiquidityRatios!
    profitabilityRatios: ProfitabilityRatios!
    leverageRatios: LeverageRatios!
    efficiencyRatios: EfficiencyRatios!
  }

  type LiquidityRatios {
    currentRatio: Float!
    quickRatio: Float!
    cashRatio: Float!
    workingCapital: Float!
  }

  type ProfitabilityRatios {
    grossProfitMargin: Float!
    operatingProfitMargin: Float!
    netProfitMargin: Float!
    returnOnAssets: Float!
    returnOnEquity: Float!
  }

  type LeverageRatios {
    debtToEquity: Float!
    debtToAssets: Float!
    equityMultiplier: Float!
    interestCoverage: Float!
  }

  type EfficiencyRatios {
    assetTurnover: Float!
    inventoryTurnover: Float!
    receivablesTurnover: Float!
    payablesTurnover: Float!
  }

  type BudgetVarianceAnalysis {
    budget: Budget!
    asOfDate: DateTime!
    totalVariance: Float!
    totalVariancePercentage: Float!
    favorableVariance: Float!
    unfavorableVariance: Float!
    itemVariances: [BudgetItemVariance!]!
  }

  type BudgetItemVariance {
    budgetItem: BudgetItem!
    budgetedAmount: Float!
    actualAmount: Float!
    variance: Float!
    variancePercentage: Float!
    isFavorable: Boolean!
  }

  # Complex Supporting Types for Processing
  type TransactionProcessingResult {
    transactionId: ID!
    status: ProcessingStatus!
    processorResponse: JSON
    fees: [ProcessingFee!]!
    estimatedSettlementDate: DateTime
    confirmationNumber: String
    errors: [ProcessingError!]!
  }

  type BatchProcessingResult {
    batchId: ID!
    totalTransactions: Int!
    successfulTransactions: Int!
    failedTransactions: Int!
    results: [TransactionProcessingResult!]!
    summary: BatchProcessingSummary!
  }

  type ProcessingFee {
    feeType: String!
    amount: Float!
    currency: String!
    description: String!
  }

  type ProcessingError {
    errorCode: String!
    errorMessage: String!
    field: String
    severity: ErrorSeverity!
  }

  enum ErrorSeverity {
    INFO
    WARNING
    ERROR
    CRITICAL
  }

  type ReconciliationResult {
    accountId: ID!
    statementDate: DateTime!
    statementBalance: Float!
    reconciledBalance: Float!
    difference: Float!
    reconciledTransactions: Int!
    unreconciledTransactions: Int!
    isFullyReconciled: Boolean!
    discrepancies: [ReconciliationDiscrepancy!]!
  }

  type ReconciliationDiscrepancy {
    transactionId: ID
    description: String!
    amount: Float!
    discrepancyType: DiscrepancyType!
  }

  enum DiscrepancyType {
    MISSING_TRANSACTION
    DUPLICATE_TRANSACTION
    AMOUNT_MISMATCH
    DATE_MISMATCH
    OTHER
  }

  # Many more supporting types would be defined here...
  # This is a comprehensive but abbreviated version for space
`