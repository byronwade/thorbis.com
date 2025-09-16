import { DevicesDashboard } from '@/components/devices/devices-dashboard'
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout'

export default function DevicesPage() {
  return (
    <DashboardPageLayout
      title="Devices"
      description="IoT device management and monitoring across all your business operations"
      loading={<div className="animate-pulse">Loading devices...</div>}
    >
      <DevicesDashboard />
    </DashboardPageLayout>
  )
}