import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout"

export const metadata = {
  title: 'Restaurant Dashboard',
  description: 'Complete restaurant management platform with POS, kitchen display, floor management, and more.',
}

export default function RestaurantPage() {
  const actions = (
    <>
      <Button asChild>
        <Link href="/rest/pos">Open POS</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/rest/kitchen">Kitchen Display</Link>
      </Button>
    </>
  )

  return (
    <DashboardPageLayout
      title="Restaurant Dashboard"
      description="Manage POS, kitchen operations, and floor management"
      actions={actions}
    >

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/24</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-green-950 text-green-400 border-green-500/30">Busy Night</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-yellow-950 text-yellow-400 border-yellow-500/30">In Kitchen</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Staff on Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">3 Servers, 5 Kitchen</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>'
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,450</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-blue-950 text-blue-400 border-blue-500/30">↗ +15%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Kitchen Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kitchen Display System</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/rest/kitchen">Full KDS</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Orders */}
              <div className="border rounded-lg p-4 bg-blue-950/20 border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-400">New Orders</h4>
                  <Badge className="bg-blue-950 text-blue-400 border-blue-500/30">3</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">Table 7 - Order #127</div>
                    <div className="text-muted-foreground">2x Caesar Salad, 1x Ribeye</div>
                    <div className="text-xs text-muted-foreground">Ordered: 7:42 PM</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Table 12 - Order #128</div>
                    <div className="text-muted-foreground">1x Fish & Chips, 2x IPA</div>
                    <div className="text-xs text-muted-foreground">Ordered: 7:45 PM</div>
                  </div>
                </div>
              </div>

              {/* In Progress */}
              <div className="border rounded-lg p-4 bg-yellow-950/20 border-yellow-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-yellow-400">In Progress</h4>
                  <Badge className="bg-yellow-950 text-yellow-400 border-yellow-500/30">6</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">Table 3 - Order #125</div>
                    <div className="text-muted-foreground">2x Pasta Primavera</div>
                    <div className="text-xs text-muted-foreground">Cooking: 12 min</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Table 9 - Order #126</div>
                    <div className="text-muted-foreground">1x Burger, 1x Wings</div>
                    <div className="text-xs text-muted-foreground">Cooking: 8 min</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floor Management */}
        <Card>
          <CardHeader>
            <CardTitle>Floor Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="border rounded p-3 text-center">
                <div className="text-sm font-medium">Table 1</div>
                <Badge variant="secondary" className="text-xs">Available</Badge>
              </div>
              <div className="border rounded p-3 text-center bg-green-950/20 border-green-500/30">
                <div className="text-sm font-medium">Table 2</div>
                <Badge className="bg-green-950 text-green-400 border-green-500/30 text-xs">Seated</Badge>
              </div>
              <div className="border rounded p-3 text-center bg-yellow-950/20 border-yellow-500/30">
                <div className="text-sm font-medium">Table 3</div>
                <Badge className="bg-yellow-950 text-yellow-400 border-yellow-500/30 text-xs">Ordering</Badge>
              </div>
              <div className="border rounded p-3 text-center bg-blue-950/20 border-blue-500/30">
                <div className="text-sm font-medium">Table 4</div>
                <Badge className="bg-blue-950 text-blue-400 border-blue-500/30 text-xs">Eating</Badge>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/rest/tables">Manage All Tables</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">💳</div>
              Point of Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Fast, intuitive POS system with payment processing, order management, and customer tracking.
            </p>
            <Button asChild className="w-full">
              <Link href="/rest/pos">Open POS Terminal</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">👨‍🍳</div>
              Kitchen Display
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Real-time kitchen display system for order management, timing, and kitchen workflow optimization.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/rest/kitchen">Kitchen Display</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">📋</div>
              Menu Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Comprehensive menu management with pricing, ingredients, allergen tracking, and inventory integration.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/rest/menu">Manage Menu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}