"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Phone, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react'

export default function VoipRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [callData, setCallData] = useState(null)

  const customerId = params?.id

  useEffect(() => {
    // Try to get call context from session storage
    try {
      const storedCall = sessionStorage.getItem('voip:active-call')
      if (storedCall) {
        setCallData(JSON.parse(storedCall))
      }
    } catch (error) {
      console.error('Error loading call data:', error)
    }
  }, [])

  const redirectToVoipSystem = () => {
    setIsRedirecting(true)
    
    // The voip-popover system runs on the same domain but different path structure
    const voipUrl = `/voip-popover/voip/${encodeURIComponent(customerId)}`
    
    // Try to open in a new window for better multi-tasking experience
    if (window.innerWidth >= 1024) {
      const popup = window.open(
        voipUrl,
        'voip-call-system',
        'width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      )
      
      if (popup) {
        popup.focus()
        // Return to previous page after opening popup
        setTimeout(() => {
          router.back()
        }, 500)
      } else {
        // Popup blocked, redirect in same window
        window.location.href = voipUrl
      }
    } else {
      // Mobile: redirect in same window
      window.location.href = voipUrl
    }
  }

  const redirectToCallSystem = () => {
    setIsRedirecting(true)
    const callUrl = `/voip-popover/call/${encodeURIComponent(customerId)}`
    
    if (window.innerWidth >= 1024) {
      const popup = window.open(
        callUrl,
        'voip-call-interface',
        'width=1600,height=1000,scrollbars=yes,resizable=yes'
      )
      
      if (popup) {
        popup.focus()
        setTimeout(() => {
          router.back()
        }, 500)
      } else {
        window.location.href = callUrl
      }
    } else {
      window.location.href = callUrl
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mx-auto">
              <Phone className="h-10 w-10 text-blue-600" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Advanced VOIP System
              </h1>
              <p className="text-slate-600 text-lg">
                Launching comprehensive call management interface
              </p>
              {callData && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <strong>Customer:</strong> {callData.customer?.name || 'Unknown'}
                    {callData.customer?.company && (
                      <span className="block">
                        <strong>Company:</strong> {callData.customer.company}
                      </span>
                    )}
                    {callData.customer?.phone && (
                      <span className="block">
                        <strong>Phone:</strong> {callData.customer.phone}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={redirectToVoipSystem}
                  disabled={isRedirecting}
                  className="h-16 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isRedirecting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Phone className="h-6 w-6" />
                  )}
                  <span>VOIP Console</span>
                </Button>
                
                <Button
                  onClick={redirectToCallSystem}
                  disabled={isRedirecting}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-2 border-blue-200 hover:bg-blue-50"
                >
                  {isRedirecting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <ExternalLink className="h-6 w-6" />
                  )}
                  <span>Call Interface</span>
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Available Features:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Real-time call transcription</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Customer intelligence & insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Service catalog & quote builder</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Dispatch & scheduling tools</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>AI-powered assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Advanced call controls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Multi-user collaboration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Performance analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
