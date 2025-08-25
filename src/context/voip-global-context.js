"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const VoipGlobalContext = createContext();

export function useVoipGlobal() {
  const context = useContext(VoipGlobalContext);
  if (!context) {
    throw new Error('useVoipGlobal must be used within a VoipGlobalProvider');
  }
  return context;
}

export function VoipGlobalProvider({ children }) {
  // Call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [showCallIntake, setShowCallIntake] = useState(false);
  const [callData, setCallData] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  // Call timer
  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Incoming call simulation
  const simulateIncomingCall = useCallback((caller = null) => {
    const defaultCaller = {
      id: "CUST-2341",
      name: "Jordan Pierce",
      number: "+1 (415) 555-0117",
      company: "ACME Field Services",
      accountId: "ACME-4421",
      rating: 4.7,
      avatarUrl: "/placeholder-user.jpg",
      tags: ["Commercial", "Net-60", "SmartGate", "Solar"],
    };
    
    setCallData(caller || defaultCaller);
    setShowIncomingCall(true);
  }, []);

  // Answer call
  const answerCall = useCallback(() => {
    setShowIncomingCall(false);
    setIsCallActive(true);
    setShowCallIntake(true);
  }, []);

  // Decline call
  const declineCall = useCallback(() => {
    setShowIncomingCall(false);
    setCallData(null);
  }, []);

  // End call
  const endCall = useCallback(() => {
    setIsCallActive(false);
    setShowCallIntake(false);
    setCallData(null);
    setCallDuration(0);
  }, []);

  // Close call intake (minimize but keep call active)
  const closeCallIntake = useCallback(() => {
    setShowCallIntake(false);
  }, []);

  // Reopen call intake
  const reopenCallIntake = useCallback(() => {
    if (isCallActive) {
      setShowCallIntake(true);
    }
  }, [isCallActive]);

  const value = {
    // State
    isCallActive,
    showIncomingCall,
    showCallIntake,
    callData,
    callDuration,
    
    // Actions
    simulateIncomingCall,
    answerCall,
    declineCall,
    endCall,
    closeCallIntake,
    reopenCallIntake,
  };

  return (
    <VoipGlobalContext.Provider value={value}>
      {children}
    </VoipGlobalContext.Provider>
  );
}
