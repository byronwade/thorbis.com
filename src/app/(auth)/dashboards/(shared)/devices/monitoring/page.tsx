import { Suspense } from 'react'
import { DeviceMonitoring } from '@/components/devices/device-monitoring'

export default function DeviceMonitoringPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Device Monitoring</h1>
          <p className="text-neutral-400 mt-1">
            Real-time monitoring, alerts, and performance metrics for all devices
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
            <div className="h-48 bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }>
        <DeviceMonitoring />
      </Suspense>
    </div>
  )
}