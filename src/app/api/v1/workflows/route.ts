/**
 * Workflow Automation API v1
 * Advanced workflow management with triggers, conditions, and actions
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiPatterns, AuthContext } from "@/lib/api-middleware-wrapper";
import { PermissionPatterns } from "@/lib/api-auth-middleware";

// Workflow validation schemas
const workflowQuerySchema = z.object({
  businessId: z.string().uuid().optional(),
  status: z.enum(["active", "paused", "draft", "archived"]).optional(),
  triggerType: z.enum(["manual", "schedule", "event", "api_call", "data_change", "webhook"]).optional(),
  industry: z.enum(["hs", "auto", "rest", "ret"]).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  sortBy: z.enum(["created_at", "updated_at", "name", "last_execution", "execution_count"]).optional().default("updated_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
});

const workflowCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  industry: z.enum(["hs", "auto", "rest", "ret"]),
  trigger: z.object({
    type: z.enum(["manual", "schedule", "event", "api_call", "data_change", "webhook", "email"]),
    config: z.record(z.any()),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than", "in", "not_in"]),
      value: z.any()
    })).optional()
  }),
  actions: z.array(z.object({
    type: z.enum(["send_email", "send_sms", "create_record", "update_record", "api_request", "webhook_call", "ai_analysis"]),
    config: z.record(z.any()),
    order: z.number().int().min(0)
  })).min(1),
  settings: z.object({
    enableAI: z.boolean().optional().default(true),
    maxExecutionTime: z.number().int().min(30).max(3600).optional().default(300),
    retryAttempts: z.number().int().min(0).max(5).optional().default(3),
    enableLogging: z.boolean().optional().default(true)
  }).optional(),
  enabled: z.boolean().optional().default(false)
});

const workflowExecuteSchema = z.object({
  workflowId: z.string().uuid(),
  payload: z.record(z.any()).optional(),
  dryRun: z.boolean().optional().default(false)
});

/**
 * Workflow listing handler
 */
