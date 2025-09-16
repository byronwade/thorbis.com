import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout"

export const metadata = {
  title: 'Retail Dashboard',
  description: 'Complete retail management platform with POS, inventory, and customer analytics.',
}

export default function RetailPage() {
  const actions = (
    <>
      <Button asChild>
        <Link href="/ret/pos">Open POS</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/ret/products/new">Add Product</Link>
      </Button>
    </>
  )

  return (
    <DashboardPageLayout
      title="Retail Dashboard"
      description="Manage POS operations, inventory, and customer analytics"
      actions={actions}
    >

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Sales</CardTitle>'
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,840</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-green-950 text-green-400 border-green-500/30">↗ +22%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">Avg: $147</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,456</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-yellow-950 text-yellow-400 border-yellow-500/30">42 Low Stock</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-blue-950 text-blue-400 border-blue-500/30">+18 this week</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">🛒</div>
              Point of Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Modern POS system with barcode scanning, payment processing, and real-time inventory updates.
            </p>
            <Button asChild className="w-full">
              <Link href="/ret/pos">Open POS Terminal</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">📦</div>
              Inventory Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Complete inventory tracking with automatic reordering, supplier management, and stock alerts.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/ret/inventory">Manage Inventory</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">👥</div>
              Customer Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Advanced customer insights, purchase history, and loyalty program management for growth.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/ret/customers">View Customers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
