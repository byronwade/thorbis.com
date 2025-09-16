import { Suspense } from 'react'
import { DeviceAutomation } from '@/components/devices/device-automation'

export default function DeviceAutomationPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Device Automation</h1>
          <p className="text-neutral-400 mt-1">
            Configure automation rules, schedules, and intelligent device behaviors
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }>
        <DeviceAutomation />
      </Suspense>
    </div>
  )
}