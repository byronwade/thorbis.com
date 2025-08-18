"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import VOIP components to prevent SSR issues
const VoipIncomingOverlay = dynamic(
  () => import('./VoipIncomingOverlay'),
  { ssr: false }
)

// VOIP Context for managing call state across the app
const VoipContext = createContext({
  isCallActive: false,
  incomingCall: false,
  currentCall: null,
  currentCustomer: null,
  simulateIncomingCall: () => {},
  answerCall: () => {},
  endCall: () => {},
  transferToVoipSystem: () => {}
})

export const useVoip = () => useContext(VoipContext)

// Sample customer data (this would come from your database)
const sampleCustomers = {
  "555-123-4567": {
    id: "CUST-2341",
    name: "Jordan Pierce", 
    company: "ACME Field Services",
    phone: "+1 (415) 555-0117",
    email: "jordan.pierce@acme.com",
    accountId: "ACME-4421",
    rating: 4.7,
    avatarUrl: "/images/caller-jordan.png",
    tags: ["Commercial", "Net-60", "SmartGate", "Solar"],
  },
  "555-987-6543": {
    id: "CUST-1829",
    name: "Sarah Johnson",
    company: "TechCorp Solutions", 
    phone: "+1 (555) 987-6543",
    email: "sarah@techcorp.com",
    accountId: "TECH-9821",
    rating: 4.2,
    avatarUrl: "/placeholder-avatar.svg",
    tags: ["Enterprise", "Priority", "Security"],
  },
  "555-111-2222": {
    id: "CUST-5672",
    name: "Michael Brown",
    company: "Industrial Services LLC",
    phone: "+1 (555) 111-2222", 
    email: "mbrown@industrial.com",
    accountId: "IND-3456",
    rating: 4.9,
    avatarUrl: "/placeholder-avatar.svg",
    tags: ["Industrial", "24/7", "Emergency"],
  }
}

