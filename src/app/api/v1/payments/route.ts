/**
 * Payment Processing API v1
 * Comprehensive payment processing with multiple payment methods
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiPatterns, AuthContext } from "@/lib/api-middleware-wrapper";
import { PermissionPatterns } from "@/lib/api-auth-middleware";

// Payment validation schemas
const paymentQuerySchema = z.object({
  businessId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  status: z.enum(["pending", "processing", "completed", "failed", "refunded", "canceled"]).optional(),
  paymentMethod: z.enum(["card", "ach", "crypto", "mobile_wallet", "terminal"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  amountMin: z.coerce.number().min(0).optional(),
  amountMax: z.coerce.number().min(0).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  include: z.array(z.enum(["customer", "refunds", "metadata", "fees"])).optional().default(["customer"])
});

const paymentCreateSchema = z.object({
  amount: z.number().positive().max(999999.99),
  currency: z.string().length(3).default("USD"),
  customerId: z.string().uuid().optional(),
  paymentMethod: z.enum(["card", "ach", "crypto", "mobile_wallet", "terminal"]),
  paymentDetails: z.object({
    // Card payments
    token: z.string().optional(),
    cardLast4: z.string().length(4).optional(),
    cardBrand: z.string().optional(),
    
    // ACH payments
    routingNumber: z.string().optional(),
    accountNumber: z.string().optional(),
    accountType: z.enum(["checking", "savings"]).optional(),
    
    // Crypto payments
    cryptoCurrency: z.string().optional(),
    walletAddress: z.string().optional(),
    
    // Terminal payments
    terminalId: z.string().optional(),
    readerType: z.string().optional()
  }).optional(),
  description: z.string().max(500).optional(),
  receiptEmail: z.string().email().optional(),
  metadata: z.record(z.string()).optional(),
  captureMethod: z.enum(["automatic", "manual"]).optional().default("automatic"),
  industry: z.enum(["hs", "auto", "rest", "ret"]).optional(),
  // Industry-specific data
  workOrderId: z.string().optional(),
  invoiceId: z.string().optional(),
  serviceType: z.string().optional()
});

const refundCreateSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive().optional(), // If not provided, full refund
  reason: z.enum(["duplicate", "fraudulent", "requested_by_customer", "other"]),
  description: z.string().max(500).optional(),
  notifyCustomer: z.boolean().optional().default(true)
});

/**
 * Payment listing handler
 */
