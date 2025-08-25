"use client";

import React from 'react';
import { useVoipGlobal } from '@context/voip-global-context';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Phone, PhoneCall, Clock, MessageSquare, FileText, Wrench } from 'lucide-react';

// Floating VoIP Status Indicator (shows when call is active but minimized)
export function VoipStatusIndicator() {
  const { 
    isCallActive, 
    showCallIntake, 
    callData, 
    callDuration, 
    reopenCallIntake 
  } = useVoipGlobal();

  if (!isCallActive || showCallIntake || !callData) {
    return null;
  }

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={reopenCallIntake}
        className="bg-green-600 hover:bg-green-500 text-white shadow-lg rounded-full px-4 py-2 flex items-center space-x-2"
      >
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <Phone className="h-4 w-4" />
        <span className="text-sm font-medium">{formatDuration(callDuration)}</span>
        <span className="text-sm truncate max-w-24">{callData.name}</span>
      </Button>
    </div>
  );
}

// VoIP Call Button - can be used anywhere to initiate calls
export function VoipCallButton({ 
  caller, 
  variant = "default", 
  size = "default",
  children,
  className = "",
  ...props 
}) {
  const { simulateIncomingCall, isCallActive } = useVoipGlobal();

  const handleCall = () => {
    if (isCallActive) {
      // If already in a call, could show a message or queue the call
      return;
    }
    // Navigate to the VoIP call interface
    const callUrl = `/dashboard/business/voip-call/${encodeURIComponent(caller.id || caller.accountId || 'demo')}`;
    window.open(callUrl, 'voip-interface', 'width=1400,height=900,scrollbars=yes,resizable=yes');
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCall}
      disabled={isCallActive}
      {...props}
    >
      {children || (
        <>
          <Phone className="h-4 w-4 mr-2" />
          Call
        </>
      )}
    </Button>
  );
}

// Quick Call Card - shows caller info with call button
export function VoipQuickCallCard({ caller, className = "" }) {
  const { simulateIncomingCall, isCallActive } = useVoipGlobal();

  return (
    <div className={`p-4 border rounded-lg bg-card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            {caller?.name?.charAt(0) || <Phone className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="font-medium">{caller?.name || 'Unknown Caller'}</h4>
            <p className="text-sm text-muted-foreground">
              {caller?.company || caller?.number || 'No details'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {caller?.rating && (
            <Badge variant="outline" className="text-xs">
              ⭐ {caller.rating}
            </Badge>
          )}
          <VoipCallButton 
            caller={caller}
            size="sm"
            variant="outline"
          >
            <PhoneCall className="h-4 w-4" />
          </VoipCallButton>
        </div>
      </div>
    </div>
  );
}

// VoIP Demo Button - for testing/demo purposes
export function VoipDemoButton({ className = "" }) {
  const { simulateIncomingCall, isCallActive } = useVoipGlobal();

  const demoCallers = [
    {
      id: "CUST-2341",
      name: "Jordan Pierce",
      number: "+1 (415) 555-0117",
      company: "ACME Field Services",
      accountId: "ACME-4421",
      rating: 4.7,
      avatarUrl: "/placeholder-user.jpg",
      tags: ["Commercial", "Net-60", "SmartGate", "Solar"],
    },
    {
      id: "CUST-1892",
      name: "Sarah Chen",
      number: "+1 (555) 123-4567",
      company: "TechStart Inc",
      accountId: "TECH-1892",
      rating: 4.9,
      avatarUrl: "/placeholder-user.jpg",
      tags: ["Premium", "Enterprise", "24/7"],
    },
    {
      id: "CUST-5673",
      name: "Mike Rodriguez",
      number: "+1 (555) 987-6543",
      company: "Local Retail Co",
      accountId: "RETAIL-5673",
      rating: 4.2,
      avatarUrl: "/placeholder-user.jpg",
      tags: ["Standard", "Retail", "POS"],
    }
  ];

  const handleDemoCall = () => {
    if (isCallActive) return;
    
    const randomCaller = demoCallers[Math.floor(Math.random() * demoCallers.length)];
    simulateIncomingCall(randomCaller);
  };

  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleDemoCall}
      disabled={isCallActive}
    >
      <Phone className="h-4 w-4 mr-2" />
      {isCallActive ? 'Call in Progress' : 'Simulate Incoming Call'}
    </Button>
  );
}

// VoIP Quick Actions Component
export function VoipQuickActions({ className = "" }) {
  const { simulateIncomingCall, isCallActive } = useVoipGlobal();

  const quickActions = [
    {
      id: "callback",
      label: "Schedule Callback",
      icon: <Phone className="h-4 w-4" />,
      color: "bg-blue-600 hover:bg-blue-700",
      tooltip: "Schedule a callback appointment for the customer",
    },
    {
      id: "email",
      label: "Send Email",
      icon: <MessageSquare className="h-4 w-4" />,
      color: "bg-green-600 hover:bg-green-700",
      tooltip: "Send an email to the customer with service details",
    },
    {
      id: "ticket",
      label: "Create Ticket",
      icon: <FileText className="h-4 w-4" />,
      color: "bg-purple-600 hover:bg-purple-700",
      tooltip: "Create a support ticket for the customer",
    },
    {
      id: "dispatch",
      label: "Dispatch Tech",
      icon: <Wrench className="h-4 w-4" />,
      color: "bg-orange-600 hover:bg-orange-700",
      tooltip: "Dispatch a technician to the customer location",
    },
  ];

  const handleAction = (actionId) => {
    if (isCallActive) {
      // If in a call, could trigger specific actions
      console.log(`Quick action triggered: ${actionId}`);
      return;
    }
    // If not in a call, simulate one
    simulateIncomingCall();
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {quickActions.map((action) => (
        <Button
          key={action.id}
          onClick={() => handleAction(action.id)}
          className={`${action.color} text-white h-10 px-3 text-sm font-medium transition-all duration-200 hover:scale-105`}
          disabled={isCallActive}
        >
          {action.icon}
          <span className="ml-2">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}

export default VoipCallButton;
