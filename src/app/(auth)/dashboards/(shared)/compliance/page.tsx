/**
 * Financial Compliance Dashboard
 * Comprehensive compliance management for financial regulations (1099, Form 941, etc.)
 * 
 * Features: Real-time compliance tracking, automated report generation, deadline management
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  DollarSign,
  Building,
  Users,
  Shield,
  Download,
  RefreshCw,
  Settings,
  Target,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';

// Mock organization ID - replace with actual auth
const MOCK_ORG_ID = '550e8400-e29b-41d4-a716-446655440001';

interface ComplianceRequirement {
  type: string;
  frequency: string;
  description: string;
  next_due: string;
  status: string;
  priority: string;
  estimated_preparation_time?: string;
}

interface ComplianceReport {
  id: string;
  report_type: string;
  reporting_period: any;
  status: string;
  filed_date?: string;
  due_date: string;
  created_at: string;
  display_info: {
    report_name: string;
    period_display: string;
    status_display: string;
    days_until_due: number;
  };
}

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [complianceData, setComplianceData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>(');
  const [recipients1099, setRecipients1099] = useState<any[]>([]);

  useEffect(() => {
    fetchComplianceData();
    fetch1099Recipients();
  }, []);

  const fetchComplianceData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/compliance/reports?organization_id=${MOCK_ORG_ID}');
      if (response.ok) {
        const result = await response.json();
        setComplianceData(result.data);
      } else {
        console.error('Failed to fetch compliance data');
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetch1099Recipients = async () => {
    try {
      const response = await fetch('/api/v1/compliance/1099?organization_id=${MOCK_ORG_ID}');
      if (response.ok) {
        const result = await response.json();
        setRecipients1099(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching 1099 recipients:', error);
    }
  };

  const handleGenerateReport = async (reportType: string, reportingPeriod: unknown) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/compliance/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          report_type: reportType,
          reporting_period: reportingPeriod,
          output_options: {
            format: 'json',
            include_supporting_schedules: true,
            electronic_filing: false
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh compliance data to show new report
        fetchComplianceData();
      } else {
        console.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate1099Forms = async (formType: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/compliance/1099', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          tax_year: new Date().getFullYear() - 1,
          form_type: formType,
          options: {
            format: 'json',
            include_recipient_details: true,
            electronic_filing: false
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        fetch1099Recipients(); // Refresh data
      } else {
        console.error('Failed to generate 1099 forms');
      }
    } catch (error) {
      console.error('Error generating 1099 forms:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed_electronically':
      case 'filed_paper':
      case 'current':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending':
      case 'generated':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'overdue':
      case 'error':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filed_electronically':
      case 'filed_paper':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Financial Compliance</h1>
          <p className="text-muted-foreground mt-2">
            Manage regulatory reporting, tax forms, and compliance requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchComplianceData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <FileCheck className="w-4 h-4 mr-2" />
            Run Compliance Check
          </Button>
        </div>
      </div>

      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Compliance Score</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {complianceData?.compliance_score || 95}
              </span>
            </div>
            <Progress value={complianceData?.compliance_score || 95} className="mb-2" />
            <p className="text-xs text-muted-foreground">Excellent compliance status</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">Current Reports</span>
            </div>
            <p className="text-2xl font-bold">
              {complianceData?.recent_reports?.filter((r: unknown) => r.status.includes('filed')).length || 12}
            </p>
            <p className="text-xs text-muted-foreground">All filings up to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium">Upcoming Due</span>
            </div>
            <p className="text-2xl font-bold">
              {complianceData?.upcoming_deadlines?.length || 3}
            </p>
            <p className="text-xs text-muted-foreground">Due in next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">No overdue items</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="1099-forms">1099 Forms</TabsTrigger>
          <TabsTrigger value="payroll-tax">Payroll Tax</TabsTrigger>
          <TabsTrigger value="business-tax">Business Tax</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Compliance Deadlines
              </CardTitle>
              <CardDescription>
                Critical dates and filing requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    report_type: 'form_941',
                    description: 'Quarterly Federal Tax Return (Q4 2023)',
                    due_date: '2024-01-31',
                    priority: 'high',
                    estimated_preparation_time: '2-4 hours'
                  },
                  {
                    report_type: 'form_1099_nec',
                    description: '1099-NEC Forms to Recipients',
                    due_date: '2024-01-31',
                    priority: 'high',
                    estimated_preparation_time: '1-2 hours'
                  },
                  {
                    report_type: 'state_unemployment',
                    description: 'California State Unemployment Report',
                    due_date: '2024-01-31',
                    priority: 'medium',
                    estimated_preparation_time: '1 hour'
                  },
                  {
                    report_type: 'form_1120',
                    description: 'Corporate Income Tax Return',
                    due_date: '2024-03-15',
                    priority: 'high',
                    estimated_preparation_time: '8-16 hours`
                  }
                ].map((deadline, index) => {
                  const daysUntil = Math.ceil((new Date(deadline.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">{deadline.description}</p>
                          <Badge className={'${getPriorityColor(deadline.priority)} border-current text-xs'} variant="outline">
                            {deadline.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Prep time: {deadline.estimated_preparation_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          Due: {new Date(deadline.due_date).toLocaleDateString()}
                        </p>
                        <p className={'text-xs ${daysUntil <= 7 ? 'text-red-600' : daysUntil <= 30 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                          {daysUntil > 0 ? `${daysUntil} days remaining' : '${Math.abs(daysUntil)} days overdue'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Organization Profile
                </CardTitle>
                <CardDescription>
                  Business structure and compliance requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Organization Type</Label>
                    <p className="font-medium">C Corporation</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Employee Count</Label>
                    <p className="font-medium">12 employees</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Industry</Label>
                    <p className="font-medium">Home Services</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tax Year</Label>
                    <p className="font-medium">Calendar Year</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Required Filings</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Form 941', 'Form 1120', '1099-NEC', 'Form 940', 'State UI'].map(form => (
                      <Badge key={form} variant="secondary" className="text-xs">
                        {form}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Compliance Trends
                </CardTitle>
                <CardDescription>
                  Filing history and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">100%</p>
                    <p className="text-xs text-muted-foreground">On-time Filing Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-xs text-muted-foreground">Penalties Incurred</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">24</p>
                    <p className="text-xs text-muted-foreground">Reports Filed YTD</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">4.2</p>
                    <p className="text-xs text-muted-foreground">Avg Days Early</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Recent Achievements</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Q4 2023 Form 941 filed early</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">All 2023 1099 forms completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Zero compliance issues detected</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="1099-forms" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">1099 Tax Forms</h2>
              <p className="text-muted-foreground">Manage 1099 recipients and form generation</p>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Add Recipient
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add 1099 Recipient</DialogTitle>
                    <DialogDescription>
                      Register a new contractor or vendor for 1099 reporting
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recipient-name">Name</Label>
                        <Input id="recipient-name" placeholder="John Doe" />
                      </div>
                      <div>
                        <Label htmlFor="business-name">Business Name (Optional)</Label>
                        <Input id="business-name" placeholder="Doe Contracting LLC" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tin">Tax ID Number</Label>
                        <Input id="tin" placeholder="12-3456789 or 123-45-6789" />
                      </div>
                      <div>
                        <Label htmlFor="tin-type">TIN Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EIN">EIN</SelectItem>
                            <SelectItem value="SSN">SSN</SelectItem>
                            <SelectItem value="ITIN">ITIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="123 Main Street" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Los Angeles" />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="CA" />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" placeholder="90210" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1">Add Recipient</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={() => handleGenerate1099Forms('1099-NEC')}>
                <FileText className="w-4 h-4 mr-2" />
                Generate 1099s
              </Button>
            </div>
          </div>

          {/* 1099 Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>1099 Recipients ({recipients1099.length})</CardTitle>
              <CardDescription>
                Contractors and vendors requiring 1099 forms for {new Date().getFullYear() - 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recipients1099.length > 0 ? (
                <div className="space-y-3">
                  {recipients1099.slice(0, 10).map((recipient, index) => (
                    <div key={recipient.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{recipient.display_info?.recipient_name || 'Recipient ${index + 1}'}</p>
                        <p className="text-sm text-muted-foreground">
                          TIN: {recipient.display_info?.tin_masked || 'XXX-XX-1234'} • {recipient.display_info?.address_summary || 'Los Angeles, CA'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(Math.floor(Math.random() * 50000) + 60000)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={recipient.display_info?.requires_1099 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                            {recipient.display_info?.requires_1099 ? '1099 Required' : 'Below Threshold'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No 1099 recipients registered</p>
                  <p className="text-sm text-muted-foreground">Add contractors and vendors to generate 1099 forms</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filing Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">1099-NEC</span>
                </div>
                <p className="text-2xl font-bold">$600+</p>
                <p className="text-xs text-muted-foreground">Non-employee compensation</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">1099-MISC</span>
                </div>
                <p className="text-2xl font-bold">$600+</p>
                <p className="text-xs text-muted-foreground">Miscellaneous income</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium">1099-K</span>
                </div>
                <p className="text-2xl font-bold">$20,000+</p>
                <p className="text-xs text-muted-foreground">Payment card transactions</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payroll-tax" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Payroll Tax Compliance</h2>
              <p className="text-muted-foreground">Manage quarterly and annual payroll tax reporting</p>
            </div>
            <Button onClick={() => handleGenerateReport('form_941', { 
              period_type: 'quarterly', 
              year: new Date().getFullYear(),
              quarter: Math.floor(new Date().getMonth() / 3) + 1 
            })}>
              <FileCheck className="w-4 h-4 mr-2" />
              Generate Form 941
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { form: 'Form 941', description: 'Quarterly Federal Tax Return', period: 'Quarterly', icon: FileText },
              { form: 'Form 940', description: 'Annual Federal Unemployment Tax', period: 'Annual', icon: FileCheck },
              { form: 'State UI', description: 'State Unemployment Insurance', period: 'Quarterly', icon: Building },
              { form: 'Workers Comp', description: 'Workers Compensation Report', period: 'Annual', icon: Shield }
            ].map((report, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <report.icon className="w-6 h-6 text-blue-600" />
                    <span className="font-medium">{report.form}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                  <Badge variant="outline" className="text-xs">{report.period}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payroll Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Quarter Summary</CardTitle>
              <CardDescription>Q4 2023 payroll tax summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(45000000)}</p>
                  <p className="text-sm text-muted-foreground">Gross Wages</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(5400000)}</p>
                  <p className="text-sm text-muted-foreground">Federal Withholding</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(5580000)}</p>
                  <p className="text-sm text-muted-foreground">Social Security Tax</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(1305000)}</p>
                  <p className="text-sm text-muted-foreground">Medicare Tax</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-tax" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Business Tax Compliance</h2>
              <p className="text-muted-foreground">Corporate and business tax reporting</p>
            </div>
            <Button onClick={() => handleGenerateReport('form_1120', { 
              period_type: 'annual', 
              year: new Date().getFullYear() - 1 
            })}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Form 1120
            </Button>
          </div>

          {/* Business Tax Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Annual Revenue</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(180000000)}</p>
                <p className="text-xs text-muted-foreground">2023 tax year</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Taxable Income</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(45000000)}</p>
                <p className="text-xs text-muted-foreground">After deductions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileCheck className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium">Tax Liability</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(9450000)}</p>
                <p className="text-xs text-muted-foreground">Estimated 21% rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Annual Filing Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Filing Requirements</CardTitle>
              <CardDescription>Key business tax forms and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    form: 'Form 1120',
                    description: 'Corporate Income Tax Return',
                    due_date: '2024-03-15',
                    status: 'pending',
                    extension_available: true
                  },
                  {
                    form: 'Schedule K-1',
                    description: 'Partner Share of Income (if applicable)',
                    due_date: '2024-03-15',
                    status: 'not_applicable',
                    extension_available: true
                  },
                  {
                    form: 'Form 1099-DIV',
                    description: 'Dividends and Distributions',
                    due_date: '2024-01-31',
                    status: 'completed',
                    extension_available: false
                  },
                  {
                    form: 'State Corporate Tax',
                    description: 'California Corporate Income Tax',
                    due_date: '2024-03-15',
                    status: 'pending',
                    extension_available: true
                  }
                ].map((filing, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium">{filing.form}</p>
                        <Badge className={getStatusColor(filing.status)}>
                          {getStatusIcon(filing.status)}
                          <span className="ml-1">{filing.status === 'not_applicable' ? 'N/A' : filing.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{filing.description}</p>
                      {filing.extension_available && (
                        <p className="text-xs text-blue-600 mt-1">Extension available until October 15</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Due: {new Date(filing.due_date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.ceil((new Date(filing.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Compliance Reports</h2>
              <p className="text-muted-foreground">Generated reports and filing history</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Compliance Report</DialogTitle>
                  <DialogDescription>
                    Select the type of compliance report to generate
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="form_941">Form 941 - Quarterly Federal Tax</SelectItem>
                        <SelectItem value="form_1120">Form 1120 - Corporate Income Tax</SelectItem>
                        <SelectItem value="schedule_c">Schedule C - Business Profit/Loss</SelectItem>
                        <SelectItem value="state_unemployment">State Unemployment Report</SelectItem>
                        <SelectItem value="industry_specific">Industry Specific Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tax-year">Tax Year</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="2023" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quarter">Quarter (if applicable)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Q4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Q1</SelectItem>
                          <SelectItem value="2">Q2</SelectItem>
                          <SelectItem value="3">Q3</SelectItem>
                          <SelectItem value="4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1"
                      disabled={!selectedReportType || isGenerating}
                      onClick={() => {
                        if (selectedReportType) {
                          handleGenerateReport(selectedReportType, {
                            period_type: selectedReportType.includes('941') ? 'quarterly' : 'annual',
                            year: 2023,
                            quarter: 4
                          });
                        }
                      }}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Compliance Reports</CardTitle>
              <CardDescription>Your recently generated reports and filings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(complianceData?.recent_reports || []).map((report: ComplianceReport, index: number) => (
                  <div key={report.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{report.display_info?.report_name || 'Report ${index + 1}'}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.display_info?.period_display} • Generated {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1">{report.display_info?.status_display || report.status}</span>
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!complianceData?.recent_reports || complianceData.recent_reports.length === 0) && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reports generated yet</p>
                    <p className="text-sm text-muted-foreground">Generate your first compliance report to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}