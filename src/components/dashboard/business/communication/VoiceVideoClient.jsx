"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MoreVertical,
  Users,
  Calendar,
  Clock,
  Settings,
  Plus,
  Search,
  MessageSquare,
  FileText,
  Download,
  Star,
  StarOff,
  Lock,
  UserPlus,
  Record,
  StopCircle,
  Play,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@utils';

// Sample data
const MEETING_ROOMS = [
  {
    id: 1,
    name: "Daily Standup",
    participants: 8,
    maxParticipants: 12,
    status: "active",
    startTime: "09:00",
    duration: "15 min",
    isPrivate: false,
    host: "Sarah Johnson",
    topic: "Daily team sync and updates"
  },
  {
    id: 2,
    name: "Client Meeting - ABC Corp",
    participants: 3,
    maxParticipants: 6,
    status: "scheduled",
    startTime: "14:30",
    duration: "45 min",
    isPrivate: true,
    host: "Mike Chen",
    topic: "Q4 project review and planning"
  },
  {
    id: 3,
    name: "Product Demo",
    participants: 0,
    maxParticipants: 20,
    status: "ended",
    startTime: "11:00",
    duration: "60 min",
    isPrivate: false,
    host: "Lisa Park",
    topic: "New feature demonstration"
  }
];

const RECENT_CALLS = [
  {
    id: 1,
    type: "video",
    participants: ["Sarah Johnson", "Mike Chen", "Lisa Park"],
    duration: "32:15",
    date: "2024-01-15",
    status: "completed",
    recording: true
  },
  {
    id: 2,
    type: "voice",
    participants: ["Client ABC", "Mike Chen"],
    duration: "18:42",
    date: "2024-01-14",
    status: "completed",
    recording: false
  },
  {
    id: 3,
    type: "video",
    participants: ["Team Meeting"],
    duration: "45:30",
    date: "2024-01-13",
    status: "missed",
    recording: false
  }
];

const PARTICIPANTS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "host",
    status: "speaking",
    audio: true,
    video: true,
    screen: false,
    avatar: "/placeholder-user.jpg"
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "participant",
    status: "listening",
    audio: true,
    video: false,
    screen: false,
    avatar: "/placeholder-user.jpg"
  },
  {
    id: 3,
    name: "Lisa Park",
    role: "participant",
    status: "away",
    audio: false,
    video: false,
    screen: false,
    avatar: "/placeholder-user.jpg"
  }
];

