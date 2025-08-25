"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Database,
  Save,
  Download,
  FolderSyncIcon as Sync,
  CheckCircle,
  FileText,
  ImageIcon,
  MapPin,
  Calendar,
  DollarSign,
  Hash,
  Type,
  Clock,
  Shield,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "checkbox"
  | "textarea"
  | "file"
  | "image"
  | "location"
  | "signature"

type ValidationRule = {
  type: "required" | "min" | "max" | "pattern" | "custom"
  value?: any
  message: string
}

type FieldDefinition = {
  id: string
  name: string
  label: string
  type: FieldType
  required: boolean
  placeholder?: string
  options?: string[]
  validation?: ValidationRule[]
  defaultValue?: any
  conditional?: {
    field: string
    value: any
    operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than"
  }
  integration?: {
    source: string
    mapping: string
    autoFill: boolean
  }
}

type FormTemplate = {
  id: string
  name: string
  description: string
  category: "customer" | "technical" | "billing" | "compliance" | "custom"
  fields: FieldDefinition[]
  integrations: string[]
  autoSave: boolean
  version: string
}

type CapturedData = {
  fieldId: string
  value: any
  timestamp: Date
  source: "manual" | "auto" | "integration" | "ai"
  confidence?: number
  validated: boolean
}

type IntegrationStatus = {
  id: string
  name: string
  status: "connected" | "disconnected" | "syncing" | "error"
  lastSync?: Date
  recordsCount?: number
}

