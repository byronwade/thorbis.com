"use client";

import React, { useState, useEffect } from 'react';
import { useVoipGlobal } from '@context/voip-global-context';
import { Dialog, DialogContent } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { 
  Phone, PhoneOff, MessageSquare, Clock, 
  Building, Star, MapPin, User
} from 'lucide-react';

export default function VoipIncomingOverlay() {
  const { 
    showIncomingCall, 
    callData, 
    answerCall, 
    declineCall 
  } = useVoipGlobal();
  
  const [ringDuration, setRingDuration] = useState(0);

  // Ring timer
  useEffect(() => {
    let interval;
    if (showIncomingCall) {
      setRingDuration(0);
      interval = setInterval(() => {
        setRingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRingDuration(0);
    }
    return () => clearInterval(interval);
  }, [showIncomingCall]);

  // Auto-decline after 30 seconds
  useEffect(() => {
    if (ringDuration >= 30) {
      declineCall();
    }
  }, [ringDuration, declineCall]);

  if (!showIncomingCall || !callData) {
    return null;
  }

  const formatRingTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showIncomingCall} onOpenChange={() => {}}>
      <DialogContent className="max-w-md w-[90vw] p-0 gap-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 border-blue-800 text-white">
        {/* Header */}
        <div className="text-center p-6 pb-4">
          <div className="text-sm text-blue-200 mb-2">Incoming Call</div>
          <div className="text-xs text-blue-300">
            Ringing for {formatRingTime(ringDuration)}
          </div>
        </div>

        {/* Caller Info */}
        <div className="text-center px-6 pb-6">
          <div className="relative inline-block mb-4">
            <Avatar className="h-24 w-24 border-4 border-blue-400 shadow-lg">
              <AvatarImage src={callData.avatarUrl} />
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {callData.name?.charAt(0) || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-50 animation-delay-200"></div>
          </div>

          <h2 className="text-2xl font-bold mb-1">{callData.name}</h2>
          <p className="text-blue-200 mb-2">{callData.number}</p>
          
          {callData.company && (
            <div className="flex items-center justify-center text-blue-300 mb-2">
              <Building className="h-4 w-4 mr-1" />
              <span className="text-sm">{callData.company}</span>
            </div>
          )}

          {callData.rating && (
            <div className="flex items-center justify-center text-yellow-400 mb-3">
              <Star className="h-4 w-4 mr-1 fill-current" />
              <span className="text-sm">{callData.rating}/5</span>
            </div>
          )}

          {/* Tags */}
          {callData.tags && callData.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mb-4">
              {callData.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-blue-800/50 text-blue-200 border-blue-600"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="px-6 pb-6">
          <div className="bg-blue-900/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-blue-300 text-xs">Account ID</div>
                <div className="font-medium">{callData.accountId}</div>
              </div>
              <div>
                <div className="text-blue-300 text-xs">Last Contact</div>
                <div className="font-medium">2 weeks ago</div>
              </div>
              <div>
                <div className="text-blue-300 text-xs">Status</div>
                <div className="font-medium text-green-400">Active</div>
              </div>
              <div>
                <div className="text-blue-300 text-xs">Priority</div>
                <div className="font-medium text-yellow-400">Standard</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8 p-6 pt-0">
          {/* Decline Button */}
          <Button
            variant="destructive"
            size="lg"
            className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-500 border-2 border-red-400 shadow-lg"
            onClick={declineCall}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>

          {/* Quick Message Button */}
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-full border-blue-400 text-blue-200 hover:bg-blue-800/50"
            onClick={() => {
              // TODO: Implement quick message functionality
              console.log('Quick message clicked');
            }}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>

          {/* Answer Button */}
          <Button
            variant="default"
            size="lg"
            className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-500 border-2 border-green-400 shadow-lg animate-pulse"
            onClick={answerCall}
          >
            <Phone className="h-8 w-8" />
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center p-4 text-xs text-blue-300 border-t border-blue-800">
          Swipe up to answer • Swipe down to decline
        </div>
      </DialogContent>
    </Dialog>
  );
}
