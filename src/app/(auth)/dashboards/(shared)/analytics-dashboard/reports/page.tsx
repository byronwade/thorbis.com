"use client";

import { useSearchParams } from "next/navigation";
import { FileText, Upload, Download, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportBuilder, ReportTemplate } from "@/components/analytics/builders/report-builder";
import { AnalyticsBackButton } from "@/components/analytics/analytics-back-button";
import { useState } from "react";

export default function AnalyticsReports() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Mock data sources for report builder
  const availableDataSources = [
    {
      id: 'analytics',
      name: 'Analytics Data',
      fields: [
        { name: 'timestamp', type: 'date', description: 'Event timestamp' },
        { name: 'revenue', type: 'number', description: 'Revenue amount' },
        { name: 'users', type: 'number', description: 'User count' },
        { name: 'sessions', type: 'number', description: 'Session count' },
        { name: 'conversions', type: 'number', description: 'Conversion count' },
        { name: 'page_views', type: 'number', description: 'Page view count' },
        { name: 'source', type: 'string', description: 'Traffic source' },
        { name: 'device', type: 'string', description: 'Device type' },
      ] as Array<{ name: string; type: 'string' | 'number' | 'date' | 'boolean'; description?: string }>,
    },
    {
      id: 'field_service',
      name: 'Field Service Data',
      fields: [
        { name: 'job_date', type: 'date', description: 'Job completion date' },
        { name: 'job_value', type: 'number', description: 'Job value' },
        { name: 'technician_id', type: 'string', description: 'Technician identifier' },
        { name: 'completion_time', type: 'number', description: 'Time to complete (minutes)' },
        { name: 'customer_rating', type: 'number', description: 'Customer satisfaction rating' },
        { name: 'industry', type: 'string', description: 'Industry type' },
      ] as Array<{ name: string; type: 'string' | 'number' | 'date' | 'boolean'; description?: string }>,
    },
    {
      id: 'financial',
      name: 'Financial Data',
      fields: [
        { name: 'transaction_date', type: 'date', description: 'Transaction date' },
        { name: 'amount', type: 'number', description: 'Transaction amount' },
        { name: 'category', type: 'string', description: 'Expense/Revenue category' },
        { name: 'payment_method', type: 'string', description: 'Payment method used' },
        { name: 'customer_id', type: 'string', description: 'Customer identifier' },
        { name: 'profit_margin', type: 'number', description: 'Profit margin percentage' },
      ] as Array<{ name: string; type: 'string' | 'number' | 'date' | 'boolean'; description?: string }>,
    },
    {
      id: 'customer_satisfaction',
      name: 'Customer Satisfaction',
      fields: [
        { name: 'survey_date', type: 'date', description: 'Survey completion date' },
        { name: 'overall_rating', type: 'number', description: 'Overall satisfaction rating' },
        { name: 'service_quality', type: 'number', description: 'Service quality rating' },
        { name: 'response_time', type: 'number', description: 'Response time rating' },
        { name: 'customer_segment', type: 'string', description: 'Customer segment' },
        { name: 'nps_score', type: 'number', description: 'Net Promoter Score' },
      ] as Array<{ name: string; type: 'string' | 'number' | 'date' | 'boolean'; description?: string }>,
    }
  ];

  const handleReportSave = async (report: ReportTemplate) => {
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Report saved:', report);
      // Here you would typically save to backend or local storage
    } finally {
      setIsSaving(false);
    }
  };

  const handleReportPreview = async (report: ReportTemplate): Promise<void> => {
    setIsPreviewing(true);
    try {
      console.log('Report preview:', report);
      // Here you would generate a preview of the report
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleReportExport = async (report: ReportTemplate, format: 'pdf' | 'png' | 'json') => {
    setIsExporting(true);
    try {
      console.log('Report export:', { report, format });
      // Here you would handle the export functionality
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with back button - full width edge-to-edge */}
      <div className="border-b bg-card">
        <div className="flex items-center gap-4 p-4">
          <AnalyticsBackButton />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Report Builder</h1>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                Professional Reports
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {fromIndustry ? 'Custom report builder for ${fromIndustry.toUpperCase()} Industry' : 'Create comprehensive business reports with drag-and-drop components and templates'}
            </p>
          </div>
          
          {/* Builder Status */}
          <div className="flex items-center gap-2">
            {isPreviewing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20">
                <FileText className="h-3 w-3 animate-pulse" />
                Generating Preview...
              </div>
            )}
            {isSaving && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
                <Upload className="h-3 w-3 animate-pulse" />
                Saving Report...
              </div>
            )}
            {isExporting && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full border border-orange-500/20">
                <Download className="h-3 w-3 animate-pulse" />
                Exporting...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Features Info Bar */}
      <div className="border-b bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-orange-600">
              <FileText className="h-3 w-3" />
              Professional Templates
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <Brain className="h-3 w-3" />
              AI-Generated Insights
            </div>
            <div className="flex items-center gap-2 text-pink-600">
              <Download className="h-3 w-3" />
              Multi-Format Export
            </div>
          </div>
          <div className="text-muted-foreground">
            {availableDataSources.length} data sources • Executive, operational & financial templates
          </div>
        </div>
      </div>

      {/* Main Report Builder Area - Full screen, edge-to-edge */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <ReportBuilder
            availableDataSources={availableDataSources}
            onSave={handleReportSave}
            onPreview={handleReportPreview}
            onExport={handleReportExport}
            className="h-full border-0 bg-background"
          />
        </div>
      </div>
    </div>
  );
}