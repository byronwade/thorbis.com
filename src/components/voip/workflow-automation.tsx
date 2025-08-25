"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Zap,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Settings,
  Play,
  Pause,
  Target,
  Workflow,
  Brain,
} from "lucide-react"
import { cn } from "@/lib/utils"
import AdvancedWorkflowFeatures from "./advanced-workflow-features"

type WorkflowStep = {
  id: string
  type: "condition" | "action" | "escalation" | "notification" | "integration"
  title: string
  description: string
  status: "pending" | "active" | "completed" | "failed" | "skipped"
  duration?: number
  automated: boolean
  config?: Record<string, any>
}

type WorkflowTemplate = {
  id: string
  name: string
  description: string
  category: "support" | "sales" | "billing" | "emergency"
  priority: "low" | "medium" | "high" | "critical"
  estimatedDuration: number
  steps: WorkflowStep[]
  triggers: string[]
  conditions: Record<string, any>
}

type ActiveWorkflow = {
  id: string
  templateId: string
  name: string
  status: "running" | "paused" | "completed" | "failed"
  progress: number
  startedAt: Date
  estimatedCompletion: Date
  currentStep: number
  steps: WorkflowStep[]
  context: Record<string, any>
}

// Mock workflow templates
const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "tech-support-standard",
    name: "Technical Support - Standard",
    description: "Standard technical support workflow with escalation paths",
    category: "support",
    priority: "medium",
    estimatedDuration: 15,
    triggers: ["caller_intent:technical_support", "caller_tier:gold|silver"],
    conditions: { riskScore: { max: 50 }, openTickets: { max: 3 } },
    steps: [
      {
        id: "verify-identity",
        type: "condition",
        title: "Verify Caller Identity",
        description: "Confirm caller identity and account access",
        status: "pending",
        automated: false,
      },
      {
        id: "check-known-issues",
        type: "action",
        title: "Check Known Issues",
        description: "Search knowledge base for similar issues",
        status: "pending",
        automated: true,
        duration: 30,
      },
      {
        id: "create-ticket",
        type: "integration",
        title: "Create Support Ticket",
        description: "Auto-create ticket with caller context",
        status: "pending",
        automated: true,
        duration: 15,
      },
      {
        id: "gather-diagnostics",
        type: "action",
        title: "Gather Diagnostic Info",
        description: "Collect system logs and error details",
        status: "pending",
        automated: false,
      },
      {
        id: "attempt-resolution",
        type: "action",
        title: "Attempt Resolution",
        description: "Apply standard troubleshooting steps",
        status: "pending",
        automated: false,
      },
      {
        id: "escalate-if-needed",
        type: "escalation",
        title: "Escalate to L2 Support",
        description: "Escalate if issue not resolved in 10 minutes",
        status: "pending",
        automated: true,
        config: { timeLimit: 600, escalationTarget: "l2-support" },
      },
    ],
  },
  {
    id: "vip-customer-priority",
    name: "VIP Customer - Priority Handling",
    description: "Expedited workflow for platinum tier customers",
    category: "support",
    priority: "high",
    estimatedDuration: 8,
    triggers: ["caller_tier:platinum", "caller_priority:vip"],
    conditions: {},
    steps: [
      {
        id: "priority-queue",
        type: "action",
        title: "Priority Queue Assignment",
        description: "Route to senior agent immediately",
        status: "pending",
        automated: true,
        duration: 5,
      },
      {
        id: "notify-supervisor",
        type: "notification",
        title: "Notify Supervisor",
        description: "Alert supervisor of VIP customer call",
        status: "pending",
        automated: true,
        duration: 10,
      },
      {
        id: "load-vip-context",
        type: "integration",
        title: "Load VIP Context",
        description: "Retrieve complete customer history and preferences",
        status: "pending",
        automated: true,
        duration: 20,
      },
    ],
  },
  {
    id: "billing-dispute-resolution",
    name: "Billing Dispute Resolution",
    description: "Structured workflow for billing inquiries and disputes",
    category: "billing",
    priority: "medium",
    estimatedDuration: 20,
    triggers: ["caller_intent:billing", "keywords:dispute|charge|refund"],
    conditions: { paymentStatus: ["overdue", "collections"] },
    steps: [
      {
        id: "review-account",
        type: "action",
        title: "Review Account Status",
        description: "Check payment history and current balance",
        status: "pending",
        automated: false,
      },
      {
        id: "identify-dispute",
        type: "condition",
        title: "Identify Dispute Type",
        description: "Categorize the billing dispute",
        status: "pending",
        automated: false,
      },
      {
        id: "calculate-adjustments",
        type: "integration",
        title: "Calculate Adjustments",
        description: "Auto-calculate potential credits or adjustments",
        status: "pending",
        automated: true,
        duration: 45,
      },
      {
        id: "manager-approval",
        type: "escalation",
        title: "Manager Approval",
        description: "Require manager approval for adjustments >$100",
        status: "pending",
        automated: true,
        config: { approvalThreshold: 100 },
      },
    ],
  },
]