export default function VoiceVideoClient() {
  const [activeTab, setActiveTab] = useState("meetings");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callControls, setCallControls] = useState({
    audio: true,
    video: true,
    screen: false,
    recording: false
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const handleJoinMeeting = (room) => {
    setSelectedRoom(room);
    setIsInCall(true);
  };

  const handleLeaveCall = () => {
    setIsInCall(false);
    setSelectedRoom(null);
    setCallControls({
      audio: true,
      video: true,
      screen: false,
      recording: false
    });
  };

  const toggleControl = (control) => {
    setCallControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: "You",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setNewMessage("");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "scheduled": return "bg-blue-500";
      case "ended": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getParticipantStatusColor = (status) => {
    switch (status) {
      case "speaking": return "bg-green-500";
      case "listening": return "bg-blue-500";
      case "away": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  if (isInCall && selectedRoom) {
    return (
      <div className="flex h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col bg-black">
          {/* Call Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-black/80 text-white">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", getStatusColor("active"))} />
                <span className="text-sm font-medium">Live</span>
              </div>
              <span className="text-sm text-gray-300">•</span>
              <span className="text-sm">{selectedRoom.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setShowParticipants(!showParticipants)}
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Main Video */}
              <div className="col-span-2 bg-gray-800 rounded-lg flex items-center justify-center relative">
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-400">Host</p>
                </div>
                {!callControls.video && (
                  <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl">SJ</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
              
              {/* Participant Videos */}
              {PARTICIPANTS.slice(1).map((participant) => (
                <div key={participant.id} className="bg-gray-800 rounded-lg flex items-center justify-center relative">
                  <div className="text-center text-white">
                    <Avatar className="h-12 w-12 mx-auto mb-2">
                      <AvatarFallback className="text-sm">{participant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{participant.name}</p>
                    <p className="text-xs text-gray-400">{participant.role}</p>
                  </div>
                  <div className={cn(
                    "absolute top-2 right-2 w-3 h-3 rounded-full",
                    getParticipantStatusColor(participant.status)
                  )} />
                </div>
              ))}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex-shrink-0 flex items-center justify-center gap-4 p-6 bg-black/80">
            <Button
              variant={callControls.audio ? "default" : "destructive"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={() => toggleControl("audio")}
            >
              {callControls.audio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={callControls.video ? "default" : "destructive"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={() => toggleControl("video")}
            >
              {callControls.video ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={callControls.screen ? "default" : "outline"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={() => toggleControl("screen")}
            >
              {callControls.screen ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={callControls.recording ? "destructive" : "outline"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={() => toggleControl("recording")}
            >
              {callControls.recording ? <StopCircle className="h-5 w-5" /> : <Record className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={handleLeaveCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-background border-l">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Participants ({PARTICIPANTS.length})</h3>
            </div>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {PARTICIPANTS.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full",
                        getParticipantStatusColor(participant.status)
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{participant.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {participant.audio ? (
                        <Mic className="h-3 w-3 text-green-500" />
                      ) : (
                        <MicOff className="h-3 w-3 text-red-500" />
                      )}
                      {participant.video ? (
                        <Video className="h-3 w-3 text-green-500" />
                      ) : (
                        <VideoOff className="h-3 w-3 text-red-500" />
                      )}
                      {participant.screen && (
                        <Monitor className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-background border-l">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Meeting Chat</h3>
            </div>
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{message.sender}</span>
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button size="sm" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">Voice & Video</h1>
            <p className="text-muted-foreground">Manage meetings, calls, and video conferences</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Meeting
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-6 pt-4">
          <TabsList>
            <TabsTrigger value="meetings">Meeting Rooms</TabsTrigger>
            <TabsTrigger value="calls">Recent Calls</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <TabsContent value="meetings" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MEETING_ROOMS.map((room) => (
                <Card key={room.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {room.name}
                          {room.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{room.topic}</p>
                      </div>
                      <Badge variant={room.status === "active" ? "default" : "secondary"}>
                        {room.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Host:</span>
                      <span className="font-medium">{room.host}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{room.startTime} ({room.duration})</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="font-medium">{room.participants}/{room.maxParticipants}</span>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      {room.status === "active" ? (
                        <Button 
                          className="flex-1" 
                          onClick={() => handleJoinMeeting(room)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join Meeting
                        </Button>
                      ) : room.status === "scheduled" ? (
                        <Button variant="outline" className="flex-1">
                          <Clock className="h-4 w-4 mr-2" />
                          Join Later
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1" disabled>
                          <XCircle className="h-4 w-4 mr-2" />
                          Meeting Ended
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calls" className="h-full">
            <div className="space-y-4">
              {RECENT_CALLS.map((call) => (
                <Card key={call.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {call.type === "video" ? (
                            <Video className="h-5 w-5" />
                          ) : (
                            <Phone className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {call.participants.join(", ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {call.duration} • {call.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {call.recording && (
                          <Badge variant="outline" className="text-xs">
                            <Record className="h-3 w-3 mr-1" />
                            Recorded
                          </Badge>
                        )}
                        <Badge variant={call.status === "completed" ? "default" : "secondary"}>
                          {call.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Play className="h-4 w-4 mr-2" />
                              Replay
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Transcript
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recordings" className="h-full">
            <div className="text-center py-12">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Recordings Yet</h3>
              <p className="text-muted-foreground mb-4">
                Your meeting recordings will appear here once you start recording meetings.
              </p>
              <Button>
                <Record className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
