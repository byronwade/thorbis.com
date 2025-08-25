"use client";

import React, { useState, useEffect } from "react";
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  Users, MessageSquare, Settings, BarChart3, 
  Clock, PhoneCall, Headphones, UserCheck,
  Shield, Zap, Brain, Play, Pause 
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Progress } from "@components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import VoipIncomingOverlay from "./VoipIncomingOverlay";
import { VoipWidgets, QuickActions, TeamChat, CustomerHistory } from "./VoipWidgets";
import TeamChatComponent from "./TeamChat";

/**
 * Main VoIP Dashboard Component
 * Comprehensive call center management with incoming call handling
 */
export default function VoipDashboard() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeAgents, setActiveAgents] = useState(12);
  const [queuedCalls, setQueuedCalls] = useState(3);
  const [todaysCallVolume, setTodaysCallVolume] = useState(147);

  const [systemStats, setSystemStats] = useState({
    callQuality: 95,
    networkLatency: 28,
    serverLoad: 42,
    uptime: "99.9%"
  });

  // Mock data for recent calls
  const recentCalls = [
    {
      id: 1,
      name: "Jordan Pierce",
      phone: "+1 (415) 555-0117",
      time: "2 minutes ago",
      duration: "4:32",
      type: "incoming",
      status: "completed"
    },
    {
      id: 2,
      name: "Sarah Mitchell",
      phone: "+1 (510) 555-0198",
      time: "15 minutes ago", 
      duration: "2:18",
      type: "outgoing",
      status: "completed"
    },
    {
      id: 3,
      name: "ACME Corporation",
      phone: "+1 (650) 555-0142",
      time: "1 hour ago",
      duration: "7:45",
      type: "incoming", 
      status: "completed"
    }
  ];

  const activeAgentsData = [
    { name: "John Smith", status: "on-call", duration: "12:34", avatar: "/placeholder-avatar.svg" },
    { name: "Sarah Johnson", status: "available", duration: "", avatar: "/placeholder-avatar.svg" },
    { name: "Mike Wilson", status: "break", duration: "5:00", avatar: "/placeholder-avatar.svg" },
    { name: "Emma Davis", status: "on-call", duration: "3:21", avatar: "/placeholder-avatar.svg" }
  ];

  // Simulate incoming call
  const simulateIncomingCall = () => {
    setShowIncomingCall(true);
  };

  const handleAnswerCall = () => {
    setIsCallActive(true);
    setShowIncomingCall(false);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
  };

  // Call timer effect
  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">VoIP Dashboard</h1>
          <p className="text-muted-foreground">Professional call center management and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={simulateIncomingCall} className="bg-green-600 hover:bg-green-700">
            <Phone className="w-4 h-4 mr-2" />
            Simulate Call
          </Button>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            System Online
          </Badge>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{activeAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Queued Calls</p>
                <p className="text-2xl font-bold">{queuedCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <PhoneCall className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Today's Calls</p>
                <p className="text-2xl font-bold">{todaysCallVolume}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Call Quality</p>
                <p className="text-2xl font-bold">{systemStats.callQuality}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Call Display */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Headphones className="w-5 h-5 mr-2" />
                  Current Call Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isCallActive ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="/caller-avatar.png" />
                          <AvatarFallback>JP</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">Jordan Pierce</p>
                          <p className="text-sm text-muted-foreground">+1 (415) 555-0117</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active Call
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
                      <Button onClick={handleEndCall} variant="destructive">
                        <PhoneOff className="w-4 h-4 mr-2" />
                        End Call
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Call Quality</span>
                        <span>{systemStats.callQuality}%</span>
                      </div>
                      <Progress value={systemStats.callQuality} className="h-2" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active calls</p>
                    <Button onClick={simulateIncomingCall} className="mt-4">
                      <Phone className="w-4 h-4 mr-2" />
                      Test Incoming Call
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network Latency</span>
                    <span>{systemStats.networkLatency}ms</span>
                  </div>
                  <Progress value={100 - (systemStats.networkLatency / 2)} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Server Load</span>
                    <span>{systemStats.serverLoad}%</span>
                  </div>
                  <Progress value={systemStats.serverLoad} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Uptime</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {systemStats.uptime}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Widgets Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <QuickActions 
              customer={{ name: "Jordan Pierce", phone: "+1 (415) 555-0117" }}
              onAction={(actionId) => console.log(`Action taken: ${actionId}`)}
            />
            <TeamChat callId="call-001" />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Call Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Call Quality</span>
                    <Badge variant="outline" className="text-green-600">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sentiment</span>
                    <Badge variant="outline" className="text-blue-600">Positive</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Keywords</span>
                    <span className="text-sm">Emergency, Repair</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - History and Service Intake */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerHistory 
              customer={{ name: "Jordan Pierce", id: "customer-123" }}
            />
            
            {/* Recent Call History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Call Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{call.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{call.name}</p>
                          <p className="text-xs text-muted-foreground">{call.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{call.duration}</p>
                        <p className="text-xs text-muted-foreground">{call.time}</p>
                      </div>
                      <Badge variant={call.type === 'incoming' ? 'default' : 'secondary'}>
                        {call.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAgentsData.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{agent.name}</p>
                        {agent.duration && (
                          <p className="text-sm text-muted-foreground">Call duration: {agent.duration}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={agent.status === 'on-call' ? 'default' : agent.status === 'available' ? 'secondary' : 'outline'}
                      className={
                        agent.status === 'on-call' ? 'bg-green-100 text-green-800' :
                        agent.status === 'available' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Call Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600">4.8</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Call Routing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="queue-timeout">Queue Timeout (seconds)</Label>
                  <Input id="queue-timeout" type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-queue">Max Queue Size</Label>
                  <Input id="max-queue" type="number" defaultValue="10" />
                </div>
                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audio Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input-volume">Input Volume</Label>
                  <Progress value={75} className="h-3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output-volume">Output Volume</Label>
                  <Progress value={80} className="h-3" />
                </div>
                <Button className="w-full">Test Audio</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Tab - Interactive Widgets */}
        <TabsContent value="features" className="space-y-6">
          <VoipWidgets 
            industry="field-service"
            customerId="12345"
            callId="call-001"
            customer={{
              name: "Jordan Pierce",
              company: "ACME Field Services",
              phone: "+1 (415) 555-0117"
            }}
            onWidgetAction={(action, data) => {
              console.log('Widget action:', action, data);
              // Handle widget actions like creating tickets, scheduling callbacks, etc.
            }}
          />
        </TabsContent>
      </Tabs>

      {/* VoIP Incoming Call Overlay */}
      <VoipIncomingOverlay 
        open={showIncomingCall} 
        onOpenChange={() => setShowIncomingCall(!showIncomingCall)}
        onAnswer={handleAnswerCall}
        onDecline={() => setShowIncomingCall(false)}
      />
    </div>
  );
}