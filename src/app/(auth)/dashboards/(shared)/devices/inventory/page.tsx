import { Suspense } from 'react'
import { DeviceInventory } from '@/components/devices/device-inventory'

export default function DeviceInventoryPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Device Inventory</h1>
          <p className="text-neutral-400 mt-1">
            Comprehensive catalog of all registered devices and their specifications
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }>
        <DeviceInventory />
      </Suspense>
    </div>
  )
}