// Mock form templates
const formTemplates: FormTemplate[] = [
  {
    id: "customer-intake",
    name: "Customer Intake Form",
    description: "Comprehensive customer information capture",
    category: "customer",
    autoSave: true,
    version: "2.1",
    integrations: ["salesforce", "hubspot", "zendesk"],
    fields: [
      {
        id: "customer-name",
        name: "customerName",
        label: "Customer Name",
        type: "text",
        required: true,
        validation: [{ type: "required", message: "Customer name is required" }],
        integration: { source: "crm", mapping: "contact.name", autoFill: true },
      },
      {
        id: "customer-email",
        name: "customerEmail",
        label: "Email Address",
        type: "email",
        required: true,
        validation: [
          { type: "required", message: "Email is required" },
          { type: "pattern", value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" },
        ],
        integration: { source: "crm", mapping: "contact.email", autoFill: true },
      },
      {
        id: "customer-phone",
        name: "customerPhone",
        label: "Phone Number",
        type: "phone",
        required: true,
        integration: { source: "caller-id", mapping: "phone", autoFill: true },
      },
      {
        id: "company-name",
        name: "companyName",
        label: "Company Name",
        type: "text",
        required: false,
        integration: { source: "crm", mapping: "account.name", autoFill: true },
      },
      {
        id: "issue-category",
        name: "issueCategory",
        label: "Issue Category",
        type: "select",
        required: true,
        options: ["Technical Support", "Billing Inquiry", "Product Question", "Complaint", "Feature Request"],
      },
      {
        id: "priority-level",
        name: "priorityLevel",
        label: "Priority Level",
        type: "select",
        required: true,
        options: ["Low", "Medium", "High", "Critical"],
        defaultValue: "Medium",
      },
      {
        id: "issue-description",
        name: "issueDescription",
        label: "Issue Description",
        type: "textarea",
        required: true,
        placeholder: "Please describe the issue in detail...",
        validation: [
          { type: "required", message: "Issue description is required" },
          { type: "min", value: 10, message: "Description must be at least 10 characters" },
        ],
      },
      {
        id: "previous-ticket",
        name: "previousTicket",
        label: "Previous Ticket Number",
        type: "text",
        required: false,
        placeholder: "e.g., TKT-12345",
        conditional: {
          field: "issue-category",
          value: "Technical Support",
          operator: "equals",
        },
      },
    ],
  },
  {
    id: "technical-assessment",
    name: "Technical Assessment",
    description: "Detailed technical issue evaluation",
    category: "technical",
    autoSave: true,
    version: "1.8",
    integrations: ["jira", "servicenow"],
    fields: [
      {
        id: "system-affected",
        name: "systemAffected",
        label: "System Affected",
        type: "multiselect",
        required: true,
        options: ["SmartGate Controller", "Mobile App", "Web Portal", "API", "Database", "Network"],
      },
      {
        id: "error-code",
        name: "errorCode",
        label: "Error Code",
        type: "text",
        required: false,
        placeholder: "e.g., 0x2F, ERR_001",
      },
      {
        id: "steps-to-reproduce",
        name: "stepsToReproduce",
        label: "Steps to Reproduce",
        type: "textarea",
        required: true,
        placeholder: "1. First step\n2. Second step\n3. Error occurs",
      },
      {
        id: "environment",
        name: "environment",
        label: "Environment",
        type: "select",
        required: true,
        options: ["Production", "Staging", "Development", "Testing"],
        defaultValue: "Production",
      },
      {
        id: "impact-assessment",
        name: "impactAssessment",
        label: "Business Impact",
        type: "select",
        required: true,
        options: ["No Impact", "Low Impact", "Medium Impact", "High Impact", "Critical Impact"],
      },
    ],
  },
]

// Mock integration statuses
const integrationStatuses: IntegrationStatus[] = [
  {
    id: "salesforce",
    name: "Salesforce CRM",
    status: "connected",
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    recordsCount: 1247,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    status: "syncing",
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
    recordsCount: 892,
  },
  {
    id: "zendesk",
    name: "Zendesk",
    status: "connected",
    lastSync: new Date(Date.now() - 1 * 60 * 1000),
    recordsCount: 2156,
  },
  {
    id: "jira",
    name: "Jira",
    status: "error",
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    recordsCount: 0,
  },
]

type DataCaptureProps = {
  callId: string
  callerContext?: Record<string, any>
  onDataSaved?: (data: Record<string, any>) => void
  className?: string
}

export default function ProfessionalDataCapture({
  callId,
  callerContext = {},
  onDataSaved,
  className,
}: DataCaptureProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [capturedData, setCapturedData] = useState<CapturedData[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(integrationStatuses)
  const [isCapturing, setIsCapturing] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({})

  const autoSaveTimer = useRef<NodeJS.Timeout>()

  // Auto-select template based on caller context
  useEffect(() => {
    if (callerContext.caller_intent === "technical_support") {
      setSelectedTemplate(formTemplates.find((t) => t.id === "technical-assessment") || null)
    } else {
      setSelectedTemplate(formTemplates.find((t) => t.id === "customer-intake") || null)
    }
  }, [callerContext])

  // Auto-fill from caller context and integrations
  useEffect(() => {
    if (!selectedTemplate) return

    const autoFilledData: Record<string, any> = {}

    selectedTemplate.fields.forEach((field) => {
      if (field.integration?.autoFill) {
        // Simulate auto-fill from integrations
        switch (field.integration.source) {
          case "caller-id":
            if (field.name === "customerPhone") {
              autoFilledData[field.name] = callerContext.phone || "+1 (415) 555-0117"
            }
            break
          case "crm":
            if (field.integration.mapping === "contact.name") {
              autoFilledData[field.name] = callerContext.name || "Jordan Pierce"
            } else if (field.integration.mapping === "contact.email") {
              autoFilledData[field.name] = callerContext.email || "jordan.pierce@acme.com"
            } else if (field.integration.mapping === "account.name") {
              autoFilledData[field.name] = callerContext.company || "ACME Field Services"
            }
            break
        }
      }

      // Set default values
      if (field.defaultValue && !autoFilledData[field.name]) {
        autoFilledData[field.name] = field.defaultValue
      }
    })

    setFormData(autoFilledData)
  }, [selectedTemplate, callerContext])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !selectedTemplate) return

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    autoSaveTimer.current = setTimeout(() => {
      saveData(true)
    }, 3000)

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [formData, autoSaveEnabled, selectedTemplate])

  const validateField = (field: FieldDefinition, value: any): string | null => {
    if (!field.validation) return null

    for (const rule of field.validation) {
      switch (rule.type) {
        case "required":
          if (!value || (typeof value === "string" && value.trim() === "")) {
            return rule.message
          }
          break
        case "min":
          if (typeof value === "string" && value.length < rule.value) {
            return rule.message
          }
          if (typeof value === "number" && value < rule.value) {
            return rule.message
          }
          break
        case "max":
          if (typeof value === "string" && value.length > rule.value) {
            return rule.message
          }
          if (typeof value === "number" && value > rule.value) {
            return rule.message
          }
          break
        case "pattern":
          if (typeof value === "string" && !rule.value.test(value)) {
            return rule.message
          }
          break
      }
    }

    return null
  }

  const updateField = (fieldId: string, value: any, source: CapturedData["source"] = "manual") => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))

    // Add to captured data history
    const capturedEntry: CapturedData = {
      fieldId,
      value,
      timestamp: new Date(),
      source,
      validated: false,
    }

    setCapturedData((prev) => [...prev.filter((c) => c.fieldId !== fieldId), capturedEntry])

    // Validate field
    const field = selectedTemplate?.fields.find((f) => f.id === fieldId)
    if (field) {
      const error = validateField(field, value)
      setValidationErrors((prev) => ({
        ...prev,
        [fieldId]: error || "",
      }))
    }
  }

  const saveData = async (isAutoSave = false) => {
    if (!selectedTemplate) return

    // Validate all required fields
    const errors: Record<string, string> = {}
    selectedTemplate.fields.forEach((field) => {
      const error = validateField(field, formData[field.id])
      if (error) {
        errors[field.id] = error
      }
    })

    if (Object.keys(errors).length > 0 && !isAutoSave) {
      setValidationErrors(errors)
      return
    }

    // Simulate save to integrations
    setLastSaved(new Date())
    onDataSaved?.(formData)

    // Update integration sync status
    setIntegrations((prev) =>
      prev.map((integration) => ({
        ...integration,
        lastSync: new Date(),
        status: "connected" as const,
      })),
    )
  }

  const exportData = () => {
    const exportData = {
      callId,
      template: selectedTemplate?.name,
      data: formData,
      capturedData,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `call-data-${callId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case "email":
        return <Type className="h-3 w-3" />
      case "phone":
        return <Hash className="h-3 w-3" />
      case "currency":
        return <DollarSign className="h-3 w-3" />
      case "date":
      case "datetime":
        return <Calendar className="h-3 w-3" />
      case "location":
        return <MapPin className="h-3 w-3" />
      case "file":
      case "image":
        return <ImageIcon className="h-3 w-3" />
      case "signature":
        return <FileText className="h-3 w-3" />
      default:
        return <Type className="h-3 w-3" />
    }
  }

  const renderField = (field: FieldDefinition) => {
    const value = formData[field.id] || ""
    const error = validationErrors[field.id]
    const isVisible = !field.conditional || checkConditional(field.conditional)

    if (!isVisible) return null

    const commonProps = {
      id: field.id,
      value,
      onChange: (e: any) => updateField(field.id, e.target?.value || e),
      className: cn("bg-neutral-800 border-neutral-700 text-white", error && "border-red-500 focus:border-red-500"),
    }

    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center gap-2">
          {getFieldIcon(field.type)}
          <Label htmlFor={field.id} className="text-sm text-neutral-300">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </Label>
          {field.integration?.autoFill && (
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
              Auto-fill
            </Badge>
          )}
        </div>

        {field.type === "select" && (
          <Select value={value} onValueChange={(val) => updateField(field.id, val)}>
            <SelectTrigger className={commonProps.className}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700">
              {field.options?.map((option) => (
                <SelectItem key={option} value={option} className="text-white">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {field.type === "multiselect" && (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option}`}
                  checked={(value as string[])?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = (value as string[]) || []
                    const newValues = checked ? [...currentValues, option] : currentValues.filter((v) => v !== option)
                    updateField(field.id, newValues)
                  }}
                />
                <Label htmlFor={`${field.id}-${option}`} className="text-sm text-neutral-300">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}

        {field.type === "textarea" && (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder}
            rows={3}
            onChange={(e) => updateField(field.id, e.target.value)}
          />
        )}

        {field.type === "checkbox" && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => updateField(field.id, checked)}
            />
            <Label htmlFor={field.id} className="text-sm text-neutral-300">
              {field.label}
            </Label>
          </div>
        )}

        {!["select", "multiselect", "textarea", "checkbox"].includes(field.type) && (
          <Input
            {...commonProps}
            type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
            placeholder={field.placeholder}
            onChange={(e) => updateField(field.id, e.target.value)}
          />
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  const checkConditional = (conditional: FieldDefinition["conditional"]): boolean => {
    if (!conditional) return true

    const conditionValue = formData[conditional.field]
    switch (conditional.operator) {
      case "equals":
        return conditionValue === conditional.value
      case "not_equals":
        return conditionValue !== conditional.value
      case "contains":
        return String(conditionValue).includes(String(conditional.value))
      default:
        return true
    }
  }

  return (
    <Card className={cn("bg-neutral-900 border-neutral-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-orange-400" />
            <CardTitle className="text-sm text-white">Data Capture</CardTitle>
            {lastSaved && (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                <Clock className="h-2 w-2 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className="h-6 px-2 text-xs"
              title="Toggle Auto-save"
            >
              <Sync className={cn("h-3 w-3", autoSaveEnabled ? "text-green-400" : "text-neutral-400")} />
            </Button>

            <Button size="sm" variant="ghost" onClick={exportData} className="h-6 px-2 text-xs" title="Export Data">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div>
          <Label className="text-xs font-medium text-neutral-300 mb-2 block">Form Template</Label>
          <Select
            value={selectedTemplate?.id || ""}
            onValueChange={(templateId) => {
              const template = formTemplates.find((t) => t.id === templateId)
              setSelectedTemplate(template || null)
              setFormData({})
              setValidationErrors({})
            }}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
              <SelectValue placeholder="Select form template..." />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700">
              {formTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id} className="text-white">
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-neutral-400">{template.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <>
            <Separator className="bg-neutral-800" />

            {/* Integration Status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-3 w-3 text-blue-400" />
                <span className="text-xs font-medium text-neutral-300">Integrations</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {integrations
                  .filter((integration) => selectedTemplate.integrations.includes(integration.id))
                  .map((integration) => (
                    <div key={integration.id} className="flex items-center gap-2 p-2 rounded bg-neutral-800/50">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          integration.status === "connected"
                            ? "bg-green-500"
                            : integration.status === "syncing"
                              ? "bg-yellow-500 animate-pulse"
                              : "bg-red-500",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">{integration.name}</div>
                        <div className="text-xs text-neutral-400">
                          {integration.recordsCount ? `${integration.recordsCount} records` : "No data"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <Separator className="bg-neutral-800" />

            {/* Form Fields */}
            <div className="space-y-4 max-h-96 overflow-y-auto">{selectedTemplate.fields.map(renderField)}</div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Shield className="h-3 w-3" />
                <span>
                  {Object.keys(formData).length} of {selectedTemplate.fields.length} fields completed
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => saveData(false)}
                  className="h-7 px-3 text-xs border-neutral-700 bg-neutral-800 text-neutral-300"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save Draft
                </Button>

                <Button
                  size="sm"
                  onClick={() => saveData(false)}
                  className="h-7 px-3 text-xs bg-orange-500 hover:bg-orange-600"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
