'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Bot,
  Sparkles,
  Plus,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye
} from 'lucide-react'
import { GeneralLedger, LedgerEntry, AnomalyDetection, BalancingSuggestion, analyzeLedgerTrends } from '@/lib/general-ledger'
import { DEFAULT_CHART_OF_ACCOUNTS } from '@/lib/chart-of-accounts'
import { ChartOfAccount } from '@/types/accounting'

// Mock data setup
const mockAccounts: ChartOfAccount[] = DEFAULT_CHART_OF_ACCOUNTS.map((account, index) => ({
  ...account,
  id: 'acc_${index + 1}',
  balance: Math.random() * 50000 - 25000,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z'
}))

const mockLedger = new GeneralLedger(mockAccounts)

// Generate some sample ledger entries
const sampleTransactions = [
  {
    id: 'txn_1',
    date: '2024-01-15',
    description: 'Office Supplies Purchase',
    total_amount: 345.67,
    status: 'posted' as const,
    entries: [
      {
        id: 'entry_1',
        transaction_id: 'txn_1',
        account_id: mockAccounts.find(acc => acc.code === '5200')?.id || 'acc_1',
        debit_amount: 345.67,
        credit_amount: 0,
        created_at: '2024-01-15T00:00:00Z'
      },
      {
        id: 'entry_2', 
        transaction_id: 'txn_1',
        account_id: mockAccounts.find(acc => acc.code === '1000')?.id || 'acc_2',
        debit_amount: 0,
        credit_amount: 345.67,
        created_at: '2024-01-15T00:00:00Z'
      }
    ],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
]

// Add sample data to ledger
sampleTransactions.forEach(txn => mockLedger.addTransaction(txn))

function AnomalyCard({ anomaly }: { anomaly: AnomalyDetection }) {
  const getSeverityColor = (severity: AnomalyDetection['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800'
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800'
      default: return 'bg-neutral-100 border-neutral-300 text-neutral-800'
    }
  }

  return (
    <div className={'p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}'}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <Badge variant="outline" className="text-xs">
            {anomaly.severity.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {Math.round(anomaly.confidence * 100)}% confidence
          </Badge>
        </div>
        <Button size="sm" variant="ghost">
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      <h4 className="font-medium mb-1">{anomaly.type.replace('_', ' ').toUpperCase()}</h4>
      <p className="text-sm mb-2">{anomaly.description}</p>
      {anomaly.suggested_fix && (
        <div className="bg-background/50 p-2 rounded text-xs">
          <strong>Suggested Fix:</strong> {anomaly.suggested_fix}
        </div>
      )}
    </div>
  )
}

function LedgerEntryRow({ entry }: { entry: LedgerEntry }) {
  const balanceColor = entry.running_balance > 0 ? 'text-green-600' : 
                      entry.running_balance < 0 ? 'text-red-600' : 'text-muted-foreground'
  const balanceIcon = entry.running_balance > 0 ? TrendingUp : 
                     entry.running_balance < 0 ? TrendingDown : Minus

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-3 px-4">
        <div className="text-sm">{entry.date}</div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          <code className="text-xs font-mono bg-muted px-2 py-1 rounded mr-2">
            {entry.account_code}
          </code>
          <span className="text-sm">{entry.account_name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm">{entry.description}</div>
        {entry.reference_number && (
          <div className="text-xs text-muted-foreground">Ref: {entry.reference_number}</div>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        {entry.debit_amount > 0 ? (
          <div className="font-medium">${entry.debit_amount.toLocaleString()}</div>
        ) : (
          <div className="text-muted-foreground">-</div>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        {entry.credit_amount > 0 ? (
          <div className="font-medium">${entry.credit_amount.toLocaleString()}</div>
        ) : (
          <div className="text-muted-foreground">-</div>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <div className={'flex items-center justify-end font-medium ${balanceColor}'}>
          {React.createElement(balanceIcon, { className: 'w-4 h-4 mr-1' })}
          ${Math.abs(entry.running_balance).toLocaleString()}
        </div>
      </td>
    </tr>
  )
}

export default function GeneralLedgerPage() {
  const [searchTerm, setSearchTerm] = useState(')
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('2024-01-01')
  const [dateTo, setDateTo] = useState('2024-12-31')
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Get all ledger entries
  const allEntries = useMemo(() => {
    return mockAccounts.flatMap(account => 
      mockLedger.getAccountLedger(account.id, dateFrom, dateTo)
    )
  }, [dateFrom, dateTo])

  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.account_code.includes(searchTerm)
      const matchesAccount = selectedAccount === 'all' || entry.account_id === selectedAccount
      return matchesSearch && matchesAccount
    })
  }, [allEntries, searchTerm, selectedAccount])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalDebits = filteredEntries.reduce((sum, entry) => sum + entry.debit_amount, 0)
    const totalCredits = filteredEntries.reduce((sum, entry) => sum + entry.credit_amount, 0)
    const imbalance = totalDebits - totalCredits

    return {
      totalDebits,
      totalCredits,
      imbalance,
      entryCount: filteredEntries.length,
      isBalanced: Math.abs(imbalance) <= 0.01
    }
  }, [filteredEntries])

  // Run AI analysis
  const runAiAnalysis = async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock anomaly detection
    const detectedAnomalies: AnomalyDetection[] = [
      {
        id: 'anom_1',
        type: 'unusual_amount',
        severity: 'medium',
        transaction_id: 'txn_1',
        description: 'Transaction amount is 340% higher than typical for this account',
        suggested_fix: 'Verify amount accuracy or split into multiple transactions',
        confidence: 0.82,
        detected_at: new Date().toISOString()
      },
      {
        id: 'anom_2',
        type: 'timing_anomaly',
        severity: 'low',
        transaction_id: 'txn_1',
        description: 'Transaction posted outside normal business hours',
        confidence: 0.65,
        detected_at: new Date().toISOString()
      }
    ]
    
    setAnomalies(detectedAnomalies)
    setIsAnalyzing(false)
  }

  useEffect(() => {
    runAiAnalysis()
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            General Ledger
          </h1>
          <p className="text-muted-foreground">AI-enhanced ledger with anomaly detection and auto-balancing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={runAiAnalysis} disabled={isAnalyzing}>
            <Bot className="mr-2 h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Journal Entry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryStats.totalDebits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{summaryStats.entryCount} entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryStats.totalCredits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Credit entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Status</CardTitle>
            {summaryStats.isBalanced ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> :
              <XCircle className="h-4 w-4 text-red-500" />
            }
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold ${summaryStats.isBalanced ? 'text-green-600' : 'text-red-600'
              }'}>'
              {summaryStats.isBalanced ? 'Balanced' : '$${Math.abs(summaryStats.imbalance).toFixed(2)}'}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.isBalanced ? 'Ledger is balanced' : 'Imbalance detected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Anomalies</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{anomalies.length}</div>
            <p className="text-xs text-muted-foreground">Issues detected</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Anomaly Detection Panel */}
      {anomalies.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Sparkles className="mr-2 h-5 w-5" />
              AI Anomaly Detection Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAnalyzing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <span>Analyzing ledger for anomalies...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anomalies.map(anomaly => (
                  <AnomalyCard key={anomaly.id} anomaly={anomaly} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ledger entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm min-w-48"
            >
              <option value="all">All Accounts</option>
              {mockAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-auto"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-auto"
            />
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ledger Entries ({filteredEntries.length})</span>
            <div className="flex items-center space-x-2">
              <Badge variant={summaryStats.isBalanced ? 'default' : 'destructive'}>
                {summaryStats.isBalanced ? 'Balanced' : 'Unbalanced'}
              </Badge>
              <Button size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Account</th>
                  <th className="py-3 px-4 text-left font-medium">Description</th>
                  <th className="py-3 px-4 text-right font-medium">Debit</th>
                  <th className="py-3 px-4 text-right font-medium">Credit</th>
                  <th className="py-3 px-4 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <LedgerEntryRow key={entry.id} entry={entry} />
                ))}
              </tbody>
              {/* Summary Row */}
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30 font-medium">
                  <td colSpan={3} className="py-3 px-4 text-right">Totals:</td>
                  <td className="py-3 px-4 text-right">${summaryStats.totalDebits.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">${summaryStats.totalCredits.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={summaryStats.isBalanced ? 'default' : 'destructive'}>
                      {summaryStats.isBalanced ? 'Balanced` : 'Off by $${Math.abs(summaryStats.imbalance).toFixed(2)}'}
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {filteredEntries.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No ledger entries found for the selected criteria.</p>
              <Button className="mt-4" onClick={() => setSearchTerm(')}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}