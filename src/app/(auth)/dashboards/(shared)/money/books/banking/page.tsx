'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Wallet, 
  Search, 
  Filter, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Bot,
  Sparkles,
  CreditCard,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  RefreshCw,
  FileText,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpDown
} from 'lucide-react'
import { 
  BankReconciliation, 
  BankTransaction, 
  ReconciliationReport,
  DisputeCase,
  getReconciliationStatusColor, 
  formatReconciliationDate,
  calculateReconciliationAccuracy 
} from '@/lib/bank-reconciliation'
import { BankAccount, Transaction } from '@/types/accounting'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Cell } from 'recharts'

// Mock data
const mockBankAccounts: BankAccount[] = [
  {
    id: 'bank_1',
    name: 'Main Checking Account',
    account_number: '****1234',
    bank_name: 'First National Bank',
    account_type: 'checking',
    current_balance: 75000,
    available_balance: 73000,
    currency: 'USD',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'bank_2',
    name: 'Business Savings Account',
    account_number: '****5678',
    bank_name: 'First National Bank',
    account_type: 'savings',
    current_balance: 150000,
    available_balance: 150000,
    currency: 'USD',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
]

const mockBankTransactions: BankTransaction[] = [
  {
    id: 'btx_1',
    account_id: 'bank_1',
    date: '2024-01-15',
    description: 'ACH DEPOSIT CUSTOMER PAYMENT',
    amount: 5400,
    type: 'credit',
    reference_number: 'ACH240115001',
    category: 'Revenue',
    is_reconciled: false
  },
  {
    id: 'btx_2',
    account_id: 'bank_1',
    date: '2024-01-14',
    description: 'CHECK 1001 OFFICE SUPPLIES',
    amount: -2700,
    type: 'debit',
    reference_number: 'CHK1001',
    category: 'Operating Expenses',
    is_reconciled: false
  },
  {
    id: 'btx_3',
    account_id: 'bank_1',
    date: '2024-01-12',
    description: 'WIRE TRANSFER IN',
    amount: 15000,
    type: 'credit',
    reference_number: 'WIRE240112',
    category: 'Revenue',
    is_reconciled: false
  },
  {
    id: 'btx_4',
    account_id: 'bank_1',
    date: '2024-01-10',
    description: 'UNUSUAL LARGE WITHDRAWAL',
    amount: -25000,
    type: 'debit',
    reference_number: 'ATM240110',
    category: 'Unknown',
    is_reconciled: false
  }
]

const mockBookTransactions: Transaction[] = [
  {
    id: 'tx_1',
    account_id: 'bank_1',
    date: '2024-01-15',
    description: 'Customer Payment - Invoice INV-001',
    amount: 5400,
    type: 'income',
    category: 'Revenue',
    reference: 'INV-001',
    reconciliation_status: 'pending'
  },
  {
    id: 'tx_2',
    account_id: 'bank_1',
    date: '2024-01-14',
    description: 'Office Supplies Purchase',
    amount: -2700,
    type: 'expense',
    category: 'Office Supplies',
    reference: 'BILL-001',
    reconciliation_status: 'pending'
  },
  {
    id: 'tx_3',
    account_id: 'bank_1',
    date: '2024-01-12',
    description: 'Large Customer Payment',
    amount: 15000,
    type: 'income',
    category: 'Revenue',
    reference: 'INV-002',
    reconciliation_status: 'pending'
  }
]

const mockBankRec = new BankReconciliation(mockBankTransactions, mockBookTransactions, mockBankAccounts)
const reconciliationReport = mockBankRec.performAutomaticReconciliation('bank_1', '2024-01-01', '2024-01-31')
const disputes = mockBankRec.detectDisputes('bank_1')
const insights = mockBankRec.getReconciliationInsights('bank_1')
const metrics = mockBankRec.getReconciliationMetrics('bank_1')

const accuracyTrendData = insights.accuracy_trends.map((trend, index) => ({
  period: 'Period ${index + 1}',
  accuracy: trend.accuracy + Math.random() * 10 - 5 // Add some variance
}))

const disputeStatusData = [
  { status: 'Open', count: 3, color: '#ef4444' },
  { status: 'Investigating', count: 2, color: '#f59e0b' },
  { status: 'Resolved', count: 8, color: '#22c55e' }
]

function ReconciliationMatchCard({ match, bankTx, bookTx }: {
  match: any
  bankTx?: BankTransaction
  bookTx?: Transaction
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{bankTx?.description || bookTx?.description}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={
              match.confidence_score > 0.9 ? 'bg-green-100 text-green-800' :
              match.confidence_score > 0.7 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {Math.round(match.confidence_score * 100)}% match
            </Badge>
            <Badge variant="outline">
              {match.match_type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-lg font-bold text-green-600">
              ${Math.abs(bankTx?.amount || bookTx?.amount || 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {bankTx?.date || bookTx?.date}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {bankTx?.reference_number || bookTx?.reference || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Reference</div>
          </div>
        </div>
        
        <div className="bg-muted/50 p-2 rounded text-xs">
          {match.ai_explanation}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Eye className="w-3 h-3 mr-1" />
            Review
          </Button>
          <Button size="sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DisputeCard({ dispute }: { dispute: DisputeCase }) {
  const severityColor = {
    open: 'border-red-200 bg-red-50',
    investigating: 'border-yellow-200 bg-yellow-50', 
    resolved: 'border-green-200 bg-green-50',
    closed: 'border-neutral-200 bg-neutral-50'
  }

  return (
    <Card className={'hover:shadow-lg transition-shadow ${severityColor[dispute.status]}'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{dispute.type.replace('_', ' ').toUpperCase()}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={
              dispute.ai_success_probability > 0.8 ? 'bg-green-100 text-green-800' :
              dispute.ai_success_probability > 0.5 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {Math.round(dispute.ai_success_probability * 100)}% success
            </Badge>
            <Badge variant="outline">
              {dispute.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-lg font-bold text-red-600">
            ${dispute.amount.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Dispute Amount</div>
        </div>
        
        <p className="text-sm">{dispute.description}</p>
        
        <div className="text-xs text-muted-foreground">
          Timeline: {dispute.resolution_timeline}
        </div>
        
        <div className="bg-muted/50 p-2 rounded text-xs">
          <div className="font-medium mb-1">Recommended Evidence:</div>
          <ul className="space-y-1">
            {dispute.recommended_evidence.slice(0, 2).map((evidence, i) => (
              <li key={i}>• {evidence}</li>
            ))}
          </ul>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <FileText className="w-3 h-3 mr-1" />
            Evidence
          </Button>
          <Button size="sm">
            <Shield className="w-3 h-3 mr-1" />
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function BankReconciliationPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [statusFilter, setStatusFilter] = useState<'all' | 'matched' | 'unmatched'>('all')
  const [selectedAccount, setSelectedAccount] = useState('bank_1')

  const selectedAccountData = mockBankAccounts.find(acc => acc.id === selectedAccount)!

  const filteredMatches = useMemo(() => {
    return reconciliationReport.reconciled_items.filter(match => {
      const bankTx = mockBankTransactions.find(tx => tx.id === match.bank_transaction_id)
      const bookTx = mockBookTransactions.find(tx => tx.id === match.book_transaction_id)
      
      const matchesSearch = 
        bankTx?.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookTx?.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      return !searchTerm || matchesSearch
    })
  }, [searchTerm])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Wallet className="mr-3 h-8 w-8" />
            Bank Reconciliation
          </h1>
          <p className="text-muted-foreground">AI-powered transaction matching with automatic dispute detection</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Banks
          </Button>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            Auto Reconcile
          </Button>
        </div>
      </div>

      {/* Account Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm min-w-[200px]"
              >
                {mockBankAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.account_number})
                  </option>
                ))}
              </select>
              <div className="text-sm text-muted-foreground">
                Balance: <span className="font-medium">${selectedAccountData.current_balance.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getReconciliationStatusColor(reconciliationReport.variance)}>
                {Math.abs(reconciliationReport.variance) < 1 ? 'BALANCED' : '$${Math.abs(reconciliationReport.variance).toFixed(2)} VARIANCE'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reconciliation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics.reconciliation_rate * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Auto-matched</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.average_processing_time}m
            </div>
            <p className="text-xs text-muted-foreground">Average time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.accuracy_score.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">AI accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {disputes.filter(d => d.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Automation Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(metrics.automation_level * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Automated</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Risk Assessment */}
      {reconciliationReport.ai_risk_assessment.overall_risk_score > 0.3 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              AI Risk Assessment Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reconciliationReport.ai_risk_assessment.fraud_indicators.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-800 mb-1">Fraud Indicators:</div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {reconciliationReport.ai_risk_assessment.fraud_indicators.map((indicator, i) => (
                      <li key={i}>• {indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
              {reconciliationReport.ai_risk_assessment.unusual_patterns.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-800 mb-1">Unusual Patterns:</div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {reconciliationReport.ai_risk_assessment.unusual_patterns.map((pattern, i) => (
                      <li key={i}>• {pattern}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-end">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <Shield className="w-3 h-3 mr-1" />
                  Investigate Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Accuracy Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => ['${Number(value).toFixed(1)}%', 'Accuracy']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e`, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dispute Status */}
        <Card>
          <CardHeader>
            <CardTitle>Dispute Resolution Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <RechartsPie
                  data={disputeStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {disputeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}'} fill={entry.color} />
                  ))}
                </RechartsPie>
                <Tooltip 
                  formatter={(value) => ['${value}', 'Cases']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {disputeStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    {item.status}
                  </div>
                  <span className="font-medium">{item.count} cases</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Suggestions */}
      {reconciliationReport.suggestions.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Sparkles className="mr-2 h-5 w-5" />
              AI Reconciliation Suggestions ({reconciliationReport.suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reconciliationReport.suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={
                        suggestion.confidence > 0.8 ? 'default' : 'secondary'
                      }>
                        {Math.round(suggestion.confidence * 100)}% confident
                      </Badge>
                      <span className="text-sm font-medium">{suggestion.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{suggestion.description}</p>
                    <p className="text-xs text-blue-600">{suggestion.suggested_action}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">
                      ${suggestion.potential_impact.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Impact</div>
                  </div>
                  <Button size="sm" className="ml-3">
                    <Zap className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Disputes */}
      {disputes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Disputes ({disputes.length})</h2>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Dispute Report
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disputes.map(dispute => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All Transactions</option>
                <option value="matched">Matched Only</option>
                <option value="unmatched">Unmatched Only</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            AI Transaction Matches ({filteredMatches.length})
          </h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {calculateReconciliationAccuracy(
                reconciliationReport.reconciled_items.length,
                reconciliationReport.unmatched_bank_items.length,
                reconciliationReport.unmatched_book_items.length
              ).toFixed(1)}% accuracy
            </Badge>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by Confidence
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(match => {
            const bankTx = mockBankTransactions.find(tx => tx.id === match.bank_transaction_id)
            const bookTx = mockBookTransactions.find(tx => tx.id === match.book_transaction_id)
            
            return (
              <ReconciliationMatchCard
                key={match.bank_transaction_id}
                match={match}
                bankTx={bankTx}
                bookTx={bookTx}
              />
            )
          })}
        </div>
      </div>

      {/* Unmatched Transactions */}
      {(reconciliationReport.unmatched_bank_items.length > 0 || reconciliationReport.unmatched_book_items.length > 0) && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Unmatched Transactions ({reconciliationReport.unmatched_bank_items.length + reconciliationReport.unmatched_book_items.length})
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unmatched Bank Items */}
            {reconciliationReport.unmatched_bank_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bank Statement Only ({reconciliationReport.unmatched_bank_items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reconciliationReport.unmatched_bank_items.map(bankTx => (
                      <div key={bankTx.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{bankTx.description}</div>
                          <div className="text-xs text-muted-foreground">{bankTx.date} • {bankTx.reference_number}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">${Math.abs(bankTx.amount).toLocaleString()}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {bankTx.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unmatched Book Items */}
            {reconciliationReport.unmatched_book_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Book Records Only ({reconciliationReport.unmatched_book_items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reconciliationReport.unmatched_book_items.map(bookTx => (
                      <div key={bookTx.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{bookTx.description}</div>
                          <div className="text-xs text-muted-foreground">{bookTx.date} • {bookTx.reference}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">${Math.abs(bookTx.amount).toLocaleString()}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {bookTx.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {filteredMatches.length === 0 && reconciliationReport.unmatched_bank_items.length === 0 && reconciliationReport.unmatched_book_items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50 text-green-500" />
            <p className="text-lg font-medium">All transactions reconciled!</p>
            <p className="text-sm">No unmatched items found for this period.</p>
            <Button className="mt-4" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              View Summary Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}