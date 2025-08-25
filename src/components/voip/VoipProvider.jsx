"use client";

import React from 'react';
import { VoipGlobalProvider } from '@context/voip-global-context';
import VoipGlobalOverlay from './VoipGlobalOverlay';
import VoipIncomingOverlay from './VoipIncomingOverlay';
import { VoipStatusIndicator } from './VoipTrigger';
import { Toaster } from '@components/ui/toaster';

/**
 * VoipProvider - Main provider component that wraps the entire app
 * Provides global VoIP functionality including:
 * - Incoming call overlays
 * - Call intake interface
 * - Call status indicators
 * - Global call state management
 */
export default function VoipProvider({ children }) {
  return (
    <VoipGlobalProvider>
      {children}
      
      {/* Global VoIP Overlays */}
      <VoipIncomingOverlay />
      <VoipGlobalOverlay />
      <VoipStatusIndicator />
      
      {/* Toast notifications for VoIP actions */}
      <Toaster />
    </VoipGlobalProvider>
  );
}