async function getPaymentsHandler(
  request: NextRequest, 
  authContext: AuthContext
): Promise<unknown> {
  const { searchParams } = new URL(request.url);
  const queryParams = paymentQuerySchema.parse(Object.fromEntries(searchParams));

  // Mock payment data - in production, this would query the payment processor and database
  const mockPayments = [
    {
      id: "pay_001",
      businessId: authContext.businessId,
      customerId: "cust_001",
      amount: 1250.00,
      currency: "USD",
      status: "completed",
      paymentMethod: "card",
      paymentDetails: {
        cardLast4: "4242",
        cardBrand: "visa",
        cardType: "credit"
      },
      description: "HVAC System Installation",
      receiptNumber: "RCP-2024-001234",
      fees: {
        processing: 36.25,
        gateway: 2.50,
        total: 38.75
      },
      metadata: {
        workOrderId: "wo_001",
        invoiceId: "inv_001",
        serviceType: "hvac_installation"
      },
      customer: queryParams.include.includes("customer") ? {
        id: "cust_001",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1-555-0123"
      } : undefined,
      refunds: queryParams.include.includes("refunds") ? [] : undefined,
      createdAt: "2024-01-30T14:25:00Z",
      updatedAt: "2024-01-30T14:26:15Z",
      completedAt: "2024-01-30T14:26:15Z"
    },
    {
      id: "pay_002",
      businessId: authContext.businessId,
      customerId: "cust_002",
      amount: 450.00,
      currency: "USD",
      status: "pending",
      paymentMethod: "ach",
      paymentDetails: {
        accountLast4: "1234",
        accountType: "checking",
        bankName: "Wells Fargo"
      },
      description: "Monthly Service Contract",
      receiptNumber: "RCP-2024-001235",
      fees: {
        processing: 8.50,
        gateway: 1.00,
        total: 9.50
      },
      metadata: {
        contractId: "cont_001",
        billingPeriod: "2024-02"
      },
      customer: queryParams.include.includes("customer") ? {
        id: "cust_002",
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        phone: "+1-555-0456"
      } : undefined,
      createdAt: "2024-01-30T10:00:00Z",
      updatedAt: "2024-01-30T10:00:00Z",
      expectedCompletionAt: "2024-02-02T10:00:00Z"
    },
    {
      id: "pay_003",
      businessId: authContext.businessId,
      customerId: "cust_003",
      amount: 89.99,
      currency: "USD",
      status: "failed",
      paymentMethod: "card",
      paymentDetails: {
        cardLast4: "9999",
        cardBrand: "mastercard",
        failureReason: "insufficient_funds",
        failureCode: "card_declined"
      },
      description: "Emergency Plumbing Repair",
      receiptNumber: "RCP-2024-001236",
      metadata: {
        workOrderId: "wo_003",
        serviceType: "plumbing_emergency"
      },
      customer: queryParams.include.includes("customer") ? {
        id: "cust_003",
        name: "Michael Brown",
        email: "michael.brown@example.com",
        phone: "+1-555-0789"
      } : undefined,
      createdAt: "2024-01-29T16:45:00Z",
      updatedAt: "2024-01-29T16:45:30Z",
      failedAt: "2024-01-29T16:45:30Z"
    }
  ];

  // Filter payments based on query parameters
  const filteredPayments = mockPayments.filter(payment => {
    if (queryParams.status && payment.status !== queryParams.status) return false;
    if (queryParams.paymentMethod && payment.paymentMethod !== queryParams.paymentMethod) return false;
    if (queryParams.customerId && payment.customerId !== queryParams.customerId) return false;
    if (queryParams.amountMin && payment.amount < queryParams.amountMin) return false;
    if (queryParams.amountMax && payment.amount > queryParams.amountMax) return false;
    if (queryParams.search) {
      const searchLower = queryParams.search.toLowerCase();
      const searchableText = `${payment.description} ${payment.receiptNumber} ${payment.customer?.name}`.toLowerCase();
      if (!searchableText.includes(searchLower)) return false;
    }
    return true;
  });

  // Pagination
  const total = filteredPayments.length;
  const pages = Math.ceil(total / queryParams.limit);
  const offset = (queryParams.page - 1) * queryParams.limit;
  const paginatedPayments = filteredPayments.slice(offset, offset + queryParams.limit);

  // Calculate summary statistics
  const totalAmount = mockPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedPayments = mockPayments.filter(p => p.status === 'completed');
  const totalFees = mockPayments.reduce((sum, p) => sum + (p.fees?.total || 0), 0);

  return {
    payments: paginatedPayments,
    summary: {
      totalPayments: mockPayments.length,
      totalAmount,
      completedAmount: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: mockPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      failedAmount: mockPayments.filter(p => p.status === 'failed`).reduce((sum, p) => sum + p.amount, 0),
      totalFees,
      successRate: mockPayments.length > 0 
        ? (completedPayments.length / mockPayments.length) * 100 
        : 0,
      averageTransactionSize: mockPayments.length > 0 
        ? totalAmount / mockPayments.length 
        : 0
    },
    pagination: {
      page: queryParams.page,
      limit: queryParams.limit,
      total,
      pages,
      hasNext: queryParams.page < pages,
      hasPrev: queryParams.page > 1
    },
    filters: queryParams
  };
}

/**
 * Payment creation handler
 */
async function createPaymentHandler(
  request: NextRequest, 
  authContext: AuthContext, body: unknown): Promise<unknown> {
  const paymentData = paymentCreateSchema.parse(body);

  // Mock payment processing - in production, this would integrate with Stripe, etc.
  const paymentId = `pay_${Date.now()}';
  const receiptNumber = 'RCP-2024-${String(Date.now()).slice(-6)}';
  
  // Calculate fees based on payment method
  const calculateFees = (amount: number, method: string) => {
    switch (method) {
      case 'card':
        return {
          processing: Math.round((amount * 0.029 + 0.30) * 100) / 100, // 2.9% + $0.30
          gateway: 2.50,
          total: Math.round((amount * 0.029 + 0.30 + 2.50) * 100) / 100
        };
      case 'ach':
        return {
          processing: Math.round((amount * 0.008) * 100) / 100, // 0.8%
          gateway: 1.00,
          total: Math.round((amount * 0.008 + 1.00) * 100) / 100
        };
      case 'crypto':
        return {
          processing: Math.round((amount * 0.015) * 100) / 100, // 1.5%
          gateway: 0.50,
          total: Math.round((amount * 0.015 + 0.50) * 100) / 100
        };
      default:
        return {
          processing: Math.round((amount * 0.025) * 100) / 100, // 2.5%
          gateway: 2.00,
          total: Math.round((amount * 0.025 + 2.00) * 100) / 100
        };
    }
  };

  const fees = calculateFees(paymentData.amount, paymentData.paymentMethod);
  
  // Simulate payment processing status
  const getPaymentStatus = (method: string) => {
    switch (method) {
      case 'card':
      case 'crypto':
      case 'mobile_wallet':
      case 'terminal':
        return Math.random() > 0.05 ? 'completed' : 'failed'; // 95% success rate
      case 'ach':
        return 'pending'; // ACH payments take time to process
      default:
        return 'processing';
    }
  };

  const status = getPaymentStatus(paymentData.paymentMethod);
  const now = new Date().toISOString();

  const newPayment = {
    id: paymentId,
    businessId: authContext.businessId,
    customerId: paymentData.customerId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    status,
    paymentMethod: paymentData.paymentMethod,
    paymentDetails: paymentData.paymentDetails,
    description: paymentData.description,
    receiptNumber,
    fees,
    metadata: {
      ...paymentData.metadata,
      processedBy: authContext.userId,
      industry: paymentData.industry || authContext.industry
    },
    createdAt: now,
    updatedAt: now,
    ...(status === 'completed' && { completedAt: now }),
    ...(status === 'pending' && paymentData.paymentMethod === 'ach' && {
      expectedCompletionAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    })
  };

  return {
    payment: newPayment,
    message: status === 'completed' 
      ? "Payment processed successfully"
      : status === 'pending' 
        ? "Payment initiated and pending completion"
        : status === 'failed'
          ? "Payment failed - please check payment details"
          : "Payment is being processed",
    nextSteps: status === 'completed' 
      ? [
          "Receipt has been generated",
          paymentData.receiptEmail ? "Receipt email sent to customer" : "Send receipt to customer",
          "Payment recorded in accounting system"
        ]
      : status === 'pending'
        ? [
            "Payment will complete in 1-3 business days",
            "Customer will be notified when payment completes",
            "Monitor payment status in dashboard"
          ]
        : status === 'failed'
          ? [
              "Contact customer for alternative payment method",
              "Verify payment details and retry",
              "Check with payment processor for specific error"
            ]
          : [
              "Payment is being processed",
              "Status will update automatically",
              "Customer will be notified of completion"
            ]
  };
}

// Export API endpoints with proper authentication and permissions
export const GET = ApiPatterns.protected(getPaymentsHandler);

export const POST = ApiPatterns.write(createPaymentHandler);

export type PaymentListResponse = {
  data: {
    payments: Array<{
      id: string;
      businessId: string;
      customerId?: string;
      amount: number;
      currency: string;
      status: string;
      paymentMethod: string;
      paymentDetails: any;
      description?: string;
      receiptNumber: string;
      fees: {
        processing: number;
        gateway: number;
        total: number;
      };
      metadata: Record<string, unknown>;
      customer?: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
      refunds?: unknown[];
      createdAt: string;
      updatedAt: string;
      completedAt?: string;
      failedAt?: string;
      expectedCompletionAt?: string;
    }>;
    summary: {
      totalPayments: number;
      totalAmount: number;
      completedAmount: number;
      pendingAmount: number;
      failedAmount: number;
      totalFees: number;
      successRate: number;
      averageTransactionSize: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: any;
  };
  meta: {
    request_id: string;
    response_time_ms: number;
    timestamp: string;
    cache_status: 'hit' | 'miss' | 'stale';
    usage_cost?: number;
    usage_units?: string;
  };
};