// Enhanced VOIP Provider with full system integration
export function VoipProvider({ children }) {
  const router = useRouter()
  const [isCallActive, setIsCallActive] = useState(false)
  const [incomingCall, setIncomingCall] = useState(false)
  const [currentCall, setCurrentCall] = useState(null)
  const [currentCustomer, setCurrentCustomer] = useState(null)

  // Simulate incoming call with enhanced customer data
  const simulateIncomingCall = (phoneNumber = "555-123-4567") => {
    const customer = sampleCustomers[phoneNumber] || {
      id: "UNKNOWN",
      name: "Unknown Caller",
      company: "Unknown",
      phone: phoneNumber,
      accountId: "UNK-0000",
      rating: 0,
      tags: []
    }

    setCurrentCustomer(customer)
    setCurrentCall({
      id: `call-${Date.now()}`,
      phoneNumber,
      timestamp: new Date(),
      direction: 'inbound'
    })
    setIncomingCall(true)
    setIsCallActive(true)

    // Log the call simulation for debugging
    console.log('📞 Advanced VOIP Call Simulation Started:', {
      customer: customer.name,
      phone: phoneNumber,
      company: customer.company
    })
  }

  // Answer call and transition to full VOIP interface
  const answerCall = () => {
    setIncomingCall(false)
    // Call is still active, just not incoming anymore
  }

  // Transfer to full VOIP system (navigates to voip-popover interface)
  const transferToVoipSystem = () => {
    if (currentCustomer) {
      // Navigate to the full VOIP system with customer context
      const voipUrl = `/voip/${encodeURIComponent(currentCustomer.id)}`
      
      // Store call context for the VOIP system
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('voip:active-call', JSON.stringify({
          customer: currentCustomer,
          call: currentCall,
          startTime: new Date().toISOString()
        }))
      }

      // Open VOIP system in new window or navigate
      if (window.innerWidth < 1024) {
        // Mobile: navigate to VOIP page
        router.push(voipUrl)
      } else {
        // Desktop: open in popup for better multi-window experience
        const popup = window.open(
          voipUrl, 
          'voip-call',
          'width=1200,height=800,scrollbars=yes,resizable=yes'
        )
        if (popup) {
          popup.focus()
        } else {
          // Fallback to navigation if popup blocked
          router.push(voipUrl)
        }
      }
    }
  }

  // End call and cleanup
  const endCall = () => {
    setIsCallActive(false)
    setIncomingCall(false)
    setCurrentCall(null)
    setCurrentCustomer(null)

    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('voip:active-call')
    }

    console.log('📞 VOIP Call Ended')
  }

  // Listen for VOIP system events and custom call triggers
  useEffect(() => {
    const handleVoipEvent = (event) => {
      switch (event.data?.type) {
        case 'voip:call-ended':
          endCall()
          break
        case 'voip:call-answered':
          answerCall()
          break
        case 'voip:transfer-complete':
          // Handle call transfer completion
          console.log('Call transfer completed:', event.data)
          break
      }
    }

    const handleCustomCallEvent = (event) => {
      const { phoneNumber, customerName, company, callType } = event.detail
      
      // Create a custom customer for the call simulation
      const customCustomer = {
        id: `CUST-${Date.now()}`,
        name: customerName || 'Support Representative',
        company: company || 'Customer Support',
        phone: phoneNumber || '555-SUPPORT',
        email: `${customerName?.toLowerCase().replace(' ', '.')}@support.com` || 'support@thorbis.com',
        accountId: `SUP-${Math.floor(Math.random() * 9999)}`,
        rating: 5.0,
        avatarUrl: "/placeholder-avatar.svg",
        tags: [callType || 'Support', 'Priority', 'Live'],
      }

      // Add to sample customers temporarily
      sampleCustomers[phoneNumber] = customCustomer
      
      // Trigger the call simulation
      simulateIncomingCall(phoneNumber)
      
      console.log('🎯 Advanced VOIP call triggered:', {
        customer: customCustomer.name,
        company: customCustomer.company,
        phone: phoneNumber,
        type: callType
      })
    }

    window.addEventListener('message', handleVoipEvent)
    window.addEventListener('voip:simulate-call', handleCustomCallEvent)
    
    return () => {
      window.removeEventListener('message', handleVoipEvent)
      window.removeEventListener('voip:simulate-call', handleCustomCallEvent)
    }
  }, [simulateIncomingCall])

  const contextValue = {
    isCallActive,
    incomingCall,
    currentCall,
    currentCustomer,
    simulateIncomingCall,
    answerCall,
    endCall,
    transferToVoipSystem
  }

  return (
    <VoipContext.Provider value={contextValue}>
      {children}
      {/* Enhanced VOIP Overlay with full system integration */}
      {isCallActive && (
        <VoipIncomingOverlay 
          open={incomingCall}
          onOpenChange={() => {
            if (incomingCall) {
              // If call is incoming and overlay closes, end the call
              endCall()
            }
          }}
        />
      )}
    </VoipContext.Provider>
  )
}

// Enhanced VOIP Control Button with multiple options
export function VoipControlButton({ className }) {
  const { simulateIncomingCall, isCallActive, transferToVoipSystem } = useVoip()
  
  if (isCallActive) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col gap-2 ${className}`}>
        <button
          onClick={transferToVoipSystem}
          className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
          title="Open Full VOIP Console"
        >
          <svg 
            className="h-5 w-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
          </svg>
        </button>
      </div>
    )
  }
  
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col gap-2 ${className}`}>
      <button
        onClick={() => simulateIncomingCall("555-123-4567")}
        className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
        title="Simulate Call - Jordan Pierce"
      >
        <svg 
          className="h-5 w-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>
      
      <button
        onClick={() => simulateIncomingCall("555-987-6543")}  
        className="h-10 w-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 text-xs"
        title="Simulate Call - Sarah Johnson"
      >
        <svg 
          className="h-4 w-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
      
      <button
        onClick={() => simulateIncomingCall("555-111-2222")}
        className="h-10 w-10 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 text-xs"
        title="Simulate Emergency Call - Michael Brown"
      >
        <svg 
          className="h-4 w-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </button>
    </div>
  )
}

// Quick VOIP Actions for CSR Console
export function VoipQuickActions({ className }) {
  const { simulateIncomingCall, isCallActive, currentCustomer } = useVoip()
  
  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={() => simulateIncomingCall("555-123-4567")}
        disabled={isCallActive}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        {isCallActive ? `Active: ${currentCustomer?.name}` : 'Simulate Call'}
      </button>
      
      <button
        onClick={() => simulateIncomingCall("555-987-6543")}
        disabled={isCallActive}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Enterprise
      </button>
      
      <button
        onClick={() => simulateIncomingCall("555-111-2222")}
        disabled={isCallActive}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        Emergency
      </button>
    </div>
  )
}

export default VoipProvider
