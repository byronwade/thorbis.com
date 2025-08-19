"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Brain,
  User,
  MapPin,
  Building,
  Star,
  MessageSquare,
  X,
  Minimize2,
  Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Import the advanced VOIP integration
import { 
  VoipProvider as AdvancedVoipProvider, 
  useVoip as useAdvancedVoip, 
  VoipControlButton as AdvancedVoipControlButton, 
  VoipQuickActions 
} from './voip-integration'

// Re-export advanced components for direct use
export { 
  AdvancedVoipProvider as VoipProvider, 
  useAdvancedVoip as useVoip, 
  AdvancedVoipControlButton as VoipControlButton, 
  VoipQuickActions 
}

// Legacy VOIP Context for backward compatibility
const LegacyVoipContext = createContext(null)

export function useLegacyVoip() {
  const context = useContext(LegacyVoipContext)
  if (!context) {
    // Fall back to advanced VOIP if legacy context not available
    try {
      return useAdvancedVoip()
    } catch {
      throw new Error('useVoip must be used within a VoipProvider')
    }
  }
  return context
}

// Sample customer data
const sampleCustomers = {
  "555-123-4567": {
    id: "cust-001",
    name: "Sarah Johnson",
    phone: "(555) 123-4567",
    email: "sarah.johnson@email.com",
    address: "123 Main St, Springfield, IL 62701",
    business: "Johnson's Hardware Store",
    customerType: "Premium Business",
    lastContact: "2024-01-10",
    totalValue: 15420,
    openTickets: 2,
    satisfaction: 4.8,
    notes: "Long-term customer, prefers morning calls",
    history: [
      { date: "2024-01-10", type: "Service Call", description: "HVAC maintenance completed" },
      { date: "2024-01-05", type: "Support", description: "Equipment inquiry" },
      { date: "2023-12-28", type: "Purchase", description: "Annual service contract renewal" }
    ]
  },
  "555-987-6543": {
    id: "cust-002", 
    name: "Michael Rodriguez",
    phone: "(555) 987-6543",
    email: "m.rodriguez@techcorp.com",
    address: "456 Business Ave, Tech City, CA 90210",
    business: "TechCorp Industries",
    customerType: "Enterprise",
    lastContact: "2024-01-08",
    totalValue: 87500,
    openTickets: 0,
    satisfaction: 4.9,
    notes: "Decision maker for IT purchases, prefers detailed technical information",
    history: [
      { date: "2024-01-08", type: "Consultation", description: "System upgrade planning" },
      { date: "2023-12-15", type: "Service", description: "Emergency repair completed" },
      { date: "2023-11-20", type: "Purchase", description: "Fleet management system upgrade" }
    ]
  }
}

// Call Intelligence Component
function CallIntelligence({ customer }) {
  const insights = [
    {
      type: "opportunity",
      level: "high",
      title: "Upsell Opportunity", 
      description: `${customer?.name} has shown interest in premium services`,
      confidence: 87
    },
    {
      type: "sentiment",
      level: "medium",
      title: "Positive Sentiment",
      description: "Customer tone indicates satisfaction with current service",
      confidence: 92
    },
    {
      type: "risk",
      level: "low", 
      title: "Renewal Risk",
      description: "Contract renewal is upcoming in 3 months",
      confidence: 76
    }
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">AI Insights</span>
      </div>
      
      {insights.map((insight, idx) => (
        <div key={idx} className="p-3 rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between mb-1">
            <Badge variant={
              insight.level === "high" ? "destructive" :
              insight.level === "medium" ? "default" : "secondary"
            } className="text-xs">
              {insight.title}
            </Badge>
            <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
          </div>
          <p className="text-xs text-muted-foreground">{insight.description}</p>
        </div>
      ))}
    </div>
  )
}

