import { Suspense } from 'react'
import { DeviceSettings } from '@/components/devices/device-settings'

export default function DeviceSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Device Settings</h1>
          <p className="text-neutral-400 mt-1">
            Global device configuration, security policies, and system preferences
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="max-w-4xl space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-neutral-800 rounded w-1/3 animate-pulse" />
                  <div className="h-8 bg-neutral-800 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <DeviceSettings />
      </Suspense>
    </div>
  )
}