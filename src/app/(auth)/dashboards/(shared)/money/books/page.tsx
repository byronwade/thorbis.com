import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const metadata = {
  title: 'Accounting Dashboard',
  description: 'Complete accounting and bookkeeping platform with financial management and reporting.',
}

export default function BooksPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Accounting Dashboard</h1>
          <p className="text-muted-foreground">Complete financial management and bookkeeping</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/books/transactions/new">Record Transaction</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/books/invoices/new">Create Invoice</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,280</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-green-950 text-green-400 border-green-500/30">Healthy</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accounts Receivable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,450</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-yellow-950 text-yellow-400 border-yellow-500/30">$3,200 Overdue</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,840</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">Within Budget</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,920</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-green-950 text-green-400 border-green-500/30">↗ +15%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">💰</div>
              Financial Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track income, expenses, and cash flow with automated categorization and reconciliation.
            </p>
            <Button asChild className="w-full">
              <Link href="/books/dashboard">Financial Overview</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              Reports & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Generate profit & loss statements, balance sheets, and custom financial reports.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/books/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">📋</div>
              Tax Preparation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Streamlined tax preparation with automated calculations and filing assistance.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/books/taxes">Tax Center</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
