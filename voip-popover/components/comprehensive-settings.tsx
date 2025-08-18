"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Brain,
  Zap,
  MessageSquare,
  Shield,
  Database,
  Phone,
  Calendar,
  CreditCard,
  BarChart3,
  Accessibility,
  Layout,
  Monitor,
  Save,
  RotateCcw,
} from "lucide-react"

type CSRSettings = {
  // Widget Configurations
  widgets: {
    [key: string]: {
      enabled: boolean
      position: { x: number; y: number }
      size: { width: number; height: number }
      refreshInterval: number
      autoUpdate: boolean
      notifications: boolean
      priority: number
    }
  }

  // AI & Automation
  ai: {
    voiceEmotionDetection: boolean
    languageTranslation: boolean
    predictiveText: boolean
    callSummarization: boolean
    sentimentAnalysis: boolean
    responseConfidence: number
    autoSuggestions: boolean
    contextualHelp: boolean
  }

  // Communication Preferences
  communication: {
    preferredChannels: string[]
    autoResponders: boolean
    templateLibrary: boolean
    quickActions: string[]
    escalationThreshold: number
    followUpReminders: boolean
    customerNotes: boolean
    callRecording: boolean
  }

  // Workflow & Productivity
  workflow: {
    autoDispatch: boolean
    slaMonitoring: boolean
    taskAutomation: boolean
    workflowTemplates: string[]
    performanceTracking: boolean
    timeTracking: boolean
    breakReminders: boolean
    focusMode: boolean
  }

  // Integration Settings
  integrations: {
    crm: { enabled: boolean; syncInterval: number; autoUpdate: boolean }
    payment: { enabled: boolean; autoCapture: boolean; receiptEmail: boolean }
    calendar: { enabled: boolean; autoSchedule: boolean; bufferTime: number }
    email: { enabled: boolean; templates: boolean; autoSignature: boolean }
    sms: { enabled: boolean; templates: boolean; deliveryReports: boolean }
  }

  // Accessibility & UI
  accessibility: {
    screenReader: boolean
    highContrast: boolean
    largeText: boolean
    keyboardNavigation: boolean
    voiceCommands: boolean
    colorBlindSupport: boolean
    reducedMotion: boolean
    focusIndicators: boolean
  }

  // Performance & Monitoring
  performance: {
    realTimeMetrics: boolean
    performanceAlerts: boolean
    qualityScoring: boolean
    callAnalytics: boolean
    customerFeedback: boolean
    reportGeneration: boolean
    dataRetention: number
    exportOptions: string[]
  }

  // Security & Compliance
  security: {
    dataEncryption: boolean
    auditLogging: boolean
    sessionTimeout: number
    passwordPolicy: boolean
    twoFactorAuth: boolean
    complianceMode: boolean
    dataAnonymization: boolean
    gdprCompliance: boolean
  }
}

const defaultSettings: CSRSettings = {
  widgets: {},
  ai: {
    voiceEmotionDetection: true,
    languageTranslation: true,
    predictiveText: true,
    callSummarization: true,
    sentimentAnalysis: true,
    responseConfidence: 80,
    autoSuggestions: true,
    contextualHelp: true,
  },
  communication: {
    preferredChannels: ["phone", "email"],
    autoResponders: false,
    templateLibrary: true,
    quickActions: ["transfer", "hold", "mute", "record"],
    escalationThreshold: 5,
    followUpReminders: true,
    customerNotes: true,
    callRecording: true,
  },
  workflow: {
    autoDispatch: false,
    slaMonitoring: true,
    taskAutomation: true,
    workflowTemplates: ["standard", "priority", "technical"],
    performanceTracking: true,
    timeTracking: true,
    breakReminders: true,
    focusMode: false,
  },
  integrations: {
    crm: { enabled: true, syncInterval: 300, autoUpdate: true },
    payment: { enabled: true, autoCapture: false, receiptEmail: true },
    calendar: { enabled: true, autoSchedule: false, bufferTime: 15 },
    email: { enabled: true, templates: true, autoSignature: true },
    sms: { enabled: true, templates: true, deliveryReports: true },
  },
  accessibility: {
    screenReader: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: true,
    voiceCommands: false,
    colorBlindSupport: false,
    reducedMotion: false,
    focusIndicators: true,
  },
  performance: {
    realTimeMetrics: true,
    performanceAlerts: true,
    qualityScoring: true,
    callAnalytics: true,
    customerFeedback: true,
    reportGeneration: true,
    dataRetention: 90,
    exportOptions: ["csv", "pdf", "json"],
  },
  security: {
    dataEncryption: true,
    auditLogging: true,
    sessionTimeout: 480,
    passwordPolicy: true,
    twoFactorAuth: false,
    complianceMode: true,
    dataAnonymization: false,
    gdprCompliance: true,
  },
}

interface ComprehensiveSettingsProps {
  onSettingsChange?: (settings: CSRSettings) => void
  className?: string
}

