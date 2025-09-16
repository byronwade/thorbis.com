// ACH (Automated Clearing House) payment processing
// Supports direct bank transfers, recurring payments, and business-to-business transactions

import { paymentTokenizer } from '../payment-tokenization';
import { paymentSyncManager } from '../payment-sync-manager';

interface ACHConfig {
  originatorId: string;
  originatorName: string;
  companyId: string;
  routingNumber: string;
  testMode: boolean;
  nacha: {
    immediateDestination: string;
    immediateDestinationName: string;
    immediateOrigin: string;
    immediateOriginName: string;
  };
}

interface BankAccount {
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'business_checking' | 'business_savings';
  accountHolderName: string;
  accountHolderType: 'individual' | 'company';
}

interface ACHPaymentRequest {
  amount: number;
  currency: string;
  bankAccount: BankAccount;
  description: string;
  statementDescriptor?: string;
  effectiveDate?: Date;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

interface ACHPaymentResult {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'returned';
  amount: number;
  currency: string;
  effectiveDate: Date;
  networkTransactionId?: string;
  returnCode?: string;
  returnDescription?: string;
  fee?: number;
}

interface RecurringACHSetup {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  startDate: Date;
  endDate?: Date;
  maxPayments?: number;
  amount: number;
  bankAccount: BankAccount;
  description: string;
}

export class ACHProcessor {
  private config: ACHConfig;
  private nachaFormatter: NACHAFormatter;

  constructor(config: ACHConfig) {
    this.config = config;
    this.nachaFormatter = new NACHAFormatter(config);
  }

