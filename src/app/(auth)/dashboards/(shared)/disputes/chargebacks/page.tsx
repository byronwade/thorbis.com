/**
 * Chargeback and Dispute Management Dashboard
 * Comprehensive dispute handling with evidence collection and automated responses
 * 
 * Features: Real-time dispute monitoring, evidence management, win rate optimization
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield,
  AlertTriangle,
  FileText,
  Upload,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Settings,
  AlertCircle,
  Calendar,
  Users,
  CreditCard,
  Building2,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  MessageSquare,
  Camera,
  FileImage,
  Mail
} from 'lucide-react';

// Mock organization ID - replace with actual auth
const MOCK_ORG_ID = '550e8400-e29b-41d4-a716-446655440001';

interface Dispute {
  id: string;
  transaction_id: string;
  stripe_dispute_id: string;
  dispute_type: string;
  status: string;
  reason_code: string;
  dispute_amount_cents: number;
  currency: string;
  disputed_at: string;
  due_by: string;
  evidence_due_by: string;
  customer_info: any;
  transaction_details: any;
  display_info: {
    dispute_type_display: string;
    status_display: string;
    reason_display: string;
    amount_display: string;
    days_to_respond: number;
    urgency_level: string;
  };
  dispute_summary: {
    total_evidence_items: number;
    evidence_completeness: number;
    win_probability: number;
    recommended_action: string;
  };
}

interface EvidenceItem {
  type: string;
  content?: string;
  document_url?: string;
  description?: string;
  timestamp: string;
  direction?: string;
}

export default function DisputeManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // Evidence form state
  const [evidenceForm, setEvidenceForm] = useState({
    customer_communication: [] as EvidenceItem[],
    service_documentation: [] as EvidenceItem[],
    shipping_documentation: [] as EvidenceItem[],
    refund_policy: {
      policy_text: ',
      customer_acknowledgment: false,
      policy_url: '
    },
    narrative_statement: '
  });

  // Prevention rules state
  const [preventionRules, setPreventionRules] = useState([
    {
      rule_type: 'velocity_check',
      rule_config: {
        threshold_value: 5,
        time_window_minutes: 60,
        action: 'flag',
        notification_channels: ['email']
      }
    }
  ]);

  const verticalIcons = {
    hs: Building2,
    auto: Car,
    rest: UtensilsCrossed,
    ret: ShoppingBag
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      const params = new URLSearchParams({
        organization_id: MOCK_ORG_ID
      });

      const response = await fetch('/api/v1/disputes/chargebacks?${params}');
      if (response.ok) {
        const result = await response.json();
        setDisputes(result.data);
      }
    } catch (error) {
      console.error('Failed to load disputes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async (disputeId: string, responseType: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/disputes/chargebacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          dispute_id: disputeId,
          response_type: responseType,
          evidence_bundle: evidenceForm,
          narrative_statement: evidenceForm.narrative_statement,
          submit_automatically: true
        })
      });

      if (response.ok) {
        await loadDisputes();
        setSelectedDispute(null);
      } else {
        console.error('Failed to submit dispute response');
      }
    } catch (error) {
      console.error('Error submitting dispute response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEvidence = (category: string, item: EvidenceItem) => {
    setEvidenceForm(prev => ({
      ...prev,
      [category]: [...(prev[category as keyof typeof prev] as EvidenceItem[]), item]
    }));
  };

  const formatCurrency = (cents: number, currency: string = 'USD') => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      needs_response: 'bg-red-100 text-red-800 hover:bg-red-200',
      under_review: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      won: 'bg-green-100 text-green-800 hover:bg-green-200',
      lost: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      accepted: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[urgency] || 'text-gray-600';
  };

  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600';
    if (probability >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Mock data for demonstration
  const disputeSummary = {
    total_disputes: disputes.length,
    total_amount_at_risk_cents: disputes.reduce((sum, d) => sum + d.dispute_amount_cents, 0),
    disputes_won: disputes.filter(d => d.status === 'won').length,
    disputes_lost: disputes.filter(d => d.status === 'lost').length,
    average_win_rate: disputes.length > 0 ? 
      (disputes.filter(d => d.status === 'won').length / disputes.filter(d => ['won', 'lost'].includes(d.status)).length) * 100 : 0,
    urgent_disputes: disputes.filter(d => d.display_info.urgency_level === 'high').length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dispute Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and respond to payment disputes and chargebacks across all verticals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Prevention Settings
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Shield className="w-4 h-4 mr-2" />
                Submit Evidence
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Dispute Evidence</DialogTitle>
                <DialogDescription>
                  Collect and submit evidence to challenge a payment dispute
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="dispute-select">Select Dispute</Label>
                  <Select onValueChange={(value) => {
                    const dispute = disputes.find(d => d.id === value);
                    setSelectedDispute(dispute || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose dispute to respond to" />
                    </SelectTrigger>
                    <SelectContent>
                      {disputes.filter(d => d.status === 'needs_response').map((dispute) => (
                        <SelectItem key={dispute.id} value={dispute.id}>
                          {dispute.display_info.reason_display} - {dispute.display_info.amount_display}
                          ({dispute.display_info.days_to_respond} days left)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDispute && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Dispute Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Amount: {selectedDispute.display_info.amount_display}</div>
                        <div>Reason: {selectedDispute.display_info.reason_display}</div>
                        <div>Due: {selectedDispute.display_info.days_to_respond} days</div>
                        <div>Win Probability: <span className={getWinProbabilityColor(selectedDispute.dispute_summary.win_probability)}>
                          {selectedDispute.dispute_summary.win_probability}%
                        </span></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Customer Communication Evidence</h4>
                      <div className="space-y-2">
                        {evidenceForm.customer_communication.map((item, index) => (
                          <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                            <div>
                              <div className="font-medium capitalize">{item.type}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {item.content?.substring(0, 100)}...
                              </div>
                            </div>
                            <Badge variant="outline">{item.direction}</Badge>
                          </div>
                        ))}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Add Communication Evidence
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Communication Evidence</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Communication Type</Label>
                                <Select defaultValue="email">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="sms">SMS</SelectItem>
                                    <SelectItem value="call_log">Call Log</SelectItem>
                                    <SelectItem value="chat_transcript">Chat Transcript</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Content</Label>
                                <Textarea placeholder="Paste communication content here..." />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Direction</Label>
                                  <Select defaultValue="outbound">
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="inbound">From Customer</SelectItem>
                                      <SelectItem value="outbound">To Customer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Timestamp</Label>
                                  <Input type="datetime-local" />
                                </div>
                              </div>
                              <Button className="w-full" onClick={() => {
                                handleAddEvidence('customer_communication', {
                                  type: 'email',
                                  content: 'Sample communication content...',
                                  direction: 'outbound',
                                  timestamp: new Date().toISOString()
                                });
                              }}>
                                Add Evidence
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Service Documentation</h4>
                      <div className="space-y-2">
                        {evidenceForm.service_documentation.map((item, index) => (
                          <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileImage className="w-5 h-5 text-gray-500" />
                              <div>
                                <div className="font-medium capitalize">{item.type}</div>
                                <div className="text-sm text-muted-foreground">{item.description}</div>
                              </div>
                            </div>
                            <Badge variant="outline">Uploaded</Badge>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" className="w-full" onClick={() => {
                          handleAddEvidence('service_documentation', {
                            type: 'work_order',
                            document_url: 'https://example.com/work-order.pdf',
                            description: 'Completed work order with customer signature',
                            timestamp: new Date().toISOString()
                          });
                        }}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Service Documents
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Narrative Statement</h4>
                      <Textarea
                        placeholder="Provide a detailed explanation of the transaction and why the dispute should be resolved in your favor..."
                        value={evidenceForm.narrative_statement}
                        onChange={(e) => setEvidenceForm(prev => ({ 
                          ...prev, 
                          narrative_statement: e.target.value 
                        }))}
                        rows={6}
                      />
                      <div className="text-sm text-muted-foreground">
                        {evidenceForm.narrative_statement.length}/5000 characters
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => handleSubmitResponse(selectedDispute.id, 'challenge')}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Challenge
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleSubmitResponse(selectedDispute.id, 'accept')}
                        disabled={isSubmitting}
                      >
                        Accept Dispute
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="disputes">Active Disputes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="prevention">Prevention</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="text-sm font-medium">Active Disputes</span>
                </div>
                <p className="text-2xl font-bold">{disputeSummary.total_disputes}</p>
                <p className="text-xs text-muted-foreground">
                  {disputeSummary.urgent_disputes} urgent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">Amount at Risk</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(disputeSummary.total_amount_at_risk_cents)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Disputed funds
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Win Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {disputeSummary.average_win_rate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Avg Response Time</span>
                </div>
                <p className="text-2xl font-bold">2.3</p>
                <p className="text-xs text-muted-foreground">
                  Days to respond
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Disputes and Urgent Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Urgent Actions Required
                </CardTitle>
                <CardDescription>
                  Disputes requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {disputes.filter(d => d.display_info.urgency_level === 'high').slice(0, 5).map((dispute) => (
                  <div key={dispute.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">{dispute.display_info.reason_display}</p>
                      <p className="text-sm text-muted-foreground">
                        {dispute.display_info.amount_display} • Due in {dispute.display_info.days_to_respond} days
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
                {disputes.filter(d => d.display_info.urgency_level === 'high').length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-muted-foreground">No urgent actions required</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest dispute status changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {disputes.slice(0, 5).map((dispute) => (
                  <div key={dispute.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{dispute.display_info.reason_display}</p>
                      <p className="text-sm text-muted-foreground">
                        {dispute.display_info.amount_display}
                      </p>
                    </div>
                    <Badge className={getStatusColor(dispute.status)}>
                      {dispute.display_info.status_display}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Active Disputes</h2>
              <p className="text-muted-foreground">Manage and respond to payment disputes</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="needs_response">Needs Response</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading disputes...</p>
              </div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Active Disputes</h3>
                <p className="text-muted-foreground">
                  Great! You currently have no payment disputes to manage.
                </p>
              </div>
            ) : (
              disputes.map((dispute) => (
                <Card key={dispute.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={'p-2 rounded-lg ${
                          dispute.display_info.urgency_level === 'high' ? 'bg-red-100' :
                          dispute.display_info.urgency_level === 'medium' ? 'bg-yellow-100' : 'bg-green-100`
                        }`}>
                          <AlertTriangle className={`w-5 h-5 ${getUrgencyColor(dispute.display_info.urgency_level)}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{dispute.display_info.reason_display}</h3>
                          <p className="text-muted-foreground">
                            Transaction: {dispute.transaction_id} • Disputed on {new Date(dispute.disputed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(dispute.status)}>
                          {dispute.display_info.status_display}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{dispute.display_info.amount_display}</p>
                          <p className="text-sm text-muted-foreground">
                            {dispute.display_info.days_to_respond} days to respond
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Evidence Completeness</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: '${dispute.dispute_summary.evidence_completeness}%' }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {dispute.dispute_summary.evidence_completeness}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Win Probability</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={'h-2 rounded-full ${
                                dispute.dispute_summary.win_probability >= 70 ? 'bg-green-600' :
                                dispute.dispute_summary.win_probability >= 40 ? 'bg-yellow-600' : 'bg-red-600`
                              }`}
                              style={{ width: `${dispute.dispute_summary.win_probability}%' }}
                            />
                          </div>
                          <span className={'text-sm font-medium ${getWinProbabilityColor(dispute.dispute_summary.win_probability)}'}>
                            {dispute.dispute_summary.win_probability}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Recommended Action</h4>
                        <Badge variant="outline" className="capitalize">
                          {dispute.dispute_summary.recommended_action.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      {dispute.status === 'needs_response' && (
                        <>
                          <Button size="sm">
                            <Shield className="w-4 h-4 mr-2" />
                            Submit Evidence
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Download Evidence
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Trends</CardTitle>
                <CardDescription>Monthly dispute volume and resolution rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'Jan', disputes: 12, won: 8, lost: 4 },
                    { month: 'Feb', disputes: 8, won: 6, lost: 2 },
                    { month: 'Mar', disputes: 15, won: 10, lost: 5 },
                    { month: 'Apr', disputes: 6, won: 5, lost: 1 }
                  ].map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{month.disputes} total</span>
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            {month.won} won
                          </Badge>
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                            {month.lost} lost
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dispute Reasons</CardTitle>
                <CardDescription>Most common dispute categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { reason: 'Product Not Received', count: 8, percentage: 35 },
                    { reason: 'Duplicate Processing', count: 5, percentage: 22 },
                    { reason: 'Fraudulent Transaction', count: 4, percentage: 17 },
                    { reason: 'Credit Not Processed', count: 3, percentage: 13 },
                    { reason: 'Other', count: 3, percentage: 13 }
                  ].map((reason) => (
                    <div key={reason.reason} className="flex items-center justify-between">
                      <span className="text-sm">{reason.reason}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: '${reason.percentage}%' }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{reason.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Prevention Rules</CardTitle>
              <CardDescription>
                Automated rules to detect and prevent potential disputes before they occur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preventionRules.map((rule, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">
                      {rule.rule_type.replace('_', ' ')}
                    </h4>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Threshold: </span>
                      {rule.rule_config.threshold_value}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Window: </span>
                      {rule.rule_config.time_window_minutes}min
                    </div>
                    <div>
                      <span className="text-muted-foreground">Action: </span>
                      <Badge variant="outline" className="capitalize">
                        {rule.rule_config.action}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Add Prevention Rule
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prevention Effectiveness</CardTitle>
                <CardDescription>Impact of prevention rules on dispute rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Disputes Prevented</span>
                    <span className="font-medium">23 this month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>False Positives</span>
                    <span className="font-medium">2 transactions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prevention Rate</span>
                    <span className="font-medium text-green-600">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto-Accept Settings</CardTitle>
                <CardDescription>Automatically accept low-value or specific disputes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Max Auto-Accept Amount</span>
                    <span className="font-medium">$25.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Categories</span>
                    <Badge variant="outline">Duplicates Only</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}