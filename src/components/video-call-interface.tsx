'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Screen,
  ScreenShare,
  Settings,
  Users,
  MessageCircle,
  MoreHorizontal,
  Maximize,
  Minimize,
  PictureInPicture,
  Record,
  StopCircle,
  Copy,
  Share2,
  UserPlus,
  Shield,
  Clock,
  Signal,
  Wifi,
  WifiOff
} from 'lucide-react';

import { useOfflineCommunication } from '@/lib/offline-communication-manager';
import type { 
  CallMetadata,
  CallParticipant,
  VideoRoomSettings 
} from '@/lib/offline-communication-manager';

interface VideoCallInterfaceProps {
  callId?: string;
  roomId?: string;
  isHost?: boolean;
  onCallEnd?: () => void;
  onCallJoin?: (callId: string) => void;
}

export default function VideoCallInterface({
  callId,
  roomId,
  isHost = false,
  onCallEnd,
  onCallJoin
}: VideoCallInterfaceProps) {
  const [call, setCall] = useState<CallMetadata | null>(null);
  const [roomSettings, setRoomSettings] = useState<VideoRoomSettings | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [networkQuality, setNetworkQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  
  // Media states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // UI states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiPMode, setIsPiPMode] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Participants and chat
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState(');
  
  // Video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  
  const communicationManager = useOfflineCommunication();

  useEffect(() => {
    if (callId) {
      loadCall(callId);
    }
    
    setupEventListeners();
    initializeMediaDevices();
    
    return () => {
      cleanup();
    };
  }, [callId]);

  const setupEventListeners = () => {
    communicationManager.on('call_status_changed', handleCallStatusChange);
    communicationManager.on('participant_joined', handleParticipantJoined);
    communicationManager.on('participant_left', handleParticipantLeft);
    communicationManager.on('media_stream_received', handleMediaStreamReceived);
  };

  const handleCallStatusChange = (data: unknown) => {
    if (data.callId === callId) {
      setCall(data.call);
      setConnectionStatus(data.call.status === 'connected' ? 'connected' : 'disconnected');
    }
  };

  const handleParticipantJoined = (data: unknown) => {
    if (data.callId === callId) {
      setParticipants(prev => [...prev, data.participant]);
    }
  };

  const handleParticipantLeft = (data: unknown) => {
    if (data.callId === callId) {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    }
  };

  const handleMediaStreamReceived = (data: unknown) => {
    if (data.callId === callId) {
      const videoElement = remoteVideosRef.current.get(data.userId);
      if (videoElement && data.stream) {
        videoElement.srcObject = data.stream;
      }
    }
  };

  const loadCall = async (callId: string) => {
    try {
      const callData = await communicationManager.getCall(callId);
      if (callData) {
        setCall(callData);
        setParticipants(callData.participants);
        setIsInCall(callData.status === 'connected');
      }
    } catch (error) {
      console.error('Failed to load call:', error);
    }
  };

  const initializeMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to access media devices:', error);
    }
  };

  const handleJoinCall = async () => {
    if (!callId) return;
    
    setConnectionStatus('connecting');
    try {
      await communicationManager.joinCall(callId);
      setIsInCall(true);
      setConnectionStatus('connected');
      onCallJoin?.(callId);
    } catch (error) {
      console.error('Failed to join call:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleLeaveCall = async () => {
    if (!callId) return;
    
    try {
      await communicationManager.leaveCall(callId);
      setIsInCall(false);
      setConnectionStatus('disconnected');
      onCallEnd?.();
    } catch (error) {
      console.error('Failed to leave call:', error);
    }
  };

  const toggleVideo = async () => {
    setIsVideoEnabled(!isVideoEnabled);
    
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = async () => {
    setIsAudioEnabled(!isAudioEnabled);
    
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
      } else {
        // Switch back to camera
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      // Implementation would start recording
    } else {
      // Stop recording
      setIsRecording(false);
      // Implementation would stop recording
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const message = {
      id: 'chat_${Date.now()}',
      userId: 'current_user',
      userName: 'You',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, message]);
    setChatInput(');
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />;
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-400" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-400" />;
      default:
        return <WifiOff className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getQualityIcon = () => {
    switch (networkQuality) {
      case 'excellent':
        return <Signal className="h-4 w-4 text-green-400" />;
      case 'good':
        return <Signal className="h-4 w-4 text-blue-400" />;
      case 'fair':
        return <Signal className="h-4 w-4 text-yellow-400" />;
      case 'poor':
        return <Signal className="h-4 w-4 text-red-400" />;
      default:
        return <Signal className="h-4 w-4 text-neutral-400" />;
    }
  };

  const cleanup = () => {
    // Stop all media streams
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Clean up remote video elements
    remoteVideosRef.current.forEach(video => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    });
  };

  if (!isInCall && !callId) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="bg-neutral-900 border-neutral-800 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-white text-center">Join Video Call</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="callId" className="text-neutral-400">Call ID or Meeting Link</Label>
              <Input
                id="callId"
                placeholder="Enter call ID or paste meeting link"
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={toggleVideo}
                className={isVideoEnabled ? 'bg-blue-500/20' : 'bg-red-500/20'}
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={toggleAudio}
                className={isAudioEnabled ? 'bg-blue-500/20' : 'bg-red-500/20'}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button onClick={handleJoinCall} className="w-full">
              <Video className="h-4 w-4 mr-2" />
              Join Call
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={'h-full flex flex-col bg-black ${isFullscreen ? 'fixed inset-0 z-50' : '}'}>
      {/* Header */}
      <div className="p-4 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-white font-medium">
                {call?.initiatorName || 'Video Call'}
              </span>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                {connectionStatus}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              {getQualityIcon()}
              <span>{networkQuality} quality</span>
              <span>•</span>
              <Users className="h-4 w-4" />
              <span>{participants.length} participants</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Remote Videos Grid */}
          <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
            {participants.map((participant) => (
              <div key={participant.userId} className="relative bg-neutral-800 rounded-lg overflow-hidden">
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideosRef.current.set(participant.userId, el);
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Participant Info Overlay */}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-sm">
                  {participant.name}
                </div>
                
                {/* Media Status Icons */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {!participant.isMuted && <Mic className="h-4 w-4 text-green-400" />}
                  {participant.isMuted && <MicOff className="h-4 w-4 text-red-400" />}
                  {!participant.isVideoEnabled && <VideoOff className="h-4 w-4 text-red-400" />}
                  {participant.isScreenSharing && <Screen className="h-4 w-4 text-blue-400" />}
                </div>
                
                {/* Connection Quality */}
                <div className="absolute top-2 left-2">
                  {participant.connectionQuality === 'poor' && <Signal className="h-4 w-4 text-red-400" />}
                  {participant.connectionQuality === 'fair' && <Signal className="h-4 w-4 text-yellow-400" />}
                  {participant.connectionQuality === 'good' && <Signal className="h-4 w-4 text-blue-400" />}
                  {participant.connectionQuality === 'excellent' && <Signal className="h-4 w-4 text-green-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-neutral-800 rounded-lg overflow-hidden border-2 border-neutral-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
              You
            </div>
            <div className="absolute top-1 right-1 flex gap-1">
              {!isAudioEnabled && <MicOff className="h-3 w-3 text-red-400" />}
              {!isVideoEnabled && <VideoOff className="h-3 w-3 text-red-400" />}
              {isScreenSharing && <Screen className="h-3 w-3 text-blue-400" />}
            </div>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-neutral-900/90 backdrop-blur-sm p-3 rounded-full border border-neutral-700">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className={'rounded-full ${isAudioEnabled ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-red-500/20 hover:bg-red-500/30'}'}
              >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleVideo}
                className={'rounded-full ${isVideoEnabled ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-red-500/20 hover:bg-red-500/30'}'}
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleScreenShare}
                className={'rounded-full ${isScreenSharing ? 'bg-blue-500/20 hover:bg-blue-500/30' : '}'}
              >
                {isScreenSharing ? <ScreenShare className="h-5 w-5" /> : <Screen className="h-5 w-5" />}
              </Button>
              
              {isHost && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleRecording}
                  className={'rounded-full ${isRecording ? 'bg-red-500/20 hover:bg-red-500/30' : '}'}
                >
                  {isRecording ? <StopCircle className="h-5 w-5" /> : <Record className="h-5 w-5" />}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
                className="rounded-full"
              >
                {isSpeakerEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="rounded-full"
              >
                <Settings className="h-5 w-5" />
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLeaveCall}
                className="rounded-full"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Panels */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
            {showParticipants && (
              <div className="flex-1 border-b border-neutral-800">
                <div className="p-4">
                  <h3 className="font-medium text-white mb-4">Participants ({participants.length})</h3>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-white text-sm">{participant.name}</p>
                          <div className="flex items-center gap-1">
                            {!participant.isMuted && <Mic className="h-3 w-3 text-green-400" />}
                            {participant.isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                            {!participant.isVideoEnabled && <VideoOff className="h-3 w-3 text-red-400" />}
                            {participant.isScreenSharing && <Screen className="h-3 w-3 text-blue-400" />}
                          </div>
                        </div>
                        {isHost && (
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {showChat && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-neutral-800">
                  <h3 className="font-medium text-white">Chat</h3>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="text-sm">
                        <span className="text-blue-400 font-medium">{message.userName}:</span>
                        <span className="text-white ml-2">{message.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border-t border-neutral-800">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      className="bg-neutral-800 border-neutral-700"
                    />
                    <Button onClick={sendChatMessage} size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 left-4 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium">Recording</span>
          </div>
        </div>
      )}
    </div>
  );
}