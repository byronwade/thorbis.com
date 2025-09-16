'use client'

import React from 'react'
import { BankingLayout } from '@/components/banking-layout'
import { SecurityCenter } from '@/components/banking/security-center'

export default function SecurityCenterPage() {
  // Mock user data
  const user = {
    email: 'banking-user@thorbis.com',
    id: 'b0161770-33dd-4fc9-8ad9-2c8066108352',
    type: 'business',
    name: 'Banking User'
  }

  return (
    <BankingLayout user={user}>
      <main className="relative flex min-h-svh flex-1 flex-col bg-neutral-950 text-neutral-100 peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow">
        <div className="flex flex-col min-w-0 h-dvh bg-neutral-950">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="relative flex-1 overflow-y-auto flex flex-col min-w-0 gap-6 pt-4 pb-32 px-4 max-w-6xl mx-auto">
              <SecurityCenter user={user} />
            </div>
          </div>
        </div>
      </main>
    </BankingLayout>
  )
}