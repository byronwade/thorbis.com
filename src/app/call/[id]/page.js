"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Phone, ExternalLink, ArrowLeft, Loader2, Clock, User } from 'lucide-react'

export default function CallRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [callData, setCallData] = useState(null)
  const [autoRedirect, setAutoRedirect] = useState(false)

  const customerId = params?.id

  useEffect(() => {
    // Try to get call context from session storage
    try {
      const storedCall = sessionStorage.getItem('voip:active-call')
      if (storedCall) {
        const data = JSON.parse(storedCall)
        setCallData(data)
        
        // Auto-redirect for active calls
        if (data.call?.direction === 'inbound') {
          setAutoRedirect(true)
          setTimeout(() => {
            redirectToCallInterface()
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error loading call data:', error)
    }
  }, [customerId])

  const redirectToCallInterface = () => {
    setIsRedirecting(true)
    
    // Navigate to the advanced call interface in voip-popover
    const callUrl = `/voip-popover/call/${encodeURIComponent(customerId)}`
    
    // Store any additional context
    try {
      sessionStorage.setItem('voip:redirect-source', 'main-app')
      sessionStorage.setItem('voip:redirect-time', new Date().toISOString())
    } catch (error) {
      console.error('Error storing redirect context:', error)
    }

    if (window.innerWidth >= 1024) {
      // Desktop: open in focused window
      const callWindow = window.open(
        callUrl,
        'voip-call-interface',
        'width=1600,height=1000,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      )
      
      if (callWindow) {
        callWindow.focus()
        
        // Monitor call window and navigate back when closed
        const checkClosed = setInterval(() => {
          if (callWindow.closed) {
            clearInterval(checkClosed)
            router.back()
          }
        }, 1000)
        
        // Set a timeout to stop monitoring after 1 hour
        setTimeout(() => clearInterval(checkClosed), 3600000)
        
      } else {
        // Popup blocked, redirect in same window
        window.location.href = callUrl
      }
    } else {
      // Mobile: redirect in same window
      window.location.href = callUrl
    }
  }

  const redirectToVoipOverview = () => {
    const voipUrl = `/voip/${encodeURIComponent(customerId)}`
    router.push(voipUrl)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-green-200">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto">
                <Phone className="h-10 w-10 text-green-600" />
              </div>
              {callData && (
                <Badge className="absolute -top-2 -right-2 bg-green-600 text-white animate-pulse">
                  Live Call
                </Badge>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {callData ? 'Active Call Interface' : 'Call Management System'}
              </h1>
              <p className="text-slate-600 text-lg">
                {autoRedirect 
                  ? 'Automatically redirecting to call interface...' 
                  : 'Access advanced call management tools'
                }
              </p>
              
              {callData && (
                <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-green-800 font-semibold">
                      <Clock className="h-4 w-4" />
                      <span>Call Active</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                      {callData.customer?.name && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span><strong>Customer:</strong> {callData.customer.name}</span>
                        </div>
                      )}
                      {callData.customer?.company && (
                        <div className="text-center md:text-left">
                          <strong>Company:</strong> {callData.customer.company}
                        </div>
                      )}
                      {callData.customer?.phone && (
                        <div className="text-center md:text-left">
                          <strong>Phone:</strong> {callData.customer.phone}
                        </div>
                      )}
                      {callData.call?.direction && (
                        <div className="text-center md:text-left">
                          <strong>Direction:</strong> {callData.call.direction}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {autoRedirect ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
                <p className="text-slate-600">
                  Launching call interface in {window.innerWidth >= 1024 ? 'new window' : 'full screen'}...
                </p>
                <Button
                  onClick={redirectToCallInterface}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Launch Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={redirectToCallInterface}
                    disabled={isRedirecting}
                    className="h-16 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {isRedirecting ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Phone className="h-6 w-6" />
                    )}
                    <span>Launch Call Interface</span>
                  </Button>
                  
                  <Button
                    onClick={redirectToVoipOverview}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center gap-2 border-blue-200 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-6 w-6" />
                    <span>VOIP Overview</span>
                  </Button>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Call Management Features:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Live transcript streaming</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Customer intake forms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Real-time collaboration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Advanced call controls</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Service catalog integration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Payment processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Knowledge base access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Analytics dashboard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600"
                disabled={isRedirecting}
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
