'use client'

'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'

import { Progress } from '@/components/ui'
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Search,
  Filter,
  Settings,
  Eye,
  Edit,
  Download,
  Upload,
  Bell,
  Flag,
  Target,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  AlertCircle,
  RefreshCw,
  Calendar,
  Plus,
  UserCheck,
  Gavel,
  Building2,
  DollarSign,
  Lock,
  Unlock,
  MessageSquare,
  History,
  Database,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ExternalLink,
  Info,
  X
} from 'lucide-react'

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  // Compliance Overview Data
  const complianceOverview = {
    overallScore: 94,
    kycCompliance: 96,
    amlCompliance: 92,
    regulatoryCompliance: 98,
    activeAlerts: 3,
    pendingReviews: 8,
    completedChecks: 247,
    riskLevel: 'Low'
  }

  // KYC Workflow Data
  const kycWorkflows = [
    {
      id: 1,
      customerName: 'TechStart Industries LLC',
      customerId: 'CUST-2024-001',
      businessType: 'Technology Startup',
      riskLevel: 'medium',
      status: 'pending_review',
      stage: 'document_verification',
      progress: 75,
      submittedDate: '2024-01-15',
      reviewerId: 'REV-001',
      reviewerName: 'Sarah Johnson',
      documentsRequired: ['Articles of Incorporation', 'EIN Certificate', 'Banking Resolution'],
      documentsReceived: ['Articles of Incorporation', 'EIN Certificate'],
      missingDocuments: ['Banking Resolution'],
      lastActivity: '2024-01-16 10:30 AM',
      notes: 'Customer provided initial documentation. Banking resolution pending.'
    },
    {
      id: 2,
      customerName: 'Global Manufacturing Corp',
      customerId: 'CUST-2024-002',
      businessType: 'Manufacturing',
      riskLevel: 'high',
      status: 'compliance_review',
      stage: 'enhanced_due_diligence',
      progress: 60,
      submittedDate: '2024-01-10',
      reviewerId: 'REV-002',
      reviewerName: 'Michael Chen',
      documentsRequired: ['Articles of Incorporation', 'EIN Certificate', 'Financial Statements', 'Beneficial Ownership Form'],
      documentsReceived: ['Articles of Incorporation', 'EIN Certificate', 'Financial Statements'],
      missingDocuments: ['Beneficial Ownership Form'],
      lastActivity: '2024-01-16 2:15 PM',
      notes: 'High-risk entity requiring enhanced due diligence. Financial review in progress.'
    },
    {
      id: 3,
      customerName: 'Local Services Partnership',
      customerId: 'CUST-2024-003',
      businessType: 'Professional Services',
      riskLevel: 'low',
      status: 'approved',
      stage: 'completed',
      progress: 100,
      submittedDate: '2024-01-12',
      reviewerId: 'REV-001',
      reviewerName: 'Sarah Johnson',
      documentsRequired: ['Partnership Agreement', 'EIN Certificate'],
      documentsReceived: ['Partnership Agreement', 'EIN Certificate'],
      missingDocuments: [],
      lastActivity: '2024-01-14 4:45 PM',
      notes: 'Standard KYC completed successfully. Low-risk customer approved.'
    },
    {
      id: 4,
      customerName: 'E-Commerce Innovations Inc',
      customerId: 'CUST-2024-004',
      businessType: 'E-Commerce',
      riskLevel: 'medium',
      status: 'document_collection',
      stage: 'initial_submission',
      progress: 25,
      submittedDate: '2024-01-16',
      reviewerId: null,
      reviewerName: null,
      documentsRequired: ['Articles of Incorporation', 'EIN Certificate', 'Operating Agreement'],
      documentsReceived: ['Articles of Incorporation'],
      missingDocuments: ['EIN Certificate', 'Operating Agreement'],
      lastActivity: '2024-01-16 9:00 AM',
      notes: 'Initial application received. Awaiting additional documentation.'
    },
    {
      id: 5,
      customerName: 'Real Estate Holdings LLC',
      customerId: 'CUST-2024-005',
      businessType: 'Real Estate',
      riskLevel: 'high',
      status: 'rejected',
      stage: 'final_review',
      progress: 95,
      submittedDate: '2024-01-08',
      reviewerId: 'REV-003',
      reviewerName: 'David Rodriguez',
      documentsRequired: ['Articles of Incorporation', 'Operating Agreement', 'Property Listing', 'Source of Funds'],
      documentsReceived: ['Articles of Incorporation', 'Operating Agreement', 'Property Listing'],
      missingDocuments: ['Source of Funds'],
      lastActivity: '2024-01-15 11:20 AM',
      notes: 'Unable to verify source of funds. Application rejected pending additional information.'
    }
  ]

  // AML Monitoring Data
  const amlAlerts = [
    {
      id: 1,
      alertType: 'Suspicious Transaction Pattern',
      customerId: 'CUST-2024-002',
      customerName: 'Global Manufacturing Corp',
      severity: 'high',
      status: 'investigating',
      amount: 75000.00,
      description: 'Multiple large transactions to high-risk jurisdictions',
      flaggedDate: '2024-01-16',
      assignedTo: 'AML-ANALYST-001',
      analystName: 'Jennifer Adams',
      transactionCount: 8,
      timeframe: '7 days',
      riskScore: 85,
      lastUpdated: '2024-01-16 3:30 PM'
    },
    {
      id: 2,
      alertType: 'Velocity Check Failed',
      customerId: 'CUST-2023-145',
      customerName: 'QuickPay Solutions',
      severity: 'medium',
      status: 'under_review',
      amount: 25000.00,
      description: 'Transaction volume exceeded daily limits by 300%',
      flaggedDate: '2024-01-15',
      assignedTo: 'AML-ANALYST-002',
      analystName: 'Robert Kim',
      transactionCount: 15,
      timeframe: '1 day',
      riskScore: 68,
      lastUpdated: '2024-01-16 1:15 PM'
    },
    {
      id: 3,
      alertType: 'Sanctions Screening Hit',
      customerId: 'CUST-2024-001',
      customerName: 'TechStart Industries LLC',
      severity: 'critical',
      status: 'escalated',
      amount: 12500.00,
      description: 'Potential match found on OFAC sanctions list',
      flaggedDate: '2024-01-16',
      assignedTo: 'AML-MANAGER-001',
      analystName: 'Lisa Thompson',
      transactionCount: 1,
      timeframe: 'single transaction',
      riskScore: 95,
      lastUpdated: '2024-01-16 4:00 PM'
    }
  ]

  // Regulatory Reporting Data
  const regulatoryReports = [
    {
      id: 1,
      reportType: 'SAR Filing',
      reportName: 'Suspicious Activity Report - Q1 2024',
      regulatoryBody: 'FinCEN',
      dueDate: '2024-02-15',
      status: 'in_progress',
      completedSections: 6,
      totalSections: 8,
      assignedTo: 'COMPLIANCE-OFFICER-001',
      officerName: 'Maria Gonzalez',
      priority: 'high',
      lastModified: '2024-01-16 2:45 PM',
      filingDeadline: '30 days',
      estimatedCompletion: '2024-01-25'
    },
    {
      id: 2,
      reportType: 'CTR Batch Submission',
      reportName: 'Currency Transaction Reports - January 2024',
      regulatoryBody: 'FinCEN',
      dueDate: '2024-02-01',
      status: 'ready_for_review',
      completedSections: 12,
      totalSections: 12,
      assignedTo: 'COMPLIANCE-OFFICER-002',
      officerName: 'Thomas Wilson',
      priority: 'medium',
      lastModified: '2024-01-15 5:20 PM',
      filingDeadline: '15 days',
      estimatedCompletion: '2024-01-20'
    },
    {
      id: 3,
      reportType: 'BSA Compliance Report',
      reportName: 'Bank Secrecy Act Quarterly Report',
      regulatoryBody: 'Federal Reserve',
      dueDate: '2024-04-30',
      status: 'not_started',
      completedSections: 0,
      totalSections: 15,
      assignedTo: 'COMPLIANCE-OFFICER-001',
      officerName: 'Maria Gonzalez',
      priority: 'low',
      lastModified: '2024-01-10 9:00 AM',
      filingDeadline: '90 days',
      estimatedCompletion: '2024-04-15'
    }
  ]

  // Audit Trail Data
  const auditTrail = [
    {
      id: 1,
      timestamp: '2024-01-16 15:30:22',
      userId: 'USER-001',
      userName: 'Sarah Johnson',
      action: 'KYC_APPROVAL',
      entityType: 'Customer',
      entityId: 'CUST-2024-003',
      description: 'Approved KYC application for Local Services Partnership',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
 Win64; x64) AppleWebKit/537.36',
      riskLevel: 'low',
      category: 'Customer Onboarding'
    },
    {
      id: 2,
      timestamp: '2024-01-16 14:15:08',
      userId: 'USER-002',
      userName: 'Michael Chen',
      action: 'AML_ALERT_ESCALATION',
      entityType: 'Alert',
      entityId: 'AML-2024-003',
      description: 'Escalated sanctions screening alert to management',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      riskLevel: 'critical',
      category: 'AML Monitoring'
    },
    {
      id: 3,
      timestamp: '2024-01-16 13:45:33',
      userId: 'USER-003',
      userName: 'Jennifer Adams',
      action: 'TRANSACTION_REVIEW',
      entityType: 'Transaction',
      entityId: 'TXN-2024-789456',
      description: 'Reviewed suspicious transaction pattern - investigation ongoing',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      riskLevel: 'high',
      category: 'Transaction Monitoring'
    },
    {
      id: 4,
      timestamp: '2024-01-16 12:20:15',
      userId: 'USER-001',
      userName: 'Sarah Johnson',
      action: 'DOCUMENT_UPLOAD',
      entityType: 'KYC Application',
      entityId: 'CUST-2024-001',
      description: 'Customer uploaded banking resolution document',
      ipAddress: '203.145.67.89',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15',
      riskLevel: 'low',
      category: 'Document Management'
    },
    {
      id: 5,
      timestamp: '2024-01-16 11:05:42',
      userId: 'SYSTEM',
      userName: 'Automated System',
      action: 'SANCTIONS_SCREENING',
      entityType: 'Customer',
      entityId: 'CUST-2024-004',
      description: 'Automated sanctions screening completed - no matches found',
      ipAddress: 'SYSTEM',
      userAgent: 'Automated Process',
      riskLevel: 'low',
      category: 'Automated Compliance'
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Compliance Dashboard</h1>
            <p className="text-neutral-400">
              KYC workflow management, AML monitoring, and regulatory compliance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Review
            </Button>
          </div>
        </div>
      </div>

      {/* Compliance Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              {complianceOverview.overallScore}%
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Overall Compliance Score</h3>
            <p className="text-2xl font-bold text-white">{complianceOverview.overallScore}%</p>
            <div className="flex items-center text-sm text-green-500">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Excellent standing</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              {complianceOverview.activeAlerts}
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Active Alerts</h3>
            <p className="text-2xl font-bold text-white">{complianceOverview.activeAlerts}</p>
            <div className="flex items-center text-sm text-orange-500">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Requires attention</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              {complianceOverview.pendingReviews}
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Pending Reviews</h3>
            <p className="text-2xl font-bold text-white">{complianceOverview.pendingReviews}</p>
            <div className="flex items-center text-sm text-blue-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>In queue</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <CheckCircle className="w-6 h-6 text-purple-500" />
            </div>
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              {complianceOverview.completedChecks}
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Completed Checks</h3>
            <p className="text-2xl font-bold text-white">{complianceOverview.completedChecks}</p>
            <div className="flex items-center text-sm text-purple-500">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>This month</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="kyc" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="kyc" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            KYC Workflow
          </TabsTrigger>
          <TabsTrigger value="aml" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            AML Monitoring
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Regulatory
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kyc" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">KYC Workflow Management</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Search className="w-4 h-4 mr-1" />
                    Search
                  </Button>
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <UserCheck className="w-4 h-4 mr-1" />
                    Start KYC
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {kycWorkflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-neutral-700">
                          {workflow.status === 'approved' ? (
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          ) : workflow.status === 'rejected' ? (
                            <X className="h-6 w-6 text-red-400" />
                          ) : workflow.status === 'pending_review' ? (
                            <Clock className="h-6 w-6 text-orange-400" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white text-lg">{workflow.customerName}</h4>
                          <p className="text-sm text-neutral-400">{workflow.customerId} • {workflow.businessType}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={
                              workflow.riskLevel === 'low' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              workflow.riskLevel === 'medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }>
                              {workflow.riskLevel} Risk
                            </Badge>
                            <span className="text-xs text-neutral-400">Stage: {workflow.stage.replace('_', ' ')}</span>
                            {workflow.reviewerName && (
                              <span className="text-xs text-neutral-400">Reviewer: {workflow.reviewerName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={
                            workflow.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            workflow.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            workflow.status === 'pending_review' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }>
                            {workflow.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-neutral-400 mt-1">
                            Submitted: {workflow.submittedDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-neutral-400">Progress</span>
                        <span className="text-sm font-medium text-white">{workflow.progress}%</span>
                      </div>
                      <Progress value={workflow.progress} className="h-2 bg-neutral-700" />
                    </div>
                    
                    {/* Document Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-sm font-medium text-white mb-2">Documents Received</h5>
                        <div className="space-y-1">
                          {workflow.documentsReceived.map((doc, index) => (
                            <div key={index} className="flex items-center text-xs text-green-400">
                              <CheckCircle className="w-3 h-3 mr-2" />
                              {doc}
                            </div>
                          ))}
                        </div>
                      </div>
                      {workflow.missingDocuments.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-white mb-2">Missing Documents</h5>
                          <div className="space-y-1">
                            {workflow.missingDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center text-xs text-orange-400">
                                <AlertCircle className="w-3 h-3 mr-2" />
                                {doc}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Notes */}
                    {workflow.notes && (
                      <div className="pt-4 border-t border-neutral-700">
                        <p className="text-xs text-neutral-400">
                          <span className="font-medium">Notes:</span> {workflow.notes}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Last activity: {workflow.lastActivity}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aml" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">AML Monitoring & Suspicious Activity Reporting</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Download className="w-4 h-4 mr-1" />
                    Export SAR
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Flag className="w-4 h-4 mr-1" />
                    Flag Alert
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {amlAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-neutral-700">
                          {alert.severity === 'critical' ? (
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                          ) : alert.severity === 'high' ? (
                            <AlertCircle className="h-6 w-6 text-orange-500" />
                          ) : (
                            <Info className="h-6 w-6 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white text-lg">{alert.alertType}</h4>
                          <p className="text-sm text-neutral-400">{alert.customerName} • {alert.customerId}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={
                              alert.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              alert.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }>
                              {alert.severity} Priority
                            </Badge>
                            <span className="text-xs text-neutral-400">Risk Score: {alert.riskScore}</span>
                            <span className="text-xs text-neutral-400">Analyst: {alert.analystName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${alert.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {alert.transactionCount} transactions • {alert.timeframe}
                          </p>
                          <Badge className={
                            alert.status === 'escalated' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            alert.status === 'investigating' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }>
                            {alert.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-neutral-700 pt-4">
                      <p className="text-sm text-neutral-300 mb-2">{alert.description}</p>
                      <div className="flex justify-between items-center text-xs text-neutral-400">
                        <span>Flagged: {alert.flaggedDate}</span>
                        <span>Last Updated: {alert.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regulatory" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Regulatory Reporting & Automated Compliance Checks</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Calendar className="w-4 h-4 mr-1" />
                    Schedule
                  </Button>
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Auto Check
                  </Button>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Gavel className="w-4 h-4 mr-1" />
                    New Report
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {regulatoryReports.map((report) => (
                  <div key={report.id} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-neutral-700">
                          {report.status === 'ready_for_review' ? (
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          ) : report.status === 'in_progress' ? (
                            <Clock className="h-6 w-6 text-orange-400" />
                          ) : (
                            <FileText className="h-6 w-6 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white text-lg">{report.reportName}</h4>
                          <p className="text-sm text-neutral-400">{report.reportType} • {report.regulatoryBody}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={
                              report.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              report.priority === 'medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }>
                              {report.priority} Priority
                            </Badge>
                            <span className="text-xs text-neutral-400">Due: {report.dueDate}</span>
                            <span className="text-xs text-neutral-400">Officer: {report.officerName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={
                            report.status === 'ready_for_review' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            report.status === 'in_progress' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }>
                            {report.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-neutral-400 mt-1">
                            Est. completion: {report.estimatedCompletion}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-neutral-400">Completion Progress</span>
                        <span className="text-sm font-medium text-white">
                          {report.completedSections}/{report.totalSections} sections ({Math.round((report.completedSections / report.totalSections) * 100)}%)
                        </span>
                      </div>
                      <Progress value={(report.completedSections / report.totalSections) * 100} className="h-2 bg-neutral-700" />
                    </div>
                    
                    <div className="border-t border-neutral-700 pt-4">
                      <div className="flex justify-between items-center text-xs text-neutral-400">
                        <span>Filing Deadline: {report.filingDeadline}</span>
                        <span>Last Modified: {report.lastModified}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Audit Trail Viewer</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </Button>
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Search className="w-4 h-4 mr-1" />
                    Search
                  </Button>
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {auditTrail.map((entry) => (
                  <div key={entry.id} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-neutral-700">
                          {entry.action.includes('APPROVAL') ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : entry.action.includes('ESCALATION') ? (
                            <ArrowUpRight className="h-5 w-5 text-red-400" />
                          ) : entry.action.includes('REVIEW') ? (
                            <Eye className="h-5 w-5 text-blue-400" />
                          ) : entry.action.includes('UPLOAD') ? (
                            <Upload className="h-5 w-5 text-purple-400" />
                          ) : (
                            <Activity className="h-5 w-5 text-orange-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{entry.description}</h4>
                          <div className="flex items-center gap-4 text-sm text-neutral-400">
                            <span>{entry.userName}</span>
                            <span>•</span>
                            <span>{entry.category}</span>
                            <span>•</span>
                            <span>{entry.entityType} ID: {entry.entityId}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={
                            entry.riskLevel === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            entry.riskLevel === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }>
                            {entry.riskLevel} Risk
                          </Badge>
                          <p className="text-xs text-neutral-400 mt-1">
                            {entry.timestamp}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {entry.ipAddress !== 'SYSTEM' && (
                      <div className="border-t border-neutral-700 pt-3">
                        <div className="flex items-center gap-6 text-xs text-neutral-500">
                          <span>IP: {entry.ipAddress}</span>
                          <span>User Agent: {entry.userAgent.substring(0, 60)}...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}