// Customer Information Card
function CustomerCard({ customer }) {
  if (!customer) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Unknown Caller
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            No customer information found. Starting new customer record...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{customer.name}</div>
              <div className="text-xs text-muted-foreground">{customer.phone}</div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {customer.customerType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-3 w-3" />
            <span>{customer.business}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{customer.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-3 w-3" />
            <span>{customer.satisfaction}/5.0 satisfaction</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="font-semibold">${customer.totalValue.toLocaleString()}</div>
            <div className="text-muted-foreground">Total Value</div>
          </div>
          <div>
            <div className="font-semibold">{customer.openTickets}</div>
            <div className="text-muted-foreground">Open Tickets</div>
          </div>
        </div>
        
        {customer.notes && (
          <>
            <Separator />
            <div>
              <div className="font-medium mb-1">Notes</div>
              <div className="text-muted-foreground">{customer.notes}</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Call Notes Component
function CallNotes() {
  const [notes, setNotes] = useState("")
  const [quickNotes] = useState([
    "Customer interested in upgrade",
    "Scheduled follow-up call",
    "Technical issue resolved", 
    "Billing question answered",
    "Service appointment booked"
  ])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Call Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea 
          placeholder="Add call notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[80px] text-sm"
        />
        
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Quick Notes</div>
          <div className="flex flex-wrap gap-1">
            {quickNotes.map((note, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setNotes(prev => prev ? `${prev}\n• ${note}` : `• ${note}`)}
              >
                {note}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// VOIP Overlay Component
function VoipOverlay({ isOpen, onClose, incomingCall, currentCustomer }) {
  const [callDuration, setCallDuration] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [controls, setControls] = useState({
    muted: false,
    speakerOn: false,
    recording: false,
    onHold: false,
    volume: 80
  })

  useEffect(() => {
    let interval
    if (isOpen && !incomingCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isOpen, incomingCall])

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const toggleControl = (control) => {
    setControls(prev => ({ ...prev, [control]: !prev[control] }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Background overlay for incoming calls */}
      {incomingCall && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" />
      )}
      
      {/* VOIP Panel */}
      <div className={cn(
        "absolute pointer-events-auto transition-all duration-300 ease-in-out",
        isMinimized 
          ? "bottom-4 right-4 w-80 h-16"
          : incomingCall 
          ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96"
          : "top-4 right-4 w-96 h-[600px]"
      )}>
        <Card className="h-full shadow-2xl border-2">
          {/* Header */}
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  incomingCall ? "bg-success animate-pulse" : "bg-primary"
                )} />
                <span className="font-medium text-sm">
                  {incomingCall ? "Incoming Call" : "Active Call"}
                </span>
                {!incomingCall && (
                  <Badge variant="secondary" className="text-xs">
                    {formatDuration(callDuration)}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="flex-1 space-y-4 overflow-y-auto">
              {/* Customer Information */}
              <CustomerCard customer={currentCustomer} />
              
              {/* Call Controls */}
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    {incomingCall ? (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-success hover:bg-success text-white"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Answer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={onClose}
                        >
                          <PhoneOff className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant={controls.muted ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleControl('muted')}
                        >
                          {controls.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant={controls.speakerOn ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleControl('speakerOn')}
                        >
                          {controls.speakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant={controls.recording ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleControl('recording')}
                        >
                          <div className="w-2 h-2 rounded-full bg-current" />
                        </Button>
                        <Button 
                          variant={controls.onHold ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleControl('onHold')}
                        >
                          {controls.onHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={onClose}
                        >
                          <PhoneOff className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              {currentCustomer && !incomingCall && (
                <CallIntelligence customer={currentCustomer} />
              )}
              
              {/* Call Notes */}
              {!incomingCall && <CallNotes />}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

// Legacy VOIP Provider Component (for backward compatibility)
export function LegacyVoipProvider({ children }) {
  console.warn('LegacyVoipProvider is deprecated. Please use VoipProvider from VoipIntegration instead.')
  
  const [isCallActive, setIsCallActive] = useState(false)
  const [incomingCall, setIncomingCall] = useState(false)
  const [currentCall, setCurrentCall] = useState(null)
  const [currentCustomer, setCurrentCustomer] = useState(null)

  // Simulate incoming call
  const simulateIncomingCall = (phoneNumber = "555-123-4567") => {
    const customer = sampleCustomers[phoneNumber] || null
    setCurrentCustomer(customer)
    setCurrentCall({ phoneNumber, timestamp: new Date() })
    setIncomingCall(true)
    setIsCallActive(true)
  }

  // Answer call
  const answerCall = () => {
    setIncomingCall(false)
  }

  // End call
  const endCall = () => {
    setIsCallActive(false)
    setIncomingCall(false)
    setCurrentCall(null)
    setCurrentCustomer(null)
  }

  const contextValue = {
    isCallActive,
    incomingCall,
    currentCall,
    currentCustomer,
    simulateIncomingCall,
    answerCall,
    endCall
  }

  return (
    <LegacyVoipContext.Provider value={contextValue}>
      {children}
      <VoipOverlay 
        isOpen={isCallActive}
        onClose={endCall}
        incomingCall={incomingCall}
        currentCustomer={currentCustomer}
      />
    </LegacyVoipContext.Provider>
  )
}

// Legacy VOIP Control Button (for backward compatibility)
export function LegacyVoipControlButton() {
  console.warn('LegacyVoipControlButton is deprecated. Please use VoipControlButton from VoipIntegration instead.')
  
  const { simulateIncomingCall, isCallActive } = useLegacyVoip()
  
  if (isCallActive) return null
  
  return (
    <Button 
      onClick={() => simulateIncomingCall()}
      className="fixed bottom-6 right-6 z-40 rounded-full h-12 w-12 p-0 shadow-lg"
    >
      <Phone className="h-5 w-5" />
    </Button>
  )
}