// Generate active workflow from template
const createActiveWorkflow = (template: WorkflowTemplate, context: Record<string, any>): ActiveWorkflow => {
  const now = new Date()
  const estimatedCompletion = new Date(now.getTime() + template.estimatedDuration * 60 * 1000)

  return {
    id: `workflow-${Date.now()}`,
    templateId: template.id,
    name: template.name,
    status: "running",
    progress: 0,
    startedAt: now,
    estimatedCompletion,
    currentStep: 0,
    steps: template.steps.map((step) => ({ ...step, status: "pending" })),
    context,
  }
}

type WorkflowAutomationProps = {
  callerId: string
  callerContext: Record<string, any>
  onWorkflowComplete?: (workflowId: string, results: Record<string, any>) => void
  className?: string
}

export default function WorkflowAutomation({
  callerId,
  callerContext,
  onWorkflowComplete,
  className,
}: WorkflowAutomationProps) {
  const [activeWorkflows, setActiveWorkflows] = useState<ActiveWorkflow[]>([])
  const [availableTemplates, setAvailableTemplates] = useState<WorkflowTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [manualOverride, setManualOverride] = useState(false)
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)

  // Auto-select workflows based on caller context
  useEffect(() => {
    const matchingTemplates = workflowTemplates.filter((template) => {
      // Check triggers
      const triggerMatch = template.triggers.some((trigger) => {
        const [key, values] = trigger.split(":")
        const expectedValues = values?.split("|") || []
        const contextValue = callerContext[key]
        return expectedValues.includes(contextValue)
      })

      // Check conditions
      const conditionMatch = Object.entries(template.conditions).every(([key, condition]) => {
        const contextValue = callerContext[key]
        if (typeof condition === "object" && condition !== null) {
          if ("max" in condition && contextValue > condition.max) return false
          if ("min" in condition && contextValue < condition.min) return false
          if ("includes" in condition && !condition.includes.includes(contextValue)) return false
        }
        return true
      })

      return triggerMatch && conditionMatch
    })

    setAvailableTemplates(matchingTemplates)

    // Auto-start highest priority workflow
    if (matchingTemplates.length > 0 && !manualOverride) {
      const highestPriority = matchingTemplates.reduce((prev, current) => {
        const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
        return priorityOrder[current.priority] > priorityOrder[prev.priority] ? current : prev
      })

      const newWorkflow = createActiveWorkflow(highestPriority, callerContext)
      setActiveWorkflows([newWorkflow])
    }
  }, [callerId, callerContext, manualOverride])

  const startWorkflow = (templateId: string) => {
    const template = workflowTemplates.find((t) => t.id === templateId)
    if (!template) return

    const newWorkflow = createActiveWorkflow(template, callerContext)
    setActiveWorkflows((prev) => [...prev, newWorkflow])
  }

  const pauseWorkflow = (workflowId: string) => {
    setActiveWorkflows((prev) => prev.map((w) => (w.id === workflowId ? { ...w, status: "paused" } : w)))
  }

  const resumeWorkflow = (workflowId: string) => {
    setActiveWorkflows((prev) => prev.map((w) => (w.id === workflowId ? { ...w, status: "running" } : w)))
  }

  const completeStep = (workflowId: string, stepId: string, results?: Record<string, any>) => {
    setActiveWorkflows((prev) =>
      prev.map((workflow) => {
        if (workflow.id !== workflowId) return workflow

        const updatedSteps = workflow.steps.map((step) =>
          step.id === stepId ? { ...step, status: "completed" as const } : step,
        )

        const completedSteps = updatedSteps.filter((s) => s.status === "completed").length
        const progress = (completedSteps / updatedSteps.length) * 100

        const currentStepIndex = updatedSteps.findIndex((s) => s.status === "pending")

        return {
          ...workflow,
          steps: updatedSteps,
          progress,
          currentStep: currentStepIndex >= 0 ? currentStepIndex : updatedSteps.length,
          status: progress === 100 ? ("completed" as const) : workflow.status,
        }
      }),
    )
  }

  const advanceWorkflowStep = (workflowId: string) => {
    setActiveWorkflows((prev) =>
      prev.map((workflow) => {
        if (workflow.id !== workflowId) return workflow

        const updatedSteps = workflow.steps.map((step, index) =>
          index === workflow.currentStep ? { ...step, status: "completed" as const } : step,
        )

        const completedSteps = updatedSteps.filter((s) => s.status === "completed").length
        const progress = (completedSteps / updatedSteps.length) * 100

        const currentStepIndex = updatedSteps.findIndex((s) => s.status === "pending")

        return {
          ...workflow,
          steps: updatedSteps,
          progress,
          currentStep: currentStepIndex >= 0 ? currentStepIndex : updatedSteps.length,
          status: progress === 100 ? ("completed" as const) : workflow.status,
        }
      }),
    )
  }

  const handleGestureDetected = (gesture: string) => {
    console.log("Gesture detected:", gesture)
    // Handle gesture-based workflow actions
    switch (gesture) {
      case "minimize_all_widgets":
        // Minimize all active workflows
        break
      case "approve_action":
        // Auto-approve current workflow step
        if (activeWorkflows.length > 0) {
          const currentWorkflow = activeWorkflows[0]
          advanceWorkflowStep(currentWorkflow.id)
        }
        break
    }
  }

  const handleVoiceCommand = (command: string) => {
    console.log("Voice command:", command)
    // Handle voice-based workflow actions
    switch (command) {
      case "create_ticket":
        startWorkflow("tech-support-standard")
        break
      case "transfer_billing":
        startWorkflow("billing-dispute-resolution")
        break
    }
  }

  const handleContextualAction = (action: string) => {
    console.log("Contextual action:", action)
    // Handle contextual workflow actions
    if (action.startsWith("apply_template_")) {
      const templateId = action.replace("apply_template_", "")
      // Apply smart template to current workflow
    }
  }

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.type) {
      case "condition":
        return <Target className="h-4 w-4" />
      case "action":
        return <Zap className="h-4 w-4" />
      case "escalation":
        return <AlertCircle className="h-4 w-4" />
      case "notification":
        return <Users className="h-4 w-4" />
      case "integration":
        return <Settings className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "active":
        return "text-orange-400"
      case "failed":
        return "text-red-400"
      case "skipped":
        return "text-neutral-500"
      default:
        return "text-neutral-400"
    }
  }

  return (
    <Card className={cn("bg-neutral-900 border-neutral-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-orange-400" />
            <CardTitle className="text-sm text-white">Workflow Automation</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className="h-7 px-2 text-xs border-neutral-700 bg-neutral-800 text-neutral-300"
            >
              <Brain className="h-3 w-3 mr-1" />
              Advanced
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setManualOverride(!manualOverride)}
              className="h-7 px-2 text-xs border-neutral-700 bg-neutral-800 text-neutral-300"
            >
              {manualOverride ? "Auto" : "Manual"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showAdvancedFeatures && (
          <AdvancedWorkflowFeatures
            callId={callerId}
            isActive={true}
            onGestureDetected={handleGestureDetected}
            onVoiceCommand={handleVoiceCommand}
            onContextualAction={handleContextualAction}
          />
        )}

        {/* Active Workflows */}
        {activeWorkflows.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Play className="h-3 w-3 text-green-400" />
              <span className="text-xs font-medium text-neutral-300">Active Workflows</span>
            </div>

            <div className="space-y-3">
              {activeWorkflows.map((workflow) => (
                <div key={workflow.id} className="rounded-lg bg-neutral-800/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{workflow.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          workflow.status === "running"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : workflow.status === "paused"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : workflow.status === "completed"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20",
                        )}
                      >
                        {workflow.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      {workflow.status === "running" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => pauseWorkflow(workflow.id)}
                          className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      {workflow.status === "paused" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => resumeWorkflow(workflow.id)}
                          className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-400">Progress</span>
                      <span className="text-xs text-neutral-400">{Math.round(workflow.progress)}%</span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-1.5">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${workflow.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Current step */}
                  {workflow.currentStep < workflow.steps.length && (
                    <div className="flex items-center gap-2 p-2 rounded bg-neutral-800 border border-orange-500/20">
                      {getStepIcon(workflow.steps[workflow.currentStep])}
                      <div className="flex-1">
                        <div className="text-xs font-medium text-white">
                          {workflow.steps[workflow.currentStep].title}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {workflow.steps[workflow.currentStep].description}
                        </div>
                      </div>
                      {!workflow.steps[workflow.currentStep].automated && (
                        <Button
                          size="sm"
                          onClick={() => completeStep(workflow.id, workflow.steps[workflow.currentStep].id)}
                          className="h-7 px-2 text-xs bg-orange-500 hover:bg-orange-600"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Step list */}
                  <div className="mt-3 space-y-1">
                    {workflow.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-2 text-xs">
                        <div className={cn("w-4 h-4 flex items-center justify-center", getStatusColor(step.status))}>
                          {step.status === "completed" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : idx === workflow.currentStep ? (
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-neutral-600" />
                          )}
                        </div>
                        <span className={cn("flex-1", getStatusColor(step.status))}>{step.title}</span>
                        {step.automated && (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                            Auto
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Templates */}
        {availableTemplates.length > 0 && activeWorkflows.length === 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-3 w-3 text-blue-400" />
              <span className="text-xs font-medium text-neutral-300">Suggested Workflows</span>
            </div>

            <div className="space-y-2">
              {availableTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-2 rounded bg-neutral-800/30">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-white">{template.name}</div>
                    <div className="text-xs text-neutral-400">{template.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          template.priority === "critical"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : template.priority === "high"
                              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20",
                        )}
                      >
                        {template.priority.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-neutral-500">~{template.estimatedDuration}m</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => startWorkflow(template.id)}
                    className="h-7 px-2 text-xs bg-orange-500 hover:bg-orange-600"
                  >
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Template Selection */}
        {manualOverride && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-3 w-3 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-300">Manual Selection</span>
            </div>

            <div className="space-y-2">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue placeholder="Choose workflow template..." />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  {workflowTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id} className="text-white">
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTemplate && (
                <Button
                  size="sm"
                  onClick={() => startWorkflow(selectedTemplate)}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  Start Selected Workflow
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