async function getWorkflowsHandler(
  request: NextRequest, 
  authContext: AuthContext
): Promise<unknown> {
  const { searchParams } = new URL(request.url);
  const queryParams = workflowQuerySchema.parse(Object.fromEntries(searchParams));

  // Mock workflow data - in production, this would query the database
  const mockWorkflows = [
    {
      id: "wf_001",
      businessId: authContext.businessId,
      name: "New Customer Welcome Sequence",
      description: "Automated welcome email and follow-up sequence for new customers",
      industry: authContext.industry,
      status: "active",
      trigger: {
        type: "event",
        event: "customer.created",
        conditions: []
      },
      actions: [
        {
          type: "send_email",
          config: {
            template: "welcome_email",
            delay: 0
          },
          order: 1
        },
        {
          type: "send_email",
          config: {
            template: "onboarding_tips",
            delay: 86400 // 24 hours
          },
          order: 2
        }
      ],
      settings: {
        enableAI: true,
        enableLogging: true,
        retryAttempts: 3
      },
      metrics: {
        totalExecutions: 156,
        successfulExecutions: 152,
        failedExecutions: 4,
        averageExecutionTime: 2340, // ms
        lastExecution: "2024-01-30T15:30:00Z"
      },
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-30T15:30:00Z",
      enabled: true
    },
    {
      id: "wf_002",
      businessId: authContext.businessId,
      name: "High-Value Customer Alert",
      description: "Notify sales team when high-value opportunity is identified",
      industry: authContext.industry,
      status: "active",
      trigger: {
        type: "data_change",
        table: "estimates",
        conditions: [
          {
            field: "total_amount",
            operator: "greater_than",
            value: 10000
          }
        ]
      },
      actions: [
        {
          type: "send_sms",
          config: {
            message: "High-value estimate created: ${estimate.total_amount}",
            recipients: ["${business.sales_team}"]
          },
          order: 1
        },
        {
          type: "create_record",
          config: {
            table: "sales_opportunities",
            data: {
              customer_id: "${estimate.customer_id}",
              amount: "${estimate.total_amount}",
              source: "workflow_automation"
            }
          },
          order: 2
        }
      ],
      metrics: {
        totalExecutions: 23,
        successfulExecutions: 23,
        failedExecutions: 0,
        averageExecutionTime: 1850,
        lastExecution: "2024-01-29T09:15:00Z"
      },
      createdAt: "2024-01-20T14:30:00Z",
      updatedAt: "2024-01-25T16:45:00Z",
      enabled: true
    }
  ];

  // Filter workflows based on query parameters
  const filteredWorkflows = mockWorkflows.filter(workflow => {
    if (queryParams.status && workflow.status !== queryParams.status) return false;
    if (queryParams.triggerType && workflow.trigger.type !== queryParams.triggerType) return false;
    if (queryParams.search && !workflow.name.toLowerCase().includes(queryParams.search.toLowerCase())) return false;
    return true;
  });

  // Sort workflows
  filteredWorkflows.sort((a, b) => {
    let aValue, bValue;
    switch (queryParams.sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'last_execution':
        aValue = a.metrics.lastExecution;
        bValue = b.metrics.lastExecution;
        break;
      case 'execution_count':
        aValue = a.metrics.totalExecutions;
        bValue = b.metrics.totalExecutions;
        break;
      default:
        aValue = a.updatedAt;
        bValue = b.updatedAt;
    }
    
    if (queryParams.sortOrder === 'asc') {
      return aValue < bValue ? -1 : 1;
    }
    return aValue > bValue ? -1 : 1;
  });

  // Pagination
  const total = filteredWorkflows.length;
  const pages = Math.ceil(total / queryParams.limit);
  const offset = (queryParams.page - 1) * queryParams.limit;
  const paginatedWorkflows = filteredWorkflows.slice(offset, offset + queryParams.limit);

  return {
    workflows: paginatedWorkflows,
    summary: {
      totalWorkflows: total,
      activeWorkflows: mockWorkflows.filter(w => w.status === 'active').length,
      totalExecutions: mockWorkflows.reduce((sum, w) => sum + w.metrics.totalExecutions, 0),
      successRate: mockWorkflows.length > 0 
        ? (mockWorkflows.reduce((sum, w) => sum + w.metrics.successfulExecutions, 0) / 
           mockWorkflows.reduce((sum, w) => sum + w.metrics.totalExecutions, 0)) * 100
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
 * Workflow creation handler
 */
async function createWorkflowHandler(
  request: NextRequest, 
  authContext: AuthContext, body: unknown): Promise<unknown> {
  const workflowData = workflowCreateSchema.parse(body);

  // Mock workflow creation - in production, this would save to database
  const newWorkflow = {
    id: `wf_${Date.now()}`,
    businessId: authContext.businessId,
    createdBy: authContext.userId,
    ...workflowData,
    status: workflowData.enabled ? "active" : "draft",
    metrics: {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecution: null
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    workflow: newWorkflow,
    message: "Workflow created successfully",
    nextSteps: [
      workflowData.enabled 
        ? "Workflow is now active and monitoring for triggers"
        : "Enable the workflow to start automation",
      "Test the workflow with sample data",
      "Monitor execution metrics in the dashboard"
    ]
  };
}

/**
 * Workflow execution handler
 */
async function executeWorkflowHandler(
  request: NextRequest, 
  authContext: AuthContext, body: unknown): Promise<unknown> {
  const executeData = workflowExecuteSchema.parse(body);

  // Mock workflow execution - in production, this would trigger the workflow engine
  const executionId = `exec_${Date.now()}';
  
  if (executeData.dryRun) {
    return {
      executionId,
      dryRun: true,
      status: "completed",
      message: "Dry run completed successfully",
      results: {
        actionsPreviewed: [
          {
            type: "send_email",
            recipient: "customer@example.com",
            template: "welcome_email",
            status: "would_execute"
          }
        ],
        estimatedExecutionTime: "2.3 seconds",
        potentialErrors: []
      },
      executedAt: new Date().toISOString()
    };
  }

  return {
    executionId,
    dryRun: false,
    status: "executing",
    message: "Workflow execution started",
    estimatedCompletionTime: new Date(Date.now() + 5000).toISOString(),
    trackingUrl: '/api/v1/workflows/executions/${executionId}',
    startedAt: new Date().toISOString()
  };
}

// Export API endpoints with proper authentication and permissions
export const GET = ApiPatterns.protected(getWorkflowsHandler);

export const POST = ApiPatterns.write(createWorkflowHandler);

/**
 * Execute workflow endpoint
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return ApiPatterns.write(executeWorkflowHandler)(request);
}

export type WorkflowListResponse = {
  data: {
    workflows: Array<{
      id: string;
      businessId: string;
      name: string;
      description?: string;
      industry: string;
      status: string;
      trigger: any;
      actions: unknown[];
      settings: any;
      metrics: {
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
        averageExecutionTime: number;
        lastExecution?: string;
      };
      createdAt: string;
      updatedAt: string;
      enabled: boolean;
    }>;
    summary: {
      totalWorkflows: number;
      activeWorkflows: number;
      totalExecutions: number;
      successRate: number;
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