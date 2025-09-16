import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const metadata = {
  title: 'Banking Dashboard',
  description: 'Complete banking and financial services platform with accounts, transactions, and analytics.',
}

export default function BankingPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Banking Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive financial services and account management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/banking/transfer">New Transfer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/banking/accounts/new">Open Account</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-green-950 text-green-400 border-green-500/30">↗ +5.2%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">+23 this month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-yellow-950 text-yellow-400 border-yellow-500/30">Review Needed</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Loan Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$850K</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-blue-950 text-blue-400 border-blue-500/30">Active Loans</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">💳</div>
              Account Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Comprehensive account management with real-time balances, transaction history, and account analytics.
            </p>
            <Button asChild className="w-full">
              <Link href="/banking/accounts">Manage Accounts</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">🔄</div>
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Process transfers, payments, and monitor all transaction activities with advanced fraud detection.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/banking/transactions">View Transactions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              Financial Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Advanced financial analytics, risk assessment, and comprehensive reporting for informed decisions.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/banking/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
