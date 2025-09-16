import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout"

export const metadata = {
  title: 'Auto Services Dashboard',
  description: 'Complete auto service management with repair orders, inventory, and shop operations.',
}

export default function AutoServicesPage() {
  const actions = (
    <>
      <Button asChild>
        <Link href="/auto/repair-orders/new">New Repair Order</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/auto/vehicles/new">Add Vehicle</Link>
      </Button>
    </>
  )

  return (
    <DashboardPageLayout
      title="Auto Services Dashboard"
      description="Vehicle repair and shop management system"
      actions={actions}
    >

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Repair Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-blue-950 text-blue-400 border-blue-500/30">In Progress</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vehicles in Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">Bay Capacity: 15</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6/8</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-green-950 text-green-400 border-green-500/30">Available</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,280</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-green-950 text-green-400 border-green-500/30">↗ +8%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">🔧</div>
              Repair Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Comprehensive repair order management with diagnostics, parts tracking, and labor estimation.
            </p>
            <Button asChild className="w-full">
              <Link href="/auto/repair-orders">Manage Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">🚗</div>
              Vehicle Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Complete vehicle profiles with service history, maintenance schedules, and customer information.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auto/vehicles">View Vehicles</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">📦</div>
              Parts & Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Smart inventory management with automatic reordering, supplier integration, and cost tracking.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auto/inventory">Manage Inventory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
