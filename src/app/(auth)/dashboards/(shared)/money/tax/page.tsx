/**
 * Tax Management Dashboard
 * Comprehensive tax calculation, reporting, and compliance management
 * 
 * Features: Real-time tax calculation, multi-jurisdictional reporting, compliance tracking
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calculator,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Building,
  Clock,
  Download,
  Refresh,
  Settings,
  Info,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield
} from 'lucide-react';

// Mock organization ID - replace with actual auth
const MOCK_ORG_ID = '550e8400-e29b-41d4-a716-446655440001';

interface TaxCalculationRequest {
  transaction: {
    type: string;
    line_items: Array<{
      id: string;
      description: string;
      amount_cents: number;
      quantity: number;
      product_type: string;
      exempt: boolean;
    }>;
    customer_info: {
      type: string;
      address: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
      tax_exempt: boolean;
    };
    business_address: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  options?: {
    provider: string;
    include_breakdown: boolean;
  };
}

interface TaxCalculationResult {
  calculation_id?: string;
  subtotal_cents: number;
  tax_amount_cents: number;
  total_cents: number;
  effective_tax_rate: number;
  tax_breakdown?: Array<{
    name: string;
    rate: number;
    amount_cents: number;
    jurisdiction_type: string;
  }>;
  jurisdiction: any;
  display_info: {
    subtotal_formatted: string;
    tax_amount_formatted: string;
    total_formatted: string;
    tax_summary: Array<{
      name: string;
      rate: string;
      amount: string;
    }>;
  };
}

export default function TaxManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [calculationResult, setCalculationResult] = useState<TaxCalculationResult | null>(null);
  const [taxReports, setTaxReports] = useState<any[]>([]);

  // Tax calculation form state
  const [calculationForm, setCalculationForm] = useState<TaxCalculationRequest>({
    transaction: {
      type: 'invoice',
      line_items: [
        {
          id: 'item_1',
          description: 'Service charge',
          amount_cents: 10000,
          quantity: 1,
          product_type: 'service',
          exempt: false
        }
      ],
      customer_info: {
        type: 'business',
        address: {
          street: '123 Main Street',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90210',
          country: 'US'
        },
        tax_exempt: false
      },
      business_address: {
        street: '456 Business Ave',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90211',
        country: 'US'
      }
    },
    options: {
      provider: 'internal',
      include_breakdown: true
    }
  });

  // Mock tax overview data
  const taxOverview = {
    current_quarter: {
      total_tax_collected_cents: 156789,
      total_taxable_sales_cents: 1967890,
      effective_tax_rate: 7.98,
      transactions_count: 2847,
      next_filing_due: '2024-04-30',
      compliance_status: 'current'
    },
    jurisdictions: [
      {
        name: 'California State',
        type: 'state',
        rate: 7.25,
        collected_cents: 98765,
        due_date: '2024-04-30'
      },
      {
        name: 'Los Angeles County',
        type: 'county',
        rate: 2.75,
        collected_cents: 37654,
        due_date: '2024-04-30'
      },
      {
        name: 'City of Los Angeles',
        type: 'city',
        rate: 1.0,
        collected_cents: 20370,
        due_date: '2024-03-20'
      }
    ],
    recent_calculations: [
      {
        id: 'calc_001',
        date: '2024-01-15T10:30:00Z',
        type: 'invoice',
        subtotal_cents: 25000,
        tax_cents: 2000,
        jurisdiction: 'Los Angeles, CA'
      },
      {
        id: 'calc_002',
        date: '2024-01-15T14:22:00Z',
        type: 'payment',
        subtotal_cents: 15000,
        tax_cents: 1200,
        jurisdiction: 'Los Angeles, CA'
      }
    ]
  };

  const handleCalculateTax = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/v1/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          ...calculationForm
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCalculationResult(result.data);
      } else {
        console.error('Failed to calculate tax');
      }
    } catch (error) {
      console.error('Error calculating tax:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGenerateReport = async (reportType: string, dateRange: { start_date: string; end_date: string }) => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch('/api/v1/tax/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          report_type: reportType,
          date_range: dateRange,
          format: 'json'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTaxReports(prev => [result.data, ...prev]);
      } else {
        console.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Tax Management</h1>
          <p className="text-muted-foreground mt-2">
            Calculate taxes, generate reports, and manage compliance across all jurisdictions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Tax Settings
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Calculator className="w-4 h-4 mr-2" />
                Quick Calculate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tax Calculator</DialogTitle>
                <DialogDescription>
                  Calculate taxes for a transaction in real-time
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transaction-type">Transaction Type</Label>
                    <Select value={calculationForm.transaction.type} onValueChange={(value) => 
                      setCalculationForm(prev => ({
                        ...prev,
                        transaction: { ...prev.transaction, type: value }
                      }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="estimate">Estimate</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="provider">Tax Provider</Label>
                    <Select value={calculationForm.options?.provider} onValueChange={(value) => 
                      setCalculationForm(prev => ({
                        ...prev,
                        options: { ...prev.options, provider: value }
                      }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal Calculator</SelectItem>
                        <SelectItem value="taxjar">TaxJar</SelectItem>
                        <SelectItem value="avalara">Avalara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Line Item Details</Label>
                  <div className="space-y-2 mt-2">
                    <Input
                      placeholder="Item description"
                      value={calculationForm.transaction.line_items[0]?.description || ''}
                      onChange={(e) => setCalculationForm(prev => ({
                        ...prev,
                        transaction: {
                          ...prev.transaction,
                          line_items: [
                            { ...prev.transaction.line_items[0], description: e.target.value }
                          ]
                        }
                      }))}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Amount (in cents)"
                        value={calculationForm.transaction.line_items[0]?.amount_cents || 0}
                        onChange={(e) => setCalculationForm(prev => ({
                          ...prev,
                          transaction: {
                            ...prev.transaction,
                            line_items: [
                              { ...prev.transaction.line_items[0], amount_cents: parseInt(e.target.value) || 0 }
                            ]
                          }
                        }))}
                      />
                      <Select value={calculationForm.transaction.line_items[0]?.product_type} onValueChange={(value) => 
                        setCalculationForm(prev => ({
                          ...prev,
                          transaction: {
                            ...prev.transaction,
                            line_items: [
                              { ...prev.transaction.line_items[0], product_type: value }
                            ]
                          }
                        }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="digital">Digital</SelectItem>
                          <SelectItem value="shipping">Shipping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Location</Label>
                    <div className="space-y-2 mt-2">
                      <Input 
                        placeholder="City"
                        value={calculationForm.transaction.customer_info.address.city}
                        onChange={(e) => setCalculationForm(prev => ({
                          ...prev,
                          transaction: {
                            ...prev.transaction,
                            customer_info: {
                              ...prev.transaction.customer_info,
                              address: { ...prev.transaction.customer_info.address, city: e.target.value }
                            }
                          }
                        }))}
                      />
                      <Input 
                        placeholder="State"
                        value={calculationForm.transaction.customer_info.address.state}
                        onChange={(e) => setCalculationForm(prev => ({
                          ...prev,
                          transaction: {
                            ...prev.transaction,
                            customer_info: {
                              ...prev.transaction.customer_info,
                              address: { ...prev.transaction.customer_info.address, state: e.target.value }
                            }
                          }
                        }))}
                      />
                      <Input 
                        placeholder="ZIP Code"
                        value={calculationForm.transaction.customer_info.address.postal_code}
                        onChange={(e) => setCalculationForm(prev => ({
                          ...prev,
                          transaction: {
                            ...prev.transaction,
                            customer_info: {
                              ...prev.transaction.customer_info,
                              address: { ...prev.transaction.customer_info.address, postal_code: e.target.value }
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Business Location</Label>
                    <div className="space-y-2 mt-2">
                      <Input 
                        placeholder="City"
                        value={calculationForm.transaction.business_address.city}
                        onChange={(e) => setCalculationForm(prev => ({
                          ...prev,
                          transaction: {
                            ...prev.transaction,
                            business_address: { ...prev.transaction.business_address, city: e.target.value }
                          }
                        }))}
                      />
                      <Input 
                        placeholder="State"
                        value={calculationForm.transaction.business_address.state}
                        onChange={(e) => setCalculationForm(prev => ({
                          ...prev,
                          transaction: {
                            ...prev.transaction,
                            business_address: { ...prev.transaction.business_address, state: e.target.value }
                          }
                        }))}
                      />
                      <Input 
                        placeholder="ZIP Code"
                        value={calculationForm.transaction.business_address.postal_code}
                        onChange={(e) => setCalculationForm(prev => ({
                          ...prev,
                          transaction: {
                            ...prev.transaction,
                            business_address: { ...prev.transaction.business_address, postal_code: e.target.value }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCalculateTax}
                    disabled={isCalculating}
                    className="flex-1"
                  >
                    {isCalculating ? (
                      <>
                        <Refresh className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Tax
                      </>
                    )}
                  </Button>
                </div>

                {calculationResult && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Calculation Result</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{calculationResult.display_info.subtotal_formatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({calculationResult.effective_tax_rate.toFixed(2)}%):</span>
                        <span>{calculationResult.display_info.tax_amount_formatted}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total:</span>
                        <span>{calculationResult.display_info.total_formatted}</span>
                      </div>
                    </div>
                    
                    {calculationResult.tax_breakdown && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium mb-1">Tax Breakdown:</h5>
                        {calculationResult.tax_breakdown.map((breakdown, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span>{breakdown.name} ({breakdown.rate}%):</span>
                            <span>{formatCurrency(breakdown.amount_cents)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Tax Collected (Q1)</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(taxOverview.current_quarter.total_tax_collected_cents)}
                </p>
                <p className="text-xs text-muted-foreground">
                  From {taxOverview.current_quarter.transactions_count.toLocaleString()} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Effective Tax Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {taxOverview.current_quarter.effective_tax_rate.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  On {formatCurrency(taxOverview.current_quarter.total_taxable_sales_cents)} sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">Next Filing Due</span>
                </div>
                <p className="text-2xl font-bold">
                  {new Date(taxOverview.current_quarter.next_filing_due).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  California quarterly filing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Compliance Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    Current
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  All filings up to date
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Jurisdictions and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Active Tax Jurisdictions
                </CardTitle>
                <CardDescription>
                  Current tax obligations by jurisdiction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {taxOverview.jurisdictions.map((jurisdiction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{jurisdiction.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {jurisdiction.type} • {jurisdiction.rate}% rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(jurisdiction.collected_cents)}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(jurisdiction.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Tax Calculations
                </CardTitle>
                <CardDescription>
                  Latest tax calculations and transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {taxOverview.recent_calculations.map((calc) => (
                  <div key={calc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{calc.type} #{calc.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(calc.date).toLocaleDateString()} • {calc.jurisdiction}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(calc.subtotal_cents + calc.tax_cents)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tax: {formatCurrency(calc.tax_cents)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Tax Reports</h2>
              <p className="text-muted-foreground">Generate and view tax compliance reports</p>
            </div>
            <Button onClick={() => handleGenerateReport('sales_tax_summary', {
              start_date: '2024-01-01',
              end_date: '2024-03-31'
            })}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {/* Quick Report Generation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'sales_tax_summary', name: 'Sales Tax Summary', icon: DollarSign, color: 'text-green-600' },
              { type: 'detailed_transactions', name: 'Transaction Details', icon: FileText, color: 'text-blue-600' },
              { type: 'exemption_report', name: 'Exemption Report', icon: Shield, color: 'text-purple-600' },
              { type: 'jurisdiction_breakdown', name: 'Jurisdiction Analysis', icon: MapPin, color: 'text-orange-600' }
            ].map((reportType) => (
              <Card key={reportType.type} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleGenerateReport(reportType.type, {
                      start_date: '2024-01-01',
                      end_date: '2024-03-31'
                    })}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <reportType.icon className={`w-6 h-6 ${reportType.color}'} />
                    <span className="font-medium">{reportType.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Generate current quarter report
                  </p>
                  <Button size="sm" className="w-full">
                    {isGeneratingReport ? (
                      <Refresh className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Generated Reports List */}
          {taxReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>Your recent tax reports and filings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {report.summary?.reporting_period ? 
                            'Tax Report - ${report.summary.reporting_period.start_date} to ${report.summary.reporting_period.end_date}' : 
                            'Tax Report'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Generated on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="jurisdictions" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Tax Jurisdictions</h2>
            <p className="text-muted-foreground">Manage tax rates and filing requirements by jurisdiction</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {taxOverview.jurisdictions.map((jurisdiction, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{jurisdiction.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {jurisdiction.type}
                    </Badge>
                  </div>
                  <CardDescription>
                    Tax rate: {jurisdiction.rate}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(jurisdiction.collected_cents)}
                      </p>
                      <p className="text-xs text-muted-foreground">Collected Q1</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-orange-600">
                        {new Date(jurisdiction.due_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Next Due</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Filing Frequency:</span>
                      <span>Quarterly</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                        Current
                      </Badge>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Tax Compliance</h2>
            <p className="text-muted-foreground">Track filing deadlines and compliance requirements</p>
          </div>

          {/* Compliance Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Current Filings</span>
                </div>
                <p className="text-2xl font-bold">12/12</p>
                <p className="text-xs text-muted-foreground">All filings up to date</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">Upcoming Due</span>
                </div>
                <p className="text-2xl font-bold">3</p>
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
                <p className="text-xs text-muted-foreground">No overdue filings</p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Tax Deadlines
              </CardTitle>
              <CardDescription>
                Important dates and filing requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    jurisdiction: 'City of Los Angeles',
                    type: 'Monthly Sales Tax',
                    due_date: '2024-03-20',
                    amount_cents: 20370,
                    status: 'pending'
                  },
                  {
                    jurisdiction: 'California State',
                    type: 'Quarterly Sales Tax',
                    due_date: '2024-04-30',
                    amount_cents: 98765,
                    status: 'pending'
                  },
                  {
                    jurisdiction: 'Los Angeles County',
                    type: 'Quarterly Sales Tax',
                    due_date: '2024-04-30',
                    amount_cents: 37654,
                    status: 'pending'
                  }
                ].map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{deadline.jurisdiction}</p>
                      <p className="text-sm text-muted-foreground">{deadline.type}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        Due: {new Date(deadline.due_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.ceil((new Date(deadline.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(deadline.amount_cents)}</p>
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs">
                        Pending
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Filing Assistant
                </CardTitle>
                <CardDescription>
                  Automated filing preparation and submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Prepare Next Filing
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Audit Protection
                </CardTitle>
                <CardDescription>
                  Monitor compliance and maintain audit trails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Info className="w-4 h-4 mr-2" />
                  View Audit Trail
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}