export default function ComprehensiveSettings({ onSettingsChange, className }: ComprehensiveSettingsProps) {
  const [settings, setSettings] = useState<CSRSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState("ai")
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("voip-csr-settings")
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      }
    } catch (error) {
      console.warn("Failed to load CSR settings:", error)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem("voip-csr-settings", JSON.stringify(settings))
      onSettingsChange?.(settings)
      setHasChanges(false)
    } catch (error) {
      console.warn("Failed to save CSR settings:", error)
    }
  }

  // Reset to defaults
  const resetSettings = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
  }

  // Update setting helper
  const updateSetting = (path: string, value: any) => {
    const keys = path.split(".")
    setSettings((prev) => {
      const newSettings = { ...prev }
      let current: any = newSettings

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newSettings
    })
    setHasChanges(true)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Settings className="h-4 w-4" />
          CSR Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-neutral-900 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-neutral-100 flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-400" />
            Comprehensive CSR Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-8 bg-neutral-800">
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="communication" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Comm
            </TabsTrigger>
            <TabsTrigger value="workflow" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Flow
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Apps
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="text-xs">
              <Accessibility className="h-3 w-3 mr-1" />
              A11y
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Perf
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Sec
            </TabsTrigger>
            <TabsTrigger value="widgets" className="text-xs">
              <Layout className="h-3 w-3 mr-1" />
              UI
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            {/* AI & Automation Tab */}
            <TabsContent value="ai" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Voice Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Emotion Detection</Label>
                      <Switch
                        checked={settings.ai.voiceEmotionDetection}
                        onCheckedChange={(checked) => updateSetting("ai.voiceEmotionDetection", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Language Translation</Label>
                      <Switch
                        checked={settings.ai.languageTranslation}
                        onCheckedChange={(checked) => updateSetting("ai.languageTranslation", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Sentiment Analysis</Label>
                      <Switch
                        checked={settings.ai.sentimentAnalysis}
                        onCheckedChange={(checked) => updateSetting("ai.sentimentAnalysis", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Smart Assistance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Predictive Text</Label>
                      <Switch
                        checked={settings.ai.predictiveText}
                        onCheckedChange={(checked) => updateSetting("ai.predictiveText", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Call Summarization</Label>
                      <Switch
                        checked={settings.ai.callSummarization}
                        onCheckedChange={(checked) => updateSetting("ai.callSummarization", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Auto Suggestions</Label>
                      <Switch
                        checked={settings.ai.autoSuggestions}
                        onCheckedChange={(checked) => updateSetting("ai.autoSuggestions", checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-300">
                        Response Confidence: {settings.ai.responseConfidence}%
                      </Label>
                      <Slider
                        value={[settings.ai.responseConfidence]}
                        onValueChange={([value]) => updateSetting("ai.responseConfidence", value)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Communication Tab */}
            <TabsContent value="communication" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Channel Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-300">Preferred Channels</Label>
                      <div className="flex flex-wrap gap-1">
                        {["phone", "email", "sms", "chat", "video"].map((channel) => (
                          <Badge
                            key={channel}
                            variant={settings.communication.preferredChannels.includes(channel) ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => {
                              const channels = settings.communication.preferredChannels.includes(channel)
                                ? settings.communication.preferredChannels.filter((c) => c !== channel)
                                : [...settings.communication.preferredChannels, channel]
                              updateSetting("communication.preferredChannels", channels)
                            }}
                          >
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Template Library</Label>
                      <Switch
                        checked={settings.communication.templateLibrary}
                        onCheckedChange={(checked) => updateSetting("communication.templateLibrary", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Call Recording</Label>
                      <Switch
                        checked={settings.communication.callRecording}
                        onCheckedChange={(checked) => updateSetting("communication.callRecording", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Automation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Auto Responders</Label>
                      <Switch
                        checked={settings.communication.autoResponders}
                        onCheckedChange={(checked) => updateSetting("communication.autoResponders", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Follow-up Reminders</Label>
                      <Switch
                        checked={settings.communication.followUpReminders}
                        onCheckedChange={(checked) => updateSetting("communication.followUpReminders", checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-300">
                        Escalation Threshold: {settings.communication.escalationThreshold} min
                      </Label>
                      <Slider
                        value={[settings.communication.escalationThreshold]}
                        onValueChange={([value]) => updateSetting("communication.escalationThreshold", value)}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Workflow Tab */}
            <TabsContent value="workflow" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Task Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Auto Dispatch</Label>
                      <Switch
                        checked={settings.workflow.autoDispatch}
                        onCheckedChange={(checked) => updateSetting("workflow.autoDispatch", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">SLA Monitoring</Label>
                      <Switch
                        checked={settings.workflow.slaMonitoring}
                        onCheckedChange={(checked) => updateSetting("workflow.slaMonitoring", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Task Automation</Label>
                      <Switch
                        checked={settings.workflow.taskAutomation}
                        onCheckedChange={(checked) => updateSetting("workflow.taskAutomation", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Productivity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Performance Tracking</Label>
                      <Switch
                        checked={settings.workflow.performanceTracking}
                        onCheckedChange={(checked) => updateSetting("workflow.performanceTracking", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Time Tracking</Label>
                      <Switch
                        checked={settings.workflow.timeTracking}
                        onCheckedChange={(checked) => updateSetting("workflow.timeTracking", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Break Reminders</Label>
                      <Switch
                        checked={settings.workflow.breakReminders}
                        onCheckedChange={(checked) => updateSetting("workflow.breakReminders", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Focus Mode</Label>
                      <Switch
                        checked={settings.workflow.focusMode}
                        onCheckedChange={(checked) => updateSetting("workflow.focusMode", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4">
              <div className="space-y-3">
                {Object.entries(settings.integrations).map(([key, integration]) => (
                  <Card key={key} className="bg-neutral-800 border-neutral-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-neutral-100 capitalize flex items-center gap-2">
                        {key === "crm" && <Database className="h-4 w-4" />}
                        {key === "payment" && <CreditCard className="h-4 w-4" />}
                        {key === "calendar" && <Calendar className="h-4 w-4" />}
                        {key === "email" && <MessageSquare className="h-4 w-4" />}
                        {key === "sms" && <Phone className="h-4 w-4" />}
                        {key} Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-neutral-300">Enabled</Label>
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={(checked) => updateSetting(`integrations.${key}.enabled`, checked)}
                        />
                      </div>
                      {integration.syncInterval && (
                        <div className="space-y-1">
                          <Label className="text-xs text-neutral-300">Sync Interval (sec)</Label>
                          <Input
                            type="number"
                            value={integration.syncInterval}
                            onChange={(e) =>
                              updateSetting(`integrations.${key}.syncInterval`, Number.parseInt(e.target.value))
                            }
                            className="h-6 text-xs bg-neutral-700 border-neutral-600"
                          />
                        </div>
                      )}
                      {integration.autoUpdate !== undefined && (
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-neutral-300">Auto Update</Label>
                          <Switch
                            checked={integration.autoUpdate}
                            onCheckedChange={(checked) => updateSetting(`integrations.${key}.autoUpdate`, checked)}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Visual Accessibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(settings.accessibility)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-xs text-neutral-300 capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </Label>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => updateSetting(`accessibility.${key}`, checked)}
                          />
                        </div>
                      ))}
                  </CardContent>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Interaction Accessibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(settings.accessibility)
                      .slice(4)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-xs text-neutral-300 capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </Label>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => updateSetting(`accessibility.${key}`, checked)}
                          />
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Real-time Metrics</Label>
                      <Switch
                        checked={settings.performance.realTimeMetrics}
                        onCheckedChange={(checked) => updateSetting("performance.realTimeMetrics", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Performance Alerts</Label>
                      <Switch
                        checked={settings.performance.performanceAlerts}
                        onCheckedChange={(checked) => updateSetting("performance.performanceAlerts", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Quality Scoring</Label>
                      <Switch
                        checked={settings.performance.qualityScoring}
                        onCheckedChange={(checked) => updateSetting("performance.qualityScoring", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Data Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-300">
                        Data Retention: {settings.performance.dataRetention} days
                      </Label>
                      <Slider
                        value={[settings.performance.dataRetention]}
                        onValueChange={([value]) => updateSetting("performance.dataRetention", value)}
                        max={365}
                        step={30}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Report Generation</Label>
                      <Switch
                        checked={settings.performance.reportGeneration}
                        onCheckedChange={(checked) => updateSetting("performance.reportGeneration", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Data Protection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Data Encryption</Label>
                      <Switch
                        checked={settings.security.dataEncryption}
                        onCheckedChange={(checked) => updateSetting("security.dataEncryption", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Audit Logging</Label>
                      <Switch
                        checked={settings.security.auditLogging}
                        onCheckedChange={(checked) => updateSetting("security.auditLogging", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">GDPR Compliance</Label>
                      <Switch
                        checked={settings.security.gdprCompliance}
                        onCheckedChange={(checked) => updateSetting("security.gdprCompliance", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-neutral-100">Access Control</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-300">
                        Session Timeout: {settings.security.sessionTimeout} min
                      </Label>
                      <Slider
                        value={[settings.security.sessionTimeout]}
                        onValueChange={([value]) => updateSetting("security.sessionTimeout", value)}
                        max={720}
                        step={30}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Two-Factor Auth</Label>
                      <Switch
                        checked={settings.security.twoFactorAuth}
                        onCheckedChange={(checked) => updateSetting("security.twoFactorAuth", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-300">Compliance Mode</Label>
                      <Switch
                        checked={settings.security.complianceMode}
                        onCheckedChange={(checked) => updateSetting("security.complianceMode", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Widgets Tab */}
            <TabsContent value="widgets" className="space-y-4">
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-neutral-100">Widget Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-neutral-400 mb-3">
                    Configure individual widget settings, positions, and behaviors. Widget-specific settings are managed
                    through each widget's context menu.
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      <Layout className="h-3 w-3 mr-1" />
                      Reset Layout
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      <Save className="h-3 w-3 mr-1" />
                      Save Layout
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs bg-transparent">
                      <Monitor className="h-3 w-3 mr-1" />
                      Export Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                Unsaved Changes
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetSettings}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={saveSettings} disabled={!hasChanges}>
              <Save className="h-3 w-3 mr-1" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