  // Validate bank account information
  async validateBankAccount(bankAccount: BankAccount): Promise<{ valid: boolean; errors: string[] }> {
    try {
      if (!bankAccount) {
        throw new Error('Bank account information is required');
      }

      const errors: string[] = [];

      // Validate routing number
      if (!this.validateRoutingNumber(bankAccount.routingNumber)) {
        errors.push('Invalid routing number');
      }

      // Validate account number
      if (!bankAccount.accountNumber || bankAccount.accountNumber.length < 4 || bankAccount.accountNumber.length > 17) {
        errors.push('Account number must be between 4 and 17 digits');
      }

      // Validate account type
      const validAccountTypes = ['checking', 'savings', 'business_checking', 'business_savings'];
      if (!validAccountTypes.includes(bankAccount.accountType)) {
        errors.push('Invalid account type');
      }

      // Validate account holder name
      if (!bankAccount.accountHolderName || bankAccount.accountHolderName.trim().length < 2) {
        errors.push('Account holder name is required');
      }

      // In production, you might also verify the account via micro-deposits
      if (!this.config.testMode) {
        try {
          const verificationResult = await this.verifyBankAccountMicroDeposits(bankAccount);
          if (!verificationResult.verified) {
            errors.push('Bank account verification failed');
          }
        } catch (verificationError) {
          errors.push('Bank account verification error: ${verificationError instanceof Error ? verificationError.message : 'Unknown error'}');
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      return {
        valid: false,
        errors: ['Validation failed: ${errorMessage}']
      };
    }
  }

  // Process ACH debit (money from customer to business)
  async processACHDebit(request: ACHPaymentRequest): Promise<ACHPaymentResult> {
    try {
      // Input validation
      if (!request) {
        throw new Error('ACH payment request is required');
      }
      
      if (!request.amount || request.amount <= 0) {
        throw new Error('Invalid payment amount - must be greater than 0');
      }
      
      if (!request.currency) {
        throw new Error('Currency is required');
      }
      
      if (!request.bankAccount) {
        throw new Error('Bank account information is required');
      }

      // Validate bank account
      const validation = await this.validateBankAccount(request.bankAccount);
      if (!validation.valid) {
        throw new Error('Bank account validation failed: ${validation.errors.join(', ')}');
      }

      let tokenResult;
      try {
        // Tokenize sensitive bank account data
        tokenResult = await paymentTokenizer.tokenize({
          type: 'bank_account',
          sensitiveData: request.bankAccount,
          organizationId: request.metadata?.organizationId || ',
          metadata: { purpose: 'ach_debit' }
        });
      } catch (tokenError) {
        throw new Error('Payment tokenization failed: ${tokenError instanceof Error ? tokenError.message : 'Unknown error'}');
      }

      const paymentId = this.generateACHTransactionId();
      const effectiveDate = request.effectiveDate || this.getNextBusinessDay();

      // Create ACH entry
      const achEntry = {
        id: paymentId,
        transactionCode: this.getTransactionCode('debit', request.bankAccount.accountType),
        receivingDFIIdentification: request.bankAccount.routingNumber.substring(0, 8),
        checkDigit: request.bankAccount.routingNumber.substring(8),
        receivingDFIAccountNumber: request.bankAccount.accountNumber,
        amount: request.amount,
        receivingCompanyName: request.bankAccount.accountHolderName,
        discretionaryData: ',
        addendaRecordIndicator: '0',
        traceNumber: this.generateTraceNumber()
      };

      if (this.config.testMode) {
        // Simulate ACH processing
        const result: ACHPaymentResult = {
          id: paymentId,
          status: 'pending',
          amount: request.amount,
          currency: request.currency,
          effectiveDate,
          networkTransactionId: 'ACH_${Date.now()}',
          fee: this.calculateACHFee(request.amount)
        };

        try {
          // Queue for offline processing if needed
          await paymentSyncManager.queuePayment({
            amount: request.amount,
            currency: request.currency,
            paymentMethod: 'ach',
            organizationId: request.metadata?.organizationId || ',
            tokenId: tokenResult.id,
            metadata: {
              ach_transaction_id: paymentId,
              effective_date: effectiveDate.toISOString(),
              transaction_type: 'debit',
              ...request.metadata
            },
            maxRetries: 2 // ACH has lower retry tolerance
          });
        } catch (queueError) {
          // Log the queue error but don't fail the payment processing
          console.warn('Failed to queue payment for sync:', queueError);
        }

        return result;
      } else {
        // Real ACH processing would go here
        throw new Error('Live ACH processing not implemented');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown ACH processing error';
      
      // Log the error for debugging
      console.error('ACH debit processing failed:', {
        error: errorMessage,
        requestId: request?.metadata?.requestId || 'unknown',
        amount: request?.amount || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      throw new Error('ACH debit processing failed: ${errorMessage}');
    }
  }

  // Process ACH credit (money from business to customer/vendor)
  async processACHCredit(request: ACHPaymentRequest): Promise<ACHPaymentResult> {
    try {
      // Input validation
      if (!request) {
        throw new Error('ACH payment request is required');
      }
      
      if (!request.amount || request.amount <= 0) {
        throw new Error('Invalid payment amount - must be greater than 0');
      }
      
      if (!request.bankAccount) {
        throw new Error('Bank account information is required');
      }

      const validation = await this.validateBankAccount(request.bankAccount);
      if (!validation.valid) {
        throw new Error('Bank account validation failed: ${validation.errors.join(', ')}');
      }

      const paymentId = this.generateACHTransactionId();
      const effectiveDate = request.effectiveDate || this.getNextBusinessDay();

      if (this.config.testMode) {
        const result: ACHPaymentResult = {
          id: paymentId,
          status: 'pending',
          amount: request.amount,
          currency: request.currency,
          effectiveDate,
          networkTransactionId: 'ACH_CREDIT_${Date.now()}',
          fee: this.calculateACHFee(request.amount)
        };

        return result;
      } else {
        throw new Error('Live ACH processing not implemented');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown ACH credit processing error';
      
      // Log the error for debugging
      console.error('ACH credit processing failed:', {
        error: errorMessage,
        requestId: request?.metadata?.requestId || 'unknown',
        amount: request?.amount || 'unknown`,
        timestamp: new Date().toISOString()
      });
      
      throw new Error('ACH credit processing failed: ${errorMessage}');
    }
  }

  // Set up recurring ACH payments
  async setupRecurringACH(setup: RecurringACHSetup): Promise<{ subscriptionId: string; nextPaymentDate: Date }> {
    const validation = await this.validateBankAccount(setup.bankAccount);
    if (!validation.valid) {
      throw new Error('Bank account validation failed: ${validation.errors.join(', ')}');
    }

    const subscriptionId = 'sub_ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    const nextPaymentDate = this.calculateNextPaymentDate(setup.startDate, setup.frequency);

    // Store recurring payment setup
    const recurringPayment = {
      id: subscriptionId,
      frequency: setup.frequency,
      amount: setup.amount,
      bankAccount: setup.bankAccount,
      description: setup.description,
      startDate: setup.startDate,
      endDate: setup.endDate,
      maxPayments: setup.maxPayments,
      paymentsProcessed: 0,
      nextPaymentDate,
      status: 'active'
    };

    // In production, this would be stored in the database
    console.log('Recurring ACH setup:', recurringPayment);

    return { subscriptionId, nextPaymentDate };
  }

  // Generate NACHA file for batch processing
  async generateNACHAFile(entries: ACHPaymentRequest[]): Promise<string> {
    return this.nachaFormatter.generateFile(entries);
  }

  // Validate routing number using ABA algorithm
  private validateRoutingNumber(routingNumber: string): boolean {
    if (!/^\d{9}$/.test(routingNumber)) {
      return false;
    }

    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    const sum = 0;

    for (const i = 0; i < 9; i++) {
      sum += parseInt(routingNumber.charAt(i)) * weights[i];
    }

    return sum % 10 === 0;
  }

  // Verify bank account via micro-deposits (simplified)
  private async verifyBankAccountMicroDeposits(bankAccount: BankAccount): Promise<{ verified: boolean; verificationId: string }> {
    // In production, this would initiate micro-deposit verification
    const verificationId = 'verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    return {
      verified: this.config.testMode, // Auto-verify in test mode
      verificationId
    };
  }

  // Get transaction code based on operation and account type
  private getTransactionCode(operation: 'debit' | 'credit', accountType: string): string {
    const codes = {
      'debit': {
        'checking': '27',
        'savings': '37',
        'business_checking': '27',
        'business_savings': '37'
      },
      'credit': {
        'checking': '22',
        'savings': '32',
        'business_checking': '22',
        'business_savings': '32'
      }
    };

    return codes[operation][accountType] || '27';
  }

  // Calculate next business day
  private getNextBusinessDay(date: Date = new Date()): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Skip weekends
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
  }

  // Calculate next payment date based on frequency
  private calculateNextPaymentDate(startDate: Date, frequency: string): Date {
    const nextDate = new Date(startDate);

    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return this.getNextBusinessDay(nextDate);
  }

  // Generate ACH transaction ID
  private generateACHTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return 'ach_${timestamp}_${random}';
  }

  // Generate trace number for ACH entry
  private generateTraceNumber(): string {
    const routingPrefix = this.config.routingNumber.substring(0, 8);
    const sequence = Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
    return routingPrefix + sequence;
  }

  // Calculate ACH processing fee
  private calculateACHFee(amount: number): number {
    // Typical ACH fees: $0.25 - $1.50 per transaction
    const baseFee = 25; // 25 cents
    const percentageFee = Math.floor(amount * 0.001); // 0.1%
    return Math.min(baseFee + percentageFee, 150); // Cap at $1.50
  }
}

// NACHA file formatter for ACH batch processing
class NACHAFormatter {
  private config: ACHConfig;

  constructor(config: ACHConfig) {
    this.config = config;
  }

  // Generate NACHA file content
  generateFile(entries: ACHPaymentRequest[]): string {
    const fileHeader = this.generateFileHeader();
    const batchHeader = this.generateBatchHeader(entries);
    const entryDetails = entries.map(entry => this.generateEntryDetail(entry)).join('\n');
    const batchControl = this.generateBatchControl(entries);
    const fileControl = this.generateFileControl(entries);

    return [fileHeader, batchHeader, entryDetails, batchControl, fileControl].join('\n');
  }

  private generateFileHeader(): string {
    const now = new Date();
    const fileCreationDate = now.toISOString().substring(2, 10).replace(/[^\w\s-]/g, '');
    const fileCreationTime = now.toTimeString().substring(0, 4);
    const fileIdModifier = 'A';

    return [
      '1',                                    // Record Type Code
      '01',                                   // Priority Code
      this.config.nacha.immediateDestination.padStart(10, ' '),
      this.config.nacha.immediateOrigin.padStart(10, ' '),
      fileCreationDate,                       // File Creation Date
      fileCreationTime,                       // File Creation Time
      fileIdModifier,                         // File ID Modifier
      '094',                                  // Record Size
      '10',                                   // Blocking Factor
      '1',                                    // Format Code
      this.config.nacha.immediateDestinationName.padEnd(23, ' '),
      this.config.nacha.immediateOriginName.padEnd(23, ' '),
      'REFERENCE'.padEnd(8, ' ')             // Reference Code
    ].join(');
  }

  private generateBatchHeader(entries: ACHPaymentRequest[]): string {
    const serviceClassCode = '200'; // Mixed debits and credits
    const effectiveEntryDate = this.getNextBusinessDay().toISOString().substring(2, 10).replace(/[^\w\s-]/g, '');
    const batchNumber = '0000001';

    return [
      '5',                                    // Record Type Code
      serviceClassCode,                       // Service Class Code
      this.config.originatorName.padEnd(16, ' '),
      ' '.repeat(20),                         // Company Discretionary Data
      this.config.companyId.padStart(10, ' '),
      'PPD',                                  // Standard Entry Class Code
      'PAYMENT'.padEnd(10, ' '),             // Entry Description
      ' '.repeat(6),                          // Descriptive Date
      effectiveEntryDate,                     // Effective Entry Date
      ' '.repeat(3),                          // Settlement Date
      '1',                                    // Originator Status Code
      this.config.routingNumber.substring(0, 8),
      batchNumber
    ].join(');
  }

  private generateEntryDetail(entry: ACHPaymentRequest): string {
    const transactionCode = '27'; // Checking account debit
    const receivingDFI = entry.bankAccount.routingNumber.substring(0, 8);
    const checkDigit = entry.bankAccount.routingNumber.substring(8);
    const amount = entry.amount.toString().padStart(10, '0');
    const traceNumber = this.generateTraceNumber();

    return [
      '6',                                    // Record Type Code
      transactionCode,                        // Transaction Code
      receivingDFI,                          // Receiving DFI Identification
      checkDigit,                            // Check Digit
      entry.bankAccount.accountNumber.padEnd(17, ' '),
      amount,                                // Amount
      entry.bankAccount.accountHolderName.padEnd(22, ' '),
      ' '.repeat(2),                         // Discretionary Data
      '0',                                   // Addenda Record Indicator
      traceNumber
    ].join(');
  }

  private generateBatchControl(entries: ACHPaymentRequest[]): string {
    const serviceClassCode = '200';
    const entryAddendaCount = entries.length.toString().padStart(6, '0');
    const entryHash = this.calculateEntryHash(entries);
    const totalDebits = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredits = 0; // Assuming all debits for simplicity
    const batchNumber = '0000001';

    return [
      '8',                                    // Record Type Code
      serviceClassCode,                       // Service Class Code
      entryAddendaCount,                      // Entry/Addenda Count
      entryHash.toString().padStart(10, '0'), // Entry Hash
      totalDebits.toString().padStart(12, '0'),
      totalCredits.toString().padStart(12, '0'),
      this.config.companyId.padStart(10, ' '),
      ' '.repeat(19),                         // Message Authentication Code
      ' '.repeat(6),                          // Reserved
      this.config.routingNumber.substring(0, 8),
      batchNumber
    ].join(');
  }

  private generateFileControl(entries: ACHPaymentRequest[]): string {
    const batchCount = '000001';
    const blockCount = '000001';
    const entryAddendaCount = entries.length.toString().padStart(8, '0');
    const entryHash = this.calculateEntryHash(entries);
    const totalDebits = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredits = 0;

    return [
      '9',                                    // Record Type Code
      batchCount,                            // Batch Count
      blockCount,                            // Block Count
      entryAddendaCount,                     // Entry/Addenda Count
      entryHash.toString().padStart(10, '0'), // Entry Hash
      totalDebits.toString().padStart(12, '0'),
      totalCredits.toString().padStart(12, '0'),
      ' '.repeat(39)                         // Reserved
    ].join(');
  }

  private calculateEntryHash(entries: ACHPaymentRequest[]): number {
    return entries.reduce((hash, entry) => {
      const routingNumber = parseInt(entry.bankAccount.routingNumber.substring(0, 8));
      return hash + routingNumber;
    }, 0) % 10000000000; // Take last 10 digits
  }

  private getNextBusinessDay(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    
    return tomorrow;
  }

  private generateTraceNumber(): string {
    const routingPrefix = this.config.routingNumber.substring(0, 8);
    const sequence = Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
    return routingPrefix + sequence;
  }
}

// Factory function for creating ACH processor
export function createACHProcessor(config: Partial<ACHConfig> = {}) {
  const defaultConfig: ACHConfig = {
    originatorId: process.env.ACH_ORIGINATOR_ID || 'TEST_ORIG',
    originatorName: process.env.ACH_ORIGINATOR_NAME || 'THORBIS BUSINESS OS',
    companyId: process.env.ACH_COMPANY_ID || '1234567890',
    routingNumber: process.env.ACH_ROUTING_NUMBER || '123456789',
    testMode: process.env.NODE_ENV !== 'production',
    nacha: {
      immediateDestination: process.env.ACH_IMMEDIATE_DESTINATION || '123456789',
      immediateDestinationName: process.env.ACH_IMMEDIATE_DESTINATION_NAME || 'BANK NAME',
      immediateOrigin: process.env.ACH_IMMEDIATE_ORIGIN || '987654321',
      immediateOriginName: process.env.ACH_IMMEDIATE_ORIGIN_NAME || 'THORBIS BUSINESS OS'
    }
  };

  return new ACHProcessor({ ...defaultConfig, ...config });
}