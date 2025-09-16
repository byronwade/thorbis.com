import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout"

export const metadata = {
  title: 'Investigations Dashboard',
  description: 'Professional case and investigation management platform with evidence tracking and reporting.',
}

export default function InvestigationsPage() {
  const actions = (
    <>
      <Button asChild>
        <Link href="/investigations/cases/new">New Case</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/investigations/reports/new">Generate Report</Link>
      </Button>
    </>
  )

  return (
    <DashboardPageLayout
      title="Case Management Dashboard"
      description="Professional investigation and evidence tracking"
      actions={actions}
    >

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-blue-950 text-blue-400 border-blue-500/30">In Progress</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closed Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-green-950 text-green-400 border-green-500/30">+8 this month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Evidence Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">Catalogued</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-xs bg-yellow-950 text-yellow-400 border-yellow-500/30">Due Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">📋</div>
              Case Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Comprehensive case tracking with timelines, assignments, and progress monitoring.
            </p>
            <Button asChild className="w-full">
              <Link href="/investigations/cases">Manage Cases</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">🗂️</div>
              Evidence Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Secure evidence cataloging with chain of custody tracking and digital forensics support.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/investigations/evidence">Evidence Vault</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">📄</div>
              Report Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Professional report generation with templates, charts, and automated compliance checking.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/investigations/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
