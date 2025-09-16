"use client";

import React, { useState } from "react";
;
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Progress } from '@/components/ui';
;
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import {
  AlertCircle,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Send,
  Shield,
  TrendingUp,
  Zap,
  AlertTriangle,
  DollarSign,
  Building2,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {  } from '@/components/ui';


const taxFilingData = {
  currentQuarter: "Q1 2024",
  nextDueDate: "April 30, 2024",
  daysUntilDue: 5,
  federalTaxesOwed: 28450.75,
  stateTaxesOwed: 12380.50,
  totalTaxLiability: 40831.25,
  aiValidationScore: 99.7,
  complianceStatus: "compliant",
  autoFilingEnabled: true
};

const taxForms = [
  {
    form: "Form 941",
    description: "Quarterly Federal Tax Return",
    status: "ready",
    dueDate: "April 30, 2024",
    amount: 28450.75,
    aiConfidence: 99.8,
    filingMethod: "electronic"
  },
  {
    form: "Form 940",
    description: "Annual Federal Unemployment Tax",
    status: "not-due",
    dueDate: "January 31, 2025",
    amount: 2340.50,
    aiConfidence: 98.5,
    filingMethod: "electronic"
  },
  {
    form: "State Form DE 9",
    description: "California Quarterly Wage Report",
    status: "ready",
    dueDate: "April 30, 2024",
    amount: 12380.50,
    aiConfidence: 99.2,
    filingMethod: "electronic"
  },
  {
    form: "Form W-2",
    description: "Annual Wage Statements",
    status: "completed",
    dueDate: "January 31, 2024",
    amount: 0,
    aiConfidence: 100,
    filingMethod: "electronic"
  }
];

const taxCompliance = [
  {
    jurisdiction: "Federal (IRS)",
    status: "compliant",
    lastFiling: "2024-01-31",
    nextDue: "2024-04-30",
    registrationStatus: "active",
    aiMonitoring: true
  },
  {
    jurisdiction: "California (EDD)",
    status: "compliant",
    lastFiling: "2024-01-31",
    nextDue: "2024-04-30",
    registrationStatus: "active",
    aiMonitoring: true
  },
  {
    jurisdiction: "San Francisco (City)",
    status: "compliant",
    lastFiling: "2024-01-31",
    nextDue: "2024-04-30",
    registrationStatus: "active",
    aiMonitoring: true
  }
];

const aiInsights = [
  {
    type: "optimization",
    title: "R&D Tax Credit Opportunity",
    description: "AI identified $45,000 in potential R&D tax credits based on recent engineering expenses",
    impact: "high",
    savings: "$45,000",
    action: "Review transactions"
  },
  {
    type: "compliance",
    title: "New Hire Reporting Due",
    description: "3 new employees must be reported to state directory within 20 days",
    impact: "medium",
    dueDate: "March 15, 2024",
    action: "Submit reports"
  },
  {
    type: "efficiency",
    title: "Quarterly Payment Optimization",
    description: "Switch to weekly tax deposits to improve cash flow by 3.2%",
    impact: "medium",
    savings: "$1,200/quarter",
    action: "Configure deposits"
  }
];

export function TaxFilingComponent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingForm, setProcessingForm] = useState<string>("");

  const handleFileForm = async (formName: string) => {
    setIsProcessing(true);
    setProcessingForm(formName);
    
    // Simulate AI filing process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setProcessingForm("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Filing & Compliance</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered tax compliance with automated filing and monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Tax Calendar
          </Button>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Send className="mr-2 h-4 w-4" />
            File All Ready Forms
          </Button>
        </div>
      </div>

      {/* AI Compliance Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">100% Tax Compliant</h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                AI monitoring all jurisdictions • Next filing due in {taxFilingData.daysUntilDue} days • {taxFilingData.aiValidationScore}% confidence
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              ${taxFilingData.totalTaxLiability.toLocaleString()}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Total Tax Liability</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Federal Taxes</p>
                  <p className="text-2xl font-bold">${taxFilingData.federalTaxesOwed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Due {taxFilingData.nextDueDate}</p>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">State Taxes</p>
                  <p className="text-2xl font-bold">${taxFilingData.stateTaxesOwed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">3 jurisdictions</p>
                </div>
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Confidence</p>
                  <p className="text-2xl font-bold text-green-600">{taxFilingData.aiValidationScore}%</p>
                  <p className="text-xs text-muted-foreground">Validation score</p>
                </div>
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Days Until Due</p>
                  <p className="text-2xl font-bold text-orange-600">{taxFilingData.daysUntilDue}</p>
                  <p className="text-xs text-muted-foreground">Next filing deadline</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forms">Tax Forms</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="history">Filing History</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Tax Forms Ready for Filing
              </CardTitle>
              <CardDescription>
                AI-prepared tax forms with automated validation and e-filing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>AI Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxForms.map((form, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{form.form}</TableCell>
                      <TableCell>{form.description}</TableCell>
                      <TableCell>{new Date(form.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {form.amount > 0 ? `$${form.amount.toLocaleString()}' : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          <Brain className="mr-1 h-2 w-2" />
                          {form.aiConfidence}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {form.status === "ready" ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-2 w-2" />
                            Ready to File
                          </Badge>
                        ) : form.status === "completed" ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            <CheckCircle className="mr-1 h-2 w-2" />
                            Filed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-2 w-2" />
                            Not Due
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{form.form} - {form.description}</DialogTitle>
                                <DialogDescription>
                                  AI-generated tax form with detailed calculations
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Alert>
                                  <Brain className="h-4 w-4" />
                                  <AlertDescription>
                                    This form has been validated by AI with {form.aiConfidence}% confidence. 
                                    All calculations verified against current tax regulations.
                                  </AlertDescription>
                                </Alert>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <p className="text-sm text-muted-foreground">Form preview will appear here with detailed calculations, deductions, and tax liability breakdown.</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="ghost">
                            <Download className="h-3 w-3" />
                          </Button>
                          {form.status === "ready" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleFileForm(form.form)}
                              disabled={isProcessing && processingForm === form.form}
                            >
                              {isProcessing && processingForm === form.form ? (
                                <Clock className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Processing Status */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Send className="h-5 w-5 text-blue-600 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">AI Filing {processingForm}</h3>
                        <p className="text-sm text-muted-foreground">
                          Encrypting data, validating compliance, and submitting electronically...
                        </p>
                        <Progress value={75} className="mt-2 h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-green-600" />
                Multi-Jurisdiction Compliance Status
              </CardTitle>
              <CardDescription>
                Real-time monitoring of tax compliance across all jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxCompliance.map((jurisdiction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{jurisdiction.jurisdiction}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last filed: {new Date(jurisdiction.lastFiling).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">
                          {jurisdiction.status}
                        </Badge>
                        {jurisdiction.aiMonitoring && (
                          <Badge variant="outline">
                            <Brain className="mr-1 h-2 w-2" />
                            AI Monitored
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Next due: {new Date(jurisdiction.nextDue).toLocaleDateString()} • 
                      Registration: {jurisdiction.registrationStatus}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={'p-2 rounded-full ${
                        insight.type === "optimization" 
                          ? "bg-green-100 dark:bg-green-900/20" 
                          : insight.type === "compliance"
                          ? "bg-orange-100 dark:bg-orange-900/20"
                          : "bg-blue-100 dark:bg-blue-900/20"
                      }'}>
                        {insight.type === "optimization" ? (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        ) : insight.type === "compliance" ? (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant={
                            insight.impact === "high" ? "default" :
                            insight.impact === "medium" ? "secondary" : "outline"
                          }>
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {insight.savings && (
                              <span className="font-medium text-green-600">
                                Potential savings: {insight.savings}
                              </span>
                            )}
                            {insight.dueDate && (
                              <span className="font-medium text-orange-600">
                                Due: {insight.dueDate}
                              </span>
                            )}
                          </div>
                          <Button size="sm">{insight.action}</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tax Filing History</CardTitle>
              <CardDescription>
                Complete record of all tax filings with AI performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Filing history will appear here once forms are submitted</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}